"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksService = exports.TasksService = void 0;
const prisma_1 = require("../../config/prisma");
const AppError_1 = require("../../errors/AppError");
class TasksService {
    async create(companyId, userId, data) {
        let resolvedCustomerId = data.customerId;
        if (data.attendanceId) {
            const attendance = await prisma_1.prisma.attendance.findUnique({
                where: { id: data.attendanceId },
            });
            if (!attendance || attendance.companyId !== companyId) {
                throw new AppError_1.AppError('Atendimento não encontrado ou não pertence a esta empresa', 404);
            }
            if (data.customerId && data.customerId !== attendance.customerId) {
                throw new AppError_1.AppError('O atendimento informado não pertence ao cliente informado', 400);
            }
            resolvedCustomerId = attendance.customerId;
        }
        if (resolvedCustomerId && !data.attendanceId) {
            const customer = await prisma_1.prisma.customer.findUnique({
                where: { id: resolvedCustomerId },
            });
            if (!customer || customer.companyId !== companyId) {
                throw new AppError_1.AppError('Cliente não encontrado ou não pertence a esta empresa', 404);
            }
        }
        const task = await prisma_1.prisma.task.create({
            data: {
                companyId,
                title: data.title,
                description: data.description,
                dueDate: new Date(data.dueDate),
                customerId: resolvedCustomerId,
                attendanceId: data.attendanceId,
                type: data.type || 'OTHER',
                priority: data.priority || 'NORMAL',
                status: 'TODO',
                assignedToId: data.assignedToId || userId,
                createdById: userId,
            },
            include: {
                customer: { select: { id: true, name: true } },
                attendance: { select: { id: true, title: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        });
        await prisma_1.prisma.activityLog.create({
            data: {
                companyId,
                userId,
                action: 'TASK_CREATED',
                details: `Tarefa criada: ${task.title}`,
            },
        });
        return task;
    }
    async list(companyId, filters) {
        const { search, customerId, attendanceId, status, type, priority, assignedToId, dueFrom, dueTo, onlyOverdue, page = 1, limit = 10, } = filters;
        const limitNumber = Math.min(Number(limit), 50);
        const skip = (Number(page) - 1) * limitNumber;
        const where = { companyId };
        if (customerId)
            where.customerId = customerId;
        if (attendanceId)
            where.attendanceId = attendanceId;
        if (status)
            where.status = status;
        if (type)
            where.type = type;
        if (priority)
            where.priority = priority;
        if (assignedToId)
            where.assignedToId = assignedToId;
        if (dueFrom || dueTo) {
            where.dueDate = {};
            if (dueFrom)
                where.dueDate.gte = new Date(dueFrom);
            if (dueTo)
                where.dueDate.lte = new Date(dueTo);
        }
        if (onlyOverdue) {
            where.dueDate = { ...where.dueDate, lt: new Date() };
            where.status = { notIn: ['DONE', 'CANCELED'] };
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
                { customer: { phone: { contains: search, mode: 'insensitive' } } },
                { attendance: { title: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [total, tasks] = await Promise.all([
            prisma_1.prisma.task.count({ where }),
            prisma_1.prisma.task.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: { dueDate: 'asc' },
                include: {
                    customer: { select: { id: true, name: true } },
                    attendance: { select: { id: true, title: true } },
                    assignedTo: { select: { id: true, name: true } },
                },
            }),
        ]);
        return {
            data: tasks,
            pagination: {
                page: Number(page),
                limit: limitNumber,
                total,
                totalPages: Math.ceil(total / limitNumber),
            },
        };
    }
    async getById(id, companyId) {
        const task = await prisma_1.prisma.task.findUnique({
            where: { id },
            include: {
                customer: { select: { id: true, name: true } },
                attendance: { select: { id: true, title: true } },
                assignedTo: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } },
            },
        });
        if (!task || task.companyId !== companyId) {
            throw new AppError_1.AppError('Tarefa não encontrada', 404);
        }
        return task;
    }
    async update(id, companyId, userId, data) {
        const task = await this.getById(id, companyId);
        const updatedTask = await prisma_1.prisma.task.update({
            where: { id: task.id },
            data: {
                title: data.title !== undefined ? data.title : undefined,
                description: data.description !== undefined ? data.description : undefined,
                type: data.type !== undefined ? data.type : undefined,
                priority: data.priority !== undefined ? data.priority : undefined,
                assignedToId: data.assignedToId !== undefined ? data.assignedToId : undefined,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            },
            include: {
                customer: { select: { id: true, name: true } },
                attendance: { select: { id: true, title: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        });
        await prisma_1.prisma.activityLog.create({
            data: {
                companyId,
                userId,
                action: 'TASK_UPDATED',
                details: `Tarefa atualizada: ${updatedTask.title}`,
            },
        });
        return updatedTask;
    }
    async updateStatus(id, companyId, userId, status) {
        const task = await this.getById(id, companyId);
        const dataToUpdate = { status };
        if (status === 'DONE' && task.status !== 'DONE') {
            dataToUpdate.completedAt = new Date();
        }
        else if (status !== 'DONE' && task.status === 'DONE') {
            dataToUpdate.completedAt = null;
        }
        const updatedTask = await prisma_1.prisma.task.update({
            where: { id: task.id },
            data: dataToUpdate,
            include: {
                customer: { select: { id: true, name: true } },
                attendance: { select: { id: true, title: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        });
        const actionLog = status === 'CANCELED' ? 'TASK_CANCELED' : 'TASK_STATUS_CHANGED';
        await prisma_1.prisma.activityLog.create({
            data: {
                companyId,
                userId,
                action: actionLog,
                details: `Status da tarefa alterado para ${status}: ${updatedTask.title}`,
            },
        });
        return updatedTask;
    }
    async complete(id, companyId, userId) {
        const task = await this.getById(id, companyId);
        if (task.status === 'DONE') {
            return task;
        }
        const updatedTask = await prisma_1.prisma.task.update({
            where: { id: task.id },
            data: {
                status: 'DONE',
                completedAt: new Date(),
            },
            include: {
                customer: { select: { id: true, name: true } },
                attendance: { select: { id: true, title: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        });
        await prisma_1.prisma.activityLog.create({
            data: {
                companyId,
                userId,
                action: 'TASK_COMPLETED',
                details: `Tarefa concluída: ${updatedTask.title}`,
            },
        });
        return updatedTask;
    }
}
exports.TasksService = TasksService;
exports.tasksService = new TasksService();
