const router = require('express').Router()
const technicianController = require('../controllers/technicianController')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')

router.get('/', technicianController.listTechnicians)
router.get('/:id', technicianController.getTechnician)
router.post(
  '/register',
  authMiddleware,
  roleMiddleware('client', 'technician', 'superadmin'),
  technicianController.registerTechnician,
)

module.exports = router
