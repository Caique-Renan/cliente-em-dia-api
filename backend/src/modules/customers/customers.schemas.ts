import { z } from 'zod';
import { CustomerSource, CustomerStatus } from '@prisma/client';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  document: z.string().optional().nullable(),
  phone: z.string().min(1, 'O telefone é obrigatório'),
  email: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  source: z.nativeEnum(CustomerSource).optional().default(CustomerSource.OTHER),
  status: z.nativeEnum(CustomerStatus).optional().default(CustomerStatus.ACTIVE),
  notes: z.string().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').optional(),
  document: z.string().optional().nullable(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  source: z.nativeEnum(CustomerSource).optional(),
  notes: z.string().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
});

export const updateCustomerStatusSchema = z.object({
  status: z.nativeEnum(CustomerStatus),
});

export const listCustomersQuerySchema = z.object({
  search: z.string().optional(),
  source: z.nativeEnum(CustomerSource).optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  page: z.string().regex(/^\d+$/).optional().default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).optional().default('10').transform(Number),
}).transform(data => ({
  ...data,
  limit: data.limit > 50 ? 50 : data.limit
}));
