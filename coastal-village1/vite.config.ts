import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    hmr: {
      host: '127.0.0.1',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',      
    setupFiles: ['./src/vitest.setup.ts'],
  },
  build: {
    target: 'es2015',
  },
});