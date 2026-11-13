import type { APIRoute } from 'astro';
import { indirizziSitemap } from '../lib/sitemap';

export const prerender = false;

export const GET: APIRoute = async ({ site, url }) => {
  const voci = (await indirizziSitemap(site!, url)).map((loc) => `<url><loc>${loc}</loc></url>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/css" href="/sitemap.css"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${voci}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
