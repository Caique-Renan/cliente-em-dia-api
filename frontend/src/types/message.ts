export type MessageCategory =
  | 'PRIMEIRO_CONTATO'
  | 'FOLLOW_UP'
  | 'ORCAMENTO'
  | 'POS_VENDA'
  | 'AVALIACAO'
  | 'REATIVACAO'
  | 'COBRANCA'
  | 'OUTRO';

export interface MessageTemplate {
  id: string;
  companyId: string;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MessageAction = 'COPIED' | 'OPENED_WHATSAPP' | 'MANUAL_NOTE';

export interface MessageLog {
  id: string;
  companyId: string;
  customerId: string;
  userId: string;
  attendanceId: string | null;
  templateId: string | null;
  quoteId: string | null;
  taskId: string | null;
  content: string | null;
  action: MessageAction;
  createdAt: string;
  updatedAt: string;
}

export interface PreviewMessageRequest {
  templateId: string;
  customerId: string;
  attendanceId?: string;
  quoteId?: string;
  taskId?: string;
}

export interface PreviewMessageResponse {
  content: string;
}

export interface CreateMessageLogRequest {
  customerId: string;
  action: MessageAction;
  content?: string;
  attendanceId?: string;
  templateId?: string;
  quoteId?: string;
  taskId?: string;
}
