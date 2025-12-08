import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

// Validate required environment variables
const DATABASE_URL = process.env.DATABASE_URL || process.env.EXTERNAL_DB_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or EXTERNAL_DB_URL must be set in .env file');
}

// Create the connection pool
const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);

// Create Prisma Client with the adapter
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
  adapter,
});

// Test the connection
prisma.$connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 5000;

export default {
    env, 
    port,
    database: {
        url: DATABASE_URL
    },
    jwt: {
        secret: process.env.JWT_SECRET as string,
        accessExpiration: process.env.JWT_ACCESS_EXPIRATION || "1h",
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION as string
    },
    redis: {
        url: process.env.REDIS_URL as string
    },
    paystack: {
        secretKey: process.env.PAYSTACK_SECRET_KEY as string,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY as string,
        isLive: process.env.PAYSTACK_IS_LIVE === 'true'
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
        apiKey: process.env.CLOUDINARY_API_KEY as string,
        apiSecret: process.env.CLOUDINARY_API_SECRET as string,
    },
    email: {
        service: process.env.EMAIL_SERVICE || "gmail",
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASS as string,
        from: process.env.EMAIL_FROM as string,
    },
    otp: {
        length: 6,
        expiresInMinutes: 5
    },
    admin: {
        email: process.env.ADMIN_EMAIL as string,
        pass: process.env.ADMIN_PASS as string,
        phone: process.env.ADMIN_PHONE as string,
        name: process.env.ADMIN_NAME as string,
        accountName: process.env.ADMIN_ACCOUNT_NAME as string, 
        accountNumber: process.env.ADMIN_ACCOUNT_NUMBER as string,
        bankCode: process.env.ADMIN_BANK_CODE as string,
    },
    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
}