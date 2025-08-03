import express from 'express';
import { adminOnly, authenticate } from '../middleware/auth.middleware';
import { createReviewController, getAdminReviewsController, getReviewsController } from '../controllers/review.controller';


const router = express.Router();

router.use(authenticate);
router.post('/:id', createReviewController);
router.get('/', getReviewsController);

// Admin route
router.use(adminOnly);
router.get('/admin', getAdminReviewsController);

export default router;