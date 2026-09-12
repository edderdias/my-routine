import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Bell,
  CheckSquare,
  BarChart3,
  CalendarDays,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import { Priority, Status, Task } from '../../types';
import { getLeadTimeLabel, getPriorityLabel } from '../../services/notificationService';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const {
    tasks,
    categories,
    todayMetrics,
    toggleComplete,
    setViewingTask,
    setIsTaskFormOpen,
    setEditingTask,
    setActiveTab,
    triggerNotificationNow,
  } = useTasks();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  // Filter tasks for today
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.date === todayStr);

  const displayedTasks = todayTasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending' || t.status === 'overdue' || t.status === 'in_progress';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Progress percentage
  const progressPercent = todayMetrics.total > 0
    ? Math.round((todayMetrics.completed / todayMetrics.total) * 100)
    : 0;

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 lg:pb-8 animate-in fade-in">
      {/* 1. Welcome & Headline Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 sm:p-8 shadow-xl shadow-blue-700/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Agenda Pessoal Inteligente</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {firstName}!
            </h1>

            <p className="text-sm sm:text-base text-blue-100 font-medium">
              {todayMetrics.total === 0 ? (
                'Você não tem nenhuma tarefa agendada para hoje. Que tal planejar seu dia?'
              ) : todayMetrics.pending === 0 ? (
                'Parabéns! Todas as tarefas de hoje já foram concluídas! 🎉'
              ) : (
                `Você tem ${todayMetrics.total} tarefa${todayMetrics.total > 1 ? 's' : ''} para hoje, sendo ${todayMetrics.pending} pendente${todayMetrics.pending > 1 ? 's' : ''}.`
              )}
            </p>

            {/* Progress bar */}
            {todayMetrics.total > 0 && (
              <div className="pt-2 space-y-1.5 max-w-md">
                <div className="flex items-center justify-between text-xs text-blue-100 font-semibold">
                  <span>Progresso do dia</span>
                  <span>{progressPercent}% concluído</span>
                </div>
                <div className="w-full h-2.5 bg-blue-950/40 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
                  <div
                    className="h-full bg-gradient-to-r from-teal-300 to-emerald-300 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleCreateTask}
              id="dashboard-new-task-btn"
              className="px-5 py-3 rounded-2xl bg-white text-blue-700 text-xs font-bold shadow-lg shadow-black/10 hover:bg-blue-50 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Cadastrar Tarefa</span>
            </button>

            <button
              onClick={() => setActiveTab('agenda')}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Ver Minha Agenda</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Próximo Compromisso em Destaque */}
      {todayMetrics.nextTask && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100 shadow-sm shadow-blue-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    Próximo Compromisso de Hoje
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {todayMetrics.nextTask.startTime}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {todayMetrics.nextTask.title}
                </h3>
                {todayMetrics.nextTask.description && (
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {todayMetrics.nextTask.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center">
              <button
                type="button"
                onClick={() => toggleComplete(todayMetrics.nextTask!.id)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Concluir</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingTask(todayMetrics.nextTask)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Detalhes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Métricas do Dia Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Hoje</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {todayMetrics.total}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Pendentes */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Pendentes</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
              {todayMetrics.pending}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Concluídas */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Concluídas</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {todayMetrics.completed}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Atrasadas */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Atrasadas</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
              {todayMetrics.overdue}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Lista de Tarefas de Hoje */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Rotina de Hoje ({todayTasks.length})
            </h2>
            <p className="text-xs text-slate-500">Acompanhe e marque suas atividades programadas</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({todayTasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'pending' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes ({todayMetrics.pending + todayMetrics.overdue})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'completed' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Concluídas ({todayMetrics.completed})
            </button>
          </div>
        </div>

        {/* Task Items */}
        {displayedTasks.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Nenhuma tarefa encontrada neste filtro para hoje.
            </p>
            <button
              onClick={handleCreateTask}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
            >
              Criar nova tarefa para hoje
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedTasks.map(task => {
              const cat = categories.find(c => c.id === task.categoryId);
              const isDone = task.status === 'completed';
              const isOverdue = task.status === 'overdue';

              return (
                <div
                  key={task.id}
                  className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                      : isOverdue
                      ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                      : 'bg-white border-slate-200/80 hover:border-blue-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Fast checkbox toggle */}
                    <button
                      type="button"
                      onClick={() => toggleComplete(task.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'border-2 border-slate-300 hover:border-blue-500 bg-white'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </button>

                    {/* Time badge */}
                    <div className="hidden sm:flex flex-col items-center justify-center px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
                      <span>{task.startTime}</span>
                      {task.endTime && (
                        <span className="text-[10px] text-slate-400 font-normal">{task.endTime}</span>
                      )}
                    </div>

                    {/* Task Title & Details */}
                    <div
                      onClick={() => setViewingTask(task)}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>

                        {cat && (
                          <span
                            className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: cat.color }}
                          >
                            {cat.name}
                          </span>
                        )}

                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 shrink-0">
                            Atrasada
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        <span className="sm:hidden font-semibold text-slate-700">
                          {task.startTime}
                        </span>
                        {task.notification.channel !== 'none' && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Bell className="w-3 h-3" />
                            <span className="capitalize">{task.notification.channel}</span>
                          </span>
                        )}
                        {task.recurrence.rule !== 'none' && (
                          <span className="text-purple-600 font-medium">Recorrente</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick notification test / action */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {task.notification.channel !== 'none' && (
                      <button
                        type="button"
                        onClick={() => triggerNotificationNow(task.id)}
                        title="Simular disparo de lembrete agora"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setViewingTask(task)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Shortcuts & Integrations Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WhatsApp Notification Setup Banner */}
        <div
          onClick={() => setActiveTab('settings')}
          className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/80 shadow-xs cursor-pointer hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Integração WhatsApp</h3>
          <p className="text-xs text-slate-600 mt-1">
            Receba lembretes automáticos pontuais direto no seu celular.
          </p>
        </div>

        {/* Minha Agenda Calendar View */}
        <div
          onClick={() => setActiveTab('agenda')}
          className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 shadow-xs cursor-pointer hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Linha do Tempo / Agenda</h3>
          <p className="text-xs text-slate-600 mt-1">
            Visualização cronológica hora a hora dos seus compromissos.
          </p>
        </div>

        {/* Productivity Analytics */}
        <div
          onClick={() => setActiveTab('reports')}
          className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100/80 shadow-xs cursor-pointer hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Relatórios & Histórico</h3>
          <p className="text-xs text-slate-600 mt-1">
            Métricas de pontualidade, conclusão semanal e logs de avisos.
          </p>
        </div>
      </div>
    </div>
  );
};
