import express from 'express';
import { adminOnly, authenticate } from '../../middleware/auth.middleware';
import { deleteClientController, getAdminStatsController, getAllClientsController, getClientByIdCntroller } from '../../controllers/admin/admin.controller';


const router = express.Router();

router.use(authenticate);
router.use(adminOnly);

router.get('/', getAllClientsController);
router.get('/stats', getAdminStatsController);
router.get('/:id', getClientByIdCntroller);
router.delete('/:id', deleteClientController);

export default router;