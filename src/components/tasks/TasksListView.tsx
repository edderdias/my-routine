import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  Tag,
  Bell,
  Calendar,
  CheckSquare,
  User,
  Users2,
  Briefcase,
  CalendarClock,
  MapPin
} from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { Task, TaskType } from '../../types';
import { getPriorityLabel } from '../../services/notificationService';
import {
  DateFilterKey,
  StatusCounts,
  TaskFilters,
  computeStatusCounts,
  filterTasks,
  getTaskType,
} from '../../utils/taskStats';
import {
  PRIORITY_COLORS,
  PRIORITY_DOT,
  STATUS_COLORS,
  STATUS_LABELS,
  TASK_TYPE_COLORS,
  TASK_TYPE_LABELS,
  getCongregationalActivityLabel,
} from '../../utils/taskTypeVisuals';
import { DeferTaskModal } from './DeferTaskModal';

const SECTION_ICONS: Record<TaskType, React.ReactNode> = {
  personal: <User className="w-4 h-4" />,
  congregational: <Users2 className="w-4 h-4" />,
  professional: <Briefcase className="w-4 h-4" />,
};

function SummaryCard({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <div className={`text-xl sm:text-2xl font-extrabold mt-0.5 ${colorClass}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-sm font-extrabold text-slate-800">{value}</div>
      <div className="text-[9px] text-slate-500 font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}

export const TasksListView: React.FC = () => {
  const {
    tasks,
    categories,
    workTypes,
    toggleComplete,
    deferTask,
    setViewingTask,
    setIsTaskFormOpen,
    setEditingTask,
    triggerNotificationNow,
  } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({ type: 'all', priority: 'all', status: 'all', dateFilter: 'all' });
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [deferringTask, setDeferringTask] = useState<Task | null>(null);

  const effectiveFilters: TaskFilters = useMemo(() => ({
    ...filters,
    customRange: filters.dateFilter === 'custom' ? { from: customFrom, to: customTo } : undefined,
  }), [filters, customFrom, customTo]);

  const filteredTasks = useMemo(() => {
    let result = filterTasks(tasks, effectiveFilters);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [tasks, effectiveFilters, searchQuery]);

  const overallCounts: StatusCounts = useMemo(() => computeStatusCounts(filteredTasks), [filteredTasks]);

  const sections: Array<{ type: TaskType; tasks: Task[]; counts: StatusCounts }> = useMemo(() => {
    return (['personal', 'congregational', 'professional'] as TaskType[])
      .filter(t => filters.type === 'all' || filters.type === t)
      .map(type => {
        const typeTasks = filteredTasks.filter(t => getTaskType(t) === type);
        return { type, tasks: typeTasks, counts: computeStatusCounts(typeTasks) };
      });
  }, [filteredTasks, filters.type]);

  const handleNewTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const hasActiveFilters = !!searchQuery || filters.type !== 'all' || filters.priority !== 'all' || filters.status !== 'all' || filters.dateFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ type: 'all', priority: 'all', status: 'all', dateFilter: 'all' });
    setCustomFrom('');
    setCustomTo('');
  };

  const handleDeferConfirm = (newDate: string, newStartTime: string, reason?: string) => {
    if (deferringTask) {
      deferTask(deferringTask.id, newDate, newStartTime, reason);
      setDeferringTask(null);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 lg:pb-8 animate-in fade-in">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Minhas Tarefas
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Pessoais, congregacionais e profissionais em um só lugar
          </p>
        </div>

        <button
          onClick={handleNewTask}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <SummaryCard label="Total" value={overallCounts.total} colorClass="text-slate-900" />
        <SummaryCard label="Pendentes" value={overallCounts.pending} colorClass="text-blue-600" />
        <SummaryCard label="Em Execução" value={overallCounts.inProgress} colorClass="text-amber-600" />
        <SummaryCard label="Adiadas" value={overallCounts.deferred} colorClass="text-purple-600" />
        <SummaryCard label="Concluídas" value={overallCounts.completed} colorClass="text-emerald-600" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por título ou descrição..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Select Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              value={filters.type}
              onChange={e => setFilters(prev => ({ ...prev, type: e.target.value as TaskFilters['type'] }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todos os Tipos</option>
              <option value="personal">Pessoal</option>
              <option value="congregational">Congregacional</option>
              <option value="professional">Profissional</option>
            </select>

            <select
              value={filters.priority}
              onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value as TaskFilters['priority'] }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todas Prioridades</option>
              <option value="urgent">🔴 Urgente</option>
              <option value="high">🟠 Alta</option>
              <option value="normal">🔵 Normal</option>
              <option value="low">🟢 Baixa</option>
            </select>

            <select
              value={filters.status}
              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value as TaskFilters['status'] }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todos Status</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em execução</option>
              <option value="deferred">Adiado</option>
              <option value="completed">Concluído</option>
              <option value="overdue">Atrasado</option>
              <option value="canceled">Cancelado</option>
            </select>

            <select
              value={filters.dateFilter}
              onChange={e => setFilters(prev => ({ ...prev, dateFilter: e.target.value as DateFilterKey }))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Qualquer Data</option>
              <option value="today">Hoje</option>
              <option value="tomorrow">Amanhã</option>
              <option value="this_week">Esta Semana</option>
              <option value="next_week">Próxima Semana</option>
              <option value="this_month">Este Mês</option>
              <option value="custom">Período Personalizado</option>
            </select>
          </div>
        </div>

        {filters.dateFilter === 'custom' && (
          <div className="grid grid-cols-2 gap-2 max-w-sm animate-in fade-in">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">De</label>
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Até</label>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* Active counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>
            Exibindo <strong>{filteredTasks.length}</strong> de <strong>{tasks.length}</strong> tarefas
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Sections by Task Type */}
      {sections.every(s => s.tasks.length === 0) ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <CheckSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhuma tarefa encontrada</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não há atividades com os filtros selecionados. Altere os filtros ou crie uma nova tarefa.
          </p>
          <button
            onClick={handleNewTask}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cadastrar Nova Tarefa
          </button>
        </div>
      ) : (
        sections.map(section => section.tasks.length > 0 && (
          <div key={section.type} className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            {/* Section Header */}
            <div className={`p-4 sm:p-5 border-b border-slate-100 ${TASK_TYPE_COLORS[section.type].bg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className={`flex items-center gap-2 font-bold text-sm ${TASK_TYPE_COLORS[section.type].text}`}>
                  {SECTION_ICONS[section.type]}
                  <span>Minhas Tarefas {TASK_TYPE_LABELS[section.type]}</span>
                </div>
                <div className="flex items-center gap-4">
                  <MiniStat label="Total" value={section.counts.total} />
                  <MiniStat label="Pendentes" value={section.counts.pending} />
                  <MiniStat label="Execução" value={section.counts.inProgress} />
                  <MiniStat label="Adiadas" value={section.counts.deferred} />
                  <MiniStat label="Concluídas" value={section.counts.completed} />
                </div>
              </div>
            </div>

            {/* Section Task List */}
            <div className="p-3 sm:p-4 space-y-2.5">
              {section.tasks.map(task => {
                const cat = categories.find(c => c.id === task.categoryId);
                const displayStatus = task.status;
                const isDone = displayStatus === 'completed';
                const isOverdue = displayStatus === 'overdue';
                const workType = task.professional ? workTypes.find(w => w.id === task.professional?.workTypeId) : undefined;

                return (
                  <div
                    key={task.id}
                    className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                        : isOverdue
                        ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                        : 'bg-white border-slate-200/80 hover:border-blue-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleComplete(task.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer mt-0.5 sm:mt-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border-2 border-slate-300 hover:border-blue-500 bg-white'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div onClick={() => setViewingTask(task)} className="cursor-pointer min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-sm font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </span>

                          {task.taskType === 'congregational' && task.congregational && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 shrink-0">
                              {getCongregationalActivityLabel(task.congregational.activityType)}
                            </span>
                          )}

                          {task.taskType === 'professional' && workType && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                              {workType.name}
                            </span>
                          )}

                          {cat && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: cat.color }}
                            >
                              {cat.name}
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${PRIORITY_COLORS[task.priority].bg} ${PRIORITY_COLORS[task.priority].text}`}>
                            {PRIORITY_DOT[task.priority]} {getPriorityLabel(task.priority)}
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${STATUS_COLORS[displayStatus].bg} ${STATUS_COLORS[displayStatus].text}`}>
                            {STATUS_LABELS[displayStatus]}
                          </span>
                        </div>

                        {(task.congregational?.location || task.congregational?.visitedPerson) && (
                          <div className="flex items-center gap-2 text-[11px] text-indigo-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {task.congregational.location}
                              {task.congregational.visitedPerson ? ` • ${task.congregational.visitedPerson}` : ''}
                            </span>
                          </div>
                        )}

                        {task.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-1">{task.description}</p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span>{task.date.split('-').reverse().join('/')} às {task.startTime}</span>
                          </span>

                          {task.notification.channel !== 'none' && (
                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                              <Bell className="w-3 h-3" />
                              <span className="capitalize">{task.notification.channel}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 self-end sm:self-auto">
                      {!isDone && displayStatus !== 'canceled' && (
                        <button
                          type="button"
                          onClick={() => setDeferringTask(task)}
                          title="Adiar tarefa"
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition cursor-pointer"
                        >
                          <CalendarClock className="w-4 h-4" />
                        </button>
                      )}

                      {task.notification.channel !== 'none' && (
                        <button
                          type="button"
                          onClick={() => triggerNotificationNow(task.id)}
                          title="Testar envio do lembrete"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => { setEditingTask(task); setIsTaskFormOpen(true); }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewingTask(task)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <DeferTaskModal
        isOpen={!!deferringTask}
        currentDate={deferringTask?.date || ''}
        currentStartTime={deferringTask?.startTime || ''}
        onConfirm={handleDeferConfirm}
        onCancel={() => setDeferringTask(null)}
      />
    </div>
  );
};
