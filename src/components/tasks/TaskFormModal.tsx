import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Bell,
  Repeat,
  FileText,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import {
  Category,
  NotificationChannel,
  NotificationLeadTime,
  Priority,
  RecurrenceRule,
  Status,
  Task
} from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const TaskFormModal: React.FC = () => {
  const { user } = useAuth();
  const {
    isTaskFormOpen,
    setIsTaskFormOpen,
    editingTask,
    setEditingTask,
    categories,
    settings,
    addTask,
    updateTask,
    selectedDate,
  } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate || new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [hasEndTime, setHasEndTime] = useState(false);
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState<Priority>('normal');
  const [status, setStatus] = useState<Status>('pending');
  const [categoryId, setCategoryId] = useState<string>('cat-trabalho');

  // Notification configuration
  const [notificationChannel, setNotificationChannel] = useState<NotificationChannel>(
    settings.defaultNotificationChannel || 'whatsapp'
  );
  const [leadTime, setLeadTime] = useState<NotificationLeadTime>(
    settings.defaultLeadTime || '15m'
  );
  const [customMinutes, setCustomMinutes] = useState<number>(20);
  const [targetPhone, setTargetPhone] = useState(user?.phone || settings.defaultPhone || '');
  const [targetEmail, setTargetEmail] = useState(user?.email || settings.defaultEmail || '');

  // Recurrence
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('none');

  // Recurrence confirmation prompt
  const [showRecurrencePrompt, setShowRecurrencePrompt] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Task> | null>(null);

  // Populate when editing or opening
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDate(editingTask.date);
      setStartTime(editingTask.startTime);
      setHasEndTime(!!editingTask.endTime);
      setEndTime(editingTask.endTime || '10:00');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setCategoryId(editingTask.categoryId);
      setNotificationChannel(editingTask.notification.channel);
      setLeadTime(editingTask.notification.leadTime);
      setCustomMinutes(editingTask.notification.customMinutes || 20);
      setTargetPhone(editingTask.notification.targetPhone || user?.phone || '');
      setTargetEmail(editingTask.notification.targetEmail || user?.email || '');
      setRecurrenceRule(editingTask.recurrence.rule);
    } else {
      // New task default
      setTitle('');
      setDescription('');
      setDate(selectedDate || new Date().toISOString().slice(0, 10));
      
      // Default start time to current rounded time + 30 min
      const now = new Date();
      now.setMinutes(Math.ceil((now.getMinutes() + 15) / 15) * 15);
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setStartTime(`${h}:${m}`);
      
      // Default end time + 1 hour
      now.setHours(now.getHours() + 1);
      const eh = String(now.getHours()).padStart(2, '0');
      setEndTime(`${eh}:${m}`);
      setHasEndTime(false);

      setPriority('normal');
      setStatus('pending');
      setCategoryId(categories[0]?.id || 'cat-trabalho');
      setNotificationChannel(settings.defaultNotificationChannel || 'whatsapp');
      setLeadTime(settings.defaultLeadTime || '15m');
      setCustomMinutes(20);
      setTargetPhone(user?.phone || settings.defaultPhone || '');
      setTargetEmail(user?.email || settings.defaultEmail || '');
      setRecurrenceRule('none');
    }
  }, [editingTask, isTaskFormOpen, selectedDate, categories, settings, user]);

  if (!isTaskFormOpen) return null;

  const handleClose = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime: hasEndTime ? endTime : undefined,
      durationType: hasEndTime ? ('minutes' as const) : ('none' as const),
      priority,
      status,
      categoryId,
      notification: {
        channel: notificationChannel,
        leadTime,
        customMinutes: leadTime === 'custom' ? Number(customMinutes) : undefined,
        targetPhone: (notificationChannel === 'whatsapp' || notificationChannel === 'both') ? targetPhone.trim() : undefined,
        targetEmail: (notificationChannel === 'email' || notificationChannel === 'both') ? targetEmail.trim() : undefined,
      },
      recurrence: {
        rule: recurrenceRule,
      },
    };

    if (editingTask) {
      // Check if it's a recurring task occurrence
      if (editingTask.recurrence.rule !== 'none' || editingTask.recurrence.isOccurrence) {
        setPendingUpdates(taskPayload);
        setShowRecurrencePrompt(true);
        return;
      }

      updateTask(editingTask.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    handleClose();
  };

  const handleConfirmRecurrenceChoice = (scope: 'only_this' | 'all') => {
    if (editingTask && pendingUpdates) {
      updateTask(editingTask.id, pendingUpdates, scope);
    }
    setShowRecurrencePrompt(false);
    handleClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
        <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-100 my-auto animate-in zoom-in-95 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <p className="text-xs text-slate-500">
                Organize seu compromisso e defina como deseja ser lembrado
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Título do Compromisso ou Tarefa *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Reunião com cliente, Treino na academia..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Date & Start Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Data *</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Horário de Início *</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Optional End Time */}
            <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasEndTime}
                    onChange={e => setHasEndTime(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                  />
                  <span>Definir horário de término (opcional)</span>
                </label>
              </div>

              {hasEndTime && (
                <div className="pt-2 animate-in fade-in">
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              )}
            </div>

            {/* Priority & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Prioridade *</span>
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Categoria *</span>
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status (especially when editing) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status da Tarefa
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: 'pending', label: 'Pendente', color: 'text-blue-700 border-blue-200 bg-blue-50' },
                  { val: 'in_progress', label: 'Em curso', color: 'text-amber-700 border-amber-200 bg-amber-50' },
                  { val: 'completed', label: 'Concluída', color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
                  { val: 'canceled', label: 'Cancelada', color: 'text-slate-600 border-slate-200 bg-slate-100' },
                ].map(st => (
                  <button
                    key={st.val}
                    type="button"
                    onClick={() => setStatus(st.val as Status)}
                    className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                      status === st.val
                        ? `${st.color} shadow-xs ring-2 ring-blue-500/20`
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Configuration Card */}
            <div className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/40 border border-blue-100 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Configuração de Lembrete</h4>
                  <p className="text-[11px] text-slate-500">Escolha o canal e a antecedência do aviso</p>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'whatsapp', label: 'WhatsApp', icon: <Phone className="w-3.5 h-3.5" /> },
                  { id: 'email', label: 'E-mail', icon: <Mail className="w-3.5 h-3.5" /> },
                  { id: 'both', label: 'Ambos', icon: <Sparkles className="w-3.5 h-3.5" /> },
                  { id: 'none', label: 'Nenhum', icon: <X className="w-3.5 h-3.5" /> },
                ].map(ch => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setNotificationChannel(ch.id as NotificationChannel)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      notificationChannel === ch.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {ch.icon}
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>

              {notificationChannel !== 'none' && (
                <div className="space-y-3 pt-1 animate-in fade-in">
                  {/* Lead Time */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tempo de Antecedência
                    </label>
                    <select
                      value={leadTime}
                      onChange={e => setLeadTime(e.target.value as NotificationLeadTime)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                      <option value="at_time">No horário da tarefa</option>
                      <option value="5m">5 minutos antes</option>
                      <option value="10m">10 minutos antes</option>
                      <option value="15m">15 minutos antes</option>
                      <option value="30m">30 minutos antes</option>
                      <option value="1h">1 hora antes</option>
                      <option value="2h">2 horas antes</option>
                      <option value="1d">1 dia antes</option>
                      <option value="custom">Personalizado (minutos)</option>
                    </select>
                  </div>

                  {leadTime === 'custom' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Minutos de antecedência:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={customMinutes}
                        onChange={e => setCustomMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                  )}

                  {/* Recipient info */}
                  {(notificationChannel === 'whatsapp' || notificationChannel === 'both') && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        WhatsApp de Destino
                      </label>
                      <input
                        type="tel"
                        value={targetPhone}
                        onChange={e => setTargetPhone(e.target.value)}
                        placeholder="(11) 98765-4321"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  )}

                  {(notificationChannel === 'email' || notificationChannel === 'both') && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        E-mail de Destino
                      </label>
                      <input
                        type="email"
                        value={targetEmail}
                        onChange={e => setTargetEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recurrence Selector */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-blue-500" />
                <span>Recorrência da Tarefa</span>
              </label>
              <select
                value={recurrenceRule}
                onChange={e => setRecurrenceRule(e.target.value as RecurrenceRule)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="none">Não se repete</option>
                <option value="daily">Diariamente</option>
                <option value="workdays">Dias úteis (Segunda a Sexta)</option>
                <option value="weekly">Semanalmente</option>
                <option value="biweekly">Quinzenalmente</option>
                <option value="monthly">Mensalmente</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Descrição e Detalhes</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Adicione notas, links ou detalhes importantes sobre a atividade..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              id="save-task-btn"
              className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </div>
      </div>

      {/* Recurrence Choice Modal */}
      <ConfirmationModal
        isOpen={showRecurrencePrompt}
        title="Tarefa Recorrente"
        message="Esta tarefa faz parte de uma série recorrente. Como deseja aplicar as alterações?"
        confirmLabel="Todas as Ocorrências"
        secondaryOptionLabel="Somente Esta Ocorrência"
        cancelLabel="Cancelar"
        onConfirm={() => handleConfirmRecurrenceChoice('all')}
        onSecondaryOption={() => handleConfirmRecurrenceChoice('only_this')}
        onCancel={() => setShowRecurrencePrompt(false)}
      />
    </>
  );
};
