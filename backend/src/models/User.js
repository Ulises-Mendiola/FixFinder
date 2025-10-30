const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const profileSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  avatar: { type: String },
}, { _id: false })

const availabilitySchema = new mongoose.Schema({
  day: String,
  hours: String,
}, { _id: false })

const portfolioSchema = new mongoose.Schema({
  title: String,
  summary: String,
  year: Number,
  imageUrl: String,
}, { _id: false })

const technicianSchema = new mongoose.Schema({
  specialty: String,
  experienceYears: Number,
  bio: String,
  skills: [String],
  serviceAreas: [String],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  documents: [String],
  availability: [availabilitySchema],
  portfolio: [portfolioSchema],
}, { _id: false })

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: {
    type: String,
    enum: ['client', 'technician', 'superadmin'],
    default: 'client',
  },
  profile: profileSchema,
  technicianProfile: technicianSchema,
  serviceHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
  }],
}, { timestamps: true })

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ versionKey: false })
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)
