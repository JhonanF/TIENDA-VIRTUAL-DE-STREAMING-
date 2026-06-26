import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DEFAULT_CONFIG, DEFAULT_PRODUCTS, DEFAULT_SERVICES } from './data/defaults';
import { StoreConfig, Product, Service } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import Services from './components/Services';
import FAQSection from './components/FAQSection';
import WhatsAppButton from './components/WhatsAppButton';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import ResellerBanner from './components/ResellerBanner';
import CyberBackground from './components/CyberBackground';
import LoadingSkeleton from './components/LoadingSkeleton';
// Lazy-load: AdminPanel es ~99KB y nunca se necesita en la carga inicial
const AdminPanel = lazy(() => import('./components/AdminPanel'));
import { db } from './firebase';
import { doc, setDoc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { ShoppingCart, Plus, Minus, Trash2, X, Send } from 'lucide-react';
import { getNeonColorClasses, generateWhatsAppUrl, convertAndFormatPrice } from './utils';


export default function App() {
  // State loader with standard local fallback
  const [config, setConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem('nexus_store_config');
    if (saved) {
      const parsed = JSON.parse(saved) as StoreConfig;
      let changed = false;
      if (parsed.storeName === 'TIENDA MB' || parsed.storeName === 'NEXUS KOZ' || parsed.storeName === 'DIGITAL MB') {
        parsed.storeName = 'Tienda MB DIGITAL';
        changed = true;
      }
      if (parsed.whatsappNumber !== '51925958185') {
        parsed.whatsappNumber = '51925958185';
        changed = true;
      }
      if (changed) {
        localStorage.setItem('nexus_store_config', JSON.stringify(parsed));
      }
      return parsed;
    }
    return DEFAULT_CONFIG;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexus_store_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('nexus_store_services');
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Global Currency State
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');

  /**
   * isHydrating: true solo en primera visita (sin localStorage).
   * Con Firestore offline persistence, la segunda visita sirve datos desde IndexedDB
   * y el skeleton no llega a verse. Solo afecta visitas 100% en frío.
   */
  const [isHydrating, setIsHydrating] = useState(() => {
    const hasLocalCache = !!localStorage.getItem('nexus_store_config');
    return !hasLocalCache;
  });

  // Shopping Cart State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    const saved = localStorage.getItem('nexus_store_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart to localstorage on change
  useEffect(() => {
    localStorage.setItem('nexus_store_cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true); // Open the drawer immediately on add
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const colorStuff = getNeonColorClasses(config.neonColor);

  // Calculate cart total and item count
  const cartTotal = cart.reduce((sum, item) => {
    const priceStr = item.product.price.trim();
    const match = priceStr.match(/[\d.,]+/);
    if (!match) return sum;
    const val = parseFloat(match[0].replace(/,/g, ''));
    if (isNaN(val)) return sum;
    return sum + (val * item.quantity);
  }, 0);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Compile item counts per product ID
  const cartItemsCountMap = cart.reduce((map, item) => {
    map[item.product.id] = item.quantity;
    return map;
  }, {} as Record<string, number>);

  // Format currency for checkout message
  const checkoutMessage = () => {
    const rate = 3.75;
    const borderLine = "-------------------------------------------";
    const header = `🛒 *NUEVO PEDIDO - ${config.storeName.toUpperCase()}*`;
    const details = cart.map(item => {
      const priceStr = item.product.price.trim();
      const match = priceStr.match(/[\d.,]+/);
      if (!match) return `• ${item.quantity}x ${item.product.name} (${item.product.price})`;
      const val = parseFloat(match[0].replace(/,/g, ''));
      
      let displayPrice = item.product.price;
      if (currency === 'USD') {
        const isSoles = priceStr.includes('S/') || priceStr.toLowerCase().includes('sol');
        const converted = isSoles ? val / rate : val;
        displayPrice = `$ ${converted.toFixed(2)}`;
      } else {
        const isUsd = priceStr.includes('$') || priceStr.toLowerCase().includes('usd');
        const converted = isUsd ? val * rate : val;
        displayPrice = `S/ ${converted.toFixed(2)}`;
      }
      return `• ${item.quantity}x ${item.product.name} (${displayPrice})`;
    }).join('\n');

    let totalDisplay = '';
    const rateVal = 3.75;
    if (currency === 'USD') {
      const usdTotal = cartTotal / rateVal;
      totalDisplay = `$ ${usdTotal.toFixed(2)} USD`;
    } else {
      totalDisplay = `S/ ${cartTotal.toFixed(2)} PEN`;
    }

    return `${header}\n${borderLine}\n${details}\n${borderLine}\n💰 *Total a Pagar:* ${totalDisplay}\n💳 *Moneda:* ${currency === 'PEN' ? 'Soles (PEN)' : 'Dólares (USD)'}\n\n¿Me brindas los métodos de pago para completar la activación de mis licencias? 🚀`;
  };

  const buyCartUrl = generateWhatsAppUrl(config.whatsappNumber, checkoutMessage());


  // Load and subscribe Firestore elements real-time
  useEffect(() => {
    // Resolve hydration state after 450ms max to prevent holding the user hostage
    const hydrationTimer = setTimeout(() => {
      setIsHydrating(false);
    }, 450);

    // 1. Config listener
    const configDocRef = doc(db, 'configs', 'store');
    const unsubConfig = onSnapshot(configDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as StoreConfig;
        let needsUpdate = false;
        const updated = { ...data };

        if (data.storeName === 'TIENDA MB' || data.storeName === 'NEXUS KOZ' || data.storeName === 'DIGITAL MB') {
          updated.storeName = 'Tienda MB DIGITAL';
          needsUpdate = true;
        }

        if (data.whatsappNumber !== '51925958185') {
          updated.whatsappNumber = '51925958185';
          needsUpdate = true;
        }

        if (needsUpdate) {
          setConfig(updated);
          try {
            await setDoc(configDocRef, updated);
            localStorage.setItem('nexus_store_config', JSON.stringify(updated));
          } catch (e) {
            console.warn("Failed to update Firestore store config: ", e);
          }
        } else {
          setConfig(data);
        }
        // Primera respuesta de Firestore/IndexedDB recibida → ocultar skeleton
        setIsHydrating(false);
      } else {
        try {
          await setDoc(configDocRef, DEFAULT_CONFIG);
        } catch (e) {
          console.warn("Config bootstrap error: ", e);
        }
        // Sin documento existente — usa defaults locales y oculta skeleton
        setIsHydrating(false);
      }
    }, (error) => {
      console.warn("Firestore config listener fallback to offline", error);
      // En caso de error de red, mostrar defaults inmediatamente
      setIsHydrating(false);
    });

    // 2. Products listener
    const productsColRef = collection(db, 'products');
    const unsubProducts = onSnapshot(productsColRef, async (snapshot) => {
      if (!snapshot.empty) {
        const prodList: Product[] = [];
        snapshot.forEach(docSnap => {
          prodList.push(docSnap.data() as Product);
        });

        // Migration: ONLY convert prices that have explicit USD/COP markers.
        // Do NOT re-trigger on already-converted Soles prices to avoid infinite loops.
        const toWrite: { id: string; data: Product }[] = [];
        const migratedList: Product[] = prodList.map((prod) => {
          const priceStr = (prod.price || '').trim();

          // Only migrate if price has explicit foreign currency markers
          const hasUsd = priceStr.includes('$') || priceStr.toLowerCase().includes('usd');
          const hasCop = priceStr.toLowerCase().includes('cop');

          if (!hasUsd && !hasCop) {
            // Price is already in Soles or has no currency marker — do NOT touch it
            return prod;
          }

          const match = priceStr.match(/[\d.,]+/);
          if (!match) return prod;

          const numStr = match[0].replace(/,/g, '');
          const val = parseFloat(numStr);
          if (isNaN(val)) return prod;

          let convertedVal = val;
          if (hasCop && val >= 1000) {
            // COP in thousands → Soles (approximate)
            convertedVal = val / 1000;
          } else if (hasUsd) {
            // USD → Soles at fixed 3.75 rate
            convertedVal = val * 3.75;
          }

          // Preserve any suffix like "/ mes" or "/ año"
          const parts = priceStr.split(/[\d.,]+/);
          let suffix = '';
          if (parts.length > 1) {
            suffix = parts[1].replace(/usd|cop|\$/gi, '').trim();
            if (suffix && !suffix.startsWith(' ')) {
              suffix = ' ' + suffix;
            }
          }

          const newPrice = `S/ ${convertedVal.toFixed(2)}${suffix}`;
          const updatedProd = { ...prod, price: newPrice };
          toWrite.push({ id: prod.id, data: updatedProd });
          return updatedProd;
        });

        // Update UI immediately with the migrated list (no flicker)
        migratedList.sort((a, b) => a.id.localeCompare(b.id));
        setProducts(migratedList);

        // Persist only the products that actually needed migration (fire-and-forget)
        if (toWrite.length > 0) {
          Promise.all(
            toWrite.map(({ id, data }) =>
              setDoc(doc(db, 'products', id), data).catch(e =>
                console.warn(`Failed to migrate product ${id} price to Soles:`, e)
              )
            )
          );
        }
      } else {
        try {
          for (const prod of DEFAULT_PRODUCTS) {
            await setDoc(doc(db, 'products', prod.id), {
              ...prod,
              views: prod.views || 0
            });
          }
        } catch (e) {
          console.warn("Products bootstrap error: ", e);
        }
      }
    }, (error) => {
      console.warn("Firestore products listener fallback to offline", error);
    });

    // 3. Services listener
    const servicesColRef = collection(db, 'services');
    const unsubServices = onSnapshot(servicesColRef, async (snapshot) => {
      if (!snapshot.empty) {
        const srvList: Service[] = [];
        snapshot.forEach(docSnap => {
          srvList.push(docSnap.data() as Service);
        });
        srvList.sort((a, b) => a.id.localeCompare(b.id));
        setServices(srvList);
      } else {
        try {
          for (const srv of DEFAULT_SERVICES) {
            await setDoc(doc(db, 'services', srv.id), srv);
          }
        } catch (e) {
          console.warn("Services bootstrap error: ", e);
        }
      }
    }, (error) => {
      console.warn("Firestore services listener fallback to offline", error);
    });

    return () => {
      clearTimeout(hydrationTimer);
      unsubConfig();
      unsubProducts();
      unsubServices();
    };
  }, []);

  // Update website favicon dynamically based on custom asset configurations
  useEffect(() => {
    if (config.faviconUrl) {
      const link = (document.querySelector("link[rel~='icon']") as HTMLLinkElement) || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = config.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [config.faviconUrl]);

  // Track product views clicks on WhatsApp Comprar button (Firestore Increment)
  const trackProductView = async (productId: string) => {
    try {
      const prodRef = doc(db, 'products', productId);
      const product = products.find(p => p.id === productId);
      if (product) {
        const nextViews = (product.views || 0) + 1;
        await updateDoc(prodRef, { views: nextViews });
      }
    } catch (e) {
      console.warn("Could not write track event to Firestore (Offline Sandbox Mode)", e);
    }
  };

  // Handles updating current values and saving to both Firestore and localstore
  const handleSaveStoreData = async (newConfig: StoreConfig, newProducts: Product[], newServices: Service[]) => {
    setConfig(newConfig);
    setProducts(newProducts);
    setServices(newServices);
    localStorage.setItem('nexus_store_config', JSON.stringify(newConfig));
    localStorage.setItem('nexus_store_products', JSON.stringify(newProducts));
    localStorage.setItem('nexus_store_services', JSON.stringify(newServices));

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'configs', 'store'), newConfig);
      
      // Save all products
      for (const p of newProducts) {
        await setDoc(doc(db, 'products', p.id), p);
      }

      // Save all services
      for (const s of newServices) {
        await setDoc(doc(db, 'services', s.id), s);
      }
    } catch (e) {
      console.warn("Failed saving state snapshot to Firestore: ", e);
    }
  };

  // Restores all products and configs to default template arrays
  const handleRestoreDefaults = async () => {
    if (window.confirm("¿Seguro que deseas restaurar la tienda a la configuración inicial por defecto? Esto borrará tus cambios actuales.")) {
      setConfig(DEFAULT_CONFIG);
      setProducts(DEFAULT_PRODUCTS);
      setServices(DEFAULT_SERVICES);
      localStorage.removeItem('nexus_store_config');
      localStorage.removeItem('nexus_store_products');
      localStorage.removeItem('nexus_store_services');
      setIsAdminOpen(false);

      // Reset items in Firestore as well in the background
      try {
        await setDoc(doc(db, 'configs', 'store'), DEFAULT_CONFIG);
        for (const p of DEFAULT_PRODUCTS) {
          await setDoc(doc(db, 'products', p.id), { ...p, views: 0 });
        }
        for (const s of DEFAULT_SERVICES) {
          await setDoc(doc(db, 'services', s.id), s);
        }
      } catch (e) {
        console.warn("Failed restoring defaults inside Firestore: ", e);
      }
    }
  };

  return (
    <>
      {/* Skeleton de carga premium — solo en primera visita (sin caché local) */}
      <AnimatePresence>
        {isHydrating && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <LoadingSkeleton />
          </motion.div>
        )}
      </AnimatePresence>

      <div id="main-site-wrapper" className="min-h-screen bg-transparent relative overflow-hidden text-gray-100 font-sans selection:bg-white/20 selection:text-white">
      {/* Global Interactive Futuristic Cyberpunk Background */}
      <CyberBackground config={config} />

      {/* Primary Navigation Bar */}
      <Navbar 
        config={config} 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        currency={currency}
        onToggleCurrency={() => setCurrency(prev => prev === 'PEN' ? 'USD' : 'PEN')}
      />

      {/* Hero Presentation */}
      <Hero config={config} />

      {/* Modern High-Impact Reseller Banner */}
      <ResellerBanner config={config} />

      {/* Digital Products Catalog with View Track trigger */}
      <Catalog 
        products={products} 
        config={config} 
        currency={currency}
        onAddToCart={handleAddToCart}
        cartItemsCount={cartItemsCountMap}
        onTrackView={trackProductView}
      />

      {/* Core Services Section */}
      <Services 
        services={services} 
        config={config} 
      />

      {/* FAQ Accordion Section */}
      <FAQSection config={config} />

      {/* Modern Lead Capture Contact Form synced with Firestore */}
      <ContactForm config={config} />

      {/* Universal Sticky WhatsApp Button */}
      <WhatsAppButton config={config} />

      {/* Floating Cart Indicator */}
      {cartItemsCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className={`fixed bottom-24 right-6 z-40 p-4 rounded-full ${colorStuff.buttonBg} ${colorStuff.glow} border ${colorStuff.border.replace('/20', '/60')} cursor-pointer transition-all duration-300 flex items-center justify-center`}
          title="Ver carrito de compras"
        >
          <ShoppingCart className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-black animate-pulse">
            {cartItemsCount}
          </span>
        </button>
      )}

      {/* Floating Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop lock */}
            <div 
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
              onClick={() => setIsCartOpen(false)}
            />
            {/* Drawer container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-neutral-950/95 border-l border-neutral-900 z-50 flex flex-col shadow-2xl backdrop-blur-md"
            >
              {/* Header */}
              <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <ShoppingCart className={`h-5 w-5 ${colorStuff.text}`} />
                  <h3 className="font-display font-extrabold text-lg text-white">Carrito de Compras</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <ShoppingCart className="h-12 w-12 text-gray-700 animate-bounce" />
                    <div>
                      <p className="font-display font-bold text-gray-400">Tu carrito está vacío</p>
                      <p className="text-xs text-gray-500 font-light max-w-[200px] mt-1">Explora nuestro catálogo y añade licencias digitales premium.</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div 
                      key={item.product.id}
                      className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-sm text-white truncate">{item.product.name}</h4>
                        <p className={`font-mono text-xs ${colorStuff.text} mt-0.5`}>
                          {convertAndFormatPrice(item.product.price, currency)}
                        </p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="p-1 rounded-md border border-neutral-800 bg-neutral-950 text-gray-400 hover:text-white cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-mono text-sm text-white w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                          className="p-1 rounded-md border border-neutral-800 bg-neutral-950 text-gray-400 hover:text-white cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="p-1 ml-1 rounded-md text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Checkout */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-neutral-900 bg-neutral-950/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans text-gray-400">Subtotal</span>
                    <span className={`font-mono font-extrabold text-xl ${colorStuff.text}`}>
                      {currency === 'PEN' 
                        ? `S/ ${cartTotal.toFixed(2)}`
                        : `$ ${(cartTotal / 3.75).toFixed(2)}`
                      }
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={clearCart}
                      className="py-3 rounded-xl border border-neutral-900 hover:border-neutral-800 text-xs font-semibold text-gray-400 hover:text-white cursor-pointer transition-all"
                    >
                      Vaciar
                    </button>
                    <a
                      href={buyCartUrl}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="col-span-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-display font-bold text-center text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] transition-all duration-300 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Completar Pedido</span>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modern Sci-Fi footer */}
      <Footer config={config} />

      {/* Drawer customizer panel overlay - Lazy loaded para no inflar el bundle inicial */}
      <AnimatePresence>
        {isAdminOpen && (
          <>
            {/* Backdrop lock */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsAdminOpen(false)}
            />
            <Suspense fallback={<div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-neutral-950 z-50 flex items-center justify-center"><div className="text-gray-500 font-mono text-sm animate-pulse">Cargando panel...</div></div>}>
              <AdminPanel
                config={config}
                products={products}
                services={services}
                onClose={() => setIsAdminOpen(false)}
                onSave={handleSaveStoreData}
                onRestore={handleRestoreDefaults}
              />
            </Suspense>
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
