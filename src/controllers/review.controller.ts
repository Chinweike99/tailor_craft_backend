import { NextFunction, Request, Response } from "express";
import { createReview, getAdminReviews, getReviews } from "../services/review";
import { createReviewSchema, getReviewsSchema } from "../validation/review";
import { NotFoundError } from "../utils/error.utils";



export const createReviewController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const bookingId = req.params.id;
        if(!userId){
            throw new NotFoundError("User Not Found");
        }
        const { rating, comment } = (req.body);
        const response = await createReview(userId, bookingId, rating, comment);
        res.status(201).json({
            status: 'success',
            response
        })
    } catch (error) {
        next(error)
    }
};

export const getReviewsController = async (req: Request, res: Response) => {
  const filters = getReviewsSchema.parse(req.query);
  const result = await getReviews(filters);
  res.json(result);
};

export const getAdminReviewsController = async (req: Request, res: Response) => {
  const filters = getReviewsSchema.parse(req.query);
  const result = await getAdminReviews(filters);
  res.json(result);
};

