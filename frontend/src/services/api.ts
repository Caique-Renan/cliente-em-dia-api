import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

const publicRoutes = ['/auth/login', '/auth/register', '/health'];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@ClienteEmDia:token') || localStorage.getItem('@ClienteEmDia:primaryToken');
  
  // Verify if the url is a public route
  const isPublicRoute = config.url && publicRoutes.some(route => config.url?.includes(route));

  if (token && config.headers && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const isLoginRoute = error.config?.url?.includes('/auth/login');
      
      if (status === 401 && !isLoginRoute) {
        localStorage.removeItem('@ClienteEmDia:token');
        localStorage.removeItem('@ClienteEmDia:primaryToken');
        localStorage.removeItem('@ClienteEmDia:user');
        localStorage.removeItem('@ClienteEmDia:activeCompany');
        localStorage.removeItem('@ClienteEmDia:companies');
        
        // Only redirect if not already on login or register to avoid loops
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      } 
      else if (status === 403) {
        if (data?.message === 'Active company required') {
          if (window.location.pathname !== '/select-company') {
             window.location.href = '/select-company';
          }
        } else {
          // Blocked, inactive, or unauthorized - let the component handle the message
          console.error('Forbidden access:', data.message);
        }
      }
      // 400 and 500 will be caught by the catch blocks in the components
    }
    return Promise.reject(error);
  }
);
