import { randomUUID } from 'node:crypto';
import { readdir, rm, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { paths, readJson, serialized, writeJson } from '../storage';
import { romeIso } from '../time';
import type { LogEntry } from './registro';

export const GIORNI_CONSERVAZIONE = 30;
export const MAX_SCAMBI = 20;
export const MEMORIA = 6;

interface ScambioSalvato {
  ora: string;
  domanda: string;
  risposta: string;
  tipo: LogEntry['type'];
  fornitore?: string;
  modello?: string;
}

interface Conversazione {
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

export async function ultimeConversazioni(limite = 30): Promise<Conversazione[]> {
  const nomi = (await readdir(paths.conversazioni).catch(() => [] as string[])).filter((n) => n.endsWith('.json'));
  const conMtime = await Promise.all(
    nomi.map(async (n) => ({
      n,
      t: await stat(path.join(paths.conversazioni, n)).then(
        (s) => s.mtimeMs,
        () => 0,
      ),
    })),
  );
  const recenti = conMtime.sort((a, b) => b.t - a.t).slice(0, limite);
  const conv = await Promise.all(recenti.map(({ n }) => readJson<Conversazione | null>(path.join(paths.conversazioni, n), null)));
  return conv.filter((c): c is Conversazione => !!c?.scambi?.length);
}

export async function eliminaConversazioniVecchie(giorni = GIORNI_CONSERVAZIONE): Promise<number> {
  const limite = Date.now() - giorni * 86400000;
  const nomi = await readdir(paths.conversazioni).catch(() => [] as string[]);
  const eliminate = await Promise.all(
    nomi.map(async (n) => {
      const p = path.join(paths.conversazioni, n);
      const s = await stat(p).catch(() => null);
      return (
        !!s &&
        s.mtimeMs < limite &&
        (await unlink(p).then(
          () => true,
          () => false,
        ))
      );
    }),
  );
  return eliminate.filter(Boolean).length;
}

export async function eliminaTutteConversazioni(): Promise<void> {
  await rm(paths.conversazioni, { recursive: true, force: true });
}
