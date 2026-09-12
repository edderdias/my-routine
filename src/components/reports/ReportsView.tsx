import React, { useMemo } from 'react';
import { BarChart3, CheckCircle2, Clock, AlertTriangle, TrendingUp, Tag, Calendar } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

export const ReportsView: React.FC = () => {
  const { tasks, categories } = useTasks();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // By Priority
    const byPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      normal: tasks.filter(t => t.priority === 'normal').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    // By Category
    const byCategory = categories.map(cat => ({
      name: cat.name,
      color: cat.color,
      count: tasks.filter(t => t.categoryId === cat.id).length,
      completed: tasks.filter(t => t.categoryId === cat.id && t.status === 'completed').length,
    })).sort((a, b) => b.count - a.count);

    return {
      total,
      completed,
      overdue,
      pending,
      completionRate,
      byPriority,
      byCategory,
    };
  }, [tasks, categories]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 lg:pb-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Relatórios & Produtividade
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Estatísticas consolidadas da sua rotina pessoal e pontualidade
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tarefas Cadastradas</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {stats.total}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Desde a criação da conta</span>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Taxa de Conclusão</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
            {stats.completionRate}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {stats.completed} tarefas concluídas
          </span>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tarefas Pendentes</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-2">
            {stats.pending}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Aguardando realização</span>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tarefas Atrasadas</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">
            {stats.overdue}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Necessitam atenção</span>
        </div>
      </div>

      {/* Two Column Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <span>Distribuição por Categoria</span>
          </h3>

          <div className="space-y-3">
            {stats.byCategory.map(cat => {
              const pct = stats.total > 0 ? Math.round((cat.count / stats.total) * 100) : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-bold text-slate-800">{cat.name}</span>
                    </div>
                    <span className="text-slate-500 font-medium">
                      {cat.count} tarefas ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Distribuição por Nível de Prioridade</span>
          </h3>

          <div className="space-y-4">
            {[
              { label: 'Urgente', count: stats.byPriority.urgent, color: 'bg-rose-500', text: 'text-rose-700' },
              { label: 'Alta', count: stats.byPriority.high, color: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'Normal', count: stats.byPriority.normal, color: 'bg-blue-500', text: 'text-blue-700' },
              { label: 'Baixa', count: stats.byPriority.low, color: 'bg-slate-400', text: 'text-slate-700' },
            ].map(p => {
              const pct = stats.total > 0 ? Math.round((p.count / stats.total) * 100) : 0;
              return (
                <div key={p.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${p.text}`}>{p.label}</span>
                    <span className="text-slate-500 font-medium">
                      {p.count} tarefas ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${p.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
