import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller';
import { authenticate, adminOnly } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createFeedbackSchema } from '../validation/feedback.validation';

const router = Router();

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback (Public)
 * @access  Public
 */
router.post(
  '/',
  validateBody(createFeedbackSchema),
  feedbackController.createFeedback
);

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback (Admin only)
 * @access  Admin
 */
router.get(
  '/',
  authenticate,
  adminOnly,
  feedbackController.getAllFeedback
);

/**
 * @route   PATCH /api/feedback/:id/read
 * @desc    Mark feedback as read (Admin only)
 * @access  Admin
 */
router.patch(
  '/:id/read',
  authenticate,
  adminOnly,
  feedbackController.markFeedbackAsRead
);

/**
 * @route   DELETE /api/feedback/:id
 * @desc    Delete feedback (Admin only)
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  adminOnly,
  feedbackController.deleteFeedback
);

export default router;
