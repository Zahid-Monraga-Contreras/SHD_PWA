# 🖥️ Muebles ZaJo — Servidor Backend & Servicio Push

Servidor backend desarrollado en **Node.js** y **Express** encargado de administrar el registro de suscripciones y la emisión de **Notificaciones Web Push** (estándar VAPID) para los clientes de la PWA de **Muebles ZaJo**.

---

## 📋 Descripción del Servicio

Este componente proporciona el soporte de red necesario para que la PWA pueda enviar notificaciones en segundo plano a los usuarios, incluso cuando la aplicación no se encuentra abierta en el navegador:

1. **Gestión de Suscriptores:** Recibe y almacena los objetos de suscripción generados por el Service Worker de los clientes.
2. **Envío de Notificaciones Push:** Realiza el cifrado y la entrega de mensajes a través de los servidores de mensajería (FCM / Mozilla Push Service) utilizando las credenciales criptográficas VAPID.
3. **Depuración Automática:** Filtra y elimina suscripciones que hayan expirado o hayan sido revocadas por el usuario (códigos HTTP 404 / 410).

---

## 🛠️ Tecnologías Utilizadas

* **Node.js:** Entorno de ejecución en el servidor.
* **Express.js:** Framework minimalista para la creación de la API REST.
* **web-push:** Biblioteca oficial para la firma y envío seguro de mensajes con el protocolo Web Push.
* **CORS:** Middleware para permitir la comunicación cruzada entre orígenes (`localhost:8080` y `localhost:3000`).

---

## 📁 Estructura del Servidor

```plaintext
server/
├── src/
│   └── server.js           # Servidor Express, configuración VAPID y endpoints REST
├── .env                    # Claves públicas y privadas VAPID
├── package.json            # Dependencias y scripts de ejecución
├── package-lock.json       # Árbol de dependencias bloqueadas
└── README.md               # Esta documentación
```

---

## 🔌 Endpoints de la API

### 1. Registrar Suscripción
* **Ruta:** `POST /api/subscribe`
* **Descripción:** Almacena la suscripción generada por el navegador del cliente.
* **Cuerpo de la petición (JSON):**
  ```json
  {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BNc...",
      "auth": "..."
    }
  }
  ```
* **Respuesta exitosa:** `201 Created`

### 2. Emitir Notificación Push
* **Ruta:** `POST /api/push`
* **Descripción:** Envía una notificación masiva a todos los clientes suscritos.
* **Cuerpo de la petición (JSON):**
  ```json
  {
    "title": "Muebles ZaJo - ¡Novedad en Hogar!",
    "body": "Se ha recibido una nueva cotización de mueble a medida.",
    "url": "/"
  }
  ```
* **Respuesta exitosa:** `200 OK` con el total de mensajes enviados.

---

## 🔐 Configuración de Variables de Entorno (`.env`)

En la raíz de la carpeta `server/` se encuentra el archivo `.env` con las claves criptográficas VAPID generadas para la aplicación:

```env
VAPID_PUBLIC=BDlcBHCN3MZLUnAewYH27Lv4TZOe6BorI3OcVQ47rw17K6r9-5XOVw2M0OTrbnYJTcS6nHhQcKj-M_oIuxcE59Q
VAPID_PRIVATE=n0_VPsiqiy3QSd_fHA56sDLck803jpIzLGujfsTGokk
```

---

## 🚀 Cómo Ejecutar el Servidor

1. Abre una terminal en la carpeta `server`:
   ```powershell
   cd server
   ```

2. Instala las dependencias (si es la primera vez):
   ```powershell
   npm install
   ```

3. Inicia el servidor con las variables de entorno cargadas:
   ```powershell
   npm start
   ```

El servidor quedará activo en:
```
http://localhost:3000
```
