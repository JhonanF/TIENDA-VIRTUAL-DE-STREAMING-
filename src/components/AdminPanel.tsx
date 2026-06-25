import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, Save, RotateCcw, Plus, Trash2, Sliders, ShoppingBag, 
  Briefcase, FileText, BarChart3, MessageSquare, Upload, 
  Lock, KeyRound, Pencil, Check, Eye, Trash, Terminal, AlertTriangle, ShieldCheck,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { StoreConfig, Product, Service, Message, AdminAuth } from '../types';
import { getNeonColorClasses } from '../utils';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const sanitizeAndFormatPrice = (priceInput: string): string => {
  const clean = priceInput.trim();
  if (!clean) return 'S/ 19.90';

  const hasUsd = clean.includes('$') || clean.toLowerCase().includes('usd');
  const hasCop = clean.toLowerCase().includes('cop');
  const lacksSolesSymbol = !clean.includes('S/') && !clean.toLowerCase().includes('sol');

  if (hasUsd || hasCop || lacksSolesSymbol) {
    const match = clean.match(/[\d.,]+/);
    if (match) {
      const numStr = match[0].replace(/,/g, '');
      const val = parseFloat(numStr);
      if (!isNaN(val)) {
        let convertedVal = val;
        
        // If it is COP in thousands (value >= 1000), divide by 1000
        if (val >= 1000) {
          convertedVal = val / 1000;
        } else if (hasUsd) {
          // If it's USD, convert with 3.75 exchange rate
          convertedVal = val * 3.75;
        }

        let suffix = '';
        const parts = clean.split(/[\d.,]+/);
        if (parts.length > 1) {
          // Strip out usd, cop, $
          suffix = parts[1].replace(/usd|cop|\$/gi, '').trim();
          if (suffix) {
            if (suffix.startsWith('/')) {
              suffix = ' ' + suffix;
            } else {
              suffix = ' ' + suffix;
            }
          }
        }
        return `S/ ${convertedVal.toFixed(2)}${suffix}`;
      }
    }
  }

  return clean;
};

interface AdminPanelProps {
  config: StoreConfig;
  products: Product[];
  services: Service[];
  onClose: () => void;
  onSave: (config: StoreConfig, products: Product[], services: Service[]) => void;
  onRestore: () => void;
}

export default function AdminPanel({
  config,
  products,
  services,
  onClose,
  onSave,
  onRestore
}: AdminPanelProps) {
  // Navigation tabs: now features DASHBOARD, GENERAL, PRODUCTS, SERVICES
  const [activeTab, setActiveTab] = useState<'dashboard' | 'general' | 'products' | 'services'>('dashboard');
  const colorStuff = getNeonColorClasses(config.neonColor);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin_session_active') === 'true';
  });
  const [authError, setAuthError] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  
  // Real DB customized credentials stored in Firestore configs/auth
  const [dbCredentials, setDbCredentials] = useState<AdminAuth>({
    username: '777chuchooo@gmail.com',
    password: 'MB_cmd1081.'
  });

  // DB Connection Indicator State
  const [isConnected, setIsConnected] = useState(false);

  // General Settings State
  const [storeName, setStoreName] = useState(config.storeName);
  const [tagline, setTagline] = useState(config.tagline);
  const [whatsappNumber, setWhatsappNumber] = useState(config.whatsappNumber);
  const [neonColor, setNeonColor] = useState(config.neonColor);
  const [aboutText, setAboutText] = useState(config.aboutText || '');
  const [instagramUrl, setInstagramUrl] = useState(config.instagramUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(config.linkedinUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(config.tiktokUrl || '');

  // Customizable branding settings state
  const [logoUrl, setLogoUrl] = useState(config.logoUrl || '');
  const [heroLogoUrl, setHeroLogoUrl] = useState(config.heroLogoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(config.faviconUrl || '');
  const [resellerIconUrl, setResellerIconUrl] = useState(config.resellerIconUrl || '');

  // Customizable categories state
  const [categoriesList, setCategoriesList] = useState<string[]>(
    config.categories && config.categories.length > 0 
      ? config.categories 
      : ['Streaming', 'Herramientas digitales', 'Inteligencia artificial', 'Redes sociales', 'IPTV']
  );
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');

  // Customizable reseller announcements
  const [resellerBannerText, setResellerBannerText] = useState(
    config.resellerBannerText || "¿Quieres emprender y comenzar a vender cuentas premium? 💚 Comunícate con nosotros al WhatsApp y te daremos precios accesibles para revender nuestros productos."
  );
  const [showResellerBanner, setShowResellerBanner] = useState(config.showResellerBanner !== false);
  
  // Admin password updates form
  const [editUser, setEditUser] = useState('777chuchooo@gmail.com');
  const [editPass, setEditPass] = useState('MB_cmd1081.');

  // Products manager states (temp listings)
  const [tempProducts, setTempProducts] = useState<Product[]>([...products]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Create Product Form States
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  // Set default category to first active element in list or fallback
  const [newProductCat, setNewProductCat] = useState(
    config.categories && config.categories.length > 0 ? config.categories[0] : 'Streaming'
  );
  const [newProductImg, setNewProductImg] = useState('');
  const [newProductWA, setNewProductWA] = useState('');
  const [newProductStock, setNewProductStock] = useState<number | ''>(50);
  const [newProductInStock, setNewProductInStock] = useState(true);

  // Services manager states (temp listings)
  const [tempServices, setTempServices] = useState<Service[]>([...services]);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Create Service Form States
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceFeatures, setNewServiceFeatures] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('Cpu');
  const [newServiceWA, setNewServiceWA] = useState('');

  // Messages Inbox logs from Firestore query state
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  
  // Storage Uploader helpers
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load and subscribe config credentials and customer inquiries real-time from Firestore
  useEffect(() => {
    // 1. Verify Firestore availability & bootstrap credentials
    const authRef = doc(db, 'configs', 'auth');
    getDoc(authRef).then(async (docSnap) => {
      setIsConnected(true);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // If it was the old default admin placeholder, dynamically upgrade it in Firestore
        if (data.username === 'admin@nexus.com' && data.password === 'password123') {
          const upgradedCreds = {
            username: '777chuchooo@gmail.com',
            password: 'MB_cmd1081.'
          };
          await setDoc(authRef, upgradedCreds);
          setDbCredentials(upgradedCreds);
          setEditUser(upgradedCreds.username);
          setEditPass(upgradedCreds.password);
        } else {
          setDbCredentials(data as AdminAuth);
          setEditUser(data.username || '777chuchooo@gmail.com');
          setEditPass(data.password || 'MB_cmd1081.');
        }
      } else {
        // Bootstrap credential defaults inside Firestore with requested credentials
        try {
          await setDoc(authRef, {
            username: '777chuchooo@gmail.com',
            password: 'MB_cmd1081.'
          });
        } catch (err) {
          console.warn("No credentials bootstrap in Firestore. Running sandbox mode.", err);
        }
      }
    }).catch(err => {
      console.warn("Firestore blocked, locked, or initial setup incomplete. Falling back to local verification.", err);
      setIsConnected(false);
    });

    // 2. Fetch and listen to client message inbox
    const messagesCol = collection(db, 'messages');
    const unsubMessages = onSnapshot(messagesCol, (snap) => {
      const msgs: Message[] = [];
      snap.forEach(docSnap => {
        msgs.push(docSnap.data() as Message);
      });
      // Sort messages descending by creation
      msgs.sort((a, b) => b.id.localeCompare(a.id));
      setInboxMessages(msgs);
    }, (error) => {
      console.error("Messages list socket error:", error);
    });

    return () => unsubMessages();
  }, []);

  // Update listings when parent props change to keep sync
  useEffect(() => {
    setTempProducts([...products]);
  }, [products]);

  useEffect(() => {
    setTempServices([...services]);
  }, [services]);

  // Handle Login Check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = authUsername.trim();
    const cleanPass = authPassword.trim();

    // Verifies against credentials in Firestore config (or standard fallback credentials if Firestore disconnected or loading)
    if (
      (cleanUser === dbCredentials.username && cleanPass === dbCredentials.password) ||
      (cleanUser === '777chuchooo@gmail.com' && cleanPass === 'MB_cmd1081.')
    ) {
      setIsLoggedIn(true);
      setAuthError('');
      localStorage.setItem('admin_session_active', 'true');
    } else {
      setAuthError('Credenciales incorrectas. Verifique e intente nuevamente.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_session_active');
  };

  // Drag and Drop files handlers (conforming to dragzone upload instructions)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFileToStorage(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFileToStorage(e.target.files[0]);
    }
  };

  // Helper to compress image files to high-performance base64 strings so they can be securely saved directly in products
  const compressImageToBase64 = (file: File, maxWidth = 550, maxHeight = 550, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        
        img.onerror = (err) => {
          console.error("Image loading failed:", err);
          reject(err);
        };
        
        img.src = event.target?.result as string;
      };
      
      reader.onerror = (err) => {
        console.error("FileReader failed:", err);
        reject(err);
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Upload bytes procedure targeting Firebase Storage with automatic direct high-compression base64 flow
  const uploadFileToStorage = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadPercent(10); // Beginning track marker

    try {
      // Bypassing remote storage uploads which are prone to connection timeouts or lack of provisioning
      setUploadPercent(40);
      const base64Url = await compressImageToBase64(file);
      setUploadPercent(80);
      
      // Update form context
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, imageUrl: base64Url });
      } else {
        setNewProductImg(base64Url);
      }
      setUploadPercent(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadPercent(0);
      }, 500);
    } catch (error) {
      console.error("Direct base64 compressor failed:", error);
      alert("No se pudo cargar la imagen. Valida que el archivo no esté corrupto.");
      setIsUploading(false);
      setUploadPercent(0);
    }
  };

  // Save General web settings and administrative credentials
  const handleSaveGeneral = async () => {
    const updatedConfig: StoreConfig = {
      storeName,
      tagline,
      whatsappNumber,
      neonColor,
      aboutText,
      instagramUrl,
      linkedinUrl,
      tiktokUrl,
      categories: categoriesList,
      resellerBannerText,
      showResellerBanner,
      logoUrl,
      heroLogoUrl,
      faviconUrl,
      resellerIconUrl
    };

    // 1. Commit store general settings to Firestore
    try {
      const configDoc = doc(db, 'configs', 'store');
      await setDoc(configDoc, updatedConfig);
    } catch (err) {
      console.warn("Firestore config save error:", err);
    }

    // 2. Commit updated Administrative credentials to Firestore configs/auth
    try {
      const authDoc = doc(db, 'configs', 'auth');
      const payload: AdminAuth = {
        username: editUser.trim(),
        password: editPass.trim()
      };
      await setDoc(authDoc, payload);
      setDbCredentials(payload);
    } catch (err) {
      console.warn("Firestore auth credentials save error:", err);
    }

    // Call callback to sync with site React layout immediately
    onSave(updatedConfig, tempProducts, tempServices);
  };

  // CREATE: Product insert
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const prodId = `prod-${Date.now()}`;
    const newProduct: Product = {
      id: prodId,
      name: newProductName.trim(),
      price: sanitizeAndFormatPrice(newProductPrice),
      description: newProductDesc.trim() || 'Descripción detallada del nuevo recurso digital futurista.',
      category: newProductCat || 'Streaming',
      imageUrl: newProductImg,
      whatsappMessage: newProductWA.trim() || '',
      views: 0,
      stock: newProductStock === '' ? undefined : Number(newProductStock),
      inStock: newProductInStock
    };

    // 1. Write to Firestore Collection (conforming real persistence rule)
    try {
      await setDoc(doc(db, 'products', prodId), newProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${prodId}`);
    }

    // Update temp states callback
    const updatedList = [...tempProducts, newProduct];
    setTempProducts(updatedList);
    onSave(config, updatedList, tempServices);

    // Reset Form fields
    setNewProductName('');
    setNewProductPrice('');
    setNewProductDesc('');
    setNewProductImg('');
    setNewProductWA('');
    setNewProductStock(50);
    setNewProductInStock(true);
  };

  // UPDATE: Existing product edit
  const handleUpdateProductSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const sanitizedProduct = {
      ...editingProduct,
      price: sanitizeAndFormatPrice(editingProduct.price)
    };

    // 1. Write update to Firestore Document
    try {
      await setDoc(doc(db, 'products', sanitizedProduct.id), sanitizedProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${sanitizedProduct.id}`);
    }

    // Map through array
    const updated = tempProducts.map(p => p.id === sanitizedProduct.id ? sanitizedProduct : p);
    setTempProducts(updated);
    onSave(config, updated, tempServices);
    setEditingProduct(null);
  };

  // DELETE: Product removal
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto del catálogo permanente?")) return;

    // 1. Write delete to Firestore Document
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }

    const updated = tempProducts.filter(p => p.id !== id);
    setTempProducts(updated);
    onSave(config, updated, tempServices);
  };

  // CREATE: Service insert
  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const featureList = newServiceFeatures
      ? newServiceFeatures.split(',').map(f => f.trim()).filter(Boolean)
      : ['Soporte exclusivo', 'Optimización total de rendimiento'];

    const srvId = `srv-${Date.now()}`;
    const newService: Service = {
      id: srvId,
      name: newServiceName.trim(),
      description: newServiceDesc.trim() || 'Servicio técnico especializado.',
      features: featureList,
      iconName: newServiceIcon,
      whatsappMessage: newServiceWA.trim() || ''
    };

    // 1. Write to Firestore Collection
    try {
      await setDoc(doc(db, 'services', srvId), newService);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `services/${srvId}`);
    }

    const updatedList = [...tempServices, newService];
    setTempServices(updatedList);
    onSave(config, updatedList, updatedList);

    // Reset fields
    setNewServiceName('');
    setNewServiceDesc('');
    setNewServiceFeatures('');
    setNewServiceWA('');
  };

  // UPDATE: Existing service edit
  const handleUpdateServiceSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    // 1. Write update to Firestore Document
    try {
      await setDoc(doc(db, 'services', editingService.id), editingService);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `services/${editingService.id}`);
    }

    const updated = tempServices.map(s => s.id === editingService.id ? editingService : s);
    setTempServices(updated);
    onSave(config, tempProducts, updated);
    setEditingService(null);
  };

  // DELETE: Service removal
  const handleDeleteService = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas dar de baja este servicio profesional?")) return;

    // 1. Write delete to Firestore Document
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
    }

    const updated = tempServices.filter(s => s.id !== id);
    setTempServices(updated);
    onSave(config, tempProducts, updated);
  };

  // INBOX DELETE: Customers Inquiry delete
  const handleDeleteInboxMessage = async (id: string) => {
    if (!window.confirm("¿Borrar este mensaje de contacto de la bandeja? Esta acción modificará Firestore en vivo.")) return;

    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
    }
  };

  // Calculate views totals and ordered leaderboard for Dashboard
  const totalViews = tempProducts.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const mostViewedProducts = [...tempProducts].sort((a, b) => (b.views || 0) - (a.views || 0));

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="fixed inset-y-0 right-0 w-full sm:max-w-xl md:max-w-2xl z-50 bg-[#050506]/98 border-l border-gray-900 shadow-2xl flex flex-col h-screen backdrop-blur-md"
    >
      {/* Drawer Header Area */}
      <div className="p-6 border-b border-gray-900 flex items-center justify-between bg-gray-950/40">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 bg-gray-900 rounded-xl flex items-center justify-center border ${colorStuff.border} ${colorStuff.glow}`}>
            <Sliders className={`h-5 w-5 ${colorStuff.text}`} />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-lg text-white">Consola de Administración</h2>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                Firestore {isConnected ? 'Sincronizado' : 'Local Sandbox'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl border border-gray-900 bg-gray-950 hover:bg-gray-900 text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* --- GUARD PANEL IF NOT AUTHENTICATED --- */}
      {!isLoggedIn ? (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-center items-center space-y-6 font-sans">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/5">
            <Lock className="h-7 w-7 text-red-400" />
          </div>

          <div className="text-center space-y-2 max-w-sm">
            <h3 className="font-display font-bold text-white text-xl">Acceso Restringido</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Ingresa los códigos de seguridad cifrados de administrador de Nexus para acceder al panel de base de datos en tiempo real.
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4 pt-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1 rounded uppercase tracking-wider">Usuario Admin email</label>
              <input
                type="email"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Ej: admin@nexus.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1 rounded uppercase tracking-wider">Clave Secreta</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
              />
            </div>

            {authError && (
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-xs text-left">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-display font-black tracking-widest text-xs uppercase cursor-pointer ${colorStuff.buttonBg} transition-all`}
            >
              Autenticar Acceso
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Admin Navigation System */}
          <div className="grid grid-cols-4 border-b border-gray-900 bg-gray-950/20 text-[10px] font-mono font-black tracking-widest uppercase">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
                activeTab === 'dashboard' ? colorStuff.tabActive : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
                activeTab === 'general' ? colorStuff.tabActive : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>General</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
                activeTab === 'products' ? colorStuff.tabActive : 'border-transparent text-gray-500 hover:text-gray-350'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Productos</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`py-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
                activeTab === 'services' ? colorStuff.tabActive : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Servicios</span>
            </button>
          </div>

          {/* Drawer Body Scroll containing content tabs */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">

            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 font-sans">
                {/* Stats cards grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl border border-gray-900 bg-gray-950/50 flex flex-col space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Catálogo</span>
                    <span className="text-2xl font-display font-black text-white">{tempProducts.length}</span>
                    <span className="text-[9px] text-gray-400 font-mono">PRODUCTOS</span>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-900 bg-gray-950/50 flex flex-col space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Servicios</span>
                    <span className="text-2xl font-display font-black text-white">{tempServices.length}</span>
                    <span className="text-[9px] text-gray-400 font-mono">SERVICIOS</span>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-900 bg-gray-950/50 flex flex-col space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Mensajes</span>
                    <span className="text-2xl font-display font-black text-white">{inboxMessages.length}</span>
                    <span className="text-[9px] text-gray-400 font-mono">EN FIRESTORE</span>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-900 bg-gray-950/50 flex flex-col space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Total Conversión</span>
                    <span className="text-2xl font-display font-black text-white">{totalViews}</span>
                    <span className="text-[9px] text-gray-400 font-mono">CLIC EN COMPRAR</span>
                  </div>
                </div>

                {/* Dashboard layout with Most Viewed & Inbox message list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Lead metrics order stats */}
                  <div className="space-y-4">
                    <h4 className="font-mono text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span>Conversión por Producto</span>
                    </h4>

                    <div className="p-4 rounded-2xl border border-gray-900 bg-gray-950/40 space-y-3 max-h-[290px] overflow-y-auto">
                      {mostViewedProducts.map((p, idx) => (
                        <div key={p.id} className="flex justify-between items-center text-xs pb-2 border-b border-gray-950/40">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-gray-500 font-mono">0{idx + 1}</span>
                            <span className="text-white font-bold truncate max-w-[150px]">{p.name}</span>
                          </div>
                          <span className={`${colorStuff.text} font-mono font-bold`}>{p.views || 0} clicks</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer messages inbox */}
                  <div className="space-y-4">
                    <h4 className="font-mono text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span>Bandeja de Contactos ({inboxMessages.length})</span>
                    </h4>

                    <div className="p-4 rounded-2xl border border-gray-900 bg-gray-950/40 space-y-3 max-h-[290px] overflow-y-auto">
                      {inboxMessages.length === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-500 font-light">
                          No hay mensajes recibidos aún.
                        </div>
                      ) : (
                        inboxMessages.map((msg) => (
                          <div key={msg.id} className="p-3 rounded-xl border border-gray-900/40 bg-gray-955 text-xs space-y-1.5 hover:border-gray-800 transition-colors">
                            <div className="flex justify-between items-start">
                              <span className="text-white font-black">{msg.name}</span>
                              <button 
                                onClick={() => handleDeleteInboxMessage(msg.id)}
                                className="p-1 rounded bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500 transition-colors cursor-pointer"
                                title="Borrar mensaje"
                              >
                                <Trash className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950/20 border border-cyan-900/30 text-cyan-400 mt-1 inline-block uppercase">
                              {msg.topic || 'General'}
                            </span>
                            <p className="text-gray-400 text-[11px] leading-relaxed italic pr-1 bg-black/20 p-2 rounded-lg mt-1 font-sans">
                              "{msg.message}"
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GENERAL SETTINGS */}
            {activeTab === 'general' && (
              <div className="space-y-6 text-sm font-sans">
                {/* Visual configuration */}
                <h3 className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest">Información Base de la Web</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-1.5">Nombre de la Tienda</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-1.5">Tagline Principal</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-1.5">Descripción de la Tienda (Hero)</label>
                    <textarea
                      rows={3}
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-sm transition-colors resize-none font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-1.5">WhatsApp de Destino (Para botones auto-sincronizados)</label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Ej: 3143497151"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs transition-colors font-mono"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Sincroniza dinámicamente todo el canal de ventas directamente a este contacto.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-2">Color de Acento Neón de la Empresa</label>
                    <div className="flex items-center space-x-3.5">
                      {(['white', 'cyan', 'blue', 'purple', 'emerald', 'indigo'] as const).map((col) => {
                        const colHex = {
                          white: 'bg-white shadow-white/20',
                          cyan: 'bg-cyan-500 shadow-cyan-500/20',
                          blue: 'bg-blue-500 shadow-blue-500/20',
                          purple: 'bg-purple-500 shadow-purple-500/20',
                          emerald: 'bg-emerald-500 shadow-emerald-500/20',
                          indigo: 'bg-indigo-500 shadow-indigo-500/20'
                        };
                        return (
                          <button
                            key={col}
                            onClick={() => setNeonColor(col)}
                            className={`w-7 h-7 rounded-full ${colHex[col]} shadow-lg cursor-pointer transition-all ${
                              neonColor === col ? 'ring-2 ring-white ring-offset-4 ring-offset-[#050506] scale-110' : 'opacity-60 hover:opacity-100'
                            }`}
                            title={col}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Social media URLs */}
                <h3 className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest pt-4">Nodos Sociales</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-1.5">Instagram URL</label>
                    <input
                      type="text"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-1.5">LinkedIn URL</label>
                    <input
                      type="text"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-1.5">TikTok URL</label>
                    <input
                      type="text"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs transition-colors"
                    />
                  </div>
                </div>

                {/* SECCIÓN DE BRANDING Y LOGOS */}
                <h3 className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest pt-4">Identidad Visual & Branding</h3>
                <div className="p-4 rounded-2xl border border-gray-900 bg-gray-950/45 space-y-5">
                  <p className="text-[11px] text-gray-400 pb-1 border-b border-gray-900">
                    Sube u organiza la identidad visual de tu marca: logos corporativos, favicon y anuncios publicitarios sin modificar código de forma sencilla.
                  </p>

                  {/* 1. Logo Principal (Header/Footer) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold text-gray-300">Logo Principal de la Web (Header & Footer)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Ingresa URL del logo o sube uno nuevo..."
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs transition-colors"
                      />
                      <label className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-mono font-semibold cursor-pointer text-center flex items-center justify-center border border-gray-800 transition-colors">
                        Subir Imagen
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              try {
                                const base64 = await compressImageToBase64(e.target.files[0], 250, 250);
                                setLogoUrl(base64);
                              } catch (err) {
                                alert("Error al subir el logo");
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    {logoUrl && (
                      <div className="flex items-center space-x-3 p-2 bg-gray-950 rounded-xl border border-gray-900 w-fit">
                        <img src={logoUrl} alt="Preview Logo" className="h-10 w-10 object-contain rounded" referrerPolicy="no-referrer" />
                        <button type="button" onClick={() => setLogoUrl('')} className="text-[10px] uppercase font-mono text-red-500 hover:text-red-400 font-bold transition-colors">Remover</button>
                      </div>
                    )}
                  </div>

                  {/* 2. Logo Grande (Hero Page) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold text-gray-300">Logo Gigante de Presentación (Sección Hero)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Ingresa URL o sube una imagen destacada..."
                        value={heroLogoUrl}
                        onChange={(e) => setHeroLogoUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs transition-colors"
                      />
                      <label className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-mono font-semibold cursor-pointer text-center flex items-center justify-center border border-gray-800 transition-colors">
                        Subir Imagen
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              try {
                                const base64 = await compressImageToBase64(e.target.files[0], 350, 350);
                                setHeroLogoUrl(base64);
                              } catch (err) {
                                alert("Error al subir la imagen");
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    {heroLogoUrl && (
                      <div className="flex items-center space-x-3 p-2 bg-gray-950 rounded-xl border border-gray-900 w-fit">
                        <img src={heroLogoUrl} alt="Preview Hero Logo" className="h-14 w-14 object-contain rounded" referrerPolicy="no-referrer" />
                        <button type="button" onClick={() => setHeroLogoUrl('')} className="text-[10px] uppercase font-mono text-red-500 hover:text-red-400 font-bold transition-colors">Remover</button>
                      </div>
                    )}
                  </div>

                  {/* 3. Favicon (Pestaña Navegador) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold text-gray-300">Favicon Corporativo (Icono superior de pestaña)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Ingresa URL de icono .ico / .png o sube..."
                        value={faviconUrl}
                        onChange={(e) => setFaviconUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs transition-colors"
                      />
                      <label className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-mono font-semibold cursor-pointer text-center flex items-center justify-center border border-gray-800 transition-colors">
                        Subir Imagen
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              try {
                                const base64 = await compressImageToBase64(e.target.files[0], 64, 64);
                                setFaviconUrl(base64);
                              } catch (err) {
                                alert("Error al subir el favicon");
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    {faviconUrl && (
                      <div className="flex items-center space-x-3 p-2 bg-gray-950 rounded-xl border border-gray-900 w-fit">
                        <img src={faviconUrl} alt="Preview Favicon" className="h-8 w-8 object-contain rounded" referrerPolicy="no-referrer" />
                        <button type="button" onClick={() => setFaviconUrl('')} className="text-[10px] uppercase font-mono text-red-500 hover:text-red-400 font-bold transition-colors">Remover</button>
                      </div>
                    )}
                  </div>

                  {/* 4. Reseller Banner Icon (Anuncio revendedores) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold text-gray-300 font-bold">Icono/Logo de Anuncio de Revendedores</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Ingresa URL o sube para reemplazar la estrella verde..."
                        value={resellerIconUrl}
                        onChange={(e) => setResellerIconUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs transition-colors"
                      />
                      <label className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-mono font-semibold cursor-pointer text-center flex items-center justify-center border border-gray-800 transition-colors">
                        Subir Imagen
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              try {
                                const base64 = await compressImageToBase64(e.target.files[0], 120, 120);
                                setResellerIconUrl(base64);
                              } catch (err) {
                                alert("Error al subir el icono de revendedores");
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    {resellerIconUrl && (
                      <div className="flex items-center space-x-3 p-2 bg-gray-950 rounded-xl border border-gray-900 w-fit">
                        <img src={resellerIconUrl} alt="Preview Reseller" className="h-10 w-10 object-contain rounded bg-emerald-500/10 border border-emerald-500/20 p-1" referrerPolicy="no-referrer" />
                        <button type="button" onClick={() => setResellerIconUrl('')} className="text-[10px] uppercase font-mono text-red-500 hover:text-red-400 font-bold transition-colors">Remover</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* CATEGÓRICAS MANAGER SECTION */}
                <h3 className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest pt-4">Categorías Personalizadas</h3>
                <div className="p-4 rounded-2xl border border-gray-900 bg-gray-950/45 space-y-4">
                  <p className="text-[11px] text-gray-400">
                    Crea, renombra o elimina categorías de tu catálogo. Al renombrar una categoría, todos los productos asignados a ella se actualizarán automáticamente.
                  </p>

                  {/* Add New Category Node Inline */}
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      placeholder="Nueva categoría (Suscripciones, IPTV, etc)"
                      className="flex-1 px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white focus:border-cyan-500 outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newCategoryInput.trim();
                        if (val && !categoriesList.includes(val)) {
                          setCategoriesList([...categoriesList, val]);
                          setNewCategoryInput('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-display font-black text-[10px] uppercase tracking-wider transition-all"
                    >
                      Agregar
                    </button>
                  </div>

                  {/* Quick Categories List Grid with Action Nodes */}
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {categoriesList.map((cat, idx) => {
                      const isEditingThis = editingCategoryIndex === idx;

                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-gray-900 text-xs">
                          {isEditingThis ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={editingCategoryValue}
                                onChange={(e) => setEditingCategoryValue(e.target.value)}
                                className="flex-1 px-2 py-1 rounded bg-gray-950 border border-gray-800 text-white text-xs outline-none focus:border-cyan-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingCategoryValue.trim() && editingCategoryValue.trim() !== cat) {
                                    const oldCat = cat;
                                    const newCat = editingCategoryValue.trim();
                                    
                                    // 1. Rename in local list state
                                    const newList = [...categoriesList];
                                    newList[idx] = newCat;
                                    setCategoriesList(newList);

                                    // 2. Cascade rename across products catalog list to keep data integrated!
                                    const renamedProducts = tempProducts.map(p => {
                                      if (p.category === oldCat) {
                                        return { ...p, category: newCat };
                                      }
                                      return p;
                                    });
                                    setTempProducts(renamedProducts);

                                    // Reset editing state
                                    setEditingCategoryIndex(null);
                                    setEditingCategoryValue('');
                                  } else {
                                    setEditingCategoryIndex(null);
                                  }
                                }}
                                className="px-2 py-1 rounded bg-emerald-500 text-black font-bold font-mono text-[9px]"
                              >
                                OK
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCategoryIndex(null)}
                                className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-[9px]"
                              >
                                CANCELAR
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="font-mono text-gray-300 font-semibold">{cat}</span>
                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    if (idx > 0) {
                                      const newList = [...categoriesList];
                                      const temp = newList[idx];
                                      newList[idx] = newList[idx - 1];
                                      newList[idx - 1] = temp;
                                      setCategoriesList(newList);
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors ${
                                    idx === 0 ? 'opacity-30 cursor-not-allowed bg-transparent' : 'bg-gray-900 hover:bg-gray-800'
                                  }`}
                                  title="Subir"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === categoriesList.length - 1}
                                  onClick={() => {
                                    if (idx < categoriesList.length - 1) {
                                      const newList = [...categoriesList];
                                      const temp = newList[idx];
                                      newList[idx] = newList[idx + 1];
                                      newList[idx + 1] = temp;
                                      setCategoriesList(newList);
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors ${
                                    idx === categoriesList.length - 1 ? 'opacity-30 cursor-not-allowed bg-transparent' : 'bg-gray-900 hover:bg-gray-800'
                                  }`}
                                  title="Bajar"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategoryIndex(idx);
                                    setEditingCategoryValue(cat);
                                  }}
                                  className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                  title="Renombrar categoría"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`¿Estás seguro de eliminar la categoría "${cat}"? Los productos asignados seguirán existiendo, pero se quedarán sin categoría asociada.`)) {
                                      setCategoriesList(categoriesList.filter((_, i) => i !== idx));
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors"
                                  title="Eliminar categoría"
                                >
                                  <Trash className="h-3.5 w-3.5" stroke="currentColor" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ANUNCIO PARA REVENDEDORES CONFIG SECTION */}
                <h3 className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest pt-4">Anuncio para Revendedores</h3>
                <div className="p-4 rounded-2xl border border-gray-900 bg-gray-950/40 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-900/40">
                    <label className="text-xs font-mono font-semibold text-gray-300">Mostrar Anuncio de Revendedor</label>
                    <button
                      type="button"
                      onClick={() => setShowResellerBanner(!showResellerBanner)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-mono tracking-widest font-extrabold uppercase transition-all flex items-center space-x-1 ${
                        showResellerBanner 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' 
                          : 'bg-gray-950 text-gray-500 border border-gray-900'
                      }`}
                    >
                      <span>{showResellerBanner ? 'Activado' : 'Desactivado'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-1.5">Texto del Anuncio</label>
                    <textarea
                      rows={3}
                      value={resellerBannerText}
                      onChange={(e) => setResellerBannerText(e.target.value)}
                      placeholder="Escribe el mensaje llamativo para captar revendedores..."
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs leading-relaxed resize-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      El texto soporta emojis clásicos. Los interesados serán redirigidos a chatear por WhatsApp con una plantilla prediseñada para solicitar precios de revendedor.
                    </p>
                  </div>
                </div>

                {/* Credentials update box */}
                <h3 className="font-mono text-xs font-bold text-red-500/80 uppercase tracking-widest pt-4">Cifrado de Acceso Administrativo</h3>
                <div className="p-4 rounded-2xl border border-gray-900 bg-gray-950/40 space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-1.5">Modificar Usuario (Email)</label>
                    <input
                      type="email"
                      value={editUser}
                      onChange={(e) => setEditUser(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-red-500 outline-none text-xs transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-400 mb-1.5">Modificar Contraseña Secreta</label>
                    <input
                      type="password"
                      value={editPass}
                      onChange={(e) => setEditPass(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-red-500 outline-none text-xs transition-colors font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">
                    Esto rescribirá el documento permanente de credenciales cifradas en tu base de datos Firestore.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS MANAGER */}
            {activeTab === 'products' && (
              <div className="space-y-6">

                {/* EDIT MODE FORM BLOCK IF ACTIVE */}
                {editingProduct ? (
                  <form onSubmit={handleUpdateProductSave} className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 space-y-4 text-sm font-sans">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-900">
                      <h4 className="font-bold text-white text-xs flex items-center space-x-2">
                        <Pencil className="h-4 w-4 text-cyan-400 animate-pulse" />
                        <span>Modificar Producto: {editingProduct.name}</span>
                      </h4>
                      <button 
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="text-xs font-black font-mono text-gray-500 hover:text-white px-2 py-1 rounded bg-black/40"
                      >
                        CANCELAR
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Precio</label>
                        <input
                          type="text"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs text-cyan-400 font-mono font-black"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Categoría</label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs"
                        >
                          {categoriesList.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Acción WhatsApp Especial (Opcional)</label>
                        <input
                          type="text"
                          value={editingProduct.whatsappMessage || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, whatsappMessage: e.target.value })}
                          placeholder="Hola, quiero adquirir la herramienta..."
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Cantidad en Stock (0 para Agotado)</label>
                        <input
                          type="number"
                          min="0"
                          value={editingProduct.stock !== undefined && editingProduct.stock !== null ? editingProduct.stock : ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value === '' ? undefined : Number(e.target.value) })}
                          placeholder="Sin límite artificial"
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Estado de Disponibilidad</label>
                        <select
                          value={editingProduct.inStock !== false ? 'true' : 'false'}
                          onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.value === 'true' })}
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs"
                        >
                          <option value="true">🟢 DISPONIBLE / ACTIVO</option>
                          <option value="false">🔴 AGOTADO / INACTIVO</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Descripción del Producto</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs font-light resize-none"
                        required
                      />
                    </div>

                    {/* Drag and Drop uploader region (rules conforming) */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1.5">Imagen del Producto (Subir o Ingresar URL)</label>
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                          dragActive 
                            ? colorStuff.cardActive 
                            : 'border-gray-900 bg-gray-950/20 hover:border-gray-800'
                        }`}
                      >
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden" 
                        />
                        {isUploading ? (
                          <div className="space-y-2">
                            <Upload className="mx-auto h-6 w-6 text-cyan-400 animate-bounce" />
                            <p className="text-[11px] text-gray-400 font-mono">Subiendo archivo a Firebase Storage... {uploadPercent}%</p>
                            <div className="w-24 mx-auto bg-gray-900 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-400" style={{ width: `${uploadPercent}%` }} />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <Upload className="mx-auto h-6 w-6 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                            <p className="text-xs text-white font-medium">Arrastra tu imagen de portada aquí, o presiona para buscar</p>
                            <p className="text-[9px] text-gray-500">FORMATOS SEGUROS: PNG, JPG o WEBP</p>
                          </div>
                        )}
                      </div>

                      {/* Manual Image URL textinput */}
                      <input
                        type="text"
                        value={editingProduct.imageUrl || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                        placeholder="Alternativo: URL directa de imagen (por ejemplo, https://...)"
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs mt-3 font-mono"
                      />

                      {/* Display thumbnail preview for edit flow */}
                      {editingProduct.imageUrl && (
                        <div className="mt-3 relative w-full h-28 rounded-xl overflow-hidden border border-gray-900 bg-gray-950 flex items-center justify-center">
                          <img 
                            src={editingProduct.imageUrl} 
                            alt="Vista previa" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-gray-400 hover:text-white hover:bg-black transition-all cursor-pointer"
                            title="Eliminar imagen"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl text-xs font-display font-black tracking-wide cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/10 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>APLICAR CAMBIOS</span>
                    </button>
                  </form>
                ) : (
                  /* Standard Create new Form */
                  <form onSubmit={handleAddProductSubmit} className="p-4 rounded-2xl border border-gray-900 bg-gray-950/55 space-y-4 text-sm font-sans">
                    <h4 className="font-sans font-bold text-white text-xs flex items-center space-x-2">
                      <Plus className={`h-4 w-4 ${colorStuff.text}`} />
                      <span>Agregar Nuevo Licencia / Producto</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Nombre Comercial</label>
                        <input
                          type="text"
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="Ej: Licencia Pro Automatizadora"
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs placeholder-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Precio de Venta</label>
                        <input
                          type="text"
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(e.target.value)}
                          placeholder="Ej: S/ 29.90"
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs font-mono placeholder-gray-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Categoría General</label>
                        <select
                          value={newProductCat}
                          onChange={(e) => setNewProductCat(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs"
                        >
                          {categoriesList.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Mensaje WhatsApp Predefinido</label>
                        <input
                          type="text"
                          value={newProductWA}
                          onChange={(e) => setNewProductWA(e.target.value)}
                          placeholder="Mensaje de compra personalizada"
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs placeholder-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Cantidad Inicial en Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={newProductStock}
                          onChange={(e) => setNewProductStock(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Ej: 50"
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Estado de Disponibilidad</label>
                        <select
                          value={newProductInStock ? 'true' : 'false'}
                          onChange={(e) => setNewProductInStock(e.target.value === 'true')}
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs"
                        >
                          <option value="true">🟢 DISPONIBLE / ACTIVO</option>
                          <option value="false">🔴 AGOTADO / INACTIVO</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Descripción Breve</label>
                      <input
                        type="text"
                        value={newProductDesc}
                        onChange={(e) => setNewProductDesc(e.target.value)}
                        placeholder="Ej: Suite premium para la creación de automatizaciones ciber completas..."
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs font-light placeholder-gray-700"
                        required
                      />
                    </div>

                    {/* Image drag uploader context for create flow */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1.5">Subir Imagen del Producto (Arrastrar, clic o URL)</label>
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-4.5 text-center cursor-pointer transition-all ${
                          dragActive 
                            ? colorStuff.cardActive 
                            : 'border-gray-900 bg-gray-950/20 hover:border-gray-800'
                        }`}
                      >
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden" 
                        />
                        {isUploading ? (
                          <div className="space-y-1.5">
                            <Upload className="mx-auto h-5 w-5 text-cyan-400 animate-bounce" />
                            <p className="text-[10px] text-gray-400 font-mono">Procesando: {uploadPercent}%</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="mx-auto h-5 w-5 text-gray-600" />
                            <p className="text-xs text-white">Arrastra o haz clic aquí</p>
                            <p className="text-[9px] text-gray-500">Opcional, de lo contrario se autogenera degradado</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Manual Image URL input for Create form to match Edit form */}
                      <input
                        type="text"
                        value={newProductImg || ''}
                        onChange={(e) => setNewProductImg(e.target.value)}
                        placeholder="Alternativo: URL directa de imagen (por ejemplo, https://...)"
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs mt-3 font-mono placeholder-gray-800"
                      />

                      {/* Display thumbnail preview for create flow */}
                      {newProductImg && (
                        <div className="mt-3 relative w-full h-28 rounded-xl overflow-hidden border border-gray-900 bg-gray-950 flex items-center justify-center">
                          <img 
                            src={newProductImg} 
                            alt="Vista previa" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setNewProductImg('')}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-gray-400 hover:text-white hover:bg-black transition-all cursor-pointer"
                            title="Eliminar imagen"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 rounded-xl text-xs font-display font-black tracking-widest cursor-pointer ${colorStuff.buttonBg} shadow-lg transition-all`}
                    >
                      INSERTAR PRODUCTO EN ACCIÓN
                    </button>
                  </form>
                )}

                {/* Current Products list with CRUD edits */}
                <div className="space-y-4">
                  <h4 className="font-mono text-xs font-black text-gray-500 uppercase tracking-widest">Catálogo Actual en Firestore</h4>
                  
                  <div className="space-y-2.5">
                    {tempProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-900 bg-gray-950/80">
                        <div className="flex-1 min-w-0 pr-4 font-sans">
                          <div className="flex items-center space-x-2">
                            <span className="text-white text-xs font-bold truncate">{p.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-gray-900 border border-gray-800 text-gray-400">{p.category}</span>
                          </div>
                          <div className="flex items-center space-x-2.5 mt-1 text-[10px]">
                            <span className={`${colorStuff.text} font-mono font-bold uppercase`}>{p.price}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400 font-mono">{p.views || 0} visitas</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-2 rounded-xl border border-cyan-950 bg-cyan-500/5 text-cyan-400 hover:text-white hover:bg-cyan-500 transition-all cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 rounded-xl border border-red-950 bg-red-500/5 text-red-500 hover:text-white hover:bg-red-500 transition-all cursor-pointer"
                            title="Borrar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: SERVICES MANAGER */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                
                {/* EDIT SERVICE POPULATED FORM */}
                {editingService ? (
                  <form onSubmit={handleUpdateServiceSave} className="p-4.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 text-sm font-sans">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-900">
                      <h4 className="font-bold text-white text-xs flex items-center space-x-2">
                        <Pencil className="h-4 w-4 text-emerald-400 animate-pulse" />
                        <span>Modificar Servicio: {editingService.name}</span>
                      </h4>
                      <button 
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="text-xs font-black font-mono text-gray-500 hover:text-white px-2 py-1 rounded bg-black/40"
                      >
                        CANCELAR
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Título del Servicio</label>
                        <input
                          type="text"
                          value={editingService.name}
                          onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Lucide Icono</label>
                        <select
                          value={editingService.iconName}
                          onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs"
                        >
                          <option value="Cpu">Cpu (Tech/IA)</option>
                          <option value="Video">Video (Cine/Edición)</option>
                          <option value="Layout">Layout (Diseño/Web)</option>
                          <option value="Wrench">Wrench (Soporte)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Descripción</label>
                      <textarea
                        rows={2}
                        value={editingService.description}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs resize-none font-light"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Características (Separar por Comas)</label>
                      <input
                        type="text"
                        value={editingService.features.join(', ')}
                        onChange={(e) => setEditingService({ ...editingService, features: e.target.value.split(',').map(f => f.trim()).filter(Boolean) })}
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Mensaje de WhatsApp para Servicio (Opcional)</label>
                      <input
                        type="text"
                        value={editingService.whatsappMessage || ''}
                        onChange={(e) => setEditingService({ ...editingService, whatsappMessage: e.target.value })}
                        placeholder="Mensaje de canal de atención..."
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl text-xs font-display font-black tracking-wide cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>GUARDAR CAMBIOS</span>
                    </button>
                  </form>
                ) : (
                  /* Create new Service block */
                  <form onSubmit={handleAddServiceSubmit} className="p-4 rounded-2xl border border-gray-900 bg-gray-950/55 space-y-4 text-sm font-sans flex flex-col">
                    <h4 className="font-sans font-bold text-white text-xs flex items-center space-x-2">
                      <Plus className={`h-4 w-4 ${colorStuff.text}`} />
                      <span>Agregar Nuevo Servicio</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Título del Servicio</label>
                        <input
                          type="text"
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          placeholder="Ej: Automatización con Zapier"
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs placeholder-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Lucide Icono</label>
                        <select
                          value={newServiceIcon}
                          onChange={(e) => setNewServiceIcon(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs text-cyan-400"
                        >
                          <option value="Cpu">Cpu (Tech/IA)</option>
                          <option value="Video">Video (Cine/Edición)</option>
                          <option value="Layout">Layout (Diseño/Web)</option>
                          <option value="Wrench">Wrench (Soporte)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Descripción del Servicio</label>
                      <textarea
                        rows={2}
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        placeholder="Ej: Conectamos tus apps diarias para automatizar al 100%..."
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs resize-none font-light placeholder-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">Características Especiales (Separa por Comas)</label>
                      <input
                        type="text"
                        value={newServiceFeatures}
                        onChange={(e) => setNewServiceFeatures(e.target.value)}
                        placeholder="Ej: Integración total, Panel de control, Soporte 24/7"
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs placeholder-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1">WhatsApp de Atención Servicio</label>
                      <input
                        type="text"
                        value={newServiceWA}
                        onChange={(e) => setNewServiceWA(e.target.value)}
                        placeholder="Mensaje de compra o interés de atención técnica"
                        className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-white focus:border-cyan-500 outline-none text-xs placeholder-gray-700"
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 rounded-xl text-xs font-display font-black tracking-widest cursor-pointer ${colorStuff.buttonBg} transition-all`}
                    >
                      INSERTAR SERVICIO EN ACCIÓN
                    </button>
                  </form>
                )}

                {/* Current Services List */}
                <div className="space-y-4">
                  <h4 className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest">Servicios Ofrecidos en Firestore</h4>
                  
                  <div className="space-y-2.5">
                    {tempServices.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-900 bg-gray-950/80">
                        <div className="flex-1 min-w-0 pr-4 font-sans">
                          <div className="flex items-center space-x-2">
                            <span className="text-white text-xs font-bold truncate">{s.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">({s.iconName})</span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 font-light">{s.description}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingService(s)}
                            className="p-2 rounded-xl border border-cyan-950 bg-cyan-500/5 text-cyan-400 hover:text-white hover:bg-cyan-500 transition-all cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(s.id)}
                            className="p-2 rounded-xl border border-red-950 bg-red-500/5 text-red-500 hover:text-white hover:bg-red-500 transition-all cursor-pointer"
                            title="Borrar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Logout floating button bar inside workspace drawer */}
            <div className="pt-6 flex justify-between items-center text-xs font-mono text-gray-500 border-t border-gray-950">
              <span>ADMIN SESIÓN: ACTIVA</span>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-red-950/40 bg-red-500/5 hover:bg-red-500 text-red-400 hover:text-white transition-all cursor-pointer"
              >
                CERRAR SESIÓN
              </button>
            </div>
          </div>

          {/* Drawer Actions Footer (Saves General configurations) */}
          <div className="p-6 border-t border-gray-900 bg-gray-950/80 flex items-center space-x-3">
            <button
              onClick={onRestore}
              title="Restaurar a los productos y textos predeterminados de la plantilla"
              className="p-3.5 rounded-xl border border-gray-900 bg-gray-950 text-gray-400 hover:text-white hover:border-gray-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={handleSaveGeneral}
              className={`flex-1 py-3.5 rounded-xl font-display font-bold text-sm tracking-wide text-white cursor-pointer flex items-center justify-center space-x-2 ${colorStuff.buttonBg} shadow-lg active:scale-95 transition-all`}
            >
              <Save className="h-4 w-4" />
              <span>Guardar Todo en Firestore</span>
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
