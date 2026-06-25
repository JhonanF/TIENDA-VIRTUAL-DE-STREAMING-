import React from 'react';
import { Instagram, Linkedin, MessageSquare, ShieldCheck, Mail, ArrowUp } from 'lucide-react';
import { StoreConfig } from '../types';
import { getNeonColorClasses } from '../utils';
import MBDigitalLogo from './MBDigitalLogo';

interface FooterProps {
  config: StoreConfig;
}

export default function Footer({ config }: FooterProps) {
  const colorStuff = getNeonColorClasses(config.neonColor);

  return (
    <footer id="footer-section" className="relative bg-gray-950/60 border-t border-gray-900 pt-10 sm:pt-20 pb-8 sm:pb-10 overflow-hidden">
      {/* Lights Background */}
      <div 
        className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full glow-overlay opacity-10 z-0 pointer-events-none"
        style={{ backgroundColor: colorStuff.accentHex, filter: 'blur(110px)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 pb-10 sm:pb-16 border-b border-gray-900">
          
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col space-y-6">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <MBDigitalLogo className="h-10 w-10 group-hover:scale-105 transition-transform duration-300" showGlow={true} neonColorHex={colorStuff.accentHex} customLogoUrl={config.logoUrl} />
              <span className="font-display font-extrabold text-xl tracking-wider text-white">
                {config.storeName}
              </span>
            </div>
            
            <p className="font-sans text-sm text-gray-400 font-light leading-relaxed max-w-sm">
              Potenciamos el ecosistema digital de marcas avanzadas y profesionales autónomos incorporando tecnología del mañana hoy mismo.
            </p>

            {/* Social Grid icons */}
            <div className="flex items-center space-x-4">
              {config.instagramUrl && (
                <a 
                  href={config.instagramUrl} 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  className="p-2 rounded-lg border border-gray-800 bg-gray-950 hover:bg-gray-900 hover:border-gray-700 text-gray-400 hover:text-white transition-all duration-300"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {config.linkedinUrl && (
                <a 
                  href={config.linkedinUrl} 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  className="p-2 rounded-lg border border-gray-800 bg-gray-950 hover:bg-gray-900 hover:border-gray-700 text-gray-400 hover:text-white transition-all duration-300"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {config.tiktokUrl && (
                <a 
                  href={config.tiktokUrl} 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  className="p-2 rounded-lg border border-gray-800 bg-gray-950 hover:bg-gray-900 hover:border-gray-700 text-gray-400 hover:text-white transition-all duration-300"
                >
                  <span className="font-mono text-xs font-black tracking-tighter uppercase px-1">TK</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick link sections */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-gray-500 uppercase">mapa del sitio</h4>
            <ul className="space-y-3 font-sans text-sm">
              <li>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => {
                  const element = document.getElementById('catalog-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left">
                  Productos
                </button>
              </li>
              <li>
                <button onClick={() => {
                  const element = document.getElementById('services-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left">
                  Servicios
                </button>
              </li>
            </ul>
          </div>

          {/* Secure & Support Details */}
          <div className="md:col-span-4 flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-gray-500 uppercase">canal de soporte</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Mail className={`h-4.5 w-4.5 ${colorStuff.text}`} />
                <span>contacto@{config.storeName.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <MessageSquare className={`h-4.5 w-4.5 ${colorStuff.text}`} />
                <span>WhatsApp: +{config.whatsappNumber}</span>
              </div>

              {/* Secure checkout pill */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-900">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                <span className="text-[10px] font-mono text-gray-400 tracking-wider">COMISIONES 0% - PAGOS DIRECTOS</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic legal & date */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-gray-500 font-light">
          <span>&copy; {new Date().getFullYear()} {config.storeName}. Todos los derechos reservados.</span>
          <div className="flex items-center space-x-1">
            <span>Powered by</span>
            <span className={`font-mono font-semibold ${colorStuff.text}`}>Gemini Tech</span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="ml-4 p-2 rounded-lg border border-gray-900 bg-gray-950 hover:bg-gray-900 text-gray-400 hover:text-white cursor-pointer"
              title="Volver Arriba"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
