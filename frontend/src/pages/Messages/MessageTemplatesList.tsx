import React, { useState, useEffect } from 'react';
import { Plus, Search, MessageSquare, Edit } from 'lucide-react';
import { messagesService } from '../../services/messages.service';
import type { MessageTemplate } from '../../types/message';
import { MessageTemplateFormModal } from '../../components/MessageTemplateFormModal';
import { EmptyState } from '../../components/EmptyState';

export const MessageTemplatesList: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await messagesService.listTemplates();
      setTemplates(res.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (id?: string) => {
    setSelectedTemplateId(id || null);
    setIsModalOpen(true);
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Mensagens Prontas</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Gerencie seus modelos de mensagem para WhatsApp.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors font-medium shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Modelo
        </button>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar modelos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-surface)] text-[var(--color-text-primary)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--color-border)]">
                <th className="px-6 py-4 font-semibold text-sm text-[var(--color-text-secondary)]">Título</th>
                <th className="px-6 py-4 font-semibold text-sm text-[var(--color-text-secondary)]">Categoria</th>
                <th className="px-6 py-4 font-semibold text-sm text-[var(--color-text-secondary)]">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-[var(--color-text-secondary)] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                    Carregando modelos...
                  </td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-0">
                    {!searchTerm ? (
                      <EmptyState 
                        icon={<MessageSquare className="w-8 h-8" />}
                        title="Nenhum modelo de mensagem criado"
                        description="Crie modelos de mensagens para agilizar seu contato no WhatsApp."
                        actionLabel="Criar modelo"
                        onAction={() => handleOpenModal()}
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
                filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--color-text-primary)]">{template.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {template.category || 'Outro'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {template.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(template.id)}
                        className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] p-2 rounded-full hover:bg-[var(--color-primary)]/10 transition-colors"
                        title="Editar Modelo"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <MessageTemplateFormModal
          templateId={selectedTemplateId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTemplates();
          }}
        />
      )}
    </div>
  );
};
