// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginPWA } from 'rsbuild-plugin-pwa';

const config = {
  plugins: [pluginReact()],
  dev: {
    lazyCompilation: true,
  },
  html: {
    template: './index.html',
  },
};

// Only add PWA plugin for production builds
if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    pluginPWA({
      // service worker config
      sw: {
        mode: 'generateSw',
        workboxOptions: {
          navigateFallback: '/index.html',
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/tgpackagingappprd\.azurewebsites\.net\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 5,
                expiration: { maxAgeSeconds: 60 * 60 * 24 },
              },
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
          name: 'DigiForms App',
          short_name: 'DigiForms',
          description: 'Digitalization form builder',
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
  );
}

export default defineConfig(config);
