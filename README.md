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

This project uses **spec-anchored development** powered by **[GitHub Spec Kit](https://github.com/github/spec-kit)** — an open source toolkit that turns natural language requirements into living specs that drive every implementation step, and stay in sync with code as the project evolves.

```
/speckit.constitution → /speckit.specify → /speckit.clarify
       → /speckit.plan → /speckit.analyze → /speckit.tasks → /speckit.implement
            ↑                                                         |
            └─────────────── update spec, loop for next feature ──────┘
```

The `CLAUDE.md` at the repo root is loaded automatically by Claude Code every session — it carries the full architecture context, constraints, and specs index so you never re-explain the project.

Existing phase specs live in `specs/`. For new features, spec-kit generates them from scratch.

---

### Step 0 — Install spec-kit (once per machine)

Spec-kit uses the `specify` CLI, installed via [`uv`](https://docs.astral.sh/uv/):

```bash
# Install uv if you don't have it
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install specify CLI (pin to latest stable release)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Verify
specify check
```

---

### Step 1 — Initialize spec-kit in this repo

Run this once to wire up the `/speckit.*` slash commands for Claude Code:

```bash
cd events99-backend

# Initialize for Claude Code
specify init . --ai claude
```

This creates a `.specify/` folder with memory, scripts, and templates. It does **not** touch any existing source code or the `specs/` folder.

Your directory will now include:

```
.specify/
├── memory/
│   └── constitution.md       ← Project governing principles
├── scripts/                  ← Spec-kit automation scripts
└── templates/                ← spec, plan, tasks templates
```

---

### Step 2 — Establish project principles (first time only)

Open Claude Code and run `/speckit.constitution` to create `.specify/memory/constitution.md` — the immutable rules every spec and implementation must follow:

```
/speckit.constitution Create principles for Events99 backend:
Node.js ES modules only. Prisma singleton pattern — never instantiate PrismaClient
outside utils/prisma.js. All controllers async/await with try/catch.
Response shape always { success: boolean, data | message }.
Netlify serverless deployment — no app.listen() in production.
JWT auth required on all non-public routes.
```

> **Tip:** Claude Code will reference this file in every subsequent session automatically via `CLAUDE.md`.

---

### Step 3 — Generate a spec for a new feature

Use `/speckit.specify` to describe what you want to build. Focus on **what and why**, not the tech stack:

```
/speckit.specify Add an email notification system to Events99 backend.
When a booking is confirmed, the customer receives a confirmation email.
When a booking is cancelled, the customer receives a cancellation email.
Admins receive a daily digest of the previous day's bookings at 8am.
```

Spec-kit creates a new branch (e.g. `009-email-notifications`) and generates:

```
.specify/specs/009-email-notifications/
└── spec.md        ← User stories + acceptance criteria (GIVEN/WHEN/THEN)
```

---

### Step 4 — Clarify the spec before planning

Run `/speckit.clarify` to surface gaps before writing any code:

```
/speckit.clarify
```

Claude Code will ask targeted questions about edge cases, error handling, and missing requirements. Answer them — they get recorded in the spec. Then validate the checklist:

```
Read the review and acceptance checklist in the spec and check off each item that passes.
```

---

### Step 5 — Create the technical plan

Use `/speckit.plan` to specify the tech stack and architecture for this feature:

```
/speckit.plan Use Nodemailer with SMTP (already configured in .env).
Add a notifications.controller.js and notifications.routes.js.
Store sent notification history in a new Notification model in Prisma.
Use a queue pattern — record notifications as PENDING then process them.
```

Spec-kit generates:

```
.specify/specs/009-email-notifications/
├── spec.md
├── plan.md          ← Architecture decisions, data model changes, API design
├── data-model.md    ← Prisma schema additions
└── research.md      ← Tech stack notes
```

Cross-check the plan against `CLAUDE.md` architecture rules before proceeding.

---

### Step 6 — Analyze for gaps (optional but recommended)

Run `/speckit.analyze` after plan, before tasks — catches consistency issues between spec and plan:

```
/speckit.analyze
```

---

### Step 7 — Break down into tasks

```
/speckit.tasks
```

Generates `tasks.md` with ordered, dependency-aware tasks. Tasks marked `[P]` can run in parallel:

```
.specify/specs/009-email-notifications/
├── spec.md
├── plan.md
├── data-model.md
├── research.md
└── tasks.md         ← Ordered implementation checklist with file paths
```

---

### Step 8 — Implement

```
/speckit.implement
```

Claude Code reads the constitution, spec, plan, and tasks — then executes all tasks in order. It validates prerequisites before starting.

After implementation, copy the completed spec into this repo's `specs/` folder to keep it alongside the code:

```bash
cp -r .specify/specs/009-email-notifications specs/phase-9-notifications
```

Then mark it `[x] Built` in the status line and update the specs index in `CLAUDE.md`.

---

### Working on existing specs (no spec-kit needed)

For features already in `specs/`, work directly with Claude Code using plain prompts — no `specify` CLI needed:

```bash
claude

# Claude reads CLAUDE.md automatically, then:
"Read specs/phase-3-bookings/spec.md and implement the unchecked tasks"

# After changes that differ from the plan:
"Update specs/phase-3-bookings/spec.md to reflect what was built"
```

---

### Spec structure reference

Every spec in `specs/` follows this 4-section format:

```markdown
# Spec: [Feature Name]
> Phase: X | Status: [ ] Draft / [x] Built | Files: src/controllers/X.js

## 1. Requirements
- As a [role], I want [action] so that [outcome]
- GIVEN ... WHEN ... THEN ...

## 2. Design
- Data model (Prisma schema changes)
- API endpoints table (Method | Path | Auth | Notes)
- Logic notes (edge cases, decisions made)

## 3. Tasks
- [ ] Task 1
- [x] Task 2 (completed)
- [ ] Update this spec to reflect what was built

## 4. Change log
| Date | Change |
```

---

### SDD rules

| Rule | Why |
|---|---|
| Run `/speckit.constitution` before the first feature | Anchors all AI decisions to your architecture |
| Run `/speckit.clarify` before `/speckit.plan` | Prevents expensive rework from misunderstood requirements |
| Never skip `/speckit.tasks` | Tasks give Claude Code a deterministic execution order |
| Copy completed specs into `specs/` folder | Keeps specs with the code, visible in the repo |
| Update the spec when implementation differs | Spec and code must stay in sync — spec wins |
| Never delete a spec | Specs are the living history of every feature |
| Update `CLAUDE.md` when architecture changes | Keeps every future session correctly steered |

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
