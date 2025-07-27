import { PrismaClient, UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ConflictError, UnauthorizedError } from "../utils/error.utils";
import argon2 from 'argon2'
import { generateOtp, sendEmail } from "../utils/helpers.utils";
import config from "../config/config";
import jwt, { SignOptions } from 'jsonwebtoken'



const prisma = new PrismaClient();

export const register = async(data: {name: string, email: string, phone: string, password: string, role?: UserRole}) => {
    const exisingUser = await prisma.user.findUnique({
        where: {email: data.email}
    });

    if(exisingUser){
        throw new ConflictError(`${data.email} already exists`)
    }

    const hashedPassword = await argon2.hash(data.password);
    const otp = generateOtp(config.otp.length);
    const otpExpires = new Date(Date.now()  + config.otp.expiresInMinutes * 60 * 1000)

    const user = await prisma.user.create({
        data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role || UserRole.CLIENT,
        otp, otpExpires
        }
    });
    await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `Your OTP is ${otp}. It expires in ${config.otp.expiresInMinutes} minutes`
    });
    return { id: user.id, email: user.email, name: user.name}
}


export const verifyOtp = async(email: string, otp: string) => {
    const user = await prisma.user.findUnique({where: {email}});

    if(!user){
        throw new UnauthorizedError("User not found")
    };

    if(user.otp !== otp || new Date(user.otpExpires as Date) < new Date()){
        throw new UnauthorizedError("Invalid or expired OTP")
    };

    const updateUser = await prisma.user.update({
        where: {email},
        data: {
            isVerified: true,
            otp: null,
            otpExpires: null
        }
    });

    const tokens = generateToken(updateUser.id)
    return { user: updateUser, tokens}
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





