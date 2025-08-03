import express from 'express';
import { createGuideController, deleteGuideController, getGuideByIdController, getGuideController, updateGuideController } from '../../controllers/admin/guide.controller';
import { adminOnly, authenticate } from '../../middleware/auth.middleware';


const router = express.Router();

// Public routes
router.use(authenticate);
router.get('/', getGuideController);
router.get('/:id', getGuideByIdController);

// Admin routes
router.use(adminOnly);
router.post('/', createGuideController);
router.put('/:id', updateGuideController);
router.delete('/:id', deleteGuideController);

export default router;