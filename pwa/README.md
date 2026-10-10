# 🌲 Muebles ZaJo — Progressive Web App (PWA)

Aplicación Web Progresiva para **Muebles ZaJo**, enfocada en la exhibición de muebles sustentables hechos a mano para hogar y negocio, gestión interactiva de cotizaciones personalizadas y recepción de notificaciones de ofertas.

---

## 📋 Descripción del Proyecto

Muebles ZaJo es una PWA moderna desarrollada para ofrecer una experiencia rápida, visualmente atractiva e independiente de la conectividad a internet. Permite a los clientes:

1. **Explorar el Catálogo:** Visualizar productos destacados organizados en categorías (*Hogar* y *Negocio*).
2. **Solicitar Cotizaciones:** Enviar especificaciones y medidas para presupuestos a medida con interfaz tipo timeline y mensajes con hora y categoría.
3. **Recibir Ofertas y Novedades:** Suscribirse a alertas y recibir notificaciones nativas en su equipo o teléfono inteligente.
4. **Instalar la App:** Instalarla directamente en el escritorio de Windows, macOS, Android o iOS sin pasar por tiendas de aplicaciones.

---

## ✨ Características Principales

* **📦 Arquitectura App Shell:** Carga ultrarrápida de la interfaz independientemente del estado de la red.
* **🔌 Funcionamiento Offline:** El Service Worker almacena en caché todos los recursos críticos (HTML, CSS, JS, iconos e imágenes del catálogo).
* **🔔 Notificaciones Duales:**
  * **Locales (Notification API):** Alertas de escritorio inmediatas al enviar consultas o activar ofertas.
  * **Remotas (Web Push API):** Notificaciones push recibidas desde el servidor central mediante el estándar VAPID.
* **🎨 Interfaz y Experiencia de Usuario (UI/UX):**
  * Paleta oscura con detalles verdes sustentables (`#4caf50`).
  * Modales personalizados con animaciones (*zoomIn*, *fadeIn*), reemplazando los `alert()` tradicionales.
  * Toasts flotantes para retroalimentación instantánea.
* **📲 Instalable (A2HS):** Cumple los requisitos de Chromium para instalación desde la barra de direcciones y mediante botón dedicado en el encabezado.

---

## 📁 Estructura de Archivos

```plaintext
pwa/
├── css/
│   ├── animate.css         # Librería de animaciones fluidas
│   └── style.css           # Sistema de diseño, tokens, dark mode y componentes
├── img/
│   ├── avatars/            # Fotografías de productos del catálogo de Muebles ZaJo
│   └── icons/              # Iconos oficiales PWA en 7 resoluciones (48px a 512px)
├── js/
│   ├── libs/
│   │   └── jquery.js       # Manipulación del DOM y eventos
│   └── app.js              # Lógica principal, suscripción Push, modales y eventos de instalación
├── index.html              # Estructura semántica, App Shell y contenedores modales
├── manifest.json           # Manifiesto oficial PWA (metadatos, temas, iconos maskable)
├── sw.js                   # Service Worker (gestión de caché, interceptación de red y Push)
└── README.md               # Esta documentación
```

---

## ⚙️ Criterios PWA Implementados

| Criterio | Implementación |
| :--- | :--- |
| **Manifiesto Web** | `manifest.json` con `start_url`, `display: standalone`, colores corporativos e iconos de 48px a 512px con soporte `maskable`. |
| **Service Worker** | Registrado en `app.js` y programado en `sw.js` con precaché de recursos (`APP_SHELL`). |
| **Estrategia Offline** | *Cache-First* para recursos locales con fallback navegable a `index.html`. |
| **Notificaciones** | Manejo de eventos `push` y `notificationclick` en segundo plano, además de integración con `Notification API`. |
| **Instalabilidad** | Detección del evento `beforeinstallprompt` y botón de instalación integrado. |

---

## 🚀 Cómo Ejecutar la PWA Localmente

1. Abre una terminal en la carpeta `pwa`:
   ```powershell
   cd pwa
   ```

2. Inicia un servidor web estático (por ejemplo, con `http-server` en el puerto `8080`):
   ```powershell
   npx http-server -p 8080
   ```

3. Abre tu navegador web en:
   ```
   http://localhost:8080
   ```

> 💡 **Nota:** Para activar las notificaciones y el Service Worker sin errores de origen seguro, Chromium requiere navegar mediante `http://localhost:8080`.
