import { Request, Response, NextFunction } from 'express';
import { CustomersService } from './customers.service';
import {
  createCustomerSchema,
  updateCustomerSchema,
  updateCustomerStatusSchema,
  listCustomersQuerySchema,
} from './customers.schemas';
import { AppError } from '../../errors/AppError';

export class CustomersController {
  private customersService: CustomersService;

  constructor() {
    this.customersService = new CustomersService();
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.findById = this.findById.bind(this);
    this.update = this.update.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCustomerSchema.parse(req.body);
      const companyId = req.user?.activeCompanyId;
      const userId = req.user?.userId;

      if (!companyId || !userId) {
        throw new AppError('Contexto de empresa ou usuário não encontrado', 403);
      }

      const customer = await this.customersService.create(data, companyId, userId);
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = listCustomersQuerySchema.parse(req.query);
      const companyId = req.user?.activeCompanyId;

      if (!companyId) {
        throw new AppError('Contexto de empresa não encontrado', 403);
      }

      const result = await this.customersService.list(companyId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const companyId = req.user?.activeCompanyId;

      if (!companyId) {
        throw new AppError('Contexto de empresa não encontrado', 403);
      }

      const customer = await this.customersService.findById(id, companyId);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = updateCustomerSchema.parse(req.body);
      const companyId = req.user?.activeCompanyId;
      const userId = req.user?.userId;

      if (!companyId || !userId) {
        throw new AppError('Contexto de empresa ou usuário não encontrado', 403);
      }

      const customer = await this.customersService.update(id, data, companyId, userId);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status } = updateCustomerStatusSchema.parse(req.body);
      const companyId = req.user?.activeCompanyId;
      const userId = req.user?.userId;

      if (!companyId || !userId) {
        throw new AppError('Contexto de empresa ou usuário não encontrado', 403);
      }

      const customer = await this.customersService.updateStatus(id, status, companyId, userId);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
}
