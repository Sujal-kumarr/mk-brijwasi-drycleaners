# MK Brijwasi Drycleaners

A modern, production-grade Laundry & Dry Cleaning Management platform built for **MK Brijwasi Drycleaners** serving Vrindavan, Mathura, and Govardhan.

---

## 🏛️ Architecture Overview

This project is structured as a TypeScript monorepo using npm workspaces:

```
mk-brijwasi-drycleaners/
├── packages/
│   ├── shared/      # Shared Zod schemas, validation contracts, DTO types, and business constants
│   ├── backend/     # Express + TypeScript API server, Prisma ORM, JWT + RBAC security
│   └── frontend/    # Vite + React 18 + Tailwind CSS v3 customer, admin & partner portal
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

### Key Tech Stack
- **Monorepo:** npm workspaces
- **Shared:** TypeScript, Zod
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, bcryptjs, JWT, Helmet, Morgan, express-rate-limit
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, TanStack Query v5, Zustand, React Hook Form, Lucide React
- **Containerization:** Docker Compose (PostgreSQL 16)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- **Docker** and **Docker Compose** (or a local PostgreSQL 16 instance)

### 1. Setup Environment
Copy the example environment configuration into both root and backend:
```bash
cp .env.example packages/backend/.env
```

Review and adjust variables in `packages/backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mk_drycleaners
JWT_ACCESS_SECRET=change-me-access-secret-min-32-chars-long-mk-brijwasi
JWT_REFRESH_SECRET=change-me-refresh-secret-min-32-chars-long-mk-brijwasi
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
DEV_LOGIN_KEY=dev-secret-key-1234
OTP_PROVIDER=none
```

### 2. Start PostgreSQL with Docker
```bash
docker-compose up -d
```

### 3. Install Dependencies
Run from the root directory:
```bash
npm install
```

### 4. Database Setup & Seeding
Generate Prisma Client, apply database migrations, and seed sample data:
```bash
# Generate Prisma Client
npm run db:generate

# Run Migrations
npm run db:migrate

# Seed Database
npm run db:seed
```

### 5. Run the Application
Start both backend (Port 3001) and frontend (Port 5173) concurrently:
```bash
npm run dev
```

---

## 🔑 Pre-seeded Accounts & Credentials

| Role | Mobile | Default Password | Notes |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `9000000001` | `Admin@1234` | Full access to operations, finances, settings |
| **Admin** | `9000000002` | `Admin@1234` | Plant operations and logistics management |
| **Customer** | `9000000003` | `Customer@1234` | Sample Vrindavan resident (Radha Sharma) |
| **Delivery Partner** | `9000000004` | `Partner@1234` | Sample rider (Mohan Kumar) |

> **Development Fast Login:**  
> In development mode (`NODE_ENV=development`), you can sign in directly on `/login` by switching to *Developer Fast Login* using any valid mobile and the `DEV_LOGIN_KEY` (`dev-secret-key-1234`).

---

## 🔒 Security & Implementation Standards

1. **Password & Token Security:** All passwords are hashed using `bcrypt` with 12 salt rounds. Access tokens expire in 15 minutes and refresh tokens expire in 7 days (stored as SHA-256 hashes in the database with rotation upon refresh).
2. **Role-Based Access Control (RBAC):** Express middleware validates role permissions (`SUPER_ADMIN`, `ADMIN`, `LAUNDRY_STAFF`, `DELIVERY_PARTNER`, `CUSTOMER`).
3. **Monetary Precision:** All amounts are stored and calculated in integer **paise** (1 INR = 100 paise) to prevent floating-point inaccuracies.
4. **Rate Limiting:** Auth endpoints are throttled to 5 requests per 15 minutes per IP address in production.
5. **Data Protection:** Production configurations hide error stack traces and use HTTP-only, SameSite cookies.

---

## 🧪 Testing & Verification

Run all test suites across the monorepo:
```bash
npm run test
```

Perform type checking across all workspace packages:
```bash
npm run typecheck
```
