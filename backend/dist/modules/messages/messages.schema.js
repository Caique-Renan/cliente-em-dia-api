"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageLogSchema = exports.previewMessageSchema = exports.updateTemplateStatusSchema = exports.updateTemplateSchema = exports.createTemplateSchema = void 0;
const zod_1 = require("zod");
exports.createTemplateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Título é obrigatório'),
    content: zod_1.z.string().min(1, 'Conteúdo é obrigatório'),
    category: zod_1.z.string().optional()
});
exports.updateTemplateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    content: zod_1.z.string().min(1).optional(),
    category: zod_1.z.string().optional()
});
exports.updateTemplateStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean()
});
exports.previewMessageSchema = zod_1.z.object({
    templateId: zod_1.z.string().uuid('ID de template inválido'),
    customerId: zod_1.z.string().uuid('ID do cliente inválido'),
    attendanceId: zod_1.z.string().uuid().optional(),
    quoteId: zod_1.z.string().uuid().optional(),
    taskId: zod_1.z.string().uuid().optional()
});
exports.createMessageLogSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('ID do cliente inválido'),
    action: zod_1.z.enum(['COPIED', 'OPENED_WHATSAPP', 'MANUAL_NOTE']),
    content: zod_1.z.string().optional(),
    attendanceId: zod_1.z.string().uuid().optional(),
    quoteId: zod_1.z.string().uuid().optional(),
    taskId: zod_1.z.string().uuid().optional(),
    templateId: zod_1.z.string().uuid().optional()
});
