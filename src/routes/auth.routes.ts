import express from 'express';
import { rateLimiter } from '../middleware/rateLimitter.middleware';
import { forgotPasswordController, loginController, logoutController, refreshTokenController, registerController, resetPasswordController, verifyOtpController } from '../controllers/auth.controller';



const router = express.Router();

router.post('/register', rateLimiter, registerController);
router.post('/verify-otp', rateLimiter, verifyOtpController);
router.post('/login', rateLimiter,  loginController);
router.post('/refresh-token', refreshTokenController);
router.post('/forgot-password', rateLimiter, forgotPasswordController);
router.post('/reset-password', rateLimiter, resetPasswordController);
router.post('/logout', logoutController)

export default router;