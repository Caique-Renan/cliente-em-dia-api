import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  companyName: z.string().min(2, 'Nome da empresa é obrigatório'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerAction } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setErrorMsg('');
      await registerAction(data);
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          setErrorMsg(data.message || 'Dados inválidos. Verifique os campos.');
        } else {
          setErrorMsg('Erro interno no servidor. Tente novamente mais tarde.');
        }
      } else {
        setErrorMsg('Erro de conexão. Verifique sua internet.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[var(--color-surface)] shadow-lg rounded-xl p-8 border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Criar Conta</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Comece a organizar seu negócio hoje</p>
        </div>

        {errorMsg && (
          <div className="mb-4">
            <Alert type="error" message={errorMsg} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Seu Nome</label>
            <input 
              type="text" 
              {...register('name')}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition-all"
              placeholder="João Silva"
            />
            {errors.name && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.name.message}</p>}
          </div>

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
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Nome da sua Empresa</label>
            <input 
              type="text" 
              {...register('companyName')}
              className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition-all"
              placeholder="Minha Loja"
            />
            {errors.companyName && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.companyName.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70 mt-6"
          >
            {isSubmitting ? 'Criando conta...' : 'Criar minha conta grátis'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[var(--color-text-secondary)]">Já tem uma conta? </span>
          <Link to="/login" className="text-[var(--color-accent)] hover:text-[var(--color-primary)] font-medium">
            Entrar agora
          </Link>
        </div>
      </div>
    </div>
  );
};
