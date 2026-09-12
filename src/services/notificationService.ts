import { NotificationLeadTime, Priority, Task, NotificationLog } from '../types';

export function getLeadTimeMinutes(leadTime: NotificationLeadTime, customMinutes?: number): number {
  switch (leadTime) {
    case 'at_time': return 0;
    case '5m': return 5;
    case '10m': return 10;
    case '15m': return 15;
    case '30m': return 30;
    case '1h': return 60;
    case '2h': return 120;
    case '1d': return 1440;
    case 'custom': return Math.max(1, customMinutes || 15);
    default: return 15;
  }
}

export function getLeadTimeLabel(leadTime: NotificationLeadTime, customMinutes?: number): string {
  switch (leadTime) {
    case 'at_time': return 'No horário da tarefa';
    case '5m': return '5 minutos antes';
    case '10m': return '10 minutos antes';
    case '15m': return '15 minutos antes';
    case '30m': return '30 minutos antes';
    case '1h': return '1 hora antes';
    case '2h': return '2 horas antes';
    case '1d': return '1 dia antes';
    case 'custom': return `${customMinutes || 15} minutos antes`;
    default: return '15 minutos antes';
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'low': return 'Baixa';
    case 'normal': return 'Normal';
    case 'high': return 'Alta';
    case 'urgent': return 'Urgente';
    default: return 'Normal';
  }
}

export function calculateScheduledNotificationTime(dateStr: string, timeStr: string, leadMinutes: number): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const taskDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const scheduledTime = new Date(taskDate.getTime() - leadMinutes * 60 * 1000);
    return scheduledTime.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export function formatWhatsAppMessage(task: Task): string {
  const leadMinutes = getLeadTimeMinutes(task.notification.leadTime, task.notification.customMinutes);
  const leadText = leadMinutes === 0 ? 'agora' : `${leadMinutes} minutos`;
  const [y, m, d] = task.date.split('-');
  const formattedDate = `${d}/${m}/${y}`;

  return `🔔 *Lembrete de tarefa*

Sua tarefa está programada para daqui a ${leadText}.

📌 *Tarefa:*
${task.title}

📅 *Data:*
${formattedDate}

⏰ *Horário:*
${task.startTime}${task.endTime ? ` até ${task.endTime}` : ''}

🏷️ *Prioridade:*
${getPriorityLabel(task.priority)}

${task.description ? `*Descrição:*\n${task.description}` : ''}`;
}

export function formatEmailContent(task: Task): { subject: string; html: string; text: string } {
  const [y, m, d] = task.date.split('-');
  const formattedDate = `${d}/${m}/${y}`;
  const priorityName = getPriorityLabel(task.priority);

  const subject = `Lembrete: ${task.title} às ${task.startTime}`;
  
  const text = `Olá!

Este é um lembrete da sua agenda.

📌 ${task.title}

📅 ${formattedDate}
⏰ ${task.startTime}${task.endTime ? ` até ${task.endTime}` : ''}
🏷️ ${priorityName} prioridade

${task.description ? `Descrição:\n${task.description}\n\n` : ''}Acesse o sistema Minha Rotina para ver os detalhes da tarefa.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 24px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 13px; }
    .body { padding: 24px; }
    .title-box { background: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #2563eb; }
    .title-box h2 { margin: 0; font-size: 18px; color: #0f172a; }
    .meta-row { display: flex; align-items: center; margin-bottom: 12px; font-size: 14px; }
    .meta-label { font-weight: 600; width: 100px; color: #64748b; }
    .meta-value { color: #0f172a; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .badge-urgent { background: #fee2e2; color: #b91c1c; }
    .badge-high { background: #ffedd5; color: #c2410c; }
    .badge-normal { background: #dbeafe; color: #1d4ed8; }
    .badge-low { background: #f1f5f9; color: #475569; }
    .desc { margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #334155; }
    .footer { text-align: center; padding: 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(37,99,235,0.25); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Minha Rotina</h1>
      <p>Lembrete Inteligente da sua Agenda</p>
    </div>
    <div class="body">
      <div class="title-box">
        <h2>${task.title}</h2>
      </div>
      <div class="meta-row">
        <span class="meta-label">📅 Data:</span>
        <span class="meta-value">${formattedDate}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">⏰ Horário:</span>
        <span class="meta-value">${task.startTime}${task.endTime ? ` às ${task.endTime}` : ''}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">🏷️ Prioridade:</span>
        <span class="badge badge-${task.priority}">${priorityName}</span>
      </div>
      ${task.description ? `
      <div class="desc">
        <strong>Descrição:</strong><br/>
        ${task.description.replace(/\n/g, '<br/>')}
      </div>` : ''}
    </div>
    <div class="footer">
      <a href="#" class="btn">Ver tarefa</a>
      <p style="margin-top: 14px; font-size: 11px; color: #94a3b8;">Mensagem enviada automaticamente pelo sistema Minha Rotina.</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, text, html };
}

// Browser notification helper
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export function sendBrowserNotification(task: Task) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(`🔔 Lembrete: ${task.title}`, {
      body: `Horário: ${task.startTime}. ${task.description || 'Sua tarefa está começando em instantes.'}`,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `task-${task.id}`,
    });
  } catch (err) {
    console.error('Failed to trigger browser notification:', err);
  }
}
