import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, MessageCircle, MapPin, Briefcase } from 'lucide-react';
import { CustomerStatus } from '../../types/customer';
import type { Customer } from '../../types/customer';
import { customersService } from '../../services/customers.service';
import { CustomerFormModal } from '../../components/CustomerFormModal';
import { AttendanceFormModal } from '../../components/AttendanceFormModal';
import { attendancesService } from '../../services/attendances.service';
import { AttendanceStatus } from '../../types/attendance';
import type { Attendance } from '../../types/attendance';
import { formatCurrency } from '../../utils/formatters';
import { TaskFormModal } from '../../components/TaskFormModal';
import { tasksService } from '../../services/tasks.service';
import type { Task } from '../../types/task';
import { taskStatusMap } from '../../types/task';
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

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const fetchCustomer = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [data, attendancesData, tasksData, quotesData] = await Promise.all([
        customersService.findById(id),
        attendancesService.list({ customerId: id, limit: 10 }),
        tasksService.fetchTasks({ customerId: id, limit: 5 }),
        quotesService.list({ customerId: id, limit: 5 })
      ]);
      setCustomer(data);
      setAttendances(attendancesData.data);
      setTasks(tasksData.data);
      setQuotes(quotesData.data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Cliente não encontrado ou sem permissão.');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Carregando detalhes...</div>;
  }

  if (!customer) return null;

  const handleWhatsApp = () => {
    setIsMessageModalOpen(true);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
  };

  const formatPhone = (val?: string | null) => {
    if (!val) return '-';
    if (val.length === 11) return val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (val.length === 10) return val.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return val;
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate('/customers')} className="flex items-center mr-4 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline text-sm font-medium">Voltar para Clientes</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{customer.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${customer.status === CustomerStatus.ACTIVE ? 'bg-green-100 text-green-800' : ''}
                ${customer.status === CustomerStatus.INACTIVE ? 'bg-gray-100 text-gray-800' : ''}
                ${customer.status === CustomerStatus.BLOCKED ? 'bg-red-100 text-red-800' : ''}
              `}>
                {customer.status}
              </span>
              <span className="text-sm text-[var(--color-text-secondary)] border-l border-[var(--color-border)] pl-2">
                Cadastrado em {formatDate(customer.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-primary)] px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </button>
          <button 
            onClick={handleWhatsApp}
            disabled={!customer.phone}
            className="flex items-center bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Enviar Mensagem
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-2">Dados Cadastrais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Telefone / WhatsApp</p>
                <p className="font-medium text-[var(--color-text-primary)]">{formatPhone(customer.phone)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">E-mail</p>
                <p className="font-medium text-[var(--color-text-primary)]">{customer.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">CPF / CNPJ</p>
                <p className="font-medium text-[var(--color-text-primary)]">{customer.document || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Origem</p>
                <p className="font-medium text-[var(--color-text-primary)] flex items-center">
                  <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                  {customer.source}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-2">Endereço</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <p className="text-sm text-[var(--color-text-secondary)]">Rua / Número / Complemento</p>
                <p className="font-medium text-[var(--color-text-primary)] flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {customer.address || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Bairro</p>
                <p className="font-medium text-[var(--color-text-primary)]">{customer.district || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Cidade</p>
                <p className="font-medium text-[var(--color-text-primary)]">{customer.city || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-2">Observações</h2>
            <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {customer.notes || 'Nenhuma observação cadastrada.'}
            </p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-2">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Atendimentos</h2>
              <button 
                onClick={() => setIsAttendanceModalOpen(true)}
                className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                + Novo
              </button>
            </div>
            
            {attendances.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <MessageCircle className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">Nenhum atendimento</p>
                <p className="text-xs text-gray-400 mt-1">Crie o primeiro atendimento para este cliente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {attendances.map(att => (
                  <Link 
                    key={att.id} 
                    to={`/attendances/${att.id}`}
                    className="block bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{att.title}</h4>
                      <span className={`shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusMap[att.status]?.color}`}>
                        {statusMap[att.status]?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-end mt-3 text-xs text-[var(--color-text-secondary)]">
                      <span>{new Date(att.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {att.potentialValueCents ? formatCurrency(att.potentialValueCents) : '-'}
                      </span>
                    </div>
                  </Link>
                ))}
                {attendances.length === 10 && (
                  <Link to={`/attendances?customerId=${customer.id}`} className="block text-center text-sm font-medium text-[var(--color-primary)] hover:underline mt-2">
                    Ver todos os atendimentos
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-2">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Tarefas</h2>
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
                <Link to={`/tasks?customerId=${customer.id}`} className="block text-center text-sm font-medium text-[var(--color-primary)] hover:underline mt-2">
                  Ver todas as tarefas
                </Link>
              </div>
            )}
          </div>

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
                <Link to={`/quotes?customerId=${customer.id}`} className="block text-center text-sm font-medium text-[var(--color-primary)] hover:underline mt-2">
                  Ver todos os orçamentos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={() => { fetchCustomer(); }} 
        customer={customer} 
      />

      <AttendanceFormModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onSuccess={fetchCustomer}
        preselectedCustomerId={customer.id}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchCustomer}
        preselectedCustomerId={customer.id}
      />

      <QuoteFormModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSuccess={fetchCustomer}
        preselectedCustomerId={customer.id}
      />

      {isMessageModalOpen && (
        <MessageComposerModal
          customerId={customer.id}
          customerName={customer.name}
          customerPhone={customer.phone || undefined}
          onClose={() => setIsMessageModalOpen(false)}
        />
      )}
    </div>
  );
};
