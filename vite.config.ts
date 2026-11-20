import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'La Bobine — Affiche de programmation',
        short_name: 'La Bobine',
        description:
          "Générateur d'affiches de programmation cinéma, hors-ligne, export A4 PNG/JPEG/PDF",
        theme_color: '#9a1b2f',
        background_color: '#fdf8f7',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        // Le bundle est monolithique ; on met tout en cache pour le hors-ligne
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
})
