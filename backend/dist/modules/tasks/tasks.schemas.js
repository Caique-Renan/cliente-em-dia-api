"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTasksQuerySchema = exports.updateTaskStatusSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createTaskSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('Cliente inválido').optional(),
    attendanceId: zod_1.z.string().uuid('Atendimento inválido').optional(),
    title: zod_1.z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
    description: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(client_1.TaskType).optional(),
    priority: zod_1.z.nativeEnum(client_1.Priority).optional(),
    dueDate: zod_1.z.string().datetime({ message: 'Data de vencimento inválida (formato ISO obrigatório)' }),
    assignedToId: zod_1.z.string().uuid('Responsável inválido').optional(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'O título deve ter pelo menos 2 caracteres').optional(),
    description: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(client_1.TaskType).optional(),
    priority: zod_1.z.nativeEnum(client_1.Priority).optional(),
    dueDate: zod_1.z.string().datetime({ message: 'Data de vencimento inválida' }).optional(),
    assignedToId: zod_1.z.string().uuid('Responsável inválido').optional(),
});
exports.updateTaskStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.TaskStatus),
});
exports.listTasksQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    customerId: zod_1.z.string().uuid().optional(),
    attendanceId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
    type: zod_1.z.nativeEnum(client_1.TaskType).optional(),
    priority: zod_1.z.nativeEnum(client_1.Priority).optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
    dueFrom: zod_1.z.string().datetime().optional(),
    dueTo: zod_1.z.string().datetime().optional(),
    onlyOverdue: zod_1.z.string().transform(val => val === 'true').optional(),
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(10),
});
