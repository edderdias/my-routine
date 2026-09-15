import { Category, NotificationLog, Priority, Status, Task, User, UserSettings, WorkType } from '../types';
import { calculateScheduledNotificationTime } from './notificationService';

export interface UserAccount extends User {
  passwordHash: string;
}

const USERS_KEY = 'minha_rotina_users';
const ACTIVE_USER_KEY = 'minha_rotina_active_user';
const TASKS_KEY_PREFIX = 'minha_rotina_tasks_';
const CATEGORIES_KEY_PREFIX = 'minha_rotina_categories_';
const SETTINGS_KEY_PREFIX = 'minha_rotina_settings_';
const LOGS_KEY_PREFIX = 'minha_rotina_logs_';
const RESET_CODES_KEY = 'minha_rotina_reset_codes';
const OFFLINE_QUEUE_KEY = 'minha_rotina_offline_queue';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-trabalho', name: 'Trabalho', color: '#2563eb', iconName: 'Briefcase', isDefault: true },
  { id: 'cat-estudos', name: 'Estudos', color: '#7c3aed', iconName: 'GraduationCap', isDefault: true },
  { id: 'cat-pessoal', name: 'Pessoal', color: '#10b981', iconName: 'User', isDefault: true },
  { id: 'cat-familia', name: 'Família', color: '#ec4899', iconName: 'Heart', isDefault: true },
  { id: 'cat-financeiro', name: 'Financeiro', color: '#f59e0b', iconName: 'DollarSign', isDefault: true },
  { id: 'cat-saude', name: 'Saúde', color: '#06b6d4', iconName: 'Activity', isDefault: true },
  { id: 'cat-compras', name: 'Compras', color: '#f97316', iconName: 'ShoppingCart', isDefault: true },
  { id: 'cat-reuniao', name: 'Reunião', color: '#0284c7', iconName: 'Users', isDefault: true },
];

export const DEFAULT_WORK_TYPES: WorkType[] = [
  { id: 'work-maxus', name: 'Maxus', isDefault: true },
  { id: 'work-okad', name: 'OKAD', isDefault: true },
];

export function createDefaultSettings(user?: User | null): UserSettings {
  return {
    defaultNotificationChannel: 'whatsapp',
    defaultLeadTime: '15m',
    defaultPhone: user?.phone || '',
    defaultEmail: user?.email || '',
    theme: 'light',
    weekStartDay: 1, // Monday
    timeFormat: '24h',
    timeZone: 'America/Sao_Paulo',
    enableBrowserNotifications: true,
    whatsappBusiness: {
      enabled: true,
      apiToken: '',
      phoneNumberId: '',
      senderNumber: user?.phone || '',
      approvedTemplate: 'lembrete_tarefa_v2',
    },
  };
}

// Compute dynamic status: if task is in past and still pending, in_progress or deferred, it is overdue
export function computeTaskStatus(task: Task): Status {
  if (task.status === 'completed' || task.status === 'canceled') {
    return task.status;
  }
  
  const now = new Date();
  const [year, month, day] = task.date.split('-').map(Number);
  const [hours, minutes] = task.startTime.split(':').map(Number);
  const taskDateTime = new Date(year, month - 1, day, hours, minutes, 0);

  if (taskDateTime.getTime() < now.getTime()) {
    return 'overdue';
  }
  return task.status;
}

// Password hashing utility using standard Web Crypto SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_minha_rotina_salt_sec');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Storage methods for real users & data persistence
export const storage = {
  // Accounts
  getUserAccounts(): UserAccount[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveUserAccounts(accounts: UserAccount[]): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
    } catch (err) {
      console.error('Error saving user accounts:', err);
    }
  },

  findUserByEmail(email: string): UserAccount | undefined {
    const accounts = this.getUserAccounts();
    const clean = email.trim().toLowerCase();
    return accounts.find(u => u.email.trim().toLowerCase() === clean);
  },

  // Active User session
  getActiveUser(): User | null {
    try {
      const data = localStorage.getItem(ACTIVE_USER_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch {
      return null;
    }
  },

  setActiveUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(ACTIVE_USER_KEY);
      }
    } catch (err) {
      console.error('Error setting active user:', err);
    }
  },

  // Password Reset Codes
  saveResetCode(email: string, code: string): void {
    try {
      const existing = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
      existing[email.trim().toLowerCase()] = {
        code,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes validity
      };
      localStorage.setItem(RESET_CODES_KEY, JSON.stringify(existing));
    } catch (err) {
      console.error('Error saving reset code:', err);
    }
  },

  verifyResetCode(email: string, code: string): boolean {
    try {
      const existing = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
      const record = existing[email.trim().toLowerCase()];
      if (!record) return false;
      if (Date.now() > record.expiresAt) return false;
      return record.code === code.trim();
    } catch {
      return false;
    }
  },

  clearResetCode(email: string): void {
    try {
      const existing = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
      delete existing[email.trim().toLowerCase()];
      localStorage.setItem(RESET_CODES_KEY, JSON.stringify(existing));
    } catch {}
  },

  // Tasks - strictly real user tasks, starts completely empty for new users
  getTasks(userId: string): Task[] {
    if (!userId) return [];
    try {
      const data = localStorage.getItem(TASKS_KEY_PREFIX + userId);
      if (!data) {
        return [];
      }
      const parsed: Task[] = JSON.parse(data);
      return parsed.map(t => ({ ...t, status: computeTaskStatus(t) }));
    } catch {
      return [];
    }
  },

  saveTasks(userId: string, tasks: Task[]): void {
    if (!userId) return;
    try {
      localStorage.setItem(TASKS_KEY_PREFIX + userId, JSON.stringify(tasks));
    } catch (err) {
      console.error('Error saving tasks:', err);
    }
  },

  // Categories
  getCategories(userId: string): Category[] {
    if (!userId) return DEFAULT_CATEGORIES;
    try {
      const data = localStorage.getItem(CATEGORIES_KEY_PREFIX + userId);
      if (!data) {
        localStorage.setItem(CATEGORIES_KEY_PREFIX + userId, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(userId: string, categories: Category[]): void {
    if (!userId) return;
    try {
      localStorage.setItem(CATEGORIES_KEY_PREFIX + userId, JSON.stringify(categories));
    } catch (err) {
      console.error('Error saving categories:', err);
    }
  },

  // Settings
  getSettings(userId: string, user?: User | null): UserSettings {
    const defaults = createDefaultSettings(user);
    if (!userId) return defaults;
    try {
      const data = localStorage.getItem(SETTINGS_KEY_PREFIX + userId);
      if (!data) {
        localStorage.setItem(SETTINGS_KEY_PREFIX + userId, JSON.stringify(defaults));
        return defaults;
      }
      return { ...defaults, ...JSON.parse(data) };
    } catch {
      return defaults;
    }
  },

  saveSettings(userId: string, settings: UserSettings): void {
    if (!userId) return;
    try {
      localStorage.setItem(SETTINGS_KEY_PREFIX + userId, JSON.stringify(settings));
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  },

  // Notification Logs
  getLogs(userId: string): NotificationLog[] {
    if (!userId) return [];
    try {
      const data = localStorage.getItem(LOGS_KEY_PREFIX + userId);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  addLog(userId: string, log: NotificationLog): void {
    if (!userId) return;
    try {
      const logs = this.getLogs(userId);
      logs.unshift(log);
      if (logs.length > 200) logs.length = 200;
      localStorage.setItem(LOGS_KEY_PREFIX + userId, JSON.stringify(logs));
    } catch (err) {
      console.error('Error adding log:', err);
    }
  },

  enqueueOfflineChange(change: { type: string; payload: unknown; timestamp: string }): void {
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      queue.push(change);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('Error queuing offline change:', err);
    }
  },

  getOfflineQueue(): Array<{ type: string; payload: unknown; timestamp: string }> {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  clearOfflineQueue(): void {
    try {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch {}
  }
};
