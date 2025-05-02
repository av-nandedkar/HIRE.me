import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  base: '/',
  server: {
    host: '0.0.0.0' ,      // enables access from network IP (0.0.0.0)
    port: 5173       // you can change this port if needed
  }
})

