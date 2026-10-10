const CACHE_NAME = 'muebles-zajo-v7';
const APP_SHELL = [
    './',
    './index.html',
    './css/style.css',
    './css/animate.css',
    './js/libs/jquery.js',
    './js/app.js',
    './manifest.json',
    // Iconos de la PWA
    './img/icons/icon_x48.png',
    './img/icons/icon_x72.png',
    './img/icons/icon_x96.png',
    './img/icons/icon_x128.png',
    './img/icons/icon_x192.png',
    './img/icons/icon_x384.png',
    './img/icons/icon_x512.png',
    // Catálogo de imágenes de Muebles ZaJo
    './img/avatars/Base de cama para perro 2-Photoroom.png',
    './img/avatars/Base de cama para perro-Photoroom.png',
    './img/avatars/Mesa con bancos tinta-Photoroom.png',
    './img/avatars/Mueble con un cajon grande-Photoroom.png',
    './img/avatars/Mueble de beisbol 3.png',
    './img/avatars/Mueble de beisbol 4.png',
    './img/avatars/Mueble negro 2-Photoroom_upscayl_2x_high-fidelity-4x.png',
    './img/avatars/Mueble negro-Photoroom_upscayl_2x_high-fidelity-4x.png',
    './img/avatars/Porta Cartel 2-Photoroom.png',
    './img/avatars/Porta Cartel-Photoroom.png',
    './img/avatars/Porta Macetas grande 2-Photoroom.png',
    './img/avatars/Porta Macetas grande-Photoroom.png',
    './img/avatars/Primer porta rollo barniz 2-Photoroom.png',
    './img/avatars/Primer porta rollo barniz-Photoroom.png',
    './img/avatars/Reja-Photoroom.png',
    './img/avatars/Repisa para toallas y papel-Photoroom.png',
    './img/avatars/Silla con refuerzos.png',
    './img/avatars/Silla plegable 2-Photoroom.png',
    './img/avatars/Silla plegable-Photoroom.png',
    './img/avatars/Trailer amarillo 2.png',
    './img/avatars/Trailer amarillo.png'
];

// Instalación del Service Worker: Guardar recursos en Caché
self.addEventListener('install', (e) => {
    const cache = caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL));
    e.waitUntil(cache);
    self.skipWaiting();
});

// Activación del Service Worker: Limpieza de cachés antiguas
self.addEventListener('activate', (e) => {
    const activate = caches.keys().then((keys) => {
        return Promise.all(keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)));
    });
    e.waitUntil(activate);
    self.clients.claim();
});

// Intercepción de peticiones (Modo Sin Red / Offline)
self.addEventListener('fetch', (e) => {
    // 1. No interceptar peticiones que no sean GET (como POST /api/subscribe o /api/push)
    if (e.request.method !== 'GET') {
        return;
    }

    // 2. Solo manejar URLs del mismo origen (archivos locales). Recursos externos como Google Fonts los gestiona directamente el navegador.
    if (!e.request.url.startsWith(self.location.origin)) {
        return;
    }

    // 3. No interceptar peticiones a la API del backend
    if (e.request.url.includes('/api/')) {
        return;
    }

    const respuesta = caches.match(e.request).then((cacheResp) => {
        if (cacheResp) {
            return cacheResp;
        }

        return fetch(e.request).then((netResp) => {
            if (netResp && netResp.ok) {
                const copia = netResp.clone();
                caches.open(CACHE_NAME).then((c) => c.put(e.request, copia));
            }
            return netResp;
        }).catch(async () => {
            // Manejo de contingencia cuando no hay conexión (offline)
            if (e.request.mode === 'navigate') {
                const navResp = await caches.match('./index.html');
                if (navResp) return navResp;
            }

            const fallbackResp = await caches.match(e.request);
            if (fallbackResp) return fallbackResp;

            if (e.request.destination === 'image') {
                const imgFallback = await caches.match('./img/no-image.png');
                if (imgFallback) return imgFallback;
            }

            // Asegurar que NUNCA se retorne undefined a respondWith()
            return new Response('Recurso no disponible sin conexión', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        });
    });

    e.respondWith(respuesta);
});

// Recepción de Notificaciones Push
self.addEventListener('push', (e) => {
    let datos = {
        title: 'Muebles ZaJo',
        body: '¡Tienes una nueva actualización en Muebles ZaJo!',
        url: '/'
    };

    if (e.data) {
        datos = e.data.json();
    }

    const opciones = {
        body: datos.body,
        icon: './img/icons/icon_x192.png',
        badge: './img/icons/icon_x72.png',
        vibrate: [100, 50, 100],
        data: { url: datos.url || '/' }
    };

    e.waitUntil(self.registration.showNotification(datos.title, opciones));
});

// Clic en la notificación: Abrir la aplicación
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(e.notification.data.url || '/');
            }
        })
    );
});