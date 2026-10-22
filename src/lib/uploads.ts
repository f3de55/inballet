/**
 * Locandine eventi caricate dalla dashboard. Salvate in DATA_DIR/uploads/eventi
 * e servite su /assets/images/eventi/<file> (stesso path della versione PHP,
 * così gli eventi già salvati continuano a funzionare).
 *
 * All'upload ogni immagine è ridotta (lato lungo 1600px) e convertita in WebP:
 * una foto da 20MB diventa qualche centinaio di KB. Accanto c'è una miniatura
 * `<nome>.mini.webp` per la libreria della dashboard.
 */
import { randomBytes } from 'node:crypto';
import { readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { togliImmagine } from './eventi';
import { ensureDir, paths } from './storage';
import { romeIso } from './time';

export const PUBLIC_PREFIX = 'assets/images/eventi/';
export const MAX_SIZE = 20 * 1024 * 1024; // 20MB
/** Lato lungo della locandina pubblicata e della miniatura */
const LATO = 1600;
const LATO_MINI = 480;
/** Locandine già salvate più grandi di così vengono ridotte (stesso nome e formato) */
const PESO_MAX = 800 * 1024;

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
  /** Miniatura per la libreria della dashboard */
  mini: string;
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

export const isMini = (nome: string) => nome.endsWith('.mini.webp');
export const nomeMini = (nome: string) => nome.replace(/\.[^.]+$/, '') + '.mini.webp';

const sharp = async () => (await import('sharp')).default;

/** Locandina pubblicata: orientamento corretto, lato lungo 1600px, WebP (GIF animate comprese). */
async function ottimizza(buf: Uint8Array, mime: string): Promise<Buffer> {
  const s = await sharp();
  const animata = mime === 'image/gif';
  const img = s(buf, { animated: animata });
  if (!animata) img.rotate();
  return img.resize(LATO, LATO, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
}

async function creaMini(nome: string): Promise<void> {
  const s = await sharp();
  const buf = await s(filePath(nome)).rotate().resize(LATO_MINI, LATO_MINI, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
  await writeFile(filePath(nomeMini(nome)), buf);
}

/**
 * Locandine salvate prima dell'ottimizzazione: crea le miniature mancanti e
 * riduce i file troppo pesanti mantenendo nome e formato (gli eventi non cambiano).
 * Una volta per avvio del server, alla prima apertura della libreria.
 */
let preparazione: Promise<void> | null = null;
function preparaEsistenti(files: string[]): Promise<void> {
  preparazione ??= (async () => {
    const s = await sharp();
    const presenti = new Set(files);
    for (const nome of files.filter((f) => !isMini(f))) {
      try {
        const file = filePath(nome);
        const meta = await s(file).metadata();
        const grande = (await stat(file)).size > PESO_MAX || Math.max(meta.width ?? 0, meta.height ?? 0) > LATO;
        if (grande && meta.format !== 'gif') {
          const formato = meta.format as 'jpeg' | 'png' | 'webp';
          const ridotta = await s(file)
            .rotate()
            .resize(LATO, LATO, { fit: 'inside', withoutEnlargement: true })
            .toFormat(formato, formato === 'png' ? { compressionLevel: 9 } : { quality: 82, ...(formato === 'jpeg' && { mozjpeg: true }) })
            .toBuffer();
          await writeFile(file, ridotta);
        }
        if (!presenti.has(nomeMini(nome))) await creaMini(nome);
      } catch {
        // File illeggibile: resta com'è, la libreria mostra l'originale
      }
    }
  })();
  return preparazione;
}

/** Immagini caricate, dalla più recente. */
export async function elencaImmagini(): Promise<(Immagine & { size: number; data: string })[]> {
  await ensureDir(paths.immaginiEventi);
  let files = (await readdir(paths.immaginiEventi)).filter((f) => safeName(f));
  await preparaEsistenti(files);
  files = (await readdir(paths.immaginiEventi)).filter((f) => safeName(f));
  const mini = new Set(files.filter(isMini));
  const list = await Promise.all(
    files
      .filter((f) => !isMini(f))
      .map(async (nome) => {
        const st = await stat(filePath(nome));
        const m = nomeMini(nome);
        return { nome, path: PUBLIC_PREFIX + nome, mini: PUBLIC_PREFIX + (mini.has(m) ? m : nome), size: st.size, data: romeIso(st.mtimeMs), mtime: st.mtimeMs };
      }),
  );
  return list.sort((a, b) => b.mtime - a.mtime).map(({ mtime: _, ...img }) => img);
}

/** Salva i file validi (ottimizzati); restituisce immagini salvate ed errori per file. */
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
    const nome = `evt_${randomBytes(6).toString('hex')}.webp`;
    try {
      await writeFile(filePath(nome), await ottimizza(buf, mime));
      await creaMini(nome);
      immagini.push({ nome, path: PUBLIC_PREFIX + nome, mini: PUBLIC_PREFIX + nomeMini(nome) });
    } catch {
      errori.push(`${file.name}: immagine danneggiata o non leggibile`);
    }
  }
  return { immagini, errori };
}

/** Elimina un'immagine (e la miniatura) e la toglie dagli eventi che la usavano. Restituisce un messaggio d'errore o null. */
export async function eliminaImmagine(nome: string): Promise<string | null> {
  if (!nome) return 'Nome file non specificato';
  const safe = safeName(nome);
  if (!safe || isMini(safe)) return 'File non trovato';
  try {
    await unlink(filePath(safe));
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === 'ENOENT' ? 'File non trovato' : 'Errore durante eliminazione';
  }
  await unlink(filePath(nomeMini(safe))).catch(() => {});
  await togliImmagine(safe);
  return null;
}
