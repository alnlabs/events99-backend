// src/routes/catering.routes.js
import { Router } from 'express'
import { getPackages, getAllPackages, createPackage, updatePackage, deletePackage } from '../controllers/catering.controller.js'
import { authenticate, authorise } from '../middleware/auth.middleware.js'
const router = Router()
router.get('/', getPackages)
router.get('/all', authenticate, authorise('ADMIN'), getAllPackages)
router.post('/', authenticate, authorise('ADMIN'), createPackage)
router.patch('/:id', authenticate, authorise('ADMIN'), updatePackage)
router.delete('/:id', authenticate, authorise('ADMIN'), deletePackage)
export default router
