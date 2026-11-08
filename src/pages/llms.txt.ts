import type { APIRoute } from 'astro';
import { leggiDocumenti } from '../lib/documenti';
import { riepilogoScuola } from '../lib/riepilogo';

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  const { documenti } = await leggiDocumenti();
  const md = await riepilogoScuola({ url: (path) => new URL(path, site).href, documenti });
  return new Response(md, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
