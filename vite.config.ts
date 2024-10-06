import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream']
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://sandbox-api.okto.tech',
        changeOrigin: true,
        secure: false,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    },
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key']
    }
  },
  define: {
    'process.env': {},
    global: {}
  }
});