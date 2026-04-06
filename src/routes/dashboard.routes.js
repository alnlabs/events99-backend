// src/routes/dashboard.routes.js
import { Router } from 'express'
import { getAdminStats, getRevenueReport, getCustomerStats } from '../controllers/dashboard.controller.js'
import { authenticate, authorise } from '../middleware/auth.middleware.js'
const router = Router()
router.use(authenticate)
router.get('/admin', authorise('ADMIN', 'STAFF'), getAdminStats)
router.get('/revenue', authorise('ADMIN'), getRevenueReport)
router.get('/customer', getCustomerStats)
export default router
