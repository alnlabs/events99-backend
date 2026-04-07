# Spec: User Management (Admin)

> **Phase:** 7 — Users
> **Status:** [x] Built
> **Files affected:** `src/controllers/user.controller.js`, `src/routes/user.routes.js`

---

## 1. Requirements

### User stories

- As an admin, I want to list all users with optional role and search filters so that I can manage the user base.
- As an admin, I want to create any user (ADMIN, STAFF, or CUSTOMER) with a password so that I can onboard team members.
- As an admin, I want to update a user's name, phone, role, or isActive status so that I can manage access.
- As an admin, I want to reset a user's password so that locked-out users can regain access.

### Acceptance criteria

```
GIVEN GET /api/users by ADMIN with optional ?role and ?search
THEN users returned with booking count, ordered by createdAt desc
     search matches name or email case-insensitively

GIVEN POST /api/users by ADMIN with { name, email, password, phone?, role }
WHEN email does not already exist
THEN user created, password hashed at 12 rounds, returned without password

GIVEN POST /api/users with an existing email
THEN 400 { success: false, message: "Email already exists" }

GIVEN PATCH /api/users/:id by ADMIN with { name?, phone?, role?, isActive? }
THEN only provided fields updated, returned without password

GIVEN PATCH /api/users/:id/reset-password by ADMIN with { newPassword }
THEN password hashed and updated, 200 { success: true, message: "Password reset successfully" }

ALL routes require ADMIN role — non-admins receive 403
```

---

## 2. Design

### API endpoints

All routes: `router.use(authenticate, authorise('ADMIN'))`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /api/users | ADMIN | ?role, ?search filters |
| POST | /api/users | ADMIN | create any role user |
| PATCH | /api/users/:id | ADMIN | update fields |
| PATCH | /api/users/:id/reset-password | ADMIN | force password reset |

### Logic notes

- `getUsers` includes `_count: { select: { bookings: true } }` for display
- `createUser` re-uses bcrypt hash at 12 rounds (same as auth.controller)
- Email cannot be changed via `updateUser` — only name, phone, role, isActive
- Password never returned in any response (selected fields only via Prisma `select`)

---

## 3. Tasks

- [x] Implement `getUsers` with role + search filter
- [x] Implement `createUser` with duplicate email check
- [x] Implement `updateUser`
- [x] Implement `resetUserPassword`
- [x] Create `src/routes/user.routes.js` with blanket ADMIN guard
- [x] Mount `/api/users` in `src/index.js`
- [x] Update this spec

---

## 4. Change log

| Date | Change |
|---|---|
| Apr 2026 | Initial spec — built from working code |
