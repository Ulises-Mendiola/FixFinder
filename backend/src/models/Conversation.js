const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false })

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
  },
  messages: [messageSchema],
  expiresAt: {
    type: Date,
  },
}, { timestamps: true })

conversationSchema.index({ participants: 1 })
conversationSchema.index({ serviceRequest: 1 })
conversationSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $exists: true } },
  },
)

module.exports = mongoose.model('Conversation', conversationSchema)
