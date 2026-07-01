import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Company {
  id: string;
  name: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  companies: Company[];
  activeCompany: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  selectCompany: (companyId: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('@ClienteEmDia:token');
      const primaryToken = localStorage.getItem('@ClienteEmDia:primaryToken');

      if (token) {
        // We have a full token, try to fetch /me
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        setActiveCompany(response.data.activeCompany);
        
        // Also restore companies from local storage just to have them available
        const storedCompanies = localStorage.getItem('@ClienteEmDia:companies');
        if (storedCompanies) setCompanies(JSON.parse(storedCompanies));
      } else if (primaryToken) {
        // We only have a primary token, we must select a company
        const storedCompanies = localStorage.getItem('@ClienteEmDia:companies');
        if (storedCompanies) setCompanies(JSON.parse(storedCompanies));
        
        const currentPath = window.location.pathname;
        if (currentPath !== '/select-company') {
          navigate('/select-company');
        }
      } else {
        // No tokens
        setUser(null);
        setActiveCompany(null);
      }
    } catch (error) {
      // Interceptor handles 401 and 403
    } finally {
      setIsLoading(false);
    }
  };

  const clearSessionData = () => {
    localStorage.removeItem('@ClienteEmDia:token');
    localStorage.removeItem('@ClienteEmDia:primaryToken');
    localStorage.removeItem('@ClienteEmDia:user');
    localStorage.removeItem('@ClienteEmDia:activeCompany');
    localStorage.removeItem('@ClienteEmDia:companies');
    setUser(null);
    setActiveCompany(null);
    setCompanies([]);
  };

  const login = async (data: any) => {
    clearSessionData();
    const response = await api.post('/auth/login', data);
    const { user: userData, companies: userCompanies, token: primaryToken } = response.data;

    setUser(userData);
    setCompanies(userCompanies);
    localStorage.setItem('@ClienteEmDia:primaryToken', primaryToken);
    localStorage.setItem('@ClienteEmDia:companies', JSON.stringify(userCompanies));
    localStorage.setItem('@ClienteEmDia:user', JSON.stringify(userData));

    if (userCompanies.length === 1) {
      await autoSelectCompany(userCompanies[0].id, primaryToken);
    } else {
      navigate('/select-company');
    }
  };

  const register = async (data: any) => {
    clearSessionData();
    const response = await api.post('/auth/register', data);
    const { user: userData, companies: userCompanies, token: primaryToken } = response.data;

    setUser(userData);
    setCompanies(userCompanies);
    localStorage.setItem('@ClienteEmDia:primaryToken', primaryToken);
    localStorage.setItem('@ClienteEmDia:companies', JSON.stringify(userCompanies));
    localStorage.setItem('@ClienteEmDia:user', JSON.stringify(userData));

    if (userCompanies.length === 1) {
      await autoSelectCompany(userCompanies[0].id, primaryToken);
    } else {
      navigate('/select-company');
    }
  };

  const autoSelectCompany = async (companyId: string, primaryToken: string) => {
    const response = await api.post('/auth/select-company', { companyId }, {
      headers: { Authorization: `Bearer ${primaryToken}` }
    });
    const { activeCompany: selectedCompany, token: fullToken } = response.data;

    setActiveCompany(selectedCompany);
    localStorage.setItem('@ClienteEmDia:token', fullToken);
    localStorage.setItem('@ClienteEmDia:activeCompany', JSON.stringify(selectedCompany));
    // Remove primary token as we now have the full token
    localStorage.removeItem('@ClienteEmDia:primaryToken');
    
    navigate('/dashboard');
  };

  const selectCompany = async (companyId: string) => {
    const primaryToken = localStorage.getItem('@ClienteEmDia:primaryToken');
    if (!primaryToken) throw new Error('Primary token not found');

    const response = await api.post('/auth/select-company', { companyId }, {
      headers: { Authorization: `Bearer ${primaryToken}` }
    });
    
    const { activeCompany: selectedCompany, token: fullToken } = response.data;
    
    setActiveCompany(selectedCompany);
    localStorage.setItem('@ClienteEmDia:token', fullToken);
    localStorage.setItem('@ClienteEmDia:activeCompany', JSON.stringify(selectedCompany));
    localStorage.removeItem('@ClienteEmDia:primaryToken');

    navigate('/dashboard');
  };

  const logout = () => {
    clearSessionData();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      companies,
      activeCompany,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      selectCompany,
      logout,
      restoreSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
