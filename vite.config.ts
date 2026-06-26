import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: ['.ngrok-free.dev', '.ngrok.io', 'localhost'],
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Aumentar advertencia de chunk a 600KB (por los Base64 de imágenes)
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Code splitting manual: separa librerías pesadas en chunks propios
          // para que el navegador las cachée independientemente del código de la app
          manualChunks: {
            // Firebase core (app + firestore): necesario en el inicio para leer datos
            // firebase/auth: lazy-loaded (solo cuando el admin lo abre) — NO incluir aquí
            'firebase-core': ['firebase/app', 'firebase/firestore'],
            // Firebase storage: solo se usa en AdminPanel (lazy)
            'firebase-storage': ['firebase/storage'],
            // Animaciones (~45KB): separado del bundle principal
            'motion': ['motion/react'],
            // Iconos (~35KB): separado del bundle principal
            'icons': ['lucide-react'],
          },
        },
      },
    },
  };
});

