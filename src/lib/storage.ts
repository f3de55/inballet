/**
 * Storage su filesystem per i dati runtime (eventi, tipi evento, analytics,
 * conversazioni del chatbot, immagini caricate) nella cartella DATA_DIR.
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from 'astro:env/server';

const dataDir = path.resolve(DATA_DIR);

export const paths = {
  data: dataDir,
  eventi: path.join(dataDir, 'eventi.json'),
  tipi: path.join(dataDir, 'tipi_evento.json'),
  analytics: path.join(dataDir, 'analytics.json'),
  conversazioni: path.join(dataDir, 'conversazioni'),
  immaginiEventi: path.join(dataDir, 'uploads', 'eventi'),
  documenti: path.join(dataDir, 'documenti.json'),
  fileDocumenti: path.join(dataDir, 'uploads', 'documenti'),
  insegnanti: path.join(dataDir, 'insegnanti.json'),
  fotoInsegnanti: path.join(dataDir, 'uploads', 'insegnanti'),
};

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/** Legge un file JSON; restituisce `fallback` se manca o non è valido. */
export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return (JSON.parse(await readFile(file, 'utf8')) ?? fallback) as T;
  } catch {
    return fallback;
  }
}

/** Scrittura atomica: file temporaneo + rename. */
export async function writeJson(file: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 4));
  await rename(tmp, file);
}

let queue: Promise<unknown> = Promise.resolve();

/**
 * Esegue le operazioni lettura→modifica→scrittura una alla volta, così due
 * richieste contemporanee non si sovrascrivono a vicenda.
 */
export function serialized<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}
