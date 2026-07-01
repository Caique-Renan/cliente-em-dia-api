import { CustomerStatus, Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';

export class CustomersService {
  async create(data: any, companyId: string, userId: string) {
    // Start transaction to create customer and log
    const customer = await prisma.$transaction(async (tx) => {
      const newCustomer = await tx.customer.create({
        data: {
          ...data,
          companyId,
          createdById: userId,
        },
      });

      await tx.activityLog.create({
        data: {
          companyId,
          userId,
          action: 'CUSTOMER_CREATED',
          details: `Cliente ${newCustomer.name} criado.`,
        },
      });

      return newCustomer;
    });

    return customer;
  }

  async list(companyId: string, filters: any) {
    const { search, source, status, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = { companyId };

    if (source) {
      where.source = source;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      const numericSearch = search.replace(/\D/g, '');
      
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
      ];

      if (numericSearch.length > 0 && numericSearch !== search) {
        where.OR.push({ document: { contains: numericSearch, mode: 'insensitive' } });
        where.OR.push({ phone: { contains: numericSearch, mode: 'insensitive' } });
      }
    }

    const [total, data] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { updatedAt: 'desc' },
          { createdAt: 'desc' },
          { name: 'asc' }
        ],
      }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, companyId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!customer) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return customer;
  }

  async update(id: string, data: any, companyId: string, userId: string) {
    const customer = await this.findById(id, companyId); // Validates existence and company

    const updatedCustomer = await prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({
        where: { id },
        data,
      });

      await tx.activityLog.create({
        data: {
          companyId,
          userId,
          action: 'CUSTOMER_UPDATED',
          details: `Cliente ${updated.name} editado.`,
        },
      });

      return updated;
    });

    return updatedCustomer;
  }

  async updateStatus(id: string, status: CustomerStatus, companyId: string, userId: string) {
    const customer = await this.findById(id, companyId);

    const updatedCustomer = await prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({
        where: { id },
        data: { status },
      });

      await tx.activityLog.create({
        data: {
          companyId,
          userId,
          action: 'CUSTOMER_STATUS_CHANGED',
          details: `Status do cliente ${updated.name} alterado para ${status}.`,
        },
      });

      return updated;
    });

    return updatedCustomer;
  }
}
