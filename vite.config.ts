import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'S.I.C.K.',
        short_name: 'S.I.C.K.',
        description: 'You can Create SIPs called "Crates" and get acknowledged with a Social angle',
        theme_color: '#0A1019',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-1080.png',
            sizes: '1080x1080',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://sandbox-api.okto.tech',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});