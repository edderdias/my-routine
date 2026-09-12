import React from 'react';
import {
  Bell,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { NotificationLog } from '../../types';

export const NotificationsCenterView: React.FC = () => {
  const { logs, tasks, triggerNotificationNow, setPreviewModal } = useTasks();

  const handleOpenLogPreview = (log: NotificationLog) => {
    const task = tasks.find(t => t.id === log.taskId) || {
      id: log.taskId,
      userId: 'user',
      title: log.taskTitle,
      date: new Date().toISOString().slice(0, 10),
      startTime: '10:00',
      priority: 'normal' as const,
      status: 'pending' as const,
      categoryId: 'cat-trabalho',
      notification: {
        channel: log.channel,
        leadTime: '15m' as const,
      },
      recurrence: { rule: 'none' as const },
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPreviewModal({
      isOpen: true,
      type: log.channel === 'email' ? 'email' : 'whatsapp',
      task,
      whatsappMessage: log.previewBody,
      emailSubject: log.previewTitle || `Lembrete: ${log.taskTitle}`,
      emailHtml: undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 lg:pb-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Central de Lembretes & Logs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Serviço Ativo</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Histórico auditável de disparos de lembretes via WhatsApp e E-mail
          </p>
        </div>
      </div>

      {/* Integration Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WhatsApp Service Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Cloud API Gateway</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                Conectado
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dispara mensagens instantâneas e personalizadas com texto formatado, data, horário e prioridade da tarefa.
            </p>
          </div>
        </div>

        {/* Email Service Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">SMTP / Resend Email Engine</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                Pronto
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Templates responsivos HTML com botões de chamada e resumo detalhado da agenda.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Histórico de Notificações Enviadas ({logs.length})
            </h3>
            <p className="text-xs text-slate-500">
              Registro cronológico de todas as mensagens processadas pelo agendador
            </p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nenhuma notificação foi disparada ainda. Configure uma tarefa com lembrete ou use o botão de simulação para testar o envio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">Tarefa</th>
                  <th className="py-3 px-3">Canal</th>
                  <th className="py-3 px-3">Destinatário</th>
                  <th className="py-3 px-3">Enviado em</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {log.taskTitle}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.channel === 'whatsapp'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {log.channel === 'whatsapp' ? <Phone className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                        <span className="capitalize">{log.channel}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {log.recipient}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(log.sentTime).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Entregue</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleOpenLogPreview(log)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Mensagem</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
