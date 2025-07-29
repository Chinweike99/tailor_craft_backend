import express from 'express';
import { rateLimiter } from '../middleware/rateLimitter.middleware';
import { loginController, registerController, verifyOtpController } from '../controllers/auth.controller';



const router = express.Router();

router.post('/register', rateLimiter, registerController);
router.post('/verify-otp', rateLimiter, verifyOtpController);
router.post('/login', rateLimiter,  loginController);

export default router;