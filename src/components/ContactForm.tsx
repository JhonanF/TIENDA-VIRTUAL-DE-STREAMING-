import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, MessageSquare, Check, Terminal, AlertTriangle } from 'lucide-react';
import { StoreConfig } from '../types';
import { getNeonColorClasses } from '../utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ContactFormProps {
  config: StoreConfig;
}

export default function ContactForm({ config }: ContactFormProps) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const colorStuff = getNeonColorClasses(config.neonColor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    const msgId = `msg-${Date.now()}`;
    const payload = {
      id: msgId,
      name: name.trim(),
      topic: topic.trim() || 'Consulta Técnica',
      message: message.trim(),
      createdAt: new Date(), // Local or let server rules process
    };

    try {
      // Direct Write connection to Firebase Firestore Collection
      const docRef = doc(collection(db, 'messages'), msgId);
      await setDoc(docRef, payload);
      
      setStatus('success');
      setName('');
      setTopic('');
      setMessage('');
      
      // Auto-reset state back to input form after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('No se pudo establecer conexión con Firestore. Comprueba tu configuración de Firebase en el panel de control.');
    }
  };

  return (
    <section id="contact-section" className="py-12 sm:py-20 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60%] h-[350px] bg-gradient-to-t from-gray-950/20 via-transparent to-transparent pointer-events-none z-0" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="border border-gray-900 rounded-3xl p-5 sm:p-8 md:p-12 background-glass interactive-glass relative overflow-hidden group">
          {/* Neon Border Accent on Hover */}
          <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-${config.neonColor}-500 to-transparent opacity-50`} />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            {/* Title Column */}
            <div className="md:col-span-5 space-y-4">
              <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest ${colorStuff.badge} uppercase`}>
                <Terminal className="h-3 w-3" />
                <span>CANAL DIRECTO</span>
              </div>
              <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight lead-tight">
                ¿Tienes un <span className={colorStuff.text}>Proyecto Especial</span>?
              </h3>
              <p className="font-sans text-sm text-gray-400 font-light leading-relaxed">
                Envíanos una propuesta o requerimiento técnico. Tu mensaje se consolida en tiempo real y nuestro equipo se comunicará contigo vía WhatsApp o email a la brevedad.
              </p>
            </div>

            {/* Form Column */}
            <div className="md:col-span-7">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-4"
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25">
                    <MessageSquare className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h4 className="font-display font-black text-xl text-white uppercase tracking-wider">¡Consulta Transmitida!</h4>
                  <p className="font-sans text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Hemos recibido tus datos con éxito. Tu consulta ha quedado registrada de forma segura en Firebase Firestore.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-gray-400 mb-1">Tu Nombre *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: David Miller"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-950/70 border border-gray-900 focus:border-cyan-500 hover:border-gray-800 text-white outline-none transition-all placeholder-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-gray-400 mb-1">Tema / Email</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ej: Automatización IA"
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-950/70 border border-gray-900 focus:border-cyan-500 hover:border-gray-800 text-white outline-none transition-all placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-gray-400 mb-1">Mensaje *</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describenos brevemente tus requerimientos técnicos..."
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-950/70 border border-gray-900 focus:border-cyan-500 hover:border-gray-800 text-white outline-none transition-all resize-none placeholder-gray-600"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-start space-x-2 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-[11px] font-mono leading-relaxed">{errorMsg}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`w-full py-3 rounded-xl font-display font-black tracking-widest uppercase cursor-pointer flex items-center justify-center space-x-2 transition-all ${
                      status === 'loading'
                        ? 'opacity-50 cursor-not-allowed bg-gray-900 text-gray-500'
                        : `${colorStuff.buttonBg} ${colorStuff.glow}`
                    }`}
                  >
                    <span>{status === 'loading' ? 'Enviando Datos...' : 'Transmitir Mensaje'}</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
