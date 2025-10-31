const router = require('express').Router()
const offerController = require('../controllers/offerController')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')

router.use(authMiddleware)

router.get(
  '/mine',
  roleMiddleware('technician'),
  offerController.listMyOffers,
)

module.exports = router
