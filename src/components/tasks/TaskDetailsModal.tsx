import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Bell,
  Repeat,
  CheckCircle2,
  Edit2,
  Copy,
  Trash2,
  History,
  Send,
  Phone,
  Mail,
  CalendarClock,
  MapPin,
  User,
  Briefcase
} from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { getLeadTimeLabel, getPriorityLabel } from '../../services/notificationService';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { DeferTaskModal } from './DeferTaskModal';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TASK_TYPE_COLORS,
  TASK_TYPE_LABELS,
  getCongregationalActivityLabel,
} from '../../utils/taskTypeVisuals';

export const TaskDetailsModal: React.FC = () => {
  const {
    viewingTask,
    setViewingTask,
    setEditingTask,
    setIsTaskFormOpen,
    toggleComplete,
    deleteTask,
    duplicateTask,
    triggerNotificationNow,
    rescheduleTask,
    deferTask,
    categories,
    workTypes,
  } = useTasks();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleTime, setNewRescheduleTime] = useState('');
  const [showDeferModal, setShowDeferModal] = useState(false);

  if (!viewingTask) return null;

  const category = categories.find(c => c.id === viewingTask.categoryId);
  const taskType = viewingTask.taskType || 'personal';
  const workType = viewingTask.professional ? workTypes.find(w => w.id === viewingTask.professional?.workTypeId) : undefined;
  const displayStatus = viewingTask.status;

  const handleConfirmDefer = (newDate: string, newStartTime: string, reason?: string) => {
    deferTask(viewingTask.id, newDate, newStartTime, reason);
    setShowDeferModal(false);
    setViewingTask(null);
  };

  const handleEdit = () => {
    setEditingTask(viewingTask);
    setViewingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleDelete = () => {
    deleteTask(viewingTask.id);
    setShowDeleteConfirm(false);
    setViewingTask(null);
  };

  const handleDuplicate = () => {
    duplicateTask(viewingTask.id);
    setViewingTask(null);
  };

  const handleOpenReschedule = () => {
    setNewRescheduleDate(viewingTask.date);
    setNewRescheduleTime(viewingTask.startTime);
    setShowRescheduleForm(true);
  };

  const handleConfirmReschedule = () => {
    if (newRescheduleDate && newRescheduleTime) {
      rescheduleTask(viewingTask.id, newRescheduleDate, newRescheduleTime);
      setShowRescheduleForm(false);
      setViewingTask(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
        <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-100 my-auto animate-in zoom-in-95 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${TASK_TYPE_COLORS[taskType].bg} ${TASK_TYPE_COLORS[taskType].text}`}>
                  {TASK_TYPE_LABELS[taskType]}
                </span>

                {viewingTask.congregational && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                    {getCongregationalActivityLabel(viewingTask.congregational.activityType)}
                  </span>
                )}

                {workType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    <Briefcase className="w-3 h-3" />
                    {workType.name}
                  </span>
                )}

                {category && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: category.color }}
                  >
                    <Tag className="w-3 h-3" />
                    {category.name}
                  </span>
                )}

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    viewingTask.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-700'
                      : viewingTask.priority === 'high'
                      ? 'bg-amber-100 text-amber-800'
                      : viewingTask.priority === 'low'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  Prioridade {getPriorityLabel(viewingTask.priority)}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_COLORS[displayStatus].bg} ${STATUS_COLORS[displayStatus].text}`}>
                  {STATUS_LABELS[displayStatus]}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 pt-1 leading-tight">
                {viewingTask.title}
              </h2>
            </div>

            <button
              onClick={() => setViewingTask(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Details Scrollable Body */}
          <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4 text-xs text-slate-700">
            {/* Date & Time Pill Box */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Data</div>
                  <div className="text-xs font-bold text-slate-800">
                    {viewingTask.date.split('-').reverse().join('/')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Horário</div>
                  <div className="text-xs font-bold text-slate-800">
                    {viewingTask.startTime}
                    {viewingTask.endTime ? ` às ${viewingTask.endTime}` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Congregational-specific details */}
            {viewingTask.congregational && (
              <div className="space-y-2 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[11px]">
                {viewingTask.congregational.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span><strong>Local:</strong> {viewingTask.congregational.location}</span>
                  </div>
                )}
                {viewingTask.congregational.visitedPerson && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span><strong>Pessoa visitada:</strong> {viewingTask.congregational.visitedPerson}</span>
                  </div>
                )}
                {viewingTask.congregational.companion && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span><strong>Acompanhante:</strong> {viewingTask.congregational.companion}</span>
                  </div>
                )}
                {viewingTask.congregational.personName && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span><strong>Nome:</strong> {viewingTask.congregational.personName}</span>
                  </div>
                )}
                {viewingTask.congregational.theme && (
                  <div><strong>Tema:</strong> {viewingTask.congregational.theme}</div>
                )}
                {viewingTask.congregational.summary && (
                  <div><strong>Resumo:</strong> {viewingTask.congregational.summary}</div>
                )}
              </div>
            )}

            {/* Professional-specific details */}
            {viewingTask.professional && (
              <div className="space-y-2 p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl text-[11px]">
                <div><strong>Data da solicitação:</strong> {viewingTask.professional.requestDate.split('-').reverse().join('/')}</div>
                <div><strong>Solicitado por:</strong> {viewingTask.professional.requestedBy}</div>
                {workType && <div><strong>Tipo de trabalho:</strong> {workType.name}</div>}
                {viewingTask.professional.summary && (
                  <div><strong>Resumo:</strong> {viewingTask.professional.summary}</div>
                )}
              </div>
            )}

            {/* Description */}
            {viewingTask.description && (
              <div className="space-y-1.5">
                <span className="font-bold text-slate-900">Descrição</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {viewingTask.description}
                </div>
              </div>
            )}

            {/* Notification Information */}
            <div className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900">Notificação & Lembrete</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                  {viewingTask.notification.channel}
                </span>
              </div>

              {viewingTask.notification.channel !== 'none' ? (
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div>
                    <strong className="text-slate-700">Antecedência:</strong>{' '}
                    {getLeadTimeLabel(viewingTask.notification.leadTime, viewingTask.notification.customMinutes)}
                  </div>
                  {viewingTask.notification.targetPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{viewingTask.notification.targetPhone}</span>
                    </div>
                  )}
                  {viewingTask.notification.targetEmail && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-blue-600" />
                      <span>{viewingTask.notification.targetEmail}</span>
                    </div>
                  )}
                  {viewingTask.notification.scheduledFor && (
                    <div className="text-[10px] text-slate-500 pt-1">
                      Programado para:{' '}
                      {new Date(viewingTask.notification.scheduledFor).toLocaleString('pt-BR')}
                    </div>
                  )}

                  {/* Instant test trigger */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => triggerNotificationNow(viewingTask.id)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Simular Envio do Lembrete Agora</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">Nenhum lembrete configurado para esta tarefa.</p>
              )}
            </div>

            {/* Recurrence rule */}
            {viewingTask.recurrence.rule !== 'none' && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 text-purple-800 rounded-xl border border-purple-100 text-xs">
                <Repeat className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  Tarefa recorrente:{' '}
                  <strong>
                    {viewingTask.recurrence.rule === 'daily' && 'Diariamente'}
                    {viewingTask.recurrence.rule === 'workdays' && 'Dias úteis (Seg a Sex)'}
                    {viewingTask.recurrence.rule === 'weekly' && 'Semanalmente'}
                    {viewingTask.recurrence.rule === 'biweekly' && 'Quinzenalmente'}
                    {viewingTask.recurrence.rule === 'monthly' && 'Mensalmente'}
                  </strong>
                </span>
              </div>
            )}

            {/* Reschedule inline drawer */}
            {showRescheduleForm && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-amber-600" />
                    <span>Reagendar Tarefa</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRescheduleForm(false)}
                    className="text-amber-700 hover:text-amber-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-amber-800">Nova Data</label>
                    <input
                      type="date"
                      value={newRescheduleDate}
                      onChange={e => setNewRescheduleDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-amber-800">Novo Horário</label>
                    <input
                      type="time"
                      value={newRescheduleTime}
                      onChange={e => setNewRescheduleTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition"
                >
                  Confirmar Reagendamento
                </button>
              </div>
            )}

            {/* History & Logs Audit Trail */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Histórico de Alterações</span>
              </span>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {viewingTask.history && viewingTask.history.length > 0 ? (
                  viewingTask.history.map(item => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between text-[11px] p-2 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <span className="text-slate-700 font-medium">{item.action}</span>
                      <span className="text-slate-400 text-[10px] shrink-0 ml-2">
                        {new Date(item.timestamp).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400">Nenhum evento registrado.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
            {/* Complete toggle */}
            <button
              type="button"
              onClick={() => toggleComplete(viewingTask.id)}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                viewingTask.status === 'completed'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{viewingTask.status === 'completed' ? 'Reabrir Tarefa' : 'Concluir'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowDeferModal(true)}
                title="Adiar tarefa"
                className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <CalendarClock className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleOpenReschedule}
                title="Reagendar (sem marcar como adiado)"
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <Clock className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDuplicate}
                title="Duplicar"
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleEdit}
                title="Editar"
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                title="Excluir"
                className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir a tarefa "${viewingTask.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Defer ("Adiado") Modal */}
      <DeferTaskModal
        isOpen={showDeferModal}
        currentDate={viewingTask.date}
        currentStartTime={viewingTask.startTime}
        onConfirm={handleConfirmDefer}
        onCancel={() => setShowDeferModal(false)}
      />
    </>
  );
};
