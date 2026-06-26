import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { StoreConfig } from '../types';
import { getNeonColorClasses } from '../utils';

interface FAQSectionProps {
  config: StoreConfig;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection({ config }: FAQSectionProps) {
  const colorStuff = getNeonColorClasses(config.neonColor);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "¿Cómo se entregan las cuentas o licencias digitales?",
      answer: "La entrega es 100% digital e inmediata. Una vez completado tu pago y enviado el comprobante por WhatsApp, nuestro equipo procesará la solicitud y te enviará las credenciales de acceso o códigos de activación directamente a tu chat de WhatsApp o correo electrónico."
    },
    {
      question: "¿Qué métodos de pago tienen disponibles?",
      answer: "Aceptamos una gran variedad de métodos de pago. En Perú contamos con Yape, Plin y Transferencias bancarias directas (BCP, Interbank, BBVA). Para clientes internacionales, procesamos pagos de forma segura vía PayPal, Binance Pay (USDT) o tarjetas de crédito/débito."
    },
    {
      question: "¿Los productos y licencias tienen garantía?",
      answer: "Sí, todas nuestras licencias, cuentas de streaming y herramientas digitales cuentan con garantía de funcionamiento total durante todo el periodo contratado (ya sea mensual o anual). Si experimentas algún inconveniente, te brindamos soporte técnico de inmediato."
    },
    {
      question: "¿Cómo funciona el carrito de compras a WhatsApp?",
      answer: "Puedes ir añadiendo todos los productos que deseas a tu carrito. Una vez listo, dale clic a 'Completar pedido' y se generará un mensaje automático formateado con la lista de tus productos, el total a pagar y la moneda seleccionada para que nos lo envíes directamente en un solo mensaje."
    },
    {
      question: "¿Ofrecen soporte técnico post-venta?",
      answer: "¡Por supuesto! Nuestro soporte post-venta está disponible todos los días. Si tienes dudas con la instalación de una herramienta o la activación de tu suscripción, nos escribes al WhatsApp y te guiaremos paso a paso."
    }
  ];

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="faq-section" className="py-14 sm:py-20 relative overflow-hidden bg-transparent border-t border-neutral-900/40 cv-auto">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Encabezado */}
        <div className="mb-10 flex flex-col items-center text-center space-y-3">
          <div className={`px-3 py-1 rounded-full text-xs font-mono tracking-widest ${colorStuff.badge} uppercase`}>
            Ayuda y Soporte
          </div>
          
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            Preguntas <span className={`${colorStuff.text} drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]`}>Frecuentes</span>
          </h2>
          
          <p className="font-sans text-gray-400 max-w-lg text-sm font-light leading-relaxed">
            Resuelve tus dudas al instante antes de comprar tus licencias y accesos digitales.
          </p>
        </div>

        {/* Acordeón de FAQs */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div 
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? `${colorStuff.border.replace('/20', '/40')} bg-neutral-900/40 ${colorStuff.glow}` 
                    : 'border-neutral-900 bg-neutral-950/40 hover:border-neutral-800'
                }`}
              >
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5 pr-4">
                    <HelpCircle className={`h-4.5 w-4.5 shrink-0 ${isExpanded ? colorStuff.text : 'text-gray-500'}`} />
                    <span className="font-display font-bold text-sm sm:text-base text-gray-200 group-hover:text-white">
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown className={`h-4.5 w-4.5 ${isExpanded ? colorStuff.text : 'text-gray-500'}`} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-neutral-900/40">
                        <p className="font-sans text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
