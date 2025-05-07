import {config} from '../config/env'
import { IUser } from "../types";
import jwt from 'jsonwebtoken'



export const generateToken = (user: IUser) : string => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role
    };
    // @ts-ignore - Ignore TypeScript errors for this line
    return jwt.sign(payload, config.jwtSecret as string, {
        expiresIn: config.jwtExpiresIn
    });
}


// Verify JWT token
export const verifyToken = (token: string): {id: string} | null => {
    try {
        return jwt.verify(token, config.jwtSecret) as {id :string};
    } catch (error) {
        return null
    }
};


//Extract user ID from token
export const extractUserIdfromToken = (token: string) : string | null => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as {id: string};
        return decoded.id;
    } catch (error) {
        return null;
    }
};

// Parse Bearer token from Authorization header
export const parseTokenFromHeader = (authHeader: string): string | null =>{
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return null
    };
    return authHeader.split(' ')[1];
}


