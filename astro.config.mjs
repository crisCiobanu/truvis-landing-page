import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://truvis.app',
  integrations: [react(), sitemap()],
  // Story 1.6 / AR17 / FR50 — Astro built-in i18n routing.
  // English ships at `/` (prefixDefaultLocale: false); French and German
  // URLs `/fr/` and `/de/` are reserved for V1.2 translated content. For
  // V1 the FR/DE message files are byte-for-byte English copies (FR52).
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [
      tailwindcss({
        content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
      }),
    ],
  },
  output: 'static',
});
