import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        index: resolve('index.html'),
        'wc.d': resolve('src/wc.ts')
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});