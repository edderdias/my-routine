import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'compact' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, suppress
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'sidebar') {
      return (
        <button
          onClick={install}
          id="pwa-install-sidebar-btn"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer"
        >
          <div className="p-1 bg-white/20 rounded-lg">
            <Download className="w-4 h-4" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="truncate font-bold">Instalar Aplicativo</div>
            <div className="text-[10px] text-blue-100 truncate">Acesso rápido e offline</div>
          </div>
        </button>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          onClick={install}
          id="pwa-install-compact-btn"
          title="Instalar Minha Rotina"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        id="pwa-install-header-btn"
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          id="pwa-install-ios-btn"
          className={
            variant === 'sidebar'
              ? 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition cursor-pointer'
              : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium transition cursor-pointer'
          }
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Instalar no iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] shrink-0">1</span>
                  <p>Abra este site no navegador <strong>Safari</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] shrink-0">2</span>
                  <p>Toque no botão de <strong>Compartilhar</strong> (ícone de quadrado com seta para cima).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] shrink-0">3</span>
                  <p>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
