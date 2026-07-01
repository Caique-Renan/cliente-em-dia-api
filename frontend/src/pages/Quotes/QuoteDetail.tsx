import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, User, LayoutDashboard, Calendar, AlignLeft, Send, Check, X, AlertCircle, MessageCircle } from 'lucide-react';
import { quotesService } from '../../services/quotes.service';
import type { Quote, QuoteStatus } from '../../types/quote';
import { QuoteFormModal } from '../../components/QuoteFormModal';
import { MessageComposerModal } from '../../components/MessageComposerModal';

const statusMap: Record<QuoteStatus, { label: string; bg: string; text: string }> = {
  DRAFT: { label: 'Rascunho', bg: 'bg-gray-100', text: 'text-gray-700' },
  SENT: { label: 'Enviado', bg: 'bg-blue-100', text: 'text-blue-700' },
  ACCEPTED: { label: 'Aceito', bg: 'bg-green-100', text: 'text-green-700' },
  REJECTED: { label: 'Recusado', bg: 'bg-red-100', text: 'text-red-700' },
  EXPIRED: { label: 'Expirado', bg: 'bg-orange-100', text: 'text-orange-700' },
};

export const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const loadQuote = async () => {
    try {
      if (!id) return;
      const data = await quotesService.getById(id);
      setQuote(data);
    } catch (error) {
      console.error('Failed to load quote', error);
      navigate('/quotes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuote();
  }, [id]);

  const handleStatusUpdate = async (newStatus: QuoteStatus) => {
    if (!quote) return;
    try {
      setIsStatusUpdating(true);
      await quotesService.updateStatus(quote.id, newStatus);
      await loadQuote();
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('pt-BR');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando detalhes do orçamento...</div>;
  }

  if (!quote) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header com botões */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Link to="/quotes" className="mr-4 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center">
            {quote.title}
          </h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none flex justify-center items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </button>
          {quote.customer && (
            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="flex-1 sm:flex-none flex justify-center items-center bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </button>
          )}
        </div>
      </div>

      {/* Ação rápida de Status */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-500 mr-4">Status Atual:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusMap[quote.status].bg} ${statusMap[quote.status].text}`}>
            {statusMap[quote.status].label}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {quote.status === 'DRAFT' && (
            <button
              onClick={() => handleStatusUpdate('SENT')}
              disabled={isStatusUpdating}
              className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-1.5" /> Enviar
            </button>
          )}
          
          {(quote.status === 'SENT' || quote.status === 'DRAFT') && (
            <>
              <button
                onClick={() => handleStatusUpdate('ACCEPTED')}
                disabled={isStatusUpdating}
                className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4 mr-1.5" /> Aceitar
              </button>
              <button
                onClick={() => handleStatusUpdate('REJECTED')}
                disabled={isStatusUpdating}
                className="flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-1.5" /> Recusar
              </button>
            </>
          )}

          {quote.status !== 'EXPIRED' && quote.status !== 'ACCEPTED' && quote.status !== 'REJECTED' && (
            <button
              onClick={() => handleStatusUpdate('EXPIRED')}
              disabled={isStatusUpdating}
              className="flex items-center px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              <AlertCircle className="w-4 h-4 mr-1.5" /> Marcar Expirado
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Resumo do Orçamento */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-400" />
              Resumo do Orçamento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Título</span>
                <span className="block text-gray-900">{quote.title}</span>
              </div>
              
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Valor Total</span>
                <span className="block text-xl font-bold text-[var(--color-primary)]">
                  {formatCurrency(quote.totalValueCents)}
                </span>
              </div>

              {quote.description && (
                <div className="md:col-span-2">
                  <span className="block text-sm font-medium text-gray-500 mb-1">Descrição</span>
                  <p className="text-gray-900 whitespace-pre-wrap">{quote.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card de Itens */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LayoutDashboard className="w-5 h-5 mr-2 text-gray-400" />
              Itens do Orçamento
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qtd</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Unit.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Desconto</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quote.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unitPriceCents)}</td>
                      <td className="px-4 py-3 text-sm text-red-600 text-right">
                        {item.discountCents ? `-${formatCurrency(item.discountCents)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.totalPriceCents || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total Geral</td>
                    <td className="px-4 py-3 text-base font-bold text-[var(--color-primary)] text-right">
                      {formatCurrency(quote.totalValueCents)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Condições e Notas */}
          {(quote.paymentTerms || quote.deliveryTerms || quote.notes) && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlignLeft className="w-5 h-5 mr-2 text-gray-400" />
                Condições e Observações
              </h2>
              
              <div className="space-y-4">
                {quote.paymentTerms && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500 mb-1">Condições de Pagamento</span>
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">{quote.paymentTerms}</p>
                  </div>
                )}
                {quote.deliveryTerms && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500 mb-1">Condições de Entrega</span>
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">{quote.deliveryTerms}</p>
                  </div>
                )}
                {quote.notes && (
                  <div>
                    <span className="block text-sm font-medium text-gray-500 mb-1">Observações Internas</span>
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">{quote.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar com Vínculos e Datas */}
        <div className="space-y-6">
          {/* Cliente */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Vínculos</h2>
            
            <div className="space-y-4">
              <div>
                <span className="flex items-center text-xs font-medium text-gray-500 mb-2">
                  <User className="w-4 h-4 mr-1" /> Cliente Relacionado
                </span>
                {quote.customer ? (
                  <Link to={`/customers/${quote.customer.id}`} className="block p-3 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900 text-sm">{quote.customer.name}</p>
                    {quote.customer.document && <p className="text-xs text-gray-500 mt-1">Doc: {quote.customer.document}</p>}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-500 italic">Nenhum cliente vinculado</p>
                )}
              </div>

              {quote.attendance && (
                <div>
                  <span className="flex items-center text-xs font-medium text-gray-500 mb-2">
                    <MessageSquareIcon className="w-4 h-4 mr-1" /> Atendimento
                  </span>
                  <Link to={`/attendances/${quote.attendance.id}`} className="block p-3 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900 text-sm line-clamp-2">{quote.attendance.title}</p>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Datas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Linha do Tempo
            </h2>
            
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-gray-500">Criado em:</span>
                <span className="text-gray-900 font-medium">{formatDateTime(quote.createdAt)}</span>
              </li>
              {quote.validUntil && (
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Válido até:</span>
                  <span className="text-gray-900 font-medium">{formatDate(quote.validUntil)}</span>
                </li>
              )}
              {quote.sentAt && (
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Enviado em:</span>
                  <span className="text-gray-900 font-medium">{formatDateTime(quote.sentAt)}</span>
                </li>
              )}
              {quote.acceptedAt && (
                <li className="flex justify-between items-center">
                  <span className="text-green-600 font-medium">Aceito em:</span>
                  <span className="text-green-700 font-medium">{formatDateTime(quote.acceptedAt)}</span>
                </li>
              )}
              {quote.rejectedAt && (
                <li className="flex justify-between items-center">
                  <span className="text-red-600 font-medium">Recusado em:</span>
                  <span className="text-red-700 font-medium">{formatDateTime(quote.rejectedAt)}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <QuoteFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadQuote();
        }}
        quote={quote}
      />

      {isMessageModalOpen && quote.customer && (
        <MessageComposerModal
          customerId={quote.customerId}
          customerName={quote.customer.name}
          customerPhone={quote.customer.phone || undefined}
          quoteId={quote.id}
          attendanceId={quote.attendanceId || undefined}
          onClose={() => setIsMessageModalOpen(false)}
        />
      )}
    </div>
  );
};

// Helper temporal
const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
