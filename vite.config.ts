import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: false },
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{html,js,css,png,svg,ico,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react-router')
          ) {
            return 'react-vendor'
          }
          if (
            id.includes('/node_modules/firebase/')
          ) {
            return 'firebase-vendor'
          }
          if (
            id.includes('/node_modules/i18next') ||
            id.includes('/node_modules/react-i18next')
          ) {
            return 'i18n-vendor'
          }
        },
      },
    },
  },
})
