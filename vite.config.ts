import { defineConfig } from 'vite';

export default defineConfig(() => ({
  server: { headers: { 'Cache-Control': 'no-store' } },
  preview: { headers: { 'Cache-Control': 'no-store' } },
}));
