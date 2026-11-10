import { CHATBOT_BUDGET_GIORNO, CHATBOT_GRATUITI } from 'astro:env/server';
import { PREZZI } from '../../data/chatbot';
import { paths, readJson, serialized, writeJson } from '../storage';
import { mbSlice, stripTags } from '../text';
import { romeDate, romeHour, romeIso } from '../time';

export interface LogEntry {
  timestamp: string;
  date: string;
  hour: number;
  ip_hash: string;
  message: string;
  response_preview: string;
  type: 'success' | 'cached' | 'offline' | 'filtered' | 'blocked';
  cached: boolean;
  user_agent: string;
  demo?: boolean;
  conversazione?: string;
  fornitore?: string;
  modello?: string;
  token_in?: number;
  token_cache?: number;
  token_out?: number;
  costo?: number;
  ms?: number;
  fallback?: number;
  errore?: string;
}

export const MAX_LOG = 10000;
const ATTESA_SCRITTURA = 2000;

export interface Token {
  ingresso: number;
  cache: number;
  scritturaCache: number;
  uscita: number;
}

const gratuiti = new Set(
  CHATBOT_GRATUITI.split(',')
    .map((f) => f.trim())
    .filter(Boolean),
);

function prezzo(modello: string) {
  const chiave = Object.keys(PREZZI)
    .filter((k) => modello.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return chiave ? PREZZI[chiave] : undefined;
}

export function calcolaCosto(fornitore: string, modello: string, t: Token): number | undefined {
  if (gratuiti.has(fornitore)) return 0;
  const p = prezzo(modello);
  if (!p) return undefined;
  const normali = t.ingresso - t.cache - t.scritturaCache;
  const usd = normali * p.ingresso + t.cache * p.cache + t.scritturaCache * (p.scritturaCache ?? p.ingresso) + t.uscita * p.uscita;
  return usd / 1e6;
}

const PRUDENTE = Object.values(PREZZI).reduce((a, b) => (b.uscita > a.uscita ? b : a));

function perBudget(l: Pick<LogEntry, 'costo' | 'type' | 'fornitore' | 'token_in' | 'token_out'>): number {
  if (l.costo !== undefined || l.type !== 'success' || gratuiti.has(l.fornitore ?? '')) return l.costo ?? 0;
  return ((l.token_in ?? 0) * PRUDENTE.ingresso + (l.token_out ?? 0) * PRUDENTE.uscita) / 1e6;
}

const spesa = { giorno: '', usd: 0 };

async function spesaDiOggi(): Promise<number> {
  const oggi = romeDate();
  if (spesa.giorno !== oggi) {
    const logs = await readJson<LogEntry[]>(paths.analytics, []);
    spesa.usd = [...logs, ...daScrivere].filter((l) => l.date === oggi && !l.demo).reduce((s, l) => s + perBudget(l), 0);
    spesa.giorno = oggi;
  }
  return spesa.usd;
}

export async function budgetEsaurito(): Promise<boolean> {
  return CHATBOT_BUDGET_GIORNO > 0 && (await spesaDiOggi()) >= CHATBOT_BUDGET_GIORNO;
}

type NuovaVoce = Pick<LogEntry, 'ip_hash' | 'message' | 'type' | 'user_agent'> &
  Partial<Omit<LogEntry, 'timestamp' | 'date' | 'hour' | 'cached' | 'response_preview'>> & { risposta: string };

let daScrivere: LogEntry[] = [];
let scrittura: Promise<void> | null = null;

function scriviRegistro() {
  scrittura ??= new Promise((r) => setTimeout(r, ATTESA_SCRITTURA))
    .then(() =>
      serialized(async () => {
        const nuove = daScrivere;
        daScrivere = [];
        const logs = await readJson<LogEntry[]>(paths.analytics, []);
        await writeJson(paths.analytics, [...logs, ...nuove].slice(-MAX_LOG));
      }),
    )
    .catch((e) => console.error('Errore registro chatbot:', e))
    .finally(() => {
      scrittura = null;
      if (daScrivere.length) scriviRegistro();
    });
}

export function registra({ risposta, ...voce }: NuovaVoce) {
  const now = Date.now();
  const entry: LogEntry = {
    timestamp: romeIso(now),
    date: romeDate(now),
    hour: romeHour(now),
    ...voce,
    ip_hash: voce.ip_hash.slice(0, 8),
    message: mbSlice(voce.message, 200),
    response_preview: mbSlice(stripTags(risposta), 100),
    cached: voce.type === 'cached',
    user_agent: mbSlice(voce.user_agent, 100),
  };
  if (spesa.giorno === entry.date) spesa.usd += perBudget(entry);
  daScrivere.push(entry);
  scriviRegistro();
}
