import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000', 
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['selcom-bot-frontend.onrender.com']
  }
}))
