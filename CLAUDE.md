# CLAUDE.md — events99-backend

> Claude Code reads this file automatically at the start of every session.
> This is the steering document for the entire backend repo.

---

## Project overview

**events99-backend** is the REST API for Events99, a function hall booking platform. It is built with Express.js and deployed as a **Netlify Serverless Function** — the entire Express app is wrapped by `serverless-http` and exposed via a single Lambda-style handler at `/.netlify/functions/api`.

- **Live URL:** `https://strong-praline-a22cb2.netlify.app`
- **Database:** PostgreSQL via Supabase (ap-southeast-2), ORM: Prisma 5
- **Auth:** JWT Bearer tokens (7d expiry), bcryptjs password hashing
- **Node:** 20.x, ES Modules (`"type": "module"` in package.json)

---

## How to work in this repo

### SDD workflow — follow this every session

```
1. Read CLAUDE.md (this file) — understand the project
2. Read the relevant spec in specs/<phase>/ — understand the feature
3. Implement following the spec tasks top to bottom
4. Mark tasks [x] as completed
5. Update the spec if implementation differs from the plan
6. Never delete a spec — specs are living documents
```

### Starting a new feature

```
1. Create specs/<phase-name>/spec.md from the template at specs/TEMPLATE.md
2. Fill in requirements, design decisions, and tasks
3. Review the spec before writing any code
4. Begin implementation only after spec is reviewed
```

### Asking clarifying questions

Before implementing anything ambiguous, ask. Present options as a numbered list. Do not guess and move forward.

---

## Architecture rules — never violate these

```
netlify/functions/api.js     → Serverless wrapper only. Never add business logic here.
src/index.js                 → App setup, middleware, route mounting, export only.
src/controllers/<domain>.js  → All business logic lives here. One file per domain.
src/routes/<domain>.js       → Route definitions only. Import from matching controller.
src/middleware/auth.js        → Only authenticate() and authorise(...roles).
src/utils/prisma.js          → Prisma singleton. Never call new PrismaClient() elsewhere.
prisma/schema.prisma         → Update spec before updating schema.
```

### Middleware order in src/index.js (must stay in this order)

```
helmet → compression → morgan → cors → json → urlencoded → rateLimit → routes
```

### Response shape — always this format

```js
// Success
res.json({ success: true, <data_key>: data })

// Error
res.status(4xx|5xx).json({ success: false, message: 'Human readable error' })
```

### Controller pattern — every controller function must follow this

```js
export const myHandler = async (req, res) => {
  try {
    // business logic using prisma singleton
    res.json({ success: true, result })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
```

### Auth pattern — every protected route uses this

```js
router.post('/', authenticate, authorise('ADMIN'), handler)  // admin only
router.get('/', authenticate, handler)                        // any logged in user
router.get('/public', handler)                               // no auth needed
```

---

## Tech stack and dependencies

| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.18.2 | HTTP framework |
| `serverless-http` | ^4.0.0 | Wraps Express for Netlify Functions |
| `@prisma/client` | ^5.10.0 | Database ORM |
| `jsonwebtoken` | ^9.0.2 | JWT sign/verify |
| `bcryptjs` | ^2.4.3 | Password hashing (12 rounds) |
| `cors` | ^2.8.5 | Cross-origin headers |
| `helmet` | ^7.1.0 | Security headers |
| `morgan` | ^1.10.0 | HTTP request logging |
| `compression` | ^1.7.4 | Gzip responses |
| `express-rate-limit` | ^7.2.0 | 200 req/15min per IP |
| `nodemailer` | ^6.9.9 | Email (SMTP) |
| `dotenv` | ^16.4.1 | Environment variables |

### Dev dependencies

| Package | Purpose |
|---|---|
| `nodemon` | Auto-restart in dev |
| `prisma` | Schema CLI, migrations |

---

## Environment variables (required)

```env
DATABASE_URL     # Supabase pooled connection (PgBouncer port 6543)
DIRECT_URL       # Supabase direct connection (migrations, port 5432)
JWT_SECRET       # Min 32 chars random string
JWT_EXPIRES_IN   # "7d"
PORT             # 5500 (local dev)
NODE_ENV         # "development" | "production"
FRONTEND_URL     # "https://events99.netlify.app"
SMTP_HOST        # smtp.gmail.com
SMTP_PORT        # 587
SMTP_USER        # Gmail address
SMTP_PASS        # Gmail app password
EMAIL_FROM       # "EVENTS99 <you@gmail.com>"
```

---

## Database schema summary

9 models in `prisma/schema.prisma`:

| Model | Table | Key relations |
|---|---|---|
| `User` | `users` | → Booking[], Payment[], StaffShift[] |
| `Hall` | `halls` | → Booking[], PricingRule[] |
| `CateringPackage` | `catering_packages` | → BookingCatering[] |
| `Booking` | `bookings` | → User, Hall, Payment[], BookingCatering?, StaffShift[] |
| `BookingCatering` | `booking_caterings` | → Booking, CateringPackage |
| `Payment` | `payments` | → Booking, User |
| `StaffShift` | `staff_shifts` | → Booking, User |
| `PricingRule` | `pricing_rules` | → Hall |
| `BlockedDate` | `blocked_dates` | — |

**Enums:** `Role` (ADMIN, CUSTOMER, STAFF) · `BookingStatus` (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED) · `PaymentStatus` (UNPAID, PARTIALLY_PAID, PAID) · `PaymentMethod` (CASH, BANK_TRANSFER, CHEQUE, OTHER) · `ShiftStatus` (ASSIGNED, CONFIRMED, CHECKED_IN, COMPLETED, ABSENT)

---

## API surface — all routes

| Method | Route | Auth | Controller function |
|---|---|---|---|
| POST | /api/auth/register | Public | `register` |
| POST | /api/auth/login | Public | `login` |
| GET | /api/auth/me | Any | `getMe` |
| PATCH | /api/auth/profile | Any | `updateProfile` |
| PATCH | /api/auth/change-password | Any | `changePassword` |
| GET | /api/halls | Public | `getAllHalls` |
| GET | /api/halls/:id | Public | `getHall` |
| GET | /api/halls/:id/availability | Public | `getHallAvailability` |
| POST | /api/halls | ADMIN | `createHall` |
| PATCH | /api/halls/:id | ADMIN | `updateHall` |
| DELETE | /api/halls/:id | ADMIN | `deleteHall` |
| POST | /api/halls/:id/pricing-rules | ADMIN | `addPricingRule` |
| DELETE | /api/halls/:id/pricing-rules/:ruleId | ADMIN | `deletePricingRule` |
| POST | /api/halls/blocked-dates | ADMIN | `blockDate` |
| POST | /api/bookings | Any auth | `createBooking` |
| GET | /api/bookings | Any auth | `getBookings` |
| GET | /api/bookings/:id | Any auth | `getBooking` |
| PATCH | /api/bookings/:id/status | ADMIN, STAFF | `updateBookingStatus` |
| PATCH | /api/bookings/:id/cancel | Any auth | `cancelBooking` |
| PATCH | /api/bookings/:id/catering | ADMIN | `updateCatering` |
| POST | /api/payments | ADMIN, STAFF | `recordPayment` |
| GET | /api/payments | ADMIN | `getAllPayments` |
| GET | /api/payments/booking/:bookingId | Any auth | `getBookingPayments` |
| DELETE | /api/payments/:id | ADMIN | `deletePayment` |
| GET | /api/catering | Public | `getPackages` |
| GET | /api/catering/all | ADMIN | `getAllPackages` |
| POST | /api/catering | ADMIN | `createPackage` |
| PATCH | /api/catering/:id | ADMIN | `updatePackage` |
| DELETE | /api/catering/:id | ADMIN | `deletePackage` |
| GET | /api/staff/list | ADMIN | `getStaffList` |
| POST | /api/staff/shifts | ADMIN | `assignShift` |
| GET | /api/staff/shifts | Any auth | `getShifts` |
| PATCH | /api/staff/shifts/:id/status | Any auth | `updateShiftStatus` |
| DELETE | /api/staff/shifts/:id | ADMIN | `deleteShift` |
| GET | /api/dashboard/admin | ADMIN, STAFF | `getAdminStats` |
| GET | /api/dashboard/revenue | ADMIN | `getRevenueReport` |
| GET | /api/dashboard/customer | Any auth | `getCustomerStats` |
| GET | /api/users | ADMIN | `getUsers` |
| POST | /api/users | ADMIN | `createUser` |
| PATCH | /api/users/:id | ADMIN | `updateUser` |
| PATCH | /api/users/:id/reset-password | ADMIN | `resetUserPassword` |
| GET | /api/health | Public | inline |

---

## npm scripts

```bash
npm run dev          # nodemon src/index.js — local dev server on port 5500
npm run start        # node src/index.js — production start (not used on Netlify)
npm run build        # prisma generate — runs on every Netlify deploy
npm run db:push      # prisma db push — sync schema to Supabase (no migration file)
npm run db:migrate   # prisma migrate dev — create migration files
npm run db:studio    # prisma studio — visual DB browser
npm run db:seed      # node prisma/seed.js — seed demo data
```

---

## Specs index

Each phase has a spec file. Read the relevant spec before working on that phase.

| Phase | Spec file | Feature | Status |
|---|---|---|---|
| 1 | specs/phase-1-auth/spec.md | Authentication & user identity | ✅ Built |
| 2 | specs/phase-2-halls/spec.md | Hall management & availability | ✅ Built |
| 3 | specs/phase-3-bookings/spec.md | Booking creation & lifecycle | ✅ Built |
| 4 | specs/phase-4-catering/spec.md | Catering packages & menu | ✅ Built |
| 5 | specs/phase-5-payments/spec.md | Offline payment recording | ✅ Built |
| 6 | specs/phase-6-staff/spec.md | Staff shifts & scheduling | ✅ Built |
| 7 | specs/phase-7-users/spec.md | User management (admin) | ✅ Built |
| 8 | specs/phase-8-dashboard/spec.md | Dashboard & reporting | ✅ Built |

---

## Deployment checklist

Before deploying to Netlify:
- [ ] All env vars set in Netlify dashboard
- [ ] `prisma generate` runs via `npm run build`
- [ ] `binaryTargets` in schema includes `rhel-openssl-3.0.x`
- [ ] CORS origins include deployed frontend URL
- [ ] `NODE_ENV=production` in Netlify env vars
