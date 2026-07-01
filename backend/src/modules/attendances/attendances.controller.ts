import { Request, Response } from 'express';
import { attendancesService } from './attendances.service';
import {
  createAttendanceSchema,
  listAttendancesQuerySchema,
  updateAttendanceSchema,
  updateAttendanceStatusSchema,
} from './attendances.schemas';

export const attendancesController = {
  async list(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const query = listAttendancesQuerySchema.parse(req.query);

    const result = await attendancesService.list({
      companyId,
      ...query,
    });

    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const { id } = req.params;

    const attendance = await attendancesService.findById(companyId, id as string);
    res.json(attendance);
  },

  async create(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const userId = req.user!.userId;
    const data = createAttendanceSchema.parse(req.body);

    const attendance = await attendancesService.create({
      companyId,
      createdById: userId,
      ...data,
    });

    res.status(201).json(attendance);
  },

  async update(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const userId = req.user!.userId;
    const { id } = req.params;
    const data = updateAttendanceSchema.parse(req.body);

    const attendance = await attendancesService.update(
      {
        companyId,
        id: id as string,
        ...data,
      },
      userId
    );

    res.json(attendance);
  },

  async updateStatus(req: Request, res: Response) {
    const companyId = req.user!.activeCompanyId!;
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status, lossReason } = updateAttendanceStatusSchema.parse(req.body);

    const attendance = await attendancesService.updateStatus(companyId, id as string, status, userId, lossReason);

    res.json(attendance);
  },
};
