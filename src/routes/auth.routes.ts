import express from 'express';
import { rateLimiter } from '../middleware/rateLimitter.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginController, registerController, verifyOtpController } from '../controllers/auth.controller';
import { loginSchema, registerSchema, verifyOtpSchema } from '../validation/auth';



const router = express.Router();

router.post('/login', rateLimiter, registerController);
router.post('/verify-otp', rateLimiter, verifyOtpController);
router.post('/login', rateLimiter,  loginController);

export default router;