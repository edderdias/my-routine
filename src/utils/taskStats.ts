import { Priority, Status, Task, TaskType } from '../types';
import { computeTaskStatus } from '../services/storage';

// Shared, pure calculation helpers for Dashboard, Minhas Tarefas and Kanban.
// All of them operate over the real `tasks` array coming from Firestore - never mocked data.

export function getTaskType(task: Task): TaskType {
  return task.taskType || 'personal';
}

// The "effective" status a task should be displayed with: completed/canceled are final,
// everything else may flip to 'overdue' when its date/time has passed.
export function getDisplayStatus(task: Task): Status {
  return computeTaskStatus(task);
}

export function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export interface StatusCounts {
  total: number;
  pending: number;
  inProgress: number;
  deferred: number;
  completed: number;
  overdue: number;
}

function emptyCounts(): StatusCounts {
  return { total: 0, pending: 0, inProgress: 0, deferred: 0, completed: 0, overdue: 0 };
}

export function computeStatusCounts(tasks: Task[]): StatusCounts {
  const counts = emptyCounts();
  for (const task of tasks) {
    const status = getDisplayStatus(task);
    if (status === 'canceled') continue; // canceled tasks are excluded from active counts
    counts.total++;
    if (status === 'completed') counts.completed++;
    else if (status === 'overdue') counts.overdue++;
    else if (status === 'in_progress') counts.inProgress++;
    else if (status === 'deferred') counts.deferred++;
    else counts.pending++;
  }
  return counts;
}

export interface DashboardStats {
  overall: StatusCounts;
  byType: Record<TaskType, StatusCounts>;
  today: Task[];
  overdueList: Task[];
  upcoming: Task[];
}

export function computeDashboardStats(tasks: Task[]): DashboardStats {
  const todayStr = getTodayStr();
  const nowTime = new Date();

  const byType: Record<TaskType, StatusCounts> = {
    personal: computeStatusCounts(tasks.filter(t => getTaskType(t) === 'personal')),
    congregational: computeStatusCounts(tasks.filter(t => getTaskType(t) === 'congregational')),
    professional: computeStatusCounts(tasks.filter(t => getTaskType(t) === 'professional')),
  };

  const today = tasks
    .filter(t => t.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const overdueList = tasks
    .filter(t => getDisplayStatus(t) === 'overdue')
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  const upcoming = tasks
    .filter(t => {
      const status = getDisplayStatus(t);
      if (status === 'completed' || status === 'canceled' || status === 'overdue') return false;
      const [y, m, d] = t.date.split('-').map(Number);
      const [h, min] = t.startTime.split(':').map(Number);
      const taskDateTime = new Date(y, m - 1, d, h, min);
      return taskDateTime.getTime() >= nowTime.getTime();
    })
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 8);

  return {
    overall: computeStatusCounts(tasks),
    byType,
    today,
    overdueList,
    upcoming,
  };
}

export type DateFilterKey = 'all' | 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'this_month' | 'custom';

export interface CustomDateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

export interface TaskFilters {
  type: 'all' | TaskType;
  priority: 'all' | Priority;
  status: 'all' | Status;
  dateFilter: DateFilterKey;
  customRange?: CustomDateRange;
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  type: 'all',
  priority: 'all',
  status: 'all',
  dateFilter: 'all',
};

function getWeekRange(baseDateStr: string, weekStartDay: 0 | 1 = 1): { start: string; end: string } {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const dayOfWeek = base.getDay();
  const distanceToStart = weekStartDay === 1
    ? (dayOfWeek === 0 ? -6 : weekStartDay - dayOfWeek)
    : -dayOfWeek;
  const start = new Date(base);
  start.setDate(base.getDate() + distanceToStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  return { start: fmt(start), end: fmt(end) };
}

export function matchesDateFilter(task: Task, dateFilter: DateFilterKey, customRange?: CustomDateRange): boolean {
  if (dateFilter === 'all') return true;

  const todayStr = getTodayStr();

  if (dateFilter === 'today') return task.date === todayStr;
  if (dateFilter === 'tomorrow') return task.date === addDays(todayStr, 1);

  if (dateFilter === 'this_week') {
    const { start, end } = getWeekRange(todayStr);
    return task.date >= start && task.date <= end;
  }

  if (dateFilter === 'next_week') {
    const { start, end } = getWeekRange(addDays(todayStr, 7));
    return task.date >= start && task.date <= end;
  }

  if (dateFilter === 'this_month') {
    return task.date.slice(0, 7) === todayStr.slice(0, 7);
  }

  if (dateFilter === 'custom' && customRange?.from && customRange?.to) {
    return task.date >= customRange.from && task.date <= customRange.to;
  }

  return true;
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter(task => {
    if (filters.type !== 'all' && getTaskType(task) !== filters.type) return false;

    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;

    if (filters.status !== 'all') {
      const status = getDisplayStatus(task);
      if (filters.status === 'overdue') {
        if (status !== 'overdue') return false;
      } else if (status !== filters.status) {
        return false;
      }
    }

    if (!matchesDateFilter(task, filters.dateFilter, filters.customRange)) return false;

    return true;
  });
}
