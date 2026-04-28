// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginPWA } from 'rsbuild-plugin-pwa';

// @ts-ignore - process is available in Node.js (rsbuild config context)
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    pluginReact(),
    isProd &&
      pluginPWA({
        injectManifest: {
          swSrc: './src/service-worker.js',
        },
        manifest: {
          name: 'Packaging checklist App',
          short_name: 'Packaging checklist',
          description: 'Packaging checklist form builder',
          start_url: '/login',
          display: 'standalone',
          background_color: '#2463eb',
          theme_color: '#2463eb',
          orientation: 'portrait',
          lang: 'en',
          icons: [
            {
              src: '/icons/manifest-icon-192.maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/manifest-icon-192.maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icons/manifest-icon-512.maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/manifest-icon-512.maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
  ],
  html: {
    template: './index.html',
  },
});
