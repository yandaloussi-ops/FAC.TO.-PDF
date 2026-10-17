import React from 'react';

interface FacLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FacLogo: React.FC<FacLogoProps> = ({
  className = '',
  showSubtitle = true,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const tagSize = size === 'sm' ? 'text-[10px] px-1 py-0.2' : 'text-[11px] px-1.5 py-0.5';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Bespoke Emblem / Insignia SVG */}
      <div className={`relative ${iconSize} shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950 p-1.5 shadow-md border border-amber-500/40 ring-1 ring-amber-400/20 group-hover:border-amber-400 transition-all`}>
        {/* Ambient background glow inside the icon box */}
        <div className="absolute inset-0 rounded-xl bg-radial from-amber-500/20 via-transparent to-transparent pointer-events-none" />

        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-sm"
        >
          {/* Outer Academic Shield / Crest Outline */}
          <path
            d="M22 2.5L6 7.5V19.5C6 29.5 13 38.5 22 41.5C31 38.5 38 29.5 38 19.5V7.5L22 2.5Z"
            fill="url(#crestGrad)"
            stroke="url(#goldBorder)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Academic Mortarboard Graduation Cap at top */}
          <path
            d="M22 7.5L13 11.5L22 15.5L31 11.5L22 7.5Z"
            fill="#F59E0B"
            fillOpacity="0.9"
          />
          <path
            d="M31 11.5V16"
            stroke="#FDE68A"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="31" cy="16.5" r="1" fill="#FDE68A" />

          {/* Open Academic Textbook with Golden Turning Pages */}
          {/* Left Page */}
          <path
            d="M11 29C14.5 27.5 18.5 27.5 21.5 29V17C18.5 15.5 14.5 15.5 11 17V29Z"
            fill="url(#leftPageGrad)"
          />
          {/* Right Page */}
          <path
            d="M33 29C29.5 27.5 25.5 27.5 22.5 29V17C25.5 15.5 29.5 15.5 33 17V29Z"
            fill="url(#rightPageGrad)"
          />

          {/* Book Spine Line */}
          <path
            d="M22 17V29"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Digital PDF DRM Protected Core: Shield Keyhole */}
          <rect
            x="19"
            y="31.5"
            width="6"
            height="5"
            rx="1.2"
            fill="#F59E0B"
            stroke="#78350F"
            strokeWidth="0.8"
          />
          <path
            d="M20.2 31.5V30.2C20.2 29.2 21 28.5 22 28.5C23 28.5 23.8 29.2 23.8 30.2V31.5"
            stroke="#FDE68A"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="22" cy="33.5" r="0.8" fill="#1C1917" />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="crestGrad" x1="6" y1="2.5" x2="38" y2="41.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1C1917" />
              <stop offset="0.55" stopColor="#0C0A09" />
              <stop offset="1" stopColor="#451A03" />
            </linearGradient>

            <linearGradient id="goldBorder" x1="6" y1="2.5" x2="38" y2="41.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="leftPageGrad" x1="11" y1="17" x2="21.5" y2="29" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF3C7" />
              <stop offset="1" stopColor="#FDE68A" />
            </linearGradient>

            <linearGradient id="rightPageGrad" x1="22.5" y1="17" x2="33" y2="29" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFBEB" />
              <stop offset="1" stopColor="#FDE68A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typographic Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${titleSize} font-black tracking-tight text-white font-sans drop-shadow-xs`}>
            FAC
          </span>
          <span className={`${tagSize} font-mono font-black tracking-wider text-amber-300 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 px-2 py-0.5 rounded-md border border-amber-500/50 uppercase shadow-xs`}>
            en PDF
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-semibold tracking-wider text-stone-300/90 mt-1 uppercase flex items-center gap-1">
            <span>Bibliothèque Universitaire</span>
            <span className="text-amber-400">·</span>
            <span className="font-arabic font-normal text-stone-400">المكتبة الجامعية</span>
          </span>
        )}
      </div>
    </div>
  );
};
