import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'motion/react';
import { Cpu, Video, Layout, Wrench, Sparkles, Laptop, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Service, StoreConfig } from '../types';
import { getNeonColorClasses, generateWhatsAppUrl } from '../utils';

interface ServicesProps {
  services: Service[];
  config: StoreConfig;
}

// Helper to resolve icon component
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Cpu':
      return Cpu;
    case 'Video':
      return Video;
    case 'Layout':
      return Layout;
    case 'Wrench':
      return Wrench;
    case 'Laptop':
      return Laptop;
    case 'ShieldCheck':
      return ShieldCheck;
    default:
      return Sparkles;
  }
};

import { useIsMobile } from '../hooks/useIsMobile';
import { MotionValue } from 'motion/react';

// FIX modern-web-guidance (Rules of Hooks): useState NO puede usarse dentro de
// .map(). Extraemos la lógica de expand/collapse a un componente propio para
// cumplir con las reglas de Hooks y aislar el re-render por card.
interface ServiceDescriptionProps {
  description: string;
  colorText: string;
}

function ServiceDescription({ description, colorText }: ServiceDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 120;
  const shouldTruncate = description.length > maxLength;

  return (
    <div className="font-sans text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
      <p className="inline">
        {shouldTruncate && !isExpanded
          ? `${description.slice(0, maxLength)}...`
          : description}
      </p>
      {shouldTruncate && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={`ml-2 text-xs font-mono font-bold uppercase transition-colors duration-200 focus:outline-none hover:text-white ${colorText}`}
        >
          {isExpanded ? 'Leer menos' : 'Leer más'}
        </button>
      )}
    </div>
  );
}


// 3D Parallax Tilt Card Component for Services
// Extiende React.Attributes para que TypeScript reconozca la prop especial `key`
// cuando el componente se usa dentro de Array.map() — ts(2322)
interface TiltCardProps extends React.Attributes {
  children: (props: { parallaxX: number | MotionValue<number>; parallaxY: number | MotionValue<number> }) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function StaticCard({ children, className, style }: TiltCardProps) {
  return (
    <div className={className} style={style}>
      {children({ parallaxX: 0, parallaxY: 0 })}
    </div>
  );
}

function InteractiveTiltCard({ children, className, style }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for physical 3D rotation
  const x = useMotionValue<number>(0);
  const y = useMotionValue<number>(0);
  
  // Percentages for glass shine reflection (0% to 100%)
  const shineX = useMotionValue<number>(50);
  const shineY = useMotionValue<number>(50);

  // Parallax offset motion values for background layers
  const parallaxX = useMotionValue<number>(0);
  const parallaxY = useMotionValue<number>(0);

  // Scale motion value
  const scale = useMotionValue<number>(1);

  // High performance spring physics
  const springX = useSpring(x, { stiffness: 100, damping: 16 });
  const springY = useSpring(y, { stiffness: 100, damping: 16 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 16 });
  const springParallaxX = useSpring(parallaxX, { stiffness: 100, damping: 16 });
  const springParallaxY = useSpring(parallaxY, { stiffness: 100, damping: 16 });

  // Transform percent values safely using useTransform hook
  const shineXPercent = useTransform(shineX, val => `${val}%`);
  const shineYPercent = useTransform(shineY, val => `${val}%`);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    const relativeX = clientX - left;
    const relativeY = clientY - top;
    
    // Normalized coordinates from -0.5 to 0.5
    const normalizedX = (relativeX / width) - 0.5;
    const normalizedY = (relativeY / height) - 0.5;
 
    // Calculate rotation angles (up to 5 degrees of rotation for services to feel snappy)
    x.set(-normalizedY * 10); 
    y.set(normalizedX * 10);  

    // Calculate mouse percentage for light reflection gradient
    shineX.set((relativeX / width) * 100);
    shineY.set((relativeY / height) * 100);

    // Calculate inverse parallax shift for interior components (up to 6px)
    parallaxX.set(-normalizedX * 8);
    parallaxY.set(-normalizedY * 8);
  };

  const handleMouseEnter = () => {
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    shineX.set(50);
    shineY.set(50);
    parallaxX.set(0);
    parallaxY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${className} preserve-3d`}
      style={{
        ...style,
        rotateX: springX,
        rotateY: springY,
        scale: springScale,
      }}
    >
      {/* Dynamic light refraction shine overlay following cursor */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 200px at var(--shine-x, 50%) var(--shine-y, 50%), rgba(255, 255, 255, 0.07), transparent 80%)`,
          '--shine-x': shineXPercent,
          '--shine-y': shineYPercent,
        } as React.CSSProperties}
      />
      {children({ parallaxX: springParallaxX, parallaxY: springParallaxY })}
    </motion.div>
  );
}

function TiltCard({ children, className, style }: TiltCardProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <StaticCard children={children} className={className} style={style} />;
  }
  return <InteractiveTiltCard children={children} className={className} style={style} />;
}


export default function Services({ services, config }: ServicesProps) {
  const colorStuff = getNeonColorClasses(config.neonColor);

  // Helper to ensure professional features are shown if the database has dummy/empty data
  const getServiceFeatures = (service: Service) => {
    const clean = (service.features || []).filter(f => f.trim() !== '.' && f.trim() !== '');
    if (clean.length > 0) return clean;
    
    const nameLower = (service.name || '').toLowerCase();
    if (nameLower.includes('pag') || nameLower.includes('web') || nameLower.includes('sitio')) {
      return [
        "Desarrollo 100% Responsivo (Móvil, Tablet y Desktop)",
        "Optimización de Velocidad y Core Web Vitals",
        "Diseño UI/UX Futurista Exclusivo y Premium",
        "SEO Avanzado para Google y Motores de Búsqueda",
        "Integración de WhatsApp, Redes y Captación de Leads",
        "Configuración de Servidor, Dominio y Certificados SSL"
      ];
    }
    if (nameLower.includes('automat') || nameLower.includes('bot') || nameLower.includes('ia')) {
      return [
        "Integración premium con APIs (OpenAI, Claude)",
        "Agentes conversacionales automatizados",
        "Conexión con Make / Zapier",
        "Monitoreo de estabilidad 24/7"
      ];
    }
    if (nameLower.includes('edit') || nameLower.includes('video')) {
      return [
        "Diseño de sonido y SFX inmersivos",
        "VFX, transiciones personalizadas y animaciones",
        "Ritmo adaptado a redes sociales",
        "Corrección de color premium (LUTs personalizados)"
      ];
    }
    return [
      "Resolución rápida de bugs y problemas web",
      "Seguridad de endpoints y bases de datos",
      "Configuración de pasarelas de pago",
      "Soporte uno a uno vía WhatsApp"
    ];
  };

  return (
    <section id="services-section" className="py-14 sm:py-28 relative overflow-hidden bg-transparent border-y border-neutral-900/40 cv-auto">
      
      {/* 3D perspective grid background layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 perspective-grid-container opacity-10">
        <div 
          className="absolute -inset-[100%] perspective-grid" 
          style={{ 
            '--grid-color': colorStuff.accentHex + '12' 
          } as React.CSSProperties} 
        />
      </div>

      {/* Atmospheric Glow Overlay */}
      <div 
        className="absolute top-1/4 right-1/4 w-[380px] h-[380px] rounded-full glow-overlay opacity-15 z-0 blur-[120px] pointer-events-none" 
        style={{ backgroundColor: colorStuff.accentHex }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-10 sm:mb-20 flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`px-3 py-1 rounded-full text-xs font-mono tracking-widest ${colorStuff.badge} uppercase`}
          >
            Desarrollo de Élite
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight"
          >
            Nuestros <span className={`${colorStuff.text} drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]`}>Servicios Oficiales</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-sans text-gray-400 max-w-xl font-light leading-relaxed"
          >
            Creamos experiencias digitales cinematográficas, automatizamos procesos complejos con IA y optimizamos tu infraestructura digital de punta a punta.
          </motion.p>
        </div>

        {/* 3-Column Compact Bento Grid Layout (Always uniform card sizes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto justify-center">
          {services.map((service, index) => {
            const IconComponent = getIconComponent(service.iconName);
            const defaultMessage = `Hola, estoy interesado en tu servicio profesional de "${service.name}". ¿Me podrías dar información detallada y una cotización para mi proyecto?`;
            const customMessage = service.whatsappMessage || defaultMessage;
            const contactUrl = generateWhatsAppUrl(config.whatsappNumber, customMessage);
            const featuresToRender = getServiceFeatures(service);

            return (
              <TiltCard
                key={service.id}
                className="rounded-2xl relative overflow-hidden group cyber-glass-card transition-colors duration-300"
                style={{
                  '--card-hover-border': colorStuff.accentHex + '55',
                  '--card-hover-glow': colorStuff.accentHex + '25',
                } as React.CSSProperties}
              >
                {({ parallaxX, parallaxY }) => (
                  <div className="flex flex-col p-6 sm:p-7 relative h-full justify-between">
                    {/* Tech corner line accents */}
                    <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t border-l ${colorStuff.border} opacity-40 group-hover:opacity-100 transition-opacity duration-300 z-20`} />
                    <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-t border-r ${colorStuff.border} opacity-40 group-hover:opacity-100 transition-opacity duration-300 z-20`} />
                    <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l ${colorStuff.border} opacity-40 group-hover:opacity-100 transition-opacity duration-300 z-20`} />
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r ${colorStuff.border} opacity-40 group-hover:opacity-100 transition-opacity duration-300 z-20`} />

                    {/* Cyber Grid pattern */}
                    <div className="absolute inset-0 cyber-grid opacity-[0.05] pointer-events-none z-0" />

                    {/* Ambient Glow */}
                    <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${colorStuff.radial} opacity-10 group-hover:opacity-25 transition-opacity duration-500 blur-xl pointer-events-none z-0`} />

                    {/* Content block in one vertical flow, grouped naturally at the top */}
                    <div className="flex-1 flex flex-col space-y-4 mb-6 relative z-10">
                      {/* Header */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            className={`p-2.5 rounded-xl ${colorStuff.bg} border ${colorStuff.border} ${colorStuff.glow} flex items-center justify-center`}
                            style={{ x: parallaxX, y: parallaxY }}
                          >
                            <IconComponent className={`h-5 w-5 ${colorStuff.text}`} />
                          </motion.div>
                          <h3 className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight">
                            {service.name}
                          </h3>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-mono font-bold bg-neutral-900 border border-neutral-800 text-gray-500 uppercase tracking-wider shrink-0">
                          Soporte
                        </span>
                      </div>

                      <ServiceDescription
                        description={service.description}
                        colorText={colorStuff.text}
                      />

                      {/* Tech Divider */}
                      <div className="border-t border-neutral-900/40 w-full pt-2" />

                      {/* Features list */}
                      <div>
                        <h4 className="text-[9px] font-mono font-bold tracking-widest text-gray-500 uppercase mb-3">
                          Incluye en el Servicio
                        </h4>
                        <ul className="flex flex-col space-y-2.5">
                          {featuresToRender.map((feature, idx) => (
                            <motion.li 
                              key={idx} 
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + idx * 0.03 }}
                              className="flex items-start space-x-2.5 text-xs sm:text-sm font-sans text-gray-300 group/item"
                            >
                              <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${colorStuff.text} transition-transform group-hover/item:scale-110 duration-200`} />
                              <span className="group-hover/item:text-white transition-colors duration-200 text-xs sm:text-sm leading-tight">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action button anchored at the bottom */}
                    <div className="pt-4 border-t border-neutral-900/40 w-full mt-auto relative z-10">
                      <a
                        href={contactUrl}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className={`group flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase ${colorStuff.buttonBg} transition-all duration-300 cursor-pointer`}
                      >
                        <span>Obtener Servicio</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                )}
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
