const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autenticado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fixfinder-secret')
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }
    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error', error)
    res.status(401).json({ message: 'Token inválido' })
  }
}

module.exports = authMiddleware
