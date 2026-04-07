# Spec: Dashboard & Reporting

> **Phase:** 8 — Dashboard
> **Status:** [x] Built
> **Files affected:** `src/controllers/dashboard.controller.js`, `src/routes/dashboard.routes.js`

---

## 1. Requirements

### User stories

- As an admin or staff, I want a stats overview (bookings, revenue, halls, customers) with recent and upcoming bookings so that I can monitor operations.
- As an admin, I want a revenue report broken down by payment method and by month so that I can analyse income trends.
- As a customer, I want my own stats (total bookings, upcoming, total spent) and recent bookings so that I see my activity.

### Acceptance criteria

```
GIVEN GET /api/dashboard/admin by ADMIN or STAFF
THEN returns:
  stats.bookings: { total, pending, confirmed, thisMonth }
  stats.revenue:  { total, thisMonth }
  stats.halls:    { total, active }
  stats.customers:{ total }
  recentBookings: last 5 by createdAt desc (includes hall.name, user.name)
  upcomingBookings: next 5 by eventDate asc, status IN [CONFIRMED, PENDING]

GIVEN GET /api/dashboard/revenue by ADMIN with optional ?from and ?to dates
THEN returns:
  byMethod: payment totals grouped by method
  byMonth:  DATE_TRUNC monthly totals via raw SQL, last 12 months desc

GIVEN GET /api/dashboard/customer by any auth user
THEN returns stats for req.user.id only:
  totalBookings, upcomingBookings (future + CONFIRMED/PENDING), totalSpent
  recentBookings: last 5 with hall.name and payment status
```

---

## 2. Design

### API endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /api/dashboard/admin | ADMIN, STAFF | full KPI snapshot |
| GET | /api/dashboard/revenue | ADMIN | revenue by method + by month |
| GET | /api/dashboard/customer | Any auth | scoped to req.user.id |

### getAdminStats — parallel Promise.all queries

```
prisma.booking.count()
prisma.booking.count({ status: PENDING })
prisma.booking.count({ status: CONFIRMED })
prisma.booking.count({ createdAt: this month })
prisma.payment.aggregate({ _sum: amount })
prisma.payment.aggregate({ _sum: amount, receivedAt: this month })
prisma.hall.count()
prisma.hall.count({ isActive: true })
prisma.user.count({ role: CUSTOMER })
prisma.booking.findMany({ take: 5, orderBy: createdAt desc })
prisma.booking.findMany({ take: 5, eventDate >= now, status IN [...], orderBy: eventDate asc })
```

### getRevenueReport — raw SQL for monthly grouping

```sql
SELECT DATE_TRUNC('month', "received_at") as month, SUM(amount) as total, COUNT(*) as count
FROM payments WHERE "received_at" IS NOT NULL
[AND "received_at" >= ? AND "received_at" <= ?]
GROUP BY month ORDER BY month DESC LIMIT 12
```

---

## 3. Tasks

- [x] Implement `getAdminStats` using Promise.all for all parallel queries
- [x] Implement `getRevenueReport` with groupBy + raw SQL monthly breakdown
- [x] Implement `getCustomerStats` scoped to req.user.id
- [x] Create `src/routes/dashboard.routes.js`
- [x] Mount `/api/dashboard` in `src/index.js`
- [x] Update this spec

---

## 4. Change log

| Date | Change |
|---|---|
| Apr 2026 | Initial spec — built from working code |
