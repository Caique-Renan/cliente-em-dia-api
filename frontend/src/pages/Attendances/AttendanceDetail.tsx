import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, AlertCircle, MessageCircle } from 'lucide-react';
import { attendancesService } from '../../services/attendances.service';
import { AttendanceStatus, Priority } from '../../types/attendance';
import type { Attendance } from '../../types/attendance';
import { AttendanceFormModal } from '../../components/AttendanceFormModal';
import { StatusUpdateModal } from '../../components/StatusUpdateModal';
import { formatCurrency } from '../../utils/formatters';
import { tasksService } from '../../services/tasks.service';
import type { Task } from '../../types/task';
import { taskStatusMap } from '../../types/task';
import { TaskFormModal } from '../../components/TaskFormModal';
import { QuoteFormModal } from '../../components/QuoteFormModal';
import { quotesService } from '../../services/quotes.service';
import type { Quote } from '../../types/quote';
import { MessageComposerModal } from '../../components/MessageComposerModal';

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

const sourceMap: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  GOOGLE: 'Google',
  REFERRAL: 'Indicação',
  WALK_IN: 'Loja Física',
  PHONE: 'Telefone',
  WEBSITE: 'Site',
  ADS: 'Anúncios',
  OTHER: 'Outro',
};

export const AttendanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const fetchAttendance = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [data, tasksData, quotesData] = await Promise.all([
        attendancesService.findById(id),
        tasksService.fetchTasks({ attendanceId: id, limit: 5 }),
        quotesService.list({ attendanceId: id, limit: 5 })
      ]);
      setAttendance(data);
      setTasks(tasksData.data);
      setQuotes(quotesData.data);
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--color-text-secondary)]">Carregando detalhes do atendimento...</div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
        <AlertCircle className="w-12 h-12 text-[var(--color-danger)] mb-4" />
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Atendimento não encontrado</h2>
        <Link to="/attendances" className="mt-4 text-[var(--color-primary)] hover:underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const openWhatsApp = () => {
    setIsMessageModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/attendances" className="flex items-center mr-4 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline text-sm font-medium">Voltar para Atendimentos</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{attendance.title}</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Criado em {formatDate(attendance.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </button>
          {attendance.customer && (
            <button
              onClick={openWhatsApp}
              className="flex items-center bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-2">
              Detalhes do Atendimento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Status</label>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[attendance.status]?.color}`}>
                    {statusMap[attendance.status]?.label}
                  </span>
                  <button
                    onClick={() => setIsStatusModalOpen(true)}
                    className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
                  >
                    Alterar
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Prioridade</label>
                <p className="text-[var(--color-text-primary)]">{priorityMap[attendance.priority]}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Valor Potencial</label>
                <p className="text-[var(--color-text-primary)] font-medium">
                  {attendance.potentialValueCents ? formatCurrency(attendance.potentialValueCents) : '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Origem</label>
                <p className="text-[var(--color-text-primary)]">{sourceMap[attendance.source] || attendance.source}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Descrição</label>
                <div className="text-[var(--color-text-primary)] bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap border border-gray-100 min-h-[80px]">
                  {attendance.description || <span className="text-gray-400 italic">Sem descrição informada.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Tarefas */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-2">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Tarefas do Atendimento</h2>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                + Nova
              </button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-sm font-medium text-gray-500">Nenhuma tarefa</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="block bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm text-[var(--color-text-primary)]">{task.title}</h4>
                      <span className={`shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${taskStatusMap[task.status]?.color}`}>
                        {taskStatusMap[task.status]?.label}
                      </span>
                    </div>
                    {task.dueDate && (
                      <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
                        Vence: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                ))}
                <Link to={`/tasks?attendanceId=${attendance.id}`} className="block text-center text-sm font-medium text-[var(--color-primary)] hover:underline mt-2">
                  Ver todas as tarefas
                </Link>
              </div>
            )}
          </div>

          {/* Orçamentos */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-2">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Orçamentos</h2>
              <button 
                onClick={() => setIsQuoteModalOpen(true)}
                className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                + Novo
              </button>
            </div>
            
            {quotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-sm font-medium text-gray-500">Nenhum orçamento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map(quote => (
                  <Link key={quote.id} to={`/quotes/${quote.id}`} className="block bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm text-[var(--color-text-primary)]">{quote.title}</h4>
                      <span className="text-xs font-bold text-[var(--color-primary)]">
                        {formatCurrency(quote.totalValueCents)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
                      Criado em: {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </Link>
                ))}
                <Link to={`/quotes?attendanceId=${attendance.id}`} className="block text-center text-sm font-medium text-[var(--color-primary)] hover:underline mt-2">
                  Ver todos os orçamentos
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Customer Info & Meta */}
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-2">
              Cliente
            </h2>
            {attendance.customer ? (
              <div className="space-y-4">
                <div>
                  <Link to={`/customers/${attendance.customer.id}`} className="text-base font-medium text-[var(--color-primary)] hover:underline">
                    {attendance.customer.name}
                  </Link>
                </div>
                {attendance.customer.phone && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Telefone / WhatsApp</label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--color-text-primary)]">{attendance.customer.phone}</p>
                      <button 
                        onClick={openWhatsApp}
                        className="text-green-600 hover:bg-green-50 p-1.5 rounded-md transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
                {attendance.customer.email && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">E-mail</label>
                    <p className="text-sm text-[var(--color-text-primary)] break-all">{attendance.customer.email}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Cliente não encontrado</p>
            )}
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-2">
              Atividade
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-[var(--color-text-secondary)]">Responsável:</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {(attendance as any).assignedTo?.name || (attendance as any).createdBy?.name || 'Sistema'}
                </span>
              </div>
                {attendance.lastInteractionAt && (
                  <div>
                    <span className="block text-sm text-[var(--color-text-secondary)] mb-1">Última Interação</span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {formatDate(attendance.lastInteractionAt)}
                    </span>
                  </div>
                )}
                {attendance.lossReason && attendance.status === 'LOST' && (
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <span className="block text-sm text-[var(--color-text-secondary)] mb-1">Motivo da perda</span>
                    <span className="text-sm text-[var(--color-danger)] font-medium">
                      {attendance.lossReason}
                    </span>
                  </div>
                )}
                {attendance.closedAt && (
                  <div>
                    <span className="block text-[var(--color-text-secondary)]">Concluído em:</span>
                    <span className="font-medium text-[var(--color-text-primary)]">{formatDate(attendance.closedAt)}</span>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      <AttendanceFormModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchAttendance}
        attendance={attendance}
      />
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        attendance={attendance}
        onSuccess={(updated) => setAttendance(updated)}
      />
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchAttendance}
        preselectedCustomerId={attendance.customerId}
        preselectedAttendanceId={attendance.id}
      />
      {isQuoteModalOpen && attendance.customer && (
        <QuoteFormModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          onSuccess={fetchAttendance}
          preselectedCustomerId={attendance.customerId}
          preselectedAttendanceId={attendance.id}
        />
      )}

      {isMessageModalOpen && attendance.customer && attendance.customer.name && (
        <MessageComposerModal
          customerId={attendance.customerId}
          customerName={attendance.customer.name}
          customerPhone={attendance.customer.phone ?? undefined}
          attendanceId={attendance.id}
          onClose={() => setIsMessageModalOpen(false)}
        />
      )}
    </div>
  );
};
