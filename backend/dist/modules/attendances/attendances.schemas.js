"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAttendancesQuerySchema = exports.updateAttendanceStatusSchema = exports.updateAttendanceSchema = exports.createAttendanceSchema = exports.CustomerSourceEnum = exports.PriorityEnum = exports.AttendanceStatusEnum = void 0;
const zod_1 = require("zod");
exports.AttendanceStatusEnum = {
    NEW: 'NEW',
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING_CUSTOMER: 'WAITING_CUSTOMER',
    QUOTE_SENT: 'QUOTE_SENT',
    NEGOTIATION: 'NEGOTIATION',
    WON: 'WON',
    LOST: 'LOST',
    POST_SALE: 'POST_SALE',
    CANCELED: 'CANCELED',
};
exports.PriorityEnum = {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
};
exports.CustomerSourceEnum = {
    WHATSAPP: 'WHATSAPP',
    INSTAGRAM: 'INSTAGRAM',
    FACEBOOK: 'FACEBOOK',
    GOOGLE: 'GOOGLE',
    REFERRAL: 'REFERRAL',
    WALK_IN: 'WALK_IN',
    PHONE: 'PHONE',
    WEBSITE: 'WEBSITE',
    ADS: 'ADS',
    OTHER: 'OTHER',
};
exports.createAttendanceSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('ID do cliente inválido'),
    title: zod_1.z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
    description: zod_1.z.string().optional(),
    source: zod_1.z.nativeEnum(exports.CustomerSourceEnum).optional(),
    priority: zod_1.z.nativeEnum(exports.PriorityEnum).optional(),
    potentialValueCents: zod_1.z.number().int('Deve ser um número inteiro').min(0, 'Não pode ser negativo').optional(),
    assignedToId: zod_1.z.string().uuid('ID de usuário inválido').optional(),
});
exports.updateAttendanceSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'O título deve ter pelo menos 2 caracteres').optional(),
    description: zod_1.z.string().optional(),
    source: zod_1.z.nativeEnum(exports.CustomerSourceEnum).optional(),
    priority: zod_1.z.nativeEnum(exports.PriorityEnum).optional(),
    potentialValueCents: zod_1.z.number().int('Deve ser um número inteiro').min(0, 'Não pode ser negativo').optional(),
    assignedToId: zod_1.z.string().uuid('ID de usuário inválido').optional(),
});
exports.updateAttendanceStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(exports.AttendanceStatusEnum),
    lossReason: zod_1.z.string().optional(),
});
exports.listAttendancesQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(50).default(10),
    search: zod_1.z.string().optional(),
    customerId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.nativeEnum(exports.AttendanceStatusEnum).optional(),
    source: zod_1.z.nativeEnum(exports.CustomerSourceEnum).optional(),
    priority: zod_1.z.nativeEnum(exports.PriorityEnum).optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
});
