export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuoteItem {
  id?: string;
  description: string;
  quantity: number | string; // Permitimos string temporário para inputs decimais no hook-form
  unitPriceCents: number;
  discountCents?: number;
  totalPriceCents?: number; // Calculado pelo backend, mas presente no retorno
}

export interface Quote {
  id: string;
  companyId: string;
  customerId: string;
  attendanceId?: string | null;
  quoteNumber?: string | null;
  title: string;
  description?: string | null;
  status: QuoteStatus;
  totalValueCents: number;
  validUntil?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  sentAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    document?: string | null;
  };
  attendance?: {
    id: string;
    title: string | null;
  } | null;
}

export interface QuoteFilters {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  attendanceId?: string;
  status?: QuoteStatus | '';
  createdFrom?: string;
  createdTo?: string;
  minTotalCents?: number;
  maxTotalCents?: number;
}

export interface PaginatedQuotes {
  data: Quote[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateQuoteData {
  customerId?: string;
  attendanceId?: string;
  title: string;
  description?: string;
  status?: QuoteStatus;
  validUntil?: string | null;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  items: QuoteItem[];
}

export interface UpdateQuoteData {
  title?: string;
  description?: string;
  validUntil?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  items?: QuoteItem[];
}
