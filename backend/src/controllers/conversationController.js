const Conversation = require('../models/Conversation')
const ServiceRequest = require('../models/ServiceRequest')

const EXPIRATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const ACTIVE_STATUSES = ['accepted', 'in_progress']

const ensureParticipant = (conversation, userId) => {
  const ids = conversation.participants.map((p) => String(p))
  return ids.includes(String(userId))
}

const isWithinCompletionWindow = (request) => (
  request?.status === 'completed'
  && request.completedAt instanceof Date
  && (Date.now() - request.completedAt.getTime()) <= EXPIRATION_WINDOW_MS
)

const isChatAllowed = (request) => {
  if (!request) return false
  if (ACTIVE_STATUSES.includes(request.status)) return true
  return isWithinCompletionWindow(request)
}

const computeExpiryDate = (request) => {
  if (!request) return undefined
  if (ACTIVE_STATUSES.includes(request.status)) return undefined
  if (request.status === 'completed' && request.completedAt instanceof Date) {
    return new Date(request.completedAt.getTime() + EXPIRATION_WINDOW_MS)
  }
  return undefined
}

exports.listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'profile role')
      .populate('serviceRequest', 'title status completedAt')
      .sort({ updatedAt: -1 })

    res.json({ conversations })
  } catch (error) {
    console.error('list conversations error', error)
    res.status(500).json({ message: 'No se pudieron obtener las conversaciones' })
  }
}

exports.createConversation = async (req, res) => {
  try {
    const { participantId, serviceRequestId, message: initialMessage } = req.body

    if (!participantId) {
      return res.status(400).json({ message: 'Participante requerido' })
    }
    if (!serviceRequestId) {
      return res.status(400).json({ message: 'Solicitud de servicio requerida' })
    }
    if (String(participantId) === String(req.user._id)) {
      return res.status(400).json({ message: 'No puedes iniciar un chat contigo mismo' })
    }

    const request = await ServiceRequest.findById(serviceRequestId)
      .select('client technician status completedAt')

    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' })
    }
    if (!request.technician) {
      return res.status(400).json({ message: 'La solicitud no tiene tecnico asignado' })
    }

    const participantIds = [request.client, request.technician].filter(Boolean).map((value) => String(value))
    if (!participantIds.includes(String(req.user._id)) || !participantIds.includes(String(participantId))) {
      return res.status(403).json({ message: 'No cuentas con permisos para esta conversacion' })
    }
    if (!isChatAllowed(request)) {
      return res.status(400).json({ message: 'La reparacion ya no permite iniciar chat' })
    }

    const expiryDate = computeExpiryDate(request)

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      serviceRequest: serviceRequestId,
    })

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
        serviceRequest: serviceRequestId,
        messages: initialMessage
          ? [{ sender: req.user._id, body: initialMessage }]
          : [],
        expiresAt: expiryDate,
      })
    } else {
      if (initialMessage) {
        conversation.messages.push({ sender: req.user._id, body: initialMessage })
      }
      conversation.expiresAt = expiryDate
      await conversation.save()
    }

    await conversation.populate('participants', 'profile role')
    await conversation.populate('serviceRequest', 'title status completedAt')

    res.status(201).json({ conversation })
  } catch (error) {
    console.error('create conversation error', error)
    res.status(500).json({ message: 'No se pudo iniciar la conversacion' })
  }
}

exports.getConversation = async (req, res) => {
  try {
    const { id } = req.params
    const conversation = await Conversation.findById(id)
      .populate('participants', 'profile role')
      .populate('messages.sender', 'profile role')
      .populate('serviceRequest', 'title status completedAt')

    if (!conversation || !ensureParticipant(conversation, req.user._id)) {
      return res.status(404).json({ message: 'Conversacion no encontrada' })
    }

    res.json({ conversation })
  } catch (error) {
    console.error('get conversation error', error)
    res.status(500).json({ message: 'No se pudo obtener la conversacion' })
  }
}

exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params
    const { body } = req.body

    if (!body) {
      return res.status(400).json({ message: 'Mensaje requerido' })
    }

    const conversation = await Conversation.findById(id)
      .populate('serviceRequest', 'status completedAt')
    if (!conversation || !ensureParticipant(conversation, req.user._id)) {
      return res.status(404).json({ message: 'Conversacion no encontrada' })
    }

    const request = conversation.serviceRequest
    if (request && !isChatAllowed(request)) {
      return res.status(400).json({ message: 'La reparacion ya no permite enviar mensajes' })
    }

    conversation.messages.push({ sender: req.user._id, body })
    conversation.expiresAt = computeExpiryDate(request)
    await conversation.save()
    await conversation.populate('messages.sender', 'profile role')

    res.status(201).json({ message: conversation.messages.at(-1) })
  } catch (error) {
    console.error('send message error', error)
    res.status(500).json({ message: 'No se pudo enviar el mensaje' })
  }
}



