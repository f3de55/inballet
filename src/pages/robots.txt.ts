import type { APIRoute } from 'astro';

export const prerender = false;

const ufficiale = ['User-agent: *', 'Allow: /', 'Disallow: /login', 'Disallow: /dashboard', 'Disallow: /presentazione', 'Disallow: /_actions/'];

export const GET: APIRoute = ({ site, url }) => {
  const dominio = url.hostname.replace(/^www\./, '') === site!.hostname.replace(/^www\./, '');
  const righe = dominio ? [...ufficiale, '', `Sitemap: ${new URL('/sitemap.xml', site)}`] : ['User-agent: *', 'Disallow: /'];
  return new Response(righe.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
