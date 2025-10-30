const User = require('../models/User')
const ServiceRequest = require('../models/ServiceRequest')

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalTechnicians, openRequests] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'technician' }),
      ServiceRequest.countDocuments({ status: { $in: ['pending', 'accepted', 'in_progress'] } }),
    ])

    const users = await User.find().limit(25).sort({ createdAt: -1 })
    const requests = await ServiceRequest.find()
      .populate('client', 'profile')
      .populate('technician', 'profile')
      .limit(25)
      .sort({ createdAt: -1 })

    res.json({
      metrics: { totalUsers, totalTechnicians, openRequests },
      users,
      requests,
    })
  } catch (error) {
    console.error('Dashboard error', error)
    res.status(500).json({ message: 'No se pudo cargar el dashboard' })
  }
}
