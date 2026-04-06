// src/routes/staff.routes.js
import { Router } from 'express'
import { assignShift, getShifts, updateShiftStatus, deleteShift, getStaffList } from '../controllers/staff.controller.js'
import { authenticate, authorise } from '../middleware/auth.middleware.js'
const router = Router()
router.use(authenticate)
router.get('/list', authorise('ADMIN'), getStaffList)
router.post('/shifts', authorise('ADMIN'), assignShift)
router.get('/shifts', getShifts)
router.patch('/shifts/:id/status', updateShiftStatus)
router.delete('/shifts/:id', authorise('ADMIN'), deleteShift)
export default router
