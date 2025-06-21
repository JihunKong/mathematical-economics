import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Force new hash for cache busting
        assetFileNames: (assetInfo) => {
          const timestamp = Date.now();
          const extType = assetInfo.name?.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            return `assets/[name]-${timestamp}[extname]`;
          }
          return `assets/[name]-${timestamp}[extname]`;
        },
        chunkFileNames: `assets/[name]-${Date.now()}.[hash].js`,
        entryFileNames: `assets/[name]-${Date.now()}.[hash].js`,
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://backend:5000',
        ws: true,
      },
    },
  },
});