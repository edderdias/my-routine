import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDb } from './firebaseAdmin';
import { sendWhatsAppMessage } from './whatsapp';
import { sendReminderEmail } from './email';
import { formatWhatsAppMessage, formatEmailContent } from './format';
import type { Task, UserSettings, NotificationLog } from './types';

interface ChannelResult {
  channel: 'whatsapp' | 'email';
  ok: boolean;
  recipient: string;
  error?: string;
}

export interface ProcessResult {
  checked: number;
  sent: number;
  failed: number;
}

export async function processReminders(): Promise<ProcessResult> {
  const db = getFirestoreDb();
  const now = Date.now();

  const snapshot = await db
    .collectionGroup('tasks')
    .where('notification.status', '==', 'pending')
    .get();

  let sent = 0;
  let failed = 0;

  for (const docSnap of snapshot.docs) {
    const task = docSnap.data() as Task;
    const notification = task.notification;

    if (!notification || notification.channel === 'none') continue;
    if (!notification.scheduledFor) continue;
    if (task.status === 'completed' || task.status === 'canceled') continue;
    if (new Date(notification.scheduledFor).getTime() > now) continue;

    const userId = task.userId || docSnap.ref.parent.parent?.id;
    if (!userId) continue;

    const userSnap = await db.collection('users').doc(userId).get();
    const settings = (userSnap.data()?.settings || {}) as UserSettings;

    const targetPhone = notification.targetPhone || settings.defaultPhone;
    const targetEmail = notification.targetEmail || settings.defaultEmail;

    const wantsWhatsApp = notification.channel === 'whatsapp' || notification.channel === 'both';
    const wantsEmail = notification.channel === 'email' || notification.channel === 'both';

    const results: ChannelResult[] = [];

    if (wantsWhatsApp) {
      if (targetPhone) {
        try {
          await sendWhatsAppMessage(targetPhone, formatWhatsAppMessage(task));
          results.push({ channel: 'whatsapp', ok: true, recipient: targetPhone });
        } catch (err) {
          results.push({
            channel: 'whatsapp',
            ok: false,
            recipient: targetPhone,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      } else {
        results.push({ channel: 'whatsapp', ok: false, recipient: '', error: 'Nenhum telefone configurado' });
      }
    }

    if (wantsEmail) {
      if (targetEmail) {
        try {
          const { subject, html, text } = formatEmailContent(task);
          await sendReminderEmail(targetEmail, subject, html, text);
          results.push({ channel: 'email', ok: true, recipient: targetEmail });
        } catch (err) {
          results.push({
            channel: 'email',
            ok: false,
            recipient: targetEmail,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      } else {
        results.push({ channel: 'email', ok: false, recipient: '', error: 'Nenhum e-mail configurado' });
      }
    }

    const anyOk = results.some((r) => r.ok);
    const errorMessage = results
      .filter((r) => !r.ok)
      .map((r) => `${r.channel}: ${r.error}`)
      .join(' | ');

    await docSnap.ref.update({
      'notification.status': anyOk ? 'sent' : 'failed',
      'notification.lastSentAt': new Date().toISOString(),
      'notification.errorMessage': errorMessage ? errorMessage : FieldValue.delete(),
    });

    for (const r of results) {
      const log: NotificationLog = {
        id: `log-${Date.now()}-${r.channel}-${docSnap.id}`,
        userId,
        taskId: docSnap.id,
        taskTitle: task.title,
        channel: r.channel,
        recipient: r.recipient || 'Destinatário',
        scheduledTime: notification.scheduledFor,
        sentTime: new Date().toISOString(),
        status: r.ok ? 'sent' : 'failed',
        previewTitle: `Lembrete: ${task.title}`,
        previewBody: r.channel === 'whatsapp' ? formatWhatsAppMessage(task) : formatEmailContent(task).text,
        ...(r.error ? { errorMessage: r.error } : {}),
      };
      await db.collection('users').doc(userId).collection('logs').doc(log.id).set(log);
    }

    if (anyOk) sent++; else failed++;
  }

  return { checked: snapshot.size, sent, failed };
}
