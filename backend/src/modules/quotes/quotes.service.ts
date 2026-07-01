import { Prisma, QuoteStatus } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';

interface QuoteItemInput {
  description: string;
  quantity: number;
  unitPriceCents: number;
  discountCents?: number;
}

interface CreateQuoteParams {
  companyId: string;
  createdById: string;
  customerId?: string;
  attendanceId?: string;
  title: string;
  description?: string;
  status?: QuoteStatus;
  validUntil?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  items: QuoteItemInput[];
}

interface UpdateQuoteParams {
  companyId: string;
  userId: string;
  id: string;
  title?: string;
  description?: string;
  validUntil?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  items?: QuoteItemInput[];
}

export const quotesService = {
  calculateItemTotals(item: QuoteItemInput) {
    // subtotal = quantity * unitPriceCents
    const quantity = new Prisma.Decimal(item.quantity);
    const unitPrice = new Prisma.Decimal(item.unitPriceCents);
    const subtotalDecimal = quantity.mul(unitPrice);
    
    // Round to nearest integer cent
    const subtotalCents = Math.round(subtotalDecimal.toNumber());
    
    const discount = item.discountCents || 0;
    // ensure discount is not greater than subtotal
    const validDiscount = Math.min(discount, subtotalCents);
    
    // totalPrice = subtotal - discount
    const totalPriceCents = Math.max(0, subtotalCents - validDiscount);

    return {
      quantity,
      unitPriceCents: item.unitPriceCents,
      discountCents: validDiscount,
      totalPriceCents,
    };
  },

  async create(data: CreateQuoteParams) {
    let finalCustomerId = data.customerId;

    // Validate relationships
    if (data.attendanceId) {
      const attendance = await prisma.attendance.findFirst({
        where: { id: data.attendanceId, companyId: data.companyId },
        select: { customerId: true },
      });

      if (!attendance) {
        throw new AppError('Atendimento não encontrado ou pertence a outra empresa', 404);
      }

      if (data.customerId && data.customerId !== attendance.customerId) {
        throw new AppError('O atendimento informado não pertence ao cliente informado', 400);
      }

      finalCustomerId = attendance.customerId;
    }

    if (!finalCustomerId) {
      throw new AppError('É obrigatório informar um cliente ou um atendimento', 400);
    }

    const customer = await prisma.customer.findFirst({
      where: { id: finalCustomerId, companyId: data.companyId },
    });

    if (!customer) {
      throw new AppError('Cliente não encontrado ou pertence a outra empresa', 404);
    }

    // Process items and calculate totals
    const processedItems = data.items.map(item => {
      const calculated = this.calculateItemTotals(item);
      return {
        description: item.description,
        quantity: calculated.quantity,
        unitPriceCents: calculated.unitPriceCents,
        discountCents: calculated.discountCents,
        totalPriceCents: calculated.totalPriceCents,
      };
    });

    const totalQuoteValueCents = processedItems.reduce((acc, item) => acc + item.totalPriceCents, 0);

    const initialStatus = data.status || 'DRAFT';
    const now = new Date();

    const [quote] = await prisma.$transaction([
      prisma.quote.create({
        data: {
          companyId: data.companyId,
          createdById: data.createdById,
          customerId: finalCustomerId,
          attendanceId: data.attendanceId,
          title: data.title,
          description: data.description,
          status: initialStatus,
          totalValueCents: totalQuoteValueCents,
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          paymentTerms: data.paymentTerms,
          deliveryTerms: data.deliveryTerms,
          notes: data.notes,
          sentAt: initialStatus === 'SENT' ? now : null,
          acceptedAt: initialStatus === 'ACCEPTED' ? now : null,
          rejectedAt: initialStatus === 'REJECTED' ? now : null,
          items: {
            create: processedItems,
          },
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true } },
        },
      }),
      prisma.activityLog.create({
        data: {
          companyId: data.companyId,
          userId: data.createdById,
          action: 'QUOTE_CREATED',
          details: `Orçamento "${data.title}" criado para cliente ${customer.name} no valor de R$ ${(totalQuoteValueCents / 100).toFixed(2)}`,
        },
      }),
    ]);

    return quote;
  },

  async findById(companyId: string, id: string) {
    const quote = await prisma.quote.findFirst({
      where: { id, companyId },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true, email: true, document: true } },
        attendance: { select: { id: true, title: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!quote) {
      throw new AppError('Orçamento não encontrado', 404);
    }

    return quote;
  },

  async list(companyId: string, filters: any) {
    const { search, customerId, attendanceId, status, createdFrom, createdTo, minTotalCents, maxTotalCents, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.QuoteWhereInput = { companyId };

    if (customerId) where.customerId = customerId;
    if (attendanceId) where.attendanceId = attendanceId;
    if (status) where.status = status;
    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo);
    }
    if (minTotalCents !== undefined || maxTotalCents !== undefined) {
      where.totalValueCents = {};
      if (minTotalCents !== undefined) where.totalValueCents.gte = minTotalCents;
      if (maxTotalCents !== undefined) where.totalValueCents.lte = maxTotalCents;
    }

    if (search) {
      const numericSearch = search.replace(/\D/g, '');
      const searchConditions: Prisma.QuoteWhereInput[] = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { document: { contains: search, mode: 'insensitive' } } },
        { attendance: { title: { contains: search, mode: 'insensitive' } } },
        { items: { some: { description: { contains: search, mode: 'insensitive' } } } },
      ];

      if (numericSearch.length > 0 && numericSearch !== search) {
        searchConditions.push(
          { customer: { phone: { contains: numericSearch, mode: 'insensitive' } } },
          { customer: { document: { contains: numericSearch, mode: 'insensitive' } } }
        );
      }

      where.OR = searchConditions;
    }

    const [total, data] = await Promise.all([
      prisma.quote.count({ where }),
      prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          attendance: { select: { id: true, title: true } },
        },
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
  },

  async update(data: UpdateQuoteParams) {
    const existing = await prisma.quote.findFirst({
      where: { id: data.id, companyId: data.companyId },
    });

    if (!existing) {
      throw new AppError('Orçamento não encontrado', 404);
    }

    let processedItems: any[] | undefined = undefined;
    let totalQuoteValueCents = existing.totalValueCents;

    if (data.items) {
      processedItems = data.items.map(item => {
        const calculated = this.calculateItemTotals(item);
        return {
          description: item.description,
          quantity: calculated.quantity,
          unitPriceCents: calculated.unitPriceCents,
          discountCents: calculated.discountCents,
          totalPriceCents: calculated.totalPriceCents,
        };
      });

      totalQuoteValueCents = processedItems.reduce((acc, item) => acc + item.totalPriceCents, 0);
    }

    const [updatedQuote] = await prisma.$transaction([
      ...(processedItems ? [prisma.quoteItem.deleteMany({ where: { quoteId: data.id } })] : []),
      prisma.quote.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          validUntil: data.validUntil ? new Date(data.validUntil) : data.validUntil === null ? null : undefined,
          paymentTerms: data.paymentTerms !== undefined ? data.paymentTerms : undefined,
          deliveryTerms: data.deliveryTerms !== undefined ? data.deliveryTerms : undefined,
          notes: data.notes !== undefined ? data.notes : undefined,
          totalValueCents: totalQuoteValueCents,
          ...(processedItems ? { items: { create: processedItems } } : {}),
        },
        include: {
          items: true,
        },
      }),
      prisma.activityLog.create({
        data: {
          companyId: data.companyId,
          userId: data.userId,
          action: 'QUOTE_UPDATED',
          details: `Orçamento "${existing.title}" atualizado`,
        },
      }),
    ]);

    return updatedQuote;
  },

  async updateStatus(companyId: string, id: string, status: QuoteStatus, userId: string) {
    const existing = await prisma.quote.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new AppError('Orçamento não encontrado', 404);
    }

    if (existing.status === status) {
      return existing; // No change
    }

    const now = new Date();
    let sentAt = existing.sentAt;
    let acceptedAt = existing.acceptedAt;
    let rejectedAt = existing.rejectedAt;

    if (status === 'SENT' && !sentAt) sentAt = now;
    if (status === 'ACCEPTED' && !acceptedAt) acceptedAt = now;
    if (status === 'REJECTED' && !rejectedAt) rejectedAt = now;

    // Se saiu de ACCEPTED, limpar acceptedAt (conforme regras)
    if (existing.status === 'ACCEPTED' && status !== 'ACCEPTED') acceptedAt = null;
    
    // Se saiu de REJECTED, limpar rejectedAt
    if (existing.status === 'REJECTED' && status !== 'REJECTED') rejectedAt = null;

    const [updatedQuote] = await prisma.$transaction([
      prisma.quote.update({
        where: { id },
        data: {
          status,
          sentAt,
          acceptedAt,
          rejectedAt,
        },
      }),
      prisma.activityLog.create({
        data: {
          companyId,
          userId,
          action: `QUOTE_${status}`,
          details: `Status do orçamento "${existing.title}" alterado de ${existing.status} para ${status}`,
        },
      }),
    ]);

    return updatedQuote;
  },
};
