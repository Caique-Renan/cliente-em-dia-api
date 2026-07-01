import { z } from 'zod';
import { QuoteStatus } from '@prisma/client';

const quoteItemSchema = z.object({
  description: z.string().min(1, 'A descrição do item é obrigatória'),
  quantity: z.number().positive('A quantidade deve ser maior que zero'),
  unitPriceCents: z.number().int().nonnegative('O valor unitário deve ser maior ou igual a zero'),
  discountCents: z.number().int().nonnegative('O desconto deve ser maior ou igual a zero').optional().default(0),
});

export const createQuoteSchema = z.object({
  customerId: z.string().uuid('ID do cliente inválido').optional(),
  attendanceId: z.string().uuid('ID do atendimento inválido').optional(),
  title: z.string().min(2, 'O título é obrigatório e deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  status: z.nativeEnum(QuoteStatus).optional(),
  validUntil: z.string().datetime().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, 'O orçamento deve conter pelo menos um item'),
}).refine(data => data.customerId || data.attendanceId, {
  message: 'É obrigatório informar o cliente ou o atendimento vinculado',
  path: ['customerId'],
});

export const updateQuoteSchema = z.object({
  title: z.string().min(2, 'O título é obrigatório e deve ter no mínimo 2 caracteres').optional(),
  description: z.string().optional(),
  validUntil: z.string().datetime().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  deliveryTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(quoteItemSchema).min(1, 'O orçamento deve conter pelo menos um item').optional(),
});

export const updateQuoteStatusSchema = z.object({
  status: z.nativeEnum(QuoteStatus),
});

export const listQuotesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  attendanceId: z.string().uuid().optional(),
  status: z.nativeEnum(QuoteStatus).optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  minTotalCents: z.string().regex(/^\d+$/).transform(Number).optional(),
  maxTotalCents: z.string().regex(/^\d+$/).transform(Number).optional(),
});
