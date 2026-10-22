/**
 * llms.txt: riepilogo in Markdown dei fatti chiave della scuola per assistenti
 * e motori di ricerca basati su AI (https://llmstxt.org). Il testo è generato
 * da src/lib/riepilogo.ts, la stessa base di conoscenza del chatbot.
 */
import type { APIRoute } from 'astro';
import { leggiDocumenti } from '../lib/documenti';
import { riepilogoScuola } from '../lib/riepilogo';

// I documenti di /documenti sono modificabili dalla dashboard: il file si genera a ogni richiesta
export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  const { documenti } = await leggiDocumenti();
  const md = await riepilogoScuola({ url: (path) => new URL(path, site).href, documenti });
  return new Response(md, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
