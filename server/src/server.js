const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de las claves VAPID (Asegúrate de definir estas variables en tu entorno o archivo .env)
webpush.setVapidDetails(
    'mailto:zahidmonragacontreras@gmail.com',
    process.env.VAPID_PUBLIC,
    process.env.VAPID_PRIVATE
);

let suscripciones = []; // Array temporal (sustituir por BD en producción)

// Endpoint para guardar la suscripción push de los clientes de Muebles ZaJo
app.post('/api/subscribe', (req, res) => {
    const sub = req.body;
    const yaExiste = suscripciones.some((s) => s.endpoint === sub.endpoint);

    if (!yaExiste) suscripciones.push(sub);

    console.log('Cliente suscrito a Muebles ZaJo. Total activos:', suscripciones.length);
    res.status(201).json({ ok: true, mensaje: 'Suscripción registrada exitosamente en Muebles ZaJo' });
});

// Endpoint para enviar notificaciones masivas de promociones o novedades
app.post('/api/push', async (req, res) => {
    // Estructura del mensaje personalizada con la identidad de Muebles ZaJo
    const payload = JSON.stringify({
        title: req.body.title || 'Muebles ZaJo - ¡Novedades!',
        body: req.body.body || 'Descubre los nuevos modelos para tu hogar y negocio.',
        icon: '/img/icons/icon_x192.png', // Icono oficial de Muebles ZaJo
        badge: '/img/icons/icon_x96.png',
        url: req.body.url || '/'
    });

    let enviadasExitosas = 0;

    for (const sub of suscripciones) {
        try {
            await webpush.sendNotification(sub, payload);
            enviadasExitosas++;
        } catch (err) {
            // Si la suscripción expiró o el usuario bloqueó la app (404 / 410), la eliminamos
            if (err.statusCode === 404 || err.statusCode === 410) {
                suscripciones = suscripciones.filter((s) => s.endpoint !== sub.endpoint);
            }
        }
    }

    res.json({
        ok: true,
        enviadas: enviadasExitosas,
        suscripcionesActivas: suscripciones.length
    });
});

// Bloqueo de rutas internas del servidor
app.use('/server', (req, res) => res.sendStatus(404));

// Servir la PWA de Muebles ZaJo
app.use(express.static(path.join(__dirname, '../../pwa')));
app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de Muebles ZaJo activo en: http://localhost:${PORT}`));