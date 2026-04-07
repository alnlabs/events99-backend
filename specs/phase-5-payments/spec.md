# Spec: Offline Payment Recording

> **Phase:** 5 — Payments
> **Status:** [x] Built
> **Files affected:** `src/controllers/payment.controller.js`, `src/routes/payment.routes.js`, `prisma/schema.prisma`

---

## 1. Requirements

### User stories

- As an admin or staff, I want to record an offline payment against a booking so that the payment history is tracked.
- As the system, I want to auto-calculate payment status (UNPAID/PARTIALLY_PAID/PAID) based on total paid vs booking total so that status is always accurate.
- As the system, I want to auto-confirm a booking when full payment is recorded so that confirmed status reflects payment.
- As any auth user, I want to view all payments for a specific booking so that payment history is visible.
- As an admin, I want to list all payments with filters so that I can report on collections.
- As an admin, I want to delete a payment record (correction) so that mistakes can be fixed.

### Acceptance criteria

```
GIVEN POST /api/payments by ADMIN or STAFF with { bookingId, amount, method, referenceNo?, notes? }
WHEN booking exists
THEN payment is created, paymentStatus calculated as:
     totalPaid >= booking.totalAmount  → PAID
     totalPaid > 0                     → PARTIALLY_PAID
     totalPaid = 0                     → UNPAID

GIVEN the new paymentStatus = PAID and booking.status = PENDING
THEN booking.status is auto-updated to CONFIRMED

GIVEN GET /api/payments/booking/:bookingId by any auth user
THEN all payments for that booking returned + totalPaid sum

GIVEN GET /api/payments by ADMIN with optional ?method, ?status, ?from, ?to, ?page, ?limit
THEN paginated list with totalAmount aggregate

GIVEN DELETE /api/payments/:id by ADMIN
THEN payment record is hard-deleted
```

---

## 2. Design

### Data model

```prisma
model Payment {
  id          String        @id @default(uuid())
  bookingId   String
  userId      String        // who recorded it
  amount      Decimal       @db.Decimal(10, 2)
  method      PaymentMethod // CASH | BANK_TRANSFER | CHEQUE | OTHER
  status      PaymentStatus @default(UNPAID)
  referenceNo String?       // cheque number or bank ref
  notes       String?
  receivedAt  DateTime?     // when payment was physically received
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  booking     Booking       @relation(fields: [bookingId], references: [id])
  user        User          @relation(fields: [userId], references: [id])
  @@map("payments")
}
```

### API endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | /api/payments | ADMIN, STAFF | record payment + auto-status |
| GET | /api/payments | ADMIN | all payments, filterable |
| GET | /api/payments/booking/:bookingId | Any auth | payments for one booking |
| DELETE | /api/payments/:id | ADMIN | hard delete |

### Payment status calculation

```js
const totalPaid = existing_payments.sum + new_amount
const paymentStatus =
  totalPaid >= booking.totalAmount ? 'PAID' :
  totalPaid > 0                    ? 'PARTIALLY_PAID' : 'UNPAID'
```

### Auto-confirm logic

```js
if (paymentStatus === 'PAID' && booking.status === 'PENDING') {
  await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } })
}
```

---

## 3. Tasks

- [x] Add Payment model + PaymentStatus + PaymentMethod enums to schema
- [x] Run `prisma db push`
- [x] Implement `recordPayment` with status calculation and auto-confirm
- [x] Implement `getBookingPayments` with totalPaid sum
- [x] Implement `getAllPayments` with filters, pagination, aggregate
- [x] Implement `deletePayment`
- [x] Create `src/routes/payment.routes.js`
- [x] Mount `/api/payments` in `src/index.js`
- [x] Update this spec

---

## 4. Change log

| Date | Change |
|---|---|
| Apr 2026 | Initial spec — built from working code |
