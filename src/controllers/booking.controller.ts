import { NextFunction, Request, Response } from "express";
import { createBookingSchema, getBookingsSchema } from "../validation/booking.validation";
import { createBooking, getBooking } from "../services/booking.service";
import { NotFoundError } from "../utils/error.utils";
import { json } from "zod";




export const createBookingController = async(req: Request, res: Response, next: NextFunction ) => {
    try {
        const userId = req.user?.id
        if(!userId) {
            throw new NotFoundError("User not found")
        }
        const validateData = createBookingSchema.parse(req.body);
        const makeBooking = await createBooking(userId, validateData)
        res.status(200).json({
            message: "Booking created successfully",
            makeBooking
        })
    } catch (error) {
        next(error)
    }
};


export const getBookingController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        // const {status, page = 1, limit = 10} = filters
        const filters = getBookingsSchema.parse(req.query);
        if(!userId){
            throw new NotFoundError("User not found")
        }
        const result = await getBooking(userId, filters)
        res.status(200).json({
            message: "success",
            result
        })
    } catch (error) {
        next(error)
    }
} 




