import { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema, verifyOtpSchema } from "../validation/auth";
import { login, register, verifyOtp } from "../services/auth";


export const registerController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const validateData = registerSchema.parse(req.body);
        const user = await register(validateData);
         res.status(200).json({
            success: true,
            message: "Registration was successfull",
            user
        })
        return
    } catch (error) {
        next()
    }
}

export const verifyOtpController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, otp} = verifyOtpSchema.parse(req.body);
        const verified = await verifyOtp(email, otp);
        res.status(201).json({
            success: true,
            message: "OTP successfully verified",
            verified
        })
    } catch (error) {
        next();
    }
}

export const loginController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = loginSchema.parse(req.body);
        const result = await login(email, password);
        res.status(200).json({
            success: true,
            message: "Login successfull",
            result
        })
    } catch (error) {
        
    }
}


