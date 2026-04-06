// src/controllers/hall.controller.js
import * as prismaModule from '../utils/prisma.js'
const prisma = prismaModule.prisma || prismaModule.default || prismaModule

export const getAllHalls = async (req, res) => {
  try {
    const { active } = req.query
    const halls = await prisma.hall.findMany({
      where: active === 'true' ? { isActive: true } : undefined,
      include: { _count: { select: { bookings: true } } },
      orderBy: { name: 'asc' }
    })
    res.json({ success: true, halls })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getHall = async (req, res) => {
  try {
    const hall = await prisma.hall.findUnique({
      where: { id: req.params.id },
      include: { pricingRules: true, _count: { select: { bookings: true } } }
    })
    if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' })
    res.json({ success: true, hall })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getHallAvailability = async (req, res) => {
  try {
    const { date } = req.query
    if (!date) return res.status(400).json({ success: false, message: 'Date required' })

    const targetDate = new Date(date)
    const blocked = await prisma.blockedDate.findFirst({
      where: {
        date: targetDate,
        OR: [{ hallId: req.params.id }, { hallId: null }]
      }
    })

    const bookings = await prisma.booking.findMany({
      where: {
        hallId: req.params.id,
        eventDate: targetDate,
        status: { notIn: ['CANCELLED'] }
      },
      select: { startTime: true, endTime: true, status: true }
    })

    res.json({ success: true, date, isBlocked: !!blocked, blockedReason: blocked?.reason, bookings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const createHall = async (req, res) => {
  try {
    const hall = await prisma.hall.create({ data: req.body })
    res.status(201).json({ success: true, hall })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateHall = async (req, res) => {
  try {
    const hall = await prisma.hall.update({ where: { id: req.params.id }, data: req.body })
    res.json({ success: true, hall })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const deleteHall = async (req, res) => {
  try {
    await prisma.hall.update({ where: { id: req.params.id }, data: { isActive: false } })
    res.json({ success: true, message: 'Hall deactivated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const addPricingRule = async (req, res) => {
  try {
    const rule = await prisma.pricingRule.create({ data: { ...req.body, hallId: req.params.id } })
    res.status(201).json({ success: true, rule })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const deletePricingRule = async (req, res) => {
  try {
    await prisma.pricingRule.delete({ where: { id: req.params.ruleId } })
    res.json({ success: true, message: 'Pricing rule deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const blockDate = async (req, res) => {
  try {
    const blocked = await prisma.blockedDate.create({ data: req.body })
    res.status(201).json({ success: true, blocked })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
