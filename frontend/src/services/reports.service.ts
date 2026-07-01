import { api } from './api';
import type { ReportsOverview } from '../types/report';

interface OverviewParams {
  dateFrom?: string;
  dateTo?: string;
}

export const reportsService = {
  async getOverview(params?: OverviewParams): Promise<ReportsOverview> {
    const query = new URLSearchParams();
    if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params?.dateTo)   query.set('dateTo',   params.dateTo);
    const qs = query.toString();
    const { data } = await api.get<ReportsOverview>(`/reports/overview${qs ? `?${qs}` : ''}`);
    return data;
  },
};
