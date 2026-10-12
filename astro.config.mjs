// @ts-check
import { defineConfig, envField, fontProviders, sessionDrivers } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://www.inballet.it',

  // Pagine pubbliche pre-renderizzate (HTML statico); dashboard, login e API
  // sono renderizzate on-demand dal server Node (`export const prerender = false`).
  output: 'static',
  adapter: node({ mode: 'standalone' }),

  // sitemap-index.xml con tutte le pagine pubbliche (area riservata esclusa)
  integrations: [sitemap({ filter: (page) => !/\/(login|dashboard)/.test(page) })],

  // URL puliti senza slash finale: /chi-siamo -> dist/client/chi-siamo.html
  trailingSlash: 'never',
  build: {
    format: 'file',
    // CSS piccoli (specifici di pagina) inline, il CSS globale resta in cache
    inlineStylesheets: 'auto',
  },

  compressHTML: true,

  // Stili scoped dei componenti con :where(): stessa specificità del CSS originale
  scopedStyleStrategy: 'where',

  // Prefetch dei link interni al passaggio del mouse: navigazione istantanea
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
    // Upload locandine dalla dashboard: fino a 5 immagini da 20MB per richiesta
    actionBodySizeLimit: 100 * 1024 * 1024,
    // Il sito gira dietro Cloudflare Tunnel: fidati degli header X-Forwarded-*
    // solo per questi host, così il controllo Origin dei form funziona.
    allowedDomains: [
      { hostname: '**.trycloudflare.com', protocol: 'https' },
      { hostname: 'inballet.it', protocol: 'https' },
      { hostname: 'www.inballet.it', protocol: 'https' },
      // Accesso locale (http://localhost:3000 dal container Docker)
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
    ],
  },

  env: {
    schema: {
      GROQ_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      // llama-3.3-70b-versatile (usato dal vecchio chatbot.php) non è più disponibile su Groq
      GROQ_MODEL: envField.string({ context: 'server', access: 'public', default: 'openai/gpt-oss-120b' }),
      DASHBOARD_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
      DATA_DIR: envField.string({ context: 'server', access: 'secret', default: './data' }),
      PUBLIC_GOOGLE_MAPS_KEY: envField.string({ context: 'client', access: 'public', default: 'AIzaSyB1T64uyO5Ke-MttLo9Amscl5ViUvYYvtI' }),
      PUBLIC_GOOGLE_PLACE_ID: envField.string({ context: 'client', access: 'public', default: 'ChIJMTLpHKeUhkcR23yEdflvQRQ' }),
    },
  },

  // Google Font self-hosted (niente richieste a fonts.googleapis.com) con
  // fallback metrici ottimizzati per evitare layout shift al caricamento.
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

  image: {
    // Immagini locali convertite in WebP e ridimensionate al build
    responsiveStyles: false,
  },
});
