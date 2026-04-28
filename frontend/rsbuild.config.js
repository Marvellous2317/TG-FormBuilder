// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginPWA } from 'rsbuild-plugin-pwa';

// const isProd = process.env.NODE_ENV === 'production';
const isProd = true;

export default defineConfig({
  plugins: [
    pluginReact(),
    isProd &&
      pluginPWA({
        injectManifest: {
          swSrc: './src/service-worker.js',
        },
      }),
  ],
  html: {
    template: './index.html',
  },
});
