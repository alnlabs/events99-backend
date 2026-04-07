# Events99 Backend API

The backend API for Events99, a comprehensive event and hall management system. This application is built with **Node.js**, **Express**, and **Prisma ORM**, designed to be deployed as a serverless application on **Netlify Functions**.

## 🚀 Features

- **Authentication**: JWT-based authentication with role-based access control (Admin, Customer, Staff).
- **Hall Management**: Manage event spaces, capacity, pricing, and amenities.
- **Booking System**: Handle event bookings with status tracking (Pending, Confirmed, etc.).
- **Catering Services**: Integrated catering package management and booking.
- **Staff Management**: Assign and track staff shifts for events.
- **Payment Tracking**: Record and monitor payment status (Unpaid, Partially Paid, Paid).
- **Dashboard**: Reporting and analytics for administrators and staff.
- **Serverless Ready**: Optimized for deployment on Netlify Functions using `serverless-http`.

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Deployment**: Netlify Functions
- **Security**: Helmet, Rate Limiting, BcryptJS, JWT
- **Other**: Multer (file uploads), Nodemailer (email notifications), Morgan (logging)

## 📁 Project Structure

```
├── netlify/
│   └── functions/          # Netlify functions entry point (api.js)
├── prisma/
│   ├── schema.prisma       # Database schema definition
│   └── seed.js             # Initial database seed script
├── src/
│   ├── controllers/        # Business logic for each resource
│   ├── middleware/         # Custom authentication and validation middleware
│   ├── routes/             # API route definitions
│   ├── utils/              # Helper utilities (Prisma client, etc.)
│   └── index.js            # Main Express application setup
├── netlify.toml            # Netlify deployment configuration
└── package.json            # Dependencies and scripts
```

## ⚙️ Development Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL database (Supabase recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd events99-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   JWT_SECRET="your-secret-key"
   FRONTEND_URL="http://localhost:5173"
   # Add other necessary vars like SMTP or Supabase credentials
   ```

4. Initialize the database:
   ```bash
   npm run build      # Generate Prisma client
   npm run db:push    # Push schema to database
   npm run db:seed    # Seed initial data
   ```

### Running Locally

```bash
npm run dev
```
The server will start at `http://localhost:5000/api`.

## 📡 API Endpoints

The API is prefixed with `/api`.

- **Auth**: `/api/auth` (Register, Login, Profile)
- **Halls**: `/api/halls` (List, Create, Update, Delete)
- **Bookings**: `/api/bookings` (Create, List, Manage status)
- **Catering**: `/api/catering` (Packages and Selections)
- **Staff**: `/api/staff` (Shift management)
- **Payments**: `/api/payments` (Transaction tracking)
- **Dashboard**: `/api/dashboard` (Stats and Metrics)
- **Users**: `/api/users` (User management)

## 🚀 Deployment

This project is configured for deployment on **Netlify**.

1. Connect your repository to Netlify.
2. The `netlify.toml` file handles the build and redirect configurations.
3. Configure your Environment Variables in the Netlify Dashboard.
4. The build command `npm run build` will generate the Prisma client during deployment.

---
Built with ❤️ by ALN Labs.
