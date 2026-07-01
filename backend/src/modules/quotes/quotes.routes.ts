import { Router } from 'express';
import { quotesController } from './quotes.controller';
import { requireAuth, requireActiveCompany } from '../../middlewares/auth';

const router = Router();

// Todas as rotas de quotes requerem autenticação e empresa ativa
router.use(requireAuth, requireActiveCompany);

router.post('/', quotesController.create);
router.get('/', quotesController.list);
router.get('/:id', quotesController.findById);
router.patch('/:id', quotesController.update);
router.patch('/:id/status', quotesController.updateStatus);

export { router as quotesRoutes };
