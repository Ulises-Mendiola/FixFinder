const User = require('../models/User')

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
      .populate({
        path: 'serviceHistory',
        select: 'title status category scheduledAt technician',
        populate: { path: 'technician', select: 'profile' },
      })
      .populate('clientProfile.favorites', 'profile technicianProfile.rating')
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    res.json({ user })
  } catch (error) {
    console.error('Get user error', error)
    res.status(500).json({ message: 'No se pudo obtener el usuario' })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const isSelf = req.user.id === id
    const isAdmin = req.user.role === 'superadmin'

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'No autorizado' })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (req.body.profile) {
      user.profile = {
        ...(user.profile?.toObject?.() ?? user.profile ?? {}),
        ...req.body.profile,
      }
    }

    if (req.body.clientProfile) {
      if (Array.isArray(req.body.clientProfile.addresses)) {
        user.clientProfile = user.clientProfile || {}
        user.clientProfile.addresses = req.body.clientProfile.addresses
      }
      if (Array.isArray(req.body.clientProfile.favorites)) {
        user.clientProfile = user.clientProfile || {}
        user.clientProfile.favorites = req.body.clientProfile.favorites
      }
    }

    if (req.body.role && isAdmin) {
      user.role = req.body.role
    }

    await user.save()

    const populated = await User.findById(id)
      .populate({
        path: 'serviceHistory',
        select: 'title status category scheduledAt technician',
        populate: { path: 'technician', select: 'profile' },
      })
      .populate('clientProfile.favorites', 'profile technicianProfile.rating')

    res.json({ user: populated })
  } catch (error) {
    console.error('Update user error', error)
    res.status(500).json({ message: 'No se pudo actualizar el usuario' })
  }
}
