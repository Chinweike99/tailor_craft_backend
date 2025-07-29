import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(3).max(50),
  email: z.string(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8),
  role: z.enum(['CLIENT', 'ADMIN']).optional().default('CLIENT')
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required')
});

export const verifyOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6)
});

export const resendOtpSchema = z.object({
    email: z.string().email()
});


export const forgotPasswordSchema = z.object({
    email: z.string().email()
})

export const resetPasswordSchema = z.object({
    email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
})


