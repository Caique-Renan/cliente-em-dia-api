import React from 'react';
import {
  Users, MessageSquare, CheckSquare, FileText,
  TrendingUp, TrendingDown, AlertTriangle, Calendar,
  DollarSign, MessageCircle, BarChart2, RefreshCw, BarChart,
} from 'lucide-react';
import { reportsService } from '../../services/reports.service';
import type { ReportsOverview, PeriodPreset } from '../../types/report';
import { EmptyState } from '../../components/EmptyState';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function buildPeriod(preset: PeriodPreset, custom?: { from: string; to: string }): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  const startOf = (d: Date) => { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; };
  const endOf   = (d: Date) => { const r = new Date(d); r.setHours(23, 59, 59, 999); return r; };

  switch (preset) {
    case 'today':
      return { dateFrom: iso(startOf(now)), dateTo: iso(endOf(now)) };
    case 'last7': {
      const d = new Date(now); d.setDate(d.getDate() - 6);
      return { dateFrom: iso(startOf(d)), dateTo: iso(endOf(now)) };
    }
    case 'last30': {
      const d = new Date(now); d.setDate(d.getDate() - 29);
      return { dateFrom: iso(startOf(d)), dateTo: iso(endOf(now)) };
    }
    case 'thisMonth': {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { dateFrom: iso(startOf(d)), dateTo: iso(endOf(now)) };
    }
    case 'lastMonth': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last  = new Date(now.getFullYear(), now.getMonth(), 0);
      return { dateFrom: iso(startOf(first)), dateTo: iso(endOf(last)) };
    }
    case 'custom':
      return { dateFrom: custom!.from + 'T00:00:00.000Z', dateTo: custom!.to + 'T23:59:59.999Z' };
    default:
      return buildPeriod('last30');
  }
}

// ─── Status labels ─────────────────────────────────────────────────────────────

const ATTENDANCE_STATUS_LABEL: Record<string, string> = {
  NEW: 'Novo', IN_PROGRESS: 'Em andamento', WAITING_CUSTOMER: 'Aguardando cliente',
  QUOTE_SENT: 'Orçamento enviado', NEGOTIATION: 'Negociação',
  WON: 'Ganho', LOST: 'Perdido', POST_SALE: 'Pós-venda', CANCELED: 'Cancelado',
};
const ATTENDANCE_STATUS_COLOR: Record<string, string> = {
  NEW: 'bg-blue-500', IN_PROGRESS: 'bg-indigo-500', WAITING_CUSTOMER: 'bg-yellow-500',
  QUOTE_SENT: 'bg-orange-400', NEGOTIATION: 'bg-purple-500',
  WON: 'bg-emerald-500', LOST: 'bg-red-500', POST_SALE: 'bg-teal-500', CANCELED: 'bg-gray-400',
};

const QUOTE_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho', SENT: 'Enviado', ACCEPTED: 'Aceito', REJECTED: 'Recusado', EXPIRED: 'Expirado',
};
const QUOTE_STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-400', SENT: 'bg-blue-500', ACCEPTED: 'bg-emerald-500', REJECTED: 'bg-red-500', EXPIRED: 'bg-amber-500',
};

// ─── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  danger?: boolean;
}
function StatCard({ title, value, sub, icon, iconBg, danger }: StatCardProps) {
  return (
    <div className={`bg-[var(--color-surface)] rounded-xl p-5 border shadow-sm flex flex-col gap-3 ${danger ? 'border-red-300' : 'border-[var(--color-border)]'}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <p className={`text-3xl font-bold ${danger ? 'text-red-600' : 'text-[var(--color-text-primary)]'}`}>{value}</p>
      {sub && <p className="text-xs text-[var(--color-text-secondary)]">{sub}</p>}
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}
function ProgressBar({ label, count, total, colorClass }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 text-sm text-[var(--color-text-secondary)] truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${colorClass} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-sm font-semibold text-[var(--color-text-primary)]">{count}</span>
      <span className="w-12 text-right text-xs text-[var(--color-text-secondary)]">{pct}%</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: 'today',     label: 'Hoje' },
  { key: 'last7',     label: '7 dias' },
  { key: 'last30',    label: '30 dias' },
  { key: 'thisMonth', label: 'Este mês' },
  { key: 'lastMonth', label: 'Mês passado' },
  { key: 'custom',    label: 'Personalizado' },
];

export const ReportsOverviewPage: React.FC = () => {
  const [preset, setPreset]       = React.useState<PeriodPreset>('last30');
  const [customFrom, setCustomFrom] = React.useState('');
  const [customTo,   setCustomTo]   = React.useState('');
  const [loading, setLoading]     = React.useState(true);
  const [data, setData]           = React.useState<ReportsOverview | null>(null);
  const [error, setError]         = React.useState<string | null>(null);

  const load = React.useCallback(async (p: PeriodPreset, cFrom?: string, cTo?: string) => {
    setLoading(true);
    setError(null);
    try {
      const period = buildPeriod(p, cFrom && cTo ? { from: cFrom, to: cTo } : undefined);
      const res = await reportsService.getOverview(period);
      setData(res);
    } catch {
      setError('Erro ao carregar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load('last30'); }, [load]);

  const handlePreset = (p: PeriodPreset) => {
    setPreset(p);
    if (p !== 'custom') load(p);
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) load('custom', customFrom, customTo);
  };

  const stats = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-[var(--color-primary)]" />
            Relatórios
          </h1>
          {stats && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {formatDate(stats.period.from)} — {formatDate(stats.period.to)}
            </p>
          )}
        </div>
        <button
          onClick={() => load(preset, customFrom || undefined, customTo || undefined)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/5 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Period Filter */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <Calendar className="h-4 w-4 text-[var(--color-text-secondary)]" />
          {PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => handlePreset(p.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                preset === p.key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-gray-100 text-[var(--color-text-secondary)] hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
          {preset === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
              <span className="text-[var(--color-text-secondary)] text-sm">até</span>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
              <button
                onClick={handleCustomApply}
                disabled={!customFrom || !customTo}
                className="px-4 py-1.5 text-sm font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 animate-pulse h-32" />
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && stats && stats.customers.total === 0 ? (
        <div className="mt-8">
          <EmptyState 
            icon={<BarChart className="w-8 h-8" />}
            title="Ainda não há dados suficientes"
            description="Cadastre clientes, atendimentos e orçamentos para começar a visualizar seus resultados."
          />
        </div>
      ) : !loading && stats && (
        <>
          {/* Top summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Clientes novos"
              value={stats.customers.newInPeriod}
              sub={`${stats.customers.total} total cadastrado`}
              icon={<Users className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
            />
            <StatCard
              title="Atendimentos abertos"
              value={stats.attendances.open}
              sub={`${stats.attendances.total} total`}
              icon={<MessageSquare className="h-5 w-5 text-indigo-600" />}
              iconBg="bg-indigo-100"
            />
            <StatCard
              title="Follow-ups atrasados"
              value={stats.tasks.overdue}
              sub={`${stats.tasks.pending} pendentes · ${stats.tasks.dueToday} hoje`}
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-100"
              danger={stats.tasks.overdue > 0}
            />
            <StatCard
              title="Orçamentos em aberto"
              value={stats.quotes.open}
              sub={`${stats.quotes.total} total`}
              icon={<FileText className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
            />
          </div>

          {/* Value cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Valor em aberto"
              value={formatBRL(stats.quotes.openValueCents)}
              sub={`${stats.quotes.open} orçamento(s) aguardando decisão`}
              icon={<DollarSign className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
            />
            <StatCard
              title="Valor aceito no período"
              value={formatBRL(stats.quotes.acceptedValueCents)}
              sub={`${stats.quotes.accepted} orçamento(s) aceito(s)`}
              icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              title="Taxa de conversão"
              value={`${stats.quotes.conversionRate}%`}
              sub={`Aceitos / (Aceitos + Recusados)`}
              icon={<BarChart2 className="h-5 w-5 text-[var(--color-primary)]" />}
              iconBg="bg-[var(--color-primary)]/10"
              danger={stats.quotes.conversionRate < 30 && (stats.quotes.accepted + stats.quotes.rejected) > 0}
            />
          </div>

          {/* Sections row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Atendimentos por Status */}
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-500" />
                Atendimentos por Status
              </h2>
              {stats.attendances.byStatus.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">Nenhum atendimento cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {stats.attendances.byStatus
                    .sort((a, b) => b.count - a.count)
                    .map(s => (
                      <ProgressBar
                        key={s.status}
                        label={ATTENDANCE_STATUS_LABEL[s.status] ?? s.status}
                        count={s.count}
                        total={stats.attendances.total}
                        colorClass={ATTENDANCE_STATUS_COLOR[s.status] ?? 'bg-gray-400'}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Orçamentos por Status */}
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-500" />
                Orçamentos por Status (estado atual)
              </h2>
              {stats.quotes.byStatus.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">Nenhum orçamento cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {stats.quotes.byStatus
                    .sort((a, b) => b.count - a.count)
                    .map(s => (
                      <div key={s.status} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-36">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${QUOTE_STATUS_COLOR[s.status] ?? 'bg-gray-400'}`} />
                          <span className="text-sm text-[var(--color-text-secondary)] truncate">{QUOTE_STATUS_LABEL[s.status] ?? s.status}</span>
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`${QUOTE_STATUS_COLOR[s.status] ?? 'bg-gray-400'} h-2 rounded-full transition-all duration-500`}
                            style={{ width: stats.quotes.total > 0 ? `${Math.round((s.count / stats.quotes.total) * 100)}%` : '0%' }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm font-semibold text-[var(--color-text-primary)]">{s.count}</span>
                        <span className="w-24 text-right text-xs text-[var(--color-text-secondary)]">{formatBRL(s.totalValueCents)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Follow-ups + Mensagens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Follow-ups */}
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-emerald-500" />
                Follow-ups / Tarefas
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.tasks.pending}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Pendentes</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${stats.tasks.overdue > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className={`text-2xl font-bold ${stats.tasks.overdue > 0 ? 'text-red-600' : 'text-[var(--color-text-primary)]'}`}>{stats.tasks.overdue}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Atrasados ⚠️</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{stats.tasks.dueToday}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Vencem hoje</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-700">{stats.tasks.completedInPeriod}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Concluídos no período</p>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-500" />
                Mensagens WhatsApp (período)
              </h2>
              {stats.messages.total === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">Nenhuma mensagem enviada no período</p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.messages.total}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">Total</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{stats.messages.copied}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">Copiadas</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{stats.messages.whatsappOpened}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">WhatsApp</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary row — won/lost */}
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Resumo de Atendimentos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-700">{stats.attendances.total}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Total</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{stats.attendances.open}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Abertos</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-700 flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" />{stats.attendances.won}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Ganhos</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-700 flex items-center justify-center gap-1">
                  <TrendingDown className="h-4 w-4" />{stats.attendances.lost}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Perdidos</p>
              </div>
            </div>
          </div>

        </>
      )}

      {/* No data */}
      {!loading && !stats && !error && (
        <div className="text-center py-16 text-[var(--color-text-secondary)]">
          <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Nenhum dado disponível</p>
        </div>
      )}
    </div>
  );
};
