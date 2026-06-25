# 🚀 Tienda MB DIGITAL — E-Commerce Premium Cyberpunk

E-commerce moderno y de alta fidelidad visual especializado en la venta de servicios de streaming, licencias de software y recursos digitales premium. La aplicación cuenta con una estética de estilo **cyberpunk/futurista** con animaciones fluidas y está optimizada al 100% para dispositivos móviles y computadoras.

---

## 🎨 Características Destacadas (Flagship Features)

### 🛒 Carrito de Compras a WhatsApp (Multi-Producto)
- Permite agregar múltiples productos al carrito con selectores de cantidad.
- Botón flotante neón interactivo con contador en tiempo real.
- **Checkout en un solo clic:** Compila el pedido estructurado con subtotales, cantidades y la divisa seleccionada para ser enviado directamente a WhatsApp, facilitando la conversión de ventas.

### 📱 Diseño Móvil Optimizado (AliExpress Style)
- **Grilla de 2 columnas:** Optimización de espacio en pantallas pequeñas para mostrar de 4 a 6 productos por pantalla sin causar fatiga por desplazamiento.
- **Carga de imágenes inteligente:** Componente de imágenes diferido (`loading="lazy"`) con esqueleto de carga animado (*shimmer*) y difuminado suave (*fade-in blur*), previniendo saltos visuales al hacer scroll rápido.

### 💱 Selector de Moneda Dinámico (Soles S/ ↔️ Dólares USD)
- Conversión de precios en tiempo real.
- Detecta y reformatea automáticamente los precios de la base de datos (tasa fija `3.75`) permitiendo a clientes internacionales cotizar al instante en USD.

### 🔍 Buscador y Filtros Rápidos
- Barra de búsqueda predictiva que filtra el catálogo por nombre y descripción del producto al instante.
- Botones de categorías dinámicos con efectos de brillo neón.

### ⚙️ Panel de Administración en Tiempo Real
- Acceso protegido mediante credenciales.
- Permite modificar el nombre de la tienda, número de contacto, colores neón, banners de revendedores y stock de productos directamente, sincronizándose de inmediato con **Firebase Firestore**.

### 💬 Sección FAQ Interactiva
- Acordeón colapsable animado con respuestas a las dudas más comunes sobre la entrega, métodos de pago y garantías de las licencias.

---

## 💻 Stack Tecnológico

- **Core:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vite.dev/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Animaciones:** [Framer Motion / motion/react](https://motion.dev/)
- **Base de Datos & Almacenamiento:** [Firebase Firestore & Firebase Storage](https://firebase.google.com/)
- **Iconografía:** [Lucide React](https://lucide.dev/)

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/tienda-mb-digital.git
   cd tienda-mb-digital
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea o configura las claves de Firebase en tu archivo de configuración de Firebase en `src/firebase.ts`.

4. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

5. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Los archivos compilados listos para desplegar se generarán en la carpeta `dist/`.

---

## 🖼️ Estructura del Proyecto

```text
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx        # Panel de administración de configuraciones y stock
│   │   ├── Catalog.tsx           # Cuadrícula del catálogo, barra de búsqueda y tarjetas
│   │   ├── FAQSection.tsx        # Acordeón interactivo de preguntas frecuentes
│   │   ├── Navbar.tsx            # Barra de navegación con selector de divisas
│   │   └── CyberBackground.tsx   # Canvas de fondo con partículas y auroras CSS
│   ├── data/
│   │   └── defaults.ts           # Datos locales por defecto (productos, servicios y configs)
│   ├── firebase.ts               # Inicialización y utilidades de Firebase Firestore/Storage
│   ├── utils.ts                  # Funciones de utilidades y formateo de monedas
│   └── App.tsx                   # Punto de entrada principal y estados globales (carrito, moneda)
```
