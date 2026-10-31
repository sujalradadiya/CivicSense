import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/issuetypes': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/issue_types': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/issues': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/authorities': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/states': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/transactions': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
