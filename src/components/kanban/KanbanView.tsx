import React, { useMemo, useState } from 'react';
import { Bell, Calendar, MapPin, User } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { Status, Task } from '../../types';
import { getPriorityLabel } from '../../services/notificationService';
import { DateFilterKey, TaskFilters, filterTasks, getDisplayStatus } from '../../utils/taskStats';
import {
  PRIORITY_COLORS,
  PRIORITY_DOT,
  TASK_TYPE_COLORS,
  TASK_TYPE_LABELS,
  getCongregationalActivityLabel,
} from '../../utils/taskTypeVisuals';
import { DeferTaskModal } from '../tasks/DeferTaskModal';

const COLUMNS: Array<{ status: Status; label: string; accent: string }> = [
  { status: 'pending', label: 'Pendente', accent: 'border-t-blue-500' },
  { status: 'in_progress', label: 'Em Execução', accent: 'border-t-amber-500' },
  { status: 'deferred', label: 'Adiado', accent: 'border-t-purple-500' },
  { status: 'completed', label: 'Concluído', accent: 'border-t-emerald-500' },
];

export const KanbanView: React.FC = () => {
  const { tasks, categories, workTypes, updateTask, deferTask, setViewingTask } = useTasks();

  const [filters, setFilters] = useState<TaskFilters>({ type: 'all', priority: 'all', status: 'all', dateFilter: 'all' });
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);
  const [deferringTask, setDeferringTask] = useState<Task | null>(null);

  // Kanban only cares about type/priority/date filters - status is dictated by the column itself
  const visibleTasks = useMemo(() => {
    const kanbanFilters: TaskFilters = { ...filters, status: 'all' };
    return filterTasks(tasks.filter(t => getDisplayStatus(t) !== 'canceled'), kanbanFilters);
  }, [tasks, filters]);

  const columnTasks = useMemo(() => {
    const grouped: Record<Status, Task[]> = { pending: [], in_progress: [], deferred: [], completed: [], canceled: [], overdue: [] };
    for (const task of visibleTasks) {
      const status = getDisplayStatus(task);
      // Overdue tasks stay visible in their real column (pending/in_progress/deferred) with a badge
      const columnKey: Status = status === 'overdue' ? task.status : status;
      if (grouped[columnKey]) {
        grouped[columnKey].push(task);
      }
    }
    for (const key of Object.keys(grouped) as Status[]) {
      grouped[key].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    }
    return grouped;
  }, [visibleTasks]);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDrop = (targetStatus: Status) => {
    setDragOverColumn(null);
    if (!draggedTaskId) return;
    const task = tasks.find(t => t.id === draggedTaskId);
    setDraggedTaskId(null);
    if (!task) return;

    if (task.status === targetStatus) return;

    if (targetStatus === 'deferred') {
      setDeferringTask(task);
      return;
    }

    updateTask(task.id, { status: targetStatus });
  };

  const handleDeferConfirm = (newDate: string, newStartTime: string, reason?: string) => {
    if (deferringTask) {
      deferTask(deferringTask.id, newDate, newStartTime, reason);
      setDeferringTask(null);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 lg:pb-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Kanban</h1>
        <p className="text-xs text-slate-500 font-medium">
          Arraste os cartões entre as colunas para atualizar o status das suas tarefas
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
            value={filters.dateFilter}
            onChange={e => setFilters(prev => ({ ...prev, dateFilter: e.target.value as DateFilterKey }))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Todas as Datas</option>
            <option value="today">Hoje</option>
            <option value="tomorrow">Amanhã</option>
            <option value="this_week">Esta Semana</option>
            <option value="next_week">Próxima Semana</option>
          </select>
        </div>
      </div>

      {/* Kanban Board - horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-4 min-w-[820px] sm:min-w-0 sm:grid sm:grid-cols-4">
          {COLUMNS.map(col => (
            <div
              key={col.status}
              onDragOver={e => { e.preventDefault(); setDragOverColumn(col.status); }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={() => handleDrop(col.status)}
              className={`flex-1 min-w-[260px] bg-slate-50 rounded-2xl border-t-4 ${col.accent} border-x border-b border-slate-200/70 flex flex-col transition ${
                dragOverColumn === col.status ? 'ring-2 ring-blue-400 bg-blue-50/40' : ''
              }`}
            >
              <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60">
                <h3 className="text-xs font-bold text-slate-800">{col.label}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                  {columnTasks[col.status].length}
                </span>
              </div>

              <div className="p-2.5 space-y-2.5 flex-1 min-h-[120px] max-h-[70vh] overflow-y-auto">
                {columnTasks[col.status].map(task => {
                  const cat = categories.find(c => c.id === task.categoryId);
                  const isOverdue = getDisplayStatus(task) === 'overdue';
                  const type = task.taskType || 'personal';
                  const workType = task.professional ? workTypes.find(w => w.id === task.professional?.workTypeId) : undefined;
                  const relatedPerson = task.congregational?.visitedPerson || task.congregational?.personName;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onClick={() => setViewingTask(task)}
                      className={`bg-white rounded-xl p-3 border shadow-xs cursor-grab active:cursor-grabbing hover:shadow-md transition space-y-1.5 ${
                        isOverdue ? 'border-rose-200' : 'border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${TASK_TYPE_COLORS[type].bg} ${TASK_TYPE_COLORS[type].text}`}>
                          {TASK_TYPE_LABELS[type]}
                        </span>
                        {task.congregational && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700">
                            {getCongregationalActivityLabel(task.congregational.activityType)}
                          </span>
                        )}
                        {workType && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                            {workType.name}
                          </span>
                        )}
                        {isOverdue && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700">
                            Atrasada
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-slate-900 leading-snug">{task.title}</div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <Calendar className="w-3 h-3 text-blue-500" />
                          {task.date.split('-').reverse().join('/')} {task.startTime}
                        </span>
                        {task.notification.channel !== 'none' && <Bell className="w-3 h-3 text-blue-500" />}
                      </div>

                      {relatedPerson && (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-600">
                          <User className="w-3 h-3" />
                          <span>{relatedPerson}</span>
                        </div>
                      )}

                      {task.congregational?.location && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>{task.congregational.location}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        {cat && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: cat.color }}>
                            {cat.name}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold ${PRIORITY_COLORS[task.priority].text}`}>
                          {PRIORITY_DOT[task.priority]} {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {columnTasks[col.status].length === 0 && (
                  <div className="text-center py-8 text-[11px] text-slate-400">
                    Nenhuma tarefa nesta coluna
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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
