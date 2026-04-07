# Spec: Hall Management & Availability

> **Phase:** 2 — Halls
> **Status:** [x] Built
> **Files affected:** `src/controllers/hall.controller.js`, `src/routes/hall.routes.js`, `prisma/schema.prisma`

---

## 1. Requirements

### User stories

- As a public visitor, I want to list all active halls so that I can browse available venues.
- As a public visitor, I want to view a single hall's details including pricing rules so that I know costs and amenities.
- As a public visitor, I want to check a hall's availability for a specific date so that I know if it is free.
- As an admin, I want to create a new hall so that it becomes available for booking.
- As an admin, I want to edit a hall's details so that pricing and amenities stay accurate.
- As an admin, I want to deactivate a hall (not delete) so that it stops appearing to customers.
- As an admin, I want to add and remove pricing rules per hall so that I can configure peak/off-peak pricing.
- As an admin, I want to block specific dates per hall (or all halls) so that the calendar reflects maintenance or closures.

### Acceptance criteria

```
GIVEN GET /api/halls?active=true
THEN only halls where isActive=true are returned, ordered by name

GIVEN GET /api/halls/:id
WHEN the hall exists
THEN response includes hall detail, pricingRules[], and _count.bookings

GIVEN GET /api/halls/:id/availability?date=YYYY-MM-DD
WHEN the date is blocked (any BlockedDate matching hallId or hallId=null)
THEN { isBlocked: true, blockedReason, bookings: [] }

GIVEN GET /api/halls/:id/availability?date=YYYY-MM-DD
WHEN date is not blocked and has existing bookings
THEN { isBlocked: false, bookings: [{ startTime, endTime, status }] } (CANCELLED excluded)

GIVEN POST /api/halls by ADMIN with valid body
THEN hall is created and returned with 201

GIVEN PATCH /api/halls/:id by ADMIN
THEN hall fields are updated

GIVEN DELETE /api/halls/:id by ADMIN
THEN hall.isActive is set to false (soft delete only, never hard delete)

GIVEN POST /api/halls/:id/pricing-rules by ADMIN
THEN a new PricingRule is created linked to the hall

GIVEN DELETE /api/halls/:id/pricing-rules/:ruleId by ADMIN
THEN the PricingRule is hard-deleted

GIVEN POST /api/halls/blocked-dates by ADMIN with { hallId?: string, date, reason? }
THEN a BlockedDate record is created (hallId=null means all halls)
```

---

## 2. Design

### Data model

```prisma
model Hall {
  id           String   @id @default(uuid())
  name         String
  description  String?
  capacityMin  Int
  capacityMax  Int
  pricePerHour Decimal  @db.Decimal(10, 2)
  pricePerDay  Decimal? @db.Decimal(10, 2)
  amenities    String[]
  images       String[]
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  bookings     Booking[]
  pricingRules PricingRule[]
  @@map("halls")
}

model PricingRule {
  id            String    @id @default(uuid())
  hallId        String
  ruleType      String    // "peak" | "weekend" | "holiday" | "discount"
  dateFrom      DateTime? @db.Date
  dateTo        DateTime? @db.Date
  daysOfWeek    Int[]     // 0=Sun … 6=Sat
  multiplier    Decimal?  @db.Decimal(4, 2)
  fixedOverride Decimal?  @db.Decimal(10, 2)
  label         String?
  createdAt     DateTime  @default(now())
  hall          Hall      @relation(fields: [hallId], references: [id])
  @@map("pricing_rules")
}

model BlockedDate {
  id        String    @id @default(uuid())
  hallId    String?   // null = applies to ALL halls
  date      DateTime  @db.Date
  reason    String?
  createdAt DateTime  @default(now())
  @@map("blocked_dates")
}
```

### API endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /api/halls | Public | `?active=true` filter |
| GET | /api/halls/:id | Public | includes pricingRules, _count |
| GET | /api/halls/:id/availability | Public | `?date=YYYY-MM-DD` required |
| POST | /api/halls | ADMIN | create hall |
| PATCH | /api/halls/:id | ADMIN | update any fields |
| DELETE | /api/halls/:id | ADMIN | sets isActive=false |
| POST | /api/halls/:id/pricing-rules | ADMIN | add pricing rule |
| DELETE | /api/halls/:id/pricing-rules/:ruleId | ADMIN | hard delete rule |
| POST | /api/halls/blocked-dates | ADMIN | block a date |

### Logic notes

- Availability check queries `BlockedDate` with `OR: [{ hallId }, { hallId: null }]` to catch global blocks
- Bookings included in availability have status filtered: `notIn: ['CANCELLED']`
- `DELETE /api/halls/:id` is a soft-delete: `update({ data: { isActive: false } })` — no hard delete
- `getAllHalls` includes `_count: { select: { bookings: true } }` for admin display

---

## 3. Tasks

- [x] Add Hall, PricingRule, BlockedDate models to `prisma/schema.prisma`
- [x] Run `prisma db push`
- [x] Seed 3 halls in `prisma/seed.js` (Grand Ballroom, Crystal Room, Garden Terrace)
- [x] Create `src/controllers/hall.controller.js` — 9 functions
- [x] Create `src/routes/hall.routes.js` — wire all routes with correct auth guards
- [x] Mount `/api/halls` in `src/index.js`
- [x] Update this spec to reflect what was built

---

## 4. Change log

| Date | Change |
|---|---|
| Apr 2026 | Initial spec — built from working code |
