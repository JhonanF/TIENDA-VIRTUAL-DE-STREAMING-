import React, { useState, useEffect } from 'react';

interface MBDigitalLogoProps {
  className?: string;
  showGlow?: boolean;
  neonColorHex?: string;
  customLogoUrl?: string;
}

export default function MBDigitalLogo({ 
  className = "h-12 w-12", 
  showGlow = true,
  neonColorHex = "#13f064", // Vibrant high-tech neon green from official logo
  customLogoUrl
}: MBDigitalLogoProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  // Pre-load custom logo image in the background to achieve a perfect crossfade transition
  useEffect(() => {
    if (customLogoUrl) {
      const img = new Image();
      img.src = customLogoUrl;
      img.onload = () => {
        setImgSrc(customLogoUrl);
        // Add a small delay for smoother perceptual transition
        setTimeout(() => {
          setIsImgLoaded(true);
        }, 50);
      };
      img.onerror = () => {
        setIsImgLoaded(false);
        setImgSrc(undefined);
      };
    } else {
      setIsImgLoaded(false);
      setImgSrc(undefined);
    }
  }, [customLogoUrl]);

  return (
    <div className={`${className} relative flex items-center justify-center`} style={{ contentVisibility: 'auto' }}>
      
      {/* 1. Neon Aura Background Glow */}
      {showGlow && (
        <div 
          className="absolute inset-0 rounded-full blur-[14px] opacity-25 pointer-events-none transition-all duration-500" 
          style={{ backgroundColor: neonColorHex }}
        />
      )}

      {/* 2. Vector SVG Native Logo (Always rendered as high-fidelity background fallback) */}
      <svg 
        viewBox="0 0 500 500" 
        className={`w-full h-full transition-opacity duration-700 ${isImgLoaded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {showGlow && (
            <filter id="mb-neon-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur1" />
              <feGaussianBlur stdDeviation="16" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
          
          <filter id="mb-drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.8" />
          </filter>

          <linearGradient id="mb-m-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#13f064" />
            <stop offset="100%" stopColor="#00b0ff" />
          </linearGradient>

          <linearGradient id="mb-b-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D1D5DB" />
          </linearGradient>
        </defs>

        <g filter="url(#mb-drop-shadow)">
          {/* Top-Right Arc */}
          <path 
            d="M 255 70 A 180 180 0 0 1 430 245" 
            stroke={neonColorHex} 
            strokeWidth="6" 
            strokeLinecap="round"
            filter={showGlow ? "url(#mb-neon-glow)" : undefined}
          />
          
          {/* Bottom-Left Arc */}
          <path 
            d="M 245 430 A 180 180 0 0 1 70 255" 
            stroke={neonColorHex} 
            strokeWidth="6" 
            strokeLinecap="round"
            filter={showGlow ? "url(#mb-neon-glow)" : undefined}
          />
          
          {/* Top-Left Arc */}
          <path 
            d="M 70 245 A 180 180 0 0 1 245 70" 
            stroke="#FFFFFF" 
            strokeWidth="4.5" 
            strokeLinecap="round"
          />
          
          {/* Bottom-Right Arc */}
          <path 
            d="M 430 255 A 180 180 0 0 1 255 430" 
            stroke="#FFFFFF" 
            strokeWidth="4.5" 
            strokeLinecap="round"
          />

          {/* Orbits */}
          <g filter={showGlow ? "url(#mb-neon-glow)" : undefined}>
            <ellipse 
              cx="250" 
              cy="160" 
              rx="53" 
              ry="21" 
              stroke={neonColorHex} 
              strokeWidth="3.2" 
              fill="none" 
              transform="rotate(-55 250 160)" 
              opacity="0.85"
            />
            <ellipse 
              cx="250" 
              cy="160" 
              rx="53" 
              ry="21" 
              stroke={neonColorHex} 
              strokeWidth="3.2" 
              fill="none" 
              transform="rotate(55 250 160)" 
              opacity="0.85"
            />
            <ellipse 
              cx="250" 
              cy="160" 
              rx="56" 
              ry="14" 
              stroke={neonColorHex} 
              strokeWidth="3" 
              fill="none" 
              transform="rotate(-15 250 160)" 
              opacity="0.8"
            />
          </g>

          {/* Spheres */}
          <g>
            <circle cx="295" cy="132" r="14" fill={neonColorHex} opacity="0.3" filter={showGlow ? "url(#mb-neon-glow)" : undefined} />
            <circle cx="295" cy="132" r="8" fill={neonColorHex} filter={showGlow ? "url(#mb-neon-glow)" : undefined} />
            <circle cx="293.5" cy="130.5" r="2.2" fill="#FFFFFF" />
          </g>
          <g>
            <circle cx="203" cy="158" r="14" fill={neonColorHex} opacity="0.3" filter={showGlow ? "url(#mb-neon-glow)" : undefined} />
            <circle cx="203" cy="158" r="8" fill={neonColorHex} filter={showGlow ? "url(#mb-neon-glow)" : undefined} />
            <circle cx="201.5" cy="156.5" r="2.2" fill="#FFFFFF" />
          </g>
          <g>
            <circle cx="225" cy="189" r="14" fill={neonColorHex} opacity="0.3" filter={showGlow ? "url(#mb-neon-glow)" : undefined} />
            <circle cx="225" cy="189" r="8" fill={neonColorHex} filter={showGlow ? "url(#mb-neon-glow)" : undefined} />
            <circle cx="223.5" cy="187.5" r="2.2" fill="#FFFFFF" />
          </g>

          {/* Headline letters */}
          <text 
            x="192" 
            y="298" 
            fontFamily="'Outfit', 'Inter', 'Space Grotesk', system-ui, sans-serif" 
            fontWeight="900" 
            fontSize="98" 
            fill="url(#mb-m-gradient)" 
            textAnchor="middle"
            filter={showGlow ? "url(#mb-neon-glow)" : undefined}
          >
            M
          </text>
          <text 
            x="302" 
            y="298" 
            fontFamily="'Outfit', 'Inter', 'Space Grotesk', system-ui, sans-serif" 
            fontWeight="900" 
            fontSize="98" 
            fill="url(#mb-b-gradient)" 
            textAnchor="middle"
          >
            B
          </text>

          {/* Subtitle */}
          <rect 
            x="105" 
            y="342" 
            width="32" 
            height="4" 
            rx="2" 
            fill={neonColorHex} 
            filter={showGlow ? "url(#mb-neon-glow)" : undefined} 
          />
          <text 
            x="252" 
            y="349" 
            fontFamily="'Space Grotesk', 'Inter', sans-serif" 
            fontWeight="800" 
            fontSize="21" 
            letterSpacing="15" 
            fill="#FFFFFF" 
            textAnchor="middle"
          >
            DIGITAL
          </text>
          <rect 
            x="363" 
            y="342" 
            width="32" 
            height="4" 
            rx="2" 
            fill={neonColorHex} 
            filter={showGlow ? "url(#mb-neon-glow)" : undefined} 
          />
        </g>
      </svg>

      {/* 3. Custom Image Logo (Rendered absolute on top with seamless crossfade transition) */}
      {imgSrc && (
        <img 
          src={imgSrc} 
          alt="Branded Logo" 
          className={`absolute inset-0 z-10 w-full h-full object-contain max-h-full max-w-full transition-all duration-700 ease-out ${isImgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`} 
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
