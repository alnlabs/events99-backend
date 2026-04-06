// src/routes/booking.routes.js
import { Router } from 'express'
import { createBooking, getBookings, getBooking, updateBookingStatus, cancelBooking, updateCatering } from '../controllers/booking.controller.js'
import { authenticate, authorise } from '../middleware/auth.middleware.js'
const router = Router()
router.use(authenticate)
router.post('/', createBooking)
router.get('/', getBookings)
router.get('/:id', getBooking)
router.patch('/:id/status', authorise('ADMIN', 'STAFF'), updateBookingStatus)
router.patch('/:id/cancel', cancelBooking)
router.patch('/:id/catering', authorise('ADMIN'), updateCatering)
export default router
