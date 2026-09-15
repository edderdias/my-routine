import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  PlusCircle,
  BarChart3,
  Tag,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Kanban
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import { ActiveTab } from '../../types';
import { AppBrandIcon } from '../common/AppBrandIcon';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { activeTab, setActiveTab, setIsTaskFormOpen, setEditingTask, tasks, logs } = useTasks();

  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'overdue').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const unreadLogs = logs.filter(l => l.status === 'sent').length;

  const menuItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'agenda',
      label: 'Minha Agenda',
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      id: 'tasks',
      label: 'Minhas Tarefas',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: pendingCount,
      badgeColor: overdueCount > 0 ? 'bg-rose-500' : 'bg-blue-600',
    },
    {
      id: 'kanban',
      label: 'Kanban',
      icon: <Kanban className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'categories',
      label: 'Categorias',
      icon: <Tag className="w-5 h-5" />,
    },
    {
      id: 'notifications_center',
      label: 'Lembretes & Logs',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadLogs > 0 ? unreadLogs : undefined,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleNewTaskClick = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 min-h-screen shrink-0 p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <AppBrandIcon size={38} showText />
      </div>

      {/* Quick Action Button */}
      <button
        onClick={handleNewTaskClick}
        id="sidebar-new-task-btn"
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-98 transition mb-5 cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Nova Tarefa</span>
      </button>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1">
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${
                    item.badgeColor || 'bg-blue-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* PWA Install Button Box */}
      <div className="my-4">
        <PWAInstallButton variant="sidebar" />
      </div>

      {/* User Info & Logout */}
      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'MR'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Usuário'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.email || ''}</div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sair da conta"
          id="sidebar-logout-btn"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
