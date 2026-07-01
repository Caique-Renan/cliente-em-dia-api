import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { tasksService } from '../services/tasks.service';
import { customersService } from '../services/customers.service';
import { attendancesService } from '../services/attendances.service';
import { Priority, TaskType } from '../types/task';
import type { Task } from '../types/task';
import { Alert } from './Alert';
import { AsyncSearchSelect } from './AsyncSearchSelect';
import type { AsyncSelectOption } from './AsyncSearchSelect';

const taskSchema = z.object({
  customerId: z.string().optional(),
  attendanceId: z.string().optional(),
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  type: z.nativeEnum(TaskType),
  priority: z.nativeEnum(Priority),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task | null;
  preselectedCustomerId?: string;
  preselectedAttendanceId?: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  task,
  preselectedCustomerId,
  preselectedAttendanceId
}) => {
  const [errorMsg, setErrorMsg] = useState('');

  // Padroniza a data para datetime-local (YYYY-MM-DDThh:mm)
  const formatForInput = (isoDate?: string | null) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      customerId: preselectedCustomerId || '',
      attendanceId: preselectedAttendanceId || '',
      title: '',
      description: '',
      type: TaskType.FOLLOW_UP,
      priority: Priority.NORMAL,
      dueDate: '',
    }
  });

  const selectedCustomerId = watch('customerId');
  const selectedAttendanceId = watch('attendanceId');

  // Track the attendance object to cross-validate its customer
  const [selectedAttendanceCustomer, setSelectedAttendanceCustomer] = useState<string | null>(null);

  // Expose the customer name to the async select if it's already selected but the form isn't disabled
  const [initialCustomerLabel, setInitialCustomerLabel] = useState('');
  const [initialAttendanceLabel, setInitialAttendanceLabel] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (task) {
        reset({
          customerId: task.customerId || '',
          attendanceId: task.attendanceId || '',
          title: task.title,
          description: task.description || '',
          type: task.type,
          priority: task.priority,
          dueDate: formatForInput(task.dueDate),
        });
        if (task.customerId && task.attendanceId) {
          setSelectedAttendanceCustomer(task.customerId);
        }
        setInitialCustomerLabel(task.customer?.name || '');
        setInitialAttendanceLabel(task.attendance?.title || '');
      } else {
        reset({
          customerId: preselectedCustomerId || '',
          attendanceId: preselectedAttendanceId || '',
          title: '',
          description: '',
          type: TaskType.FOLLOW_UP,
          priority: Priority.NORMAL,
          dueDate: '',
        });
        setSelectedAttendanceCustomer(null);
        setInitialCustomerLabel('');
        setInitialAttendanceLabel('');
      }
      setErrorMsg('');
    }
  }, [isOpen, task, preselectedCustomerId, preselectedAttendanceId, reset]);

  const loadCustomers = async (search: string): Promise<AsyncSelectOption[]> => {
    const res = await customersService.list({ search, limit: 10 });
    return res.data.map((c: any) => ({
      value: c.id,
      label: c.name,
      subLabel: c.document || c.phone || c.email || 'Sem documento',
      data: c
    }));
  };

  const loadAttendances = async (search: string): Promise<AsyncSelectOption[]> => {
    // Pass customerId filter if it's already selected
    const params: any = { search, limit: 10 };
    if (selectedCustomerId) {
      params.customerId = selectedCustomerId;
    }
    const res = await attendancesService.list(params);
    return res.data.map((a: any) => {
      const statusText = a.status === 'NEW' ? 'Novo' : a.status === 'IN_PROGRESS' ? 'Em Andamento' : a.status;
      return {
        value: a.id,
        label: a.title || 'Sem título',
        subLabel: `${a.customer?.name || 'Cliente'} • ${statusText} • ${new Date(a.createdAt).toLocaleDateString()}`,
        data: a
      };
    });
  };

  const handleCustomerSelect = (val: string, option?: AsyncSelectOption | null) => {
    setValue('customerId', val);
    if (option) {
      setInitialCustomerLabel(option.label);
    } else {
      setInitialCustomerLabel('');
    }
    
    // Check if we need to clear attendance
    if (selectedAttendanceId && val !== selectedAttendanceCustomer) {
      setValue('attendanceId', '');
      setSelectedAttendanceCustomer(null);
      setInitialAttendanceLabel('');
    }
  };

  const handleAttendanceSelect = (val: string, option?: AsyncSelectOption | null) => {
    setValue('attendanceId', val);
    
    if (option && option.data && option.data.customer) {
      setInitialAttendanceLabel(option.label);
      const attendanceCustomerId = option.data.customer.id;
      setSelectedAttendanceCustomer(attendanceCustomerId);
      
      // Auto-fill customer if it's not set or different
      if (selectedCustomerId !== attendanceCustomerId) {
        setValue('customerId', attendanceCustomerId);
        setInitialCustomerLabel(option.data.customer.name);
      }
    } else if (!val) {
      setSelectedAttendanceCustomer(null);
      setInitialAttendanceLabel('');
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      const payload: any = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        dueDate: new Date(data.dueDate).toISOString(),
      };

      if (data.customerId) payload.customerId = data.customerId;
      if (data.attendanceId) payload.attendanceId = data.attendanceId;

      if (task) {
        await tasksService.updateTask(task.id, payload);
      } else {
        await tasksService.createTask(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setErrorMsg('Erro ao salvar a tarefa. Verifique os dados e tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 sm:p-0"
      onMouseDown={() => !isSubmitting && onClose()}
    >
      <div 
        className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-xl shadow-lg border border-[var(--color-border)] flex flex-col max-h-[90vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {task ? 'Editar Tarefa / Follow-up' : 'Nova Tarefa / Follow-up'}
          </h3>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4">
              <Alert type="error" message={errorMsg} />
            </div>
          )}
          <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Título *</label>
              <input 
                type="text" 
                {...register('title')} 
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" 
                placeholder="Ex: Ligar para confirmar proposta"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Observações</label>
              <textarea 
                {...register('description')} 
                rows={3}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" 
                placeholder="Detalhes adicionais da tarefa..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Cliente</label>
              {preselectedCustomerId || (task?.customerId && task?.customer) ? (
                <div className="w-full px-3 py-2 border border-[var(--color-border)] bg-gray-50 rounded-md text-[var(--color-text-secondary)]">
                  {task?.customer?.name || (preselectedCustomerId ? 'Cliente Previamente Selecionado' : 'Cliente Vinculado')}
                  <input type="hidden" {...register('customerId')} />
                </div>
              ) : (
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <AsyncSearchSelect
                      value={field.value || ''}
                      onChange={(val, opt) => handleCustomerSelect(val, opt)}
                      loadOptions={loadCustomers}
                      placeholder="Busque por nome, CPF/CNPJ, e-mail ou telefone..."
                      initialLabel={initialCustomerLabel}
                      loadOnFocus={true}
                      emptySearchLabel="Digite para buscar por nome, CPF/CNPJ, telefone ou e-mail"
                      initialOptionsLabel="Clientes recentes"
                    />
                  )}
                />
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Atendimento vinculado</label>
              {preselectedAttendanceId || (task?.attendanceId && task?.attendance) ? (
                <div className="w-full px-3 py-2 border border-[var(--color-border)] bg-gray-50 rounded-md text-[var(--color-text-secondary)]">
                  {task?.attendance?.title || (preselectedAttendanceId ? 'Atendimento Previamente Selecionado' : 'Atendimento Vinculado')}
                  <input type="hidden" {...register('attendanceId')} />
                </div>
              ) : (
                <Controller
                  name="attendanceId"
                  control={control}
                  render={({ field }) => (
                    <AsyncSearchSelect
                      value={field.value || ''}
                      onChange={(val, opt) => handleAttendanceSelect(val, opt)}
                      loadOptions={loadAttendances}
                      placeholder={selectedCustomerId ? "Busque os atendimentos deste cliente..." : "Busque um atendimento para vincular..."}
                      initialLabel={initialAttendanceLabel}
                      loadOnFocus={true}
                      emptySearchLabel={selectedCustomerId ? "Digite para buscar neste cliente" : "Digite para buscar em todos os atendimentos"}
                      initialOptionsLabel={selectedCustomerId ? "Atendimentos deste cliente" : "Atendimentos recentes"}
                    />
                  )}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Data/Hora de Vencimento *</label>
              <input 
                type="datetime-local" 
                {...register('dueDate')} 
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" 
              />
              {errors.dueDate && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.dueDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Prioridade</label>
              <select {...register('priority')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none bg-white">
                <option value={Priority.LOW}>Baixa</option>
                <option value={Priority.NORMAL}>Normal</option>
                <option value={Priority.HIGH}>Alta</option>
                <option value={Priority.URGENT}>Urgente</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Tipo de Tarefa</label>
              <select {...register('type')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none bg-white">
                <option value={TaskType.FOLLOW_UP}>Follow-up</option>
                <option value={TaskType.SEND_QUOTE}>Enviar orçamento</option>
                <option value={TaskType.CONFIRM_APPOINTMENT}>Confirmar agendamento</option>
                <option value={TaskType.POST_SALE}>Pós-venda</option>
                <option value={TaskType.ASK_REVIEW}>Pedir avaliação</option>
                <option value={TaskType.REACTIVATION}>Reativação</option>
                <option value={TaskType.COLLECTION}>Cobrança</option>
                <option value={TaskType.OTHER}>Outro</option>
              </select>
            </div>
            
          </form>
        </div>

        <div className="p-5 border-t border-[var(--color-border)] flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-white border border-[var(--color-border)] rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="task-form"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {task ? 'Salvar Alterações' : 'Criar Tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
};
