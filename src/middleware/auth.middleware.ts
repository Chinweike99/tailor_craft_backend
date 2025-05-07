import { NextFunction, Request, Response } from "express";
import { parseTokenFromHeader } from "../utils/jwt.utils";
import { ApiError } from "../types";



// Extend Express Request interface to include user Property
declare global {
    namespace Express {
        interface Request {
            user?: string;
            userId?: string;
        }
    }
}


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = parseTokenFromHeader(authHeader || '');

        if(!token) {
            const error = new Error("Authentication required. Please Login") as ApiError;
            error.statusCode = 401;
            return next(error);
        }


    } catch (error) {
        
    }
}

