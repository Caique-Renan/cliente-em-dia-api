import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit2, CheckCircle, XCircle, Users } from 'lucide-react';
import { CustomerSource, CustomerStatus } from '../../types/customer';
import type { Customer } from '../../types/customer';
import { customersService } from '../../services/customers.service';
import { Pagination } from '../../components/Pagination';
import { CustomerFormModal } from '../../components/CustomerFormModal';
import { EmptyState } from '../../components/EmptyState';
import { Link } from 'react-router-dom';

export const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination and Filters state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | undefined>();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (source) params.source = source;
      if (status) params.status = status;
      
      const response = await customersService.list(params);
      setCustomers(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, source, status]);

  const handleToggleStatus = async (customer: Customer) => {
    const newStatus = customer.status === CustomerStatus.ACTIVE ? CustomerStatus.INACTIVE : CustomerStatus.ACTIVE;
    try {
      await customersService.updateStatus(customer.id, newStatus);
      fetchCustomers(); // Refresh list
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao alterar status.');
    }
  };

  const openNewModal = () => {
    setCustomerToEdit(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
  };

  // Utility to format phone for display
  const formatPhone = (val?: string | null) => {
    if (!val) return '-';
    if (val.length === 11) return val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (val.length === 10) return val.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return val;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
          ← Voltar ao Dashboard
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Clientes</h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-sm">Gerencie sua carteira de clientes</p>
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nome, telefone ou e-mail..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-md outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              value={source} 
              onChange={e => { setSource(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-md outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-transparent appearance-none"
            >
              <option value="">Todas as Origens</option>
              {Object.values(CustomerSource).map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              value={status} 
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-md outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-transparent appearance-none"
            >
              <option value="">Todos os Status</option>
              <option value={CustomerStatus.ACTIVE}>Ativo</option>
              <option value={CustomerStatus.INACTIVE}>Inativo</option>
              <option value={CustomerStatus.BLOCKED}>Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--color-border)]">
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Origem</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Cidade</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Últ. Contato</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-text-secondary)]">Carregando...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    {(!search && !source && !status) ? (
                      <EmptyState 
                        icon={<Users className="w-8 h-8" />}
                        title="Nenhum cliente cadastrado ainda"
                        description="Comece adicionando seu primeiro cliente para gerenciar sua carteira."
                        actionLabel="Novo cliente"
                        onAction={openNewModal}
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
                customers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-[var(--color-text-primary)]">{customer.name}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">{customer.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-primary)]">
                      {formatPhone(customer.phone)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-secondary)]">
                      {customer.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${customer.status === CustomerStatus.ACTIVE ? 'bg-green-100 text-green-800' : ''}
                        ${customer.status === CustomerStatus.INACTIVE ? 'bg-gray-100 text-gray-800' : ''}
                        ${customer.status === CustomerStatus.BLOCKED ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-secondary)]">
                      {customer.city || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-secondary)]">
                      {formatDate(customer.lastContactAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <Link to={`/customers/${customer.id}`} className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] tooltip-trigger" title="Ver Detalhes">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button onClick={() => openEditModal(customer)} className="text-[var(--color-accent)] hover:text-teal-600 tooltip-trigger" title="Editar">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(customer)} 
                          className={`${customer.status === CustomerStatus.ACTIVE ? 'text-[var(--color-danger)] hover:text-red-800' : 'text-[var(--color-success)] hover:text-green-800'} tooltip-trigger`}
                          title={customer.status === CustomerStatus.ACTIVE ? 'Inativar' : 'Ativar'}
                        >
                          {customer.status === CustomerStatus.ACTIVE ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <CustomerFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => { fetchCustomers(); }} 
        customer={customerToEdit} 
      />
    </div>
  );
};
