export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export type Status = 'pending' | 'in_progress' | 'deferred' | 'completed' | 'canceled' | 'overdue';

export type NotificationChannel = 'none' | 'whatsapp' | 'email' | 'both';

export interface TaskNotificationConfig {
  channel: NotificationChannel;
  targetPhone?: string;
  targetEmail?: string;
  scheduledFor?: string; // ISO
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'canceled';
  lastSentAt?: string;
  errorMessage?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  priority: Priority;
  status: Status;
  notification: TaskNotificationConfig;
}

export interface UserSettings {
  defaultPhone?: string;
  defaultEmail?: string;
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
