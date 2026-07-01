"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesService = exports.MessagesService = void 0;
const prisma_1 = require("../../config/prisma");
const AppError_1 = require("../../errors/AppError");
class MessagesService {
    async listTemplates(companyId) {
        return prisma_1.prisma.messageTemplate.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findTemplateById(companyId, templateId) {
        const template = await prisma_1.prisma.messageTemplate.findFirst({
            where: { id: templateId, companyId }
        });
        if (!template) {
            throw new AppError_1.AppError('Template não encontrado', 404);
        }
        return template;
    }
    async createTemplate(companyId, createdById, data) {
        return prisma_1.prisma.messageTemplate.create({
            data: {
                companyId,
                createdById,
                ...data
            }
        });
    }
    async updateTemplate(companyId, templateId, data) {
        await this.findTemplateById(companyId, templateId);
        return prisma_1.prisma.messageTemplate.update({
            where: { id: templateId },
            data
        });
    }
    async updateTemplateStatus(companyId, templateId, data) {
        await this.findTemplateById(companyId, templateId);
        return prisma_1.prisma.messageTemplate.update({
            where: { id: templateId },
            data
        });
    }
    async createLog(companyId, userId, data) {
        // Validate relations belong to company
        const customer = await prisma_1.prisma.customer.findFirst({ where: { id: data.customerId, companyId } });
        if (!customer)
            throw new AppError_1.AppError('Cliente não encontrado ou não pertence a esta empresa', 404);
        if (data.attendanceId) {
            const attendance = await prisma_1.prisma.attendance.findFirst({ where: { id: data.attendanceId, companyId, customerId: data.customerId } });
            if (!attendance)
                throw new AppError_1.AppError('Atendimento não encontrado, não pertence a esta empresa ou a este cliente', 404);
        }
        if (data.quoteId) {
            const quote = await prisma_1.prisma.quote.findFirst({ where: { id: data.quoteId, companyId, customerId: data.customerId } });
            if (!quote)
                throw new AppError_1.AppError('Orçamento não encontrado, não pertence a esta empresa ou a este cliente', 404);
            if (data.attendanceId && quote.attendanceId !== data.attendanceId) {
                throw new AppError_1.AppError('Orçamento não pertence ao atendimento especificado', 400);
            }
        }
        if (data.taskId) {
            const task = await prisma_1.prisma.task.findFirst({ where: { id: data.taskId, companyId } });
            if (!task)
                throw new AppError_1.AppError('Tarefa não encontrada ou não pertence a esta empresa', 404);
            if (task.customerId && task.customerId !== data.customerId) {
                throw new AppError_1.AppError('Tarefa não pertence ao cliente especificado', 400);
            }
        }
        if (data.templateId) {
            await this.findTemplateById(companyId, data.templateId);
        }
        return prisma_1.prisma.messageLog.create({
            data: {
                companyId,
                userId,
                ...data
            }
        });
    }
    async previewMessage(companyId, data) {
        const template = await this.findTemplateById(companyId, data.templateId);
        // Validate relationships
        const customer = await prisma_1.prisma.customer.findFirst({ where: { id: data.customerId, companyId } });
        if (!customer)
            throw new AppError_1.AppError('Cliente não encontrado ou não pertence a esta empresa', 404);
        let attendance = null;
        if (data.attendanceId) {
            attendance = await prisma_1.prisma.attendance.findFirst({ where: { id: data.attendanceId, companyId, customerId: data.customerId } });
            if (!attendance)
                throw new AppError_1.AppError('Atendimento não encontrado, não pertence a esta empresa ou a este cliente', 404);
        }
        let quote = null;
        if (data.quoteId) {
            quote = await prisma_1.prisma.quote.findFirst({ where: { id: data.quoteId, companyId, customerId: data.customerId } });
            if (!quote)
                throw new AppError_1.AppError('Orçamento não encontrado, não pertence a esta empresa ou a este cliente', 404);
            if (data.attendanceId && quote.attendanceId !== data.attendanceId) {
                throw new AppError_1.AppError('Orçamento não pertence ao atendimento especificado', 400);
            }
        }
        let task = null;
        if (data.taskId) {
            task = await prisma_1.prisma.task.findFirst({ where: { id: data.taskId, companyId } });
            if (!task)
                throw new AppError_1.AppError('Tarefa não encontrada ou não pertence a esta empresa', 404);
            if (task.customerId && task.customerId !== data.customerId) {
                throw new AppError_1.AppError('Tarefa não pertence ao cliente especificado', 400);
            }
        }
        const company = await prisma_1.prisma.company.findUnique({ where: { id: companyId } });
        // Status translations
        const quoteStatusMap = {
            DRAFT: 'Rascunho',
            SENT: 'Enviado',
            ACCEPTED: 'Aceito',
            REJECTED: 'Recusado',
            EXPIRED: 'Expirado'
        };
        // Replace variables
        let content = template.content;
        content = content.replace(/\{\{customerName\}\}/g, customer.name || '[Cliente não informado]');
        content = content.replace(/\{\{companyName\}\}/g, company?.name || '[Empresa não informada]');
        content = content.replace(/\{\{attendanceTitle\}\}/g, attendance?.title || '[Atendimento não informado]');
        if (quote) {
            const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.totalValueCents / 100);
            content = content.replace(/\{\{quoteTotal\}\}/g, formattedTotal);
            content = content.replace(/\{\{quoteStatus\}\}/g, quoteStatusMap[quote.status] || quote.status);
        }
        else {
            content = content.replace(/\{\{quoteTotal\}\}/g, '[Orçamento não informado]');
            content = content.replace(/\{\{quoteStatus\}\}/g, '[Orçamento não informado]');
        }
        content = content.replace(/\{\{taskTitle\}\}/g, task?.title || '[Tarefa não informada]');
        if (task && task.dueDate) {
            const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(task.dueDate));
            content = content.replace(/\{\{dueDate\}\}/g, formattedDate);
        }
        else {
            content = content.replace(/\{\{dueDate\}\}/g, '[Data não informada]');
        }
        return { content };
    }
}
exports.MessagesService = MessagesService;
exports.messagesService = new MessagesService();
