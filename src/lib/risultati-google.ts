import { readFile, writeFile } from 'node:fs/promises';
import { SERPAPI_KEY } from 'astro:env/server';
import { QUERY_GOOGLE } from '../data/presentazione';
import { ensureDir, paths, readJson, writeJson } from './storage';

const DURATA = 30 * 86400_000;
const RIPROVA = 86400_000;
const LUOGO = 'Lainate,Lombardy,Italy';
const RICHIESTA = `${QUERY_GOOGLE} · ${LUOGO} · html · ai`;

export interface PanoramicaAI {
  text_blocks?: { type?: string; snippet?: string; list?: { title?: string; snippet?: string }[] }[];
  references?: { title?: string; link?: string; source?: string }[];
}

interface Ricerca {
  richiesta: string;
  aggiornato: string;
  ai: PanoramicaAI | null;
}

export interface PaginaGoogle {
  aggiornato: string;
  html: string;
  ai: PanoramicaAI | null;
}

interface RispostaSerpApi {
  error?: string;
  search_metadata?: { id?: string; raw_html_file?: string };
  ai_overview?: PanoramicaAI & { page_token?: string };
}

async function serpApi(parametri: Record<string, string>): Promise<RispostaSerpApi> {
  const url = new URL('https://serpapi.com/search.json');
  for (const [nome, valore] of Object.entries(parametri)) url.searchParams.set(nome, valore);
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  const r = (await res.json()) as RispostaSerpApi;
  if (!res.ok || r.error) throw new Error(r.error ?? `HTTP ${res.status}`);
  return r;
}

async function panoramica(r: RispostaSerpApi, chiave: string): Promise<PanoramicaAI | null> {
  const ai = r.ai_overview;
  if (!ai?.page_token) return ai?.text_blocks?.length ? ai : null;
  const seguito = await serpApi({ engine: 'google_ai_overview', page_token: ai.page_token, api_key: chiave }).catch(() => null);
  return seguito?.ai_overview?.text_blocks?.length ? seguito.ai_overview : null;
}

async function testo(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  const corpo = await res.text();
  return res.ok && /<html/i.test(corpo) ? corpo : null;
}

async function scarica(chiave: string): Promise<PaginaGoogle> {
  const r = await serpApi({ engine: 'google', q: QUERY_GOOGLE, location: LUOGO, hl: 'it', gl: 'it', google_domain: 'google.it', api_key: chiave });
  const { id, raw_html_file: grezzo } = r.search_metadata ?? {};
  const archivio = id ? `https://serpapi.com/searches/${encodeURIComponent(id)}.html?api_key=${encodeURIComponent(chiave)}` : '';
  const html = (archivio && (await testo(archivio))) || (grezzo && (await testo(grezzo)));
  if (!html) throw new Error('pagina HTML di Google non disponibile');
  const pagina = { aggiornato: new Date().toISOString(), html, ai: await panoramica(r, chiave) };
  await ensureDir(paths.data);
  await writeFile(paths.paginaGoogle, html);
  await writeJson(paths.ricercaGoogle, { richiesta: RICHIESTA, aggiornato: pagina.aggiornato, ai: pagina.ai } satisfies Ricerca);
  return pagina;
}

async function salvata(): Promise<PaginaGoogle | null> {
  const r = await readJson<Partial<Ricerca> | null>(paths.ricercaGoogle, null);
  if (r?.richiesta !== RICHIESTA || !Number.isFinite(Date.parse(r.aggiornato ?? ''))) return null;
  const html = await readFile(paths.paginaGoogle, 'utf8').catch(() => null);
  return html ? { aggiornato: r.aggiornato ?? '', html, ai: r.ai ?? null } : null;
}

let pagina: PaginaGoogle | null = null;
let lettura: Promise<void> | null = null;
let aggiornamento: Promise<void> | null = null;
let prossimoTentativo = 0;

export async function paginaGoogle(): Promise<PaginaGoogle | null> {
  if (!SERPAPI_KEY) return null;
  const chiave = SERPAPI_KEY;
  lettura ??= salvata().then((p) => {
    pagina = p;
  });
  await lettura;
  if (pagina && Date.now() - Date.parse(pagina.aggiornato) < DURATA) return pagina;
  if (Date.now() < prossimoTentativo) return pagina;
  aggiornamento ??= scarica(chiave)
    .then((nuova) => {
      pagina = nuova;
    })
    .catch((e) => {
      prossimoTentativo = Date.now() + RIPROVA;
      console.error('Pagina di Google:', (e as Error).message);
    })
    .finally(() => (aggiornamento = null));
  await aggiornamento;
  return pagina;
}
