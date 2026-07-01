import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, FileText, CheckSquare, LogOut, MessageSquare, Menu, X, BarChart2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, activeCompany, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/customers', active: location.pathname.startsWith('/customers') },
    { icon: MessageSquare, label: 'Atendimentos', path: '/attendances', active: location.pathname.startsWith('/attendances') },
    { icon: FileText, label: 'Orçamentos', path: '/quotes', active: location.pathname.startsWith('/quotes') },
    { icon: CheckSquare, label: 'Follow-ups', path: '/tasks', active: location.pathname.startsWith('/tasks') },
    { icon: MessageSquare, label: 'Mensagens', path: '/messages', active: location.pathname.startsWith('/messages') },
    { icon: BarChart2, label: 'Relatórios', path: '/reports', active: location.pathname.startsWith('/reports') },
  ];

  // Helper function to map paths to page titles
  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname === '/customers') return 'Clientes';
    if (location.pathname.startsWith('/customers/')) return 'Detalhes do Cliente';
    if (location.pathname === '/attendances') return 'Atendimentos';
    if (location.pathname.startsWith('/attendances/')) return 'Detalhes do Atendimento';
    if (location.pathname === '/tasks') return 'Follow-ups';
    if (location.pathname === '/quotes') return 'Orçamentos';
    if (location.pathname.startsWith('/quotes/')) return 'Detalhes do Orçamento';
    if (location.pathname === '/messages') return 'Mensagens';
    if (location.pathname.startsWith('/reports')) return 'Relatórios';
    return 'Cliente em Dia';
  };

  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border)]">
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Cliente em Dia</h1>
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (item as any).disabled ? (
                <div key={index} className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed">
                  <Icon className="mr-3 h-5 w-5 text-gray-300" />
                  {item.label} <span className="ml-auto text-[10px] bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Em breve</span>
                </div>
              ) : (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    item.active 
                      ? 'bg-[var(--color-primary)] text-white' 
                      : 'text-[var(--color-text-secondary)] hover:bg-gray-100 hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${item.active ? 'text-white' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-[var(--color-border)]">
          <button 
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-[var(--color-danger)] hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm">
          <div className="flex items-center">
            <button 
              className="mr-4 text-gray-500 hover:text-[var(--color-primary)] md:hidden focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] hidden sm:block">{getPageTitle()}</h2>
              <span className="hidden sm:inline-block mx-3 text-gray-300">|</span>
              <span className="text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">
                {activeCompany?.name}
              </span>
            </div>
          </div>
          
          <div className="flex items-center ml-auto">
            <div className="text-sm text-right mr-3 hidden sm:block">
              <p className="font-medium text-[var(--color-text-primary)] leading-tight">{user?.name}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{user?.email}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shadow-sm border border-[var(--color-primary-hover)]">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[var(--color-background)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
