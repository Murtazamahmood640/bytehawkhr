import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

import SetupPage        from '../pages/auth/SetupPage.jsx';
import LoginPage        from '../pages/auth/LoginPage.jsx';
import DashboardPage    from '../pages/dashboard/DashboardPage.jsx';
import EmployeeListPage from '../pages/employees/EmployeeListPage.jsx';
import EmployeeDetailPage from '../pages/employees/EmployeeDetailPage.jsx';
import AttendancePage   from '../pages/attendance/AttendancePage.jsx';
import LeavePage        from '../pages/leaves/LeavePage.jsx';
import ProjectsPage     from '../pages/projects/ProjectsPage.jsx';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage.jsx';
import TasksPage        from '../pages/tasks/TasksPage.jsx';
import TicketsPage      from '../pages/tickets/TicketsPage.jsx';
import AnalyticsPage    from '../pages/analytics/AnalyticsPage.jsx';
import DepartmentPage   from '../pages/departments/DepartmentPage.jsx';
import DesktopSettings  from '../pages/settings/DesktopSettings.jsx';

export default function AppRouter() {
  const { user, loading, isSetupDone } = useAuth();

  if (loading || isSetupDone === null) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm">Loading ByThawkHR...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/setup" element={<Navigate to="/login" />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/employees"  element={<ProtectedRoute roles={['super_admin','manager']}><EmployeeListPage /></ProtectedRoute>} />
        <Route path="/employees/:id" element={<ProtectedRoute roles={['super_admin','manager']}><EmployeeDetailPage /></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute roles={['super_admin','manager']}><DepartmentPage /></ProtectedRoute>} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leaves"     element={<LeavePage />} />
        <Route path="/projects"   element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/tasks"      element={<TasksPage />} />
        <Route path="/tickets"    element={<TicketsPage />} />
        <Route path="/analytics"  element={<ProtectedRoute roles={['super_admin','manager']}><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings/desktop" element={<DesktopSettings />} />
      </Route>

      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
