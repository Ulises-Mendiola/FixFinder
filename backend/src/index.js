const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()

const app = express()

const PORT = process.env.PORT || 4000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(helmet())
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

connectDB()

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FixFinder API' })
})

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/technicians', require('./routes/techRoutes'))
app.use('/api/service-request', require('./routes/serviceRequestRoutes'))
app.use('/api/conversations', require('./routes/conversationRoutes'))
app.use('/api/offers', require('./routes/offerRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' })
  next()
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
  next()
})

app.listen(PORT, () => {
  console.log(`FixFinder API running on port ${PORT}`)
})
