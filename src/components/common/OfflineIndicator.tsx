import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/95 text-white px-4 py-2 text-xs font-medium shadow-xl border border-slate-700/80 backdrop-blur-md animate-bounce"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Modo Offline &bull; Visualizando dados sincronizados no dispositivo.</span>
    </div>
  );
};
