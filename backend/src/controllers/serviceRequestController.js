const ServiceRequest = require('../models/ServiceRequest')
const Conversation = require('../models/Conversation')
const User = require('../models/User')

const CONVERSATION_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000

exports.createServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.create({
      ...req.body,
      client: req.user.id,
    })
    await User.findByIdAndUpdate(req.user.id, { $push: { serviceHistory: request._id } })
    res.status(201).json({ request })
  } catch (error) {
    console.error('Create request error', error)
    res.status(500).json({ message: 'No se pudo crear la solicitud' })
  }
}

exports.getServiceRequest = async (req, res) => {
  try {
    const { id } = req.params
    const request = await ServiceRequest.findById(id)
      .populate('client', 'profile role')
      .populate('technician', 'profile technicianProfile')

    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' })
    }
    res.json({ request })
  } catch (error) {
    console.error('Get request error', error)
    res.status(500).json({ message: 'No se pudo obtener la solicitud' })
  }
}

exports.listRequests = async (req, res) => {
  try {
    const filters = {}
    if (req.user.role === 'client') {
      filters.client = req.user.id
    }
    if (req.user.role === 'technician') {
      filters.technician = req.user.id
    }
    const requests = await ServiceRequest.find(filters).sort({ createdAt: -1 })
    res.json({ requests })
  } catch (error) {
    console.error('List requests error', error)
    res.status(500).json({ message: 'No se pudieron obtener las solicitudes' })
  }
}

exports.assignTechnician = async (req, res) => {
  try {
    const { id } = req.params
    const { technicianId } = req.body
    const request = await ServiceRequest.findByIdAndUpdate(
      id,
      { technician: technicianId, status: 'accepted' },
      { new: true },
    )
    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' })
    }
    await User.findByIdAndUpdate(technicianId, { $push: { serviceHistory: request._id } })
    res.json({ request })
  } catch (error) {
    console.error('Assign technician error', error)
    res.status(500).json({ message: 'No se pudo asignar técnico' })
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const allowedStatuses = ['in_progress', 'completed', 'cancelled']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado no permitido' })
    }

    const request = await ServiceRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' })
    }

    const requesterId = String(req.user._id)
    const isClient = String(request.client) === requesterId
    const isTechnician = request.technician && String(request.technician) === requesterId
    const isAdmin = req.user.role === 'superadmin'

    if (!isClient && !isTechnician && !isAdmin) {
      return res.status(403).json({ message: 'No autorizado para actualizar la solicitud' })
    }

    if (!request.technician) {
      return res.status(400).json({ message: 'La solicitud no tiene tecnico asignado' })
    }

    request.status = status
    if (status === 'completed') {
      request.completedAt = new Date()
    } else {
      request.completedAt = undefined
    }
    await request.save()

    if (status === 'completed' || status === 'cancelled') {
      const expiresAt = new Date(Date.now() + CONVERSATION_EXPIRATION_MS)
      await Conversation.updateMany(
        { serviceRequest: id },
        { $set: { expiresAt } },
      )
    } else {
      await Conversation.updateMany(
        { serviceRequest: id },
        { $unset: { expiresAt: '' } },
      )
    }

    res.json({ request })
  } catch (error) {
    console.error('Update status error', error)
    res.status(500).json({ message: 'No se pudo actualizar el estado de la solicitud' })
  }
}

exports.listNearbyRequests = async (req, res) => {
  try {
    if (req.user.role !== 'technician') {
      return res.status(403).json({ message: 'No autorizado' })
    }

    const technician = await User.findById(req.user._id)
      .select('technicianProfile profile.address')

    if (!technician) {
      return res.status(404).json({ message: 'Perfil no encontrado' })
    }

    const areas = (technician.technicianProfile?.serviceAreas ?? [])
      .map((area) => area?.toLowerCase()?.trim())
      .filter(Boolean)

    const baseFragments = (technician.profile?.address ?? '')
      .toLowerCase()
      .split(',')
      .map((fragment) => fragment.trim())
      .filter(Boolean)

    const pendingRequests = await ServiceRequest.find({
      status: 'pending',
      technician: { $exists: false },
    })
      .sort({ scheduledAt: 1 })
      .limit(50)

    const scored = pendingRequests.map((requestDoc) => {
      const addressText = requestDoc.address?.toLowerCase?.() ?? ''
      const titleText = requestDoc.title?.toLowerCase?.() ?? ''
      let score = 0

      areas.forEach((area) => {
        if (area && addressText.includes(area)) {
          score += 2
        }
        if (area && titleText.includes(area)) {
          score += 1
        }
      })

      baseFragments.forEach((fragment) => {
        if (fragment && addressText.includes(fragment)) {
          score += 1
        }
      })

      return {
        id: requestDoc._id,
        title: requestDoc.title,
        category: requestDoc.category,
        address: requestDoc.address,
        scheduledAt: requestDoc.scheduledAt,
        description: requestDoc.description,
        client: requestDoc.client,
        score,
      }
    })

    const normalized = scored
      .sort((a, b) => b.score - a.score)
      .map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        address: item.address,
        scheduledAt: item.scheduledAt,
        description: item.description,
        client: item.client,
        relevance: item.score > 0 ? 'Coincide con tus zonas de servicio' : 'Fuera de zonas habituales',
      }))

    res.json({ requests: normalized })
  } catch (error) {
    console.error('List nearby requests error', error)
    res.status(500).json({ message: 'No se pudieron obtener solicitudes cercanas' })
  }
}
