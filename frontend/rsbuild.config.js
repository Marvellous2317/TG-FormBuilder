// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginPWA } from 'rsbuild-plugin-pwa';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    pluginReact(),
    isProd &&
      pluginPWA({
        injectManifest: {
          swSrc: './src/service-worker.js',
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/tgpackagingappprd\.azurewebsites\.net\//,
              handler: 'NetworkFirst',
            },
            {
              urlPattern: /\.(?:png|jpg|svg|css|js)$/,
              handler: 'CacheFirst',
              options: { cacheName: 'assets-cache' },
            },
          ],
        },
        manifest: {
          name: 'Packaging checklist',
          short_name: 'Packaging checklist',
          description: 'Packaging checklist form builder',
          theme_color: '#2463eb',
          background_color: '#2463eb',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
      }),
  ],
  html: {
    template: './index.html',
  },
});
