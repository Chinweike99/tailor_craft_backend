import express from 'express';
import { createDesignController, deleteDesignController, getDesignByIdController, getDesignsController, updateDesignController } from '../../controllers/admin/design.controller';
import { adminOnly, authenticate } from '../../middleware/auth.middleware';
import upload from '../../middleware/upload.middleware';


const router = express.Router();

// Public routes
router.use(authenticate);
router.get('/', getDesignsController);
router.get('/:id', getDesignByIdController);

// Admin routes
router.use(adminOnly);
router.post('/', upload.array('images', 5), createDesignController);
router.put('/:id', updateDesignController);
router.delete('/:id', deleteDesignController);

export default router;