import { SERPAPI_KEY } from 'astro:env/server';
import { QUERY_GOOGLE } from '../data/presentazione';
import { paths, readJson, writeJson } from './storage';

const DURATA = 30 * 86400_000;
const RIPROVA = 86400_000;
const LUOGO = 'Lainate,Lombardy,Italy';
const RICHIESTA = `${QUERY_GOOGLE} · ${LUOGO} · pagina intera`;
const SCARTATI = ['search_metadata', 'search_parameters', 'serpapi_pagination', 'pagination'];

export interface Organico {
  position?: number;
  title?: string;
  link?: string;
  source?: string;
  displayed_link?: string;
  favicon?: string;
  snippet?: string;
  snippet_highlighted_words?: string[];
  date?: string;
  sitelinks?: { inline?: { title?: string }[]; expanded?: { title?: string; snippet?: string }[] };
  rich_snippet?: { top?: { detected_extensions?: { rating?: number; reviews?: number } } };
}

export interface Luogo {
  title?: string;
  rating?: number;
  reviews?: number;
  type?: string;
  address?: string;
  hours?: string;
  thumbnail?: string;
}

export interface PaginaGoogle {
  organic_results?: Organico[];
  local_results?: { places?: Luogo[] } | Luogo[];
  local_map?: { image?: string };
  knowledge_graph?: {
    title?: string;
    type?: string;
    description?: string;
    address?: string;
    phone?: string;
    hours?: Record<string, { opens?: string; closes?: string }>;
    rating?: number;
    review_count?: number;
    header_images?: { image?: string }[];
  };
  related_questions?: { question?: string }[];
  related_searches?: { query?: string }[];
}

export interface RicercaGoogle {
  richiesta: string;
  aggiornato: string;
  pagina: PaginaGoogle;
}

async function scarica(chiave: string): Promise<RicercaGoogle> {
  const url = new URL('https://serpapi.com/search.json');
  const parametri = { engine: 'google', q: QUERY_GOOGLE, location: LUOGO, hl: 'it', gl: 'it', google_domain: 'google.it', api_key: chiave };
  for (const [nome, valore] of Object.entries(parametri)) url.searchParams.set(nome, valore);
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  const risposta = (await res.json()) as PaginaGoogle & { error?: string };
  if (!res.ok || risposta.error) throw new Error(risposta.error ?? `HTTP ${res.status}`);
  if (!risposta.organic_results?.length) throw new Error('nessun risultato');
  const pagina = Object.fromEntries(Object.entries(risposta).filter(([nome]) => !SCARTATI.includes(nome))) as PaginaGoogle;
  return { richiesta: RICHIESTA, aggiornato: new Date().toISOString(), pagina };
}

const valida = (d: unknown): d is RicercaGoogle => {
  const x = d as Partial<RicercaGoogle> | null;
  return !!x && x.richiesta === RICHIESTA && Number.isFinite(Date.parse(x.aggiornato ?? '')) && !!x.pagina;
};

let ricerca: RicercaGoogle | null = null;
let lettura: Promise<void> | null = null;
let aggiornamento: Promise<void> | null = null;
let prossimoTentativo = 0;

export async function ricercaGoogle(): Promise<RicercaGoogle | null> {
  if (!SERPAPI_KEY) return null;
  const chiave = SERPAPI_KEY;
  lettura ??= readJson<unknown>(paths.ricercaGoogle, null).then((salvata) => {
    if (valida(salvata)) ricerca = salvata;
  });
  await lettura;
  if (ricerca && Date.now() - Date.parse(ricerca.aggiornato) < DURATA) return ricerca;
  if (Date.now() < prossimoTentativo) return ricerca;
  aggiornamento ??= scarica(chiave)
    .then((nuova) => {
      ricerca = nuova;
      return writeJson(paths.ricercaGoogle, nuova);
    })
    .catch((e) => {
      prossimoTentativo = Date.now() + RIPROVA;
      console.error('Risultati di Google:', (e as Error).message);
    })
    .finally(() => (aggiornamento = null));
  await aggiornamento;
  return ricerca;
}
