import { defineMiddleware } from 'astro:middleware';
import { isLoggedIn } from './lib/auth';
import { immagineOttimizzata } from './lib/immagini-ottimizzate';

const CARICAMENTI = /^\/_actions\/(?:immagini\.carica|documenti\.salva|insegnanti\.salva|revisione\.pezzo)\/?$/;
const CORPO_MASSIMO = 256 * 1024;
const RISERVATE = /^\/(?:dashboard|login)(?:\/|$)/;

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();
  const { request, url } = context;

  if (request.method === 'POST') {
    const peso = Number(request.headers.get('content-length') ?? 0);
    if (peso > CORPO_MASSIMO && !(CARICAMENTI.test(url.pathname) && (await isLoggedIn(context.session)))) {
      return new Response('Payload too large', { status: 413 });
    }
    if (url.pathname.startsWith('/_actions/') && request.headers.get('origin') !== url.origin) {
      return new Response('Forbidden', { status: 403 });
    }
  }

  const immagine = url.pathname === '/_image' && (request.method === 'GET' || request.method === 'HEAD');
  const risposta = immagine ? await immagineOttimizzata(request, url, () => next()) : await next();
  risposta.headers.set('X-Content-Type-Options', 'nosniff');
  risposta.headers.set('X-Frame-Options', 'SAMEORIGIN');
  risposta.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (RISERVATE.test(url.pathname)) risposta.headers.set('Cache-Control', 'no-store');
  return risposta;
});
