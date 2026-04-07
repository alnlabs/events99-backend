# Spec: Catering Packages & Menu

> **Phase:** 4 — Catering
> **Status:** [x] Built
> **Files affected:** `src/controllers/catering.controller.js`, `src/routes/catering.routes.js`, `prisma/schema.prisma`

---

## 1. Requirements

### User stories

- As a public visitor, I want to browse active catering packages with per-head pricing and menu items so that I can choose before booking.
- As an admin, I want to see all packages including inactive ones so that I can manage the full catalogue.
- As an admin, I want to create a catering package with name, price per head, min guests, and menu items so that it is available for booking.
- As an admin, I want to update any package field so that pricing and menus stay current.
- As an admin, I want to deactivate a package (not hard delete) so that it no longer appears to customers.

### Acceptance criteria

```
GIVEN GET /api/catering (public)
THEN only packages where isActive=true returned, ordered by pricePerHead asc

GIVEN GET /api/catering/all by ADMIN
THEN all packages returned regardless of isActive

GIVEN POST /api/catering by ADMIN with { name, pricePerHead, minGuests, menuItems, description? }
THEN package created and returned with 201

GIVEN PATCH /api/catering/:id by ADMIN
THEN any provided fields updated

GIVEN DELETE /api/catering/:id by ADMIN
THEN package.isActive set to false (soft delete only)
```

---

## 2. Design

### Data model

```prisma
model CateringPackage {
  id               String   @id @default(uuid())
  name             String
  description      String?
  pricePerHead     Decimal  @db.Decimal(10, 2)
  minGuests        Int      @default(10)
  menuItems        Json     // [{ name: string, category: string, isVeg: boolean }]
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  bookingCaterings BookingCatering[]
  @@map("catering_packages")
}
```

### API endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /api/catering | Public | active only, sorted by price |
| GET | /api/catering/all | ADMIN | all packages |
| POST | /api/catering | ADMIN | create |
| PATCH | /api/catering/:id | ADMIN | update |
| DELETE | /api/catering/:id | ADMIN | soft deactivate |

### Seeded packages

| Name | Price/Head | Min Guests |
|---|---|---|
| Basic Package | $15 | 20 |
| Standard Package | $28 | 30 |
| Premium Package | $55 | 50 |

---

## 3. Tasks

- [x] Add CateringPackage model to schema, run `prisma db push`
- [x] Seed 3 packages in `prisma/seed.js`
- [x] Implement `getPackages`, `getAllPackages`, `createPackage`, `updatePackage`, `deletePackage`
- [x] Create `src/routes/catering.routes.js`
- [x] Mount `/api/catering` in `src/index.js`
- [x] Update this spec

---

## 4. Change log

| Date | Change |
|---|---|
| Apr 2026 | Initial spec — built from working code |
