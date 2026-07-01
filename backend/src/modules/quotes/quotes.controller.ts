import { Request, Response } from 'express';
import { quotesService } from './quotes.service';
import {
  createQuoteSchema,
  updateQuoteSchema,
  updateQuoteStatusSchema,
  listQuotesQuerySchema,
} from './quotes.schemas';

export class QuotesController {
  async create(req: Request, res: Response) {
    const data = createQuoteSchema.parse(req.body);
    const companyId = req.user!.activeCompanyId!;
    const createdById = req.user!.userId;
    
    const quote = await quotesService.create({
      ...data,
      companyId,
      createdById,
    });
    return res.status(201).json(quote);
  }

  async list(req: Request, res: Response) {
    const filters = listQuotesQuerySchema.parse(req.query);
    const companyId = req.user!.activeCompanyId!;
    const result = await quotesService.list(companyId, filters);
    return res.json(result);
  }

  async findById(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const id = req.params.id as string;
    const quote = await quotesService.findById(companyId, id);
    return res.json(quote);
  }

  async update(req: Request, res: Response) {
    const data = updateQuoteSchema.parse(req.body);
    const companyId = req.user!.activeCompanyId!;
    const userId = req.user!.userId;
    const id = req.params.id as string;
    
    const quote = await quotesService.update({
      ...data,
      id,
      companyId,
      userId,
    });
    return res.json(quote);
  }

  async updateStatus(req: Request, res: Response) {
    const { status } = updateQuoteStatusSchema.parse(req.body);
    const companyId = req.user!.activeCompanyId!;
    const userId = req.user!.userId;
    const id = req.params.id as string;
    
    const quote = await quotesService.updateStatus(
      companyId,
      id,
      status,
      userId
    );
    return res.json(quote);
  }
}

export const quotesController = new QuotesController();
