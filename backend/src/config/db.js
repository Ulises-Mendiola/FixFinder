const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fixfinder'
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error', error)
    process.exit(1)
  }
}

module.exports = connectDB
