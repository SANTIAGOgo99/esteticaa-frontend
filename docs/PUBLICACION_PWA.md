# Publicación PWA compatible con la API actual

Esta versión parte del frontend 8776a66 y agrega manifest, service worker, catálogo público offline, geolocalización y avisos visibles online/offline. Conserva el contrato de reserva JSON y la agenda previos para seguir siendo compatible con la API desplegada.

No publica la agenda dinámica pendiente ni el envío de fotografías: esas funciones permanecen en feat/pwa-device-capabilities hasta migrar y validar la API y su base de datos. No se aplican migraciones a producción en esta publicación del frontend.

Compilar con npm ci y npm run build. VITE_API_URL debe apuntar a https://esteticaa-backend-five.vercel.app/api. No cambiar esta URL a una API de prueba. Abrir /catalogo con conexión, esperar datos reales, activar Offline y recargar; al volver online aparece Conexión restablecida. El shell listo no garantiza que haya catálogos guardados. Se guardan copias públicas por hasta 24 h.

Se publica desde una rama independiente y se promueve en el proyecto Vercel existente, sin sustituir otras rutas ni fusionar main.
