import { resolve } from 'path'

/**
 * Vite config to build Tailwind CSS into Shopify `assets/`.
 * We use a tiny JS entry that only imports the CSS. The emitted JS file can be ignored in theme.
 */
export default {
  root: '.',
  build: {
    outDir: 'assets',
    assetsDir: '',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.js'),
      output: {
        // Keep file names stable for Shopify
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'tailwind.css'
          return assetInfo.name || '[name].[ext]'
        },
        entryFileNames: 'tailwind-build.js',
        chunkFileNames: 'tailwind-chunk.js',
      },
    },
  },
}
