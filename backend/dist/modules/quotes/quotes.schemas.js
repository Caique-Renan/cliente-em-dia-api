"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuotesQuerySchema = exports.updateQuoteStatusSchema = exports.updateQuoteSchema = exports.createQuoteSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const quoteItemSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, 'A descrição do item é obrigatória'),
    quantity: zod_1.z.number().positive('A quantidade deve ser maior que zero'),
    unitPriceCents: zod_1.z.number().int().nonnegative('O valor unitário deve ser maior ou igual a zero'),
    discountCents: zod_1.z.number().int().nonnegative('O desconto deve ser maior ou igual a zero').optional().default(0),
});
exports.createQuoteSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('ID do cliente inválido').optional(),
    attendanceId: zod_1.z.string().uuid('ID do atendimento inválido').optional(),
    title: zod_1.z.string().min(2, 'O título é obrigatório e deve ter no mínimo 2 caracteres'),
    description: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.QuoteStatus).optional(),
    validUntil: zod_1.z.string().datetime().optional(),
    paymentTerms: zod_1.z.string().optional(),
    deliveryTerms: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(quoteItemSchema).min(1, 'O orçamento deve conter pelo menos um item'),
}).refine(data => data.customerId || data.attendanceId, {
    message: 'É obrigatório informar o cliente ou o atendimento vinculado',
    path: ['customerId'],
});
exports.updateQuoteSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'O título é obrigatório e deve ter no mínimo 2 caracteres').optional(),
    description: zod_1.z.string().optional(),
    validUntil: zod_1.z.string().datetime().optional().nullable(),
    paymentTerms: zod_1.z.string().optional().nullable(),
    deliveryTerms: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    items: zod_1.z.array(quoteItemSchema).min(1, 'O orçamento deve conter pelo menos um item').optional(),
});
exports.updateQuoteStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.QuoteStatus),
});
exports.listQuotesQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    search: zod_1.z.string().optional(),
    customerId: zod_1.z.string().uuid().optional(),
    attendanceId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.nativeEnum(client_1.QuoteStatus).optional(),
    createdFrom: zod_1.z.string().datetime().optional(),
    createdTo: zod_1.z.string().datetime().optional(),
    minTotalCents: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    maxTotalCents: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
});
