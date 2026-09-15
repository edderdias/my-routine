import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  calculateScheduledNotificationTime,
  formatEmailContent,
  formatWhatsAppMessage,
  getLeadTimeMinutes,
  sendBrowserNotification
} from '../services/notificationService';
import { firestoreService } from '../services/firestoreService';
import { DEFAULT_CATEGORIES, DEFAULT_WORK_TYPES, createDefaultSettings, computeTaskStatus } from '../services/storage';
import { validateTaskPayload } from '../utils/taskValidation';
import { getPriorityLabel } from '../services/notificationService';
import {
  ActiveTab,
  Category,
  DeferralRecord,
  NotificationLog,
  Status,
  Task,
  TaskHistoryItem,
  UserSettings,
  WorkType
} from '../types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface PreviewNotificationData {
  isOpen: boolean;
  type: 'whatsapp' | 'email';
  task: Task;
  whatsappMessage?: string;
  emailSubject?: string;
  emailHtml?: string;
}

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  workTypes: WorkType[];
  settings: UserSettings;
  logs: NotificationLog[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  
  // Selection & modal state helpers
  editingTask: Task | null;
  setEditingTask: (t: Task | null) => void;
  isTaskFormOpen: boolean;
  setIsTaskFormOpen: (open: boolean) => void;
  viewingTask: Task | null;
  setViewingTask: (t: Task | null) => void;
  
  // Toast notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Notification preview
  previewModal: PreviewNotificationData | null;
  setPreviewModal: (p: PreviewNotificationData | null) => void;
  
  // Task Actions backed by Firestore
  addTask: (task: Omit<Task, 'id' | 'userId' | 'history' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>, modifyRecurrence?: 'only_this' | 'all') => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleComplete: (taskId: string) => Promise<void>;
  rescheduleTask: (taskId: string, newDate: string, newStartTime: string) => Promise<void>;
  deferTask: (taskId: string, newDate: string, newStartTime: string, reason?: string) => Promise<void>;
  duplicateTask: (taskId: string) => Promise<void>;
  triggerNotificationNow: (taskId: string, channelOverride?: 'whatsapp' | 'email' | 'both') => Promise<void>;

  // Category Actions backed by Firestore
  addCategory: (cat: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Professional work type Actions backed by Firestore (custom types persist for reuse)
  addWorkType: (name: string) => Promise<WorkType>;

  // Settings backed by Firestore
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;

  // Real database metrics for today
  todayMetrics: {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    nextTask: Task | null;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || '';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [workTypes, setWorkTypes] = useState<WorkType[]>(DEFAULT_WORK_TYPES);
  const [settings, setSettings] = useState<UserSettings>(() => createDefaultSettings(user));
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [previewModal, setPreviewModal] = useState<PreviewNotificationData | null>(null);

  // Real-time Firestore Subscriptions for real user database data
  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setCategories(DEFAULT_CATEGORIES);
      setWorkTypes(DEFAULT_WORK_TYPES);
      setLogs([]);
      return;
    }

    // Subscribe to real-time Tasks in Firestore
    const unsubTasks = firestoreService.subscribeTasks(userId, (loadedTasks) => {
      // Auto-compute overdue status + backfill taskType for tasks created before this classification existed
      const processed = loadedTasks.map(t => {
        const withType: Task = t.taskType ? t : { ...t, taskType: 'personal' };
        const computed = computeTaskStatus(withType);
        return computed !== withType.status ? { ...withType, status: computed } : withType;
      });
      setTasks(processed);
    });

    // Subscribe to real-time Categories in Firestore
    const unsubCats = firestoreService.subscribeCategories(userId, (loadedCats) => {
      setCategories(loadedCats.length > 0 ? loadedCats : DEFAULT_CATEGORIES);
    });

    // Subscribe to real-time professional work types in Firestore
    const unsubWorkTypes = firestoreService.subscribeWorkTypes(userId, (loadedWorkTypes) => {
      setWorkTypes(loadedWorkTypes.length > 0 ? loadedWorkTypes : DEFAULT_WORK_TYPES);
    });

    // Subscribe to real-time Notification Logs in Firestore
    const unsubLogs = firestoreService.subscribeLogs(userId, (loadedLogs) => {
      setLogs(loadedLogs);
    });

    // Subscribe to Settings in Firestore
    const unsubSettings = firestoreService.subscribeSettings(userId, (loadedSettings) => {
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    });

    return () => {
      unsubTasks();
      unsubCats();
      unsubWorkTypes();
      unsubLogs();
      unsubSettings();
    };
  }, [userId]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Local Browser Notification Loop
  // O envio real de WhatsApp/e-mail é feito por um processo externo (server/),
  // que é a única fonte de verdade para notification.status. Este efeito só
  // dispara a notificação do navegador, uma única vez por tarefa.
  const firedBrowserNotifsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId || !settings.enableBrowserNotifications) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();

      tasks.forEach((task) => {
        if (
          task.notification.channel !== 'none' &&
          task.notification.scheduledFor &&
          task.status !== 'completed' &&
          task.status !== 'canceled' &&
          !firedBrowserNotifsRef.current.has(task.id)
        ) {
          const scheduledTime = new Date(task.notification.scheduledFor).getTime();
          if (scheduledTime <= now) {
            firedBrowserNotifsRef.current.add(task.id);
            sendBrowserNotification(task);
          }
        }
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [userId, tasks, settings.enableBrowserNotifications]);

  // Recurrence generator helper
  const createRecurrenceOccurrences = (baseTask: Task): Task[] => {
    if (baseTask.recurrence.rule === 'none') return [];
    
    const occurrences: Task[] = [];
    const [y, m, d] = baseTask.date.split('-').map(Number);
    const startDate = new Date(y, m - 1, d);

    let added = 0;
    let step = 1;
    while (added < 4 && step <= 40) {
      const nextDate = new Date(startDate);
      if (baseTask.recurrence.rule === 'daily') {
        nextDate.setDate(startDate.getDate() + step);
      } else if (baseTask.recurrence.rule === 'workdays') {
        nextDate.setDate(startDate.getDate() + step);
        const dayOfWeek = nextDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          step++;
          continue;
        }
      } else if (baseTask.recurrence.rule === 'weekly') {
        nextDate.setDate(startDate.getDate() + (step * 7));
      } else if (baseTask.recurrence.rule === 'biweekly') {
        nextDate.setDate(startDate.getDate() + (step * 14));
      } else if (baseTask.recurrence.rule === 'monthly') {
        nextDate.setMonth(startDate.getMonth() + step);
      } else {
        break;
      }

      const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      const leadMinutes = getLeadTimeMinutes(baseTask.notification.leadTime, baseTask.notification.customMinutes);

      occurrences.push({
        ...baseTask,
        id: `task-rec-${Date.now()}-${added}`,
        date: nextDateStr,
        status: 'pending',
        completedAt: undefined,
        recurrence: {
          ...baseTask.recurrence,
          parentTaskId: baseTask.id,
          isOccurrence: true,
        },
        notification: {
          ...baseTask.notification,
          status: 'pending',
          scheduledFor: calculateScheduledNotificationTime(nextDateStr, baseTask.startTime, leadMinutes),
          lastSentAt: undefined,
        },
        history: [
          {
            id: 'h-rec-' + Date.now(),
            timestamp: new Date().toISOString(),
            action: `Ocorrência recorrente gerada no banco de dados`,
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      added++;
      step++;
    }

    return occurrences;
  };

  // Add Task to real Firestore database
  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'history' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const validationError = validateTaskPayload(taskData);
    if (validationError) {
      addToast({ type: 'error', title: 'Não foi possível salvar a tarefa', message: validationError });
      throw new Error(validationError);
    }

    const leadMins = getLeadTimeMinutes(taskData.notification.leadTime, taskData.notification.customMinutes);
    const scheduledIso = calculateScheduledNotificationTime(taskData.date, taskData.startTime, leadMins);
    
    const newTaskId = 'task-' + Date.now();
    const newTask: Task = {
      ...taskData,
      id: newTaskId,
      userId,
      notification: {
        ...taskData.notification,
        scheduledFor: scheduledIso,
        status: 'pending',
      },
      history: [
        {
          id: 'h-' + Date.now(),
          timestamp: new Date().toISOString(),
          action: 'Tarefa criada no banco de dados',
        },
        ...(taskData.notification.channel !== 'none'
          ? [
              {
                id: 'h-notif-' + Date.now(),
                timestamp: new Date().toISOString(),
                action: `Lembrete programado via ${taskData.notification.channel} para ${new Date(scheduledIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
              }
            ]
          : [])
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic local update
    setTasks(prev => [newTask, ...prev]);

    // Persist to Firestore
    if (userId) {
      await firestoreService.saveTask(userId, newTask);
    }

    // Persist occurrences if recurrence active
    const recurrences = createRecurrenceOccurrences(newTask);
    if (recurrences.length > 0 && userId) {
      setTasks(prev => [...recurrences, ...prev]);
      for (const rec of recurrences) {
        await firestoreService.saveTask(userId, rec);
      }
    }

    // Feedback
    let notifNote = '';
    if (taskData.notification.channel !== 'none') {
      const scheduledDateObj = new Date(scheduledIso);
      const formattedTime = scheduledDateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      notifNote = ` 🔔 Lembrete programado para ${formattedTime}.`;
    }

    addToast({
      type: 'success',
      title: '✓ Tarefa salva no banco de dados.',
      message: `${taskData.title}.${notifNote}`,
    });

    return newTask;
  };

  // Update Task in Firestore
  const updateTask = async (taskId: string, updates: Partial<Task>, modifyRecurrence?: 'only_this' | 'all') => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const merged = { ...target, ...updates };
    const validationError = validateTaskPayload(merged);
    if (validationError) {
      addToast({ type: 'error', title: 'Não foi possível salvar a tarefa', message: validationError });
      throw new Error(validationError);
    }

    const historyEntries: TaskHistoryItem[] = [...(target.history || [])];

    if (updates.date && updates.date !== target.date) {
      historyEntries.push({
        id: 'h-' + Date.now(),
        timestamp: new Date().toISOString(),
        action: `Data alterada de ${target.date.split('-').reverse().join('/')} para ${updates.date.split('-').reverse().join('/')}`,
      });
    }

    if (updates.startTime && updates.startTime !== target.startTime) {
      historyEntries.push({
        id: 'h-' + Date.now(),
        timestamp: new Date().toISOString(),
        action: `Horário alterado de ${target.startTime} para ${updates.startTime}`,
      });
    }

    if (updates.priority && updates.priority !== target.priority) {
      historyEntries.push({
        id: 'h-' + Date.now(),
        timestamp: new Date().toISOString(),
        action: `Prioridade alterada de "${getPriorityLabel(target.priority)}" para "${getPriorityLabel(updates.priority)}"`,
      });
    }

    if (updates.taskType && updates.taskType !== target.taskType) {
      historyEntries.push({
        id: 'h-' + Date.now(),
        timestamp: new Date().toISOString(),
        action: `Tipo de tarefa alterado de "${target.taskType || 'personal'}" para "${updates.taskType}"`,
      });
    }

    if (updates.status && updates.status !== target.status) {
      const statusLabel = (s: Status) =>
        s === 'completed' ? 'Concluído' : s === 'in_progress' ? 'Em execução' : s === 'deferred' ? 'Adiado' : s === 'canceled' ? 'Cancelado' : 'Pendente';
      historyEntries.push({
        id: 'h-' + Date.now(),
        timestamp: new Date().toISOString(),
        action: `Status alterado de "${statusLabel(target.status)}" para "${statusLabel(updates.status)}"`,
      });
    }

    // Only recompute/reprogram the reminder when something that actually affects it changed
    // (date, time or the notification config itself). Otherwise keep the existing
    // scheduledFor/status/lastSentAt untouched so an already-sent reminder is not silently reset
    // to "pending" (which would make it fire again) just because an unrelated field was edited.
    let newNotification = target.notification;
    const incomingNotification = updates.notification;
    if (incomingNotification) {
      const dateOrTimeChanged = (!!updates.date && updates.date !== target.date) || (!!updates.startTime && updates.startTime !== target.startTime);
      const notificationConfigChanged =
        incomingNotification.channel !== target.notification.channel ||
        incomingNotification.leadTime !== target.notification.leadTime ||
        incomingNotification.customMinutes !== target.notification.customMinutes ||
        incomingNotification.targetPhone !== target.notification.targetPhone ||
        incomingNotification.targetEmail !== target.notification.targetEmail;

      if (dateOrTimeChanged || notificationConfigChanged) {
        if (incomingNotification.channel !== 'none') {
          const d = updates.date || target.date;
          const time = updates.startTime || target.startTime;
          const leadMins = getLeadTimeMinutes(incomingNotification.leadTime, incomingNotification.customMinutes);
          newNotification = {
            ...incomingNotification,
            scheduledFor: calculateScheduledNotificationTime(d, time, leadMins),
            status: 'pending',
            lastSentAt: undefined,
            errorMessage: undefined,
          };
        } else {
          newNotification = {
            ...incomingNotification,
            scheduledFor: undefined,
            status: 'canceled',
            lastSentAt: undefined,
            errorMessage: undefined,
          };
        }
      } else {
        // Preserve the real send state; only the plain config fields may differ trivially
        newNotification = {
          ...incomingNotification,
          scheduledFor: target.notification.scheduledFor,
          status: target.notification.status,
          lastSentAt: target.notification.lastSentAt,
          errorMessage: target.notification.errorMessage,
        };
      }
    }

    const updatedTarget: Task = {
      ...target,
      ...updates,
      notification: newNotification,
      history: historyEntries,
      updatedAt: new Date().toISOString(),
      completedAt: updates.status === 'completed' ? new Date().toISOString() : updates.status ? undefined : target.completedAt,
    };

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTarget : t));

    // Persist in Firestore
    if (userId) {
      await firestoreService.saveTask(userId, updatedTarget);
    }

    if (modifyRecurrence === 'all' && target.recurrence.parentTaskId && userId) {
      const siblings = tasks.filter(t => t.recurrence.parentTaskId === target.recurrence.parentTaskId && t.id !== taskId);
      for (const sib of siblings) {
        const updatedSib = {
          ...sib,
          title: updates.title || sib.title,
          description: updates.description ?? sib.description,
          priority: updates.priority || sib.priority,
          categoryId: updates.categoryId || sib.categoryId,
          updatedAt: new Date().toISOString(),
        };
        await firestoreService.saveTask(userId, updatedSib);
      }
    }

    addToast({
      type: 'success',
      title: '✓ Tarefa atualizada no banco de dados.',
    });
  };

  // Delete Task in Firestore
  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (userId) {
      await firestoreService.deleteTask(userId, taskId);
    }
    addToast({
      type: 'info',
      title: 'Tarefa removida do banco de dados.',
    });
  };

  // Toggle complete in Firestore
  const toggleComplete = async (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const isNowCompleted = target.status !== 'completed';
    const historyItem: TaskHistoryItem = {
      id: 'h-' + Date.now(),
      timestamp: new Date().toISOString(),
      action: isNowCompleted ? 'Tarefa concluída' : 'Tarefa reaberta para pendente',
    };

    const updated: Task = {
      ...target,
      status: (isNowCompleted ? 'completed' : 'pending') as Status,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      history: [...(target.history || []), historyItem],
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));

    if (userId) {
      await firestoreService.saveTask(userId, updated);
    }

    addToast({
      type: isNowCompleted ? 'success' : 'info',
      title: isNowCompleted ? '✓ Tarefa concluída!' : 'Tarefa marcada como pendente.',
    });
  };

  // Reschedule Task in Firestore
  const rescheduleTask = async (taskId: string, newDate: string, newStartTime: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const leadMins = getLeadTimeMinutes(target.notification.leadTime, target.notification.customMinutes);
    const newScheduled = calculateScheduledNotificationTime(newDate, newStartTime, leadMins);
    
    const historyItem: TaskHistoryItem = {
      id: 'h-' + Date.now(),
      timestamp: new Date().toISOString(),
      action: `Reagendada de ${target.date} ${target.startTime} para ${newDate} ${newStartTime}`,
    };

    const updated: Task = {
      ...target,
      date: newDate,
      startTime: newStartTime,
      status: 'pending',
      notification: {
        ...target.notification,
        scheduledFor: newScheduled,
        status: 'pending',
      },
      history: [...(target.history || []), historyItem],
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));

    if (userId) {
      await firestoreService.saveTask(userId, updated);
    }

    addToast({
      type: 'success',
      title: '✓ Tarefa reagendada!',
      message: `Novo horário: ${newStartTime} em ${newDate}. Notificação reajustada.`,
    });
  };

  // Defer ("Adiado") a task to a new date/time. Distinct from a plain reschedule because it
  // records the deferral (old -> new date), flips status to 'deferred' and re-programs
  // notifications so no reminder fires for the old date.
  const deferTask = async (taskId: string, newDate: string, newStartTime: string, reason?: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const deferral: DeferralRecord = {
      fromDate: target.date,
      fromStartTime: target.startTime,
      toDate: newDate,
      toStartTime: newStartTime,
      reason,
      timestamp: new Date().toISOString(),
    };

    const leadMins = getLeadTimeMinutes(target.notification.leadTime, target.notification.customMinutes);
    const newScheduled = calculateScheduledNotificationTime(newDate, newStartTime, leadMins);

    const historyItem: TaskHistoryItem = {
      id: 'h-' + Date.now(),
      timestamp: new Date().toISOString(),
      action: `Tarefa adiada de ${target.date.split('-').reverse().join('/')} ${target.startTime} para ${newDate.split('-').reverse().join('/')} ${newStartTime}`,
    };

    const updated: Task = {
      ...target,
      date: newDate,
      startTime: newStartTime,
      status: 'deferred',
      lastDeferral: deferral,
      notification: {
        ...target.notification,
        scheduledFor: newScheduled,
        status: target.notification.channel !== 'none' ? 'pending' : target.notification.status,
        lastSentAt: undefined,
        errorMessage: undefined,
      },
      history: [...(target.history || []), historyItem],
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));

    if (userId) {
      await firestoreService.saveTask(userId, updated);
    }

    addToast({
      type: 'success',
      title: '✓ Tarefa adiada com sucesso.',
      message: `Nova data prevista: ${newDate.split('-').reverse().join('/')} às ${newStartTime}.`,
    });
  };

  // Duplicate Task in Firestore
  const duplicateTask = async (taskId: string) => {
    const orig = tasks.find(t => t.id === taskId);
    if (!orig) return;
    
    const cloned: Task = {
      ...orig,
      id: 'task-' + Date.now(),
      title: `${orig.title} (Cópia)`,
      status: 'pending',
      completedAt: undefined,
      history: [
        {
          id: 'h-' + Date.now(),
          timestamp: new Date().toISOString(),
          action: `Duplicada a partir de "${orig.title}"`,
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => [cloned, ...prev]);

    if (userId) {
      await firestoreService.saveTask(userId, cloned);
    }

    addToast({
      type: 'success',
      title: '✓ Tarefa duplicada com sucesso.',
    });
  };

  // Trigger Notification Now
  const triggerNotificationNow = async (taskId: string, channelOverride?: 'whatsapp' | 'email' | 'both') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const channel = channelOverride || task.notification.channel;
    const recipient = channel === 'whatsapp'
      ? (task.notification.targetPhone || settings.defaultPhone)
      : (task.notification.targetEmail || settings.defaultEmail);

    const whatsappMsg = formatWhatsAppMessage(task);
    const emailData = formatEmailContent(task);

    const log: NotificationLog = {
      id: 'log-' + Date.now(),
      userId,
      taskId: task.id,
      taskTitle: task.title,
      channel: channel === 'both' ? 'whatsapp' : channel,
      recipient: recipient || 'Destinatário',
      scheduledTime: new Date().toISOString(),
      sentTime: new Date().toISOString(),
      status: 'sent',
      previewTitle: emailData.subject,
      previewBody: channel === 'email' ? emailData.text : whatsappMsg,
    };

    if (userId) {
      await firestoreService.saveLog(userId, log);
    }
    setLogs(prev => [log, ...prev]);

    if (settings.enableBrowserNotifications) {
      sendBrowserNotification(task);
    }

    setPreviewModal({
      isOpen: true,
      type: channel === 'email' ? 'email' : 'whatsapp',
      task,
      whatsappMessage: whatsappMsg,
      emailSubject: emailData.subject,
      emailHtml: emailData.html,
    });

    addToast({
      type: 'success',
      title: `🔔 Lembrete enviado com sucesso!`,
      message: `Enviado para ${recipient} via ${channel.toUpperCase()}.`,
    });
  };

  // Category Actions backed by Firestore
  const addCategory = async (cat: Omit<Category, 'id'>): Promise<Category> => {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now(),
    };
    setCategories(prev => [...prev, newCat]);
    if (userId) {
      await firestoreService.saveCategory(userId, newCat);
    }
    addToast({ type: 'success', title: 'Categoria criada com sucesso.' });
    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    setCategories(prev => prev.map(c => c.id === id ? updated : c));
    if (userId) {
      await firestoreService.saveCategory(userId, updated);
    }
    addToast({ type: 'success', title: 'Categoria atualizada.' });
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    if (userId) {
      await firestoreService.deleteCategory(userId, id);
    }
    addToast({ type: 'info', title: 'Categoria excluída.' });
  };

  // Persist a new professional work type so it can be reused in future tasks (not just a temporary frontend value)
  const addWorkType = async (name: string): Promise<WorkType> => {
    const cleanName = name.trim();
    const existing = workTypes.find(w => w.name.trim().toLowerCase() === cleanName.toLowerCase());
    if (existing) return existing;

    const newWorkType: WorkType = {
      id: 'work-' + Date.now(),
      name: cleanName,
    };
    setWorkTypes(prev => [...prev, newWorkType]);
    if (userId) {
      await firestoreService.saveWorkType(userId, newWorkType);
    }
    addToast({ type: 'success', title: 'Novo tipo de trabalho cadastrado.', message: cleanName });
    return newWorkType;
  };

  // Settings Actions backed by Firestore
  const updateSettings = async (updates: Partial<UserSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    if (userId) {
      await firestoreService.saveSettings(userId, updated);
    }
    addToast({ type: 'success', title: 'Configurações salvas no banco de dados.' });
  };

  // Real Database Metrics for Today
  const todayMetrics = useMemo(() => {
    const todayStr = getTodayStr();
    const todayTasks = tasks.filter(t => t.date === todayStr);

    let completed = 0;
    let pending = 0;
    let overdue = 0;

    todayTasks.forEach(t => {
      if (t.status === 'completed') completed++;
      else if (t.status === 'overdue') overdue++;
      else pending++;
    });

    const nowTime = new Date().toTimeString().slice(0, 5);
    const upcoming = todayTasks
      .filter(t => t.status !== 'completed' && t.status !== 'canceled')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const nextUpcoming = upcoming.find(t => t.startTime >= nowTime) || upcoming[0] || null;

    return {
      total: todayTasks.length,
      completed,
      pending,
      overdue,
      nextTask: nextUpcoming,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        workTypes,
        settings,
        logs,
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        editingTask,
        setEditingTask,
        isTaskFormOpen,
        setIsTaskFormOpen,
        viewingTask,
        setViewingTask,
        toasts,
        addToast,
        removeToast,
        previewModal,
        setPreviewModal,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        rescheduleTask,
        deferTask,
        duplicateTask,
        triggerNotificationNow,
        addCategory,
        updateCategory,
        deleteCategory,
        addWorkType,
        updateSettings,
        todayMetrics,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return ctx;
}
