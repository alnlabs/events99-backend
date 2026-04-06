// src/controllers/payment.controller.js
import * as prismaModule from '../utils/prisma.js'
const prisma = prismaModule.prisma || prismaModule.default || prismaModule

export const recordPayment = async (req, res) => {
  try {
    const { bookingId, amount, method, referenceNo, notes, receivedAt } = req.body

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true }
    })
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    const totalPaid = booking.payments.reduce((s, p) => s + Number(p.amount), 0) + Number(amount)
    const paymentStatus = totalPaid >= Number(booking.totalAmount) ? 'PAID'
      : totalPaid > 0 ? 'PARTIALLY_PAID' : 'UNPAID'

    const payment = await prisma.payment.create({
      data: {
        bookingId, userId: req.user.id,
        amount, method, referenceNo, notes,
        status: paymentStatus,
        receivedAt: receivedAt ? new Date(receivedAt) : new Date()
      }
    })

    // Auto-confirm booking on full payment
    if (paymentStatus === 'PAID' && booking.status === 'PENDING') {
      await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } })
    }

    res.status(201).json({ success: true, payment, paymentStatus, totalPaid })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getBookingPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { bookingId: req.params.bookingId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    const total = payments.reduce((s, p) => s + Number(p.amount), 0)
    res.json({ success: true, payments, totalPaid: total })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getAllPayments = async (req, res) => {
  try {
    const { from, to, method, status, page = 1, limit = 20 } = req.query
    const where = {
      ...(method && { method }),
      ...(status && { status }),
      ...(from && to && { receivedAt: { gte: new Date(from), lte: new Date(to) } }),
    }
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where, skip: (page - 1) * limit, take: Number(limit),
        include: {
          booking: { select: { bookingRef: true, eventDate: true, hall: { select: { name: true } } } },
          user: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where })
    ])
    const totalAmount = await prisma.payment.aggregate({ where, _sum: { amount: true } })
    res.json({ success: true, payments, total, totalAmount: totalAmount._sum.amount || 0, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const deletePayment = async (req, res) => {
  try {
    await prisma.payment.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Payment record deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
