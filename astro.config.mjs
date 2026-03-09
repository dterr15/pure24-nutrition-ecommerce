import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';

export default defineConfig({
  // Integrations
  integrations: [react()],

  // Root directory configuration
  srcDir: './frontend/src',
  outDir: './dist',

  // Configuración general
  site: 'https://pure24nutrition.cl',

  // Output: Static para preview local
  output: 'static',

  // Optimizaciones de build (deshabilitadas para preview local)
  vite: {
    build: {
      minify: false,
    },
    resolve: {
      alias: {
        '@': path.resolve('./frontend/src'),
      },
    },
  },

  // Prefetch
  prefetch: {
    prefetchAll: true,
  },

  // Image optimization
  image: {
    domains: ['pure24nutrition.cl'],
    remotePatterns: [
      {
        protocol: 'https',
      },
    ],
  },

  // Compresión y minificación automática
  compressHTML: true,

  // Configuración de servidor
  server: {
    port: 3000,
    host: true,
  },

  // Previsualización
  preview: {
    port: 3000,
    host: true,
  },
});
