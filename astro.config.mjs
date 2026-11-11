// @ts-check
import { defineConfig, envField, fontProviders, sessionDrivers } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { readdir, readFile, writeFile } from 'node:fs/promises';

export default defineConfig({
  site: 'https://www.inballet.it',

  output: 'static',
  adapter: node({ mode: 'standalone' }),

  integrations: [
    sitemap({
      filter: (page) => !/\/(login|dashboard|presentazione|404)/.test(page),
    }),
    {
      name: 'sitemap-stile',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const mappe = (await readdir(dir)).filter((f) => /^sitemap-.*\.xml$/.test(f));
          for (const f of mappe) {
            const file = new URL(f, dir);
            const xml = await readFile(file, 'utf8');
            await writeFile(file, xml.replace('?>', '?><?xml-stylesheet type="text/css" href="/sitemap.css"?>'));
          }
        },
      },
    },
  ],

  trailingSlash: 'never',
  build: { format: 'file' },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  session: {
    driver: sessionDrivers.fsLite({ base: './data/sessions' }),
    cookie: { name: 'inballet-session', sameSite: 'lax' },
    ttl: 60 * 60 * 24,
  },

  security: {
    actionBodySizeLimit: 25 * 1024 * 1024,
    allowedDomains: [
      { hostname: '**.up.railway.app', protocol: 'https' },
      { hostname: 'inballet.it', protocol: 'https' },
      { hostname: 'www.inballet.it', protocol: 'https' },
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
    ],
  },

  env: {
    schema: {
      CHATBOT_MODELLI: envField.string({
        context: 'server',
        access: 'secret',
        default: 'gemini:gemini-flash-lite-latest,gemini:gemini-flash-latest,mistral:mistral-small-latest',
      }),
      CHATBOT_GRATUITI: envField.string({ context: 'server', access: 'secret', default: '' }),
      CHATBOT_BUDGET_GIORNO: envField.number({ context: 'server', access: 'secret', default: 1 }),
      CHATBOT_IP_HEADER: envField.string({ context: 'server', access: 'secret', optional: true }),
      ANTHROPIC_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GEMINI_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      MISTRAL_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GROQ_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      OPENROUTER_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      OPENAI_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CEREBRAS_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CHATBOT_COMPATIBILE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CHATBOT_COMPATIBILE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      DASHBOARD_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
      DATA_DIR: envField.string({ context: 'server', access: 'secret', default: './data' }),
      GOOGLE_PLACES_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_GOOGLE_PLACE_ID: envField.string({ context: 'client', access: 'public', default: 'ChIJMTLpHKeUhkcR23yEdflvQRQ' }),
    },
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Rubik',
      cssVariable: '--font-rubik',
      weights: ['300 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
  ],

  vite: {
    optimizeDeps: { include: ['astro/actions/runtime/entrypoints/client.js'] },
  },
});
