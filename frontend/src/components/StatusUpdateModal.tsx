import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { AttendanceStatus } from '../types/attendance';
import type { Attendance, AttendanceStatusType } from '../types/attendance';
import { attendancesService } from '../services/attendances.service';
import { Alert } from './Alert';

const statusMap: Record<string, { label: string; color: string }> = {
  [AttendanceStatus.NEW]: { label: 'Novo', color: 'bg-blue-100 text-blue-800' },
  [AttendanceStatus.IN_PROGRESS]: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
  [AttendanceStatus.WAITING_CUSTOMER]: { label: 'Aguardando Cliente', color: 'bg-orange-100 text-orange-800' },
  [AttendanceStatus.QUOTE_SENT]: { label: 'Orçamento Enviado', color: 'bg-purple-100 text-purple-800' },
  [AttendanceStatus.NEGOTIATION]: { label: 'Em Negociação', color: 'bg-indigo-100 text-indigo-800' },
  [AttendanceStatus.WON]: { label: 'Ganho', color: 'bg-green-100 text-green-800' },
  [AttendanceStatus.LOST]: { label: 'Perdido', color: 'bg-red-100 text-red-800' },
  [AttendanceStatus.POST_SALE]: { label: 'Pós-Venda', color: 'bg-teal-100 text-teal-800' },
  [AttendanceStatus.CANCELED]: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
};

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: Attendance | null;
  onSuccess: (updatedAttendance: Attendance) => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  attendance,
  onSuccess
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatusType | ''>('');
  const [lossReason, setLossReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && attendance) {
      setSelectedStatus(attendance.status);
      setLossReason(attendance.lossReason || '');
      setError('');
    }
  }, [isOpen, attendance]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || !attendance) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;
    if (selectedStatus === attendance.status && selectedStatus !== AttendanceStatus.LOST) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const updated = await attendancesService.updateStatus(attendance.id, {
        status: selectedStatus,
        lossReason: selectedStatus === AttendanceStatus.LOST ? lossReason : undefined
      });
      onSuccess(updated);
      onClose();
    } catch (err) {
      console.error('Failed to update status', err);
      setError('Erro ao atualizar status. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4"
      onMouseDown={() => !isSubmitting && onClose()}
    >
      <div 
        className="relative w-full max-w-md bg-[var(--color-surface)] rounded-xl shadow-lg border border-[var(--color-border)] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Atualizar Status
          </h3>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Status Atual</label>
              <div className="px-3 py-2 bg-gray-50 border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-secondary)]">
                {statusMap[attendance.status]?.label}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Novo Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AttendanceStatusType)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none bg-white transition-all"
                disabled={isSubmitting}
              >
                {Object.entries(statusMap).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {selectedStatus === AttendanceStatus.LOST && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Motivo da perda <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input 
                  type="text" 
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  placeholder="Ex: Preço, Concorrente, Desistiu..."
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] outline-none transition-all"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
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
              disabled={isSubmitting || !selectedStatus}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Alteração
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
