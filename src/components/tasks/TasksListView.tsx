import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Tag,
  ArrowUpDown,
  Bell,
  Trash2,
  Calendar,
  MoreVertical,
  CheckSquare
} from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { Priority, Status, Task } from '../../types';
import { getPriorityLabel } from '../../services/notificationService';

export const TasksListView: React.FC = () => {
  const {
    tasks,
    categories,
    toggleComplete,
    deleteTask,
    setViewingTask,
    setIsTaskFormOpen,
    setEditingTask,
    triggerNotificationNow,
  } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'priority' | 'title'>('date_asc');

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = (task.description || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc) return false;
        }

        // Status
        if (statusFilter !== 'all') {
          if (statusFilter === 'pending') {
            if (task.status !== 'pending' && task.status !== 'in_progress') return false;
          } else if (task.status !== statusFilter) {
            return false;
          }
        }

        // Priority
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }

        // Category
        if (categoryFilter !== 'all' && task.categoryId !== categoryFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_asc') {
          const diff = a.date.localeCompare(b.date);
          return diff !== 0 ? diff : a.startTime.localeCompare(b.startTime);
        }
        if (sortBy === 'date_desc') {
          const diff = b.date.localeCompare(a.date);
          return diff !== 0 ? diff : b.startTime.localeCompare(a.startTime);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'priority') {
          const weight: Record<Priority, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const handleNewTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 lg:pb-8 animate-in fade-in">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Gerenciamento de Tarefas
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Visualize, filtre e gerencie todas as suas atividades cadastradas
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
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todos Status</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídas</option>
              <option value="overdue">Atrasadas</option>
              <option value="canceled">Canceladas</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todas Prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="normal">Normal</option>
              <option value="low">Baixa</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todas Categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="date_asc">Data (Mais antiga)</option>
              <option value="date_desc">Data (Mais recente)</option>
              <option value="priority">Prioridade (Maior)</option>
              <option value="title">Ordem Alfabética</option>
            </select>
          </div>
        </div>

        {/* Active counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>
            Exibindo <strong>{filteredTasks.length}</strong> de <strong>{tasks.length}</strong> tarefas
          </span>
          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
              }}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Task List Items */}
      {filteredTasks.length === 0 ? (
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
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const cat = categories.find(c => c.id === task.categoryId);
            const isDone = task.status === 'completed';
            const isOverdue = task.status === 'overdue';

            return (
              <div
                key={task.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-3xl border transition-all ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                    : isOverdue
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                    : 'bg-white border-slate-200/80 hover:border-blue-300 shadow-xs'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {/* Checkbox */}
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

                  {/* Body click to view details */}
                  <div
                    onClick={() => setViewingTask(task)}
                    className="cursor-pointer min-w-0 flex-1"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold truncate ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </span>

                      {cat && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.name}
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          task.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : task.priority === 'low'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>

                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 shrink-0">
                          Atrasada
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                        {task.description}
                      </p>
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

                {/* Right actions */}
                <div className="flex items-center gap-1.5 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 self-end sm:self-auto">
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
                    onClick={() => {
                      setEditingTask(task);
                      setIsTaskFormOpen(true);
                    }}
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
      )}
    </div>
  );
};
