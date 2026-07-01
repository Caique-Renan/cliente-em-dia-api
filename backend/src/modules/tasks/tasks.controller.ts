import { Request, Response } from 'express';
import { tasksService } from './tasks.service';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  listTasksQuerySchema,
} from './tasks.schemas';
import { ZodError } from 'zod';

export class TasksController {
  async create(req: Request, res: Response) {
    const data = createTaskSchema.parse(req.body);
    const companyId = req.user!.activeCompanyId!;
    const userId = req.user!.userId;
    const task = await tasksService.create(companyId, userId, data);
    return res.status(201).json(task);
  }

  async list(req: Request, res: Response) {
    const filters = listTasksQuerySchema.parse(req.query);
    const companyId = req.user!.activeCompanyId!;
    const result = await tasksService.list(companyId, filters);
    return res.json(result);
  }

  async getById(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const id = req.params.id as string;
    const task = await tasksService.getById(id, companyId);
    return res.json(task);
  }

  async update(req: Request, res: Response) {
    const data = updateTaskSchema.parse(req.body);
    const companyId = req.user!.activeCompanyId!;
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const task = await tasksService.update(id, companyId, userId, data);
    return res.json(task);
  }

  async updateStatus(req: Request, res: Response) {
    const { status } = updateTaskStatusSchema.parse(req.body);
    const companyId = req.user!.activeCompanyId!;
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const task = await tasksService.updateStatus(id, companyId, userId, status);
    return res.json(task);
  }

  async complete(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const task = await tasksService.complete(id, companyId, userId);
    return res.json(task);
  }
}

export const tasksController = new TasksController();
