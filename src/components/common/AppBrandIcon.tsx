import React from 'react';

interface AppBrandIconProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const AppBrandIcon: React.FC<AppBrandIconProps> = ({ className = '', size = 40, showText = false }) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 rounded-2xl overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* SVG app icon reproducing minha rotina icone.png */}
        <svg viewBox="0 0 512 512" width="100%" height="100%" className="w-full h-full">
          <defs>
            <linearGradient id="iconBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#0f2b7a" />
            </linearGradient>
            <linearGradient id="iconHdrGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="iconBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="iconSoftShadow">
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0f172a" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Squircle Base */}
          <rect x="16" y="16" width="480" height="480" rx="108" ry="108" fill="url(#iconBgGrad)" />

          {/* Calendar White Card */}
          <g filter="url(#iconSoftShadow)">
            <rect x="94" y="116" width="324" height="290" rx="44" fill="#ffffff" />
            <path d="M 94 160 C 94 135 115 116 140 116 L 372 116 C 397 116 418 135 418 160 L 418 184 L 94 184 Z" fill="url(#iconHdrGrad)" />
            <rect x="118" y="206" width="276" height="176" rx="24" fill="#f8fafc" />

            {/* Grid blocks */}
            <rect x="144" y="234" width="46" height="42" rx="10" fill="#3b82f6" opacity="0.85" />
            <rect x="214" y="234" width="46" height="42" rx="10" fill="#3b82f6" opacity="0.85" />
            <rect x="284" y="234" width="46" height="42" rx="10" fill="#3b82f6" opacity="0.85" />

            <rect x="144" y="298" width="46" height="42" rx="10" fill="#3b82f6" opacity="0.85" />
            <rect x="214" y="298" width="46" height="42" rx="10" fill="#3b82f6" opacity="0.85" />
            <rect x="284" y="298" width="46" height="42" rx="10" fill="#3b82f6" opacity="0.4" />

            {/* Ring Lugs */}
            <rect x="160" y="86" width="34" height="64" rx="17" fill="#dbeafe" stroke="#2563eb" strokeWidth="2" />
            <rect x="318" y="86" width="34" height="64" rx="17" fill="#dbeafe" stroke="#2563eb" strokeWidth="2" />
          </g>

          {/* Cyan Circle Badge with Checkmark */}
          <circle cx="366" cy="358" r="86" fill="url(#iconBadgeGrad)" stroke="#ffffff" strokeWidth="12" />
          <path d="M 326 358 L 354 386 L 410 326" fill="none" stroke="#ffffff" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
            Minha <span className="text-blue-600">Rotina</span>
          </span>
          <span className="text-[11px] font-medium text-slate-500 tracking-wide mt-1">
            Agenda Pessoal Digital
          </span>
        </div>
      )}
    </div>
  );
};
