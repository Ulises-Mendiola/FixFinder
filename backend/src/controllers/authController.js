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

    const user = await User.create({
      email,
      password,
      role: role === 'technician' ? 'technician' : 'client',
      profile,
      technicianProfile: role === 'technician' ? {} : undefined,
    })

    res.status(201).json(buildAuthResponse(user))
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
    res.json(buildAuthResponse(user))
  } catch (error) {
    console.error('Login error', error)
    res.status(500).json({ message: 'No se pudo iniciar sesión' })
  }
}

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener el perfil' })
  }
}
