/**
 * Verifica di qualità dalla dashboard: le domande di src/data/chatbot.ts
 * vengono poste a un singolo fornitore della catena e la risposta è
 * controllata contro i fatti attesi. Serve a sapere che anche i fornitori
 * di riserva rispondono giusto, non solo il primo.
 */
import { VERIFICHE } from '../../data/chatbot';
import { sistema } from './conoscenza';
import { chiediAlModello, type Anello } from './fornitori';
import { calcolaCosto } from './registro';

export interface EsitoVerifica {
  ok: boolean;
  risposta: string;
  /** Cosa manca o non doveva esserci */
  problemi: string[];
  ms?: number;
  costo?: number;
}

/** Per confrontare ignorando maiuscole, accenti, spazi e punteggiatura dei numeri di telefono. */
const piatto = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[\s.\-()+]/g, '');

export async function verifica(anello: Anello, indice: number, origine: string): Promise<EsitoVerifica> {
  const v = VERIFICHE[indice];
  if (!v) throw new Error('Domanda di verifica inesistente');
  const esito = await chiediAlModello({ sistema: await sistema(origine), storia: v.prima ? [v.prima] : [], domanda: v.domanda }, anello);
  if (!esito.ok) return { ok: false, risposta: '', problemi: [esito.tentativi[0]?.errore ?? 'fornitore non configurato'] };

  const testo = piatto(esito.testo);
  const problemi = [
    ...(v.contiene ?? []).filter((atteso) => !atteso.split('|').some((alt) => testo.includes(piatto(alt)))).map((a) => `manca "${a.replace(/\|/g, '" o "')}"`),
    ...(v.escluso ?? []).filter((vietato) => testo.includes(piatto(vietato))).map((x) => `contiene "${x}"`),
  ];
  return { ok: !problemi.length, risposta: esito.testo, problemi, ms: esito.ms, costo: calcolaCosto(esito.fornitore, esito.modello, esito.token) };
}
