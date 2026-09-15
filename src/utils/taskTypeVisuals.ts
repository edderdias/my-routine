import { CongregationalActivityType, Priority, Status, TaskType } from '../types';

// Central place for visual identity (labels + colors) of task types, congregational
// activities, priorities and statuses, reused by Dashboard, Minhas Tarefas, Kanban and Agenda.

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  personal: 'Pessoal',
  congregational: 'Congregacional',
  professional: 'Profissional',
};

export const TASK_TYPE_COLORS: Record<TaskType, { bg: string; text: string; border: string; solid: string }> = {
  personal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', solid: '#059669' },
  congregational: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', solid: '#4f46e5' },
  professional: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', solid: '#b45309' },
};

export const CONGREGATIONAL_ACTIVITY_LABELS: Record<CongregationalActivityType, string> = {
  visit: 'Visita',
  meeting: 'Reunião',
  commission: 'Comissão',
  speech: 'Discurso',
  event: 'Evento',
};

export const PRIORITY_DOT: Record<Priority, string> = {
  low: '🟢',
  normal: '🔵',
  high: '🟠',
  urgent: '🔴',
};

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  low: { bg: 'bg-slate-100', text: 'text-slate-600' },
  normal: { bg: 'bg-blue-100', text: 'text-blue-700' },
  high: { bg: 'bg-amber-100', text: 'text-amber-800' },
  urgent: { bg: 'bg-rose-100', text: 'text-rose-700' },
};

export const STATUS_LABELS: Record<Status, string> = {
  pending: 'Pendente',
  in_progress: 'Em execução',
  deferred: 'Adiado',
  completed: 'Concluído',
  canceled: 'Cancelado',
  overdue: 'Atrasado',
};

export const STATUS_COLORS: Record<Status, { bg: string; text: string }> = {
  pending: { bg: 'bg-blue-50', text: 'text-blue-700' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700' },
  deferred: { bg: 'bg-purple-50', text: 'text-purple-700' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  canceled: { bg: 'bg-slate-100', text: 'text-slate-600' },
  overdue: { bg: 'bg-rose-50', text: 'text-rose-700' },
};

export function getTaskTypeLabel(taskType: TaskType | undefined | null): string {
  return TASK_TYPE_LABELS[taskType || 'personal'];
}

export function getCongregationalActivityLabel(activityType: CongregationalActivityType | undefined | null): string {
  if (!activityType) return '';
  return CONGREGATIONAL_ACTIVITY_LABELS[activityType];
}
