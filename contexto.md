# Contexto del Proyecto: Tienda MB Digital

Este archivo sirve como referencia completa y contexto técnico para que cualquier Inteligencia Artificial o desarrollador que tome el control del proyecto entienda inmediatamente su estructura, arquitectura de datos, stack de desarrollo y reglas críticas de modificación.

---

## 1. Descripción del Proyecto
**Tienda MB Digital** es una landing page de comercio electrónico autoadministrable, orientada a la comercialización de licencias digitales de software, cuentas de streaming (Netflix, IPTV), herramientas con IA y servicios profesionales de tecnología.

* **Estética:** Estilo ciberpunk / futurista oscuro (`#050506`), con efectos de glassmorphism (`backdrop-filter`) y sombras con destellos de neón personalizables (azul, púrpura, verde esmeralda, índigo, blanco, cian).
* **Interacción de Compra:** Al hacer clic en "Comprar" en el catálogo o solicitar un servicio, el cliente es redirigido a la API de WhatsApp con un mensaje pre-configurado que incluye el nombre del producto y su precio.
* **Consola de Administración:** Accesible desde la barra de navegación. Protegida con autenticación, permite configurar en tiempo real la información de la tienda, colores, categorías, productos, servicios y ver la bandeja de entrada de mensajes de clientes.

---

## 2. Stack Tecnológico
* **Core:** React 19 + TypeScript.
* **Herramienta de Empaquetado:** Vite 6.
* **Estilos (CSS):** Tailwind CSS v4 (integración mediante `@tailwindcss/vite` y configuración de temas dentro de `src/index.css`).
* **Animaciones:** Motion (`motion/react`).
* **Iconografía:** Lucide React (`lucide-react`).
* **Base de Datos & Backend:** Firebase (Cloud Firestore, Auth, Storage).

---

## 3. Estructura de Directorios

```text
TIENDA VIRTUAL MAQUETA/
├── firebase-applet-config.json    # Configuración de credenciales de Firebase
├── firebase-blueprint.json        # Estructura del proyecto Firebase
├── firestore.rules                # Reglas de acceso a base de datos de Firestore
├── index.html                     # Archivo HTML principal con metadatos SEO
├── package.json                   # Dependencias y scripts de ejecución
├── tsconfig.json                  # Configuración del compilador TypeScript
├── vite.config.ts                 # Configuración del bundler Vite con plugins
├── public/                        # Recursos estáticos públicos
└── src/
    ├── App.tsx                    # Componente raíz. Maneja estados locales y Firestore.
    ├── firebase.ts                # Conexión, inicialización y manejo de errores de Firebase.
    ├── index.css                  # Hoja de estilos global, temas y fuentes de Google Fonts.
    ├── main.tsx                   # Punto de entrada de React en el DOM.
    ├── types.ts                   # Declaración de interfaces TypeScript.
    ├── utils.ts                   # Utilidades del sistema (colores de neón y enlaces de WhatsApp).
    ├── components/                # Componentes modulares de interfaz
    │   ├── AdminPanel.tsx         # Panel del administrador (Estadísticas, ABM, Inbox).
    │   ├── Catalog.tsx            # Grilla del catálogo con filtros de categorías.
    │   ├── CyberBackground.tsx    # Fondo global dinámico de nebulosa y canvas de partículas.
    │   ├── ContactForm.tsx        # Formulario de contacto directo con envío a Firestore.
    │   ├── Footer.tsx             # Pie de página futurista.
    │   ├── Hero.tsx               # Portada con animación del logo.
    │   ├── MBDigitalLogo.tsx      # SVG del logo oficial de MB DIGITAL.
    │   ├── Navbar.tsx             # Barra de navegación con anclas de scroll.
    │   ├── ResellerBanner.tsx     # Cartelera publicitaria para revendedores.
    │   ├── Services.tsx           # Sección de servicios profesionales.
    │   └── WhatsAppButton.tsx     # Botón flotante persistente de WhatsApp.
    └── data/
        └── defaults.ts            # Valores y datos iniciales por defecto (fallback).
```

---

## 4. Base de Datos: Modelado en Firestore

La base de datos utiliza Google Cloud Firestore. A continuación se detallan las colecciones y documentos estructurados:

### A. Configuración General (`configs/store`)
Mapeado al tipo `StoreConfig` de `src/types.ts`:
* `storeName`: Nombre de la tienda.
* `tagline`: Eslogan principal del Hero.
* `whatsappNumber`: Número de teléfono de destino (Por defecto: `'51925958185'`).
* `neonColor`: Color del tema visual (ej: `"cyan"`, `"blue"`, `"purple"`, `"emerald"`, `"white"`, `"indigo"`).
* `aboutText`: Texto descriptivo en la portada.
* `categories`: Listado de categorías activas para el catálogo.
* `resellerBannerText`: Mensaje del banner de revendedores.
* `showResellerBanner`: Booleano para mostrar/ocultar el banner.
* `logoUrl` / `heroLogoUrl` / `faviconUrl` / `resellerIconUrl`: Enlaces base64 o URLs de imágenes de marca.

### B. Credenciales del Administrador (`configs/auth`)
Mapeado al tipo `AdminAuth`:
* `username`: Email del administrador (Por defecto: `'777chuchooo@gmail.com'`).
* `password`: Clave de acceso (Por defecto: `'MB_cmd1081.'`).

### C. Colección de Productos (`products/{productId}`)
Mapeado al tipo `Product`:
* `id`: ID único (ej: `prod-171926...`).
* `name`: Nombre comercial.
* `price`: Precio con moneda (ej: `"S/ 32.00"` o `"S/ 170.00 / año"`).
* `description`: Detalle del producto.
* `category`: Categoría asignada (debe coincidir con la lista de categorías).
* `imageUrl`: Imagen del producto en formato Base64 o URL externa.
* `whatsappMessage`: Mensaje personalizado opcional para la compra.
* `views`: Contador numérico de clics en "Comprar".
* `stock`: Número entero opcional de stock restante.
* `inStock`: Booleano para definir disponibilidad inmediata.

### D. Colección de Servicios (`services/{serviceId}`)
Mapeado al tipo `Service`:
* `id`: ID único.
* `name`: Nombre del servicio técnico.
* `description`: Explicación del servicio.
* `features`: Array de strings con características.
* `iconName`: Nombre del ícono de Lucide React (ej: `"Cpu"`, `"Video"`, `"Layout"`, `"Wrench"`).
* `whatsappMessage`: Mensaje opcional de contacto.

### E. Colección de Mensajes de Contacto (`messages/{messageId}`)
Mapeado al tipo `Message`:
* `id`: ID único.
* `name`: Nombre del remitente.
* `topic`: Categoría de consulta o asunto.
* `message`: Contenido del mensaje enviado desde la web.
* `createdAt`: Fecha de creación de la consulta.

---

## 5. Reglas Críticas para la IA y Desarrolladores

Cuando trabajes en este proyecto, sigue obligatoriamente estas pautas para no romper la funcionalidad:

### ⚠️ Regla de Inicialización de Firestore
En `src/firebase.ts`, la instanciación de Firestore **DEBE** incluir el ID de base de datos provisto en el JSON de configuración para evitar problemas de conexión:
```typescript
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
```
No simplifiques esta línea a `getFirestore(app)` a menos que se defina la base de datos por defecto.

### 🖼️ Carga y Compresión de Imágenes
Para evitar problemas de cuotas en Firebase Storage y configuraciones complejas de permisos, la aplicación comprime las imágenes a formato **Base64** en el cliente antes de guardarlas en Firestore. 
* El método se encuentra en `AdminPanel.tsx` bajo la función `compressImageToBase64`.
* Si editas la subida de imágenes, asegúrate de mantener el redimensionamiento del canvas a un máximo de `550x550px` con calidad `0.75` para no saturar el tamaño del documento de Firestore (límite de 1MB por documento).

### ⚡ Estilos CSS y Colores Dinámicos
Los colores de la web no están cableados a mano con clases estáticas en el HTML. Se derivan del valor `config.neonColor`.
* Para añadir o alterar los estilos de neón, debes modificar la función `getNeonColorClasses` en `src/utils.ts`.
* Esta función retorna un objeto con clases de Tailwind pre-calculadas para bordes, textos, botones y sombras luminosas.
* **Nuevas Variables CSS de Neón (Catálogo):** Se han integrado variables de CSS inline (`--grid-color`, `--scan-color`, `--scan-color-bright`, `--card-hover-border`, `--card-hover-glow`) alimentadas dinámicamente con `colorStuff.accentHex` para cambiar el color de la cuadrícula animada en perspectiva 3D, el haz de escáner láser y los bordes/resplandores de las tarjetas de cristal esmerilado en tiempo real según el tema seleccionado.
* **Tarjetas Tilt Parallax 3D:** Las tarjetas de producto en `Catalog.tsx` implementan el componente `TiltCard`. Al mover el cursor, la tarjeta se inclina físicamente en el espacio 3D (`rotateX`/`rotateY`), el destello luminoso de cristal (shine overlay) persigue el cursor recreando refracciones de luz, y la imagen de producto (o icono) se desplaza ligeramente en sentido contrario, generando un efecto parallax tridimensional inmersivo y de alta fidelidad.

### ⚡ Performance Móvil (Optimizaciones Implementadas — Jun 2026)
Se realizaron optimizaciones críticas en dos oleadas para mejorar FCP/LCP en móvil:

**Oleada 1 (solicitudes de bloqueo y bundle):**
* **Fuentes No Bloqueantes:** El `@import` de Google Fonts removido de `src/index.css` y movido a `index.html` con `media="print" onload="this.media='all'"`. Ahorro: **~750ms en FCP**.
* **Skeleton Inline:** El `#root` en `index.html` tiene un `<div>` con fondo negro que da FCP inmediato antes de que React hidrate.
* **AdminPanel Lazy-Load:** `AdminPanel.tsx` (~56KB gzip) se carga con `React.lazy()` + `Suspense`. Solo se descarga al abrir el panel. Bundle inicial reducido.
* **Code Splitting en Vite:** `vite.config.ts` usa `manualChunks` separando `firebase-core` (app+firestore), `firebase-storage`, `motion`, `icons` y `AdminPanel` como chunks cacheables independientes.
* **Canvas Deshabilitado en Móvil:** `CyberBackground.tsx` usa `isMobileDevice` al montar. En móvil el `<canvas>` no existe en el DOM ni se ejecuta el loop RAF.
* **Preconnect DNS/TLS:** `<link rel="preconnect">` a Fonts, Firestore y Firebase en `<head>`.

**Oleada 2 (cache, rendering, Firebase offline):**
* **Firestore Offline Persistence:** `firebase.ts` migrado de `getFirestore()` a `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`. La segunda visita sirve datos desde IndexedDB instantáneamente — elimina el retraso de la cadena Firestore de 28,044ms en red lenta.
* **Firebase Auth Lazy Init:** `getAuth()` reemplazado por `getAuthLazy()` (importación dinámica). El iframe de 90KB de Firebase Auth solo se descarga cuando el admin abre el panel.
* **LoadingSkeleton Premium:** Nuevo componente `LoadingSkeleton.tsx` con logo animado y barra de progreso neón. Solo aparece en primera visita (sin `localStorage`). Se oculta con fade-out animado al recibir el primer snapshot de Firestore/IndexedDB.
* **`vercel.json` con Cache Immutable:** Configuración de Vercel con `Cache-Control: public, max-age=31536000, immutable` para todos los assets `/assets/**`. Los chunks con hash nunca se re-descargan. Incluye headers de seguridad (X-Frame-Options, XSS Protection).
* **`content-visibility: auto` en sections:** Las secciones below-fold (`Services.tsx`, `FAQSection.tsx`) tienen la clase `.cv-auto` que usa `content-visibility: auto` para que el navegador salte su layout/paint hasta que el usuario haga scroll. Ahorra tiempo de rendering en el inicio.

**Fase 3 (Optimización de Físicas y Resortes en Móvil — Jun 2026):**
* **Hook Reactivo useIsMobile:** Se creó `src/hooks/useIsMobile.ts` para detectar en tiempo real si el usuario navega desde un dispositivo móvil.
* **Bifurcación de Tarjetas y Botones:** Las tarjetas de producto (`Catalog.tsx`), de servicios (`Services.tsx`) y los botones interactivos del Hero (`Hero.tsx`) se dividieron en versiones estáticas (`StaticCard`, `StaticButton`) e interactivas 3D (`InteractiveTiltCard`, `InteractiveMagneticButton`). 
* En dispositivos móviles se renderizan las versiones estáticas **planas**, omitiendo por completo los hooks `useSpring` y `useMotionValue` de Framer Motion. Esto libera a la CPU móvil de calcular físicas tridimensionales invisibles (sin cursor flotante), reduciendo a cero el bloqueo del hilo principal de JavaScript y optimizando la velocidad del sitio.


**Build Final — Chunks del bundle de producción:**
```
dist/assets/firebase-core (app+firestore) → 433.95 KB | 108.61 KB gzip (cacheado)
dist/assets/firebase-storage            →  17.06 KB |   4.80 KB gzip (cacheado)
dist/assets/firebase-auth               → lazy — solo si el admin lo abre
dist/assets/icons (lucide-react)        →  18.87 KB |   4.38 KB gzip (cacheado)
dist/assets/AdminPanel                  →  56.29 KB |  11.02 KB gzip (lazy)
dist/assets/motion (framer)             → 139.04 KB |  46.04 KB gzip (cacheado)
dist/assets/index (app code)            → 275.87 KB |  82.32 KB gzip
```


### 🐛 Ejecución de Comandos en Windows (PowerShell)
En entornos locales con políticas de ejecución restringidas en PowerShell, los comandos estándar de Node como `npm` fallarán si no se ejecutan directamente en la consola de comandos de Windows (`cmd.exe`).
* Para instalar dependencias: `cmd /c npm install`
* Para correr servidor de desarrollo: `cmd /c npm run dev`
* Para construir el proyecto: `cmd /c npm run build`

### 🌐 Acceso Remoto / ngrok
* Debido a las medidas de seguridad de Vite 6, los hosts externos se bloquean por defecto.
* Se ha configurado `server.allowedHosts` en `vite.config.ts` para aceptar subdominios de `.ngrok-free.dev` y `.ngrok.io`. Esto permite exponer la maqueta localmente y verla mediante túneles públicos sin problemas de acceso.

### 🎭 Efectos Interactivos Avanzados (Hero)
* **Animación Split-Text (Por palabras):** El título principal en `Hero.tsx` divide la frase de la base de datos por palabras y las anima de forma secuencial utilizando Framer Motion con un spring elástico para evitar superposiciones tipográficas.
* **Texto Hueco y Neón (Tipografía Orbitron):** Se utiliza la tipografía futurista y geométrica **Orbitron** (`font-display` y peso `font-black`) combinada con un espaciado `tracking-normal` y un `letter-spacing: 0.04em` en la clase `.cyber-outline-text` para asegurar que las palabras huecas y degradadas neón no sufran encabalgamientos ni cortes tipográficos feos en ninguna pantalla.
* **Atracción Magnética de Botones:** Los botones principales del Hero cuentan con el componente envolvente `MagneticButton`, el cual usa springs físicos en Framer Motion para atraer suavemente el botón en dirección al puntero del mouse dentro de un radio de 100px.
* **Cuadrícula Deformable 3D:** El Hero aloja una cuadrícula `.interactive-hero-grid` en perspectiva que se distorsiona en 3D (`rotateX`/`rotateY`) respondiendo al movimiento del ratón para crear un efecto parallax inmersivo.
* **Transición Suave de Logotipo (Crossfade):** Para evitar parpadeos y cambios bruscos al sincronizar la configuración con Firestore en tiempo de ejecución, `MBDigitalLogo.tsx` precarga el logotipo en segundo plano y realiza un fundido cruzado (crossfade suave con `opacity` y `scale`) entre el SVG por defecto y la imagen personalizada una vez que esta está 100% lista en memoria.

### 🌌 Sistema de Fondo Dinámico Global (CyberBackground)
* **Nebulosas Líquidas Continuas:** El componente `CyberBackground.tsx` renderiza tres orbes gigantes de neón en segundo plano con degradados radiales dinámicos que se mueven suavemente en órbitas elípticas aleatorias mediante animaciones de CSS keyframes (`aurora-float`) y desenfoque profundo.
* **Canvas de Partículas y Redes Neurales:** Implementa una simulación en un Canvas 2D donde decenas de partículas flotan a 60 FPS estables.
  * Si dos partículas se aproximan a menos de 110px, se dibuja un enlace de luz de neón sutil.
  * Al mover el ratón por la ventana, se calcula la distancia y se atraen las partículas cercanas, dibujando líneas interactivas hacia el puntero y creando una red digital viva.
  * Todo el sistema de partículas y nebulosas se sincroniza con `config.neonColor` y limpia correctamente sus animaciones y listeners en el desmontaje para evitar fugas de memoria.



---

## 6. Próximas Implementaciones Planificadas
Si la IA necesita saber qué hacer en siguientes etapas, se recomienda continuar con:
1. **Seguridad de credenciales:** Migrar la validación de contraseñas fijas de `AdminPanel.tsx` a variables de entorno `.env.local` y usar Firebase Auth.
2. **Uso de Timestamp:** Cambiar `createdAt: new Date()` en `ContactForm.tsx` por `serverTimestamp()` de Firestore.
3. **Modularización:** Dividir `AdminPanel.tsx` en múltiples archivos más legibles en `src/components/admin/`.
4. **[Completado]** ~~Firestore Offline Persistence~~ ✔️
5. **[Completado]** ~~Firebase Auth Lazy Init~~ ✔️
6. **SEO Avanzado:** Implementar `<script type="application/ld+json">` con structured data de tipo `Product` y `Organization` para mejorar la visibilidad en Google Shopping.
