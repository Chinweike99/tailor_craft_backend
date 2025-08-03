import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10).max(500),
});

export const getReviewsSchema = z.object({
  bookingId: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});