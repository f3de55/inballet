/**
 * Catena di fornitori AI con fallback. CHATBOT_MODELLI elenca i modelli in
 * ordine di priorità ("fornitore:modello,..."): si prova il primo e, se non
 * risponde (errore, limite, lentezza), il successivo. Un fornitore che
 * fallisce di continuo viene sospeso per qualche minuto (circuit breaker),
 * così chi scrive non aspetta un servizio fuori uso.
 *
 * Due adattatori coprono tutti i fornitori: l'SDK ufficiale per Claude
 * (Anthropic) e l'API "chat completions" compatibile OpenAI per gli altri.
 */
import Anthropic from '@anthropic-ai/sdk';
import { CHATBOT_MODELLI, getSecret } from 'astro:env/server';
import type { Sistema } from './conoscenza';
import type { Token } from './registro';

interface Fornitore {
  nome: string;
  /** Variabile d'ambiente con la chiave API */
  chiave: string;
  tipo: 'anthropic' | 'openai';
  /** Base URL dell'API compatibile OpenAI (o variabile d'ambiente che la contiene) */
  url?: string | { variabile: string };
  /** Nome del campo per il limite di token in uscita */
  campoMax?: 'max_tokens' | 'max_completion_tokens';
  /** Parametri aggiuntivi (ragionamento breve per i modelli "reasoning") */
  extra?: (modello: string) => Record<string, unknown>;
}

export const FORNITORI: Record<string, Fornitore> = {
  anthropic: { nome: 'Anthropic (Claude)', chiave: 'ANTHROPIC_API_KEY', tipo: 'anthropic' },
  gemini: {
    nome: 'Google Gemini',
    chiave: 'GEMINI_API_KEY',
    tipo: 'openai',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai',
    extra: () => ({ reasoning_effort: 'low' }),
  },
  mistral: { nome: 'Mistral', chiave: 'MISTRAL_API_KEY', tipo: 'openai', url: 'https://api.mistral.ai/v1' },
  groq: {
    nome: 'Groq',
    chiave: 'GROQ_API_KEY',
    tipo: 'openai',
    url: 'https://api.groq.com/openai/v1',
    extra: (m) => (m.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low', include_reasoning: false } : {}),
  },
  openrouter: {
    nome: 'OpenRouter',
    chiave: 'OPENROUTER_API_KEY',
    tipo: 'openai',
    url: 'https://openrouter.ai/api/v1',
    extra: () => ({ reasoning: { effort: 'low', exclude: true } }),
  },
  openai: {
    nome: 'OpenAI',
    chiave: 'OPENAI_API_KEY',
    tipo: 'openai',
    url: 'https://api.openai.com/v1',
    campoMax: 'max_completion_tokens',
    extra: (m) => (/^(gpt-[5-9]|o\d)/.test(m) ? { reasoning_effort: 'low' } : {}),
  },
  cerebras: {
    nome: 'Cerebras',
    chiave: 'CEREBRAS_API_KEY',
    tipo: 'openai',
    url: 'https://api.cerebras.ai/v1',
    extra: (m) => (m.startsWith('gpt-oss') ? { reasoning_effort: 'low' } : {}),
  },
  /** Qualsiasi altra API compatibile OpenAI (Ollama in locale, DeepSeek, Together…) */
  compatibile: { nome: 'API compatibile', chiave: 'CHATBOT_COMPATIBILE_KEY', tipo: 'openai', url: { variabile: 'CHATBOT_COMPATIBILE_URL' } },
};

const baseUrl = (f: Fornitore) => (typeof f.url === 'string' ? f.url : f.url && getSecret(f.url.variabile)?.replace(/\/+$/, ''));
const configurato = (f: Fornitore) => !!getSecret(f.chiave) && (f.tipo === 'anthropic' || !!baseUrl(f));

const CONFIG = {
  /** Token in uscita: risposte brevi, ma i modelli "reasoning" contano anche il ragionamento */
  maxToken: 1200,
  /** Attesa massima per un fornitore */
  timeout: 15_000,
  /** Attesa massima in totale, fallback compresi */
  scadenza: 35_000,
  /** Errori di fila prima della sospensione */
  erroriMax: 3,
  sospensione: 5 * 60_000,
  /** Sospensione per chiave o modello non validi: va corretta la configurazione */
  sospensioneConfig: 30 * 60_000,
};

export interface Anello {
  fornitore: string;
  modello: string;
}

/** Catena configurata, compresi i fornitori senza chiave (mostrati in dashboard). */
export function catena(): (Anello & { nome: string; attivo: boolean })[] {
  return CHATBOT_MODELLI.split(',')
    .map((voce) => voce.trim())
    .filter(Boolean)
    .map((voce) => {
      const i = voce.indexOf(':');
      return { fornitore: voce.slice(0, i).trim().toLowerCase(), modello: voce.slice(i + 1).trim() };
    })
    .filter((a) => {
      const ok = a.modello && FORNITORI[a.fornitore];
      if (!ok) console.warn(`CHATBOT_MODELLI: voce non valida "${a.fornitore}:${a.modello}" (fornitori: ${Object.keys(FORNITORI).join(', ')})`);
      return ok;
    })
    .map((a) => ({ ...a, nome: FORNITORI[a.fornitore].nome, attivo: configurato(FORNITORI[a.fornitore]) }));
}

// === CIRCUIT BREAKER ===

interface Stato {
  errori: number;
  sospesoFino: number;
  ultimoErrore?: string;
  quando?: number;
  /** Il fornitore ha rifiutato il prompt completo: si usa la conoscenza essenziale */
  essenziale?: boolean;
}

const stati = new Map<string, Stato>();
const chiave = (a: Anello) => `${a.fornitore}:${a.modello}`;
const statoDi = (a: Anello) => stati.get(chiave(a)) ?? stati.set(chiave(a), { errori: 0, sospesoFino: 0 }).get(chiave(a))!;

/** Stato di ogni anello della catena, per la dashboard. */
export function statoCatena() {
  return catena().map((a) => {
    const s = stati.get(chiave(a));
    return { ...a, sospesoFino: s && s.sospesoFino > Date.now() ? s.sospesoFino : 0, ultimoErrore: s?.ultimoErrore, quando: s?.quando, essenziale: !!s?.essenziale };
  });
}

class ErroreFornitore extends Error {
  constructor(
    message: string,
    readonly status = 0,
    /** Secondi indicati dal fornitore prima di riprovare */
    readonly riprovaTra?: number,
  ) {
    super(message);
  }
}

const troppoLungo = (e: ErroreFornitore) => e.status === 413 || /too large|context.?length|maximum context|too many tokens|reduce the length/i.test(e.message);

function registraErrore(a: Anello, e: ErroreFornitore) {
  const s = statoDi(a);
  s.ultimoErrore = e.message.slice(0, 200);
  s.quando = Date.now();
  s.errori++;
  if (e.status === 429) {
    // Limite del fornitore: si rispetta l'attesa indicata (tra 20 secondi e 15 minuti)
    s.sospesoFino = Date.now() + Math.min(Math.max(e.riprovaTra ?? 60, 20), 900) * 1000;
  } else if ([400, 401, 403, 404, 422].includes(e.status)) {
    s.sospesoFino = Date.now() + CONFIG.sospensioneConfig;
  } else if (s.errori >= CONFIG.erroriMax) {
    s.sospesoFino = Date.now() + CONFIG.sospensione;
  }
}

// === CHIAMATE ===

export interface Scambio {
  domanda: string;
  risposta: string;
}

interface Richiesta {
  sistema: Sistema;
  essenziale: boolean;
  storia: Scambio[];
  domanda: string;
  signal: AbortSignal;
}

interface RispostaModello {
  testo: string;
  token: Token;
}

const secondi = (h: string | null) => (h && Number.isFinite(+h) ? +h : undefined);

async function chiamaOpenAI(f: Fornitore, modello: string, chiaveApi: string, r: Richiesta): Promise<RispostaModello> {
  const sistema = `${r.essenziale ? r.sistema.essenziale : r.sistema.fisso}\n\n${r.sistema.variabile}`;
  let res: Response;
  try {
    res = await fetch(`${f.url}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${chiaveApi}` },
      body: JSON.stringify({
        model: modello,
        messages: [
          { role: 'system', content: sistema },
          ...r.storia.flatMap((s) => [
            { role: 'user', content: s.domanda },
            { role: 'assistant', content: s.risposta },
          ]),
          { role: 'user', content: r.domanda },
        ],
        [f.campoMax ?? 'max_tokens']: CONFIG.maxToken,
        ...f.extra?.(modello),
      }),
      signal: r.signal,
    });
  } catch (e) {
    throw new ErroreFornitore(r.signal.aborted ? 'timeout' : `rete: ${(e as Error).message}`);
  }
  if (!res.ok) {
    const corpo = await res.text().catch(() => '');
    throw new ErroreFornitore(`HTTP ${res.status} ${corpo.replace(/\s+/g, ' ').slice(0, 160)}`, res.status, secondi(res.headers.get('retry-after')));
  }
  const data = await res.json();
  const testo = data?.choices?.[0]?.message?.content;
  if (typeof testo !== 'string' || !testo.trim()) throw new ErroreFornitore(`risposta vuota (${data?.choices?.[0]?.finish_reason ?? '?'})`);
  const u = data.usage ?? {};
  const ingresso = u.prompt_tokens ?? 0;
  return {
    testo,
    token: {
      ingresso,
      cache: u.prompt_tokens_details?.cached_tokens ?? 0,
      scritturaCache: 0,
      // Alcuni fornitori non contano il ragionamento in completion_tokens ma sì nel totale
      uscita: Math.max(u.completion_tokens ?? 0, (u.total_tokens ?? 0) - ingresso),
    },
  };
}

async function chiamaAnthropic(modello: string, chiaveApi: string, r: Richiesta): Promise<RispostaModello> {
  const client = new Anthropic({ apiKey: chiaveApi, maxRetries: 0, timeout: CONFIG.timeout });
  // L'effort non esiste sui modelli 4.5 e precedenti
  const effort = /claude-(3|haiku-4-5|sonnet-4-5|opus-4-1)/.test(modello) ? {} : { output_config: { effort: 'low' as const } };
  let msg: Anthropic.Message;
  try {
    msg = await client.messages.create(
      {
        model: modello,
        max_tokens: CONFIG.maxToken,
        // Due punti di cache: la parte fissa resta valida anche quando cambia la variabile
        system: [
          { type: 'text', text: r.essenziale ? r.sistema.essenziale : r.sistema.fisso, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: r.sistema.variabile, cache_control: { type: 'ephemeral' } },
        ],
        messages: [
          ...r.storia.flatMap((s): Anthropic.MessageParam[] => [
            { role: 'user', content: s.domanda },
            { role: 'assistant', content: s.risposta },
          ]),
          { role: 'user', content: r.domanda },
        ],
        ...effort,
      },
      { signal: r.signal },
    );
  } catch (e) {
    if (e instanceof Anthropic.APIError && e.status) {
      throw new ErroreFornitore(`HTTP ${e.status} ${e.message.slice(0, 160)}`, e.status, secondi(e.headers?.get('retry-after') ?? null));
    }
    throw new ErroreFornitore(r.signal.aborted ? 'timeout' : `rete: ${(e as Error).message}`);
  }
  if (msg.stop_reason === 'refusal') throw new ErroreFornitore('risposta rifiutata dal modello');
  const testo = msg.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
  if (!testo.trim()) throw new ErroreFornitore(`risposta vuota (${msg.stop_reason})`);
  const u = msg.usage;
  const cache = u.cache_read_input_tokens ?? 0;
  const scritturaCache = u.cache_creation_input_tokens ?? 0;
  return { testo, token: { ingresso: u.input_tokens + cache + scritturaCache, cache, scritturaCache, uscita: u.output_tokens } };
}

/** Chiama un anello della catena, con timeout; se il prompt è troppo lungo riprova con la conoscenza essenziale. */
async function chiama(a: Anello, r: Omit<Richiesta, 'signal' | 'essenziale'>): Promise<RispostaModello> {
  const f = FORNITORI[a.fornitore];
  const chiaveApi = getSecret(f.chiave)!;
  const stato = statoDi(a);
  const prova = (essenziale: boolean) => {
    const signal = AbortSignal.timeout(CONFIG.timeout);
    const richiesta = { ...r, essenziale, signal };
    return f.tipo === 'anthropic' ? chiamaAnthropic(a.modello, chiaveApi, richiesta) : chiamaOpenAI(f, a.modello, chiaveApi, richiesta);
  };
  try {
    return await prova(!!stato.essenziale);
  } catch (e) {
    if (e instanceof ErroreFornitore && !stato.essenziale && troppoLungo(e)) {
      stato.essenziale = true;
      return prova(true);
    }
    throw e;
  }
}

export interface Tentativo extends Anello {
  errore: string;
}

export type Esito =
  | ({ ok: true; testo: string; token: Token; ms: number; tentativi: Tentativo[] } & Anello)
  | { ok: false; tentativi: Tentativo[] };

/**
 * Prova la catena in ordine, saltando i fornitori senza chiave o sospesi.
 * Con `solo` prova un unico anello, anche se sospeso (verifica dalla dashboard).
 */
export async function chiediAlModello(r: Omit<Richiesta, 'signal' | 'essenziale'>, solo?: Anello): Promise<Esito> {
  const inizio = Date.now();
  const tentativi: Tentativo[] = [];
  const anelli = solo ? [{ ...solo, attivo: !!getSecret(FORNITORI[solo.fornitore]?.chiave ?? '') }] : catena();
  for (const a of anelli) {
    if (!a.attivo) continue;
    if (!solo && statoDi(a).sospesoFino > Date.now()) continue;
    if (Date.now() - inizio > CONFIG.scadenza - 3000) break;
    const t0 = Date.now();
    try {
      const { testo, token } = await chiama(a, r);
      statoDi(a).errori = 0;
      return { ok: true, testo, token, ms: Date.now() - t0, tentativi, fornitore: a.fornitore, modello: a.modello };
    } catch (e) {
      const errore = e instanceof ErroreFornitore ? e : new ErroreFornitore((e as Error).message);
      registraErrore(a, errore);
      tentativi.push({ fornitore: a.fornitore, modello: a.modello, errore: errore.message.slice(0, 200) });
      console.warn(`Chatbot: ${a.fornitore}:${a.modello} non ha risposto (${errore.message.slice(0, 120)})`);
    }
  }
  return { ok: false, tentativi };
}
