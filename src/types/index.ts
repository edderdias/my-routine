export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export type Status = 'pending' | 'in_progress' | 'deferred' | 'completed' | 'canceled' | 'overdue';

export type TaskType = 'personal' | 'congregational' | 'professional';

export type CongregationalActivityType = 'visit' | 'meeting' | 'commission' | 'speech' | 'event';

export type NotificationChannel = 'none' | 'whatsapp' | 'email' | 'both';

export type NotificationLeadTime = 
  | 'at_time' 
  | '5m' 
  | '10m' 
  | '15m' 
  | '30m' 
  | '1h' 
  | '2h' 
  | '1d' 
  | 'custom';

export type RecurrenceRule = 
  | 'none' 
  | 'daily' 
  | 'workdays' 
  | 'weekly' 
  | 'biweekly' 
  | 'monthly' 
  | 'yearly' 
  | 'custom';

export type DurationType = 'none' | 'minutes' | 'endTime';

export interface Category {
  id: string;
  name: string;
  color: string;
  iconName: string;
  isDefault?: boolean;
}

export interface TaskHistoryItem {
  id: string;
  timestamp: string; // ISO
  action: string;
  details?: string;
}

export interface TaskNotificationConfig {
  channel: NotificationChannel;
  leadTime: NotificationLeadTime;
  customMinutes?: number;
  targetPhone?: string;
  targetEmail?: string;
  scheduledFor?: string; // ISO
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'canceled';
  lastSentAt?: string;
  errorMessage?: string;
}

export interface TaskRecurrenceConfig {
  rule: RecurrenceRule;
  interval?: number; // every X days/weeks
  endDate?: string;
  parentTaskId?: string;
  isOccurrence?: boolean;
}

// Congregational activity-specific data. Which fields are relevant depends on `activityType`:
// meeting/event -> location + summary; commission -> location + personName; visit -> location + visitedPerson + companion + summary; speech -> location + theme + summary
export interface CongregationalDetails {
  activityType: CongregationalActivityType;
  location?: string;
  summary?: string;
  personName?: string; // commission: person the commission concerns
  visitedPerson?: string; // visit: who is being visited
  companion?: string; // visit: who is accompanying
  theme?: string; // speech: theme/title
}

export interface ProfessionalDetails {
  requestDate: string; // YYYY-MM-DD - data da solicitação
  requestedBy: string; // quem fez a solicitação
  workTypeId: string; // references a WorkType id
  summary?: string; // resumo da solicitação
}

export interface WorkType {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface DeferralRecord {
  fromDate: string;
  fromStartTime: string;
  toDate: string;
  toStartTime: string;
  reason?: string;
  timestamp: string; // ISO
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD - for professional tasks, this is the expected delivery date
  startTime: string; // HH:mm
  durationType: DurationType;
  durationMinutes?: number;
  endTime?: string; // HH:mm
  priority: Priority;
  status: Status;
  categoryId: string;
  taskType: TaskType;
  congregational?: CongregationalDetails;
  professional?: ProfessionalDetails;
  lastDeferral?: DeferralRecord;
  notification: TaskNotificationConfig;
  recurrence: TaskRecurrenceConfig;
  history: TaskHistoryItem[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  completedAt?: string; // ISO
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

export interface UserSettings {
  defaultNotificationChannel: NotificationChannel;
  defaultLeadTime: NotificationLeadTime;
  defaultPhone: string;
  defaultEmail: string;
  theme: 'light' | 'dark' | 'system';
  weekStartDay: 0 | 1; // 0 = Sunday, 1 = Monday
  timeFormat: '24h' | '12h';
  timeZone: string;
  enableBrowserNotifications: boolean;
  whatsappBusiness: {
    enabled: boolean;
    apiToken: string;
    phoneNumberId: string;
    senderNumber: string;
    approvedTemplate: string;
  };
}

export interface NotificationLog {
  id: string;
  userId?: string;
  taskId: string;
  taskTitle: string;
  channel: 'whatsapp' | 'email' | 'browser';
  recipient: string;
  scheduledTime: string;
  sentTime: string;
  status: 'sent' | 'failed' | 'pending';
  previewTitle: string;
  previewBody: string;
  errorMessage?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'agenda'
  | 'calendar'
  | 'tasks'
  | 'kanban'
  | 'categories'
  | 'reports'
  | 'settings'
  | 'notifications_center';
