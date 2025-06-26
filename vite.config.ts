/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Create this file next
    css: false, // Optional: if you don't need CSS testing
    },
  build: {
    rollupOptions: {
      output: {
        // Place JavaScript files in static/frontend/js
        entryFileNames: `static/frontend/js/[name]-[hash].js`,
        chunkFileNames: `static/frontend/js/[name]-[hash].js`,
        assetFileNames: `static/frontend/assets/[name]-[hash][extname]`,
      },
    },
  }
})
