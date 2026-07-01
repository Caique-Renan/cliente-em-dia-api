import { z } from 'zod';

export const AttendanceStatusEnum = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_CUSTOMER: 'WAITING_CUSTOMER',
  QUOTE_SENT: 'QUOTE_SENT',
  NEGOTIATION: 'NEGOTIATION',
  WON: 'WON',
  LOST: 'LOST',
  POST_SALE: 'POST_SALE',
  CANCELED: 'CANCELED',
} as const;

export const PriorityEnum = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export const CustomerSourceEnum = {
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
} as const;

export const createAttendanceSchema = z.object({
  customerId: z.string().uuid('ID do cliente inválido'),
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  source: z.nativeEnum(CustomerSourceEnum).optional(),
  priority: z.nativeEnum(PriorityEnum).optional(),
  potentialValueCents: z.number().int('Deve ser um número inteiro').min(0, 'Não pode ser negativo').optional(),
  assignedToId: z.string().uuid('ID de usuário inválido').optional(),
});

export const updateAttendanceSchema = z.object({
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional(),
  source: z.nativeEnum(CustomerSourceEnum).optional(),
  priority: z.nativeEnum(PriorityEnum).optional(),
  potentialValueCents: z.number().int('Deve ser um número inteiro').min(0, 'Não pode ser negativo').optional(),
  assignedToId: z.string().uuid('ID de usuário inválido').optional(),
});

export const updateAttendanceStatusSchema = z.object({
  status: z.nativeEnum(AttendanceStatusEnum),
  lossReason: z.string().optional(),
});

export const listAttendancesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(AttendanceStatusEnum).optional(),
  source: z.nativeEnum(CustomerSourceEnum).optional(),
  priority: z.nativeEnum(PriorityEnum).optional(),
  assignedToId: z.string().uuid().optional(),
});
