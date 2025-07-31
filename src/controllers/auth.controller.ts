import e, { NextFunction, Request, Response } from "express";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifyOtpSchema } from "../validation/auth";
import { forgotPassword, login, refreshToken, register, resetPassword, verifyOtp } from "../services/auth";
import { BadRequestError } from "../utils/error.utils";


export const registerController = async(req: Request, res: Response, next: NextFunction) => {
    console.log("Request: This is request")
    try {
        const validateData = registerSchema.parse(req.body);
         console.log("Request:", validateData)
        const user = await register(validateData);
         res.status(200).status(200).json({
            success: true,
            message: "Registration was successfull",
            user
        })
         console.log("Request: ", user)
        return
    } catch (error) {
        next(error)
    }
}

export const verifyOtpController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, otp} = verifyOtpSchema.parse(req.body);
        const verified = await verifyOtp(email, otp);
        res.status(200).status(201).json({
            success: true,
            message: "OTP successfully verified",
            verified
        })
    } catch (error) {
        next(error);
    }
}

export const loginController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = loginSchema.parse(req.body);
        const result = await login(email, password);
        res.status(200).status(200).json({
            success: true,
            message: "Login successfull",
            result
        })
    } catch (error) {
        next(error);
    }
}


export const refreshTokenController = async(req: Request, res: Response, next: NextFunction) =>{
    
    try {
        const { token } = req.body;
        if(!token){
            throw new BadRequestError("Refresh token is required");
        }

        const tokens = await refreshToken(token);
        res.status(200).json({
            success: true,
            tokens
        })
    } catch (error) {
        next(error)
    }
}



export const forgotPasswordController = async(req: Request, res: Response, next: NextFunction) => {
    console.log("Endpoint hit")
    try {
        const { email } = forgotPasswordSchema.parse(req.body);
        const response = await forgotPassword(email);
        res.status(200).json({
            message: "Success",
            response
        })
    } catch (error) {
        next(error)
    }
}


export const resetPasswordController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, otp, newPassword} = resetPasswordSchema.parse(req.body);
        const verifyResetPassword = await resetPassword(email, otp, newPassword);
        res.status(200).json({
            message: "Passoword was successfully",
            verifyResetPassword
        })
    } catch (error) {
        next(error)
    }
}








