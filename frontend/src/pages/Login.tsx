import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setErrorMsg('');
      await login(data);
    } catch (error: any) {
      if (error.response) {
        const { status } = error.response;
        if (status === 401) {
          setErrorMsg('E-mail ou senha inválidos.');
        } else if (status === 403) {
          setErrorMsg('Usuário inativo ou bloqueado.');
        } else if (status >= 500) {
          setErrorMsg('Erro no servidor. Tente novamente.');
        } else {
          setErrorMsg('Dados inválidos ou erro inesperado.');
        }
      } else {
        setErrorMsg('Erro de conexão. Verifique sua internet.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="max-w-md w-full bg-[var(--color-surface)] shadow-lg rounded-xl p-8 border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Cliente em Dia</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Acesse sua conta para continuar</p>
        </div>

        {errorMsg && (
          <div className="mb-4">
            <Alert type="error" message={errorMsg} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">E-mail</label>
            <input 
              type="email" 
              {...register('email')}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
            />
            {errors.email && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Senha</label>
            <input 
              type="password" 
              {...register('password')}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[var(--color-text-secondary)]">Não tem uma conta? </span>
          <Link to="/register" className="text-[var(--color-accent)] hover:text-[var(--color-primary)] font-medium">
            Cadastre-se grátis
          </Link>
        </div>
      </div>
    </div>
  );
};
