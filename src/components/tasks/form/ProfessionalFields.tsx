import React, { useState } from 'react';
import { Calendar, User, Briefcase, FileText, Plus, Check, X } from 'lucide-react';
import { WorkType } from '../../../types';

export interface ProfessionalFieldsState {
  requestDate: string;
  requestedBy: string;
  workTypeId: string;
  summary: string;
}

interface ProfessionalFieldsProps {
  value: ProfessionalFieldsState;
  onChange: (updates: Partial<ProfessionalFieldsState>) => void;
  workTypes: WorkType[];
  onCreateWorkType: (name: string) => Promise<WorkType>;
}

const inputClass = 'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition';
const labelClass = 'block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5';

export const ProfessionalFields: React.FC<ProfessionalFieldsProps> = ({ value, onChange, workTypes, onCreateWorkType }) => {
  const [addingNewType, setAddingNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const handleConfirmNewType = async () => {
    const cleanName = newTypeName.trim();
    if (!cleanName) return;
    const created = await onCreateWorkType(cleanName);
    onChange({ workTypeId: created.id });
    setAddingNewType(false);
    setNewTypeName('');
  };

  return (
    <div className="p-4 bg-gradient-to-br from-amber-50/60 to-amber-50/20 border border-amber-100 rounded-2xl space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Data da Solicitação *</span>
          </label>
          <input
            type="date"
            required
            value={value.requestDate}
            onChange={e => onChange({ requestDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <User className="w-3.5 h-3.5 text-amber-600" />
            <span>Quem Fez a Solicitação *</span>
          </label>
          <input
            type="text"
            required
            value={value.requestedBy}
            onChange={e => onChange({ requestedBy: e.target.value })}
            placeholder="Nome do solicitante"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          <Briefcase className="w-3.5 h-3.5 text-amber-600" />
          <span>Tipo de Trabalho *</span>
        </label>

        {!addingNewType ? (
          <div className="flex flex-wrap gap-2">
            {workTypes.map(wt => (
              <button
                key={wt.id}
                type="button"
                onClick={() => onChange({ workTypeId: wt.id })}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  value.workTypeId === wt.id
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {wt.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAddingNewType(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-dashed border-amber-300 bg-white text-amber-700 hover:bg-amber-50 transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Outros</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              placeholder="Nome do novo tipo de trabalho"
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleConfirmNewType}
              title="Confirmar novo tipo"
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setAddingNewType(false); setNewTypeName(''); }}
              title="Cancelar"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>
          <FileText className="w-3.5 h-3.5 text-amber-600" />
          <span>Resumo da Solicitação</span>
        </label>
        <textarea
          rows={2}
          value={value.summary}
          onChange={e => onChange({ summary: e.target.value })}
          placeholder="Detalhes sobre o que precisa ser feito..."
          className={`${inputClass} resize-none`}
        />
      </div>
    </div>
  );
};
