import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { StoreConfig } from '../types';
import { getNeonColorClasses } from '../utils';
import MBDigitalLogo from './MBDigitalLogo';

interface HeroProps {
  config: StoreConfig;
}

import { useIsMobile } from '../hooks/useIsMobile';

interface MagneticButtonProps {
  children: React.ReactNode;
  className: string;
  onClick?: () => void;
}

function StaticButton({ children, className, onClick }: MagneticButtonProps) {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function InteractiveMagneticButton({ children, className, onClick }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // High performance smooth physics for attraction
  const x = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 });
  const y = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Dynamic magnetic pull threshold of 100px
    if (distance < 100) {
      x.set(distanceX * 0.38);
      y.set(distanceY * 0.38);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      style={{ x, y }}
    >
      {children}
    </motion.button>
  );
}

// 1. Interactive Magnetic Button Component (Wrapper)
function MagneticButton({ children, className, onClick }: MagneticButtonProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <StaticButton children={children} className={className} onClick={onClick} />;
  }
  return <InteractiveMagneticButton children={children} className={className} onClick={onClick} />;
}


// 2. Main Hero Component
export default function Hero({ config }: HeroProps) {
  const colorStuff = getNeonColorClasses(config.neonColor);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // FIX modern-web-guidance (INP): Throttle con RAF para evitar setState
  // en cada evento de mousemove (~200+ veces/seg). Con RAF se colapsan
  // todas las actualizaciones al siguiente frame de pintura (60fps max).
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current !== null) return; // ya hay un frame pendiente

    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const x = (clientX / width - 0.5) * 35; // range: -17.5 to 17.5
      const y = (clientY / height - 0.5) * 35;
      setMouseOffset({ x, y });
      rafRef.current = null;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setMouseOffset({ x: 0, y: 0 });
  }, []);

  const scrollHandler = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Split-Text Anim Configurations
  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 15
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.35,
        ease: [0.25, 1, 0.5, 1]
      } 
    }
  };

  // Split Tagline words
  const words = config.tagline.split(' ');
  const totalWords = words.length;

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[70vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-20 bg-[#050506]"
    >
      {/* 3D Distortable Cyber Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none perspective-grid-container opacity-20 transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${65 + mouseOffset.y * 0.18}deg) rotateY(${mouseOffset.x * 0.18}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        <div 
          className="absolute -inset-[150%] interactive-hero-grid" 
          style={{ 
            '--grid-color': colorStuff.accentHex + '18',
            transform: `translate3d(${mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px, 0)`
          } as React.CSSProperties} 
        />
        {/* Shadow blend */}
        <div className="absolute inset-0 bg-[#050506]/35" />
      </div>

      <div className="absolute inset-0 cyber-grid-radial z-0 pointer-events-none" />

      {/* Decorative Neon Aura Blur Spheres (React to mouse) */}
      <div 
        className="absolute top-1/4 left-1/4 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full glow-overlay opacity-15 z-0 transition-transform duration-500 ease-out pointer-events-none"
        style={{ 
          backgroundColor: colorStuff.accentHex, 
          filter: 'blur(110px)',
          transform: `translate3d(${-mouseOffset.x * 0.8}px, ${-mouseOffset.y * 0.8}px, 0)`
        }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full glow-overlay opacity-10 z-0 transition-transform duration-500 ease-out pointer-events-none"
        style={{ 
          backgroundColor: colorStuff.accentHex, 
          filter: 'blur(120px)',
          transform: `translate3d(${mouseOffset.x * 0.5}px, ${mouseOffset.y * 0.5}px, 0)`
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        <div className="flex flex-col items-center justify-center space-y-10">
          
          {/* Prominent Official MB DIGITAL Logo Display */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.96, 1, 0.96], opacity: 1 }}
            transition={{ 
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.2 }
            }}
            className="relative"
          >
            <div 
              className="absolute inset-0 m-auto w-32 h-32 rounded-full blur-[70px] pointer-events-none opacity-25 animate-pulse" 
              style={{ backgroundColor: colorStuff.accentHex }}
            />
            <MBDigitalLogo 
              className="h-32 w-32 sm:h-40 sm:w-40 relative z-10 hover:scale-105 hover:rotate-2 transition-all duration-500 cursor-pointer" 
              showGlow={true} 
              neonColorHex={colorStuff.accentHex}
              customLogoUrl={config.heroLogoUrl || config.logoUrl}
            />
          </motion.div>

          {/* Futuristic Tech Pill Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-neutral-800/80 bg-neutral-950/70 backdrop-blur-md shadow-md"
          >
            <MBDigitalLogo className="h-4.5 w-4.5 animate-pulse" showGlow={false} neonColorHex={colorStuff.accentHex} customLogoUrl={config.logoUrl} />
            <span className="text-[10px] font-mono font-semibold tracking-[0.22em] text-gray-400 uppercase">
              Tecnología de Vanguardia
            </span>
          </motion.div>

          {/* Title: Letter-by-Letter Split-Text */}
          <motion.h1 
            variants={titleContainerVariants}
            initial="hidden"
            animate="visible"
            className="font-display font-black text-4xl sm:text-7xl lg:text-8xl tracking-normal leading-none text-white max-w-4xl flex flex-wrap justify-center select-none"
          >
            {words.map((word, wIdx) => {
              // The last two words get dynamic neon gradient fill. The rest get hollow outline look.
              const isNeonGrad = wIdx >= totalWords - 2;

              if (isNeonGrad) {
                return (
                  <motion.span
                    key={wIdx}
                    variants={letterVariants}
                    className="inline-block mx-2 sm:mx-4 my-1 bg-clip-text text-transparent bg-gradient-to-r font-black select-none"
                    style={{
                      backgroundImage: `linear-gradient(to right, #ffffff, ${colorStuff.accentHex} 55%, ${colorStuff.accentHex} 100%)`,
                      filter: `drop-shadow(0 0 20px ${colorStuff.accentHex}50)`
                    }}
                  >
                    {word}
                  </motion.span>
                );
              }

              return (
                <motion.span
                  key={wIdx}
                  variants={letterVariants}
                  className="inline-block mx-2 sm:mx-4 my-1 cyber-outline-text font-black select-none"
                >
                  {word}
                </motion.span>
              );
            })}
          </motion.h1>

          {/* Descriptive Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="font-sans text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed relative z-10"
          >
            {config.aboutText || "Automatizaciones con Inteligencia Artificial, edición cinematográfica y diseño futurista de interfaces para impulsar tu marca a velocidades de hiperespacio."}
          </motion.p>

          {/* Interactive Magnetic Call to Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 pt-2 sm:pt-4 w-full sm:w-auto relative z-20"
          >
            <MagneticButton
              onClick={() => scrollHandler('catalog-section')}
              className={`group flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-4.5 rounded-xl font-display font-bold text-base tracking-wide ${colorStuff.buttonBg} transition-all duration-300 cursor-pointer ${colorStuff.glowHover}`}
            >
              <span>Ver Productos</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </MagneticButton>

            <MagneticButton
              onClick={() => scrollHandler('services-section')}
              className="flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-4.5 rounded-xl font-display font-bold text-base tracking-wide border border-neutral-800 bg-neutral-950/45 hover:bg-neutral-900/60 hover:border-neutral-700 text-gray-200 transition-all duration-300 cursor-pointer"
            >
              <span>Preguntar por Servicios</span>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Scroll indicator with animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0], y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer opacity-30 hover:opacity-75 transition-opacity z-10"
          onClick={() => scrollHandler('catalog-section')}
        >
          <span className="text-[10px] font-mono tracking-[0.2em] text-gray-500 uppercase mb-2">Deslizar para explorar</span>
          <ArrowDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </div>
    </section>
  );
}
