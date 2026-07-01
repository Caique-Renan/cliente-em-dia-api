import { Router } from 'express';
import { reportsController } from './reports.controller';
import { requireAuth, requireActiveCompany } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth, requireActiveCompany);

router.get('/overview', reportsController.getOverview);

export { router as reportsRoutes };
