import dotenv from 'dotenv';
import { Secret } from 'jsonwebtoken';
import path from 'path';
// Load environment variables
dotenv.config({path: path.resolve(__dirname, '../../.env')});

interface Config {
    port: string;
    nodeEnv: string;
    mongoUri: string;
    jwtSecret: string | Secret; 
    jwtExpiresIn: string;
    emailHost: string;
    emailPort: number;
    emailUser: string;
    emailPass: string;
    emailFrom: string;
    frontendUrl: string;
    maxFileSize: number;
}

export const config: Config = {
    port: process.env.PORT || '8000',
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/tailoring-platform',
    jwtSecret: process.env.JWT_SECRET || "default-secret-key", 
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    // Email Settings
    emailHost: process.env.EMAIL_HOST || 'smpt.willsdan000.com',
    emailPort: parseInt(process.env.EMAIL_PORT || '587', 10),
    emailUser: process.env.EMAIL_USER || 'willsdan000@gmail.com',
    emailPass: process.env.EMAIL_PASS || 'password',
    emailFrom: process.env.EMAIL_FROM || 'noreply@tailoring.com',
    // Frontend URL (for CORS and email links)
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5', 10) * 1024 * 1024,
};

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];
for (const envVar of requiredEnvVars){
    if(!process.env[envVar] && process.env.NODE_ENV === "production"){
        console.log(`Warning: Environment variable ${envVar} is not set in production mode.`)
    }
}