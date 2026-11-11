import type { APIRoute } from 'astro';
import { isLoggedIn } from '../../lib/auth';
import { SITO_ATTUALE, SITO_OGGI } from '../../data/presentazione';

export const prerender = false;

const COPIATE = ['content-type', 'last-modified', 'etag'];
const ORIGINE = new URL(SITO_ATTUALE);

export const GET: APIRoute = async ({ params, url, session }) => {
  if (!(await isLoggedIn(session))) return new Response('Forbidden', { status: 403 });
  const indirizzo = new URL(`${params.percorso ?? ''}${url.search}`, `${SITO_ATTUALE}/`);
  if (indirizzo.host !== ORIGINE.host) return new Response('Not found', { status: 404 });
  const risposta = await fetch(indirizzo, { headers: { accept: '*/*' } }).catch(() => null);
  if (!risposta || new URL(risposta.url).host !== ORIGINE.host) return new Response('Bad gateway', { status: 502 });
  const intestazioni = new Headers({ 'Cache-Control': 'private, max-age=86400', 'X-Robots-Tag': 'noindex' });
  for (const nome of COPIATE) {
    const valore = risposta.headers.get(nome);
    if (valore) intestazioni.set(nome, valore);
  }
  if (!intestazioni.get('content-type')?.startsWith('text/html')) return new Response(risposta.body, { status: risposta.status, headers: intestazioni });
  const html = (await risposta.text()).replace(/<head([^>]*)>/i, `<head$1><base href="${SITO_OGGI}/">`);
  return new Response(html, { status: risposta.status, headers: intestazioni });
};
