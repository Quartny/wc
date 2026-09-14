import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

export default defineConfig(() => ({
  plugins: [qwikVite()],
  server: { headers: { 'Cache-Control': 'no-store' } },
  preview: { headers: { 'Cache-Control': 'no-store' } },
}));
