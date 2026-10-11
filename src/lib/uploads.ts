/**
 * Locandine eventi caricate dalla dashboard. Salvate in DATA_DIR/uploads/eventi
 * e servite su /assets/images/eventi/<file> (stesso path della versione PHP,
 * così gli eventi già salvati continuano a funzionare).
 */
import { randomBytes } from 'node:crypto';
import { readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ensureDir, paths } from './storage';
import { romeIso } from './time';

export const PUBLIC_PREFIX = 'assets/images/eventi/';
export const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

export interface Immagine {
  nome: string;
  path: string;
}

/** Tipo MIME reale dai magic bytes (come finfo in PHP), o null. */
function sniffMime(buf: Uint8Array): string | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...buf.subarray(start, end));
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && ascii(1, 4) === 'PNG') return 'image/png';
  if (ascii(0, 4) === 'GIF8') return 'image/gif';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

/** Nome file sicuro (basename, solo estensioni immagine) o null. */
export function safeName(name: string): string | null {
  const base = path.basename(name);
  if (!/^[\w.-]+$/.test(base)) return null;
  const ext = base.split('.').pop()?.toLowerCase() ?? '';
  return ext in MIME ? base : null;
}

export const filePath = (name: string) => path.join(paths.immaginiEventi, name);

/** Immagini caricate, dalla più recente. */
export async function elencaImmagini(): Promise<(Immagine & { size: number; data: string })[]> {
  await ensureDir(paths.immaginiEventi);
  const files = (await readdir(paths.immaginiEventi)).filter((f) => safeName(f));
  const list = await Promise.all(
    files.map(async (nome) => {
      const st = await stat(filePath(nome));
      return { nome, path: PUBLIC_PREFIX + nome, size: st.size, data: romeIso(st.mtimeMs), mtime: st.mtimeMs };
    }),
  );
  return list.sort((a, b) => b.mtime - a.mtime).map(({ mtime: _, ...img }) => img);
}

/** Salva i file validi; restituisce immagini salvate ed errori per file. */
export async function caricaImmagini(files: File[]): Promise<{ immagini: Immagine[]; errori: string[] }> {
  await ensureDir(paths.immaginiEventi);
  const immagini: Immagine[] = [];
  const errori: string[] = [];

  for (const file of files) {
    if (file.size > MAX_SIZE) {
      errori.push(`${file.name}: troppo grande (max 20MB)`);
      continue;
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    const mime = sniffMime(buf);
    if (!mime) {
      errori.push(`${file.name}: tipo non supportato`);
      continue;
    }
    // Estensione dal nome originale se coerente, altrimenti dal tipo reale
    const extOrig = file.name.split('.').pop()?.toLowerCase() ?? '';
    const ext = MIME[extOrig] === mime ? extOrig : Object.keys(MIME).find((k) => MIME[k] === mime)!;
    const nome = `evt_${randomBytes(6).toString('hex')}.${ext}`;
    try {
      await writeFile(filePath(nome), buf);
      immagini.push({ nome, path: PUBLIC_PREFIX + nome });
    } catch {
      errori.push(`${file.name}: errore salvataggio`);
    }
  }
  return { immagini, errori };
}

/** Elimina un'immagine. Restituisce un messaggio d'errore o null. */
export async function eliminaImmagine(nome: string): Promise<string | null> {
  if (!nome) return 'Nome file non specificato';
  const safe = safeName(nome);
  if (!safe) return 'File non trovato';
  try {
    await unlink(filePath(safe));
    return null;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === 'ENOENT' ? 'File non trovato' : 'Errore durante eliminazione';
  }
}
