import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Clock, CheckSquare, Edit2, CheckCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tasksService } from '../../services/tasks.service';
import { TaskStatus, taskStatusMap, taskTypeMap, priorityMap } from '../../types/task';
import type { Task } from '../../types/task';
import { TaskFormModal } from '../../components/TaskFormModal';
import { Pagination } from '../../components/Pagination';
import { MessageComposerModal } from '../../components/MessageComposerModal';
import { EmptyState } from '../../components/EmptyState';

export const TasksList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter] = useState('');
  const [isOverdueFilter, setIsOverdueFilter] = useState(false);
  const [isTodayFilter, setIsTodayFilter] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (priorityFilter) params.priority = priorityFilter;
      
      if (isOverdueFilter) {
        params.onlyOverdue = true;
      } else if (isTodayFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        
        params.dueFrom = today.toISOString();
        params.dueTo = endOfToday.toISOString();
      }

      const response = await tasksService.fetchTasks(params);
      setTasks(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, typeFilter, priorityFilter, isOverdueFilter, isTodayFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTasks();
  };

  const handleComplete = async (task: Task) => {
    try {
      await tasksService.completeTask(task.id);
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Erro ao concluir tarefa');
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const openMessageModal = (task: Task) => {
    setSelectedTask(task);
    setIsMessageModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const formatDateTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const isOverdue = (task: Task) => {
    if (task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELED) return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  const isToday = (task: Task) => {
    if (!task.dueDate) return false;
    const date = new Date(task.dueDate);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Tarefas e Follow-ups</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Gerencie retornos, lembretes e ações comerciais</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center px-4 py-2 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova tarefa
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] p-4 rounded-xl shadow-sm border border-[var(--color-border)] mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por título, descrição, cliente..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] outline-none bg-white text-sm"
            >
              <option value="">Todos os status</option>
              {Object.entries(taskStatusMap).map(([key, {label}]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select 
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] outline-none bg-white text-sm"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(taskTypeMap).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            {/* Botões de filtro rápido */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setIsOverdueFilter(false);
                  setIsTodayFilter(!isTodayFilter);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isTodayFilter 
                    ? 'bg-white text-yellow-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTodayFilter(false);
                  setIsOverdueFilter(!isOverdueFilter);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isOverdueFilter 
                    ? 'bg-white text-[var(--color-danger)] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Atrasadas
              </button>
            </div>
            
            <button type="submit" className="px-4 py-2 bg-gray-100 text-[var(--color-text-primary)] font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Carregando tarefas...</p>
          </div>
        ) : tasks.length === 0 ? (
          (!search && !statusFilter && !typeFilter && !priorityFilter && !isOverdueFilter && !isTodayFilter) ? (
            <div className="mt-4">
              <EmptyState 
                icon={<CheckSquare className="w-8 h-8" />}
                title="Nenhum follow-up pendente"
                description="Suas tarefas e follow-ups aparecerão aqui. Que tal agendar um novo contato?"
                actionLabel="Nova tarefa"
                onAction={() => {
                  setSelectedTask(null);
                  setIsModalOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState 
                icon={<Search className="w-8 h-8" />}
                title="Nenhum resultado encontrado"
                description="Tente ajustar os filtros ou buscar por outro termo."
              />
            </div>
          )
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
              <table className="w-full text-left border-collapse min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm">
                    <th className="px-6 py-4 font-medium">Título</th>
                    <th className="px-6 py-4 font-medium">Vínculo</th>
                    <th className="px-6 py-4 font-medium">Tipo / Prioridade</th>
                    <th className="px-6 py-4 font-medium">Vencimento</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-sm">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--color-text-primary)]">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs" title={task.description}>
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {task.customer ? (
                          <Link to={`/customers/${task.customerId}`} className="block text-[var(--color-primary)] hover:underline font-medium">
                            {task.customer.name}
                          </Link>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                        {task.attendance && (
                          <Link to={`/attendances/${task.attendanceId}`} className="block text-xs text-gray-500 hover:text-[var(--color-primary)] mt-1">
                            Ver atendimento
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[var(--color-text-primary)]">{taskTypeMap[task.type]}</div>
                        <div className="text-xs text-gray-500 mt-1">{priorityMap[task.priority]}</div>
                      </td>
                      <td className="px-6 py-4">
                        {task.dueDate ? (
                          <div className="flex items-center">
                            <Clock className={`w-4 h-4 mr-1.5 ${isOverdue(task) ? 'text-[var(--color-danger)]' : isToday(task) ? 'text-yellow-500' : 'text-gray-400'}`} />
                            <span className={isOverdue(task) ? 'text-[var(--color-danger)] font-medium' : isToday(task) ? 'text-yellow-600 font-medium' : 'text-[var(--color-text-primary)]'}>
                              {formatDateTime(task.dueDate)}
                            </span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${taskStatusMap[task.status]?.color}`}>
                          {taskStatusMap[task.status]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {task.status !== TaskStatus.DONE && (
                            <button 
                              onClick={() => handleComplete(task)}
                              title="Concluir Tarefa"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {task.customer && (
                            <button 
                              onClick={() => openMessageModal(task)}
                              title="Enviar Mensagem"
                              className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => openEditModal(task)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white border border-[var(--color-border)] rounded-xl p-4 shadow-sm relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="pr-8">
                      <h3 className="font-medium text-[var(--color-text-primary)] text-base">{task.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${taskStatusMap[task.status]?.color}`}>
                          {taskStatusMap[task.status]?.label}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {taskTypeMap[task.type]}
                        </span>
                      </div>
                    </div>
                    {task.status !== TaskStatus.DONE && (
                      <button 
                        onClick={() => handleComplete(task)}
                        className="absolute top-4 right-4 text-green-600 hover:text-green-700 p-1"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                  
                  {task.customer && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500 mr-1">Cliente:</span>
                      <Link to={`/customers/${task.customerId}`} className="text-[var(--color-primary)] font-medium">
                        {task.customer.name}
                      </Link>
                    </div>
                  )}

                  {task.dueDate && (
                    <div className="mt-2 flex items-center text-sm">
                      <Clock className={`w-4 h-4 mr-1.5 ${isOverdue(task) ? 'text-[var(--color-danger)]' : isToday(task) ? 'text-yellow-500' : 'text-gray-400'}`} />
                      <span className={isOverdue(task) ? 'text-[var(--color-danger)] font-medium' : isToday(task) ? 'text-yellow-600 font-medium' : 'text-[var(--color-text-secondary)]'}>
                        {formatDateTime(task.dueDate)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
                    {task.customer && (
                      <button 
                        onClick={() => openMessageModal(task)}
                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 p-2"
                      >
                        <MessageSquare className="w-4 h-4 mr-1.5" /> Mensagem
                      </button>
                    )}
                    <button 
                      onClick={() => openEditModal(task)}
                      className="flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-2"
                    >
                      <Edit2 className="w-4 h-4 mr-1.5" /> Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <TaskFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchTasks}
          task={selectedTask}
        />
      )}

      {isMessageModalOpen && selectedTask?.customer && (
        <MessageComposerModal
          customerId={selectedTask.customerId!}
          customerName={selectedTask.customer.name}
          taskId={selectedTask.id}
          attendanceId={selectedTask.attendanceId || undefined}
          onClose={() => setIsMessageModalOpen(false)}
        />
      )}
    </div>
  );
};
