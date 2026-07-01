export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELED: 'CANCELED',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskType = {
  FOLLOW_UP: 'FOLLOW_UP',
  SEND_QUOTE: 'SEND_QUOTE',
  CONFIRM_APPOINTMENT: 'CONFIRM_APPOINTMENT',
  POST_SALE: 'POST_SALE',
  ASK_REVIEW: 'ASK_REVIEW',
  REACTIVATION: 'REACTIVATION',
  COLLECTION: 'COLLECTION',
  OTHER: 'OTHER',
} as const;

export type TaskType = typeof TaskType[keyof typeof TaskType];

export const Priority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

export interface Task {
  id: string;
  companyId: string;
  customerId?: string | null;
  attendanceId?: string | null;
  quoteId?: string | null;

  title: string;
  description?: string | null;
  type: TaskType;
  priority: Priority;
  status: TaskStatus;

  dueDate?: string | null;
  completedAt?: string | null;

  assignedToId?: string | null;
  createdById: string;

  createdAt: string;
  updatedAt: string;

  customer?: { id: string; name: string } | null;
  attendance?: { id: string; title: string } | null;
  assignedTo?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string } | null;
}

export const taskStatusMap: Record<TaskStatus, { label: string; color: string }> = {
  [TaskStatus.TODO]: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  [TaskStatus.IN_PROGRESS]: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
  [TaskStatus.DONE]: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
  [TaskStatus.CANCELED]: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
};

export const taskTypeMap: Record<TaskType, string> = {
  [TaskType.FOLLOW_UP]: 'Follow-up',
  [TaskType.SEND_QUOTE]: 'Enviar orçamento',
  [TaskType.CONFIRM_APPOINTMENT]: 'Confirmar agendamento',
  [TaskType.POST_SALE]: 'Pós-venda',
  [TaskType.ASK_REVIEW]: 'Pedir avaliação',
  [TaskType.REACTIVATION]: 'Reativação',
  [TaskType.COLLECTION]: 'Cobrança',
  [TaskType.OTHER]: 'Outro',
};

export const priorityMap: Record<Priority, string> = {
  [Priority.LOW]: 'Baixa',
  [Priority.NORMAL]: 'Normal',
  [Priority.HIGH]: 'Alta',
  [Priority.URGENT]: 'Urgente',
};
