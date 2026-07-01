export const CustomerSource = {
  WHATSAPP: 'WHATSAPP',
  INSTAGRAM: 'INSTAGRAM',
  FACEBOOK: 'FACEBOOK',
  GOOGLE: 'GOOGLE',
  REFERRAL: 'REFERRAL',
  WALK_IN: 'WALK_IN',
  PHONE: 'PHONE',
  WEBSITE: 'WEBSITE',
  ADS: 'ADS',
  OTHER: 'OTHER'
} as const;

export type CustomerSource = keyof typeof CustomerSource;

export const CustomerStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED'
} as const;

export type CustomerStatus = keyof typeof CustomerStatus;

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  document?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  source: CustomerSource;
  status: CustomerStatus;
  notes?: string | null;
  lastContactAt?: string | null;
  assignedToId?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export type CustomerListResponse = PaginatedResponse<Customer>;
