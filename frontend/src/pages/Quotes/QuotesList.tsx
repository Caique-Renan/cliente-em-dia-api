import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, FileText, CheckCircle, Clock } from 'lucide-react';
import { quotesService } from '../../services/quotes.service';
import type { PaginatedQuotes, QuoteStatus } from '../../types/quote';
import { QuoteFormModal } from '../../components/QuoteFormModal';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';

const statusMap: Record<QuoteStatus, { label: string; bg: string; text: string }> = {
  DRAFT: { label: 'Rascunho', bg: 'bg-gray-100', text: 'text-gray-700' },
  SENT: { label: 'Enviado', bg: 'bg-blue-100', text: 'text-blue-700' },
  ACCEPTED: { label: 'Aceito', bg: 'bg-green-100', text: 'text-green-700' },
  REJECTED: { label: 'Recusado', bg: 'bg-red-100', text: 'text-red-700' },
  EXPIRED: { label: 'Expirado', bg: 'bg-orange-100', text: 'text-orange-700' },
};

export const QuotesList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedQuotes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const page = Number(searchParams.get('page')) || 1;
  const statusFilter = (searchParams.get('status') as QuoteStatus) || '';

  const loadQuotes = async () => {
    try {
      setIsLoading(true);
      const result = await quotesService.list({
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to load quotes', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchParams.set('search', searchTerm);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
    loadQuotes();
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus) {
      searchParams.set('status', newStatus);
    } else {
      searchParams.delete('status');
    }
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Computes some basic metrics based on the current page data (ideally this comes from backend dashboard)
  // But for simple MVP, we show metrics based on loaded data or leave as general indicators
  const totalOpen = data?.data.filter(q => q.status === 'DRAFT' || q.status === 'SENT').length || 0;
  const totalValueOpen = data?.data
    .filter(q => q.status === 'DRAFT' || q.status === 'SENT')
    .reduce((acc, curr) => acc + curr.totalValueCents, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Orçamentos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Orçamento
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)] flex items-center shadow-sm">
          <div className="p-3 bg-blue-50 rounded-full mr-4">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Orçamentos em Aberto</p>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">{totalOpen}</p>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)] flex items-center shadow-sm">
          <div className="p-3 bg-yellow-50 rounded-full mr-4">
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Valor em Aberto (pág atual)</p>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">{formatCurrency(totalValueOpen)}</p>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)] flex items-center shadow-sm">
          <div className="p-3 bg-green-50 rounded-full mr-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total (pág atual)</p>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">{data?.pagination.total || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, documento, atendimento..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background)]"
            />
          </div>
          <div className="w-full sm:w-48 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none bg-[var(--color-background)]"
            >
              <option value="">Todos os status</option>
              <option value="DRAFT">Rascunho</option>
              <option value="SENT">Enviado</option>
              <option value="ACCEPTED">Aceito</option>
              <option value="REJECTED">Recusado</option>
              <option value="EXPIRED">Expirado</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando orçamentos...</div>
        ) : data?.data.length === 0 ? (
          (!searchTerm && !statusFilter) ? (
            <EmptyState 
              icon={<FileText className="w-8 h-8" />}
              title="Nenhum orçamento criado"
              description="Você ainda não criou nenhum orçamento. Clique abaixo para começar."
              actionLabel="Novo orçamento"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <EmptyState 
              icon={<Search className="w-8 h-8" />}
              title="Nenhum resultado encontrado"
              description="Tente ajustar os filtros ou buscar por outro termo."
            />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orçamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[var(--color-border)]">
                {data?.data.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-[var(--color-text-primary)]">{quote.title}</div>
                      {quote.attendance?.title && (
                        <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          Ref: {quote.attendance.title}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--color-text-primary)]">{quote.customer?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[quote.status].bg} ${statusMap[quote.status].text}`}>
                        {statusMap[quote.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-primary)]">
                      {formatCurrency(quote.totalValueCents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                      {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/quotes/${quote.id}`}
                        className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {data && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[var(--color-border)]">
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => {
                searchParams.set('page', p.toString());
                setSearchParams(searchParams);
              }}
            />
          </div>
        )}
      </div>

      <QuoteFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadQuotes();
        }}
      />
    </div>
  );
};
