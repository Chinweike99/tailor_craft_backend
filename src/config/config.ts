import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client"
dotenv.config();

export const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
        db: {
            url: process.env.EXTERNAL_DB_URL || "",
        }
    }
})

const env = process.env.NODE_ENV || 'development';
const port = process.env.port || 5000;

export default {
    env, port,
    database: {
        url: process.env.EXTERNAL_DB_URL || ""
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
        publicKey: process.env.PAYSTACK_PUBLIC_KEY as string
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
        apiKey: process.env.CLOUDINARY_API_KEY as string,
        apiSecret: process.env.CLOUDINARY_API_SECRET as string,
    },
    email: {
        service: process.env.EMAIL_SERVICE as string,
        apiKey: process.env.SENDGRID_API_KEY as string,
        from: process.env.EMAIL_FROM as string
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
    }
}