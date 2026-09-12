import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTasks();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map(toast => {
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-top-3 ${
              toast.type === 'success'
                ? 'bg-white/95 text-slate-900 border-emerald-200/80 shadow-emerald-500/10'
                : toast.type === 'warning'
                ? 'bg-white/95 text-slate-900 border-amber-200/80 shadow-amber-500/10'
                : toast.type === 'error'
                ? 'bg-white/95 text-slate-900 border-rose-200/80 shadow-rose-500/10'
                : 'bg-white/95 text-slate-900 border-blue-200/80 shadow-blue-500/10'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {toast.title}
              </div>
              {toast.message && (
                <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
