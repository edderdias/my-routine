import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Tag,
  Bell
} from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { Task } from '../../types';

export const CalendarView: React.FC = () => {
  const {
    tasks,
    categories,
    selectedDate,
    setSelectedDate,
    setIsTaskFormOpen,
    setEditingTask,
    setViewingTask,
    toggleComplete,
  } = useTasks();

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth()); // 0-indexed

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    const n = new Date();
    setViewYear(n.getFullYear());
    setViewMonth(n.getMonth());
  };

  // Month name
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Month grid calculation
  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      tasks: Task[];
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().slice(0, 10);

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 12 : viewMonth;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        tasks: tasks.filter(t => t.date === dateStr),
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        tasks: tasks.filter(t => t.date === dateStr),
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to fill complete weeks (multiples of 7)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 1 : viewMonth + 2;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        tasks: tasks.filter(t => t.date === dateStr),
        isToday: dateStr === todayStr,
      });
    }

    return cells;
  }, [viewYear, viewMonth, tasks]);

  // Tasks for the currently selected date
  const selectedDateTasks = useMemo(() => {
    return tasks
      .filter(t => t.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [tasks, selectedDate]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 lg:pb-8 animate-in fade-in">
      {/* Month Navigation Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {capitalizedMonth}
            </h1>
            <button
              onClick={handleCurrentMonth}
              className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
            >
              Mês Atual
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Clique em qualquer dia para inspecionar os compromissos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskFormOpen(true);
            }}
            className="ml-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-100 shadow-xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase tracking-wider py-2 border-b border-slate-100 mb-2">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        {/* Month Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarCells.map(cell => {
            const isSelected = cell.dateStr === selectedDate;
            const completedCount = cell.tasks.filter(t => t.status === 'completed').length;
            const pendingCount = cell.tasks.filter(t => t.status === 'pending' || t.status === 'overdue').length;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDate(cell.dateStr)}
                className={`min-h-[70px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                    : cell.isToday
                    ? 'border-blue-300 bg-blue-50/20'
                    : cell.isCurrentMonth
                    ? 'border-slate-100 bg-white hover:border-slate-300'
                    : 'border-slate-50 bg-slate-50/40 opacity-40 hover:opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                      cell.isToday
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isSelected
                        ? 'text-blue-700 font-black'
                        : 'text-slate-800'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {cell.tasks.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 sm:hidden">
                      {cell.tasks.length}
                    </span>
                  )}
                </div>

                {/* Task preview dots/badges on desktop */}
                <div className="space-y-1 my-1">
                  {cell.tasks.slice(0, 2).map(t => {
                    const cat = categories.find(c => c.id === t.categoryId);
                    return (
                      <div
                        key={t.id}
                        className="hidden sm:flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate"
                        style={{
                          backgroundColor: cat ? `${cat.color}15` : '#e2e8f0',
                          color: cat ? cat.color : '#334155',
                        }}
                      >
                        <span className="font-bold shrink-0">{t.startTime}</span>
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}

                  {cell.tasks.length > 2 && (
                    <div className="hidden sm:block text-[9px] font-bold text-slate-400 text-right pr-1">
                      +{cell.tasks.length - 2} mais
                    </div>
                  )}
                </div>

                {/* Mobile indicators */}
                <div className="flex sm:hidden items-center justify-center gap-1 mt-auto">
                  {pendingCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                  {completedCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Drawer Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tarefas do dia {selectedDate.split('-').reverse().join('/')}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedDateTasks.length === 0
                ? 'Nenhum compromisso agendado para esta data.'
                : `${selectedDateTasks.length} compromisso${selectedDateTasks.length > 1 ? 's' : ''} registrado${selectedDateTasks.length > 1 ? 's' : ''}`}
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskFormOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Tarefa neste Dia</span>
          </button>
        </div>

        {selectedDateTasks.length > 0 ? (
          <div className="space-y-2.5">
            {selectedDateTasks.map(task => {
              const cat = categories.find(c => c.id === task.categoryId);
              const isDone = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleComplete(task.id)}
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                        isDone ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div
                      onClick={() => setViewingTask(task)}
                      className="cursor-pointer min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </span>
                        {cat && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white shrink-0"
                            style={{ backgroundColor: cat.color }}
                          >
                            {cat.name}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {task.startTime}{task.endTime ? ` às ${task.endTime}` : ''}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewingTask(task)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Ver
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};
