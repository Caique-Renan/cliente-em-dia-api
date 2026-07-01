import { z } from 'zod';

export const createTemplateSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  category: z.string().optional()
});

export const updateTemplateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.string().optional()
});

export const updateTemplateStatusSchema = z.object({
  isActive: z.boolean()
});

export const previewMessageSchema = z.object({
  templateId: z.string().uuid('ID de template inválido'),
  customerId: z.string().uuid('ID do cliente inválido'),
  attendanceId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional()
});

export const createMessageLogSchema = z.object({
  customerId: z.string().uuid('ID do cliente inválido'),
  action: z.enum(['COPIED', 'OPENED_WHATSAPP', 'MANUAL_NOTE']),
  content: z.string().optional(),
  attendanceId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional()
});

export type CreateTemplateDTO = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateDTO = z.infer<typeof updateTemplateSchema>;
export type UpdateTemplateStatusDTO = z.infer<typeof updateTemplateStatusSchema>;
export type PreviewMessageDTO = z.infer<typeof previewMessageSchema>;
export type CreateMessageLogDTO = z.infer<typeof createMessageLogSchema>;
