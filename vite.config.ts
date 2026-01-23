import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '时光清单 & 待办',
        short_name: '时光清单',
        description: 'Modern Time Planner & Todo PWA',
        theme_color: '#f97316',
        background_color: '#fcfaf8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2921/2921226.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2921/2921226.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000
  }
})
