// src/routes/payment.routes.js
import { Router } from 'express'
import { recordPayment, getBookingPayments, getAllPayments, deletePayment } from '../controllers/payment.controller.js'
import { authenticate, authorise } from '../middleware/auth.middleware.js'
const router = Router()
router.use(authenticate)
router.post('/', authorise('ADMIN', 'STAFF'), recordPayment)
router.get('/', authorise('ADMIN'), getAllPayments)
router.get('/booking/:bookingId', getBookingPayments)
router.delete('/:id', authorise('ADMIN'), deletePayment)
export default router
