"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const AppError_1 = require("../../errors/AppError");
const prisma_1 = require("../../config/prisma");
class CustomersService {
    async create(data, companyId, userId) {
        // Start transaction to create customer and log
        const customer = await prisma_1.prisma.$transaction(async (tx) => {
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
    async list(companyId, filters) {
        const { search, source, status, page, limit } = filters;
        const skip = (page - 1) * limit;
        const where = { companyId };
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
            prisma_1.prisma.customer.count({ where }),
            prisma_1.prisma.customer.findMany({
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
    async findById(id, companyId) {
        const customer = await prisma_1.prisma.customer.findFirst({
            where: { id, companyId },
        });
        if (!customer) {
            throw new AppError_1.AppError('Cliente não encontrado', 404);
        }
        return customer;
    }
    async update(id, data, companyId, userId) {
        const customer = await this.findById(id, companyId); // Validates existence and company
        const updatedCustomer = await prisma_1.prisma.$transaction(async (tx) => {
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
    async updateStatus(id, status, companyId, userId) {
        const customer = await this.findById(id, companyId);
        const updatedCustomer = await prisma_1.prisma.$transaction(async (tx) => {
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
exports.CustomersService = CustomersService;
