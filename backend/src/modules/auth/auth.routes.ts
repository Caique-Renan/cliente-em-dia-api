import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth, requireActiveCompany } from '../../middlewares/auth';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/select-company', requireAuth, authController.selectCompany);
router.get('/me', requireAuth, authController.me);

export { router as authRoutes };
