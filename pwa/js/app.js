// Redirigir a localhost si se entra por 127.0.0.1 (Requisito estricto de Chromium para FCM Push)
if (window.location.hostname === '127.0.0.1') {
    window.location.hostname = 'localhost';
}

const VAPID_PUBLIC_KEY = 'BDlcBHCN3MZLUnAewYH27Lv4TZOe6BorI3OcVQ47rw17K6r9-5XOVw2M0OTrbnYJTcS6nHhQcKj-M_oIuxcE59Q';

// Función estándar para convertir la clave VAPID pública
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// ==========================================
// REFERENCIAS DEL DOM (jQuery)
// ==========================================
var titulo = $('#titulo');
var nuevoBtn = $('#nuevo-btn');       // Botón Header "Cotizar"
var salirBtn = $('#salir-btn');       // Botón Header "Salir"
var notifBtn = $('#notif-btn');       // Botón Header "Ofertas"

var avatarSel = $('#seleccion');                     // Pantalla 1: Selección de categoría y catálogo
var seccionTimeline = $('#seccion-timeline');         // Pantalla 2: Vista de cotizaciones
var timeline = $('#timeline');                       // Lista <ul> de mensajes
var timelineVacio = $('#timeline-vacio');             // Tarjeta de estado vacío
var timelineTitulo = $('#timeline-titulo');           // Título dinámico de la sección

var avatarBtns = $('.seleccion-avatar');
var btnVolverCatalogo = $('#btn-volver-catalogo');
var btnNuevaCotizacionInline = $('#btn-nueva-cotizacion-inline');
var btnEmptyCotizar = $('#btn-empty-cotizar');

// Modal de Cotización
var modal = $('#modal');
var modalAvatar = $('#modal-avatar');
var modalCloseX = $('#modal-close-x');
var cancelarBtn = $('#cancel-btn');
var postBtn = $('#post-btn');
var txtMensaje = $('#txtMensaje');

// Modal de Alerta Personalizado
var modalAlerta = $('#modal-alerta');
var modalAlertaIconWrap = $('#modal-alerta-icon-wrap');
var modalAlertaIcon = $('#modal-alerta-icon');
var modalAlertaTitulo = $('#modal-alerta-titulo');
var modalAlertaMensaje = $('#modal-alerta-mensaje');
var modalAlertaBtn = $('#modal-alerta-btn');
var toastContainer = $('#toast-container');

// Categoría seleccionada (por defecto 'Hogar')
var categoriaSeleccionada = 'Hogar';
var onAlertaConfirmCallback = null;

// ==========================================
// SISTEMA DE MODALES PERSONALIZADOS
// ==========================================

/**
 * Muestra una alerta estilizada en modal propio, reemplazando alert() nativo
 * @param {Object} config - { titulo, mensaje, icono, tipo: 'success'|'info'|'warning'|'danger', botonTexto, onConfirm }
 */
function mostrarModalAlerta({ 
    titulo = 'Muebles ZaJo', 
    mensaje = '', 
    icono = '🔔', 
    tipo = 'success', 
    botonTexto = 'Entendido', 
    onConfirm = null 
} = {}) {
    modalAlertaTitulo.text(titulo);
    modalAlertaMensaje.text(mensaje);
    modalAlertaIcon.text(icono);
    modalAlertaBtn.text(botonTexto);

    // Ajustar variante de color en el icono
    modalAlertaIconWrap
        .removeClass('success info warning danger')
        .addClass(tipo);

    onAlertaConfirmCallback = onConfirm;
    modalAlerta.removeClass('oculto');
}

function cerrarModalAlerta() {
    modalAlerta.addClass('oculto');
    if (typeof onAlertaConfirmCallback === 'function') {
        const cb = onAlertaConfirmCallback;
        onAlertaConfirmCallback = null;
        cb();
    }
}

modalAlertaBtn.on('click', cerrarModalAlerta);

// ==========================================
// SISTEMA DE TOASTS
// ==========================================
function mostrarToast(mensaje, tipo = 'info') {
    const iconos = { success: '✅', info: '🔔', warning: '⚠️', danger: '❌' };
    const icon = iconos[tipo] || '🔔';

    const $toast = $(`
        <div class="toast ${tipo} animated fadeIn">
            <span class="toast-icon">${icon}</span>
            <span class="toast-body">${mensaje}</span>
        </div>
    `);

    toastContainer.append($toast);

    setTimeout(() => {
        $toast.fadeOut(300, function () {
            $(this).remove();
        });
    }, 3500);
}

// ==========================================
// NOTIFICACIONES DEL MISMO NAVEGADOR (Web Notification API)
// ==========================================
async function mostrarNotificacionNavegador(tituloNotif, opciones = {}) {
    if (!('Notification' in window)) {
        console.warn('Este navegador no soporta Notification API.');
        return false;
    }

    if (Notification.permission !== 'granted') {
        const permiso = await Notification.requestPermission();
        if (permiso !== 'granted') {
            return false;
        }
    }

    const defaultOpciones = {
        icon: 'img/icons/icon_x192.png',
        badge: 'img/icons/icon_x72.png',
        vibrate: [100, 50, 100],
        ...opciones
    };

    // Intentar con ServiceWorkerRegistration.showNotification primero
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.ready;
            if (reg && reg.showNotification) {
                await reg.showNotification(tituloNotif, defaultOpciones);
                return true;
            }
        } catch (e) {
            console.warn('Fallback a new Notification():', e);
        }
    }

    // Fallback a Notification tradicional del navegador
    try {
        new Notification(tituloNotif, defaultOpciones);
        return true;
    } catch (e) {
        console.warn('Error al disparar notificación nativa:', e);
        return false;
    }
}

// ==========================================
// CONTROL DEL MODAL DE COTIZACIÓN
// ==========================================
function abrirModalCotizacion() {
    modal.removeClass('oculto');
    txtMensaje.focus();
}

function cerrarModalCotizacion() {
    modal.addClass('oculto');
    txtMensaje.val('');
}

nuevoBtn.on('click', abrirModalCotizacion);
btnNuevaCotizacionInline.on('click', abrirModalCotizacion);
btnEmptyCotizar.on('click', abrirModalCotizacion);
cancelarBtn.on('click', cerrarModalCotizacion);
modalCloseX.on('click', cerrarModalCotizacion);

// Cerrar modales al hacer clic fuera del contenido (en el overlay)
modal.on('click', function (e) {
    if (e.target === this) {
        cerrarModalCotizacion();
    }
});

modalAlerta.on('click', function (e) {
    if (e.target === this) {
        cerrarModalAlerta();
    }
});

// Cerrar modales con tecla Escape
$(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
        if (!modal.hasClass('oculto')) cerrarModalCotizacion();
        if (!modalAlerta.hasClass('oculto')) cerrarModalAlerta();
    }
});

// ==========================================
// GESTIÓN DE TIMELINE Y MENSAJES
// ==========================================
function actualizarEstadoTimeline() {
    if (timeline.children('li').length === 0) {
        timelineVacio.removeClass('oculto');
    } else {
        timelineVacio.addClass('oculto');
    }
}

function crearMensajeHTML(mensaje, categoria) {
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/icons/icon_x72.png" alt="Muebles ZaJo">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <div class="bubble-header">
                    <h3>@Cliente</h3>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="badge-categoria">${categoria}</span>
                        <span class="bubble-hora">${hora}</span>
                    </div>
                </div>
                <div class="bubble-text">${mensaje}</div>
            </div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    actualizarEstadoTimeline();
}

// Gestión de vista / sesión de usuario
function logIn(ingreso) {
    if (ingreso) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        seccionTimeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        notifBtn.removeClass('oculto');
        modalAvatar.attr('src', 'img/icons/icon_x96.png');
        timelineTitulo.text(`Cotizaciones · ${categoriaSeleccionada}`);
        actualizarEstadoTimeline();
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        seccionTimeline.addClass('oculto');
        avatarSel.removeClass('oculto');
        notifBtn.addClass('oculto');
        titulo.text('Muebles ZaJo');
    }
}

// Seleccionar categoría de mueble (Hogar o Negocio)
avatarBtns.on('click', function () {
    categoriaSeleccionada = $(this).data('user') || 'Hogar';
    titulo.text('Muebles ZaJo: ' + categoriaSeleccionada);
    logIn(true);
});

// Regresar al catálogo / inicio
salirBtn.on('click', function () {
    logIn(false);
});

btnVolverCatalogo.on('click', function () {
    logIn(false);
});

// ==========================================
// ENVIAR CONSULTA Y COTIZACIÓN
// ==========================================
postBtn.on('click', async function () {
    const mensaje = txtMensaje.val().trim();

    if (mensaje.length === 0) {
        mostrarModalAlerta({
            titulo: 'Escribe tu Solicitud',
            mensaje: 'Por favor escribe las especificaciones o medidas del mueble que necesitas cotizar.',
            icono: '✏️',
            tipo: 'warning',
            botonTexto: 'Regresar y escribir'
        });
        return;
    }

    // 1. Agregar el mensaje a la lista visualmente
    crearMensajeHTML(mensaje, categoriaSeleccionada);
    cerrarModalCotizacion();

    // 2. Disparar notificación nativa del propio navegador
    mostrarNotificacionNavegador(`Muebles ZaJo · Cotización (${categoriaSeleccionada}) 📦`, {
        body: `Consulta recibida: "${mensaje.length > 60 ? mensaje.substring(0, 60) + '...' : mensaje}"`,
        icon: 'img/icons/icon_x192.png'
    });

    // 3. Mostrar modal personalizado de confirmación
    mostrarModalAlerta({
        titulo: '¡Cotización Enviada!',
        mensaje: `Tu solicitud de ${categoriaSeleccionada} ha sido registrada exitosamente. Nuestro equipo preparará tu presupuesto y te contactará a la brevedad.`,
        icono: '✅',
        tipo: 'success',
        botonTexto: 'Excelente'
    });

    mostrarToast('Cotización registrada con éxito', 'success');

    // 4. Notificar al backend en Node.js (Express) para Push masivo
    try {
        await fetch('http://localhost:3000/api/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Muebles ZaJo (' + categoriaSeleccionada + ')',
                body: mensaje
            })
        });
    } catch (err) {
        console.warn('Nota: Backend local no disponible para push:', err);
    }
});

// ==========================================
// ACTIVAR NOTIFICACIONES PUSH & NAVEGADOR
// ==========================================
notifBtn.on('click', async function () {
    if (!('Notification' in window) || !('PushManager' in window)) {
        mostrarModalAlerta({
            titulo: 'No Compatible',
            mensaje: 'Tu navegador actual no admite notificaciones de escritorio ni Push API.',
            icono: '⚠️',
            tipo: 'warning'
        });
        return;
    }

    // Solicitar permiso
    let permiso = Notification.permission;
    if (permiso !== 'granted') {
        permiso = await Notification.requestPermission();
    }

    if (permiso !== 'granted') {
        mostrarModalAlerta({
            titulo: 'Permisos Denegados',
            mensaje: 'Las notificaciones están bloqueadas en tu navegador. Puedes habilitarlas haciendo clic en el candado o configuración de tu barra de direcciones.',
            icono: '⚠️',
            tipo: 'warning',
            botonTexto: 'Entendido'
        });
        return;
    }

    try {
        const registro = await navigator.serviceWorker.ready;
        let sub = await registro.pushManager.getSubscription();

        if (!sub) {
            sub = await registro.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
        }

        console.log('Suscripción generada:', JSON.stringify(sub));

        // Registrar en backend Node.js
        try {
            await fetch('http://localhost:3000/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub),
            });
        } catch (fetchErr) {
            console.warn('Servidor backend offline o no alcanzable:', fetchErr);
        }

        // 1. Notificación del mismo navegador de bienvenida
        mostrarNotificacionNavegador('Muebles ZaJo · Notificaciones Activas 🌲', {
            body: '¡Listo! Te avisaremos cuando tengamos nuevas promociones y diseños exclusivos.',
            icon: 'img/icons/icon_x192.png'
        });

        // 2. Modal personalizado elegante
        mostrarModalAlerta({
            titulo: '¡Suscripción Activada!',
            mensaje: 'Recibirás promociones exclusivas, descuentos de temporada y el estado de tus cotizaciones de Muebles ZaJo directamente en tu pantalla.',
            icono: '🔔',
            tipo: 'success',
            botonTexto: '¡Genial, gracias!'
        });

        mostrarToast('Notificaciones push y de navegador activadas', 'success');

    } catch (err) {
        console.error('Error suscribiendo a Notificaciones Push:', err);

        // Reintento limpiando suscripción previa si estaba corrupta
        try {
            const registro = await navigator.serviceWorker.ready;
            const subStale = await registro.pushManager.getSubscription();
            if (subStale) await subStale.unsubscribe();

            const reSub = await registro.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            await fetch('http://localhost:3000/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reSub),
            });

            mostrarNotificacionNavegador('Muebles ZaJo 🌲', {
                body: 'Suscripción reestablecida exitosamente.',
                icon: 'img/icons/icon_x192.png'
            });

            mostrarModalAlerta({
                titulo: '¡Suscripción Activada!',
                mensaje: 'Se reestableció tu suscripción de ofertas correctamente.',
                icono: '🔔',
                tipo: 'success'
            });
            return;
        } catch (retryErr) {
            console.error('Error en reintento:', retryErr);
        }

        mostrarModalAlerta({
            titulo: 'Detalle de Suscripción',
            mensaje: 'No se pudo completar el registro push: ' + err.message + '\n\nVerifica que estés en http://localhost:8080.',
            icono: '❌',
            tipo: 'danger'
        });
    }
});

// ==========================================
// REGISTRO DEL SERVICE WORKER
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js')
            .then(function (reg) {
                console.log('Service Worker de Muebles ZaJo registrado:', reg.scope);
            })
            .catch(function (err) {
                console.error('Error al registrar el Service Worker:', err);
            });
    });
}

// ==========================================
// INSTALACIÓN DE LA PWA (A2HS)
// ==========================================
var deferredInstallPrompt = null;
var installBtn = $('#install-btn');

window.addEventListener('beforeinstallprompt', function (e) {
    // Evitar que el navegador muestre su mini-infobar automático de inmediato
    e.preventDefault();
    deferredInstallPrompt = e;
    // Mostrar botón personalizado de instalación en la interfaz
    installBtn.removeClass('oculto');
});

installBtn.on('click', async function () {
    if (!deferredInstallPrompt) return;

    // Mostrar el cuadro de diálogo oficial del navegador
    deferredInstallPrompt.prompt();

    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === 'accepted') {
        mostrarToast('¡Gracias por instalar Muebles ZaJo!', 'success');
    }
    deferredInstallPrompt = null;
    installBtn.addClass('oculto');
});

window.addEventListener('appinstalled', function () {
    installBtn.addClass('oculto');
    deferredInstallPrompt = null;
    mostrarToast('Muebles ZaJo instalada correctamente en tu sistema 🌲', 'success');
});