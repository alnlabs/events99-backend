// src/controllers/user.controller.js
import prisma from '../utils/prisma.js'
import bcrypt from 'bcryptjs'

export const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query
    const users = await prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] })
      },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true, _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, users })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone, role },
      select: { id: true, name: true, email: true, phone: true, role: true }
    })
    res.status(201).json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { name, phone, role, isActive } = req.body
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, phone, role, isActive },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true }
    })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body
    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hashed } })
    res.json({ success: true, message: 'Password reset successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
