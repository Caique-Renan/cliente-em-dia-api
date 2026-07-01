import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthPayload {
  userId: string;
  activeCompanyId?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Token missing' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export function requireActiveCompany(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.activeCompanyId) {
    return res.status(403).json({ error: 'Forbidden', message: 'Active company required' });
  }
  return next();
}
