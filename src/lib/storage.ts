import { randomBytes } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
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
  google: path.join(dataDir, 'google.json'),
  ricercaGoogle: path.join(dataDir, 'ricerca-google.json'),
  paginaGoogle: path.join(dataDir, 'ricerca-google.html'),
};

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  let testo: string;
  try {
    testo = await readFile(file, 'utf8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
    throw e;
  }
  try {
    return (JSON.parse(testo) ?? fallback) as T;
  } catch {
    console.error(`File dati illeggibile, messo da parte: ${file}.illeggibile`);
    await rename(file, `${file}.illeggibile`).catch(() => {});
    return fallback;
  }
}

export async function writeJson(file: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(file));
  const tmp = `${file}.${randomBytes(6).toString('hex')}.tmp`;
  try {
    await writeFile(tmp, JSON.stringify(data, null, 4));
    await rename(tmp, file);
  } catch (e) {
    await unlink(tmp).catch(() => {});
    throw e;
  }
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
  const conPeso = { ...tutti, 'Content-Length': String(st.size) };
  if (request.method === 'HEAD') return new Response(null, { headers: conPeso });
  return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream, { headers: conPeso });
}

export const nonTrovato = () => new Response('Not found', { status: 404 });
