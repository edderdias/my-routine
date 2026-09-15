import type { Priority, Task } from './types';

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'low': return 'Baixa';
    case 'normal': return 'Normal';
    case 'high': return 'Alta';
    case 'urgent': return 'Urgente';
    default: return 'Normal';
  }
}

export function formatWhatsAppMessage(task: Task): string {
  const [y, m, d] = task.date.split('-');
  const formattedDate = `${d}/${m}/${y}`;

  return `🔔 *Lembrete de tarefa*

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
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">Mensagem enviada automaticamente pelo sistema Minha Rotina.</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, text, html };
}
