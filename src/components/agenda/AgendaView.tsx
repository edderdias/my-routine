import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Tag,
  Bell,
  AlertCircle
} from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { Task } from '../../types';

export const AgendaView: React.FC = () => {
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

  // Parse current selectedDate into a Date object
  const currentDateObj = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDate]);

  // Navigate day by day
  const handlePrevDay = () => {
    const d = new Date(currentDateObj);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateKey(d));
  };

  const handleNextDay = () => {
    const d = new Date(currentDateObj);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDateKey(d));
  };

  const handleGoToday = () => {
    setSelectedDate(formatDateKey(new Date()));
  };

  function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Generate 7-day strip around current date (from Monday to Sunday of the current week)
  const weekDays = useMemo(() => {
    const current = new Date(currentDateObj);
    const dayOfWeek = current.getDay(); // 0 is Sun, 1 is Mon
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMon);

    const days: Array<{ dateStr: string; dayNum: number; dayName: string; taskCount: number; isToday: boolean }> = [];
    const todayStr = formatDateKey(new Date());

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const str = formatDateKey(d);
      const count = tasks.filter(t => t.date === str).length;
      
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      days.push({
        dateStr: str,
        dayNum: d.getDate(),
        dayName: dayNames[d.getDay()],
        taskCount: count,
        isToday: str === todayStr,
      });
    }

    return days;
  }, [currentDateObj, tasks]);

  // Filter tasks for the selected date
  const dayTasks = useMemo(() => {
    return tasks
      .filter(t => t.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [tasks, selectedDate]);

  // Timeline hours from 06:00 to 23:00
  const hours = useMemo(() => {
    const list = [];
    for (let h = 6; h <= 23; h++) {
      list.push(String(h).padStart(2, '0') + ':00');
    }
    return list;
  }, []);

  const handleEmptySlotClick = (hourStr: string) => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const formattedDateTitle = currentDateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const capitalizedTitle = formattedDateTitle.charAt(0).toUpperCase() + formattedDateTitle.slice(1);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 lg:pb-8 animate-in fade-in">
      {/* Top Header & Day Navigation */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Minha Agenda
            </h1>
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
            >
              Hoje
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {capitalizedTitle} &bull; {dayTasks.length} compromisso{dayTasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Date picker controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Dia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
          />

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Próximo dia"
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
            <span className="hidden sm:inline">Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Week Day Strip Selector */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 bg-white rounded-3xl p-2.5 sm:p-3 border border-slate-100 shadow-xs">
        {weekDays.map(d => {
          const isSelected = d.dateStr === selectedDate;
          return (
            <button
              key={d.dateStr}
              onClick={() => setSelectedDate(d.dateStr)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/30'
                  : d.isToday
                  ? 'bg-blue-50/70 text-blue-800 hover:bg-blue-100/80'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {d.dayName}
              </span>
              <span className="text-base sm:text-lg font-extrabold mt-0.5">
                {d.dayNum}
              </span>

              {/* Task indicator dot/count */}
              {d.taskCount > 0 ? (
                <span
                  className={`mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {d.taskCount}
                </span>
              ) : (
                <span className="h-4 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Timeline Layout */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
        <div className="space-y-4">
          {hours.map(hourStr => {
            const hourNum = parseInt(hourStr.slice(0, 2), 10);
            // Tasks matching this hour
            const matchingTasks = dayTasks.filter(t => {
              const taskHour = parseInt(t.startTime.slice(0, 2), 10);
              return taskHour === hourNum;
            });

            return (
              <div key={hourStr} className="flex items-start gap-3 sm:gap-4 group min-h-[64px]">
                {/* Hour Label */}
                <div className="w-12 sm:w-14 text-right shrink-0 pt-1 font-bold text-xs text-slate-400 group-hover:text-blue-600 transition">
                  {hourStr}
                </div>

                {/* Timeline Bar & Slot */}
                <div className="flex-1 border-t border-slate-100 pt-1">
                  {matchingTasks.length > 0 ? (
                    <div className="space-y-2">
                      {matchingTasks.map(task => {
                        const cat = categories.find(c => c.id === task.categoryId);
                        const isDone = task.status === 'completed';
                        const isOverdue = task.status === 'overdue';

                        return (
                          <div
                            key={task.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
                              isDone
                                ? 'bg-slate-50/80 border-slate-200/60 opacity-85'
                                : isOverdue
                                ? 'bg-rose-50/50 border-rose-200'
                                : 'bg-gradient-to-r from-blue-50/40 to-white border-blue-200/80 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => toggleComplete(task.id)}
                                className={`w-5 h-5 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer mt-0.5 sm:mt-0 ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : 'border-2 border-slate-300 hover:border-blue-500 bg-white'
                                }`}
                              >
                                {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <div
                                onClick={() => setViewingTask(task)}
                                className="cursor-pointer min-w-0"
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-xs sm:text-sm font-bold truncate ${
                                      isDone ? 'line-through text-slate-400' : 'text-slate-900'
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  <span className="text-[11px] font-semibold text-slate-500">
                                    ({task.startTime}{task.endTime ? ` - ${task.endTime}` : ''})
                                  </span>

                                  {cat && (
                                    <span
                                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                                      style={{ backgroundColor: cat.color }}
                                    >
                                      {cat.name}
                                    </span>
                                  )}

                                  {task.notification.channel !== 'none' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                      <Bell className="w-3 h-3" />
                                      <span className="capitalize">{task.notification.channel}</span>
                                    </span>
                                  )}
                                </div>

                                {task.description && (
                                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => setViewingTask(task)}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                              >
                                Detalhes
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Empty hour slot */
                    <button
                      type="button"
                      onClick={() => handleEmptySlotClick(hourStr)}
                      className="w-full text-left py-2 px-3 rounded-xl border border-dashed border-transparent hover:border-blue-200 hover:bg-blue-50/40 text-slate-300 hover:text-blue-600 transition text-[11px] font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                      <span className="opacity-0 group-hover:opacity-100 transition">
                        Agendar compromisso às {hourStr}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
