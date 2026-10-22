/**
 * Sitemap delle pagine evento, generata a ogni richiesta (gli eventi cambiano
 * dalla dashboard, la sitemap delle altre pagine nasce al build).
 * Esclusi bozze ed eventi demo. Indicata in robots.txt.
 */
import type { APIRoute } from 'astro';
import { eventiPubblici, urlEvento } from '../lib/eventi';

export const prerender = false;

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = async ({ site, url }) => {
  const base = site ?? new URL(url.origin);
  const eventi = (await eventiPubblici()).filter((e) => !e.demo);
  const righe = eventi.map((e) => {
    const lastmod = /^\d{4}-\d{2}-\d{2}/.exec(e.modificato)?.[0];
    return `  <url><loc>${xml(new URL(urlEvento(e), base).href)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
  });
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${righe.join('\n')}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
