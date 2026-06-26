import React, { useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'motion/react';
import { ShoppingCart, Tag, ShieldCheck, Cpu, Star, Download, Sparkles, X, Search } from 'lucide-react';
import { Product, StoreConfig } from '../types';
import { getNeonColorClasses, generateWhatsAppUrl, convertAndFormatPrice } from '../utils';

// Componente auxiliar para cargar imágenes de forma progresiva con esqueleto (shimmer) y difuminado suave
interface ProductImageProps {
  src: string;
  alt: string;
  parallaxX: any;
  parallaxY: any;
}

function ProductImage({ src, alt, parallaxX, parallaxY }: ProductImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full bg-neutral-900/40 overflow-hidden">
      {/* Shimmer de carga estilo cyberpunk */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 animate-pulse flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-cyan-500/40 animate-spin" />
        </div>
      )}
      
      {/* Placeholder de fallback en caso de error de red */}
      {hasError ? (
        <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center border border-neutral-900">
          <span className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">Sin visualización</span>
        </div>
      ) : (
        <motion.img 
          src={src} 
          alt={alt} 
          className={`absolute inset-0 w-full h-full object-cover scale-[1.08] transition-all duration-500 ease-out ${
            isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
          }`}
          style={{ x: parallaxX, y: parallaxY }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050506]/95 via-transparent to-black/10 z-10" />
    </div>
  );
}

interface CatalogProps {
  products: Product[];
  config: StoreConfig;
  currency: 'PEN' | 'USD';
  onAddToCart: (product: Product) => void;
  cartItemsCount: Record<string, number>;
  onTrackView?: (productId: string) => void;
}


import { useIsMobile } from '../hooks/useIsMobile';
import { MotionValue } from 'motion/react';

// 1. Interactive 3D Parallax Tilt Card Component
interface TiltCardProps {
  children: (props: { parallaxX: number | MotionValue<number>; parallaxY: number | MotionValue<number> }) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function StaticCard({ children, className, style }: TiltCardProps) {
  return (
    <div className={className} style={style}>
      {children({ parallaxX: 0, parallaxY: 0 })}
    </div>
  );
}

function InteractiveTiltCard({ children, className, style }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for physical 3D rotation
  const x = useMotionValue<number>(0);
  const y = useMotionValue<number>(0);
  
  // Percentages for glass shine reflection (0% to 100%)
  const shineX = useMotionValue<number>(50);
  const shineY = useMotionValue<number>(50);

  // Parallax offset motion values for background layers (e.g. images)
  const parallaxX = useMotionValue<number>(0);
  const parallaxY = useMotionValue<number>(0);

  // Scale motion value
  const scale = useMotionValue<number>(1);

  // High performance spring physics
  const springX = useSpring(x, { stiffness: 100, damping: 16 });
  const springY = useSpring(y, { stiffness: 100, damping: 16 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 16 });
  const springParallaxX = useSpring(parallaxX, { stiffness: 100, damping: 16 });
  const springParallaxY = useSpring(parallaxY, { stiffness: 100, damping: 16 });

  // Transform percent values safely using useTransform hook (resolves runtime crashes)
  const shineXPercent = useTransform(shineX, val => `${val}%`);
  const shineYPercent = useTransform(shineY, val => `${val}%`);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    const relativeX = clientX - left;
    const relativeY = clientY - top;
    
    // Normalized coordinates from -0.5 to 0.5
    const normalizedX = (relativeX / width) - 0.5;
    const normalizedY = (relativeY / height) - 0.5;

    // Calculate rotation angles (up to 8 degrees of rotation)
    x.set(-normalizedY * 16); 
    y.set(normalizedX * 16);  

    // Calculate mouse percentage for light reflection gradient
    shineX.set((relativeX / width) * 100);
    shineY.set((relativeY / height) * 100);

    // Calculate inverse parallax shift for interior components (up to 6px)
    parallaxX.set(-normalizedX * 12);
    parallaxY.set(-normalizedY * 12);
  };

  const handleMouseEnter = () => {
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    shineX.set(50);
    shineY.set(50);
    parallaxX.set(0);
    parallaxY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${className} preserve-3d`}
      style={{
        ...style,
        rotateX: springX,
        rotateY: springY,
        scale: springScale,
      }}
    >
      {/* Dynamic light refraction shine overlay following cursor */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 180px at var(--shine-x, 50%) var(--shine-y, 50%), rgba(255, 255, 255, 0.08), transparent 80%)`,
          '--shine-x': shineXPercent,
          '--shine-y': shineYPercent,
        } as React.CSSProperties}
      />
      {children({ parallaxX: springParallaxX, parallaxY: springParallaxY })}
    </motion.div>
  );
}

function TiltCard({ children, className, style }: TiltCardProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <StaticCard children={children} className={className} style={style} />;
  }
  return <InteractiveTiltCard children={children} className={className} style={style} />;
}



// 2. Framer Motion Animation Variants for Entrance
const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 100, 
      damping: 15 
    } 
  }
};

export default function Catalog({ products, config, currency, onAddToCart, cartItemsCount, onTrackView }: CatalogProps) {
  // Get dynamic categories from config or fallback to products unique categories
  const categories = config.categories && config.categories.length > 0
    ? config.categories
    : [...new Set(products.map(p => p.category))];

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const colorStuff = getNeonColorClasses(config.neonColor);

  const activeCategory = selectedCategory && categories.includes(selectedCategory)
    ? selectedCategory
    : (categories[0] || '');

  const filteredProducts = products.filter(p => {
    const matchesCategory = p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Helper to render responsive visual icons based on category
  const renderProductIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'herramientas':
        return <Cpu className={`h-8 w-8 ${colorStuff.text}`} />;
      case 'suscripciones':
        return <Star className={`h-8 w-8 ${colorStuff.text}`} />;
      case 'productos digitales':
      case 'productos':
        return <Download className={`h-8 w-8 ${colorStuff.text}`} />;
      default:
        return <Sparkles className={`h-8 w-8 ${colorStuff.text}`} />;
    }
  };

  const getCategoryGradient = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = sum % 3;
    if (index === 0) return 'from-cyan-500/10 via-transparent to-blue-500/5';
    if (index === 1) return 'from-purple-500/10 via-transparent to-pink-500/5';
    return 'from-emerald-500/10 via-transparent to-teal-500/5';
  };

  return (
    <section id="catalog-section" className="py-14 sm:py-28 relative overflow-hidden bg-transparent">
      
      {/* 3D Perspective Grid Background (Cyberpunk Horizon Floor) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 perspective-grid-container opacity-25">
        <div 
          className="absolute -inset-[100%] perspective-grid" 
          style={{ 
            '--grid-color': colorStuff.accentHex + '18' 
          } as React.CSSProperties} 
        />
        {/* Subtle dark fade to melt the perspective grid into the background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent" />
      </div>

      {/* Cyberpunk Laser Scan Line */}
      <div 
        className="absolute left-0 right-0 h-[2px] z-0 pointer-events-none opacity-30 laser-scan-line" 
        style={{
          '--scan-color': colorStuff.accentHex + '15',
          '--scan-color-bright': colorStuff.accentHex
        } as React.CSSProperties}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
          <div className="mb-10 sm:mb-20 flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`px-3 py-1 rounded-full text-xs font-mono tracking-widest ${colorStuff.badge} uppercase`}
          >
            Servicios y Licencias
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight"
          >
            Nuestros <span className={`${colorStuff.text} drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]`}>Productos Digitales</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-sans text-gray-400 max-w-xl font-light leading-relaxed"
          >
            Soluciones automáticas, recursos para creadores y licencias de herramientas tech premium listas para activar inmediatamente.
          </motion.p>

          {/* Filtering buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 pt-4 sm:gap-2.5 sm:pt-6"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all duration-300 pointer cursor-pointer ${
                  activeCategory === category
                    ? `${colorStuff.buttonBg} ${colorStuff.glow}`
                    : 'bg-neutral-950/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 text-gray-400 hover:text-white backdrop-blur-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Search Bar Input */}
          <div className="relative max-w-md mx-auto mt-6 w-full px-4 sm:px-0 z-20">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-950/80 border border-neutral-800 focus:border-cyan-500/50 rounded-xl font-sans text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white focus:outline-none cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        <motion.div 
          key={activeCategory}
          variants={gridContainerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8"
        >
          {filteredProducts.map((product) => {
            const defaultMessage = `Hola, estoy interesado en adquirir el producto "${product.name}" de precio "${product.price}" en tu tienda. ¿Me podrías dar los pasos para activar mi licencia?`;
            const customMessage = product.whatsappMessage || defaultMessage;
            const buyUrl = generateWhatsAppUrl(config.whatsappNumber, customMessage);

            return (
              <TiltCard
                key={product.id}
                variants={cardVariants}
                className="flex flex-col rounded-2xl relative overflow-hidden group cyber-glass-card transition-colors duration-300"
                style={{
                  '--card-hover-border': colorStuff.accentHex + '55',
                  '--card-hover-glow': colorStuff.accentHex + '25',
                } as React.CSSProperties}
              >
                {({ parallaxX, parallaxY }) => (
                  <>
                    {/* Tech corner accents inside the glass box */}
                    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${colorStuff.border} opacity-50 group-hover:opacity-100 transition-opacity duration-300 z-20`} />
                    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${colorStuff.border} opacity-50 group-hover:opacity-100 transition-opacity duration-300 z-20`} />
                    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${colorStuff.border} opacity-50 group-hover:opacity-100 transition-opacity duration-300 z-20`} />
                    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${colorStuff.border} opacity-50 group-hover:opacity-100 transition-opacity duration-300 z-20`} />

                    {/* Visual Header Grid Gradient with preserve-3d */}
                    <div className="h-28 xs:h-32 sm:h-44 relative flex items-center justify-center bg-neutral-950/80 overflow-hidden border-b border-neutral-900/60 preserve-3d">
                      {product.imageUrl ? (
                        <ProductImage 
                          src={product.imageUrl} 
                          alt={product.name} 
                          parallaxX={parallaxX} 
                          parallaxY={parallaxY} 
                        />
                      ) : (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(product.id)}`} />
                          {/* Grid background on image */}
                          <div className="absolute inset-0 cyber-grid opacity-20" />
                          
                          {/* Futuristic glass blur circle */}
                          <motion.div 
                            className={`absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full ${colorStuff.bg} border ${colorStuff.border} flex items-center justify-center shadow-lg backdrop-blur-md z-10`}
                            style={{ x: parallaxX, y: parallaxY }}
                          >
                            {renderProductIcon(product.category)}
                          </motion.div>
                        </>
                      )}
                      
                      {/* Category Pill Tag */}
                      <span className="absolute top-2 left-2 sm:top-4 sm:left-4 inline-flex items-center space-x-1 sm:space-x-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-semibold bg-neutral-950/90 text-gray-300 border border-neutral-800/80 backdrop-blur-md shadow-md z-20">
                        <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                        <span className="truncate max-w-[60px] sm:max-w-none">{product.category}</span>
                      </span>

                      {/* Dynamic Stock / Availability Badge */}
                      {(() => {
                        const isOutOfStock = product.inStock === false || (product.stock !== undefined && product.stock !== null && product.stock <= 0);
                        if (isOutOfStock) {
                          return (
                            <span className="absolute top-2 right-2 sm:top-4 sm:right-4 inline-flex items-center space-x-1 sm:space-x-1.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30 backdrop-blur-md shadow-[0_0_12px_rgba(239,68,68,0.15)] z-20">
                              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span>AGOTADO</span>
                            </span>
                          );
                        } else if (product.stock !== undefined && product.stock !== null) {
                          return (
                            <span className="absolute top-2 right-2 sm:top-4 sm:right-4 inline-flex items-center space-x-1 sm:space-x-1.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-md z-20">
                              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400" />
                              <span>{product.stock} DISP.</span>
                            </span>
                          );
                        } else {
                          return (
                            <span className="absolute top-2 right-2 sm:top-4 sm:right-4 inline-flex items-center space-x-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-md z-20">
                              <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span>DISPONIBLE</span>
                            </span>
                          );
                        }
                      })()}
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-6 flex-1 flex flex-col space-y-2.5 sm:space-y-4 relative">
                      {/* Subtle inner ambient card hover background glow */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                        style={{
                          background: `radial-gradient(circle at 50% 90%, ${colorStuff.accentHex}08 0%, transparent 60%)`
                        }}
                      />

                      <div className="flex justify-between items-start gap-2 relative z-10">
                        <h3 className="font-display font-extrabold text-sm sm:text-xl text-white tracking-tight group-hover:text-white transition-colors duration-200 line-clamp-2 min-h-[2.5rem] sm:min-h-0">
                          {product.name}
                        </h3>
                      </div>

                      {(() => {
                        const [isExpanded, setIsExpanded] = React.useState(false);
                        const maxLength = 120;
                        const shouldTruncate = product.description.length > maxLength;
                        
                        return (
                          <div className="hidden sm:block font-sans text-sm text-gray-400 font-light flex-1 leading-relaxed relative z-10">
                            <p className="inline">
                              {shouldTruncate && !isExpanded 
                                ? `${product.description.slice(0, maxLength)}...` 
                                : product.description}
                            </p>
                            {shouldTruncate && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setIsExpanded(!isExpanded);
                                }}
                                className={`ml-2 text-xs font-mono font-bold uppercase transition-colors duration-200 focus:outline-none hover:text-white ${colorStuff.text}`}
                              >
                                {isExpanded ? 'Leer menos' : 'Leer más'}
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      {/* Stock counter helper underneath description if configured */}
                      {product.stock !== undefined && product.stock !== null && product.stock > 0 && (
                        <div className="text-[9px] sm:text-[10px] font-mono text-gray-500 flex items-center space-x-1.5 relative z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span>Unidades: <strong className="text-gray-300 font-bold">{product.stock}</strong></span>
                        </div>
                      )}

                      <div className="pt-2.5 sm:pt-4 flex items-center justify-between border-t border-neutral-900/60 relative z-10">
                        <div className="flex flex-col">
                          <span className="text-[8px] sm:text-[10px] font-mono tracking-wider text-gray-500 uppercase">Inversión</span>
                          <span className={`font-mono font-bold sm:font-extrabold text-sm sm:text-base tracking-tight ${colorStuff.text}`}>
                            {convertAndFormatPrice(product.price, currency)}
                          </span>
                        </div>

                        {(() => {
                          const isOutOfStock = product.inStock === false || (product.stock !== undefined && product.stock !== null && product.stock <= 0);
                          if (isOutOfStock) {
                            return (
                              <div
                                className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-4.5 sm:py-2.5 rounded-xl text-[9px] sm:text-xs font-display font-black tracking-widest uppercase bg-neutral-950 border border-red-500/20 text-red-400/60 cursor-not-allowed select-none"
                                title="Producto temporalmente sin existencias"
                              >
                                <span>Agotado</span>
                                <X className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-red-500/40" />
                              </div>
                            );
                          }

                          const inCartQty = cartItemsCount[product.id] || 0;
                          
                          return (
                            <div className="flex items-center space-x-1.5">
                              {/* Add to Cart Button */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onAddToCart(product);
                                }}
                                className={`relative p-2 sm:px-3 sm:py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center space-x-1 cursor-pointer ${
                                  inCartQty > 0 
                                    ? `${colorStuff.border.replace('/20', '/50')} ${colorStuff.text} bg-neutral-900/60`
                                    : 'border-neutral-900 hover:border-neutral-700 bg-neutral-950/40 text-gray-400 hover:text-white'
                                }`}
                                title="Añadir al carrito"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Añadir</span>
                                {inCartQty > 0 && (
                                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[8px] font-bold text-black animate-pulse">
                                    {inCartQty}
                                  </span>
                                )}
                              </button>

                              {/* Direct Checkout button */}
                              <a
                                href={buyUrl}
                                target="_blank"
                                referrerPolicy="no-referrer"
                                onClick={() => onTrackView && onTrackView(product.id)}
                                className={`flex items-center justify-center p-2 sm:px-3.5 sm:py-2 rounded-xl text-[9px] sm:text-xs font-display font-black tracking-widest uppercase cursor-pointer ${colorStuff.buttonBg} transition-all duration-300`}
                                title="Comprar ahora por WhatsApp"
                              >
                                <span className="hidden sm:inline">Comprar</span>
                                <span className="sm:hidden">Ya</span>
                              </a>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </TiltCard>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
