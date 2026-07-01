import React, { useEffect, useState } from 'react';

import { useForm as useReactHookForm } from 'react-hook-form'; // I will use standard import
import { X, Save, AlertCircle } from 'lucide-react';
import { messagesService } from '../services/messages.service';
import type { MessageCategory } from '../types/message';

interface MessageTemplateFormModalProps {
  templateId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  title: string;
  category: MessageCategory;
  content: string;
  isActive: boolean;
}

export const MessageTemplateFormModal: React.FC<MessageTemplateFormModalProps> = ({
  templateId,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useReactHookForm<FormValues>({
    defaultValues: {
      title: '',
      category: 'OUTRO',
      content: '',
      isActive: true
    }
  });

  useEffect(() => {
    if (templateId) {
      setLoading(true);
      messagesService.getTemplate(templateId)
        .then((data) => {
          reset({
            title: data.title,
            category: (data.category as MessageCategory) || 'OUTRO',
            content: data.content,
            isActive: data.isActive
          });
        })
        .catch(() => {
          setError('Erro ao carregar modelo.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [templateId, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      setError('');
      if (templateId) {
        await messagesService.updateTemplate(templateId, {
          title: data.title,
          category: data.category,
          content: data.content
        });
        await messagesService.updateTemplateStatus(templateId, data.isActive);
      } else {
        await messagesService.createTemplate({
          title: data.title,
          category: data.category,
          content: data.content
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar modelo.');
    } finally {
      setLoading(false);
    }
  };

  const copyVar = (variable: string) => {
    navigator.clipboard.writeText(variable);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {templateId ? 'Editar Modelo de Mensagem' : 'Novo Modelo de Mensagem'}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6 bg-blue-50/50 border border-blue-100 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Variáveis Disponíveis</h4>
            <p className="text-xs text-blue-600 mb-3">Clique em uma variável para copiar e colar no seu texto.</p>
            <div className="flex flex-wrap gap-2">
              {['{{customerName}}', '{{companyName}}', '{{attendanceTitle}}', '{{quoteTotal}}', '{{quoteStatus}}', '{{taskTitle}}', '{{dueDate}}'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => copyVar(v)}
                  className="px-2 py-1 bg-white border border-blue-200 text-blue-700 rounded text-xs font-mono hover:bg-blue-100 transition-colors"
                  title="Copiar variável"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <form id="template-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Título do Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Título é obrigatório' })}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                  placeholder="Ex: Confirmação de Visita"
                />
                {errors.title && <span className="mt-1 text-sm text-red-600">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Categoria
                </label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                >
                  <option value="PRIMEIRO_CONTATO">Primeiro contato</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="ORCAMENTO">Orçamento</option>
                  <option value="POS_VENDA">Pós-venda</option>
                  <option value="AVALIACAO">Avaliação</option>
                  <option value="REATIVACAO">Reativação</option>
                  <option value="COBRANCA">Cobrança</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Conteúdo da Mensagem <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('content', { required: 'Conteúdo é obrigatório' })}
                rows={8}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-text-primary)] resize-y"
                placeholder="Olá {{customerName}}, tudo bem? Gostaria de..."
              />
              {errors.content && <span className="mt-1 text-sm text-red-600">{errors.content.message}</span>}
            </div>

            {templateId && (
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-[var(--color-text-primary)]">
                  Modelo Ativo
                </label>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-white border border-[var(--color-border)] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="template-form"
            disabled={loading}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Modelo'}
          </button>
        </div>
      </div>
    </div>
  );
};
