import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/devthon-4.0-web/',
  plugins: [react(), tailwindcss()],
})
