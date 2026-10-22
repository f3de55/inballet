/**
 * Étoile, l'assistente virtuale di InBallet. Percorso di ogni messaggio:
 *
 * 1. pulizia del testo, filtro insulti/spam, limiti per visitatore
 * 2. memoria: ultimi scambi della conversazione (conversazioni.ts)
 * 3. cache: la prima domanda di una chat, se già fatta da altri, ha risposta immediata
 * 4. tetto di spesa giornaliero: superato, si risponde dalle FAQ
 * 5. catena di fornitori AI con fallback (fornitori.ts)
 * 6. se nessuno risponde: risposta dalle FAQ, senza AI (offline.ts)
 * 7. registro per la dashboard (registro.ts) e salvataggio dello scambio
 */
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { paths } from '../storage';
import { sistema } from './conoscenza';
import { aggiungiScambio, eliminaConversazioniVecchie, leggiConversazione, MAX_SCAMBI, MEMORIA, nuovoId } from './conversazioni';
import { formatta } from './formato';
import { chiediAlModello } from './fornitori';
import { rispostaOffline } from './offline';
import { controllaContenuto, controllaLimiti, hashIP, pulisciLimiti, sanitizza } from './protezioni';
import { budgetEsaurito, calcolaCosto, registra } from './registro';
import { scuola } from '../../data/scuola';

export type { LogEntry } from './registro';

export interface Messaggio {
  testo: string;
  /** ID della conversazione restituito alla risposta precedente */
  conversazione?: string;
  ip: string;
  userAgent: string;
  /** Indirizzo del sito (da cui il server legge i testi delle pagine) */
  origine: string;
}

export interface Risposta {
  /** HTML sicuro da mostrare nel fumetto */
  html: string;
  conversazione: string;
}

// === CACHE DELLE PRIME DOMANDE ===

/**
 * Le domande suggerite e quelle più comuni arrivano identiche da molte persone.
 * La chiave contiene la versione dei contenuti: se il sito cambia, la risposta vecchia non vale più.
 */
const cache = new Map<string, { testo: string; scade: number }>();
const CACHE_DURATA = 24 * 3600_000;
const CACHE_MAX = 300;
const chiaveCache = (versione: string, msg: string) => `${versione}|${msg.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()}`;

function leggiCache(k: string): string | null {
  const c = cache.get(k);
  return c && c.scade > Date.now() ? c.testo : null;
}

function salvaCache(k: string, testo: string) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
  cache.set(k, { testo, scade: Date.now() + CACHE_DURATA });
}

// === MANUTENZIONE ===

let manutenzioneAvviata = false;

/** Ogni 6 ore: conversazioni scadute, visitatori inattivi, cache scaduta. */
function avviaManutenzione() {
  if (manutenzioneAvviata) return;
  manutenzioneAvviata = true;
  const esegui = async () => {
    pulisciLimiti();
    for (const [k, c] of cache) if (c.scade < Date.now()) cache.delete(k);
    await eliminaConversazioniVecchie().catch((e) => console.error('Pulizia conversazioni:', e));
    // Cartelle della versione precedente del chatbot (cache e limiti su file)
    await Promise.all(['cache', 'ratelimit'].map((d) => rm(path.join(paths.data, d), { recursive: true, force: true }).catch(() => {})));
  };
  void esegui();
  setInterval(esegui, 6 * 3600_000).unref();
}

// === RISPOSTA ===

export async function rispondi({ testo, conversazione, ip, userAgent, origine }: Messaggio): Promise<Risposta> {
  avviaManutenzione();
  const ipHash = hashIP(ip);
  const conv = await leggiConversazione(conversazione);
  const id = conv?.id ?? nuovoId();
  const base = { ip_hash: ipHash, user_agent: userAgent, conversazione: id.slice(0, 8) };

  const msg = sanitizza(testo);
  if (!msg) return { html: 'Scrivi la tua domanda.', conversazione: id };

  // Risposta di servizio: registrata ma non salvata nella conversazione
  const rifiuta = (risposta: string, type: 'filtered' | 'blocked') => {
    registra({ ...base, message: msg, risposta, type });
    return { html: formatta(risposta), conversazione: id };
  };
  const scarto = controllaContenuto(msg);
  if (scarto) return rifiuta(scarto, 'filtered');
  const limite = controllaLimiti(ipHash);
  if (limite) return rifiuta(limite, 'blocked');
  if ((conv?.scambi.length ?? 0) >= MAX_SCAMBI) {
    return rifiuta(`Questa conversazione è diventata lunga: tocca ↻ in alto per iniziarne una nuova, oppure chiamaci al ${scuola.telefono}.`, 'blocked');
  }

  // Memoria: solo gli scambi con una risposta vera (AI, cache o FAQ)
  const storia = (conv?.scambi ?? []).slice(-MEMORIA).map((s) => ({ domanda: s.domanda, risposta: s.risposta }));
  const salva = (risposta: string, tipo: 'success' | 'cached' | 'offline', modello?: { fornitore: string; modello: string }) =>
    aggiungiScambio(id, ipHash, { domanda: msg, risposta, tipo, ...modello }).catch((e) => console.error('Salvataggio conversazione:', e));

  const s = await sistema(origine);
  const kCache = storia.length ? null : chiaveCache(s.versione, msg);
  const inCache = kCache && leggiCache(kCache);
  if (inCache) {
    registra({ ...base, message: msg, risposta: inCache, type: 'cached' });
    await salva(inCache, 'cached');
    return { html: formatta(inCache), conversazione: id };
  }

  const offline = async (errore: string, fallback: number) => {
    const risposta = await rispostaOffline(msg);
    registra({ ...base, message: msg, risposta, type: 'offline', errore, fallback });
    await salva(risposta, 'offline');
    return { html: formatta(risposta), conversazione: id };
  };

  if (await budgetEsaurito()) return offline('tetto di spesa giornaliero raggiunto', 0);

  const esito = await chiediAlModello({ sistema: s, storia, domanda: msg });
  const ultimoErrore = esito.tentativi.at(-1);
  const errore = ultimoErrore && `${ultimoErrore.fornitore}: ${ultimoErrore.errore}`;
  if (!esito.ok) return offline(errore ?? 'nessun fornitore configurato', esito.tentativi.length);

  const { fornitore, modello, token, ms } = esito;
  registra({
    ...base,
    message: msg,
    risposta: esito.testo,
    type: 'success',
    fornitore,
    modello,
    token_in: token.ingresso,
    token_cache: token.cache,
    token_out: token.uscita,
    costo: calcolaCosto(fornitore, modello, token),
    ms,
    fallback: esito.tentativi.length,
    errore,
  });
  if (kCache) salvaCache(kCache, esito.testo);
  await salva(esito.testo, 'success', { fornitore, modello });
  return { html: formatta(esito.testo), conversazione: id };
}
