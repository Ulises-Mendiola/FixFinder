const roleMiddleware = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' })
  }
  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'No autorizado' })
  }
  next()
}

module.exports = roleMiddleware
