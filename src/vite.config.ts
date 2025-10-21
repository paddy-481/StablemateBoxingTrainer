import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    emptyOutDir: true,
  },
});
