import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
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

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return (JSON.parse(await readFile(file, 'utf8')) ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(file: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 4));
  await rename(tmp, file);
}

let queue: Promise<unknown> = Promise.resolve();

export function serialized<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

export async function serviFile(file: string, request: Request, headers: Record<string, string>): Promise<Response> {
  const st = await stat(file);
  const etag = `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
  const tutti = { ...headers, 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff', ETag: etag };
  if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: tutti });
  return new Response(await readFile(file), { headers: tutti });
}

export const nonTrovato = () => new Response('Not found', { status: 404 });
