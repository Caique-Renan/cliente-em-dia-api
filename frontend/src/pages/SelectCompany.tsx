import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from '../components/Alert';

export const SelectCompany: React.FC = () => {
  const { companies, selectCompany, logout } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelect = async (companyId: string) => {
    try {
      setLoadingId(companyId);
      setErrorMsg('');
      await selectCompany(companyId);
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 403) {
          setErrorMsg(data.message || 'Acesso negado à empresa');
        } else {
          setErrorMsg('Erro interno. Tente novamente.');
        }
      } else {
        setErrorMsg('Erro de conexão.');
      }
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Selecione sua Empresa</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Com qual negócio você quer trabalhar agora?</p>
        </div>

        {errorMsg && (
          <div className="mb-6">
            <Alert type="error" message={errorMsg} className="justify-center" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {companies.map((company) => (
            <div 
              key={company.id}
              onClick={() => !loadingId && handleSelect(company.id)}
              className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 cursor-pointer hover:border-[var(--color-accent)] hover:shadow-md transition-all flex flex-col items-center justify-center text-center ${loadingId === company.id ? 'opacity-70' : ''}`}
            >
              <div className="h-12 w-12 rounded-full bg-[var(--color-background)] text-[var(--color-primary)] flex items-center justify-center text-xl font-bold mb-4">
                {company.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{company.name}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{company.role}</p>
              
              {loadingId === company.id && (
                <div className="mt-4 animate-spin h-5 w-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"></div>
              )}
            </div>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center p-8 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)]">Nenhuma empresa encontrada para este usuário.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <button 
            onClick={logout}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium underline"
          >
            Sair e voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
};
