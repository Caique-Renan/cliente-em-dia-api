import { z } from 'zod';
import { TaskType, TaskStatus, Priority } from '@prisma/client';

export const createTaskSchema = z.object({
  customerId: z.string().uuid('Cliente inválido').optional(),
  attendanceId: z.string().uuid('Atendimento inválido').optional(),
  
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  type: z.nativeEnum(TaskType).optional(),
  priority: z.nativeEnum(Priority).optional(),
  
  dueDate: z.string().datetime({ message: 'Data de vencimento inválida (formato ISO obrigatório)' }),
  
  assignedToId: z.string().uuid('Responsável inválido').optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional(),
  type: z.nativeEnum(TaskType).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime({ message: 'Data de vencimento inválida' }).optional(),
  assignedToId: z.string().uuid('Responsável inválido').optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const listTasksQuerySchema = z.object({
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  attendanceId: z.string().uuid().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  type: z.nativeEnum(TaskType).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedToId: z.string().uuid().optional(),
  
  dueFrom: z.string().datetime().optional(),
  dueTo: z.string().datetime().optional(),
  onlyOverdue: z.string().transform(val => val === 'true').optional(),
  
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
});
