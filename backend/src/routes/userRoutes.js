const router = require('express').Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/:id', userController.getUser)
router.put('/:id', userController.updateUser)

module.exports = router
