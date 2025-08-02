import z from "zod";


export const createDesignSchema = z.object({
     title: z.string().min(3),
    description: z.string().min(10),
    priceRange: z.object({
    min: z.coerce.number().positive(),
    max: z.coerce.number().positive(),
  }),
  category: z.enum(['NATIVE', 'CASUAL', 'FORMAL']),
  minimumDeliveryTime: z.coerce.number().positive(),
  requiredMaterials: z.array(z.string()).min(1),
  isActive: z.boolean().default(true),
});


export const updateDesignSchema = createDesignSchema.partial();

export const getDesignsSchema = z.object({
  category: z.enum(['NATIVE', 'CASUAL', 'FORMAL']).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});
