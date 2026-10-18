/**
 * InBallet AI Chatbot - ÉTOILE
 * Validazione input, filtri contenuto, rate limiting per IP, cache risposte,
 * logging analytics (letto dalla dashboard) e chiamata al modello Groq.
 */
import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GROQ_API_KEY, GROQ_MODEL } from 'astro:env/server';
import { ensureDir, paths, readJson, serialized, writeJson } from './storage';
import { mbLen, mbSlice, stripTags } from './text';
import { romeDate, romeHour, romeIso } from './time';
import { FONDAZIONE, iscrizioni, orari, scuola, sedi } from '../data/scuola';

const CONFIG = {
  cacheTime: 7200,
  rateLimitHour: 30,
  rateLimitDay: 100,
  minInterval: 2,
  maxMsgLength: 500,
};

/** Cambia a ogni avvio/deploy: invalida la cache risposte quando cambia il sito. */
const SITE_VERSION = String(Date.now());

export interface ChatContext {
  ip: string;
  userAgent: string;
  origin: string;
}

// === SICUREZZA ===

function sanitizeInput(input: string): string {
  // Rimuovi null bytes e caratteri di controllo, trim e limita lunghezza
  return mbSlice(input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim(), CONFIG.maxMsgLength);
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

const hashIP = (ip: string) => createHash('sha256').update(ip + 'inballet_salt_2024').digest('hex');

// === RATE LIMITING ===

interface RateData {
  requests: number[];
  last: number;
  blocked_until: number;
}

async function checkRateLimit(ipHash: string): Promise<string | null> {
  const file = path.join(paths.rateLimit, ipHash.slice(0, 16) + '.json');
  const now = Math.floor(Date.now() / 1000);
  const data = await readJson<RateData>(file, { requests: [], last: 0, blocked_until: 0 });

  if (data.blocked_until > now) return `Troppe richieste. Riprova tra ${data.blocked_until - now} secondi. ⏳`;
  if (now - data.last < CONFIG.minInterval) return 'Aspetta qualche secondo tra i messaggi. ⏳';

  data.requests = data.requests.filter((t) => now - t < 86400);
  const lastHour = data.requests.filter((t) => now - t < 3600).length;

  // Blocco progressivo per abuso
  if (lastHour >= CONFIG.rateLimitHour * 2) {
    data.blocked_until = now + 3600;
    await writeJson(file, data);
    return 'Limite superato. Bloccato per 1 ora. 🚫';
  }
  if (lastHour >= CONFIG.rateLimitHour) return `Limite orario raggiunto (${CONFIG.rateLimitHour}/ora). Riprova tra poco! ⏰`;
  if (data.requests.length >= CONFIG.rateLimitDay) return 'Limite giornaliero raggiunto. Contattaci: +39 393 780 2996';

  data.requests.push(now);
  data.last = now;
  await writeJson(file, data);
  return null;
}

// === FILTRI CONTENUTO ===

const BAD_WORDS = [
  'cazzo', 'merda', 'stronzo', 'vaffanculo', 'idiota', 'coglione', 'puttana', 'minchia',
  'fanculo', 'fuck', 'shit', 'asshole', 'bitch', 'cretino', 'deficiente', 'scemo',
  'stupido', 'porco', 'troia', 'bastardo', 'negro', 'frocio', 'ritardato', 'mongoloide',
  'porca', 'madonna', 'dio', 'cane', 'zoccola', 'mignotta', 'cazzi', 'merde', 'stronzi',
];
// Parole intere: "dio" non deve bloccare "studio", "cane" non "americane"
const BAD_WORDS_RE = new RegExp(`(?<![\\p{L}\\p{N}])(${BAD_WORDS.join('|')})(?![\\p{L}\\p{N}])`, 'iu');

const INJECTION_PATTERNS = [
  /<script/i, /javascript:/i, /on\w+\s*=/i, // XSS
  /\bunion\b.*\bselect\b/i, /;\s*drop\b/i, /--\s*$/m, // SQL
  /\.\.\//, /%2e%2e/i, // Path traversal
  /\$\{/, /\{\{/, // Template injection
];

function isSpamPattern(text: string): boolean {
  if ((text.match(/https?:\/\//gi) ?? []).length > 2) return true; // Troppi link
  if (/(.)\1{10,}/u.test(text)) return true; // Ripetizioni eccessive
  return mbLen(text) > 20 && text === text.toUpperCase(); // Tutto maiuscolo
}

// === LOGGING ANALYTICS ===

export interface LogEntry {
  timestamp: string;
  date: string;
  hour: number;
  ip_hash: string;
  message: string;
  response_preview: string;
  type: 'success' | 'blocked' | 'filtered' | 'cached' | 'error';
  cached: boolean;
  user_agent: string;
  /** Creato dal generatore demo della dashboard */
  demo?: boolean;
}

function logMessage(ipHash: string, userAgent: string, msg: string, response: string, type: LogEntry['type'], cached = false) {
  const now = Date.now();
  const entry: LogEntry = {
    timestamp: romeIso(now),
    date: romeDate(now),
    hour: romeHour(now),
    ip_hash: ipHash.slice(0, 8),
    message: mbSlice(msg, 200),
    response_preview: mbSlice(stripTags(response), 100),
    type,
    cached,
    user_agent: mbSlice(userAgent, 100),
  };
  // Scrittura in coda: non rallenta la risposta e non perde righe concorrenti
  void serialized(async () => {
    const logs = await readJson<LogEntry[]>(paths.analytics, []);
    logs.push(entry);
    await writeJson(paths.analytics, logs.slice(-10000)); // max 10000 entries
  }).catch((e) => console.error('Errore log analytics:', e));
}

// === CACHE ===

const cacheFile = (msg: string) =>
  path.join(paths.chatCache, createHash('sha256').update(msg.trim().toLowerCase() + '_v' + SITE_VERSION).digest('hex').slice(0, 32) + '.txt');

async function cacheGet(msg: string): Promise<string | null> {
  const file = cacheFile(msg);
  try {
    if (Date.now() - (await stat(file)).mtimeMs < CONFIG.cacheTime * 1000) return await readFile(file, 'utf8');
  } catch {}
  return null;
}

async function cacheSet(msg: string, response: string) {
  await ensureDir(paths.chatCache);
  await writeFile(cacheFile(msg), response);
}

// === FORMATTAZIONE OUTPUT ===

function makeLinks(text: string): string {
  return escapeHtml(text)
    // **grassetto** del modello (il testo è già senza HTML)
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
    .replace(/(\+?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{3}[\s-]?\d{4})/g, '<a href="tel:$1" class="cb-link">$1</a>')
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" class="cb-link">$1</a>')
    // Pagine del sito citate come percorso, es. "/documenti"
    .replace(/(^|[\s(])(\/[a-z][a-z0-9-]*)(?=[\s.,;:!?)]|$)/gm, '$1<a href="$2" class="cb-link">$2</a>')
    .replace(/(\r\n|\n\r|\n|\r)/g, '<br />$1');
}

// === CONTENUTI DEL SITO (contesto per il modello) ===

let siteData: string | null = null;

/** Testo della homepage pre-renderizzata (letto una volta e tenuto in memoria). */
async function getSiteData(origin: string): Promise<string> {
  if (siteData !== null) return siteData;
  for (const url of [`http://127.0.0.1:${process.env.PORT ?? 4321}/`, new URL('/', origin).href]) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const html = (await res.text()).replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '');
      const text = stripTags(html).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
      return (siteData = mbSlice(text, 6000));
    } catch {}
  }
  return '';
}

const elencoSedi = sedi.map((s) => `${s.indirizzo} (${s.titolo.toLowerCase()})`).join('\n');
const elencoOrari = orari.map((o) => `${o.etichetta} ${o.apre}-${o.chiude}`).join(', ') + ', Dom chiuso';

const prompt = (site: string, msg: string) => `Sei ÉTOILE (come la prima ballerina di una compagnia), l'assistente virtuale di I.N. BALLET, scuola di danza multidisciplinare a Lainate e Rho (Milano), fondata nel ${FONDAZIONE} da ${scuola.fondatrice}. Rispondi ai visitatori del sito.

CHI È LA SCUOLA (dai testi ufficiali):
- Luogo di vita dedicato alla conoscenza e all'esplorazione dei diversi stili di Danza; accoglie bambini dai 3 anni e ragazzi e adulti di tutte le età, con gruppi di livelli diversi fino ai corsi avanzati e per adulti.
- L'inclusività è centrale: classi multidisciplinari integrate e, dal 2013, il progetto di volontariato NoiConVoi (lezioni il lunedì sera a Lainate).
- Formazione per professionisti dell'ambito educativo e terapeutico; corso biennale per Insegnanti di Danza (specializzazione Modern), titolo riconosciuto da CSEN e CONI con valenza nazionale.
- Sportello psicologico: incontri con la dottoressa psicoterapeuta su richiesta alla Direzione.
- Collaborazioni con le scuole del territorio, spettacoli ed eventi (di norma uno spettacolo annuale in teatro).

ETÀ DI INGRESSO AI CORSI:
- Avviamento alla Danza: dai 3 anni (classe mono-settimanale a numero chiuso); Educazione alla Danza: 4-5 anni
- Modern: dai 6 anni; Danza Contemporanea: dai 10 anni; Contemporanea Adulti: dai 40 anni; Contaminato: dai 16 anni
- Hip-Hop e Breaking: dai 6 anni; Movimento Creativo: dai 18 anni
- Heels, Danza Acrobatica, Contact Improvisation, Yoga, Pilates (anche mono o bi-settimanale) e Lezioni Individuali: per i dettagli rimanda alla pagina del corso o alla segreteria

STILE:
- Cordiale, entusiasta e professionale, dai del "tu"
- Risposte brevi (2-4 frasi), in italiano semplice
- Qualche emoji adatta, senza esagerare: 💃🩰✨📞📍
- Se citi una pagina del sito scrivi il percorso, per esempio /documenti o /contatti

CONTATTI:
Telefono: ${scuola.telefono}
E-mail: ${scuola.email}
Orari: ${elencoOrari}

SEDI:
${elencoSedi}

ISCRIZIONI ${iscrizioni.anno}:
- Modulo e documenti da scaricare nella pagina Documenti del sito (/documenti), da consegnare in segreteria
- Quota associativa annuale ${iscrizioni.quota} euro (include tesseramento CSEN)
- Certificato medico non agonistico obbligatorio dai 6 anni; sotto i 6 anni autocertificazione dei genitori
- Corso pagato in tre rate: ${iscrizioni.rate.map((r) => `entro il ${r.scadenza}`).join(', ')}

REGOLE STRICT:
1. Rispondi SOLO su InBallet
2. OFF-TOPIC → 'Mi occupo solo di InBallet! Posso aiutarti con corsi, sedi, orari o iscrizioni? 💃'
3. Mai inventare info
4. Prezzi/orari specifici → invita a contattare

DATI:
${site}

DOMANDA: ${msg}`;

async function chiediAlModello(text: string): Promise<string | null> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY mancante');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: text }],
      temperature: 0.7,
      max_tokens: 300,
      // Modelli "reasoning" (gpt-oss): ragionamento breve e non restituito
      ...(GROQ_MODEL.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low', include_reasoning: false } : {}),
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? null;
}

/** Risposta (HTML sicuro) del chatbot a un messaggio dell'utente. */
export async function rispondi(message: string, ctx: ChatContext): Promise<string> {
  const ipHash = hashIP(ctx.ip);
  const log = (msg: string, response: string, type: LogEntry['type'], cached = false) =>
    logMessage(ipHash, ctx.userAgent, msg, response, type, cached);

  const msg = sanitizeInput(message);
  if (!msg) return 'Scrivi la tua domanda.';

  if (INJECTION_PATTERNS.some((p) => p.test(msg))) {
    log(msg, 'Injection tentato', 'blocked');
    return 'Richiesta non valida. ❌';
  }
  if (BAD_WORDS_RE.test(msg)) {
    log(msg, 'Contenuto inappropriato', 'filtered');
    return 'Preferisco una conversazione rispettosa 🩰 Come posso aiutarti?';
  }
  if (isSpamPattern(msg)) {
    log(msg, 'Pattern spam', 'filtered');
    return 'Messaggio non valido. Scrivi una domanda sulla scuola.';
  }

  const limite = await checkRateLimit(ipHash);
  if (limite) {
    log(msg, limite, 'blocked');
    return limite;
  }

  const cached = await cacheGet(msg);
  if (cached) {
    log(msg, cached, 'cached', true);
    return makeLinks(cached);
  }

  let answer: string | null;
  try {
    answer = await chiediAlModello(prompt(await getSiteData(ctx.origin), msg));
  } catch (e) {
    log(msg, `API Error: ${(e as Error).message}`, 'error');
    return 'Momentaneamente non disponibile. Contattaci: <a href="tel:+393937802996" class="cb-link">+39 393 780 2996</a>';
  }
  if (!answer) {
    log(msg, 'Risposta vuota da API', 'error');
    return 'Contattaci per info: <a href="mailto:info@inballet.it" class="cb-link">info@inballet.it</a>';
  }

  await cacheSet(msg, answer).catch(() => {});
  log(msg, answer, 'success');
  return makeLinks(answer);
}
