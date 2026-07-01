import { Request, Response } from 'express';
import { reportsService } from './reports.service';
import { overviewQuerySchema, resolvePeriod } from './reports.schema';

export class ReportsController {
  async getOverview(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const rawQuery  = overviewQuerySchema.parse(req.query);
    const period    = resolvePeriod(rawQuery);
    const overview  = await reportsService.getOverview(companyId, period);
    return res.json(overview);
  }
}

export const reportsController = new ReportsController();
