import { api } from './api';
import type { Quote, QuoteFilters, PaginatedQuotes, CreateQuoteData, UpdateQuoteData, QuoteStatus } from '../types/quote';

export const quotesService = {
  async list(filters: QuoteFilters): Promise<PaginatedQuotes> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedQuotes>(`/quotes?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Quote> {
    const response = await api.get<Quote>(`/quotes/${id}`);
    return response.data;
  },

  async create(data: CreateQuoteData): Promise<Quote> {
    const response = await api.post<Quote>('/quotes', data);
    return response.data;
  },

  async update(id: string, data: UpdateQuoteData): Promise<Quote> {
    const response = await api.patch<Quote>(`/quotes/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: QuoteStatus): Promise<Quote> {
    const response = await api.patch<Quote>(`/quotes/${id}/status`, { status });
    return response.data;
  },
};
