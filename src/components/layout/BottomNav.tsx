import React from 'react';
import { LayoutDashboard, CalendarDays, Plus, CheckSquare, Settings, Kanban } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { ActiveTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsTaskFormOpen, setEditingTask, tasks } = useTasks();

  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'overdue').length;

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-1 py-1.5 pb-safe select-none shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] mt-1">Início</span>
        </button>

        {/* Agenda */}
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'agenda' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[9px] mt-1">Agenda</span>
        </button>

        {/* Floating Center (+) Button */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            onClick={handleCreateTask}
            id="bottom-nav-plus-btn"
            title="Nova Tarefa"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/35 hover:scale-105 active:scale-95 transition cursor-pointer border-4 border-white"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Minhas Tarefas */}
        <button
          onClick={() => setActiveTab('tasks')}
          className={`relative flex flex-col items-center justify-center w-12 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'tasks' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[9px] mt-1">Tarefas</span>
          {pendingCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

        {/* Kanban */}
        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'kanban' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Kanban className="w-5 h-5" />
          <span className="text-[9px] mt-1">Kanban</span>
        </button>

        {/* Configurações */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'settings' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] mt-1">Ajustes</span>
        </button>
      </div>
    </div>
  );
};
