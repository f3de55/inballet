import { conoscenza, contesto } from './conoscenza';
import { aggiungiScambio, eliminaConversazioniVecchie, idValido, leggiConversazione, MAX_SCAMBI, MEMORIA, nuovoId } from './conversazioni';
import { formatta } from './formato';
import { chiediAlModello } from './fornitori';
import { bloccato, controllaContenuto, controllaLimiti, hashIP, pulisciLimiti, sanitizza, tetto } from './protezioni';
import { budgetEsaurito, calcolaCosto, registra } from './registro';
import { scuola } from '../../data/scuola';

export type { LogEntry } from './registro';

interface Messaggio {
  testo: string;
  conversazione?: string;
  ip: string;
  userAgent: string;
  origine: string;
}

interface Risposta {
  html: string;
  conversazione: string;
}

const cache = new Map<string, { testo: string; scade: number }>();
const CACHE_DURATA = 24 * 3600_000;
const CACHE_MAX = 300;
const chiaveCache = (versione: string, msg: string) =>
  `${versione}|${msg
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()}`;

function leggiCache(k: string): string | null {
  const c = cache.get(k);
  return c && c.scade > Date.now() ? c.testo : null;
}

function salvaCache(k: string, testo: string) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
  cache.set(k, { testo, scade: Date.now() + CACHE_DURATA });
}

let manutenzioneAvviata = false;

function avviaManutenzione() {
  if (manutenzioneAvviata) return;
  manutenzioneAvviata = true;
  const esegui = async () => {
    pulisciLimiti();
    for (const [k, c] of cache) if (c.scade < Date.now()) cache.delete(k);
    await eliminaConversazioniVecchie().catch((e) => console.error('Pulizia conversazioni:', e));
  };
  void esegui();
  setInterval(esegui, 6 * 3600_000).unref();
}

export async function prepara(origine: string): Promise<void> {
  avviaManutenzione();
  await conoscenza(origine);
}

const IN_VOLO_MAX = 6;
let inVolo = 0;

type Esito = Awaited<ReturnType<typeof chiediAlModello>>;
const inAttesa = new Map<string, Promise<Esito | string>>();

export async function rispondi({ testo, conversazione, ip, userAgent, origine }: Messaggio): Promise<Risposta> {
  avviaManutenzione();
  const ipHash = hashIP(ip);
  const richiesta = idValido(conversazione) ? conversazione : nuovoId();
  const subito = (risposta: string) => ({ html: formatta(risposta), conversazione: richiesta });

  const msg = sanitizza(testo);
  if (!msg) return subito('Scrivi la tua domanda.');
  if (bloccato(ipHash)) return subito(controllaLimiti(ipHash)!);

  const limite = controllaLimiti(ipHash);
  const scarto = limite ?? controllaContenuto(msg);
  if (scarto) {
    if (tetto.rifiuti()) {
      registra({
        ip_hash: ipHash,
        user_agent: userAgent,
        conversazione: richiesta.slice(0, 8),
        message: msg,
        risposta: scarto,
        type: limite ? 'blocked' : 'filtered',
      });
    }
    return subito(scarto);
  }
  if (!tetto.messaggi()) return subito(`In questo momento ricevo molte richieste: riprova tra qualche minuto, oppure chiamaci al ${scuola.telefono}.`);

  const conv = await leggiConversazione(conversazione);
  const id = conv?.id ?? nuovoId();
  const base = { ip_hash: ipHash, user_agent: userAgent, conversazione: id.slice(0, 8) };
  if ((conv?.scambi.length ?? 0) >= MAX_SCAMBI) {
    const risposta = `Questa conversazione è diventata lunga: tocca ↻ in alto per iniziarne una nuova, oppure chiamaci al ${scuola.telefono}.`;
    registra({ ...base, message: msg, risposta, type: 'blocked' });
    return { html: formatta(risposta), conversazione: id };
  }

  const storia = (conv?.scambi ?? []).slice(-MEMORIA).map((s) => ({ domanda: s.domanda, risposta: s.risposta }));
  const salva = (risposta: string, tipo: 'success' | 'cached', modello?: { fornitore: string; modello: string }) =>
    aggiungiScambio(id, ipHash, { domanda: msg, risposta, tipo, ...modello }).catch((e) => console.error('Salvataggio conversazione:', e));

  const s = await conoscenza(origine);
  const kCache = storia.length ? null : chiaveCache(s.versione, msg);
  const inCache = kCache && leggiCache(kCache);
  if (inCache) {
    registra({ ...base, message: msg, risposta: inCache, type: 'cached' });
    await salva(inCache, 'cached');
    return { html: formatta(inCache), conversazione: id };
  }

  const offline = (errore: string, fallback: number) => {
    const risposta = `In questo momento non riesco a rispondere: riprova tra qualche minuto, oppure chiama la segreteria al ${scuola.telefono}, scrivici su WhatsApp o a ${scuola.email}.`;
    registra({ ...base, message: msg, risposta, type: 'offline', errore, fallback });
    return { html: formatta(risposta), conversazione: id };
  };

  const chiedi = async (): Promise<Esito | string> => {
    if (await budgetEsaurito()) return 'tetto di spesa giornaliero raggiunto';
    if (inVolo >= IN_VOLO_MAX || !tetto.modello()) return 'tetto di richieste al modello raggiunto';
    inVolo++;
    return chiediAlModello({ sistema: s, storia, domanda: msg, contesto: contesto(s, msg, storia) }).finally(() => inVolo--);
  };
  const condivisa = kCache ? inAttesa.get(kCache) : undefined;
  const attesa = condivisa ?? chiedi();
  if (kCache && !condivisa) {
    inAttesa.set(kCache, attesa);
    const libera = () => inAttesa.delete(kCache);
    attesa.then(libera, libera);
  }
  const esito = await attesa;
  if (typeof esito === 'string') return offline(esito, 0);
  if (condivisa && esito.ok) {
    registra({ ...base, message: msg, risposta: esito.testo, type: 'cached' });
    await salva(esito.testo, 'cached');
    return { html: formatta(esito.testo), conversazione: id };
  }
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
