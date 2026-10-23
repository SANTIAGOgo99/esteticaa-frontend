import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
 plugins: [react(), VitePWA({
 strategies: 'injectManifest', srcDir: 'src', filename: 'sw.js', registerType: 'prompt', injectRegister: false,
 injectManifest: { globPatterns: ['**/*.{js,css,html,png,svg,woff2}'], maximumFileSizeToCacheInBytes: 4000000 },
 manifest: { id: '/', name: 'Ezequiel Castillo Hair Designer', short_name: 'EC Hair', lang: 'es-MX', start_url: '/', scope: '/', display: 'standalone', theme_color: '#000000', background_color: '#ffffff', icons: [
 { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
 { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
 { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] }
 })], server: { port: 5173 }
});
