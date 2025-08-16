import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getAllPaymentsController, getPaymentDetailsController, getPaymentHistoryController, getPaymentStatsController, handleWebhookController, InitializePaymentController, processTestPaymentController, verifyPaymentController } from '../controllers/payment.controller';


const router = express.Router();

router.use(authenticate);
// Public routes
router.post('/webhook', handleWebhookController);
router.get('/verify', verifyPaymentController);

// Protected routes (require authentication)
router.use(authenticate);

// Client routes

router.get('/history', getPaymentHistoryController);

// Admin only routes
router.get('/all-payment', getAllPaymentsController);
router.get('/stats', getPaymentStatsController);
router.post('/:id', InitializePaymentController);
router.get('/:paymentId', getPaymentDetailsController);
router.post('/:id/test-charge', processTestPaymentController);
export default router;