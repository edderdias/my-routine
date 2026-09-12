import React from 'react';
import { Bell, Calendar, Plus, Menu, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import { AppBrandIcon } from '../common/AppBrandIcon';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const Navbar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const { setIsTaskFormOpen, setEditingTask, setActiveTab, logs } = useTasks();

  const handleNewTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const sentLogsCount = logs.filter(l => l.status === 'sent').length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 select-none">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Brand or Greeting */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden flex items-center gap-2">
            <AppBrandIcon size={34} />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900 leading-tight">
                Minha <span className="text-blue-600">Rotina</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {capitalizedDate}
              </span>
            </div>
          </div>

          <div className="hidden lg:flex flex-col">
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">
              {getGreeting()}, <span className="text-blue-600">{firstName}!</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{capitalizedDate}</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button on top */}
          <div className="hidden sm:block">
            <PWAInstallButton variant="compact" />
          </div>

          {/* Notifications Log Center */}
          <button
            onClick={() => setActiveTab('notifications_center')}
            title="Lembretes e Notificações"
            id="navbar-notif-btn"
            className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {sentLogsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* New Task Button (Header) */}
          <button
            onClick={handleNewTask}
            id="navbar-new-task-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Tarefa</span>
            <span className="sm:hidden">Nova</span>
          </button>

          {/* User profile avatar thumbnail */}
          <button
            onClick={() => setActiveTab('settings')}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs hover:ring-2 hover:ring-blue-300 transition cursor-pointer"
            title="Configurações e Perfil"
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'MR'}
          </button>
        </div>
      </div>
    </header>
  );
};
