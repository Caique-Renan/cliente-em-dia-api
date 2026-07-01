import type { Customer } from './customer';

export const AttendanceStatus = {
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

export type AttendanceStatusType = typeof AttendanceStatus[keyof typeof AttendanceStatus];

export const Priority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type PriorityType = typeof Priority[keyof typeof Priority];

export interface Attendance {
  id: string;
  companyId: string;
  customerId: string;
  title: string;
  description?: string;
  source: string;
  priority: PriorityType;
  potentialValueCents?: number;
  status: AttendanceStatusType;
  lossReason?: string;
  assignedToId?: string;
  createdById: string;
  lastInteractionAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  customer?: Partial<Customer>;
}

export interface ListAttendancesQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: AttendanceStatusType;
  source?: string;
  priority?: PriorityType;
}

export interface CreateAttendanceDTO {
  customerId: string;
  title: string;
  description?: string;
  source?: string;
  priority?: PriorityType;
  potentialValueCents?: number;
}

export interface UpdateAttendanceDTO {
  title?: string;
  description?: string;
  source?: string;
  priority?: PriorityType;
  potentialValueCents?: number;
}

export interface UpdateAttendanceStatusDTO {
  status: AttendanceStatusType;
  lossReason?: string;
}
