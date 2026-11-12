import type { APIRoute } from 'astro';
import { isLoggedIn } from '../../lib/auth';
import { paginaGoogle } from '../../lib/risultati-google';

export const prerender = false;

const INTESTAZIONI = {
  'Content-Type': 'text/html; charset=utf-8',
  'Content-Security-Policy': "script-src 'none'; frame-ancestors 'self'",
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex',
};

export const GET: APIRoute = async ({ session }) => {
  if (!(await isLoggedIn(session))) return new Response(null, { status: 401 });
  const pagina = await paginaGoogle();
  const html = pagina
    ? pagina.html.replace(
        /<head([^>]*)>/i,
        (_, attributi: string) =>
          `<head${attributi}><base href="https://www.google.com/" target="_blank"><script type="application/json" id="pres-panoramica-ai">${JSON.stringify(pagina.ai).replace(/</g, '\\u003c')}</script>`,
      )
    : '<!doctype html><html lang="it"><meta charset="utf-8"><title>Google</title><p>Pagina di Google non disponibile: manca la chiave SERPAPI_KEY o SerpApi non risponde.</p></html>';
  return new Response(html, { headers: INTESTAZIONI });
};
