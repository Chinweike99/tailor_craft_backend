import {z} from 'zod';

export const updateProfileSchema = z.object({
    name: z.string().min(3).max(50).optional(),
  phone: z.string().min(10).max(15).optional(),
  bio: z.string().max(500).optional(),
  address: z.object({
    street: z.string().max(100).optional(),
    city: z.string().max(50).optional(),
    state: z.string().max(50).optional(),
    country: z.string().max(50).optional(),
    postalCode: z.string().max(20).optional(),
  }).optional(),
  preferredPickupAddress: z.object({
    street: z.string().max(100).optional(),
    city: z.string().max(50).optional(),
    state: z.string().max(50).optional(),
    country: z.string().max(50).optional(),
    postalCode: z.string().max(20).optional(),
  }).optional(),
})