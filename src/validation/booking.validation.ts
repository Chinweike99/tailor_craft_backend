import z from "zod";




const measurementSchema = z.record(z.string(), z.union([z.string(), z.number()]));


export const createBookingSchema = z.object({
    designId: z.string().optional(),
    customDesign: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    images: z.array(z.string()).min(1),
  }).optional(),
  measurements: measurementSchema,
  deliveryDate: z.coerce.date(),
  notes: z.string().optional(),
});


export const updateBookingStatusSchema = z.object({
    status: z.enum(['PENDING', 'APPROVED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  declineReason: z.string().optional(),
});

export const getBookingsSchema = z.object({
    status: z.enum(['PENDING', 'APPROVED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
})




