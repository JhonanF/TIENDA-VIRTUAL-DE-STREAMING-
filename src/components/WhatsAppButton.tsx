import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { StoreConfig } from '../types';
import { getNeonColorClasses, generateWhatsAppUrl } from '../utils';

interface WhatsAppButtonProps {
  config: StoreConfig;
}

export default function WhatsAppButton({ config }: WhatsAppButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const colorStuff = getNeonColorClasses(config.neonColor);

  const contactUrl = generateWhatsAppUrl(
    config.whatsappNumber,
    "Hola, estoy navegando en tu sitio web " + config.storeName + " y me gustaría chatear contigo para resolver una duda."
  );

  useEffect(() => {
    // Show inviting tooltip after 3.5 seconds
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Dynamic Inviting Tooltip bubble */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-3 mr-1 bg-gray-950/95 border border-gray-800 text-gray-200 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md max-w-[240px] relative text-xs font-sans font-light flex items-start gap-2.5"
          >
            <div className="flex-1">
              <span className="font-bold font-display text-green-400 block mb-0.5">¿Tienes alguna duda? 👋</span>
              Háblame directamente para resolver tus consultas en minutos.
            </div>
            <button
              onClick={() => setShowTooltip(false)}
              className="p-0.5 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
            {/* Little talk arrow */}
            <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-[#030712] border-r border-b border-gray-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circle Button with high attention pulse */}
      <motion.a
        href={contactUrl}
        target="_blank"
        referrerPolicy="no-referrer"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative group cursor-pointer flex items-center justify-center"
      >
        {/* Animated Ripple Circles for continuous neon attention */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-500/10 animate-ping opacity-75 pointer-events-none" />
        <span 
          className="absolute -inset-1.5 rounded-full opacity-65 blur-md animate-pulse pointer-events-none"
          style={{ backgroundColor: '#22c55e' }}
        />

        {/* Real circle button */}
        <div className="relative w-14 h-14 bg-gradient-to-tr from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-10">
          <MessageCircle className="h-7 w-7 filter drop-shadow font-bold" />
        </div>
      </motion.a>
    </div>
  );
}
