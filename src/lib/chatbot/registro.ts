/**
 * Registro dei messaggi (data/analytics.json, letto dalla dashboard), calcolo
 * della spesa e tetto giornaliero.
 */
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
  /**
   * success: risposta del modello · cached: dalla cache · offline: dalle FAQ, senza modello
   * (fornitori irraggiungibili o tetto di spesa) · filtered/blocked: messaggio rifiutato.
   * error: solo nei registri precedenti alla catena di fornitori.
   */
  type: 'success' | 'cached' | 'offline' | 'filtered' | 'blocked' | 'error';
  cached: boolean;
  user_agent: string;
  /** Creato dal generatore demo della dashboard */
  demo?: boolean;
  /** Primi 8 caratteri dell'ID conversazione */
  conversazione?: string;
  fornitore?: string;
  modello?: string;
  token_in?: number;
  token_cache?: number;
  token_out?: number;
  /** Spesa in dollari (assente se il modello non è nel listino) */
  costo?: number;
  /** Tempo di risposta del modello in millisecondi */
  ms?: number;
  /** Fornitori falliti prima della risposta */
  fallback?: number;
  /** Ultimo errore dei fornitori (anche se poi un altro ha risposto) */
  errore?: string;
}

export const MAX_LOG = 10000;

export interface Token {
  /** Token in ingresso in totale (cache compresa) */
  ingresso: number;
  /** Di cui letti dalla cache del fornitore */
  cache: number;
  /** Di cui scritti in cache (Anthropic) */
  scritturaCache: number;
  uscita: number;
}

const gratuiti = new Set(CHATBOT_GRATUITI.split(',').map((f) => f.trim()).filter(Boolean));

/** Prezzo del modello: la chiave di listino più lunga con cui inizia l'ID. */
function prezzo(modello: string) {
  const chiave = Object.keys(PREZZI)
    .filter((k) => modello.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return chiave ? PREZZI[chiave] : undefined;
}

/** Spesa in dollari di una risposta; undefined se il modello non è nel listino. */
export function calcolaCosto(fornitore: string, modello: string, t: Token): number | undefined {
  if (gratuiti.has(fornitore)) return 0;
  const p = prezzo(modello);
  if (!p) return undefined;
  const normali = t.ingresso - t.cache - t.scritturaCache;
  const usd = normali * p.ingresso + t.cache * p.cache + t.scritturaCache * (p.scritturaCache ?? p.ingresso) + t.uscita * p.uscita;
  return Math.round(usd) / 1e6 === 0 ? usd / 1e6 : usd / 1e6;
}

// === TETTO DI SPESA GIORNALIERO ===

const spesa = { giorno: '', usd: 0 };

/** Spesa di oggi: alla prima chiamata (o a un nuovo giorno) la ricalcola dal registro. */
async function spesaDiOggi(): Promise<number> {
  const oggi = romeDate();
  if (spesa.giorno !== oggi) {
    const logs = await readJson<LogEntry[]>(paths.analytics, []);
    spesa.usd = logs.filter((l) => l.date === oggi && !l.demo).reduce((s, l) => s + (l.costo ?? 0), 0);
    spesa.giorno = oggi;
  }
  return spesa.usd;
}

export async function budgetEsaurito(): Promise<boolean> {
  return CHATBOT_BUDGET_GIORNO > 0 && (await spesaDiOggi()) >= CHATBOT_BUDGET_GIORNO;
}

// === SCRITTURA ===

export type NuovaVoce = Pick<LogEntry, 'ip_hash' | 'message' | 'type' | 'user_agent'> &
  Partial<Omit<LogEntry, 'timestamp' | 'date' | 'hour' | 'cached' | 'response_preview'>> & { risposta: string };

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
  if (entry.costo && spesa.giorno === entry.date) spesa.usd += entry.costo;
  // Scrittura in coda: non rallenta la risposta e non perde righe concorrenti
  void serialized(async () => {
    const logs = await readJson<LogEntry[]>(paths.analytics, []);
    logs.push(entry);
    await writeJson(paths.analytics, logs.slice(-MAX_LOG));
  }).catch((e) => console.error('Errore registro chatbot:', e));
}
