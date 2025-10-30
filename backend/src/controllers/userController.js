const User = require('../models/User')

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).populate({
      path: 'serviceHistory',
      select: 'title status category scheduledAt',
    })
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

    const updates = {
      ...(req.body.profile && { profile: req.body.profile }),
      ...(req.body.role && isAdmin && { role: req.body.role }),
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    res.json({ user })
  } catch (error) {
    console.error('Update user error', error)
    res.status(500).json({ message: 'No se pudo actualizar el usuario' })
  }
}
