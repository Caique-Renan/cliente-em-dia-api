import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { requireAuth, requireActiveCompany } from '../../middlewares/auth';

export const tasksRoutes = Router();

tasksRoutes.use(requireAuth, requireActiveCompany);

tasksRoutes.get('/', tasksController.list);
tasksRoutes.get('/:id', tasksController.getById);
tasksRoutes.post('/', tasksController.create);
tasksRoutes.patch('/:id', tasksController.update);
tasksRoutes.patch('/:id/status', tasksController.updateStatus);
tasksRoutes.patch('/:id/complete', tasksController.complete);
