import { z } from 'zod';

export const createContactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must not exceed 200 characters'),
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must not exceed 2000 characters'),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
