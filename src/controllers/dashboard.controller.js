// src/controllers/dashboard.controller.js
import * as prismaModule from '../utils/prisma.js'
const prisma = prismaModule.prisma || prismaModule.default || prismaModule

export const getAdminStats = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [
      totalBookings, pendingBookings, confirmedBookings, thisMonthBookings,
      totalRevenue, monthRevenue, totalHalls, activeHalls,
      totalCustomers, recentBookings, upcomingBookings
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { createdAt: { gte: startOfMonth, lte: endOfMonth } } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { receivedAt: { gte: startOfMonth, lte: endOfMonth } }, _sum: { amount: true } }),
      prisma.hall.count(),
      prisma.hall.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { hall: { select: { name: true } }, user: { select: { name: true } } }
      }),
      prisma.booking.findMany({
        where: { eventDate: { gte: now }, status: { in: ['CONFIRMED', 'PENDING'] } },
        take: 5,
        orderBy: { eventDate: 'asc' },
        include: { hall: { select: { name: true } }, user: { select: { name: true } } }
      })
    ])

    res.json({
      success: true,
      stats: {
        bookings: { total: totalBookings, pending: pendingBookings, confirmed: confirmedBookings, thisMonth: thisMonthBookings },
        revenue: { total: totalRevenue._sum.amount || 0, thisMonth: monthRevenue._sum.amount || 0 },
        halls: { total: totalHalls, active: activeHalls },
        customers: { total: totalCustomers }
      },
      recentBookings,
      upcomingBookings
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getRevenueReport = async (req, res) => {
  try {
    const { from, to } = req.query
    const where = from && to ? { receivedAt: { gte: new Date(from), lte: new Date(to) } } : {}

    const byMethod = await prisma.payment.groupBy({
      by: ['method'], where, _sum: { amount: true }, _count: true
    })
    const byMonth = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "received_at") as month, SUM(amount) as total, COUNT(*) as count
      FROM payments WHERE "received_at" IS NOT NULL
      ${from ? prisma.$raw`AND "received_at" >= ${new Date(from)}` : prisma.$raw``}
      ${to ? prisma.$raw`AND "received_at" <= ${new Date(to)}` : prisma.$raw``}
      GROUP BY month ORDER BY month DESC LIMIT 12
    `
    res.json({ success: true, byMethod, byMonth })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getCustomerStats = async (req, res) => {
  try {
    const userId = req.user.id
    const [totalBookings, upcomingBookings, totalSpent, recentBookings] = await Promise.all([
      prisma.booking.count({ where: { userId } }),
      prisma.booking.count({ where: { userId, eventDate: { gte: new Date() }, status: { in: ['CONFIRMED', 'PENDING'] } } }),
      prisma.payment.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.booking.findMany({
        where: { userId }, take: 5,
        orderBy: { createdAt: 'desc' },
        include: { hall: { select: { name: true } }, payments: { select: { amount: true, status: true } } }
      })
    ])
    res.json({ success: true, stats: { totalBookings, upcomingBookings, totalSpent: totalSpent._sum.amount || 0 }, recentBookings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
