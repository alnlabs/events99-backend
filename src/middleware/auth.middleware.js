// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma.js'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, email: true, name: true, role: true, isActive: true } })

    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Unauthorised' })

    req.user = user
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export const authorise = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Access forbidden' })
  next()
}
