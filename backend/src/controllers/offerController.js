const ServiceOffer = require('../models/ServiceOffer')
const ServiceRequest = require('../models/ServiceRequest')
const User = require('../models/User')

exports.createOffer = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, message } = req.body

    const request = await ServiceRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' })
    }
    if (String(request.client) === String(req.user._id)) {
      return res.status(400).json({ message: 'No puedes ofertar a tu propia solicitud' })
    }

    const offer = await ServiceOffer.create({
      serviceRequest: id,
      technician: req.user._id,
      amount,
      message,
    })

    res.status(201).json({ offer })
  } catch (error) {
    console.error('create offer error', error)
    res.status(500).json({ message: 'No se pudo registrar la oferta' })
  }
}

exports.listOffers = async (req, res) => {
  try {
    const { id } = req.params
    const request = await ServiceRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' })
    }

    const isClient = String(request.client) === String(req.user._id)
    const isAssignedTechnician = request.technician && String(request.technician) === String(req.user._id)
    const isAdmin = req.user.role === 'superadmin'

    const filter = { serviceRequest: id }

    if (!isClient && !isAssignedTechnician && !isAdmin) {
      if (req.user.role !== 'technician') {
        return res.status(403).json({ message: 'No autorizado' })
      }
      const hasOffer = await ServiceOffer.exists({ serviceRequest: id, technician: req.user._id })
      if (!hasOffer) {
        return res.status(403).json({ message: 'No autorizado' })
      }
      filter.technician = req.user._id
    }

    const offers = await ServiceOffer.find(filter)
      .populate('technician', 'profile technicianProfile.specialties')
      .sort({ createdAt: -1 })

    res.json({ offers })
  } catch (error) {
    console.error('list offers error', error)
    res.status(500).json({ message: 'No se pudieron obtener las ofertas' })
  }
}

exports.acceptOffer = async (req, res) => {
  try {
    const { id, offerId } = req.params
    const request = await ServiceRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' })
    }
    if (String(request.client) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Solo el cliente puede aceptar una oferta' })
    }

    const offer = await ServiceOffer.findOne({ _id: offerId, serviceRequest: id })
    if (!offer) {
      return res.status(404).json({ message: 'Oferta no encontrada' })
    }

    offer.status = 'accepted'
    await offer.save()

    await ServiceOffer.updateMany(
      {
        serviceRequest: id,
        _id: { $ne: offerId },
      },
      { $set: { status: 'rejected' } },
    )

    request.technician = offer.technician
    request.status = 'accepted'
    request.acceptedOffer = offer._id
    await request.save()
    await User.findByIdAndUpdate(offer.technician, { $addToSet: { serviceHistory: request._id } })

    res.json({ offer, request })
  } catch (error) {
    console.error('accept offer error', error)
    res.status(500).json({ message: 'No se pudo aceptar la oferta' })
  }
}

exports.rejectOffer = async (req, res) => {
  try {
    const { id, offerId } = req.params
    const request = await ServiceRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' })
    }
    if (String(request.client) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Solo el cliente puede rechazar una oferta' })
    }

    const offer = await ServiceOffer.findOne({ _id: offerId, serviceRequest: id })
    if (!offer) {
      return res.status(404).json({ message: 'Oferta no encontrada' })
    }

    if (offer.status === 'accepted') {
      return res.status(400).json({ message: 'No puedes rechazar una oferta aceptada' })
    }

    offer.status = 'rejected'
    await offer.save()

    res.json({ offer })
  } catch (error) {
    console.error('reject offer error', error)
    res.status(500).json({ message: 'No se pudo rechazar la oferta' })
  }
}

exports.listMyOffers = async (req, res) => {
  try {
    if (req.user.role !== 'technician') {
      return res.status(403).json({ message: 'No autorizado' })
    }

    const offers = await ServiceOffer.find({ technician: req.user._id })
      .sort({ createdAt: -1 })
      .populate('serviceRequest', 'title category address scheduledAt status')

    const grouped = {
      pending: [],
      accepted: [],
      rejected: [],
    }

    offers.forEach((offer) => {
      const status = offer.status ?? 'pending'
      const targetArray = grouped[status] ?? grouped.pending
      targetArray.push({
        id: offer._id,
        amount: offer.amount,
        message: offer.message,
        status,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        serviceRequest: offer.serviceRequest
          ? {
            id: offer.serviceRequest._id,
            title: offer.serviceRequest.title,
            category: offer.serviceRequest.category,
            address: offer.serviceRequest.address,
            scheduledAt: offer.serviceRequest.scheduledAt,
            status: offer.serviceRequest.status,
          }
          : null,
      })
    })

    res.json({ offers: grouped })
  } catch (error) {
    console.error('list my offers error', error)
    res.status(500).json({ message: 'No se pudieron obtener tus cotizaciones' })
  }
}

