import React from 'react';

/**
 * Skeleton de carga premium cyberpunk.
 * Se renderiza durante el estado "hydrating" de la primera visita,
 * dando FCP inmediato con fondo negro y shimmer animado.
 * En segunda visita (con cache IndexedDB) este skeleton apenas se ve.
 */
export default function LoadingSkeleton() {
  return (
    <div
      className="fixed inset-0 z-[200] bg-[#050506] flex flex-col items-center justify-center"
      aria-label="Cargando tienda..."
      role="status"
    >
      {/* Logo animado */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border border-cyan-500/20 flex items-center justify-center">
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400/60 animate-spin" style={{ animationDuration: '1.2s' }} />
          <div className="absolute inset-2 rounded-full border-b border-white/10 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          {/* MB Letters */}
          <div className="relative z-10 flex items-baseline gap-0.5">
            <span
              className="font-black text-2xl leading-none"
              style={{
                background: 'linear-gradient(to bottom, #13f064, #00b0ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              M
            </span>
            <span
              className="font-black text-2xl leading-none text-white/90"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              B
            </span>
          </div>
        </div>
        {/* Neon glow orb */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(19,240,100,0.12) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </div>

      {/* Brand name */}
      <p
        className="font-mono text-[10px] tracking-[0.35em] text-gray-500 uppercase mb-10"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        MB DIGITAL
      </p>

      {/* Progress bar */}
      <div className="w-48 h-[1px] bg-neutral-900 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(to right, #13f064, #00b0ff)',
            animation: 'skeleton-progress 1.6s ease-in-out infinite',
          }}
        />
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes skeleton-progress {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
