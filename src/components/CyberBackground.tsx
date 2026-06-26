import React, { useEffect, useRef, useState } from 'react';
import { StoreConfig } from '../types';
import { getNeonColorClasses } from '../utils';

interface CyberBackgroundProps {
  config: StoreConfig;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export default function CyberBackground({ config }: CyberBackgroundProps) {
  const colorStuff = getNeonColorClasses(config.neonColor);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  // Detectar móvil una sola vez al montar (sin re-renders)
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  // Sincronizar tamaño y redimensionamiento (con debounce básico para evitar recálculos excesivos)
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 150) as any;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Rastrear posición global del cursor (solo desktop — en móvil no hay cursor)
  useEffect(() => {
    if (isMobileDevice) return; // Sin cursor en móvil: no registrar listeners
    let lastMove = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMove < 16) return; // ~60fps throttle
      lastMove = now;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMobileDevice]);

  // Animación del Canvas de Partículas (solo desktop)
  useEffect(() => {
    if (isMobileDevice) return; // Saltar canvas en móvil para liberar CPU durante LCP
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    
    const densityDivisor = 22000;
    const maxParticles = Math.min(45, Math.floor((windowSize.width * windowSize.height) / densityDivisor));

    // Inicializar partículas
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.2 + 0.8,
        alpha: Math.random() * 0.4 + 0.15
      });
    }

    const mouseRangeSq = 180 * 180;
    const linkRangeSq = 100 * 100;
    const mouseLinkRangeSq = 130 * 130;

    // Bucle principal de renderizado
    const render = () => {
      ctx.clearRect(0, 0, windowSize.width, windowSize.height);

      // Dibujar y actualizar partículas
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Rebotes en bordes
        if (p.x < 0 || p.x > windowSize.width) p.vx *= -1;
        if (p.y < 0 || p.y > windowSize.height) p.vy *= -1;

        // Mantener dentro del Canvas por seguridad
        if (p.x < 0) p.x = 0;
        if (p.x > windowSize.width) p.x = windowSize.width;
        if (p.y < 0) p.y = 0;
        if (p.y > windowSize.height) p.y = windowSize.height;

        // Reactividad sutil al mouse utilizando distancias al cuadrado (optimización matemática)
        const dxMouse = mouseRef.current.x - p.x;
        const dyMouse = mouseRef.current.y - p.y;
        const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
        
        if (distMouseSq < mouseRangeSq) {
          const distMouse = Math.sqrt(distMouseSq);
          if (distMouse > 0) {
            const force = (180 - distMouse) / 180;
            p.x += (dxMouse / distMouse) * force * 0.3;
            p.y += (dyMouse / distMouse) * force * 0.3;
          }
        }

        // Renderizar punto
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${colorStuff.accentHex}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Conectar con nodos cercanos usando distancia al cuadrado para evitar raíz cuadrada en bucles anidados
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < linkRangeSq) {
            const distance = Math.sqrt(distSq);
            const linkAlpha = (100 - distance) / 100 * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${colorStuff.accentHex}${Math.floor(linkAlpha * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Conectar sutilmente con el mouse
        if (distMouseSq < mouseLinkRangeSq) {
          const distMouse = Math.sqrt(distMouseSq);
          const mouseAlpha = (130 - distMouse) / 130 * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.strokeStyle = `${colorStuff.accentHex}${Math.floor(mouseAlpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [windowSize, colorStuff.accentHex, config.neonColor, isMobileDevice]);

  // Convertir el color de neón dinámico a RGB para las auroras gaseosas
  const getAuroraColors = () => {
    switch (config.neonColor) {
      case 'blue':
        return ['rgba(59, 130, 246, 0.08)', 'rgba(29, 78, 216, 0.05)', 'rgba(99, 102, 241, 0.06)'];
      case 'purple':
        return ['rgba(168, 85, 247, 0.08)', 'rgba(109, 40, 217, 0.05)', 'rgba(236, 72, 153, 0.06)'];
      case 'emerald':
        return ['rgba(16, 185, 129, 0.08)', 'rgba(4, 120, 87, 0.05)', 'rgba(6, 182, 212, 0.06)'];
      case 'white':
        return ['rgba(255, 255, 255, 0.05)', 'rgba(115, 115, 115, 0.03)', 'rgba(75, 85, 99, 0.04)'];
      case 'indigo':
        return ['rgba(99, 102, 241, 0.08)', 'rgba(67, 56, 202, 0.05)', 'rgba(168, 85, 247, 0.06)'];
      case 'cyan':
      default:
        return ['rgba(6, 182, 212, 0.08)', 'rgba(9, 79, 114, 0.05)', 'rgba(59, 130, 246, 0.06)'];
    }
  };

  const colors = getAuroraColors();

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none bg-[#020203]">
      
      {/* 1. Large Gaseous Aurora Orbs in slow motion (Elliptic movement) */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[65vw] h-[65vw] rounded-full blur-[140px] opacity-70 mix-blend-screen pointer-events-none aurora-orb-1"
        style={{
          background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`
        }}
      />
      <div 
        className="absolute bottom-[-15%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[150px] opacity-65 mix-blend-screen pointer-events-none aurora-orb-2"
        style={{
          background: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)`
        }}
      />
      <div 
        className="absolute top-[30%] right-[15%] w-[50vw] h-[50vw] rounded-full blur-[130px] opacity-55 mix-blend-screen pointer-events-none aurora-orb-3"
        style={{
          background: `radial-gradient(circle, ${colors[2]} 0%, transparent 70%)`
        }}
      />

      {/* 2. Interactive Neuronal Canvas Grid (solo desktop para no saturar CPU en móvil) */}
      {!isMobileDevice && (
        <canvas 
          ref={canvasRef}
          width={windowSize.width}
          height={windowSize.height}
          className="absolute inset-0 pointer-events-none z-10 opacity-70"
        />
      )}
      
      {/* 3. Global Atmospheric Scanline Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-transparent via-[#050506]/5 to-[#050506]/10 opacity-40" />
    </div>
  );
}
