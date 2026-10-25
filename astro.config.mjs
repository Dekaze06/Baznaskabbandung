import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

const isVercel = !!process.env.VERCEL;

// https://astro.build/config
export default defineConfig({
  adapter: isVercel
    ? vercel()
    : node({
        mode: 'standalone'
      }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  },
  devToolbar: {
    enabled: false
  },
  server: {
    port: 5173,
    host: true
  },
  redirects: {
    '/admin.html': '/admin'
  }
});
