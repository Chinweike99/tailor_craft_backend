# TailorCraft Backend

A comprehensive backend API for a custom tailoring service platform built with Node.js, Express, TypeScript, Prisma, and PostgreSQL. TailorCraft enables clients to book custom tailoring services, manage bookings, make payments, and interact with tailors efficiently.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.8-2D3748.svg)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-5.1-000000.svg)](https://expressjs.com/)
[![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D.svg)](https://swagger.io/)

##  Quick Links

- ** [Interactive API Documentation](http://localhost:4000/api-docs)** - Swagger UI
- *** [Swagger Guide](./SWAGGER_GUIDE.md)** - How to use the API documentation
- **[Health Check](http://localhost:4000/api/v1/health)** - API status

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Core Services](#core-services)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

### Authentication & Authorization
- User registration with OTP email verification
- JWT-based authentication (access & refresh tokens)
- Role-based access control (Admin & Client)
- Forgot password with OTP reset
- Token revocation and automatic cleanup
- Automatic expired OTP cleanup (every 5 minutes)

### User Management
- Profile management with image upload (Cloudinary)
- Address and preferred pickup address management
- User statistics and analytics (Admin)

### Booking System
- Create bookings with custom or pre-designed styles
- Measurement submission (JSON format)
- Booking status tracking (Pending, Approved, In Progress, Completed, Cancelled)
- Automatic delivery reminders (3 days, 1 day before)
- Admin booking management

### Payment Integration
- Paystack payment gateway integration
- Full and installment payment options
- Payment verification
- Webhook handling for payment updates
- Automatic fund transfers to admin account
- Payment history and statistics
- Test payment simulation

### Design & Guide Management
- Pre-designed clothing catalog (Native, Casual, Formal)
- Design with multiple images
- Price range management
- Minimum delivery time
- Required materials tracking
- Measurement guides and tutorials

### Reviews & Ratings
- Client reviews on completed bookings
- Rating system (1-5 stars)
- Admin review moderation

### System Features
- Rate limiting with Redis
- Automated background jobs (cron)
- Email notifications (Resend/Gmail)
- File upload with Cloudinary
- CORS configuration
- Helmet security
- Health check endpoint
- Keep-alive service for hosting platforms

## 🛠 Tech Stack

### Core Technologies
- **Runtime:** Node.js 18+
- **Language:** TypeScript 5.8
- **Framework:** Express 5.1
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma 6.8

### Key Libraries
- **Authentication:** JWT (jsonwebtoken), Argon2
- **Validation:** Zod
- **Payment:** Paystack API
- **Cloud Storage:** Cloudinary
- **Email:** Resend / Nodemailer
- **Caching:** Redis, IORedis
- **Cron Jobs:** node-cron
- **File Upload:** Multer
- **Security:** Helmet, express-rate-limit

## Project Structure

```
tailor_craft_backend/
├── src/
│   ├── admin/              # Admin creation scripts
│   │   └── createAdmin.ts
│   ├── config/             # Configuration files
│   │   ├── cloudinary.config.ts
│   │   ├── config.ts
│   │   ├── cors.config.ts
│   │   └── database.ts
│   ├── controllers/        # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── profile.controller.ts
│   │   ├── review.controller.ts
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── design.controller.ts
│   │       └── guide.controller.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── rateLimitter.middleware.ts
│   │   ├── redis.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── validate.middleware.ts
│   ├── routes/             # API routes
│   │   ├── auth.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── profile.routes.ts
│   │   ├── review.routes.ts
│   │   └── admin/
│   │       ├── admin.routes.ts
│   │       ├── design.routes.ts
│   │       └── guide.routes.ts
│   ├── services/           # Business logic
│   │   ├── auth.ts
│   │   ├── booking.service.ts
│   │   ├── cleanup.service.ts
│   │   ├── keep-alive.service.ts
│   │   ├── payment.service.ts
│   │   ├── profile.services.ts
│   │   ├── reminder.service.ts
│   │   ├── review.ts
│   │   └── admin/
│   │       ├── admin.service.ts
│   │       ├── design.service.ts
│   │       └── guide.service.ts
│   ├── types/              # TypeScript types
│   │   ├── index.d.ts
│   │   ├── paystack.d.ts
│   │   └── types.ts
│   ├── utils/              # Utility functions
│   │   ├── cloudinary.utils.ts
│   │   ├── email.service.ts
│   │   ├── email.ts
│   │   ├── error.utils.ts
│   │   ├── helpers.utils.ts
│   │   └── paystack.utils.ts
│   ├── validation/         # Zod schemas
│   │   ├── auth.ts
│   │   ├── booking.validation.ts
│   │   ├── design.ts
│   │   ├── guide.ts
│   │   ├── profile.validation.ts
│   │   └── review.ts
│   ├── health/             # Health check
│   │   └── health.ts
│   ├── app.ts              # Express app setup
│   └── index.ts            # Server entry point
├── migrations/             # Prisma migrations
├── schema.prisma           # Prisma schema
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies
└── .env                    # Environment variables
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Redis (optional, for rate limiting)
- Cloudinary account (for image uploads)
- Paystack account (for payments)
- Email service (Resend or Gmail)

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/Chinweike99/tailor_craft_backend.git
cd tailor_craft_backend
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Generate Prisma Client**
```bash
npm run postinstall
```

5. **Run database migrations**
```bash
npm run db:migrate
```

6. **Create admin user**
```bash
npm run admin
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_PORT1=https://your-frontend-url.com
FRONTEND_PORT2=https://your-frontend-url-2.com

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
EXTERNAL_DB_URL=postgresql://user:password@host:port/database?sslmode=require
DATABASE_HOST_NAME=your-db-host

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRATION=2h
JWT_REFRESH_EXPIRATION=7d

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_IS_LIVE=false

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_SERVICE=resend
EMAIL_FROM=noreply@yourdomain.com

# Or use Gmail
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
# EMAIL_FROM=your-email@gmail.com

# Admin Account Configuration
ADMIN_EMAIL=admin@tailorcraft.com
ADMIN_PASS=SecurePassword123!
ADMIN_PHONE=09123456789
ADMIN_NAME=TailorCraft Admin
ACCOUNT_NAME=TailorCraft Fashion
ADMIN_ACCOUNT_NUMBER=1234567890
ADMIN_BANK_CODE=058

# Render Configuration (for deployment)
RENDER_EXTERNAL_URL=https://your-app-name.onrender.com
RENDER_SERVICE_ID=your-service-id
RENDER_API_KEY=your-api-key
```

## 🗄 Database Setup

### Using Neon (Recommended)

1. Create a free account at [Neon](https://neon.tech)
2. Create a new project and database
3. Copy the connection string to `DATABASE_URL` in `.env`

### Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
```sql
CREATE DATABASE tailorcraft_db;
```
3. Update `DATABASE_URL` in `.env`

### Run Migrations

```bash
# Apply all migrations
npm run db:migrate

# Create a new migration (development)
npm run db:migrate:dev

# Check migration status
npm run db:migrate:status

# Reset database ( DANGER: Deletes all data)
npm run db:migrate:reset

# Open Prisma Studio (GUI for database)
npm run db:studio
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Server runs on `http://localhost:4000`

**Access Points:**
- Home: `http://localhost:4000/`
- API Docs: `http://localhost:4000/api-docs`
- Health: `http://localhost:4000/api/v1/health`

### Production Mode
```bash
# Build the project
npm run build

# Start production server
npm start
```

### Create Admin User
```bash
npm run admin
```

### Test Payment Flow
```bash
npm run payment
```

## API Documentation

### Interactive Documentation (Swagger UI)

The API includes comprehensive **Swagger/OpenAPI 3.0** documentation with an interactive interface.

**Access the Swagger UI:**
- **Development**: http://localhost:4000/api-docs
- **Production**: https://your-app-name.onrender.com/api-docs

**Features:**
- **Interactive Testing** - Try all endpoints directly in your browser
- **Complete Documentation** - All 40+ endpoints with detailed descriptions
- **Authentication Support** - Test protected endpoints with JWT tokens
- **Request/Response Examples** - See exactly what data to send and expect
- **Schema Definitions** - Explore all data models and types
- **No Setup Required** - Works out of the box

**Read the detailed guide:** [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

---

### Quick Reference

Base URL: `http://localhost:4000/api/v1`

**Endpoint Summary:**
- **Authentication**: 7 endpoints (register, login, verify-otp, etc.)
- **Profile**: 3 endpoints (get, update, upload image)
- **Bookings**: 5 endpoints (create, list, update status, etc.)
- **Payments**: 7 endpoints (initialize, verify, history, etc.)
- **Designs**: 5 endpoints (CRUD operations)
- **Guides**: 5 endpoints (CRUD operations)
- **Reviews**: 3 endpoints (create, list)
- **Admin**: 4 endpoints (stats, client management)
- **Health**: 1 endpoint (health check)

For detailed endpoint documentation with request/response examples, see the [Swagger UI](http://localhost:4000/api-docs).

---

### Sample Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "message": "OTP Sent to email",
  "data": {...}
}
```

#### Verify OTP
```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

Response: 200 OK
{
  "user": {...},
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "user": {...},
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}

Response: 200 OK
{
  "message": "OTP sent to email"
}
```

#### Reset Password
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}

Response: 200 OK
{
  "message": "Password reset successfully"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

---

### Profile Endpoints

All profile endpoints require authentication.

#### Get Profile
```http
GET /api/v1/profile
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "profileImage": "https://cloudinary.com/...",
  "bio": "Fashion enthusiast",
  "address": {...},
  "preferredPickupAddress": {...}
}
```

#### Update Profile
```http
PATCH /api/v1/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Updated bio",
  "address": {
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria"
  }
}

Response: 200 OK
```

#### Upload Profile Image
```http
POST /api/v1/profile/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

image: [file]

Response: 200 OK
{
  "message": "Profile image uploaded successfully",
  "imageUrl": "https://cloudinary.com/..."
}
```

---

### Booking Endpoints

#### Create Booking
```http
POST /api/v1/booking
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "designId": "uuid", // Optional if customDesign provided
  "customDesign": {   // Optional if designId provided
    "description": "Custom design details",
    "images": ["url1", "url2"]
  },
  "measurements": {
    "chest": "42",
    "waist": "34",
    "shoulder": "18",
    "sleeve": "24"
  },
  "deliveryDate": "2026-02-15T00:00:00Z",
  "notes": "Please use silk material"
}

Response: 201 Created
{
  "id": "uuid",
  "status": "PENDING",
  "paymentStatus": "UNPAID",
  ...
}
```

#### Get User Bookings
```http
GET /api/v1/booking
Authorization: Bearer {accessToken}

Response: 200 OK
[
  {
    "id": "uuid",
    "status": "PENDING",
    "deliveryDate": "2026-02-15",
    ...
  }
]
```

#### Get Booking by ID
```http
GET /api/v1/booking/:id
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "id": "uuid",
  "userId": "uuid",
  "measurements": {...},
  "status": "APPROVED",
  ...
}
```

#### Update Booking Status (Admin Only)
```http
PATCH /api/v1/booking/:id/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "APPROVED", // or "DECLINED", "IN_PROGRESS", "COMPLETED"
  "declineReason": "Optional reason for decline"
}

Response: 200 OK
```

#### Get All Bookings (Admin Only)
```http
GET /api/v1/booking/admin/all
Authorization: Bearer {accessToken}

Response: 200 OK
[...]
```

---

### Payment Endpoints

#### Initialize Payment
```http
POST /api/v1/payment/:bookingId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "isInstallment": false, // true for partial payment
  "amount": 50000 // Optional, for installment
}

Response: 200 OK
{
  "paymentUrl": "https://checkout.paystack.com/...",
  "reference": "REF_...",
  "amount": 50000
}
```

#### Verify Payment
```http
GET /api/v1/payment/verify?reference=REF_xxx
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "message": "Payment verified successfully",
  "payment": {...}
}
```

#### Payment History
```http
GET /api/v1/payment/history
Authorization: Bearer {accessToken}

Response: 200 OK
[
  {
    "id": "uuid",
    "amount": 50000,
    "status": "SUCCESS",
    "createdAt": "2026-01-05",
    ...
  }
]
```

#### Get All Payments (Admin)
```http
GET /api/v1/payment/all-payment
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Payment Statistics (Admin)
```http
GET /api/v1/payment/stats
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "totalRevenue": 500000,
  "totalPayments": 10,
  "successfulPayments": 8,
  ...
}
```

#### Payment Webhook
```http
POST /api/v1/payment/webhook
X-Paystack-Signature: {signature}

{
  "event": "charge.success",
  "data": {...}
}
```

---

### Design Endpoints

#### Get All Designs
```http
GET /api/v1/design
Authorization: Bearer {accessToken}

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "Agbada",
    "description": "Traditional Nigerian attire",
    "images": ["url1", "url2"],
    "category": "NATIVE",
    "priceRange": {
      "min": 30000,
      "max": 80000
    },
    "minimumDeliveryTime": 7
  }
]
```

#### Get Design by ID
```http
GET /api/v1/design/:id
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Create Design (Admin Only)
```http
POST /api/v1/design
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

title: "Senator Wear"
description: "Modern senator style"
category: "FORMAL"
priceRange: {"min": 25000, "max": 50000}
minimumDeliveryTime: 5
requiredMaterials: ["Fabric", "Thread"]
images: [file1, file2]

Response: 201 Created
```

#### Update Design (Admin Only)
```http
PATCH /api/v1/design/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Updated title",
  "isActive": false
}

Response: 200 OK
```

#### Delete Design (Admin Only)
```http
DELETE /api/v1/design/:id
Authorization: Bearer {accessToken}

Response: 200 OK
```

---

### Guide Endpoints

#### Get All Guides
```http
GET /api/v1/guide
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Get Guide by ID
```http
GET /api/v1/guide/:id
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Create Guide (Admin Only)
```http
POST /api/v1/guide
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "How to Measure Chest",
  "description": "Step by step guide",
  "type": "VIDEO", // or "PDF", "IMAGE"
  "resourceUrl": "https://youtube.com/..."
}

Response: 201 Created
```

#### Update Guide (Admin Only)
```http
PATCH /api/v1/guide/:id
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Delete Guide (Admin Only)
```http
DELETE /api/v1/guide/:id
Authorization: Bearer {accessToken}

Response: 200 OK
```

---

### Review Endpoints

#### Create Review
```http
POST /api/v1/review/:bookingId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent work!"
}

Response: 201 Created
```

#### Get Reviews
```http
GET /api/v1/review
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Get All Reviews (Admin Only)
```http
GET /api/v1/review/admin
Authorization: Bearer {accessToken}

Response: 200 OK
```

---

### Admin/Client Management Endpoints

#### Get All Clients (Admin Only)
```http
GET /api/v1/client
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Get Admin Statistics (Admin Only)
```http
GET /api/v1/client/stats
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "totalClients": 50,
  "totalBookings": 120,
  "totalRevenue": 5000000,
  ...
}
```

#### Get Client by ID (Admin Only)
```http
GET /api/v1/client/:id
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Delete Client (Admin Only)
```http
DELETE /api/v1/client/:id
Authorization: Bearer {accessToken}

Response: 200 OK
```

---

### Health Check

```http
GET /api/v1/health

Response: 200 OK
{
  "status": "OK",
  "timestamp": "2026-01-06T...",
  "uptime": 3600
}
```

## 🔧 Core Services

### Cleanup Service
Automatically removes expired OTP records and revoked tokens every 5 minutes to maintain database hygiene.

```typescript
// Located in: src/services/cleanup.service.ts
- Runs on startup
- Cron schedule: */5 * * * * (every 5 minutes)
- Cleans expired PendingVerification records
- Cleans expired RevokedToken records
```

### Reminder Service
Sends automated email reminders to clients about upcoming delivery dates.

```typescript
// Located in: src/services/reminder.service.ts
- Sends reminder 3 days before delivery
- Sends reminder 1 day before delivery
- Checks daily at 9:00 AM
```

### Keep-Alive Service
Prevents free-tier hosting platforms from sleeping by pinging the server every 14 minutes.

```typescript
// Located in: src/services/keep-alive.service.ts
- Pings health endpoint every 14 minutes
- Only runs in production
```

### Email Service
Handles all email communications using Resend or Gmail.

```typescript
// Located in: src/utils/email.service.ts
- OTP emails
- Password reset emails
- Booking confirmations
- Delivery reminders
```

### Payment Service
Manages Paystack integration for payment processing.

```typescript
// Located in: src/services/payment.service.ts
- Initialize payments
- Verify transactions
- Handle webhooks
- Process refunds
- Automatic fund transfers
```

## Deployment

### Render Deployment

1. **Create a new Web Service** on [Render](https://render.com)

2. **Connect your GitHub repository**

3. **Configure build settings:**
   - **Build Command:** `npm run build:render`
   - **Start Command:** `npm start`

4. **Add environment variables** (from `.env` file)

5. **Deploy!**

### Environment-Specific Configuration

The app automatically detects the environment:
- `NODE_ENV=development` - Local development
- `NODE_ENV=production` - Production deployment

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run admin` | Create admin user |
| `npm run payment` | Test payment flow |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Deploy database migrations |
| `npm run db:migrate:dev` | Create new migration |
| `npm run db:migrate:status` | Check migration status |
| `npm run db:migrate:reset` | Reset database (⚠️ deletes data) |
| `npm run db:studio` | Open Prisma Studio |

## Security Features

- Password hashing with Argon2
- JWT-based authentication with token rotation
- Token revocation system
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with Zod
- SQL injection protection (Prisma)
- XSS protection

## Testing

```bash
npm test
```

## Database Models

### User
Stores client and admin information with authentication details.

### PendingVerification
Temporary storage for unverified registrations with OTP.

### Booking
Customer orders with measurements and delivery information.

### Design
Pre-made clothing designs catalog.

### Payment
Payment transactions and history.

### Review
Customer feedback and ratings.

### Guide
Measurement guides and tutorials.

### Reminder
Scheduled delivery reminders.

### RevokedToken
Invalidated JWT tokens for logout.

## Documentation

This project includes comprehensive documentation for developers:

### API Documentation
- **[Swagger UI](http://localhost:4000/api-docs)** - Interactive API documentation
  - Test all endpoints in your browser
  - View request/response schemas
  - Built-in JWT authentication
  - 40+ endpoints fully documented

### Developer Guides
- **[SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)** - Complete guide to using the Swagger documentation
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide for testing the API
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Swagger implementation details
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Checklist to verify everything works

### Key Features
- OpenAPI 3.0 specification
- Interactive endpoint testing
- Complete schema definitions
- Authentication examples
- Error response documentation
- Production-ready

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, email tailorcraft.fashion@gmail.com

## License

This project is licensed under the ISC License.

## Acknowledgments

- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Paystack](https://paystack.com/) - Payment processing
- [Cloudinary](https://cloudinary.com/) - Image management
- [Resend](https://resend.com/) - Email delivery
- [Neon](https://neon.tech/) - Serverless PostgreSQL

---

**Built by Chinweike Akwolu**

**Repository:** [https://github.com/Chinweike99/tailor_craft_backend](https://github.com/Chinweike99/tailor_craft_backend)
