const router = require('express').Router()
const adminController = require('../controllers/adminController')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')

router.use(authMiddleware, roleMiddleware('superadmin'))

router.get('/dashboard', adminController.getDashboard)

module.exports = router
