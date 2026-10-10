# 🌲 Muebles ZaJo — Progressive Web App & Push Server

> **Solución Web Progresiva para Catálogo de Muebles Sustentables, Cotizaciones en Tiempo Real y Notificaciones Web Push.**

Repositorio oficial del proyecto **Muebles ZaJo**, desarrollado como parte de la asignatura de **Aplicaciones Web Progresivas (IDGS-10°A)**. La solución está compuesta por una **PWA de cliente** con soporte offline e instalabilidad, y un **servidor backend** en Node.js para la emisión de notificaciones Push bajo el estándar VAPID.

---

## 📌 Tabla de Contenidos

1. [📖 Descripción General](#descripción-general)
2. [🏛️ Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [📁 Estructura del Repositorio](#estructura-del-repositorio)
4. [🚀 Funcionalidades Principales](#funcionalidades-principales)
5. [🛠️ Tecnologías Utilizadas](#tecnologías-utilizadas)
6. [💻 Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
7. [🔐 Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
8. [📋 Criterios PWA Implementados](#criterios-pwa-implementados)
9. [👤 Autor](#autor)

---

<a id="descripción-general"></a>
## 📖 Descripción General

**Muebles ZaJo** es una plataforma digital diseñada para un taller de carpintería y fabricación de muebles sustentables hechos a medida para el hogar y para negocios comerciales. 

El objetivo es ofrecer a los clientes una experiencia fluida, moderna y accesible desde cualquier dispositivo, permitiéndoles:
* Explorar productos en categorías de **Hogar** y **Negocio**.
* Solicitar presupuestos o **cotizaciones a la medida**.
* Recibir **notificaciones instantáneas de ofertas** y actualizaciones.
* Navegar por el catálogo **incluso sin conexión a internet (modo offline)**.
* **Instalar la aplicación** directamente en su computadora o teléfono móvil como una aplicación nativa.

---

<a id="arquitectura-del-proyecto"></a>
## 🏛️ Arquitectura del Proyecto

El sistema está dividido en dos módulos independientes que se comunican mediante HTTP y protocolos estándar de la web:

```
+-------------------------------------------------------------------------+
|                              CLIENTE (PWA)                              |
|  - App Shell (index.html, style.css, app.js)                            |
|  - Service Worker (sw.js) -> Cache Storage (Navegación Offline)         |
|  - Web App Manifest (manifest.json) -> Instalabilidad (A2HS)            |
+-------------------------------------------------------------------------+
            |                                         ^
            | POST /api/subscribe                     | Push Notifications
            | POST /api/push                          | (FCM / Mozilla Push)
            v                                         |
+-------------------------------------------------------------------------+
|                           SERVIDOR (BACKEND)                            |
|  - Node.js & Express (server.js en http://localhost:3000)               |
|  - Web-Push con llaves criptográficas VAPID                            |
+-------------------------------------------------------------------------+
```

---

<a id="estructura-del-repositorio"></a>
## 📁 Estructura del Repositorio

```plaintext
SHD_PWA/
├── pwa/                         # Módulo Frontend: Aplicación Web Progresiva
│   ├── css/
│   │   ├── animate.css          # Animaciones CSS fluidas
│   │   └── style.css            # Estilos personalizados, tema oscuro y modales
│   ├── img/
│   │   ├── avatars/             # Fotografías reales del catálogo de muebles
│   │   └── icons/               # Iconos PWA en 7 resoluciones (48px a 512px)
│   ├── js/
│   │   ├── libs/jquery.js       # Biblioteca jQuery para eventos y DOM
│   │   └── app.js               # Lógica de cliente, modales, cotizaciones e instalación
│   ├── index.html               # Vista principal y estructura de componentes
│   ├── manifest.json            # Configuración de instalación PWA
│   ├── sw.js                    # Service Worker (Caché offline y Push listener)
│   └── README.md                # Documentación específica del cliente PWA
│
├── server/                      # Módulo Backend: Servidor de Notificaciones
│   ├── src/
│   │   └── server.js            # API REST en Express y configuración VAPID
│   ├── .env                     # Claves criptográficas públicas y privadas VAPID
│   ├── package.json             # Dependencias del servidor Node.js
│   └── README.md                # Documentación específica del servidor
│
└── README.md                    # Documentación principal del repositorio
```

---

<a id="funcionalidades-principales"></a>
## 🚀 Funcionalidades Principales

### 1. 🪑 Catálogo Interactivo
* Navegación por categorías (*Hogar* y *Negocio*).
* Muestra de más de 12 modelos reales: bases para mascotas, mesas con bancos, organizadores, sillas con refuerzos, repisas, muebles de béisbol y tráilers decorativos.

### 2. 📝 Cotizaciones Personalizadas
* Formulario modal centrado para especificar medidas, tipo de madera o especificaciones del mueble.
* Historial tipo timeline con marcas de hora, estado vacío amigable (*empty state*) y badge de categoría.

### 3. 🔔 Sistema Dual de Notificaciones
* **Notificaciones de Navegador (Notification API):** Alertas locales inmediatas al registrar cotizaciones o activar ofertas.
* **Notificaciones Web Push (VAPID):** Emisión remota a través del backend que despierta al Service Worker y muestra notificaciones del sistema operativo.
* **Modales y Toasts Propios:** Diálogos visuales elegantes con iconos animados y toasts flotantes (sin usar el `alert()` nativo).

### 4. 📴 Funcionamiento Sin Red (Offline)
* Estrategia de caché *Cache-First* gestionada por el Service Worker (`sw.js`).
* Guarda automáticamente el App Shell y el catálogo de imágenes para permitir la navegación sin conexión a internet.

### 5. 📲 Instalación en Dispositivo (A2HS)
* Cumple al 100% los criterios de instalación de Chromium.
* Instalable desde la barra de direcciones del navegador y mediante un botón interactivo **"📲 Instalar"** ubicado en el encabezado.

---

<a id="tecnologías-utilizadas"></a>
## 🛠️ Tecnologías Utilizadas

### Frontend (PWA)
* **HTML5:** Estructura semántica accesible.
* **CSS3:** Sistema de diseño con variables CSS, efecto glassmorphism, gradientes modernos y animaciones (`animate.css`).
* **JavaScript (ES6+):** Lógica reactiva de la aplicación.
* **Service Worker API:** Gestión de ciclo de vida (install, activate, fetch, push, notificationclick).
* **Web App Manifest:** Definición de pantalla completa, iconos adaptativos (`maskable`) y temas de color.
* **Web Notification API & Push API:** Recepción y despliegue de notificaciones del sistema.

### Backend (Servidor)
* **Node.js:** Entorno de ejecución en servidor.
* **Express.js:** Enrutamiento de endpoints REST.
* **web-push:** Firma criptográfica VAPID y comunicación con servidores Push (Google FCM / Mozilla).
* **cors:** Habilitación de peticiones seguras entre orígenes locales.

---

<a id="instalación-y-puesta-en-marcha"></a>
## 💻 Instalación y Puesta en Marcha

Para ejecutar el proyecto completo en tu entorno local, sigue estos pasos:

### Paso 1: Clonar el Repositorio
```powershell
git clone https://github.com/Zahid-Monraga-Contreras/SHD_PWA.git
cd SHD_PWA
```

### Paso 2: Iniciar el Servidor Backend
Abre una primera terminal:
```powershell
cd server
npm install
npm start
```
> ✅ El servidor backend quedará activo en: `http://localhost:3000`

### Paso 3: Iniciar la PWA (Cliente)
Abre una segunda terminal:
```powershell
cd pwa
npx http-server -p 8080
```
> ✅ La aplicación estará disponible en tu navegador en: `http://localhost:8080`

---

<a id="configuración-de-variables-de-entorno"></a>
## 🔐 Configuración de Variables de Entorno

El backend requiere claves VAPID para firmar las notificaciones push. Estas se configuran en el archivo `server/.env`:

```env
VAPID_PUBLIC=BDlcBHCN3MZLUnAewYH27Lv4TZOe6BorI3OcVQ47rw17K6r9-5XOVw2M0OTrbnYJTcS6nHhQcKj-M_oIuxcE59Q
VAPID_PRIVATE=n0_VPsiqiy3QSd_fHA56sDLck803jpIzLGujfsTGokk
```

> La clave pública `VAPID_PUBLIC` también se encuentra configurada en `pwa/js/app.js` para suscribir el navegador a través de `pushManager.subscribe()`.

---

<a id="criterios-pwa-implementados"></a>
## 📋 Criterios PWA Implementados

| Criterio PWA | Estado | Detalle de Implementación |
| :--- | :---: | :--- |
| **Propuesta de negocio clara** | ✅ Cumple | Mueblería sustentable con catálogo, cotizaciones y promociones. |
| **Funciones sin red (Offline)** | ✅ Cumple | Service Worker con precaché de recursos críticos e imágenes. |
| **Manifiesto e Iconos** | ✅ Cumple | `manifest.json` con 7 tamaños de iconos y soporte `any maskable`. |
| **Notificaciones en navegador** | ✅ Cumple | Notificaciones nativas de escritorio y notificaciones Push remotas. |
| **Instalable en dispositivo** | ✅ Cumple | Instalación nativa desde navegador y botón dedicado en la interfaz. |

---

<a id="autor"></a>
## 👤 Autor

* **Zahid Monraga Contreras**
* **Carrera:** Ingeniería en Desarrollo y Gestión de Software (IDGS - 10°A)
* **Materia:** Aplicaciones Web Progresivas
* **Repositorio:** [Zahid-Monraga-Contreras/SHD_PWA](https://github.com/Zahid-Monraga-Contreras/SHD_PWA)
