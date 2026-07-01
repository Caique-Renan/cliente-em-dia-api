import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, FileText, CheckSquare, MessageSquare, TrendingUp, AlertTriangle, DollarSign, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reportsService } from '../services/reports.service';
import type { ReportsOverview } from '../types/report';

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export const Dashboard: React.FC = () => {
  const { user, activeCompany } = useAuth();
  const [data, setData] = React.useState<ReportsOverview | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    reportsService.getOverview().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const val = (n: number | undefined) => (loading ? '...' : (n ?? 0));

  return (
    <>
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Olá, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Bem-vindo ao painel da <span className="font-semibold text-[var(--color-primary)]">{activeCompany?.name}</span>
        </p>
      </div>

      {/* Onboarding Empty State */}
      {!loading && data?.customers.total === 0 && (
        <div className="bg-[var(--color-surface)] rounded-xl p-8 border border-[var(--color-primary)] shadow-sm mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">Vamos começar?</h3>
            <p className="text-[var(--color-text-secondary)] mb-4 max-w-lg">
              Sua conta está pronta. Siga estes 3 passos simples para organizar seu negócio:
            </p>
            <ol className="text-[var(--color-text-primary)] space-y-2 list-decimal list-inside font-medium mb-6">
              <li>Cadastre seu primeiro cliente.</li>
              <li>Registre um atendimento.</li>
              <li>Crie um follow-up ou orçamento.</li>
            </ol>
            <Link 
              to="/customers" 
              className="inline-flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-2.5 rounded-md font-medium transition-colors"
            >
              Adicionar cliente
            </Link>
          </div>
          <div className="hidden md:flex opacity-20">
            <Users className="h-40 w-40 text-[var(--color-primary)]" />
          </div>
        </div>
      )}

      {/* Summary cards — 4 main */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

        {/* Clientes */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-text-secondary)]">Clientes</h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{val(data?.customers.total)}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">
            <span className="font-semibold text-[var(--color-primary)]">{val(data?.customers.newInPeriod)}</span> novos nos últimos 30 dias
          </p>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <Link to="/customers" className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
              Gerenciar clientes →
            </Link>
          </div>
        </div>

        {/* Atendimentos */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-text-secondary)]">Atendimentos</h3>
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><MessageSquare className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{val(data?.attendances.open)}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">
            abertos · <span className="text-emerald-600 font-medium">{val(data?.attendances.won)} ganhos</span>
            {' · '}<span className="text-red-500 font-medium">{val(data?.attendances.lost)} perdidos</span>
          </p>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <Link to="/attendances" className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
              Ver atendimentos →
            </Link>
          </div>
        </div>

        {/* Orçamentos */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-text-secondary)]">Orçamentos em aberto</h3>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileText className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{val(data?.quotes.open)}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">
            {loading ? '...' : formatBRL(data?.quotes.openValueCents ?? 0)} em aberto
          </p>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <Link to="/quotes" className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
              Ver orçamentos →
            </Link>
          </div>
        </div>

        {/* Follow-ups */}
        <div className={`bg-[var(--color-surface)] rounded-xl p-6 border shadow-sm flex flex-col justify-between ${data?.tasks.overdue && data.tasks.overdue > 0 ? 'border-red-300' : 'border-[var(--color-border)]'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-text-secondary)]">Follow-ups</h3>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
          </div>
          <p className={`text-3xl font-bold ${data?.tasks.overdue && data.tasks.overdue > 0 ? 'text-red-600' : 'text-[var(--color-text-primary)]'}`}>
            {val(data?.tasks.overdue)}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">
            atrasados · {val(data?.tasks.dueToday)} para hoje · {val(data?.tasks.pending)} pendentes
          </p>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <Link to="/tasks" className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
              Ver tarefas →
            </Link>
          </div>
        </div>
      </div>

      {/* Value highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Valor em aberto</p>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{loading ? '...' : formatBRL(data?.quotes.openValueCents ?? 0)}</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Valor aceito (30 dias)</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{loading ? '...' : formatBRL(data?.quotes.acceptedValueCents ?? 0)}</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare className="h-5 w-5 text-[var(--color-primary)]" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Taxa de conversão</p>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{loading ? '...' : `${data?.quotes.conversionRate ?? 0}%`}</p>
        </div>
      </div>

      {/* Link to full reports */}
      <div className="flex justify-end">
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
        >
          <BarChart2 className="h-4 w-4" />
          Ver relatório completo
        </Link>
      </div>
    </>
  );
};
