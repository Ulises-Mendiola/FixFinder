const mongoose = require('mongoose')

const serviceRequestSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  address: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  categoryDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  scheduledAt: { type: Date, required: true },
  contactName: { type: String, required: true },
  contactPhone: { type: String },
  notes: { type: String },
  acceptedOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceOffer',
  },
  completedAt: { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema)
