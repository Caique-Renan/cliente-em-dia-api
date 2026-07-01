import React, { useState, useEffect } from 'react';
import { X, Copy, ExternalLink, MessageSquare } from 'lucide-react';
import { messagesService } from '../services/messages.service';
import type { MessageTemplate, MessageAction } from '../types/message';

interface MessageComposerModalProps {
  customerId: string;
  customerName: string;
  customerPhone?: string;
  attendanceId?: string;
  quoteId?: string;
  taskId?: string;
  onClose: () => void;
  onSuccess?: () => void; // Called after log is registered
}

export const MessageComposerModal: React.FC<MessageComposerModalProps> = ({
  customerId,
  customerName,
  customerPhone,
  attendanceId,
  quoteId,
  taskId,
  onClose,
  onSuccess
}) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messagesService.listTemplates()
      .then(res => {
        const activeTemplates = res.data.filter(t => t.isActive);
        setTemplates(activeTemplates);
        if (activeTemplates.length > 0) {
           setSelectedTemplateId(activeTemplates[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTemplateId) {
      setLoadingPreview(true);
      messagesService.previewMessage({
        templateId: selectedTemplateId,
        customerId,
        attendanceId,
        quoteId,
        taskId
      })
      .then(res => setPreviewContent(res.content))
      .catch(err => {
         console.error(err);
         setPreviewContent('Erro ao gerar preview.');
      })
      .finally(() => setLoadingPreview(false));
    } else {
      setPreviewContent('');
    }
  }, [selectedTemplateId, customerId, attendanceId, quoteId, taskId]);

  const normalizePhone = (phone?: string) => {
    if (!phone) return '';
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }
    return cleanPhone;
  };

  const logAction = async (action: MessageAction) => {
    try {
      await messagesService.createLog({
        customerId,
        action,
        content: previewContent,
        attendanceId,
        quoteId,
        taskId,
        templateId: selectedTemplateId || undefined
      });
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error('Failed to log message action', e);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewContent);
    await logAction('COPIED');
    onClose();
  };

  const handleWhatsApp = async () => {
    const phone = normalizePhone(customerPhone);
    if (!phone) {
       alert('Cliente não possui telefone cadastrado.');
       return;
    }
    const encodedMessage = encodeURIComponent(previewContent);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    await logAction('OPENED_WHATSAPP');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-[var(--color-primary)] mr-2" />
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Enviar Mensagem
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="mb-4">
            <span className="text-sm text-[var(--color-text-secondary)]">Destinatário:</span>
            <p className="font-medium text-[var(--color-text-primary)]">{customerName} {customerPhone ? `(${customerPhone})` : '(Sem telefone)'}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Modelo de Mensagem
              </label>
              {loading ? (
                 <p className="text-sm text-gray-500">Carregando modelos...</p>
              ) : templates.length === 0 ? (
                 <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">Nenhum modelo ativo encontrado.</p>
              ) : (
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Preview da Mensagem
              </label>
              <div className="w-full p-4 border border-[var(--color-border)] rounded-lg bg-gray-50 text-[var(--color-text-primary)] min-h-[120px] whitespace-pre-wrap">
                {loadingPreview ? (
                  <span className="text-gray-400">Gerando preview...</span>
                ) : (
                  previewContent || <span className="text-gray-400">Selecione um modelo</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-gray-50 flex justify-end gap-3">
          <button
            onClick={handleCopy}
            disabled={!previewContent || loadingPreview}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar Texto
          </button>
          
          <button
            onClick={handleWhatsApp}
            disabled={!previewContent || loadingPreview || !customerPhone}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            WhatsApp Web
          </button>
        </div>
      </div>
    </div>
  );
};
