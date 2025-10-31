const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const profileSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String }, // URL (incl. enlaces de Drive)
}, { _id: false })

const availabilitySchema = new mongoose.Schema({
  day: { type: String, enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] },
  startHour: { type: String }, // HH:mm
  endHour: { type: String }, // HH:mm
}, { _id: false })

const portfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String }, // enlace a Drive u otro hosting
}, { _id: false })

const technicianReviewSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false })

const technicianSchema = new mongoose.Schema({
  specialties: [String],
  experienceYears: Number,
  bio: String,
  skills: [String],
  serviceAreas: [String],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  reviews: [technicianReviewSchema],
  documents: [String],
  availability: [availabilitySchema],
  portfolio: [portfolioSchema],
}, { _id: false })

const addressSchema = new mongoose.Schema({
  label: String,
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  reference: String,
}, { _id: false })

const clientSchema = new mongoose.Schema({
  addresses: [addressSchema],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  reputation: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
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
  clientProfile: clientSchema,
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
