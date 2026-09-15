import React, { useEffect, useState } from 'react';
import { CalendarClock, X } from 'lucide-react';

interface DeferTaskModalProps {
  isOpen: boolean;
  currentDate: string;
  currentStartTime: string;
  onConfirm: (newDate: string, newStartTime: string, reason?: string) => void;
  onCancel: () => void;
}

// Reusable modal that enforces the business rule: a task can only move to "Adiado"
// once a new expected date (and optionally time) has been informed.
export const DeferTaskModal: React.FC<DeferTaskModalProps> = ({
  isOpen,
  currentDate,
  currentStartTime,
  onConfirm,
  onCancel,
}) => {
  const [newDate, setNewDate] = useState(currentDate);
  const [newStartTime, setNewStartTime] = useState(currentStartTime);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewDate(currentDate);
      setNewStartTime(currentStartTime);
      setReason('');
    }
  }, [isOpen, currentDate, currentStartTime]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!newDate) return;
    onConfirm(newDate, newStartTime || currentStartTime, reason.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Adiar Tarefa</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Informe a nova data prevista para esta tarefa. Isso é obrigatório para movê-la para "Adiado".
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[10px] font-bold text-slate-700 block mb-1">Nova Data *</label>
            <input
              type="date"
              required
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-700 block mb-1">Novo Horário</label>
            <input
              type="time"
              value={newStartTime}
              onChange={e => setNewStartTime(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="text-[10px] font-bold text-slate-700 block mb-1">Motivo (opcional)</label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Ex: Conflito de horário"
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!newDate}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-sm transition cursor-pointer bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Adiamento
          </button>
        </div>
      </div>
    </div>
  );
};
