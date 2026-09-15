import React, { useMemo, useState } from 'react';
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
  User,
  Users2,
  Briefcase,
  PauseCircle,
  ListChecks
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import { Task, TaskType } from '../../types';
import { getPriorityLabel } from '../../services/notificationService';
import { computeDashboardStats, getDisplayStatus, StatusCounts } from '../../utils/taskStats';
import {
  PRIORITY_COLORS,
  PRIORITY_DOT,
  STATUS_COLORS,
  STATUS_LABELS,
  TASK_TYPE_COLORS,
  TASK_TYPE_LABELS,
  getCongregationalActivityLabel,
} from '../../utils/taskTypeVisuals';

const TYPE_ICONS: Record<TaskType, React.ReactNode> = {
  personal: <User className="w-4 h-4" />,
  congregational: <Users2 className="w-4 h-4" />,
  professional: <Briefcase className="w-4 h-4" />,
};

function OverallCard({ icon, label, value, colorClass, bgClass }: { icon: React.ReactNode; label: string; value: number; colorClass: string; bgClass: string }) {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between">
      <div>
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${colorClass}`}>{value}</div>
      </div>
      <div className={`w-11 h-11 rounded-2xl ${bgClass} ${colorClass} flex items-center justify-center font-bold`}>
        {icon}
      </div>
    </div>
  );
}

function TypeSummaryCard({ type, counts, onClick }: { type: TaskType; counts: StatusCounts; onClick: () => void }) {
  const colors = TASK_TYPE_COLORS[type];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white rounded-3xl p-4 sm:p-5 border ${colors.border} shadow-xs hover:shadow-md transition cursor-pointer`}
    >
      <div className={`flex items-center gap-2 font-bold text-sm mb-3 ${colors.text}`}>
        <span className={`p-1.5 rounded-lg ${colors.bg}`}>{TYPE_ICONS[type]}</span>
        <span>{TASK_TYPE_LABELS[type]}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-base font-extrabold text-slate-900">{counts.total}</div>
          <div className="text-[9px] text-slate-500 font-medium uppercase">Total</div>
        </div>
        <div>
          <div className="text-base font-extrabold text-blue-600">{counts.pending}</div>
          <div className="text-[9px] text-slate-500 font-medium uppercase">Pend.</div>
        </div>
        <div>
          <div className="text-base font-extrabold text-amber-600">{counts.inProgress}</div>
          <div className="text-[9px] text-slate-500 font-medium uppercase">Execução</div>
        </div>
        <div>
          <div className="text-base font-extrabold text-emerald-600">{counts.completed}</div>
          <div className="text-[9px] text-slate-500 font-medium uppercase">Concl.</div>
        </div>
      </div>
    </button>
  );
}

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const {
    tasks,
    categories,
    workTypes,
    toggleComplete,
    setViewingTask,
    setIsTaskFormOpen,
    setEditingTask,
    setActiveTab,
    triggerNotificationNow,
  } = useTasks();

  const [todayFilter, setTodayFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const stats = useMemo(() => computeDashboardStats(tasks), [tasks]);

  const displayedTodayTasks = stats.today.filter(t => {
    const status = getDisplayStatus(t);
    if (todayFilter === 'pending') return status === 'pending' || status === 'overdue' || status === 'in_progress' || status === 'deferred';
    if (todayFilter === 'completed') return status === 'completed';
    return true;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  const progressPercent = stats.overall.total > 0
    ? Math.round((stats.overall.completed / stats.overall.total) * 100)
    : 0;

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const renderTaskRow = (task: Task) => {
    const cat = categories.find(c => c.id === task.categoryId);
    const status = getDisplayStatus(task);
    const isDone = status === 'completed';
    const isOverdue = status === 'overdue';
    const type = task.taskType || 'personal';
    const workType = task.professional ? workTypes.find(w => w.id === task.professional?.workTypeId) : undefined;

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

          <div className="hidden sm:flex flex-col items-center justify-center px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
            <span>{task.date.split('-').reverse().join('/')}</span>
            <span className="text-[10px] text-slate-400 font-normal">{task.startTime}</span>
          </div>

          <div onClick={() => setViewingTask(task)} className="min-w-0 flex-1 cursor-pointer">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs sm:text-sm font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {task.title}
              </span>

              <span className={`hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${TASK_TYPE_COLORS[type].bg} ${TASK_TYPE_COLORS[type].text}`}>
                {TASK_TYPE_LABELS[type]}
                {task.congregational ? ` · ${getCongregationalActivityLabel(task.congregational.activityType)}` : ''}
                {workType ? ` · ${workType.name}` : ''}
              </span>

              {cat && (
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: cat.color }}>
                  {cat.name}
                </span>
              )}

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${PRIORITY_COLORS[task.priority].bg} ${PRIORITY_COLORS[task.priority].text}`}>
                {PRIORITY_DOT[task.priority]} {getPriorityLabel(task.priority)}
              </span>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
              <span className="sm:hidden font-semibold text-slate-700">
                {task.date.split('-').reverse().join('/')} {task.startTime}
              </span>
              {task.notification.channel !== 'none' && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Bell className="w-3 h-3" />
                  <span className="capitalize">{task.notification.channel}</span>
                </span>
              )}
            </div>
          </div>
        </div>

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
              {stats.overall.total === 0 ? (
                'Você ainda não tem nenhuma tarefa cadastrada. Que tal planejar sua rotina?'
              ) : (
                `Você tem ${stats.overall.total} tarefa${stats.overall.total > 1 ? 's' : ''} no total, sendo ${stats.overall.pending + stats.overall.inProgress + stats.overall.deferred} ativa${(stats.overall.pending + stats.overall.inProgress + stats.overall.deferred) > 1 ? 's' : ''}.`
              )}
            </p>

            {stats.overall.total > 0 && (
              <div className="pt-2 space-y-1.5 max-w-md">
                <div className="flex items-center justify-between text-xs text-blue-100 font-semibold">
                  <span>Progresso geral</span>
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

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Resumo Geral */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3">Resumo Geral</h2>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <OverallCard icon={<ListChecks className="w-5 h-5" />} label="Total" value={stats.overall.total} colorClass="text-slate-900" bgClass="bg-slate-100" />
          <OverallCard icon={<Clock className="w-5 h-5" />} label="Pendentes" value={stats.overall.pending} colorClass="text-blue-600" bgClass="bg-blue-50" />
          <OverallCard icon={<CheckSquare className="w-5 h-5" />} label="Em Execução" value={stats.overall.inProgress} colorClass="text-amber-600" bgClass="bg-amber-50" />
          <OverallCard icon={<PauseCircle className="w-5 h-5" />} label="Adiadas" value={stats.overall.deferred} colorClass="text-purple-600" bgClass="bg-purple-50" />
          <OverallCard icon={<CheckCircle2 className="w-5 h-5" />} label="Concluídas" value={stats.overall.completed} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
          <OverallCard icon={<AlertTriangle className="w-5 h-5" />} label="Atrasadas" value={stats.overall.overdue} colorClass="text-rose-600" bgClass="bg-rose-50" />
        </div>
      </div>

      {/* 3. Resumo por Tipo */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3">Resumo por Tipo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <TypeSummaryCard type="personal" counts={stats.byType.personal} onClick={() => setActiveTab('tasks')} />
          <TypeSummaryCard type="congregational" counts={stats.byType.congregational} onClick={() => setActiveTab('tasks')} />
          <TypeSummaryCard type="professional" counts={stats.byType.professional} onClick={() => setActiveTab('tasks')} />
        </div>
      </div>

      {/* 4. Tarefas Atrasadas */}
      {stats.overdueList.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-rose-700">Tarefas Atrasadas ({stats.overdueList.length})</h2>
          </div>
          <div className="space-y-2.5">
            {stats.overdueList.slice(0, 5).map(renderTaskRow)}
          </div>
        </div>
      )}

      {/* 5. Próximas Tarefas */}
      {stats.upcoming.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Próximas Tarefas</h2>
            <button onClick={() => setActiveTab('tasks')} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
              Ver todas
            </button>
          </div>
          <div className="space-y-2.5">
            {stats.upcoming.map(renderTaskRow)}
          </div>
        </div>
      )}

      {/* 6. Lista de Tarefas de Hoje */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Tarefas de Hoje ({stats.today.length})
            </h2>
            <p className="text-xs text-slate-500">Acompanhe e marque suas atividades programadas</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTodayFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                todayFilter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({stats.today.length})
            </button>
            <button
              onClick={() => setTodayFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                todayFilter === 'pending' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setTodayFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                todayFilter === 'completed' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Concluídas
            </button>
          </div>
        </div>

        {displayedTodayTasks.length === 0 ? (
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
            {displayedTodayTasks.map(renderTaskRow)}
          </div>
        )}
      </div>

      {/* 7. Shortcuts & Integrations Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div
          onClick={() => setActiveTab('kanban')}
          className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 shadow-xs cursor-pointer hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Quadro Kanban</h3>
          <p className="text-xs text-slate-600 mt-1">
            Arraste e solte suas tarefas entre pendente, execução e concluído.
          </p>
        </div>

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
