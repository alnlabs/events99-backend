# Spec: Authentication & User Identity

> **Phase:** 1 — Auth
> **Status:** [x] Built
> **Files affected:** `src/controllers/auth.controller.js`, `src/routes/auth.routes.js`, `src/middleware/auth.middleware.js`, `src/utils/prisma.js`, `prisma/schema.prisma`

---

## 1. Requirements

### User stories

- As a new visitor, I want to register with name/email/phone/password so that I get a customer account.
- As a registered user, I want to log in with email/password so that I receive a JWT token and can access protected routes.
- As a logged-in user, I want to fetch my own profile so that the frontend knows my role and details.
- As a logged-in user, I want to update my name and phone so that my profile stays current.
- As a logged-in user, I want to change my password so that I can maintain account security.
- As the system, I want to block inactive users from logging in so that deactivated accounts cannot access the API.

### Acceptance criteria

```
GIVEN a visitor POSTs /api/auth/register with valid name/email/password
WHEN the email does not already exist
THEN a new User is created with role=CUSTOMER, password bcrypt-hashed at 12 rounds,
     and the response includes { success: true, token, user } with password excluded

GIVEN a visitor POSTs /api/auth/register with an already-registered email
THEN response is 400 { success: false, message: "Email already registered" }

GIVEN a user POSTs /api/auth/login with correct email/password
WHEN the user exists and isActive=true
THEN response includes { success: true, token, user } with a signed JWT (7d expiry)

GIVEN a user POSTs /api/auth/login with wrong password or inactive account
THEN response is 401 { success: false, message: "Invalid credentials" }

GIVEN a request with Authorization: Bearer <valid-token>
WHEN authenticate middleware runs
THEN req.user is set to { id, email, name, role, isActive } and next() is called

GIVEN a request with no token or an expired/invalid token
THEN response is 401 { success: false, message: "No token provided" | "Invalid token" }

GIVEN a route protected by authorise('ADMIN')
WHEN a CUSTOMER-role user hits it
THEN response is 403 { success: false, message: "Access forbidden" }
```

---

## 2. Design

### Data model

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String                        // bcrypt hash, 12 rounds
  name      String
  phone     String?
  role      Role     @default(CUSTOMER)   // ADMIN | CUSTOMER | STAFF
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("users")
}
```

### API endpoints

| Method | Path | Auth | Request body | Response |
|---|---|---|---|---|
| POST | /api/auth/register | Public | `{ name, email, password, phone? }` | `{ success, token, user }` |
| POST | /api/auth/login | Public | `{ email, password }` | `{ success, token, user }` |
| GET | /api/auth/me | Any | — | `{ success, user }` |
| PATCH | /api/auth/profile | Any | `{ name, phone }` | `{ success, user }` |
| PATCH | /api/auth/change-password | Any | `{ currentPassword, newPassword }` | `{ success, message }` |

### Logic notes

- JWT signed with `process.env.JWT_SECRET`, expiry from `process.env.JWT_EXPIRES_IN` (default `"7d"`)
- `signToken(id)` is a private helper inside `auth.controller.js`
- Password excluded from all responses via destructuring: `const { password: _, ...userOut } = user`
- `authenticate` middleware imports prisma singleton from `utils/prisma.js` — never instantiates its own client
- `authorise(...roles)` is a factory that returns middleware — usage: `authorise('ADMIN', 'STAFF')`
- Prisma import pattern in controllers: `import * as prismaModule from '../utils/prisma.js'; const prisma = prismaModule.prisma || prismaModule.default || prismaModule`

---

## 3. Tasks

- [x] Create `src/utils/prisma.js` — export Prisma singleton
- [x] Create `src/middleware/auth.middleware.js` — `authenticate` + `authorise`
- [x] Create `src/controllers/auth.controller.js` — all 5 functions
- [x] Create `src/routes/auth.routes.js` — wire 5 routes
- [x] Mount `/api/auth` in `src/index.js`
- [x] Add `User` model + `Role` enum to `prisma/schema.prisma`
- [x] Run `prisma db push` to sync schema
- [x] Seed 3 demo users in `prisma/seed.js` (admin, staff, customer)
- [x] Update this spec to reflect what was built

---

## 4. Change log

| Date | Change |
|---|---|
| Apr 2026 | Initial spec — built from working code |
