// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'Packaging checklist',
    meta: {
      viewport: 'width=device-width, initial-scale=1.0',
      charset: 'utf-8',
      lang: 'en',
      description: 'Packaging checklist form builder',
    },
  },
});
