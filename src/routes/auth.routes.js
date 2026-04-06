// src/routes/auth.routes.js
import { Router } from 'express'
import { register, login, getMe, updateProfile, changePassword } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
const router = Router()
router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticate, getMe)
router.patch('/profile', authenticate, updateProfile)
router.patch('/change-password', authenticate, changePassword)
export default router
