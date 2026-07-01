import React, { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import { AsyncSearchSelect } from './AsyncSearchSelect';
import { customersService } from '../services/customers.service';
import { attendancesService } from '../services/attendances.service';
import { quotesService } from '../services/quotes.service';
import type { Quote, CreateQuoteData, QuoteItem } from '../types/quote';

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  quote?: Quote | null;
  preselectedCustomerId?: string;
  preselectedAttendanceId?: string;
}

interface FormValues {
  customerId: string;
  attendanceId: string;
  title: string;
  description: string;
  validUntil: string;
  paymentTerms: string;
  deliveryTerms: string;
  notes: string;
  items: {
    description: string;
    quantity: string;
    unitPriceInput: string;
    discountInput: string;
  }[];
}

// Helper para formatar centavos para input BRL (ex: 1000 -> "10,00")
const centsToBRLInput = (cents: number) => {
  if (!cents && cents !== 0) return '';
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper para converter string BRL para centavos (ex: "10,00" -> 1000)
const BRLInputToCents = (val: string) => {
  if (!val) return 0;
  const clean = val.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
};

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  quote,
  preselectedCustomerId,
  preselectedAttendanceId,
}) => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [initialCustomerLabel, setInitialCustomerLabel] = useState<string>('');
  const [initialAttendanceLabel, setInitialAttendanceLabel] = useState<string>('');

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      customerId: preselectedCustomerId || '',
      attendanceId: preselectedAttendanceId || '',
      title: '',
      description: '',
      validUntil: '',
      paymentTerms: '',
      deliveryTerms: '',
      notes: '',
      items: [{ description: '', quantity: '1', unitPriceInput: '0,00', discountInput: '0,00' }],
    }
  });

  const { fields: itemFields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedCustomerId = watch('customerId');
  const watchedItems = watch('items');

  // Preview de Totais
  const previewTotals = watchedItems.map(item => {
    const qty = parseFloat(item.quantity?.replace(',', '.') || '0');
    const unitPriceCents = BRLInputToCents(item.unitPriceInput || '0');
    const discountCents = BRLInputToCents(item.discountInput || '0');
    
    const subtotal = Math.round(qty * unitPriceCents);
    const total = Math.max(0, subtotal - discountCents);
    return total;
  });
  const grandTotalCents = previewTotals.reduce((acc, curr) => acc + curr, 0);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (quote) {
        setInitialCustomerLabel(quote.customer?.name || '');
        setInitialAttendanceLabel(quote.attendance?.title || '');
        
        reset({
          customerId: quote.customerId,
          attendanceId: quote.attendanceId || '',
          title: quote.title,
          description: quote.description || '',
          validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '',
          paymentTerms: quote.paymentTerms || '',
          deliveryTerms: quote.deliveryTerms || '',
          notes: quote.notes || '',
          items: quote.items.map(i => ({
            description: i.description,
            quantity: i.quantity.toString(),
            unitPriceInput: centsToBRLInput(i.unitPriceCents),
            discountInput: centsToBRLInput(i.discountCents || 0),
          })),
        });
      } else {
        reset({
          customerId: preselectedCustomerId || '',
          attendanceId: preselectedAttendanceId || '',
          title: '',
          description: '',
          validUntil: '',
          paymentTerms: '',
          deliveryTerms: '',
          notes: '',
          items: [{ description: '', quantity: '1', unitPriceInput: '0,00', discountInput: '0,00' }],
        });

        // Carregar labels para pré-selecionados (simples fetch)
        if (preselectedCustomerId) {
          customersService.findById(preselectedCustomerId).then((c: any) => setInitialCustomerLabel(c.name)).catch(() => {});
        }
        if (preselectedAttendanceId) {
          attendancesService.findById(preselectedAttendanceId).then((a: any) => setInitialAttendanceLabel(a.title || '')).catch(() => {});
        }
      }
    }
  }, [isOpen, quote, reset, preselectedCustomerId, preselectedAttendanceId]);

  const loadCustomers = async (search: string) => {
    const res = await customersService.list({ search, limit: 10 });
    return res.data.map(c => ({ value: c.id, label: `${c.name} ${c.document ? `(${c.document})` : ''}`, data: c }));
  };

  const loadAttendances = async (search: string) => {
    const filters: any = { search, limit: 10 };
    if (selectedCustomerId) filters.customerId = selectedCustomerId;
    const res = await attendancesService.list(filters);
    return res.data.map(a => ({ value: a.id, label: a.title || 'Sem título', data: a }));
  };

  const handleCustomerSelect = (value: string) => {
    setValue('customerId', value, { shouldValidate: true });
    if (!value) {
      setValue('attendanceId', '');
      setInitialAttendanceLabel('');
    }
  };

  const handleAttendanceSelect = (value: string, option?: any) => {
    setValue('attendanceId', value);
    if (value && option?.data?.customerId) {
      setValue('customerId', option.data.customerId, { shouldValidate: true });
      if (option.data.customer?.name) {
        setInitialCustomerLabel(option.data.customer.name);
      }
    }
  };

  const formatCurrencyMask = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value === '') value = '0';
    const numberValue = parseInt(value, 10) / 100;
    onChange(numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (!data.customerId && !data.attendanceId) {
        throw new Error('Selecione um cliente ou atendimento vinculado');
      }

      const formattedItems: QuoteItem[] = data.items.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity.replace(',', '.')) || 1,
        unitPriceCents: BRLInputToCents(item.unitPriceInput),
        discountCents: BRLInputToCents(item.discountInput),
      }));

      const payload: any = {
        title: data.title,
        description: data.description || undefined,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
        paymentTerms: data.paymentTerms || undefined,
        deliveryTerms: data.deliveryTerms || undefined,
        notes: data.notes || undefined,
        items: formattedItems,
      };

      if (!quote) {
        if (data.customerId) payload.customerId = data.customerId;
        if (data.attendanceId) payload.attendanceId = data.attendanceId;
        await quotesService.create(payload as CreateQuoteData);
      } else {
        await quotesService.update(quote.id, payload);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao salvar orçamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {quote ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form id="quote-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Cliente {(!watch('attendanceId') || quote) && '*'}
                </label>
                {preselectedCustomerId && !quote ? (
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed">
                    {initialCustomerLabel || 'Cliente pré-selecionado'}
                  </div>
                ) : (
                  <Controller
                    name="customerId"
                    control={control}
                    render={({ field }) => (
                      <AsyncSearchSelect
                        value={field.value}
                        onChange={(val) => handleCustomerSelect(val)}
                        loadOptions={loadCustomers}
                        placeholder="Busque por nome, CPF/CNPJ..."
                        initialLabel={initialCustomerLabel}
                        loadOnFocus={true}
                        emptySearchLabel="Digite para buscar clientes"
                        initialOptionsLabel="Clientes recentes"
                      />
                    )}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Atendimento vinculado
                </label>
                {preselectedAttendanceId && !quote ? (
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed">
                    {initialAttendanceLabel || 'Atendimento pré-selecionado'}
                  </div>
                ) : (
                  <Controller
                    name="attendanceId"
                    control={control}
                    render={({ field }) => (
                      <AsyncSearchSelect
                        value={field.value}
                        onChange={(val, opt) => handleAttendanceSelect(val, opt)}
                        loadOptions={loadAttendances}
                        placeholder={selectedCustomerId ? "Busque os atendimentos deste cliente..." : "Busque um atendimento..."}
                        initialLabel={initialAttendanceLabel}
                        loadOnFocus={true}
                        emptySearchLabel={selectedCustomerId ? "Digite para buscar neste cliente" : "Digite para buscar atendimentos"}
                        initialOptionsLabel={selectedCustomerId ? "Atendimentos deste cliente" : "Atendimentos recentes"}
                      />
                    )}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Título do Orçamento *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Título é obrigatório' })}
                  className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text-primary)]"
                  placeholder="Ex: Instalação de Ar Condicionado"
                />
                {errors.title && <span className="mt-1 text-sm text-red-600">{errors.title.message}</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Válido até
                </label>
                <input
                  type="date"
                  {...register('validUntil')}
                  className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text-primary)]"
                />
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Itens do Orçamento</h3>
                <button
                  type="button"
                  onClick={() => append({ description: '', quantity: '1', unitPriceInput: '0,00', discountInput: '0,00' })}
                  className="flex items-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Item
                </button>
              </div>

              {errors.items?.root && <span className="text-red-500 text-xs mb-4 block">{errors.items.root.message}</span>}

              <div className="space-y-4">
                {itemFields.map((field, index) => (
                  <div key={field.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-[var(--color-border)] rounded-md bg-gray-50/50">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Descrição *</label>
                      <input
                        type="text"
                        {...register(`items.${index}.description` as const, { required: 'Obrigatório' })}
                        className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-white"
                        placeholder="Ex: Mão de obra"
                      />
                    </div>
                    <div className="w-full sm:w-24">
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Qtd *</label>
                      <input
                        type="text"
                        {...register(`items.${index}.quantity` as const, { required: 'Obrigatório' })}
                        className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-white"
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Valor Unit. (R$) *</label>
                      <Controller
                        name={`items.${index}.unitPriceInput` as const}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => formatCurrencyMask(e, onChange)}
                            className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-white text-right"
                          />
                        )}
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Desconto (R$)</label>
                      <Controller
                        name={`items.${index}.discountInput` as const}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => formatCurrencyMask(e, onChange)}
                            className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-white text-right"
                          />
                        )}
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Total (R$)</label>
                      <div className="w-full px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] text-right bg-transparent">
                        {(previewTotals[index] / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex items-end pb-1">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                        title="Remover item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <div className="bg-[var(--color-primary)]/10 p-4 rounded-lg flex items-center justify-between w-full sm:w-auto sm:min-w-[300px]">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">Total do Orçamento:</span>
                  <span className="text-xl font-bold text-[var(--color-primary)]">
                    R$ {(grandTotalCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Condições de Pagamento
                </label>
                <textarea
                  {...register('paymentTerms')}
                  rows={3}
                  className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text-primary)] resize-none"
                  placeholder="Ex: 50% no aceite, 50% na entrega"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Condições de Entrega
                </label>
                <textarea
                  {...register('deliveryTerms')}
                  rows={3}
                  className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text-primary)] resize-none"
                  placeholder="Ex: 15 dias úteis após o aceite"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Observações Adicionais (Internas)
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-[var(--color-background)] text-[var(--color-text-primary)] resize-none"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border)] bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="quote-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md transition-colors disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? 'Salvando...' : quote ? 'Atualizar Orçamento' : 'Criar Orçamento'}
          </button>
        </div>
      </div>
    </div>
  );
};
