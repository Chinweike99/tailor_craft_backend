import express from 'express';
import { adminOnly, authenticate } from '../middleware/auth.middleware';
import { createBookingController, getAdminBookingsController, getBookingByIdController, getBookingController, updateBookingStatusController } from '../controllers/booking.controller';

const router = express.Router();

// Client routes
router.use(authenticate);
router.post('/', createBookingController);
router.get('/', getBookingController);
router.get('/:id', getBookingByIdController);

// Admin routes
// router.use(adminOnly);
router.patch('/:id/status', adminOnly, updateBookingStatusController);
router.get('/admin/all', adminOnly, getAdminBookingsController);


export default router;