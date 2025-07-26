import { NextFunction, Request, Response } from "express";
import {z} from 'zod'

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOprational = true){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOprational;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}


export class BadRequestError extends AppError {
    constructor(message = 'Bad Request'){
        super(message, 400)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized"){
        super(message, 401)
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden"){
        super(message, 403)
    }
}

export class NotFoundError extends AppError{
    constructor(message = "Not Found error"){
        super(message, 404)
    }
}

export class ConflictError extends AppError {
    constructor(message = "Conflict Error"){
        super(message, 409)
    }
}

export class ValidationError extends AppError {
    public readonly errors: Record<string, string[]> | undefined;

    constructor(errors: Record<string, string[]>, message = "validation failed"){
        super(message, 422);
        this.errors = errors;
    }
}

export class RateLimitError extends AppError {
    constructor(message = "Too many Requests"){
        super(message, 429)
    }
}

export class InternalServerError extends AppError {
    constructor(message = 'internal Server Error'){
        super(message, 500)
    }
}


export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction)=> {
    if(error instanceof AppError){
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            ...(error instanceof ValidationError && { errors: error.errors})
        })
    };

    if(error.name === "ZodError"){
        const zodError = error as z.ZodError;
        const errors = zodError.issues.reduce((acc: { [x: string]: any[]; }, curr: { path: any[]; message: any; }) => {
            const key = curr.path.join(".");
            acc[key] = acc[key] || [];
            acc[key].push(curr.message);
            return acc
        }, {} as Record<string, string[]>);

        return res.status(422).json({
            success: false,
            message: "Validation Failed",
            errors
        })
    }

    if(error.name === "JsonWebTokenError"){
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        })
    }

    if(error.name === "TokenExpiredError"){
        return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    }

    if(error.name === "PrismaClientKnownRequestError"){
        const prismaError = error as unknown as { code: string; meta?: any};

        if(prismaError.code === 'P2002'){
            const field = prismaError.meta?.target?.join(', ') || 'field';
            return res.status(409).json({
                success: false,
                message: `${field} already exists`
            });
        }

         if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
    }

    console.error('Unexpected error:', error);
     return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}









