import { SERPAPI_KEY } from 'astro:env/server';
import { QUERY_GOOGLE } from '../data/presentazione';
import { paths, readJson, writeJson } from './storage';
const DURATA = 12 * 3600_000;
const MAX_RISULTATI = 4;

export interface RisultatoGoogle {
  titolo: string;
  link: string;
  sito: string;
  indirizzo: string;
  icona: string;
  testo: string;
  evidenze: string[];
}

export interface RicercaGoogle {
  aggiornato: string;
  risultati: RisultatoGoogle[];
}

interface RispostaSerpApi {
  error?: string;
  organic_results?: {
    title?: string;
    link?: string;
    source?: string;
    displayed_link?: string;
    favicon?: string;
    snippet?: string;
    snippet_highlighted_words?: string[];
  }[];
}

async function scarica(chiave: string): Promise<RicercaGoogle> {
  const url = new URL('https://serpapi.com/search.json');
  const parametri = { engine: 'google', q: QUERY_GOOGLE, hl: 'it', gl: 'it', google_domain: 'google.it', api_key: chiave };
  for (const [nome, valore] of Object.entries(parametri)) url.searchParams.set(nome, valore);
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  const r = (await res.json()) as RispostaSerpApi;
  if (!res.ok || r.error) throw new Error(r.error ?? `HTTP ${res.status}`);
  const risultati = (r.organic_results ?? [])
    .filter((x) => x.title && x.link)
    .slice(0, MAX_RISULTATI)
    .map((x) => ({
      titolo: x.title ?? '',
      link: x.link ?? '',
      sito: x.source ?? new URL(x.link ?? '').hostname,
      indirizzo: x.displayed_link ?? x.link ?? '',
      icona: x.favicon ?? '',
      testo: x.snippet ?? '',
      evidenze: x.snippet_highlighted_words ?? [],
    }));
  if (!risultati.length) throw new Error('nessun risultato');
  return { aggiornato: new Date().toISOString(), risultati };
}

const valida = (d: unknown): d is RicercaGoogle => {
  const x = d as Partial<RicercaGoogle> | null;
  return !!x && Number.isFinite(Date.parse(x.aggiornato ?? '')) && Array.isArray(x.risultati);
};

let ricerca: RicercaGoogle | null = null;
let lettura: Promise<void> | null = null;
let aggiornamento: Promise<void> | null = null;

export async function ricercaGoogle(): Promise<RicercaGoogle | null> {
  if (!SERPAPI_KEY) return null;
  const chiave = SERPAPI_KEY;
  lettura ??= readJson<unknown>(paths.ricercaGoogle, null).then((salvata) => {
    if (valida(salvata)) ricerca = salvata;
  });
  await lettura;
  if (ricerca && Date.now() - Date.parse(ricerca.aggiornato) < DURATA) return ricerca;
  aggiornamento ??= scarica(chiave)
    .then((nuova) => {
      ricerca = nuova;
      return writeJson(paths.ricercaGoogle, nuova);
    })
    .catch((e) => console.error('Risultati di Google:', (e as Error).message))
    .finally(() => (aggiornamento = null));
  await aggiornamento;
  return ricerca;
}
