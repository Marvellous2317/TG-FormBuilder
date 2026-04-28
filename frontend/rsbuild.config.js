// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginPWA } from 'rsbuild-plugin-pwa';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginPWA({
      // disabled in dev by default — set dev: true to enable in dev mode
      dev: false,

      // service worker config
      sw: {
        mode: 'generateSw',
        workboxOptions: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/tgpackagingappprd\.azurewebsites\.net\//,
              handler: 'NetworkFirst',
              options: { cacheName: 'api-cache' },
            },
            {
              urlPattern: /\.(?:png|jpg|svg|css|js)$/,
              handler: 'CacheFirst',
              options: { cacheName: 'assets-cache' },
            },
          ],
        },
      },

      // manifest config
      webAppManifest: {
        content: {
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
      },
    }),
  ],
  html: {
    template: './index.html',
  },
});
