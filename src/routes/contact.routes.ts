import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { authenticate, adminOnly } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createContactSchema } from '../validation/contact.validation';

const router = Router();

/**
 * @route   POST /api/contact
 * @desc    Submit contact message (Public)
 * @access  Public
 */
router.post(
  '/',
  validateBody(createContactSchema),
  contactController.createContactMessage
);

/**
 * @route   GET /api/contact
 * @desc    Get all contact messages (Admin only)
 * @access  Admin
 */
router.get(
  '/',
  authenticate,
  adminOnly,
  contactController.getAllContactMessages
);

/**
 * @route   GET /api/contact/:id
 * @desc    Get contact message by ID (Admin only)
 * @access  Admin
 */
router.get(
  '/:id',
  authenticate,
  adminOnly,
  contactController.getContactMessageById
);

/**
 * @route   PATCH /api/contact/:id/read
 * @desc    Mark contact message as read (Admin only)
 * @access  Admin
 */
router.patch(
  '/:id/read',
  authenticate,
  adminOnly,
  contactController.markContactAsRead
);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Delete contact message (Admin only)
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  adminOnly,
  contactController.deleteContactMessage
);

export default router;
