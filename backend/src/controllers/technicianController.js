const User = require('../models/User')

const normalizeArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return [value]
}

exports.registerTechnician = async (req, res) => {
  try {
    const specialties = normalizeArray(req.body.specialties || req.body.specialty)
    const technicianData = {
      specialties,
      experienceYears: req.body.experienceYears,
      bio: req.body.bio,
      skills: normalizeArray(req.body.skills),
      serviceAreas: normalizeArray(req.body.serviceAreas),
      documents: normalizeArray(req.body.documents),
      availability: (req.body.availability || []).map((slot) => ({
        day: slot.day,
        startHour: slot.startHour,
        endHour: slot.endHour,
      })),
      portfolio: (req.body.portfolio || []).map((item) => ({
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
      })),
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    user.role = 'technician'
    user.technicianProfile = technicianData

    if (req.body.avatar) {
      user.profile = {
        ...(user.profile?.toObject?.() ?? user.profile ?? {}),
        avatar: req.body.avatar,
      }
    }

    await user.save()

    const hydrated = await User.findById(req.user.id)
      .populate('clientProfile.favorites', 'profile technicianProfile.rating')
      .populate({
        path: 'serviceHistory',
        select: 'title status category scheduledAt technician',
        populate: { path: 'technician', select: 'profile' },
      })

    res.status(201).json({ user: hydrated })
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
      filters['technicianProfile.specialties'] = specialty
    }
    if (q) {
      filters.$or = [
        { 'profile.fullName': new RegExp(q, 'i') },
        { 'technicianProfile.bio': new RegExp(q, 'i') },
        { 'technicianProfile.serviceAreas': new RegExp(q, 'i') },
        { 'technicianProfile.specialties': new RegExp(q, 'i') },
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
