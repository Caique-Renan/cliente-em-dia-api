import { Prisma, AttendanceStatus, Priority, CustomerSource } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';

interface ListAttendancesParams {
  companyId: string;
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: AttendanceStatus;
  source?: CustomerSource;
  priority?: Priority;
  assignedToId?: string;
}

interface CreateAttendanceParams {
  companyId: string;
  createdById: string;
  customerId: string;
  title: string;
  description?: string;
  source?: CustomerSource;
  priority?: Priority;
  potentialValueCents?: number;
  assignedToId?: string;
}

interface UpdateAttendanceParams {
  companyId: string;
  id: string;
  title?: string;
  description?: string;
  source?: CustomerSource;
  priority?: Priority;
  potentialValueCents?: number;
  assignedToId?: string;
}

export const attendancesService = {
  async list({
    companyId,
    page = 1,
    limit = 10,
    search,
    customerId,
    status,
    source,
    priority,
    assignedToId,
  }: ListAttendancesParams) {
    const skip = (page - 1) * limit;

    const searchConditions: Prisma.AttendanceWhereInput[] = [];
    if (search) {
      const numericSearch = search.replace(/\D/g, '');
      searchConditions.push(
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { document: { contains: search, mode: 'insensitive' } } }
      );
      if (numericSearch.length > 0 && numericSearch !== search) {
        searchConditions.push(
          { customer: { phone: { contains: numericSearch, mode: 'insensitive' } } },
          { customer: { document: { contains: numericSearch, mode: 'insensitive' } } }
        );
      }
    }

    const where: Prisma.AttendanceWhereInput = {
      companyId,
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(source && { source }),
      ...(priority && { priority }),
      ...(assignedToId && { assignedToId }),
      ...(search && { OR: searchConditions }),
    };

    const [total, attendances] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { updatedAt: 'desc' },
          { lastInteractionAt: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      data: attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(companyId: string, id: string) {
    const attendance = await prisma.attendance.findFirst({
      where: { id, companyId },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!attendance) {
      throw new AppError('Atendimento não encontrado', 404);
    }

    return attendance;
  },

  async create(data: CreateAttendanceParams) {
    // Validate if customer exists and belongs to the active company
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, companyId: data.companyId },
    });

    if (!customer) {
      throw new AppError('Cliente não encontrado ou pertence a outra empresa', 404);
    }

    const assignedToId = data.assignedToId || data.createdById;

    const [attendance] = await prisma.$transaction([
      prisma.attendance.create({
        data: {
          companyId: data.companyId,
          createdById: data.createdById,
          customerId: data.customerId,
          title: data.title,
          description: data.description,
          source: data.source,
          priority: data.priority,
          potentialValueCents: data.potentialValueCents,
          assignedToId: assignedToId,
          status: 'NEW',
          lastInteractionAt: new Date(),
        },
        include: {
          customer: { select: { id: true, name: true } },
        },
      }),
      prisma.activityLog.create({
        data: {
          companyId: data.companyId,
          userId: data.createdById,
          action: 'ATTENDANCE_CREATED',
          details: `Atendimento "${data.title}" criado para cliente ${customer.name}`,
        },
      }),
    ]);

    return attendance;
  },

  async update(data: UpdateAttendanceParams, userId: string) {
    const existing = await prisma.attendance.findFirst({
      where: { id: data.id, companyId: data.companyId },
    });

    if (!existing) {
      throw new AppError('Atendimento não encontrado', 404);
    }

    const [attendance] = await prisma.$transaction([
      prisma.attendance.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          source: data.source,
          priority: data.priority,
          potentialValueCents: data.potentialValueCents,
          assignedToId: data.assignedToId,
        },
      }),
      prisma.activityLog.create({
        data: {
          companyId: data.companyId,
          userId,
          action: 'ATTENDANCE_UPDATED',
          details: `Atendimento "${existing.title}" (ID: ${existing.id}) atualizado`,
        },
      }),
    ]);

    return attendance;
  },

  async updateStatus(companyId: string, id: string, status: AttendanceStatus, userId: string, lossReason?: string) {
    const existing = await prisma.attendance.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new AppError('Atendimento não encontrado', 404);
    }

    let closedAt: Date | null | undefined = undefined;

    if (status === 'WON' || status === 'LOST' || status === 'CANCELED') {
      closedAt = existing.closedAt ? undefined : new Date();
    } else {
      // Re-opening
      closedAt = null;
    }

    const [attendance] = await prisma.$transaction([
      prisma.attendance.update({
        where: { id },
        data: {
          status,
          lossReason: status === 'LOST' ? lossReason : null,
          lastInteractionAt: new Date(),
          closedAt,
        },
      }),
      prisma.activityLog.create({
        data: {
          companyId,
          userId,
          action: 'ATTENDANCE_STATUS_CHANGED',
          details: `Atendimento "${existing.title}" mudou de status: ${existing.status} -> ${status}`,
        },
      }),
    ]);

    return attendance;
  },
};
