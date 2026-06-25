export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  category: string; // e.g. "Herramientas", "Suscripciones", "Productos"
  imageUrl?: string;
  whatsappMessage?: string;
  views?: number;
  stock?: number; // Manual stock count (0 means Agotado)
  inStock?: boolean; // General availability state
}

export interface Service {
  id: string;
  name: string;
  description: string;
  features: string[];
  iconName: string; // Lucide icon name, e.g. "Cpu", "Video", "Layers", "Headphones"
  whatsappMessage?: string;
}

export interface StoreConfig {
  storeName: string;
  tagline: string;
  whatsappNumber: string; // e.g. "3143497151"
  neonColor: 'blue' | 'purple' | 'emerald' | 'cyan' | 'indigo' | 'white';
  instagramUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  aboutText?: string;
  categories?: string[]; // Dynamic categories created by user
  resellerBannerText?: string; // Announcement for resellers
  showResellerBanner?: boolean; // Toggle displaying the reseller banner
  logoUrl?: string; // Main header logo url/base64
  heroLogoUrl?: string; // Larger hero page logo url/base64
  faviconUrl?: string; // Favicon link url/base64
  resellerIconUrl?: string; // Reseller banner icon url/base64
}

export interface Message {
  id: string;
  name: string;
  topic?: string;
  message: string;
  createdAt: any; // timestamp
}

export interface AdminAuth {
  username?: string;
  password?: string;
}
