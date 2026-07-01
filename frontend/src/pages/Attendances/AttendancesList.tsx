import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MessageSquare } from 'lucide-react';
import { attendancesService } from '../../services/attendances.service';
import { AttendanceStatus, Priority } from '../../types/attendance';
import type { Attendance } from '../../types/attendance';
import { AttendanceFormModal } from '../../components/AttendanceFormModal';
import { StatusUpdateModal } from '../../components/StatusUpdateModal';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { formatCurrency } from '../../utils/formatters';

const statusMap: Record<string, { label: string; color: string }> = {
  [AttendanceStatus.NEW]: { label: 'Novo', color: 'bg-blue-100 text-blue-800' },
  [AttendanceStatus.IN_PROGRESS]: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
  [AttendanceStatus.WAITING_CUSTOMER]: { label: 'Aguardando Cliente', color: 'bg-orange-100 text-orange-800' },
  [AttendanceStatus.QUOTE_SENT]: { label: 'Orçamento Enviado', color: 'bg-purple-100 text-purple-800' },
  [AttendanceStatus.NEGOTIATION]: { label: 'Em Negociação', color: 'bg-indigo-100 text-indigo-800' },
  [AttendanceStatus.WON]: { label: 'Ganho', color: 'bg-green-100 text-green-800' },
  [AttendanceStatus.LOST]: { label: 'Perdido', color: 'bg-red-100 text-red-800' },
  [AttendanceStatus.POST_SALE]: { label: 'Pós-Venda', color: 'bg-teal-100 text-teal-800' },
  [AttendanceStatus.CANCELED]: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
};

const priorityMap: Record<string, string> = {
  [Priority.LOW]: 'Baixa',
  [Priority.NORMAL]: 'Normal',
  [Priority.HIGH]: 'Alta',
  [Priority.URGENT]: 'Urgente',
};

export const AttendancesList: React.FC = () => {
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAttendanceForStatus, setSelectedAttendanceForStatus] = useState<Attendance | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const fetchAttendances = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await attendancesService.list({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter as any || undefined,
        priority: priorityFilter as any || undefined,
      });
      setAttendances(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch attendances', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAttendances();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
          ← Voltar ao Dashboard
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Atendimentos</h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-sm">
            {totalItems} {totalItems === 1 ? 'atendimento encontrado' : 'atendimentos encontrados'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Atendimento
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] p-4 rounded-xl shadow-sm border border-[var(--color-border)] mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título, descrição, cliente ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] outline-none bg-white appearance-none"
              >
                <option value="">Todos os status</option>
                {Object.entries(statusMap).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] outline-none bg-white appearance-none"
              >
                <option value="">Qualquer prioridade</option>
                {Object.entries(priorityMap).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-100 text-[var(--color-text-primary)] font-medium rounded-lg hover:bg-gray-200 transition-colors">
            Filtrar
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm">
                <th className="px-6 py-4 font-medium">Título</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Prioridade</th>
                <th className="px-6 py-4 font-medium">Valor Potencial</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Carregando atendimentos...</td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    {(!search && !statusFilter && !priorityFilter) ? (
                      <EmptyState 
                        icon={<MessageSquare className="w-8 h-8" />}
                        title="Nenhum atendimento registrado"
                        description="Você ainda não possui atendimentos. Crie um para começar a gerenciar seus contatos."
                        actionLabel="Novo atendimento"
                        onAction={() => setIsModalOpen(true)}
                      />
                    ) : (
                      <EmptyState 
                        icon={<Search className="w-8 h-8" />}
                        title="Nenhum resultado encontrado"
                        description="Tente ajustar os filtros ou buscar por outro termo."
                      />
                    )}
                  </td>
                </tr>
              ) : (
                attendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-[var(--color-text-primary)] max-w-xs truncate">
                      {attendance.title}
                      <div className="text-xs text-gray-400 mt-1 font-normal">
                        Interação: {formatDate(attendance.lastInteractionAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/customers/${attendance.customerId}`} className="text-[var(--color-primary)] hover:underline font-medium">
                        {attendance.customer?.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedAttendanceForStatus(attendance)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${statusMap[attendance.status]?.color}`}
                        title="Alterar status"
                      >
                        {statusMap[attendance.status]?.label}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                      {priorityMap[attendance.priority]}
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">
                      {attendance.potentialValueCents ? formatCurrency(attendance.potentialValueCents) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/attendances/${attendance.id}`)}
                        className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium text-sm bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-[var(--color-border)] mt-auto bg-gray-50">
            <Pagination 
              page={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </div>

      <AttendanceFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAttendances}
      />

      <StatusUpdateModal
        isOpen={!!selectedAttendanceForStatus}
        onClose={() => setSelectedAttendanceForStatus(null)}
        attendance={selectedAttendanceForStatus}
        onSuccess={() => fetchAttendances()}
      />
    </div>
  );
};
