import { NextFunction, Request, Response } from "express";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifyOtpSchema } from "../validation/auth";
import { forgotPassword, login, logout, refreshToken, register, resetPassword, verifyOtp } from "../services/auth";
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

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await login(email, password);

    const { accessToken, refreshToken } = result.tokens;
    res.cookie("auth", accessToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, 
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async(req: Request, res: Response, next: NextFunction) => {
    try {

        const token = req.cookies?.auth || req.header("Authorization")?.replace("Bearer ", '');
        console.log("Extracted token:", token);
        await logout(token)
        console.log("Logged out: ", token)
        res.cookie("auth", "", {
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        console.log(error);
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








