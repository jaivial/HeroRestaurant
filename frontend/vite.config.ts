import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/atoms': path.resolve(__dirname, './src/atoms'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/layouts': path.resolve(__dirname, './src/layouts'),
      '@/guards': path.resolve(__dirname, './src/guards'),
      '@/routes': path.resolve(__dirname, './src/routes'),
    }
  }
})
