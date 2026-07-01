import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const registerSchema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        companyName: z.string().min(2),
      });

      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);

      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string(),
      });

      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async selectCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const selectCompanySchema = z.object({
        companyId: z.string().uuid(),
      });

      const { companyId } = selectCompanySchema.parse(req.body);
      const userId = req.user!.userId;

      const result = await authService.selectCompany(userId, companyId);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const activeCompanyId = req.user!.activeCompanyId; // Pode ser undefined no primeiro token

      const result = await authService.me(userId, activeCompanyId);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
