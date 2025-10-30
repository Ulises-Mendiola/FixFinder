const ServiceRequest = require('../models/ServiceRequest')
const User = require('../models/User')

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
