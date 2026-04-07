# Spec: Staff Shifts & Scheduling

> **Phase:** 6 — Staff
> **Status:** [x] Built
> **Files affected:** `src/controllers/staff.controller.js`, `src/routes/staff.routes.js`, `prisma/schema.prisma`

---

## 1. Requirements

### User stories

- As an admin, I want to assign a staff member to a booking with a role, date, and time so that the event is staffed.
- As the system, I want to detect shift conflicts for the same staff member so that no one is double-booked.
- As any auth user, I want to list shifts (role-filtered) so that staff see only their own, admins see all.
- As a staff member or admin, I want to update a shift's status so that check-in/out is tracked.
- As an admin, I want to delete a shift so that incorrect assignments can be removed.
- As an admin, I want to get the list of all staff users so that I can pick who to assign.

### Acceptance criteria

```
GIVEN POST /api/staff/shifts by ADMIN with { bookingId, userId, role, shiftDate, startTime, endTime }
WHEN no other ACTIVE shift (status NOT IN ['ABSENT']) overlaps for same userId on same shiftDate
THEN shift created with status=ASSIGNED

GIVEN POST /api/staff/shifts and the same staff member has an overlapping shift
THEN 409 { success: false, message: "Staff member has a conflicting shift" }

GIVEN GET /api/staff/shifts by STAFF role user
THEN only shifts where userId = req.user.id are returned

GIVEN GET /api/staff/shifts by ADMIN with ?userId, ?bookingId, ?from, ?to filters
THEN filtered shifts returned, ordered by shiftDate asc, startTime asc

GIVEN PATCH /api/staff/shifts/:id/status with { status: "CHECKED_IN" }
WHEN requester is the shift owner or ADMIN
THEN status updated, checkedInAt set to now()

GIVEN PATCH /api/staff/shifts/:id/status with { status: "COMPLETED" }
THEN status updated, checkedOutAt set to now()

GIVEN PATCH /api/staff/shifts/:id/status by a user who is neither owner nor ADMIN
THEN 403 { success: false, message: "Access denied" }

GIVEN DELETE /api/staff/shifts/:id by ADMIN
THEN shift hard-deleted

GIVEN GET /api/staff/list by ADMIN
THEN all users with role IN ['STAFF', 'ADMIN'] where isActive=true, ordered by name
```

---

## 2. Design

### Data model

```prisma
model StaffShift {
  id           String      @id @default(uuid())
  bookingId    String
  userId       String
  role         String      // "Event Coordinator" | "Catering Lead" | "AV Technician" | "Security" | "Cleaning" | "Waitstaff" | "Other"
  shiftDate    DateTime    @db.Date
  startTime    String      // "HH:MM"
  endTime      String      // "HH:MM"
  status       ShiftStatus @default(ASSIGNED)
  checkedInAt  DateTime?
  checkedOutAt DateTime?
  notes        String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  booking      Booking     @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  user         User        @relation(fields: [userId], references: [id])
  @@map("staff_shifts")
}

enum ShiftStatus { ASSIGNED CONFIRMED CHECKED_IN COMPLETED ABSENT }
```

### Shift lifecycle

```
ASSIGNED → CONFIRMED   (staff acknowledges shift)
CONFIRMED → CHECKED_IN (staff arrives, checkedInAt = now)
CHECKED_IN → COMPLETED (shift ends, checkedOutAt = now)
Any → ABSENT           (staff no-shows)
```

### API endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /api/staff/list | ADMIN | all active staff users |
| POST | /api/staff/shifts | ADMIN | assign with conflict check |
| GET | /api/staff/shifts | Any auth | role-filtered |
| PATCH | /api/staff/shifts/:id/status | Any auth | owner or admin |
| DELETE | /api/staff/shifts/:id | ADMIN | hard delete |

### Conflict detection

```js
// Conflict = same userId, same shiftDate, status not ABSENT, time overlaps
OR: [
  { startTime: { lte: startTime }, endTime: { gt: startTime } },
  { startTime: { lt: endTime },    endTime: { gte: endTime } },
]
```

---

## 3. Tasks

- [x] Add StaffShift model + ShiftStatus enum to schema
- [x] Run `prisma db push`
- [x] Implement `assignShift` with conflict detection
- [x] Implement `getShifts` with role-based filtering
- [x] Implement `updateShiftStatus` with ownership check + timestamp auto-set
- [x] Implement `deleteShift`
- [x] Implement `getStaffList`
- [x] Create `src/routes/staff.routes.js`
- [x] Mount `/api/staff` in `src/index.js`
- [x] Update this spec

---

## 4. Change log

| Date | Change |
|---|---|
| Apr 2026 | Initial spec — built from working code |
