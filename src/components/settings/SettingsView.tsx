import React, { useState } from 'react';
import {
  Settings,
  User,
  Phone,
  Mail,
  Bell,
  Download,
  Smartphone,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import { requestBrowserNotificationPermission } from '../../services/notificationService';
import { NotificationChannel, NotificationLeadTime } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { settings, updateSettings, addToast, tasks } = useTasks();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [defaultChannel, setDefaultChannel] = useState<NotificationChannel>(
    settings.defaultNotificationChannel || 'whatsapp'
  );
  const [defaultLeadTime, setDefaultLeadTime] = useState<NotificationLeadTime>(
    settings.defaultLeadTime || '15m'
  );
  const [enableBrowserNotif, setEnableBrowserNotif] = useState(
    settings.enableBrowserNotifications ?? true
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    updateSettings({
      defaultPhone: phone.trim(),
      defaultEmail: email.trim(),
      defaultNotificationChannel: defaultChannel,
      defaultLeadTime,
      enableBrowserNotifications: enableBrowserNotif,
    });
    addToast({ type: 'success', title: 'Configurações salvas com sucesso!' });
  };

  const handleRequestNotificationPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    if (granted) {
      setEnableBrowserNotif(true);
      updateSettings({ enableBrowserNotifications: true });
      addToast({
        type: 'success',
        title: 'Permissão concedida!',
        message: 'Você receberá alertas sonoros e visuais diretamente na tela do dispositivo.',
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Permissão não concedida',
        message: 'Habilite as notificações nas preferências do seu navegador.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 lg:pb-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Configurações & Perfil
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Ajuste suas preferências pessoais, canais de lembrete e instalação do aplicativo
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dados do Usuário</h2>
              <p className="text-[11px] text-slate-500">Seus dados usados no envio dos lembretes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nome de Exibição
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                E-mail Pessoal
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Número do WhatsApp (com DDD)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Os alertas de tarefas com canal WhatsApp serão direcionados para este número.
              </span>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Padrões de Notificação</h2>
              <p className="text-[11px] text-slate-500">Valores iniciais sugeridos ao criar novas tarefas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Canal de Notificação Padrão
              </label>
              <select
                value={defaultChannel}
                onChange={e => setDefaultChannel(e.target.value as NotificationChannel)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="both">Ambos (WhatsApp + E-mail)</option>
                <option value="none">Nenhum</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tempo de Antecedência Padrão
              </label>
              <select
                value={defaultLeadTime}
                onChange={e => setDefaultLeadTime(e.target.value as NotificationLeadTime)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="at_time">No horário da tarefa</option>
                <option value="5m">5 minutos antes</option>
                <option value="10m">10 minutos antes</option>
                <option value="15m">15 minutos antes</option>
                <option value="30m">30 minutos antes</option>
                <option value="1h">1 hora antes</option>
                <option value="2h">2 horas antes</option>
                <option value="1d">1 dia antes</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleRequestNotificationPermission}
              className="py-2.5 px-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Testar / Habilitar Notificações no Navegador</span>
            </button>
          </div>
        </div>

        {/* PWA App Installation Box */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-3xl p-5 sm:p-6 border border-blue-100 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Instalar o Aplicativo Minha Rotina (PWA)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Instale no seu celular, tablet ou computador para abrir em tela cheia com ícone na tela inicial, funcionamento rápido e suporte offline.
              </p>
            </div>
            <PWAInstallButton variant="button" />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
