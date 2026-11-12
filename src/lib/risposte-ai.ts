import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY, OPENAI_API_KEY } from 'astro:env/server';
import { DOMANDA_AI, type Assistente } from '../data/presentazione';
import { paths, readJson, serialized, writeJson } from './storage';
import { escapeHtml } from './text';

const DURATA = 30 * 86400_000;
const RIPROVA = 86400_000;
const ATTESA = 180_000;
const RIPRESE = 5;
const MODELLI: Record<Assistente, string> = { chatgpt: 'gpt-6-astra', claude: 'claude-opus-5-5' };
const LUOGO = { type: 'approximate', city: 'Lainate', region: 'Lombardia', country: 'IT', timezone: 'Europe/Rome' } as const;

export interface Fonte {
  titolo: string;
  url: string;
}

export interface RispostaAI {
  richiesta: string;
  modello: string;
  testo: string;
  fonti: Fonte[];
  aggiornato: string;
}

type Archivio = Partial<Record<Assistente, RispostaAI>>;

interface RispostaOpenAI {
  model?: string;
  error?: { message?: string };
  output?: { type: string; content?: { type: string; text?: string; annotations?: { type: string; url?: string; title?: string }[] }[] }[];
}

const richiesta = (a: Assistente) => `${DOMANDA_AI} · ${MODELLI[a]}`;

function fonti(lista: { url?: string | null; title?: string | null }[]): Fonte[] {
  const viste = new Map<string, Fonte>();
  for (const { url, title } of lista) {
    if (!url || !/^https?:\/\//.test(url) || viste.has(url)) continue;
    viste.set(url, { titolo: title?.trim() || new URL(url).hostname, url });
  }
  return [...viste.values()];
}

async function claude(chiave: string): Promise<Omit<RispostaAI, 'richiesta' | 'aggiornato'>> {
  const client = new Anthropic({ apiKey: chiave, timeout: ATTESA });
  const messaggi: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: DOMANDA_AI }];
  const blocchi: Anthropic.Beta.BetaContentBlock[] = [];
  let modello: string = MODELLI.claude;
  for (let giro = 0; giro < RIPRESE; giro++) {
    const r = await client.beta.messages.create({
      model: MODELLI.claude,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5, user_location: LUOGO }],
      messages: messaggi,
    });
    if (r.stop_reason === 'refusal') throw new Error('Claude non ha risposto');
    blocchi.push(...r.content);
    modello = r.model;
    if (r.stop_reason !== 'pause_turn') break;
    messaggi.push({ role: 'assistant', content: r.content });
  }
  const testi = blocchi.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text');
  const citazioni = testi.flatMap((b) => b.citations ?? []).filter((c) => c.type === 'web_search_result_location');
  return { modello, testo: testi.map((b) => b.text).join(''), fonti: fonti(citazioni) };
}

async function chatgpt(chiave: string): Promise<Omit<RispostaAI, 'richiesta' | 'aggiornato'>> {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chiave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODELLI.chatgpt, input: DOMANDA_AI, tools: [{ type: 'web_search', user_location: LUOGO }] }),
    signal: AbortSignal.timeout(ATTESA),
  });
  const r = (await res.json()) as RispostaOpenAI;
  if (!res.ok) throw new Error(r.error?.message ?? `HTTP ${res.status}`);
  const testi = (r.output ?? [])
    .filter((o) => o.type === 'message')
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === 'output_text');
  const citazioni = testi.flatMap((c) => c.annotations ?? []).filter((a) => a.type === 'url_citation');
  return { modello: r.model ?? MODELLI.chatgpt, testo: testi.map((c) => c.text ?? '').join('\n\n'), fonti: fonti(citazioni) };
}

const CHIAMATE: Record<Assistente, { chiave: () => string | undefined; chiedi: (chiave: string) => ReturnType<typeof claude> }> = {
  chatgpt: { chiave: () => OPENAI_API_KEY, chiedi: chatgpt },
  claude: { chiave: () => ANTHROPIC_API_KEY, chiedi: claude },
};

let archivio: Archivio | null = null;
let lettura: Promise<Archivio> | null = null;
const aggiornamenti = new Map<Assistente, Promise<void>>();
const tentativi = new Map<Assistente, number>();

async function chiedi(a: Assistente, chiave: string) {
  const r = await CHIAMATE[a].chiedi(chiave);
  if (!r.testo.trim()) throw new Error('risposta vuota');
  await serialized(async () => {
    archivio = { ...archivio, [a]: { ...r, richiesta: richiesta(a), aggiornato: new Date().toISOString() } };
    await writeJson(paths.risposteAI, archivio);
  });
}

export async function rispostaAI(a: Assistente): Promise<RispostaAI | null> {
  lettura ??= readJson<Archivio>(paths.risposteAI, {}).catch(() => ({}));
  archivio ??= await lettura;
  const salvata = archivio[a]?.richiesta === richiesta(a) ? archivio[a] : undefined;
  if (salvata && Date.now() - Date.parse(salvata.aggiornato) < DURATA) return salvata;
  const chiave = CHIAMATE[a].chiave();
  if (!chiave || Date.now() < (tentativi.get(a) ?? 0)) return salvata ?? null;
  let corsa = aggiornamenti.get(a);
  if (!corsa) {
    corsa = chiedi(a, chiave)
      .catch((e) => {
        tentativi.set(a, Date.now() + RIPROVA);
        console.error(`Risposta di ${a}:`, (e as Error).message);
      })
      .finally(() => aggiornamenti.delete(a));
    aggiornamenti.set(a, corsa);
  }
  await corsa;
  const nuova = archivio[a];
  return nuova?.richiesta === richiesta(a) ? nuova : null;
}

function riga(testo: string) {
  return escapeHtml(testo)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(
      /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g,
      (_, etichetta: string, url: string) =>
        `<a href="${url}" target="_blank" rel="noopener">${etichetta}<span class="sr-only"> (si apre in una nuova scheda)</span></a>`,
    );
}

export function formattaRisposta(testo: string): string {
  const html: string[] = [];
  let paragrafo: string[] = [];
  let lista: 'ul' | 'ol' | null = null;
  const chiudi = () => {
    if (paragrafo.length) html.push(`<p>${paragrafo.join('<br>')}</p>`);
    if (lista) html.push(`</${lista}>`);
    paragrafo = [];
    lista = null;
  };
  for (const r of testo.split('\n')) {
    const t = r.trim();
    if (!t || /^([-*_])\1{2,}$/.test(t)) {
      chiudi();
      continue;
    }
    const titolo = t.match(/^#{1,6}\s+(.+)$/);
    if (titolo) {
      chiudi();
      html.push(`<h2>${riga(titolo[1].replace(/\*\*/g, ''))}</h2>`);
      continue;
    }
    const voce = t.match(/^(?:([-*•])|\d+[.)])\s+(.+)$/);
    if (voce) {
      const tipo = voce[1] ? 'ul' : 'ol';
      if (paragrafo.length || lista !== tipo) {
        chiudi();
        html.push(`<${tipo}>`);
        lista = tipo;
      }
      html.push(`<li>${riga(voce[2])}</li>`);
      continue;
    }
    if (lista) chiudi();
    paragrafo.push(riga(t));
  }
  chiudi();
  return html.join('');
}
