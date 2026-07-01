
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SelectCompany } from './pages/SelectCompany';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { CustomersList } from './pages/Customers/CustomersList';
import { CustomerDetail } from './pages/Customers/CustomerDetail';
import { AttendancesList } from './pages/Attendances/AttendancesList';
import { AttendanceDetail } from './pages/Attendances/AttendanceDetail';
import { TasksList } from './pages/Tasks/TasksList';
import { QuotesList } from './pages/Quotes/QuotesList';
import { QuoteDetail } from './pages/Quotes/QuoteDetail';
import { MessageTemplatesList } from './pages/Messages/MessageTemplatesList';
import { ReportsOverviewPage } from './pages/Reports/ReportsOverview';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <ProtectedRoute type="public">
              <Login />
            </ProtectedRoute>
          } />
          
          <Route path="/register" element={
            <ProtectedRoute type="public">
              <Register />
            </ProtectedRoute>
          } />

          {/* Intermediate Route */}
          <Route path="/select-company" element={
            <ProtectedRoute type="intermediate">
              <SelectCompany />
            </ProtectedRoute>
          } />

          {/* Private Routes with AppLayout */}
          <Route path="/" element={
            <ProtectedRoute type="private">
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="attendances" element={<AttendancesList />} />
            <Route path="attendances/:id" element={<AttendanceDetail />} />
            <Route path="tasks" element={<TasksList />} />
            <Route path="quotes" element={<QuotesList />} />
            <Route path="quotes/:id" element={<QuoteDetail />} />
            <Route path="messages" element={<MessageTemplatesList />} />
            <Route path="reports" element={<ReportsOverviewPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
