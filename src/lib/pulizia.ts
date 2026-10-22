/**
 * Eliminazione totale dalla dashboard: tutti gli eventi con le locandine e/o
 * tutti i dati del chatbot (registro e conversazioni). Irreversibile.
 * I tipi di evento restano: sono impostazioni, non dati.
 */
import { readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import type { LogEntry } from './chatbot';
import { eliminaTutteConversazioni } from './chatbot/conversazioni';
import { leggiEventi } from './eventi';
import { paths, readJson, serialized, writeJson } from './storage';

/** Parola da scrivere per confermare (controllata anche dal server). */
export const PAROLA_CONFERMA = 'ELIMINA';

export interface Totali {
  eventi: number;
  locandine: number;
  messaggi: number;
}

const fileLocandine = () => readdir(paths.immaginiEventi).catch(() => [] as string[]);

export async function totali(): Promise<Totali> {
  const [eventi, locandine, messaggi] = await Promise.all([
    leggiEventi(),
    fileLocandine(),
    readJson<LogEntry[]>(paths.analytics, []),
  ]);
  return { eventi: eventi.length, locandine: locandine.length, messaggi: messaggi.length };
}

export async function eliminaTutto(scelta: { eventi: boolean; chatbot: boolean }): Promise<Totali> {
  const prima = await totali();
  await serialized(async () => {
    if (scelta.eventi) {
      await writeJson(paths.eventi, []);
      const files = await fileLocandine();
      await Promise.all(files.map((f) => unlink(path.join(paths.immaginiEventi, f)).catch(() => {})));
    }
    if (scelta.chatbot) {
      await writeJson(paths.analytics, []);
      await eliminaTutteConversazioni();
    }
  });
  return {
    eventi: scelta.eventi ? prima.eventi : 0,
    locandine: scelta.eventi ? prima.locandine : 0,
    messaggi: scelta.chatbot ? prima.messaggi : 0,
  };
}
