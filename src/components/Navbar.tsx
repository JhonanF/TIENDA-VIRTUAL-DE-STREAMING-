import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, MessageSquare, Menu, X, Sparkles } from 'lucide-react';
import { StoreConfig } from '../types';
import { getNeonColorClasses, generateWhatsAppUrl } from '../utils';
import MBDigitalLogo from './MBDigitalLogo';

interface NavbarProps {
  config: StoreConfig;
  onOpenAdmin: () => void;
  currency: 'PEN' | 'USD';
  onToggleCurrency: () => void;
}

export default function Navbar({ config, onOpenAdmin, currency, onToggleCurrency }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colorStuff = getNeonColorClasses(config.neonColor);

  const handleScroll = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed navbar
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

  const contactUrl = generateWhatsAppUrl(
    config.whatsappNumber,
    "Hola, estuve navegando en tu tienda " + config.storeName + " y me gustaría consultar por tus servicios digitales."
  );

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-20 border-b border-white/5 bg-black/60 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <MBDigitalLogo className="h-10 w-10 sm:h-11 sm:w-11 group-hover:scale-105 transition-transform duration-300" showGlow={true} neonColorHex={colorStuff.accentHex} customLogoUrl={config.logoUrl} />
          <span className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-white">
            {config.storeName}
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-sans text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Inicio
          </button>
          <button
            onClick={() => handleScroll('catalog-section')}
            className="font-sans text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Productos
          </button>
          <button
            onClick={() => handleScroll('services-section')}
            className="font-sans text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Servicios
          </button>
          <button
            onClick={() => handleScroll('faq-section')}
            className="font-sans text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Preguntas
          </button>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Currency Toggle Selector */}
          <button 
            onClick={onToggleCurrency}
            className={`px-3 py-1.5 rounded-lg border ${colorStuff.border} bg-neutral-950/60 hover:bg-neutral-900 transition-colors text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer text-gray-300`}
            title="Cambiar divisa de visualización"
          >
            <span>Moneda:</span>
            <span className={`${colorStuff.text} font-black`}>
              {currency === 'PEN' ? 'Soles (S/)' : 'USD ($)'}
            </span>
          </button>

          <button
            onClick={onOpenAdmin}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border border-gray-800 bg-gray-950/50 hover:bg-gray-900 hover:border-gray-700 text-xs font-semibold text-gray-300 transition-all cursor-pointer`}
            title="Editar productos y ajustes"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Editar Tienda</span>
          </button>

          <a
            href={contactUrl}
            target="_blank"
            referrerPolicy="no-referrer"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-display font-bold text-sm tracking-wide bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] transition-all duration-300 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Currency switch directly inside the bar for convenience */}
          <button 
            onClick={onToggleCurrency}
            className={`px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-gray-950 text-xs font-mono font-extrabold text-gray-300 cursor-pointer`}
          >
            {currency === 'PEN' ? 'S/' : '$ USD'}
          </button>
          
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-lg border border-gray-800 bg-gray-950/50 text-gray-400 hover:text-white hover:border-gray-700"
          >
            <Sliders className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white focus:outline-none transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-gray-950 bg-[#030712]/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-5 pt-3 pb-6 space-y-4">
              <button
                onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="block w-full text-left font-sans text-base font-medium text-gray-300 hover:text-white"
              >
                Inicio
              </button>
              <button
                onClick={() => handleScroll('catalog-section')}
                className="block w-full text-left font-sans text-base font-medium text-gray-300 hover:text-white"
              >
                Productos
              </button>
              <button
                onClick={() => handleScroll('services-section')}
                className="block w-full text-left font-sans text-base font-medium text-gray-300 hover:text-white"
              >
                Servicios
              </button>
              <button
                onClick={() => handleScroll('faq-section')}
                className="block w-full text-left font-sans text-base font-medium text-gray-300 hover:text-white"
              >
                Preguntas Frecuentes
              </button>
              <button
                onClick={() => handleScroll('footer-section')}
                className="block w-full text-left font-sans text-base font-medium text-gray-300 hover:text-white"
              >
                Contacto
              </button>

              <div className="pt-2 border-t border-gray-900 flex flex-col space-y-3">
                {/* Currency switch inside list */}
                <button
                  onClick={onToggleCurrency}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-neutral-900 bg-gray-950 text-sm font-medium text-gray-300"
                >
                  <span className="font-sans">Visualizar Precios en:</span>
                  <span className={`${colorStuff.text} font-mono font-black`}>
                    {currency === 'PEN' ? 'Soles (S/)' : 'Dólares ($)'}
                  </span>
                </button>

                <button
                  onClick={() => { setIsOpen(false); onOpenAdmin(); }}
                  className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl border border-gray-800 bg-gray-950 text-sm font-medium text-gray-300"
                >
                  <Sliders className="h-4 w-4" />
                  <span>Configurar Tienda</span>
                </button>
                <a
                  href={contactUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl font-display font-bold text-center text-sm bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] transition-all duration-300 cursor-pointer"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Escríbenos por WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
