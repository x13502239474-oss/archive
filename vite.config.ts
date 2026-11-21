import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 部署在子路径下时由工作流注入 VITE_BASE=/archive/
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
  },
});
