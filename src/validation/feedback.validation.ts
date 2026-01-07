import { z } from 'zod';

export const createFeedbackSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
  message: z.string()
    .min(10, 'Feedback message must be at least 10 characters')
    .max(1000, 'Feedback message must not exceed 1000 characters'),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
