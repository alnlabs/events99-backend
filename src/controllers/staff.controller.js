// src/controllers/staff.controller.js
import * as prismaModule from '../utils/prisma.js'
const prisma = prismaModule.prisma || prismaModule.default || prismaModule

export const assignShift = async (req, res) => {
  try {
    const { bookingId, userId, role, shiftDate, startTime, endTime, notes } = req.body

    // Conflict check
    const conflict = await prisma.staffShift.findFirst({
      where: {
        userId, shiftDate: new Date(shiftDate), status: { notIn: ['ABSENT'] },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
        ]
      }
    })
    if (conflict) return res.status(409).json({ success: false, message: 'Staff member has a conflicting shift' })

    const shift = await prisma.staffShift.create({
      data: { bookingId, userId, role, shiftDate: new Date(shiftDate), startTime, endTime, notes },
      include: { user: { select: { name: true, email: true } }, booking: { select: { bookingRef: true, eventDate: true } } }
    })
    res.status(201).json({ success: true, shift })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getShifts = async (req, res) => {
  try {
    const { from, to, userId, bookingId } = req.query
    const isStaff = req.user.role === 'STAFF'

    const where = {
      ...(isStaff && { userId: req.user.id }),
      ...(!isStaff && userId && { userId }),
      ...(bookingId && { bookingId }),
      ...(from && to && { shiftDate: { gte: new Date(from), lte: new Date(to) } }),
    }

    const shifts = await prisma.staffShift.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        booking: { include: { hall: { select: { name: true } } } }
      },
      orderBy: [{ shiftDate: 'asc' }, { startTime: 'asc' }]
    })
    res.json({ success: true, shifts })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateShiftStatus = async (req, res) => {
  try {
    const { status } = req.body
    const shift = await prisma.staffShift.findUnique({ where: { id: req.params.id } })
    if (!shift) return res.status(404).json({ success: false, message: 'Shift not found' })

    const isOwn = shift.userId === req.user.id
    const isAdmin = req.user.role === 'ADMIN'
    if (!isOwn && !isAdmin) return res.status(403).json({ success: false, message: 'Access denied' })

    const updated = await prisma.staffShift.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'CHECKED_IN' && { checkedInAt: new Date() }),
        ...(status === 'COMPLETED' && { checkedOutAt: new Date() }),
      },
      include: { user: { select: { name: true } } }
    })
    res.json({ success: true, shift: updated })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const deleteShift = async (req, res) => {
  try {
    await prisma.staffShift.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Shift deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getStaffList = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'ADMIN'] }, isActive: true },
      select: { id: true, name: true, email: true, phone: true, role: true },
      orderBy: { name: 'asc' }
    })
    res.json({ success: true, staff })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
