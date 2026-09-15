import React from 'react';
import { MapPin, User, Users, FileText, Presentation } from 'lucide-react';
import { CongregationalActivityType } from '../../../types';
import { CONGREGATIONAL_ACTIVITY_LABELS } from '../../../utils/taskTypeVisuals';

export interface CongregationalFieldsState {
  activityType: CongregationalActivityType;
  location: string;
  summary: string;
  personName: string;
  visitedPerson: string;
  companion: string;
  theme: string;
}

interface CongregationalFieldsProps {
  value: CongregationalFieldsState;
  onChange: (updates: Partial<CongregationalFieldsState>) => void;
}

const ACTIVITY_OPTIONS: CongregationalActivityType[] = ['visit', 'meeting', 'commission', 'speech', 'event'];

const inputClass = 'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition';
const labelClass = 'block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5';

export const CongregationalFields: React.FC<CongregationalFieldsProps> = ({ value, onChange }) => {
  const { activityType } = value;

  return (
    <div className="p-4 bg-gradient-to-br from-indigo-50/60 to-indigo-50/20 border border-indigo-100 rounded-2xl space-y-3">
      <div>
        <label className={labelClass}>
          <Presentation className="w-3.5 h-3.5 text-indigo-500" />
          <span>Tipo de Atividade Congregacional *</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {ACTIVITY_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ activityType: opt })}
              className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                activityType === opt
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {CONGREGATIONAL_ACTIVITY_LABELS[opt]}
            </button>
          ))}
        </div>
      </div>

      {/* Location - common to all congregational activities */}
      <div>
        <label className={labelClass}>
          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
          <span>Local *</span>
        </label>
        <input
          type="text"
          required
          value={value.location}
          onChange={e => onChange({ location: e.target.value })}
          placeholder="Ex: Salão do Reino, Residência..."
          className={inputClass}
        />
      </div>

      {/* Commission: person name */}
      {activityType === 'commission' && (
        <div>
          <label className={labelClass}>
            <User className="w-3.5 h-3.5 text-indigo-500" />
            <span>Nome da Pessoa *</span>
          </label>
          <input
            type="text"
            required
            value={value.personName}
            onChange={e => onChange({ personName: e.target.value })}
            placeholder="Nome relacionado à comissão"
            className={inputClass}
          />
        </div>
      )}

      {/* Visit: visited person + companion */}
      {activityType === 'visit' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pessoa Visitada *</span>
            </label>
            <input
              type="text"
              required
              value={value.visitedPerson}
              onChange={e => onChange({ visitedPerson: e.target.value })}
              placeholder="Nome de quem será visitado"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>Acompanhante</span>
            </label>
            <input
              type="text"
              value={value.companion}
              onChange={e => onChange({ companion: e.target.value })}
              placeholder="Nome do acompanhante"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Speech: theme */}
      {activityType === 'speech' && (
        <div>
          <label className={labelClass}>
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tema / Título do Discurso *</span>
          </label>
          <input
            type="text"
            required
            value={value.theme}
            onChange={e => onChange({ theme: e.target.value })}
            placeholder="Ex: A importância da perseverança"
            className={inputClass}
          />
        </div>
      )}

      {/* Summary - meeting/visit/speech/event */}
      {activityType !== 'commission' && (
        <div>
          <label className={labelClass}>
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>Resumo{activityType === 'speech' ? ' / Observações' : ''}</span>
          </label>
          <textarea
            rows={2}
            value={value.summary}
            onChange={e => onChange({ summary: e.target.value })}
            placeholder="Resumo do que será tratado..."
            className={`${inputClass} resize-none`}
          />
        </div>
      )}
    </div>
  );
};
