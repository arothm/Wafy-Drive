import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5179,
    proxy: {
      '/api/auth': { target: 'http://localhost:3001', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/auth/, '') },
      '/api/drive': { target: 'http://localhost:3007', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/drive/, '') },
    },
  },
})
