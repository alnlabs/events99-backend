# Events99 Backend API

The backend API for Events99, a comprehensive event and hall management system. Built with **Node.js**, **Express**, and **Prisma ORM**, deployed as a serverless application on **Netlify Functions**.

---

## 🚀 Features

- **Authentication**: JWT-based authentication with role-based access control (Admin, Customer, Staff)
- **Hall Management**: Manage event spaces, capacity, pricing, and amenities
- **Booking System**: Handle event bookings with full status lifecycle tracking
- **Catering Services**: Integrated catering package management and booking
- **Staff Management**: Assign and track staff shifts for events
- **Payment Tracking**: Record and monitor offline payment status
- **Dashboard**: Reporting and analytics for administrators and staff
- **Serverless Ready**: Optimized for Netlify Functions via `serverless-http`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20, ES Modules |
| Framework | Express.js |
| Database | PostgreSQL via Supabase (Prisma ORM) |
| Deployment | Netlify Functions |
| Auth | JWT + BcryptJS |
| Security | Helmet, Rate Limiting |
| Email | Nodemailer (SMTP) |
| Logging | Morgan |

---

## 📁 Project Structure

```
events99-backend/
├── CLAUDE.md                    ← AI steering doc — read by Claude Code every session
├── specs/                       ← Spec-driven development specs (see section below)
│   ├── TEMPLATE.md              ← Template for new feature specs
│   ├── phase-1-auth/
│   │   └── spec.md
│   ├── phase-2-halls/
│   │   └── spec.md
│   ├── phase-3-bookings/
│   │   └── spec.md
│   ├── phase-4-catering/
│   │   └── spec.md
│   ├── phase-5-payments/
│   │   └── spec.md
│   ├── phase-6-staff/
│   │   └── spec.md
│   ├── phase-7-users/
│   │   └── spec.md
│   └── phase-8-dashboard/
│       └── spec.md
├── netlify/
│   └── functions/
│       └── api.js               ← Serverless entry — wraps Express with serverless-http
├── prisma/
│   ├── schema.prisma            ← Database schema (9 models, 5 enums)
│   └── seed.js                  ← Demo data seed script
├── src/
│   ├── controllers/             ← Business logic — one file per domain
│   ├── middleware/              ← authenticate() + authorise(...roles)
│   ├── routes/                  ← Route definitions — one file per domain
│   ├── utils/
│   │   └── prisma.js            ← Prisma singleton — never instantiate elsewhere
│   └── index.js                 ← App setup, middleware stack, route mounting
├── public/
│   └── index.html               ← Netlify publish dir placeholder
├── netlify.toml                 ← Netlify build + function routing config
└── package.json
```

---

## 🧠 Spec-Driven Development (SDD)

This project uses **spec-anchored development** — every feature has a living spec that drives implementation and stays in sync with the code as the project evolves.

### What is SDD?

Rather than jumping straight into code, each feature starts with a spec written in plain Markdown. The spec defines **what** to build, **how** to build it, and a **task checklist** to work through. After building, the spec is updated to reflect what was actually built — it is never deleted.

```
Write spec → Review spec → Implement → Mark tasks done → Update spec
     ↑                                                          |
     └──────────────────────────────────────────────────────────┘
                    (living feedback loop)
```

This approach is based on [spec-driven development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) at the **spec-anchored** level — specs survive beyond the initial build and evolve with the feature.

### How Claude Code uses these specs

`CLAUDE.md` in the repo root is automatically read by Claude Code at the start of every session. It tells Claude the project context, architecture rules, constraints, and where to find specs. You never need to re-explain the project.

```bash
# Start Claude Code in this repo
claude

# Claude reads CLAUDE.md automatically, then you say:
"Read specs/phase-3-bookings/spec.md and implement the remaining tasks"
```

### Spec structure — every spec has 4 sections

```markdown
## 1. Requirements   ← User stories + GIVEN/WHEN/THEN acceptance criteria
## 2. Design         ← Data model changes, API endpoints, logic decisions
## 3. Tasks          ← Ordered checklist — mark [x] as you complete each
## 4. Change log     ← What changed and when
```

### Working on an existing feature

```bash
# 1. Open the relevant spec
cat specs/phase-3-bookings/spec.md

# 2. Tell Claude Code to read it and continue
"Read specs/phase-3-bookings/spec.md and implement the unchecked tasks"

# 3. As tasks complete, Claude marks them [x] in the spec
# 4. If anything changes from the plan, update the spec before the code
```

### Adding a new feature

```bash
# 1. Copy the template
cp specs/TEMPLATE.md specs/phase-9-notifications/spec.md

# 2. Fill in Requirements, Design, Tasks
# 3. Review the spec — make sure it is correct before building
# 4. Tell Claude Code to implement it
"Read specs/phase-9-notifications/spec.md and implement it"
```

### Spec template quick reference

```markdown
# Spec: [Feature Name]
> Phase: X | Status: [ ] Draft | Files affected: src/controllers/X.js

## 1. Requirements
- User stories (As a ... I want ... so that ...)
- Acceptance criteria (GIVEN / WHEN / THEN)

## 2. Design
- Data model changes (Prisma schema additions)
- API endpoints table (Method | Path | Auth | Notes)
- Logic notes (edge cases, decisions)

## 3. Tasks
- [ ] Step 1
- [ ] Step 2
- [ ] Update this spec to reflect what was built

## 4. Change log
| Date | Change |
```

### SDD rules

| Rule | Why |
|---|---|
| Write the spec before writing code | Forces clear thinking before implementation |
| Update the spec when the implementation differs | Keeps spec and code in sync |
| Never delete a spec | Specs are the living history of the feature |
| Mark tasks `[x]` as you go | Shows progress, prevents re-doing finished work |
| Update `CLAUDE.md` if architecture changes | Keeps AI steering accurate |

---

## ⚙️ Development Setup

### Prerequisites

- Node.js v20+
- PostgreSQL database (Supabase recommended)

### Installation

```bash
# 1. Clone and install
git clone <repository-url>
cd events99-backend
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, FRONTEND_URL
```

### Environment variables

```env
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
JWT_SECRET="your-random-secret-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5500
NODE_ENV=development
FRONTEND_URL=http://localhost:5300
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="EVENTS99 <your@gmail.com>"
```

### Database setup

```bash
npm run build        # Generate Prisma client
npm run db:push      # Push schema to Supabase
npm run db:seed      # Seed demo data (3 halls, 3 catering packages, 3 users)
```

### Run locally

```bash
npm run dev
# API available at http://localhost:5500/api
# Health check: http://localhost:5500/api/health
```

---

## 📡 API Endpoints

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Group | Base path | Auth |
|---|---|---|
| Auth | `/api/auth` | Public / Any |
| Halls | `/api/halls` | Public / Admin |
| Bookings | `/api/bookings` | Any auth |
| Catering | `/api/catering` | Public / Admin |
| Payments | `/api/payments` | Admin / Staff |
| Staff | `/api/staff` | Admin / Staff |
| Dashboard | `/api/dashboard` | Admin / Staff / Any auth |
| Users | `/api/users` | Admin only |

See `CLAUDE.md` for the full endpoint table with methods, paths, auth requirements, and controller functions.

---

## 🚀 Deployment (Netlify)

1. Connect the repo to Netlify
2. Set all environment variables in the Netlify dashboard
3. Build settings are handled by `netlify.toml`:
   - **Build command:** `npm run build` (runs `prisma generate`)
   - **Publish dir:** `public`
   - **Functions dir:** `netlify/functions`
4. All `/api/*` requests route to the serverless function automatically

### Important: Prisma binary targets

`prisma/schema.prisma` includes the Netlify Linux binary targets — do not remove them:

```prisma
binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-3.0.x"]
```

---

## 🧪 Demo accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@fhbs.com | admin123 |
| Staff | staff@fhbs.com | staff123 |
| Customer | customer@fhbs.com | customer123 |

---

## 📜 npm scripts

```bash
npm run dev          # Start local dev server (nodemon, port 5500)
npm run start        # Start without hot reload
npm run build        # prisma generate (required before deploy)
npm run db:push      # Sync schema to database
npm run db:migrate   # Create migration files
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:seed      # Seed demo data
```

---

Built with ❤️ by ALN Labs.
