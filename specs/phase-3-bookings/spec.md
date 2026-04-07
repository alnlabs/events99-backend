# Spec: Booking Creation & Lifecycle

> **Phase:** 3 — Bookings
> **Status:** [x] Built
> **Files affected:** `src/controllers/booking.controller.js`, `src/routes/booking.routes.js`, `prisma/schema.prisma`

---

## 1. Requirements

### User stories

- As a logged-in customer, I want to create a booking for a hall on a specific date/time so that I can reserve it for my event.
- As a logged-in customer, I want to optionally add a catering package to my booking at creation time so that catering is arranged upfront.
- As any logged-in user, I want to list bookings (role-filtered) so that I can see my own or all bookings.
- As any logged-in user, I want to view a single booking's full detail so that I see payments, catering, and staff shifts.
- As an admin or staff, I want to update a booking's status so that the lifecycle progresses correctly.
- As a customer (owner) or admin, I want to cancel a booking so that the slot is freed.
- As an admin, I want to update a booking's catering (upsert) so that guest count or package can change.
- As the system, I want to prevent double-booking a hall slot so that conflicts are impossible.

### Acceptance criteria

```
GIVEN POST /api/bookings with valid hallId, eventDate, startTime, endTime, guestCount, eventType
WHEN the slot does not conflict with existing bookings (excluding CANCELLED)
AND the date is not blocked
THEN booking is created with status=PENDING, totalAmount calculated as (hours × pricePerHour)

GIVEN POST /api/bookings with catering.packageId and catering.guestCount
THEN BookingCatering is created inline, totalAmount += (pricePerHead × guestCount)

GIVEN POST /api/bookings and the time slot overlaps an existing non-CANCELLED booking
THEN 409 { success: false, message: "Hall not available for selected time slot" }

GIVEN POST /api/bookings and the date is in BlockedDate for that hall or globally
THEN 409 { success: false, message: "Date is blocked: <reason>" }

GIVEN GET /api/bookings by CUSTOMER
THEN only bookings where userId = req.user.id are returned

GIVEN GET /api/bookings by ADMIN or STAFF
THEN all bookings are returned (with optional ?status, ?hallId, ?from, ?to, ?page, ?limit filters)

GIVEN GET /api/bookings/:id by the booking owner or ADMIN/STAFF
THEN full detail returned: hall, user, catering+package, payments, shifts

GIVEN GET /api/bookings/:id by a different customer (not owner, not admin)
THEN 403 { success: false, message: "Access denied" }

GIVEN PATCH /api/bookings/:id/status by ADMIN or STAFF with { status, notes? }
THEN booking status is updated

GIVEN PATCH /api/bookings/:id/cancel by the booking owner or ADMIN
WHEN status is not COMPLETED or already CANCELLED
THEN booking status set to CANCELLED

GIVEN PATCH /api/bookings/:id/cancel on a COMPLETED or already CANCELLED booking
THEN 400 { success: false, message: "Cannot cancel a completed/cancelled booking" }
```

---

## 2. Design

### Data model

```prisma
model Booking {
  id              String        @id @default(uuid())
  bookingRef      String        @unique @default(cuid())  // short human-readable ref
  userId          String
  hallId          String
  eventDate       DateTime      @db.Date
  startTime       String        // "HH:MM" 24h
  endTime         String        // "HH:MM" 24h
  guestCount      Int
  eventType       String        // Wedding | Birthday | Corporate | etc.
  specialRequests String?
  status          BookingStatus @default(PENDING)
  totalAmount     Decimal       @db.Decimal(10, 2)
  notes           String?       // admin notes
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  user            User          @relation(fields: [userId], references: [id])
  hall            Hall          @relation(fields: [hallId], references: [id])
  payments        Payment[]
  catering        BookingCatering?
  shifts          StaffShift[]
  @@map("bookings")
}

model BookingCatering {
  id               String          @id @default(uuid())
  bookingId        String          @unique
  packageId        String
  confirmedGuests  Int
  specialDietary   String?
  totalCateringCost Decimal        @db.Decimal(10, 2)
  finalisedAt      DateTime?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  booking          Booking         @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  package          CateringPackage @relation(fields: [packageId], references: [id])
  @@map("booking_caterings")
}
```

### Booking status lifecycle

```
PENDING → CONFIRMED    (admin records full payment, or admin manually confirms)
PENDING → CANCELLED    (customer or admin cancels)
CONFIRMED → IN_PROGRESS (staff checks in on event day)
CONFIRMED → CANCELLED  (admin cancels)
IN_PROGRESS → COMPLETED (event ends)
```

### API endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | /api/bookings | Any auth | creates booking + optional catering |
| GET | /api/bookings | Any auth | role-filtered, paginated |
| GET | /api/bookings/:id | Any auth | owner or admin/staff only |
| PATCH | /api/bookings/:id/status | ADMIN, STAFF | update status + optional notes |
| PATCH | /api/bookings/:id/cancel | Any auth | owner or admin only |
| PATCH | /api/bookings/:id/catering | ADMIN | upsert catering on existing booking |

### Conflict detection logic

```js
// Time overlap: any of these three conditions means conflict
startTime: { lte: newStart }, endTime: { gt: newStart }   // existing starts before, ends after new start
startTime: { lt: newEnd },   endTime: { gte: newEnd }     // existing starts before new end, ends after
startTime: { gte: newStart }, endTime: { lte: newEnd }    // existing fully inside new slot
```

### Total amount calculation

```
hours = (endTime - startTime) in decimal hours
hallCost = hall.pricePerHour × hours
cateringCost = pkg.pricePerHead × catering.guestCount  (if catering added)
totalAmount = hallCost + cateringCost
```

---

## 3. Tasks

- [x] Add Booking, BookingCatering models + BookingStatus enum to `prisma/schema.prisma`
- [x] Run `prisma db push`
- [x] Implement `createBooking` — conflict check + blocked date check + catering nested create
- [x] Implement `getBookings` — role-filtered query with pagination
- [x] Implement `getBooking` — ownership check + full includes
- [x] Implement `updateBookingStatus` — ADMIN/STAFF only
- [x] Implement `cancelBooking` — owner or ADMIN, guard against completed/already-cancelled
- [x] Implement `updateCatering` — upsert BookingCatering, recalculate totalAmount
- [x] Create `src/routes/booking.routes.js` — all 6 routes
- [x] Mount `/api/bookings` in `src/index.js`
- [x] Update this spec to reflect what was built

---

## 4. Change log

| Date | Change |
|---|---|
| Apr 2026 | Initial spec — built from working code |
