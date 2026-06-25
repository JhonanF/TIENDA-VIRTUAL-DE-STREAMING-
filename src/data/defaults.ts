import { StoreConfig, Product, Service } from '../types';

export const DEFAULT_CONFIG: StoreConfig = {
  storeName: "Tienda MB DIGITAL",
  tagline: "Potencia tu mundo digital",
   whatsappNumber: "51925958185",
  neonColor: "white",
  instagramUrl: "https://instagram.com",
  linkedinUrl: "https://linkedin.com",
  tiktokUrl: "https://tiktok.com",
  aboutText: "Soluciones digitales revolucionarias, automatizaciones impulsadas por Inteligencia Artificial, edición de video cinematográfica y diseño de alta fidelidad para impulsar marcas que lideran el mañana.",
  categories: ['Streaming', 'IPTV', 'Herramientas', 'Inteligencia Artificial', 'Redes Sociales'],
  resellerBannerText: "¿Quieres emprender y comenzar a vender cuentas premium? 💚 Comunícate con nosotros al WhatsApp y te daremos precios accesibles para revender nuestros productos.",
  showResellerBanner: true
};

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-8",
    name: "Netflix Premium Ultra HD",
    price: "S/ 32.00",
    description: "Acceso garantizado de 30 días a tu pantalla privada en calidad 4K Ultra HD. Soporte y reemplazo inmediato por WhatsApp sin esperas.",
    category: "Streaming",
    imageUrl: "",
    stock: 75,
    inStock: true
  },
  {
    id: "prod-7",
    name: "IPTV Gold Premium Ultimate",
    price: "S/ 170.00 / año",
    description: "Más de 12,000 canales nacionales e internacionales, deportes premium en vivo, ligas mundiales y catálogo inmenso de películas/series en 4K.",
    category: "IPTV",
    imageUrl: "",
    stock: 40,
    inStock: true
  },
  {
    id: "prod-1",
    name: "Licencia Premium Tool Vault",
    price: "S/ 55.00",
    description: "Acceso exclusivo de 30 días a nuestra suite seleccionada de utilidades premium de analítica y optimización de contenido digital de vanguardia.",
    category: "Herramientas",
    imageUrl: "",
    stock: 50,
    inStock: true
  },
  {
    id: "prod-3",
    name: "Suscripción Automatizadora IA",
    price: "S/ 190.00 / mes",
    description: "Soporte e implementación premium de bots conversacionales inteligentes con memoria, flujos rápidos de email y automatizaciones completas.",
    category: "Inteligencia Artificial",
    imageUrl: "",
    stock: 20,
    inStock: true
  },
  {
    id: "prod-4",
    name: "Master Prompts Database DB",
    price: "S/ 38.00",
    description: "La guía definitiva de Prompt Engineering. Más de 600 prompts de alta conversión para ChatGPT, Claude y Midjourney listos para multiplicar tu productividad.",
    category: "Inteligencia Artificial",
    imageUrl: "",
    stock: 120,
    inStock: true
  },
  {
    id: "prod-2",
    name: "Pack Editor Cinematográfico",
    price: "S/ 115.00",
    description: "Colección exclusiva con más de 200 transiciones de neón, efectos cinematográficos (SFX) y overlays futuristas listos para Premiere y CapCut.",
    category: "Redes Sociales",
    imageUrl: "",
    stock: 95,
    inStock: true
  }
];

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "srv-1",
    name: "PÁGINAS WEB",
    description: "Creamos páginas web profesionales totalmente personalizadas al gusto del cliente, con diseños modernos, elegantes y adaptados para celulares, computadoras y televisores. Desarrollamos tiendas online, páginas para negocios, portafolios, menús digitales, landing pages y mucho más.",
    features: [
      "Desarrollo 100% Responsivo (Móvil, Tablet y Desktop)",
      "Optimización de Velocidad y Core Web Vitals",
      "Diseño UI/UX Futurista Exclusivo y Premium",
      "SEO Avanzado para Google y Motores de Búsqueda",
      "Integración de WhatsApp, Redes y Captación de Leads",
      "Configuración de Servidor, Dominio y Certificados SSL"
    ],
    iconName: "Layout"
  },
  {
    id: "srv-2",
    name: "Edición de Video Profesional",
    description: "Producción y edición cinematográfica orientada a la máxima retención. Ideal para YouTube, anuncios de marca, Reels y TikTok.",
    features: [
      "Diseño de sonido y SFX inmersivos",
      "VFX, transiciones personalizadas y animaciones",
      "Ritmo adaptado a redes sociales",
      "Corrección de color premium (LUTs personalizados)"
    ],
    iconName: "Video"
  },
  {
    id: "srv-3",
    name: "Diseño Web UI/UX de Élite",
    description: "Creamos portafolios, landing pages y webs interactivas con estética ciberpunk y minimalista que cautivan desde el primer scroll.",
    features: [
      "Animaciones fluidas y layouts responsivos",
      "Optimización SEO y velocidad máxima de carga",
      "Paleta cromática customizada y brillos de neón",
      "Preparado para captación de leads"
    ],
    iconName: "Layout"
  },
  {
    id: "srv-4",
    name: "Soporte Técnico & Tech Setup",
    description: "Configuración integral de sistemas en la nube, dominios, correos corporativos y optimización de herramientas empresariales modernas.",
    features: [
      "Resolución rápida de bugs y problemas web",
      "Seguridad de endpoints y bases de datos",
      "Configuración de pasarelas de pago",
      "Soporte uno a uno vía WhatsApp"
    ],
    iconName: "Wrench"
  },
  {
    id: "srv-5",
    name: "Automatizaciones con IA",
    description: "Diseño e implementación de flujos inteligentes de trabajo, bots conversacionales con memoria para WhatsApp/Telegram y flujos automatizados de CRM.",
    features: [
      "Integración premium con APIs (OpenAI, Claude)",
      "Agentes conversacionales automatizados",
      "Conexión con Make / Zapier",
      "Monitoreo de estabilidad 24/7"
    ],
    iconName: "Cpu"
  }
];
