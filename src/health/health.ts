import { Request, Response } from "express";


export const HealthCheck =(req: Request, res: Response) => {
    res.status(200).json({ message: 'Health Check Successful ....✴️' });
}