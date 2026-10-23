/**
 * Memoria delle conversazioni: un file per chat in data/conversazioni/<id>.json.
 * La cronologia sta sul server (il browser conserva solo l'ID), così nessuno
 * può inventarsi risposte del bot per manipolarlo. Le conversazioni più
 * vecchie di GIORNI_CONSERVAZIONE vengono cancellate (manutenzione in index.ts).
 */
import { randomUUID } from 'node:crypto';
import { readdir, rm, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { paths, readJson, serialized, writeJson } from '../storage';
import { romeIso } from '../time';
import type { LogEntry } from './registro';

export const GIORNI_CONSERVAZIONE = 30;
/** Domande per conversazione: oltre si chiede di ricominciare (limita costi e abusi) */
export const MAX_SCAMBI = 20;
/** Scambi precedenti passati al modello come memoria */
export const MEMORIA = 6;

export interface ScambioSalvato {
  ora: string;
  domanda: string;
  /** Testo grezzo della risposta (senza HTML) */
  risposta: string;
  tipo: LogEntry['type'];
  fornitore?: string;
  modello?: string;
}

export interface Conversazione {
  id: string;
  creata: string;
  aggiornata: string;
  ip_hash: string;
  scambi: ScambioSalvato[];
}

const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const file = (id: string) => path.join(paths.conversazioni, `${id}.json`);

export const nuovoId = () => randomUUID();
export const idValido = (id: unknown): id is string => typeof id === 'string' && ID_RE.test(id);

export async function leggiConversazione(id: unknown): Promise<Conversazione | null> {
  return idValido(id) ? readJson<Conversazione | null>(file(id), null) : null;
}

export function aggiungiScambio(id: string, ipHash: string, scambio: Omit<ScambioSalvato, 'ora'>): Promise<void> {
  return serialized(async () => {
    const ora = romeIso();
    const conv = (await readJson<Conversazione | null>(file(id), null)) ?? { id, creata: ora, aggiornata: ora, ip_hash: ipHash.slice(0, 8), scambi: [] };
    conv.scambi.push({ ora, ...scambio });
    conv.aggiornata = ora;
    await writeJson(file(id), conv);
  });
}

/** Le conversazioni aggiornate più di recente, per la dashboard. */
export async function ultimeConversazioni(limite = 30): Promise<Conversazione[]> {
  const nomi = (await readdir(paths.conversazioni).catch(() => [] as string[])).filter((n) => n.endsWith('.json'));
  const conMtime = await Promise.all(
    nomi.map(async (n) => ({ n, t: await stat(path.join(paths.conversazioni, n)).then((s) => s.mtimeMs, () => 0) })),
  );
  const recenti = conMtime.sort((a, b) => b.t - a.t).slice(0, limite);
  const conv = await Promise.all(recenti.map(({ n }) => readJson<Conversazione | null>(path.join(paths.conversazioni, n), null)));
  return conv.filter((c): c is Conversazione => !!c?.scambi?.length);
}

/** Cancella le conversazioni non aggiornate da più di `giorni` giorni. */
export async function eliminaConversazioniVecchie(giorni = GIORNI_CONSERVAZIONE): Promise<number> {
  const limite = Date.now() - giorni * 86400000;
  const nomi = await readdir(paths.conversazioni).catch(() => [] as string[]);
  let eliminate = 0;
  for (const n of nomi) {
    const p = path.join(paths.conversazioni, n);
    const vecchia = await stat(p).then((s) => s.mtimeMs < limite, () => false);
    if (vecchia && (await unlink(p).then(() => true, () => false))) eliminate++;
  }
  return eliminate;
}

export async function eliminaTutteConversazioni(): Promise<void> {
  await rm(paths.conversazioni, { recursive: true, force: true });
}
