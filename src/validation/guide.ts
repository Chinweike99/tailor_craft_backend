import { z } from 'zod'

export const createGuideSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    type: z.enum(['VIDEO', 'DOCUMENT']),
    resourceUrl: z.string().url()
});

export const updateGuideSchema = createGuideSchema.partial();

export const getGuidesSchema = z.object({
  type: z.enum(['VIDEO', 'DOCUMENT']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});