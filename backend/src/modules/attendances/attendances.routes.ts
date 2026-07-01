import { Router } from 'express';
import { attendancesController } from './attendances.controller';
import { requireAuth, requireActiveCompany } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth, requireActiveCompany);

router.get('/', attendancesController.list);
router.get('/:id', attendancesController.getById);
router.post('/', attendancesController.create);
router.patch('/:id', attendancesController.update);
router.patch('/:id/status', attendancesController.updateStatus);

export { router as attendancesRoutes };
