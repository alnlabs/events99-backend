// src/controllers/booking.controller.js
import prisma from '../utils/prisma.js'

export const createBooking = async (req, res) => {
  try {
    const { hallId, eventDate, startTime, endTime, guestCount, eventType, specialRequests, catering } = req.body

    // Check availability
    const conflict = await prisma.booking.findFirst({
      where: {
        hallId, eventDate: new Date(eventDate),
        status: { notIn: ['CANCELLED'] },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ]
      }
    })
    if (conflict) return res.status(409).json({ success: false, message: 'Hall not available for selected time slot' })

    // Check blocked date
    const blocked = await prisma.blockedDate.findFirst({
      where: { date: new Date(eventDate), OR: [{ hallId }, { hallId: null }] }
    })
    if (blocked) return res.status(409).json({ success: false, message: `Date is blocked: ${blocked.reason || 'unavailable'}` })

    // Calculate total
    const hall = await prisma.hall.findUnique({ where: { id: hallId } })
    if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' })

    const hours = (new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) / 3600000
    let totalAmount = Number(hall.pricePerHour) * hours

    let cateringCost = 0
    if (catering?.packageId && catering?.guestCount) {
      const pkg = await prisma.cateringPackage.findUnique({ where: { id: catering.packageId } })
      if (pkg) cateringCost = Number(pkg.pricePerHead) * catering.guestCount
    }
    totalAmount += cateringCost

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id, hallId, eventDate: new Date(eventDate),
        startTime, endTime, guestCount, eventType, specialRequests,
        totalAmount,
        catering: catering?.packageId ? {
          create: {
            packageId: catering.packageId,
            confirmedGuests: catering.guestCount,
            specialDietary: catering.specialDietary,
            totalCateringCost: cateringCost
          }
        } : undefined
      },
      include: {
        hall: { select: { name: true } },
        catering: { include: { package: true } },
        user: { select: { name: true, email: true } }
      }
    })

    res.status(201).json({ success: true, booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getBookings = async (req, res) => {
  try {
    const { status, hallId, from, to, page = 1, limit = 20 } = req.query
    const isAdmin = ['ADMIN', 'STAFF'].includes(req.user.role)

    const where = {
      ...(!isAdmin && { userId: req.user.id }),
      ...(status && { status }),
      ...(hallId && { hallId }),
      ...(from && to && { eventDate: { gte: new Date(from), lte: new Date(to) } }),
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where, skip: (page - 1) * limit, take: Number(limit),
        include: {
          hall: { select: { name: true } },
          user: { select: { name: true, email: true, phone: true } },
          catering: { include: { package: { select: { name: true } } } },
          payments: { select: { amount: true, status: true, method: true, receivedAt: true } },
          _count: { select: { shifts: true } }
        },
        orderBy: { eventDate: 'desc' }
      }),
      prisma.booking.count({ where })
    ])

    res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        hall: true,
        user: { select: { name: true, email: true, phone: true } },
        catering: { include: { package: true } },
        payments: { include: { user: { select: { name: true } } } },
        shifts: { include: { user: { select: { name: true, email: true } } } }
      }
    })
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    const isOwner = booking.userId === req.user.id
    const isAdmin = ['ADMIN', 'STAFF'].includes(req.user.role)
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Access denied' })

    res.json({ success: true, booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status, notes },
      include: { hall: { select: { name: true } }, user: { select: { name: true, email: true } } }
    })
    res.json({ success: true, booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const cancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } })
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    const isOwner = booking.userId === req.user.id
    const isAdmin = req.user.role === 'ADMIN'
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Access denied' })

    if (['COMPLETED', 'CANCELLED'].includes(booking.status))
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status.toLowerCase()} booking` })

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', notes: req.body.reason || booking.notes }
    })
    res.json({ success: true, booking: updated })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateCatering = async (req, res) => {
  try {
    const { packageId, confirmedGuests, specialDietary } = req.body
    const pkg = await prisma.cateringPackage.findUnique({ where: { id: packageId } })
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' })

    const totalCateringCost = Number(pkg.pricePerHead) * confirmedGuests

    const catering = await prisma.bookingCatering.upsert({
      where: { bookingId: req.params.id },
      update: { packageId, confirmedGuests, specialDietary, totalCateringCost, finalisedAt: new Date() },
      create: { bookingId: req.params.id, packageId, confirmedGuests, specialDietary, totalCateringCost }
    })

    // Update booking total
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } })
    const prevCatering = await prisma.bookingCatering.findUnique({ where: { bookingId: req.params.id } })
    const prevCost = prevCatering ? Number(prevCatering.totalCateringCost) : 0
    await prisma.booking.update({
      where: { id: req.params.id },
      data: { totalAmount: Number(booking.totalAmount) - prevCost + totalCateringCost }
    })

    res.json({ success: true, catering })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
