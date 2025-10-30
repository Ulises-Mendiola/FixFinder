const router = require('express').Router()
const serviceRequestController = require('../controllers/serviceRequestController')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')

router.use(authMiddleware)

router.post(
  '/',
  roleMiddleware('client'),
  serviceRequestController.createServiceRequest,
)
router.get('/', serviceRequestController.listRequests)
router.get('/:id', serviceRequestController.getServiceRequest)
router.patch(
  '/:id/assign',
  roleMiddleware('superadmin'),
  serviceRequestController.assignTechnician,
)

module.exports = router
