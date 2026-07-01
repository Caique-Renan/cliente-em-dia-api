import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { attendancesService } from '../services/attendances.service';
import { customersService } from '../services/customers.service';
import { Priority } from '../types/attendance';
import type { Attendance } from '../types/attendance';
import type { Customer } from '../types/customer';
import { formatCurrencyInput, parseCurrencyToCents, formatCurrency } from '../utils/formatters';
import { Alert } from './Alert';

const attendanceSchema = z.object({
  customerId: z.string().uuid('Selecione um cliente'),
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  source: z.string().optional(),
  priority: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AttendanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attendance?: Attendance | null;
  preselectedCustomerId?: string;
}

export const AttendanceFormModal: React.FC<AttendanceFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  attendance,
  preselectedCustomerId
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [currencyValue, setCurrencyValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      customerId: preselectedCustomerId || '',
      title: '',
      description: '',
      source: 'OTHER',
      priority: 'NORMAL',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (attendance) {
        reset({
          customerId: attendance.customerId,
          title: attendance.title || '',
          description: attendance.description || '',
          source: attendance.source,
          priority: attendance.priority,
        });
        setCurrencyValue(attendance.potentialValueCents ? formatCurrency(attendance.potentialValueCents) : '');
      } else {
        reset({
          customerId: preselectedCustomerId || '',
          title: '',
          description: '',
          source: 'OTHER',
          priority: 'NORMAL',
        });
        setCurrencyValue('');
      }

      // Fetch customers for the dropdown
      if (!preselectedCustomerId && !attendance) {
        setIsLoadingCustomers(true);
        customersService.list({ limit: 50, status: 'ACTIVE' })
          .then(res => setCustomers(res.data))
          .catch(err => console.error(err))
          .finally(() => setIsLoadingCustomers(false));
      }
    }
    setErrorMsg('');
  }, [isOpen, attendance, preselectedCustomerId, reset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setCurrencyValue(formatted);
  };

  const onSubmit = async (data: AttendanceFormData) => {
    try {
      const payload = {
        ...data,
        potentialValueCents: parseCurrencyToCents(currencyValue)
      };

      if (attendance) {
        await attendancesService.update(attendance.id, payload as any);
      } else {
        await attendancesService.create(payload as any);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save attendance', error);
      setErrorMsg('Erro ao salvar atendimento. Tente novamente.');
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
            {attendance ? 'Editar Atendimento' : 'Novo Atendimento'}
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
          <form id="attendance-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Cliente *</label>
              {preselectedCustomerId || attendance ? (
                <div className="w-full px-3 py-2 border border-[var(--color-border)] bg-gray-50 rounded-md text-[var(--color-text-secondary)]">
                  {attendance?.customer?.name || 'Cliente Vinculado'}
                  <input type="hidden" {...register('customerId')} />
                </div>
              ) : (
                <select 
                  {...register('customerId')} 
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                  disabled={isLoadingCustomers}
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
              {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Título *</label>
              <input 
                type="text" 
                {...register('title')} 
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" 
                placeholder="Ex: Orçamento de pintura"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Descrição</label>
              <textarea 
                {...register('description')} 
                rows={3}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Valor Potencial</label>
              <input 
                type="text" 
                value={currencyValue}
                onChange={handleCurrencyChange}
                placeholder="R$ 0,00"
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" 
              />
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

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Origem</label>
              <select {...register('source')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none bg-white">
                <option value="WHATSAPP">WhatsApp</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="GOOGLE">Google</option>
                <option value="REFERRAL">Indicação</option>
                <option value="WALK_IN">Loja Física</option>
                <option value="PHONE">Telefone</option>
                <option value="WEBSITE">Site</option>
                <option value="ADS">Anúncios</option>
                <option value="OTHER">Outro</option>
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
            form="attendance-form"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {attendance ? 'Salvar Alterações' : 'Criar Atendimento'}
          </button>
        </div>
      </div>
    </div>
  );
};
