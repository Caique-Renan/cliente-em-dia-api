"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCustomersQuerySchema = exports.updateCustomerStatusSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    document: zod_1.z.string().optional().nullable(),
    phone: zod_1.z.string().min(1, 'O telefone é obrigatório'),
    email: zod_1.z.string().email('E-mail inválido').optional().nullable().or(zod_1.z.literal('')),
    city: zod_1.z.string().optional().nullable(),
    district: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    source: zod_1.z.nativeEnum(client_1.CustomerSource).optional().default(client_1.CustomerSource.OTHER),
    status: zod_1.z.nativeEnum(client_1.CustomerStatus).optional().default(client_1.CustomerStatus.ACTIVE),
    notes: zod_1.z.string().optional().nullable(),
    assignedToId: zod_1.z.string().uuid().optional().nullable(),
});
exports.updateCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').optional(),
    document: zod_1.z.string().optional().nullable(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email('E-mail inválido').optional().nullable().or(zod_1.z.literal('')),
    city: zod_1.z.string().optional().nullable(),
    district: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    source: zod_1.z.nativeEnum(client_1.CustomerSource).optional(),
    notes: zod_1.z.string().optional().nullable(),
    assignedToId: zod_1.z.string().uuid().optional().nullable(),
});
exports.updateCustomerStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.CustomerStatus),
});
exports.listCustomersQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    source: zod_1.z.nativeEnum(client_1.CustomerSource).optional(),
    status: zod_1.z.nativeEnum(client_1.CustomerStatus).optional(),
    page: zod_1.z.string().regex(/^\d+$/).optional().default('1').transform(Number),
    limit: zod_1.z.string().regex(/^\d+$/).optional().default('10').transform(Number),
}).transform(data => ({
    ...data,
    limit: data.limit > 50 ? 50 : data.limit
}));
