import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskProvider, useTasks } from './contexts/TaskContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { AgendaView } from './components/agenda/AgendaView';
import { CalendarView } from './components/calendar/CalendarView';
import { TasksListView } from './components/tasks/TasksListView';
import { KanbanView } from './components/kanban/KanbanView';
import { CategoriesView } from './components/categories/CategoriesView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsCenterView } from './components/notifications/NotificationsCenterView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { TaskDetailsModal } from './components/tasks/TaskDetailsModal';
import { NotificationPreviewModal } from './components/notifications/NotificationPreviewModal';
import { ToastContainer } from './components/common/Toast';
import { OfflineIndicator } from './components/common/OfflineIndicator';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const { activeTab } = useTasks();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-300">Carregando Minha Rotina...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <ToastContainer />
        <OfflineIndicator />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'agenda' && <AgendaView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'tasks' && <TasksListView />}
          {activeTab === 'kanban' && <KanbanView />}
          {activeTab === 'categories' && <CategoriesView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'notifications_center' && <NotificationsCenterView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Interactive Global Modals */}
      <TaskFormModal />
      <TaskDetailsModal />
      <NotificationPreviewModal />
      <ToastContainer />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <MainAppContent />
      </TaskProvider>
    </AuthProvider>
  );
}
