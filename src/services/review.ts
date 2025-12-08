import { Prisma } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../utils/error.utils";
import { prisma } from "../config/config";


export const createReview = async(userId: string, bookingId: string, rating: number, comment: string) => {
    const booking = await prisma.booking.findUnique({
        where: {id: bookingId, userId}
    });

    if(!booking){
        throw new NotFoundError("Booking not found")
    }

    if(booking.status !== "COMPLETED" ){
        throw new BadRequestError("Booking must be completed before review")
    };

    const existingReview = await prisma.review.findFirst({
        where: {bookingId}
    });
    if(existingReview){
        throw new BadRequestError("Review already exists for this booking");
    }

    const review = await prisma.review.create({
        data: {
      userId,
      bookingId,
      rating,
      comment,
    },
    include: {
      User: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
      Booking: {
        select: {
          Design: true,
          customDesign: true,
        },
      },
    },
    })

    await prisma.booking.update({
        where: {id: bookingId},
        data: {hasReview: true}
    });

    return review;
};


export const getReviews = async(filters: any = {}) => {
    const { bookingId, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {};
  if (bookingId) where.bookingId = bookingId;

  const reviews = await prisma.review.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      User: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
      Booking: {
        select: {
          Design: true,
          customDesign: true,
        },
      },
    },
  });

  const total = await prisma.review.count({ where });

  return {
    data: reviews,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};


export const getAdminReviews = async (filters: any = {}) => {
  return getReviews(filters);
};

