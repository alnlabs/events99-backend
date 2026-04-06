// src/routes/hall.routes.js
import { Router } from 'express'
import { getAllHalls, getHall, getHallAvailability, createHall, updateHall, deleteHall, addPricingRule, deletePricingRule, blockDate } from '../controllers/hall.controller.js'
import { authenticate, authorise } from '../middleware/auth.middleware.js'
const router = Router()
router.get('/', getAllHalls)
router.get('/:id', getHall)
router.get('/:id/availability', getHallAvailability)
router.post('/', authenticate, authorise('ADMIN'), createHall)
router.patch('/:id', authenticate, authorise('ADMIN'), updateHall)
router.delete('/:id', authenticate, authorise('ADMIN'), deleteHall)
router.post('/:id/pricing-rules', authenticate, authorise('ADMIN'), addPricingRule)
router.delete('/:id/pricing-rules/:ruleId', authenticate, authorise('ADMIN'), deletePricingRule)
router.post('/blocked-dates', authenticate, authorise('ADMIN'), blockDate)
export default router
