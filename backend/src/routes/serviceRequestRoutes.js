const router = require('express').Router()
const serviceRequestController = require('../controllers/serviceRequestController')
const offerController = require('../controllers/offerController')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')

router.use(authMiddleware)

router.post(
  '/',
  roleMiddleware('client'),
  serviceRequestController.createServiceRequest,
)
router.get('/', serviceRequestController.listRequests)
router.get(
  '/nearby',
  roleMiddleware('technician'),
  serviceRequestController.listNearbyRequests,
)
router.get('/:id', serviceRequestController.getServiceRequest)

router.post(
  '/:id/offers',
  roleMiddleware('technician', 'superadmin'),
  offerController.createOffer,
)
router.get('/:id/offers', offerController.listOffers)
router.patch(
  '/:id/offers/:offerId/accept',
  roleMiddleware('client'),
  offerController.acceptOffer,
)
router.patch(
  '/:id/offers/:offerId/reject',
  roleMiddleware('client'),
  offerController.rejectOffer,
)

router.patch(
  '/:id/assign',
  roleMiddleware('superadmin'),
  serviceRequestController.assignTechnician,
)
router.patch(
  '/:id/status',
  roleMiddleware('client', 'technician', 'superadmin'),
  serviceRequestController.updateStatus,
)

module.exports = router
