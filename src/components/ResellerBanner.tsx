import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { StoreConfig } from '../types';
import { getNeonColorClasses, generateWhatsAppUrl } from '../utils';

interface ResellerBannerProps {
  config: StoreConfig;
}

export default function ResellerBanner({ config }: ResellerBannerProps) {
  // If explicitly hidden, do not render
  if (config.showResellerBanner === false) return null;

  const colorStuff = getNeonColorClasses(config.neonColor);
  const defaultText = "¿Quieres emprender y comenzar a vender cuentas premium? 💚 Comunícate con nosotros al WhatsApp y te daremos precios accesibles para revender nuestros productos.";
  const displayMessage = config.resellerBannerText || defaultText;

  // Custom contact message for resellers
  const waResellerMsg = "Hola MB DIGITAL, me gustaría emprender y vender cuentas premium. ¿Me podrían brindar los precios especiales y condiciones para revendedores?";
  const resellerWaUrl = generateWhatsAppUrl(config.whatsappNumber, waResellerMsg);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-4 sm:mt-12 sm:mb-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-gray-950/60 backdrop-blur-md p-4 sm:p-8"
      >
        {/* Glow ambient background effect */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-24 bg-emerald-500/10 blur-[60px] pointer-events-none rounded-full" />
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-cyan-500/10 blur-[40px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start space-x-4 max-w-3xl">
            <div className={`rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-1 flex-shrink-0 animate-pulse ${config.resellerIconUrl ? 'p-1.5 w-12 h-12 flex items-center justify-center overflow-hidden' : 'p-3.5'}`}>
              {config.resellerIconUrl ? (
                <img 
                  src={config.resellerIconUrl} 
                  alt="Reseller Logo" 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                🚀 Oportunidad de Emprendimiento
              </span>
              <p className="font-sans text-white text-sm sm:text-lg leading-relaxed font-semibold">
                {displayMessage}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            <a
              href={resellerWaUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-display font-black text-xs uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>¡Quiero ser revendedor!</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
