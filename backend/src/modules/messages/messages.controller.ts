import { Request, Response } from 'express';
import { messagesService } from './messages.service';
import {
  createTemplateSchema,
  updateTemplateSchema,
  updateTemplateStatusSchema,
  previewMessageSchema,
  createMessageLogSchema
} from './messages.schema';

export class MessagesController {
  async listTemplates(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const templates = await messagesService.listTemplates(companyId);
    return res.json({ data: templates });
  }

  async getTemplate(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const id = req.params.id as string;
    const template = await messagesService.findTemplateById(companyId, id);
    return res.json(template);
  }

  async createTemplate(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const createdById = req.user!.userId;
    const data = createTemplateSchema.parse(req.body);
    const template = await messagesService.createTemplate(companyId, createdById, data);
    return res.status(201).json(template);
  }

  async updateTemplate(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const id = req.params.id as string;
    const data = updateTemplateSchema.parse(req.body);
    const template = await messagesService.updateTemplate(companyId, id, data);
    return res.json(template);
  }

  async updateTemplateStatus(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const id = req.params.id as string;
    const data = updateTemplateStatusSchema.parse(req.body);
    const template = await messagesService.updateTemplateStatus(companyId, id, data);
    return res.json(template);
  }

  async previewMessage(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const data = previewMessageSchema.parse(req.body);
    const result = await messagesService.previewMessage(companyId, data);
    return res.json(result);
  }

  async createLog(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const userId = req.user!.userId;
    const data = createMessageLogSchema.parse(req.body);
    const log = await messagesService.createLog(companyId, userId, data);
    return res.status(201).json(log);
  }
}

export const messagesController = new MessagesController();
