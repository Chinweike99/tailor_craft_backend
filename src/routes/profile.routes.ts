import express from 'express';
// import upload from '../middleware/upload';
import { getProfileController, updateProfileController, uploadProfileImageController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getProfileController);
router.patch('/', updateProfileController);
router.post('/upload', upload.single('image'), uploadProfileImageController);

export default router;