const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (userId) => jwt.sign(
  { id: userId },
  process.env.JWT_SECRET || 'fixfinder-secret',
  { expiresIn: '7d' },
)

const buildAuthResponse = (user) => {
  const safeUser = user.toJSON ? user.toJSON() : user
  return {
    user: safeUser,
    token: signToken(safeUser.id || safeUser._id),
  }
}

exports.register = async (req, res) => {
  try {
    const { email, password, role, profile } = req.body
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'El correo ya está registrado' })
    }

    await User.create({
      email,
      password,
      role: role === 'technician' ? 'technician' : 'client',
      profile,
      clientProfile: { addresses: [], favorites: [] },
      technicianProfile: role === 'technician'
        ? {
          specialties: [],
          availability: [],
          portfolio: [],
          skills: [],
          serviceAreas: [],
          reviews: [],
        }
        : undefined,
    })

    const hydrated = await User.findOne({ email })
      .populate('clientProfile.favorites', 'profile technicianProfile.rating')
      .populate({
        path: 'serviceHistory',
        select: 'title status category scheduledAt technician',
        populate: { path: 'technician', select: 'profile' },
      })
    res.status(201).json(buildAuthResponse(hydrated))
  } catch (error) {
    console.error('Register error', error)
    res.status(500).json({ message: 'No se pudo registrar al usuario' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' })
    }
    const hydrated = await User.findById(user.id)
      .populate('clientProfile.favorites', 'profile technicianProfile.rating')
      .populate({
        path: 'serviceHistory',
        select: 'title status category scheduledAt technician',
        populate: { path: 'technician', select: 'profile' },
      })
    res.json(buildAuthResponse(hydrated))
  } catch (error) {
    console.error('Login error', error)
    res.status(500).json({ message: 'No se pudo iniciar sesión' })
  }
}

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('clientProfile.favorites', 'profile technicianProfile.rating')
      .populate({
        path: 'serviceHistory',
        select: 'title status category scheduledAt technician',
        populate: { path: 'technician', select: 'profile' },
      })
      .populate('clientProfile.favorites', 'profile technicianProfile.rating')
    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener el perfil' })
  }
}
