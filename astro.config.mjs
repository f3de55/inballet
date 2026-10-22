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
  // /documenti è renderizzata dal server (contenuti dalla dashboard): va aggiunta a mano
  integrations: [
    sitemap({
      filter: (page) => !/\/(login|dashboard)/.test(page),
      customPages: ['https://www.inballet.it/documenti'],
    }),
  ],

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
    // Il sito gira dietro un proxy: fidati degli header X-Forwarded-*
    // solo per questi host, così il controllo Origin dei form funziona.
    allowedDomains: [
      { hostname: '**.up.railway.app', protocol: 'https' },
      { hostname: 'inballet.it', protocol: 'https' },
      { hostname: 'www.inballet.it', protocol: 'https' },
      // Accesso locale (http://localhost:3000 dal container Docker)
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
    ],
  },

  env: {
    schema: {
      // Chatbot Étoile: catena di modelli "fornitore:modello" in ordine di priorità
      // (se il primo non risponde si passa al successivo; senza chiave API viene saltato)
      CHATBOT_MODELLI: envField.string({
        context: 'server',
        access: 'public',
        default: 'gemini:gemini-flash-latest,gemini:gemini-flash-lite-latest,mistral:mistral-small-latest,groq:openai/gpt-oss-120b',
      }),
      // Fornitori usati col piano gratuito: la loro spesa conta zero (es. "gemini,groq")
      CHATBOT_GRATUITI: envField.string({ context: 'server', access: 'public', default: '' }),
      // Tetto di spesa giornaliero in dollari: superato, risposte solo dalle FAQ (0 = nessun tetto)
      CHATBOT_BUDGET_GIORNO: envField.number({ context: 'server', access: 'public', default: 1 }),
      // Header con l'IP reale del visitatore dietro un proxy (es. "cf-connecting-ip" con Cloudflare)
      CHATBOT_IP_HEADER: envField.string({ context: 'server', access: 'public', optional: true }),
      ANTHROPIC_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GEMINI_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      MISTRAL_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GROQ_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      OPENROUTER_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      OPENAI_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CEREBRAS_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Fornitore "compatibile": qualsiasi altra API in stile OpenAI (es. http://localhost:11434/v1 per Ollama)
      CHATBOT_COMPATIBILE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CHATBOT_COMPATIBILE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
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
