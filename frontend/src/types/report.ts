export interface ReportPeriod {
  from: string;
  to: string;
}

export interface CustomerStats {
  total: number;
  newInPeriod: number;
}

export interface AttendanceByStatus {
  status: string;
  count: number;
}

export interface AttendanceStats {
  total: number;
  open: number;
  won: number;
  lost: number;
  byStatus: AttendanceByStatus[];
}

export interface TaskStats {
  pending: number;
  overdue: number;
  dueToday: number;
  completedInPeriod: number;
}

export interface QuoteByStatus {
  status: string;
  count: number;
  totalValueCents: number;
}

export interface QuoteStats {
  total: number;
  open: number;
  accepted: number;
  rejected: number;
  expired: number;
  openValueCents: number;
  acceptedValueCents: number;
  conversionRate: number;
  byStatus: QuoteByStatus[];
}

export interface MessageByAction {
  action: string;
  count: number;
}

export interface MessageStats {
  copied: number;
  whatsappOpened: number;
  total: number;
  byAction: MessageByAction[];
}

export interface ReportsOverview {
  period: ReportPeriod;
  customers: CustomerStats;
  attendances: AttendanceStats;
  tasks: TaskStats;
  quotes: QuoteStats;
  messages: MessageStats;
}

// Period preset type
export type PeriodPreset = 'today' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom';

export interface PeriodFilter {
  preset: PeriodPreset;
  dateFrom: string;
  dateTo: string;
}
