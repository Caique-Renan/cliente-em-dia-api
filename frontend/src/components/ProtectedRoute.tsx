import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  type: 'public' | 'intermediate' | 'private';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, type }) => {
  const { activeCompany, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  const primaryToken = localStorage.getItem('@ClienteEmDia:primaryToken');
  const fullToken = localStorage.getItem('@ClienteEmDia:token');

  if (type === 'public') {
    if (fullToken && activeCompany) {
      return <Navigate to="/dashboard" replace />;
    }
    if (primaryToken) {
      return <Navigate to="/select-company" replace />;
    }
    return <>{children}</>;
  }

  if (type === 'intermediate') {
    if (fullToken && activeCompany) {
      return <Navigate to="/dashboard" replace />;
    }
    if (!primaryToken && !fullToken) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <>{children}</>;
  }

  // type === 'private'
  if (!fullToken || !activeCompany) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
