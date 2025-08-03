import { BookingStatus, Prisma, PrismaClient } from "@prisma/client";
import { BookingCreateInput } from "../types/types";
import { BadRequestError, NotFoundError } from "../utils/error.utils";


const prisma =  new PrismaClient();

export const createBooking = async(userId: string, data: BookingCreateInput) => {
    const { designId, customDesign, measurements, deliveryDate, notes  } = data;
    if(!designId && !customDesign){
        throw new BadRequestError('Either designId or customDesign must be provided');
    }

    const delivery = new Date(deliveryDate);
    const now = new Date();

    if(delivery < now) {
        throw new BadRequestError("Delivery date cannot be in the past")
    }

    const booking = await prisma.booking.create({
        data: {
            userId,
            designId,
            customDesign: customDesign || undefined,
            measurements: measurements || {},
            deliveryDate: new Date(deliveryDate),
            notes,
            status: "PENDING",
            paymentStatus: "UNPAID"
        },
        include: {
            Design: true,
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                }
            }
        }
    })
    return booking;
}



export const getBooking = async(userId: string, filters: any = {}) =>{
    const { status, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
        userId,
        ...(status && {status})
    }

    const booking = await prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc'},
        include: {
            Design: true,
            Payment: true
        }
    });

    const total = await prisma.booking.count({ where });
    return {
        data: booking,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}


export const getBookingById = async(userId: string, bookingId: string) => {
    const getbooking = await prisma.booking.findUnique({
        where: {id: bookingId},
        include: {
            Design: true,
            Payment: true,
            Review: true
        }
    });

    if(!getbooking){
        throw new NotFoundError("Booking not found");
    }

    return getbooking;
}


export const updateBookingStatus = async(bookingId: string, status: BookingStatus, declineReason?: string) => {
    const booking = await prisma.booking.update({
        where: {id: bookingId},
        data: {
            status,
            declineReason: status === "DECLINED" ? declineReason: undefined,
        },
        include: {
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            },
            Design: true
        }
    });
    return booking
}


export const getAdminBookings = async(filters: any = {}) => {
    const {status, page = 1, limit = 10} = filters;
    const skip = (page - 1) * limit;
    const where: Prisma.BookingWhereInput = {
        ...(status && {status})
    }

    const booking = await prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc'},
        include: {
            Design: true,
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            },
            Payment: true
        }
    });

    const total = await prisma.booking.count({where});
    return {
        data: booking,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}




