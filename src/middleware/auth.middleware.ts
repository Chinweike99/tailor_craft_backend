import { PrismaClient } from '@prisma/client'
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../utils/error.utils';
import config from '../config/config';




const prisma = new PrismaClient();

export const authenticate = async(req:Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.auth || req.header("Authorization")?.replace("Bearer ", '');
    if(!token) {
        throw new UnauthorizedError("Authentication required");
    }

    try {

        const revoked = await prisma.revokedToken.findFirst({
            where: {
                token,
                expiresAt: { gt: new Date() }
            }
        });

        if (revoked) {
            throw new UnauthorizedError("Token has been revoked");
        }

        const decoded = jwt.verify(token, config.jwt.secret) as {id: string};
        const user = await prisma.user.findUnique({
            where: {id: decoded.id},
            select:{
                id: true,
                email: true,
                role: true,
                isVerified: true
            }
        });

        if(!user) {
            throw new UnauthorizedError("User not Found")
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error)
        throw new UnauthorizedError("Invalid token")
        
    }
}


export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if(req.user?.role !== 'ADMIN') {
        throw new UnauthorizedError('Admin access required')
    };
    next();
}





