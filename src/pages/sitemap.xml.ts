import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

const ESCLUSE = /^(\[.*\]|404|login|dashboard|presentazione)$/;
const HOST_DI_PROVA = /(^|\.)up\.railway\.app$|^localhost$|^127\.0\.0\.1$/;

const pagine = Object.keys(import.meta.glob('./*.astro'))
  .map((file) => file.slice(2, -'.astro'.length))
  .filter((nome) => !ESCLUSE.test(nome))
  .map((nome) => (nome === 'index' ? '' : nome));

export const GET: APIRoute = async ({ site, url }) => {
  const base = HOST_DI_PROVA.test(url.hostname) ? url.origin : site!.origin;
  const corsi = (await getCollection('corsi')).map((corso) => corso.id);
  const voci = [...pagine, ...corsi]
    .sort()
    .map((percorso) => `<url><loc>${base}/${percorso}</loc></url>`)
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/css" href="/sitemap.css"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${voci}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
