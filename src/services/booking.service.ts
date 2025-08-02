import { Prisma, PrismaClient } from "@prisma/client";
import { BookingCreateInput } from "../types/types";
import { BadRequestError } from "../utils/error.utils";


const prisma =  new PrismaClient();

export const createBooking = async(userId: string, data: BookingCreateInput) => {
    const { designId, customDesign, measurements, deliveryDate, notes  } = data;
    if(!designId && !customDesign){
        throw new BadRequestError('Either designId or customDesign must be provided');
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
            totaoPages: Math.ceil(total / limit)
        }
    }
}




