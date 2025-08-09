import { PrismaClient, Role, UserRole } from "@prisma/client";
import { ConflictError, UnauthorizedError } from "../utils/error.utils";
import argon2 from 'argon2'
import { generateOtp, sendEmail } from "../utils/helpers.utils";
import config from "../config/config";
import jwt, { SignOptions } from 'jsonwebtoken'


const prisma = new PrismaClient();

export const register = async(data: {name: string, email: string, phone: string, password: string, role?: UserRole}) => {
    console.log("Register user ......")
    const existingUser = await prisma.user.findUnique({
        where: {email: data.email}
    });

    if(existingUser){
        throw new ConflictError(`${data.email} already exists`)
    }
    
    const existingPending = await prisma.pendingVerification.findUnique({ where: {email: data.email} });
    if(existingPending){
        await prisma.pendingVerification.delete({ where: { email: data.email } });
    }

    const hashedPassword = await argon2.hash(data.password);
    const otp = generateOtp(config.otp.length);
    const otpExpires = new Date(Date.now() + config.otp.expiresInMinutes * 60 * 1000);

    await prisma.pendingVerification.create({
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            // role: data.role, If you want users to create account as either CLient or Admin
            role: "CLIENT",
            otp,
            otpExpires
        }
    });

    await sendEmail({
        to: data.email,
        subject: "Verify your email",
        html: `Your OTP is ${otp}. It expires in ${config.otp.expiresInMinutes} minutes`
    });
    return { message: "OTP Sent to email", data}
}


export const verifyOtp = async(email: string, otp: string) => {
     const pending = await prisma.pendingVerification.findUnique({ where: { email } });
    if (!pending) throw new UnauthorizedError("Verification record not found");

    if (pending.otp !== otp || new Date(pending.otpExpires) < new Date()) {
        throw new UnauthorizedError("Invalid or expired OTP");
    }

    const user = await prisma.user.create({
        data: {
            name: pending.name,
            email: pending.email,
            phone: pending.phone,
            password: pending.password,
            role: Role[pending.role as keyof typeof Role],
            isVerified: true
        }
    });

    await prisma.pendingVerification.delete({ where: { email } });

    const tokens = generateToken(user.id);
    return { user, tokens };
};


export const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({where: {email}});
    if(!user || !(await argon2.verify(user.password, password))){
        throw new UnauthorizedError("Invalid email or password")
    }

    if(!user.isVerified){
        throw new UnauthorizedError("Please verify your email")
    };
    const tokens = generateToken(user.id);
    return {user, tokens}
}

const generateToken = (userId: string) => {
    const options: SignOptions = {
        expiresIn: config.jwt.accessExpiration as any
    }
    const accessToken = jwt.sign(
        {id: userId},
        config.jwt.secret,
        options
    );

    const expireTime: SignOptions = {
        expiresIn: config.jwt.refreshExpiration as any
    }

    const refreshToken = jwt.sign(
        {id: userId}, config.jwt.secret, expireTime
    )
    return {accessToken, refreshToken}
}


export const refreshToken = async (refreshToken: string) => {
    try {
        const decoded = jwt.verify(refreshToken, config.jwt.secret) as {id: string};
        const user = await prisma.user.findUnique({ where: {id: decoded.id}});
        if(!user){
            throw new UnauthorizedError("User not found")
        }
        const tokens = generateToken(user.id);
        return tokens;
    } catch (error) {
        throw new UnauthorizedError(`Invalid refresh token: ${error}`)
    }
}


export const forgotPassword = async(email: string) => {
    try {
        const user = await prisma.user.findUnique({where: {email}});
        if(!user) {
            throw new UnauthorizedError("User not found")
        };

        const otp = generateOtp(config.otp.length);
        const otpExpires = new Date(Date.now() + config.otp.expiresInMinutes * 60 * 1000);
        await prisma.user.update({
            where: {email},
            data: {otp, otpExpires}
        });

        await sendEmail({
            to: email,
            subject: "Password reset OTP",
            html: `Your OTP is ${otp}. It expires in ${config.otp.expiresInMinutes} minutes.`,
        })
        return {message: "OTP sent to email"}

    } catch (error) {
        return error
    }
}


export const resetPassword = async(email: string, otp: string, newPassword: string)=>{
        const user = await prisma.user.findUnique({where: {email}});
    if(!user) {
        throw new UnauthorizedError("User not found")
    }

    if(!otp || user.otp !==  otp || new Date(user.otpExpires as Date) < new Date()){
        throw new UnauthorizedError("Invalid or expired OTP")
    }

    const hashedPassword = await argon2.hash(newPassword);

    await prisma.user.update({
        where: {email},
        data: {
            password: hashedPassword,
            otp: null,
            otpExpires: null
        }
    });

    return {message: "Password reset successfully"}

}


