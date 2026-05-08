import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ensure Vite finds packages hoisted to the workspace root node_modules
    preserveSymlinks: true,
  },
  server: {
    port: 5173,
  },
})
