import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { initalizePayment } from '../services/payment.service';
import { NotFoundError } from '../utils/error.utils';


const initializePaymentSchema = z.object({
//   bookingId: z.string(),
  amount: z.number().positive(),
  isInstallment: z.boolean().default(false),
});

export const InitializePaymentController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const bookingId = req.params.id;
        const {amount, isInstallment} = initializePaymentSchema.parse(req.body);

        if(!userId){
            throw new NotFoundError("InitializePaymentController: Not Found Error")
        }

        const response = await initalizePayment(userId, bookingId, amount, isInstallment);
        res.status(201).json({
            status: "success",
            response
        })
    } catch (error) {
        next(error)
    }
}