import { createHash } from 'node:crypto';
import { CHATBOT_IP_HEADER } from 'astro:env/server';
import { mbSlice } from '../text';
import { scuola } from '../../data/scuola';

const MAX_LUNGHEZZA = 500;

export function ipVisitatore(headers: Headers, clientAddress: string): string {
  const valore = CHATBOT_IP_HEADER ? headers.get(CHATBOT_IP_HEADER) : null;
  return valore?.split(',').at(-1)?.trim() || clientAddress;
}

export const hashIP = (ip: string) => createHash('sha256').update(`${ip}inballet_salt_2024`).digest('hex');

export function sanitizza(input: string): string {
  return mbSlice(
    input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/[ \t]+/g, ' ')
      .trim(),
    MAX_LUNGHEZZA,
  );
}

const OFFESE = [
  'cazz[oi]',
  'merd[ae]',
  'stronz[oaie]',
  '(?:vaf)?fanculo',
  'coglion[ei]',
  'puttan[ae]',
  'troi[ae]',
  'zoccol[ae]',
  'mignott[ae]',
  'bastard[oaie]',
  'negr[oaie]',
  'froci[o]?',
  'ritardat[oaie]',
  'mongoloid[ei]',
  'minchia',
  'fuck(?:ing)?',
  'shit',
  'bitch',
  'asshole',
  'porc[oa] (?:dio|madonna|puttana)',
  'dio (?:cane|porco|maiale)',
];
const OFFESE_RE = new RegExp(`(?<![\\p{L}\\p{N}])(?:${OFFESE.join('|')})(?![\\p{L}\\p{N}])`, 'iu');

export function controllaContenuto(msg: string): string | null {
  if (OFFESE_RE.test(msg)) return 'Preferisco una conversazione rispettosa 🩰 Come posso aiutarti con la scuola?';
  if ((msg.match(/https?:\/\//gi) ?? []).length > 2 || /(.)\1{9,}/u.test(msg)) return 'Messaggio non valido. Scrivi una domanda sulla scuola.';
  return null;
}

const LIMITI = {
  intervallo: 1,
  minuto: 6,
  ora: 30,
  giorno: 100,
  abuso: 60,
};

interface Visitatore {
  accettati: number[];
  tentativi: number[];
  bloccatoFino: number;
}

const visitatori = new Map<string, Visitatore>();

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

export function pulisciLimiti() {
  const now = Date.now() / 1000;
  for (const [k, v] of visitatori) if (v.bloccatoFino < now && !v.accettati.some((t) => now - t < 86400)) visitatori.delete(k);
}
