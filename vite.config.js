import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'assets',
    assetsDir: '',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.js'),
      output: {
        // Keep file names stable for Shopify
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'tailwind.css';
          return assetInfo.name || '[name].[ext]';
        },
        entryFileNames: 'tailwind-build.js',
        chunkFileNames: 'tailwind-chunk.js',
      },
    },
  },
});
