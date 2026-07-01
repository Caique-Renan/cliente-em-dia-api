import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { CustomerSource } from '../types/customer';
import type { Customer } from '../types/customer';
import { customersService } from '../services/customers.service';
import { Alert } from './Alert';
import { formatPhone, formatDocument, normalizePhone, normalizeDocument } from '../utils/formatters';

const customerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  document: z.string().optional(),
  source: z.nativeEnum(CustomerSource),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

type CustomerForm = z.infer<typeof customerSchema>;

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer; // if present, it's edit mode
}

// removed local formatting functions

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSuccess, customer }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      source: CustomerSource.OTHER,
    }
  });

  const [errorMsg, setErrorMsg] = React.useState('');

  const phoneValue = watch('phone');
  const documentValue = watch('document');

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        reset({
          name: customer.name,
          phone: formatPhone(customer.phone || ''),
          email: customer.email || '',
          document: formatDocument(customer.document || ''),
          source: customer.source,
          city: customer.city || '',
          district: customer.district || '',
          address: customer.address || '',
          notes: customer.notes || ''
        });
      } else {
        reset({
          name: '', phone: '', email: '', document: '', source: CustomerSource.OTHER, city: '', district: '', address: '', notes: ''
        });
      }
    }
    setErrorMsg('');
  }, [isOpen, customer, reset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('phone', formatPhone(e.target.value), { shouldValidate: true });
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('document', formatDocument(e.target.value), { shouldValidate: true });
  };

  const onSubmit = async (data: CustomerForm) => {
    try {
      const payload = {
        ...data,
        phone: normalizePhone(data.phone),
        email: data.email || null,
        document: normalizeDocument(data.document || ''),
        city: data.city || null,
        district: data.district || null,
        address: data.address || null,
        notes: data.notes || null,
      };

      if (customer) {
        await customersService.update(customer.id, payload);
      } else {
        await customersService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      setErrorMsg('Erro ao salvar cliente. Verifique os dados e tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 sm:p-0"
      onMouseDown={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-xl shadow-lg border border-[var(--color-border)] flex flex-col max-h-[90vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4">
              <Alert type="error" message={errorMsg} />
            </div>
          )}
          <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Nome *</label>
              <input type="text" {...register('name')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Telefone / WhatsApp *</label>
              <input type="text" value={phoneValue || ''} onChange={handlePhoneChange} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" placeholder="(11) 99999-9999" />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">E-mail</label>
              <input type="email" {...register('email')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">CPF / CNPJ</label>
              <input type="text" value={documentValue || ''} onChange={handleDocumentChange} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" />
              {errors.document && <p className="mt-1 text-sm text-red-600">{errors.document.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Origem</label>
              <select {...register('source')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none bg-transparent">
                {Object.values(CustomerSource).map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Cidade</label>
                <input type="text" {...register('city')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Bairro</label>
                <input type="text" {...register('district')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Endereço</label>
              <input type="text" {...register('address')} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Observações</label>
              <textarea {...register('notes')} rows={3} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all"></textarea>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-[var(--color-border)] flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-100 font-medium rounded-md transition-colors">
            Cancelar
          </button>
          <button type="submit" form="customer-form" disabled={isSubmitting} className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-md transition-colors disabled:opacity-70 flex items-center justify-center min-w-[100px]">
            {isSubmitting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};
