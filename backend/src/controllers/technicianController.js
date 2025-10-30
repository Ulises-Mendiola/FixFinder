const User = require('../models/User')

exports.registerTechnician = async (req, res) => {
  try {
    const technicianData = {
      specialty: req.body.specialty,
      experienceYears: req.body.experienceYears,
      bio: req.body.bio,
      skills: req.body.skills || [],
      serviceAreas: req.body.serviceAreas || [],
      documents: req.body.documents || [],
      availability: req.body.availability || [],
      portfolio: req.body.portfolio || [],
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        role: 'technician',
        technicianProfile: technicianData,
      },
      { new: true },
    )

    res.status(201).json({ user })
  } catch (error) {
    console.error('Register technician error', error)
    res.status(500).json({ message: 'No se pudo completar el registro técnico' })
  }
}

exports.listTechnicians = async (req, res) => {
  try {
    const { q, specialty } = req.query
    const filters = { role: 'technician' }
    if (specialty) {
      filters['technicianProfile.specialty'] = specialty
    }
    if (q) {
      filters.$or = [
        { 'profile.fullName': new RegExp(q, 'i') },
        { 'technicianProfile.bio': new RegExp(q, 'i') },
        { 'technicianProfile.serviceAreas': new RegExp(q, 'i') },
      ]
    }
    const technicians = await User.find(filters)
    res.json({ technicians })
  } catch (error) {
    console.error('List technicians error', error)
    res.status(500).json({ message: 'No se pudieron obtener los técnicos' })
  }
}

exports.getTechnician = async (req, res) => {
  try {
    const { id } = req.params
    const technician = await User.findOne({ _id: id, role: 'technician' })
    if (!technician) {
      return res.status(404).json({ message: 'Técnico no encontrado' })
    }
    res.json({ technician })
  } catch (error) {
    console.error('Get technician error', error)
    res.status(500).json({ message: 'No se pudo obtener el técnico' })
  }
}
