import { Router } from 'express';
import { CustomersController } from './customers.controller';
import { requireAuth, requireActiveCompany } from '../../middlewares/auth';

const router = Router();
const customersController = new CustomersController();

router.use(requireAuth);
router.use(requireActiveCompany);

router.post('/', customersController.create);
router.get('/', customersController.list);
router.get('/:id', customersController.findById);
router.patch('/:id', customersController.update);
router.patch('/:id/status', customersController.updateStatus);

export { router as customersRoutes };
