import { NextFunction, Request, Response } from "express";
import { createBookingSchema, getBookingsSchema, updateBookingStatusSchema } from "../validation/booking.validation";
import { createBooking, getAdminBookings, getBooking, getBookingById, updateBookingStatus } from "../services/booking.service";
import { NotFoundError } from "../utils/error.utils";
import { json, ZodError } from "zod";




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
        if(error instanceof ZodError){
            res.json(error)
        }
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


export const getBookingByIdController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        const bookingId = req.params.id;
        if(!userId){
            throw new NotFoundError("User does not exist")
        }
        const getbooking = await getBookingById(userId, bookingId);
        res.status(200).json({message: "success", getbooking})
    } catch (error) {
        next(error)
    }
}

export const updateBookingStatusController  = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.id;
        const {status, declineReason} = updateBookingStatusSchema.parse(req.body);

        if(!bookingId) {
            throw new NotFoundError("Booking Not found")
        }

        const response = await updateBookingStatus(bookingId, status, declineReason)
    } catch (error) {
        next(error)
    }
}


export const getAdminBookingsController  = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = getBookingsSchema.parse(req.query)
        const response = await getAdminBookings(filters);
        res.status(200).json({
            message: 'success',
            response
        })
    } catch (error) {
        next(error)
    }
}


