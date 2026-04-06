// src/routes/user.routes.js
import { Router } from 'express'
import { getUsers, createUser, updateUser, resetUserPassword } from '../controllers/user.controller.js'
import { authenticate, authorise } from '../middleware/auth.middleware.js'
const router = Router()
router.use(authenticate, authorise('ADMIN'))
router.get('/', getUsers)
router.post('/', createUser)
router.patch('/:id', updateUser)
router.patch('/:id/reset-password', resetUserPassword)
export default router
