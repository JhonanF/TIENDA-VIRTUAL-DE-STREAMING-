import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar de forma reactiva si el ancho
 * de la ventana corresponde a un dispositivo móvil (menor a 768px).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Definir la comprobación inicial en el montaje del cliente
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}
