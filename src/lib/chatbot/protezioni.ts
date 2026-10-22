/**
 * Protezioni prima di chiamare il modello: pulizia dell'input, filtro di
 * insulti e spam, limiti di richieste per visitatore. L'IP non viene mai
 * salvato: si usa solo la sua impronta (hash).
 */
import { createHash } from 'node:crypto';
import { CHATBOT_IP_HEADER } from 'astro:env/server';
import { mbSlice } from '../text';
import { scuola } from '../../data/scuola';

export const MAX_LUNGHEZZA = 500;

// === IP ===

/**
 * IP del visitatore. Dietro un proxy che lo passa in un header (Cloudflare:
 * "cf-connecting-ip") va indicato in CHATBOT_IP_HEADER; senza, l'header non
 * viene letto, perché chiunque potrebbe falsificarlo per aggirare i limiti.
 */
export function ipVisitatore(headers: Headers, clientAddress: string): string {
  const valore = CHATBOT_IP_HEADER ? headers.get(CHATBOT_IP_HEADER) : null;
  // X-Forwarded-For: l'ultimo indirizzo è quello aggiunto dal proxy, gli altri li manda il browser
  return valore?.split(',').at(-1)?.trim() || clientAddress;
}

export const hashIP = (ip: string) => createHash('sha256').update(`${ip}inballet_salt_2024`).digest('hex');

// === CONTENUTO ===

export function sanitizza(input: string): string {
  // Niente caratteri di controllo, spazi ripetuti compressi, lunghezza massima
  return mbSlice(input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').replace(/[ \t]+/g, ' ').trim(), MAX_LUNGHEZZA);
}

// Solo insulti e bestemmie inequivocabili, a parola intera: "dio", "cane" o
// "stupido" da soli compaiono in domande normali e passano.
const OFFESE = [
  'cazz[oi]', 'merd[ae]', 'stronz[oaie]', '(?:vaf)?fanculo', 'coglion[ei]', 'puttan[ae]', 'troi[ae]', 'zoccol[ae]',
  'mignott[ae]', 'bastard[oaie]', 'negr[oaie]', 'froci[o]?', 'ritardat[oaie]', 'mongoloid[ei]', 'minchia',
  'fuck(?:ing)?', 'shit', 'bitch', 'asshole', 'porc[oa] (?:dio|madonna|puttana)', 'dio (?:cane|porco|maiale)',
];
const OFFESE_RE = new RegExp(`(?<![\\p{L}\\p{N}])(?:${OFFESE.join('|')})(?![\\p{L}\\p{N}])`, 'iu');

/** Risposta di cortesia se il messaggio va scartato, altrimenti null. */
export function controllaContenuto(msg: string): string | null {
  if (OFFESE_RE.test(msg)) return 'Preferisco una conversazione rispettosa 🩰 Come posso aiutarti con la scuola?';
  if ((msg.match(/https?:\/\//gi) ?? []).length > 2 || /(.)\1{9,}/u.test(msg)) return 'Messaggio non valido. Scrivi una domanda sulla scuola.';
  return null;
}

// === LIMITI DI RICHIESTE ===

const LIMITI = {
  intervallo: 1, // secondi minimi tra due messaggi (il browser aspetta già la risposta prima di inviare)
  minuto: 6,
  ora: 30,
  giorno: 100,
  /** Oltre questo numero in un'ora: blocco per un'ora */
  abuso: 60,
};

interface Visitatore {
  /** Messaggi accettati nelle ultime 24 ore */
  accettati: number[];
  /** Tutti i tentativi dell'ultima ora, anche quelli respinti (per riconoscere gli abusi) */
  tentativi: number[];
  bloccatoFino: number;
}

/** In memoria: il sito gira su un solo processo, niente file né corse tra richieste. */
const visitatori = new Map<string, Visitatore>();

/** Messaggio da mostrare se il visitatore ha superato un limite, altrimenti null (e conta la richiesta). */
export function controllaLimiti(ipHash: string): string | null {
  const now = Date.now() / 1000;
  const v = visitatori.get(ipHash) ?? { accettati: [], tentativi: [], bloccatoFino: 0 };
  visitatori.set(ipHash, v);
  if (v.bloccatoFino > now) return `Troppe richieste. Riprova tra ${Math.ceil((v.bloccatoFino - now) / 60)} minuti. ⏳`;

  v.tentativi = [...v.tentativi.filter((t) => now - t < 3600), now];
  if (v.tentativi.length >= LIMITI.abuso) {
    v.bloccatoFino = now + 3600;
    return 'Limite superato: riprova tra un’ora. 🚫';
  }
  v.accettati = v.accettati.filter((t) => now - t < 86400);
  const inUltimi = (s: number) => v.accettati.filter((t) => now - t < s).length;
  if (now - (v.accettati.at(-1) ?? 0) < LIMITI.intervallo) return 'Aspetta qualche secondo tra un messaggio e l’altro. ⏳';
  if (inUltimi(60) >= LIMITI.minuto) return 'Stai scrivendo molto velocemente: riprova tra un minuto. ⏳';
  if (inUltimi(3600) >= LIMITI.ora) return `Hai raggiunto il limite di ${LIMITI.ora} messaggi all’ora. Riprova più tardi! ⏰`;
  if (v.accettati.length >= LIMITI.giorno) return `Hai raggiunto il limite di messaggi per oggi. Per altre domande chiamaci al ${scuola.telefono}.`;

  v.accettati.push(now);
  return null;
}

/** Toglie dalla memoria i visitatori inattivi da un giorno (chiamata dalla manutenzione). */
export function pulisciLimiti() {
  const now = Date.now() / 1000;
  for (const [k, v] of visitatori) if (v.bloccatoFino < now && !v.accettati.some((t) => now - t < 86400)) visitatori.delete(k);
}
