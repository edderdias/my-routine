import React from 'react';

interface LoginWallpaperProps {
  children?: React.ReactNode;
}

export const LoginWallpaper: React.FC<LoginWallpaperProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center items-center bg-[#0d2859]">
      {/* 1. Realistic Serene Lake & Mountain Sunrise Photographic Base */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85"
          alt="Nascer do sol sereno refletindo no lago entre montanhas"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />

        {/* Deep blue color overlay to match Minha Rotina palette from uploaded image */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b2559]/90 via-[#164e9a]/60 to-[#0d2859]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0b2559]/80 via-transparent to-[#38bdf8]/20" />
      </div>

      {/* 2. Vector Artwork Elements Matching 'minha rotina papel.png' */}
      <div className="absolute inset-0 z-1 pointer-events-none select-none">
        <svg
          viewBox="0 0 1920 1080"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Sunrise Warm Light Burst over Lake */}
            <radialGradient id="sunGlowGrad" cx="84%" cy="66%" r="42%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="12%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#fb923c" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0d2859" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="lakeReflectionGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#fde047" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </linearGradient>

            {/* Filter for smooth watermark glow */}
            <filter id="watermarkShadow">
              <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#38bdf8" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Sunrise radial light enhancement */}
          <rect width="1920" height="1080" fill="url(#sunGlowGrad)" />

          {/* Water light glint reflection */}
          <rect x="1420" y="730" width="380" height="350" fill="url(#lakeReflectionGrad)" opacity="0.6" filter="blur(16px)" />

          {/* Giant Calendar Watermark in Sky (Exact Match from Uploaded Image) */}
          <g opacity="0.14" transform="translate(1320, 50) scale(1.4)" filter="url(#watermarkShadow)">
            <rect x="80" y="100" width="340" height="300" rx="52" fill="none" stroke="#ffffff" strokeWidth="28" />
            <rect x="150" y="60" width="36" height="72" rx="18" fill="#ffffff" />
            <rect x="310" y="60" width="36" height="72" rx="18" fill="#ffffff" />
            <circle cx="360" cy="350" r="82" fill="none" stroke="#38bdf8" strokeWidth="26" />
            <path
              d="M 326 350 L 350 374 L 396 324"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      {/* 3. Subtle Vignette and Edge Smoothing */}
      <div className="absolute inset-0 z-2 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-900/30 pointer-events-none" />

      {/* 4. Foreground Content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-10">
        {children}
      </div>
    </div>
  );
};
