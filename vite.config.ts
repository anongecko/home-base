import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: ['static/wallpapers']
    }
  },
  build: {
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'lucide': ['lucide-svelte'],
        }
      }
    },
    // Better minification
    minify: 'esbuild',
    target: 'esnext',
    // Inline assets under 10kb
    assetsInlineLimit: 10240,
    // Increase chunk size warning for 5K images
    chunkSizeWarningLimit: 3000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['lucide-svelte', 'colorthief']
  },
  // Performance optimizations
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  }
});
