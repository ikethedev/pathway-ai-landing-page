// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',           // project root directory
  publicDir: 'public', // where your assets and index.html live
  build: {
    outDir: 'dist',    // Netlify expects this to be the output
    emptyOutDir: true,
  },
});