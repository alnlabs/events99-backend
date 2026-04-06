// src/index.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.routes.js'
import hallRoutes from './routes/hall.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import cateringRoutes from './routes/catering.routes.js'
import staffRoutes from './routes/staff.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import userRoutes from './routes/user.routes.js'

export const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────────────
app.use(helmet())
app.use(compression())
app.use(morgan('dev'))
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5300'].filter(Boolean),
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
app.use('/api', limiter)

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',      authRoutes.default || authRoutes)
app.use('/api/halls',     hallRoutes.default || hallRoutes)
app.use('/api/bookings',  bookingRoutes.default || bookingRoutes)
app.use('/api/payments',  paymentRoutes.default || paymentRoutes)
app.use('/api/catering',  cateringRoutes.default || cateringRoutes)
app.use('/api/staff',     staffRoutes.default || staffRoutes)
app.use('/api/dashboard', dashboardRoutes.default || dashboardRoutes)
app.use('/api/users',     userRoutes.default || userRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }))

// ── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

// ── Execution ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
}

export default app
