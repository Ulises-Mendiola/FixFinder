const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')
const conversationController = require('../controllers/conversationController')

router.use(authMiddleware)

router.get('/', conversationController.listConversations)
router.post('/', conversationController.createConversation)
router.get('/:id', conversationController.getConversation)
router.post('/:id/messages', conversationController.sendMessage)

module.exports = router
