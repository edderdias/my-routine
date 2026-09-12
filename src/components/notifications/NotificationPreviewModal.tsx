import React, { useState } from 'react';
import { X, Copy, ExternalLink, Check, Phone, Mail } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

export const NotificationPreviewModal: React.FC = () => {
  const { previewModal, setPreviewModal, addToast } = useTasks();
  const [copied, setCopied] = useState(false);

  if (!previewModal || !previewModal.isOpen) return null;

  const { type, task, whatsappMessage, emailSubject, emailHtml } = previewModal;

  const handleCopy = () => {
    const textToCopy = type === 'whatsapp' ? (whatsappMessage || '') : (emailSubject + '\n\n' + (task.description || ''));
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast({ type: 'info', title: 'Copiado para a área de transferência!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const phone = (task.notification.targetPhone || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(whatsappMessage || '');
    const url = phone ? `https://wa.me/55${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-100 my-auto animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${type === 'whatsapp' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              {type === 'whatsapp' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {type === 'whatsapp' ? 'Simulação de Notificação WhatsApp' : 'Simulação de Notificação por E-mail'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Visualização exata da mensagem entregue ao usuário
              </p>
            </div>
          </div>

          <button
            onClick={() => setPreviewModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {type === 'whatsapp' ? (
            /* WhatsApp Chat Bubble Simulation */
            <div className="bg-[#efeae2] p-4 rounded-2xl border border-[#d1d7db] shadow-inner space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 text-center mb-2">
                HOJE &bull; {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>

              <div className="max-w-[85%] ml-auto bg-[#d9fdd3] text-slate-900 rounded-2xl rounded-tr-xs p-3.5 shadow-sm text-xs space-y-2 whitespace-pre-wrap leading-relaxed border border-[#c4eec0]">
                {whatsappMessage}
                <div className="text-[10px] text-slate-500 text-right font-medium flex items-center justify-end gap-1 mt-1">
                  <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-blue-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          ) : (
            /* Email Card Simulation */
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-[11px] text-slate-500">De: <strong>Minha Rotina &lt;notificacoes@minharotina.com.br&gt;</strong></div>
                <div className="text-[11px] text-slate-500">Para: <strong>{task.notification.targetEmail || 'seu-email@exemplo.com'}</strong></div>
                <div className="text-xs font-bold text-slate-900 mt-1">Assunto: {emailSubject}</div>
              </div>

              <div
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
                dangerouslySetInnerHTML={{ __html: emailHtml || '' }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2 px-3.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado' : 'Copiar Conteúdo'}</span>
          </button>

          {type === 'whatsapp' ? (
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Abrir WhatsApp Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPreviewModal(null)}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              Concluído
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
