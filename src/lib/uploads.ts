import { randomBytes } from 'node:crypto';
import { readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { leggiEventi, srcImmagine, togliImmagine } from './eventi';
import { ensureDir, paths } from './storage';
import { romeIso } from './time';

export const PUBLIC_PREFIX = 'assets/images/eventi/';
const MAX_SIZE = 20 * 1024 * 1024;
const LATO = 1600;
const LATO_MINI = 480;
const PESO_MAX = 800 * 1024;

export const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

interface Immagine {
  nome: string;
  path: string;
  mini: string;
}

export function sniffMime(buf: Uint8Array): string | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...buf.subarray(start, end));
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && ascii(1, 4) === 'PNG') return 'image/png';
  if (ascii(0, 4) === 'GIF8') return 'image/gif';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export function safeName(name: string): string | null {
  const base = path.basename(name);
  if (!/^[\w.-]+$/.test(base)) return null;
  const ext = base.split('.').pop()?.toLowerCase() ?? '';
  return ext in MIME ? base : null;
}

export const filePath = (name: string) => path.join(paths.immaginiEventi, name);

export const isMini = (nome: string) => nome.endsWith('.mini.webp');
export const nomeMini = (nome: string) => nome.replace(/\.[^.]+$/, '') + '.mini.webp';

export function originaleDemo(nome: string): string | null {
  const m = /^(demo-\d{4}-\d{2}-\d{2}-[a-f0-9]{6})(?:\.jpg|\.mini\.webp)$/.exec(nome);
  return m ? `${m[1]}.jpg` : null;
}

const sharp = async () => (await import('sharp')).default;

async function ottimizza(buf: Uint8Array, mime: string): Promise<Buffer> {
  const s = await sharp();
  const animata = mime === 'image/gif';
  const img = s(buf, { animated: animata });
  if (!animata) img.rotate();
  return img.resize(LATO, LATO, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
}

export async function creaMini(nome: string): Promise<void> {
  const s = await sharp();
  const buf = await s(filePath(nome)).rotate().resize(LATO_MINI, LATO_MINI, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
  const destinazione = filePath(nomeMini(nome));
  const temporaneo = `${destinazione}.${randomBytes(6).toString('hex')}.tmp`;
  try {
    await writeFile(temporaneo, buf);
    await rename(temporaneo, destinazione);
  } finally {
    await unlink(temporaneo).catch(() => {});
  }
}

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
      } catch {}
    }
  })();
  return preparazione;
}

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
        return {
          nome,
          path: PUBLIC_PREFIX + nome,
          mini: PUBLIC_PREFIX + (mini.has(m) ? m : nome),
          size: st.size,
          data: romeIso(st.mtimeMs),
          mtime: st.mtimeMs,
        };
      }),
  );
  const presenti = new Set(list.map((img) => img.nome));
  for (const evento of await leggiEventi()) {
    if (!evento.demo) continue;
    const nome = originaleDemo(path.basename(evento.immagine));
    if (!nome || presenti.has(nome) || srcImmagine(evento.immagine) !== `/${PUBLIC_PREFIX}${nome}`) continue;
    const data = evento.modificato || evento.creato;
    list.push({ nome, path: PUBLIC_PREFIX + nome, mini: PUBLIC_PREFIX + nomeMini(nome), size: 0, data, mtime: Date.parse(data) || 0 });
    presenti.add(nome);
  }
  return list.sort((a, b) => b.mtime - a.mtime).map(({ mtime: _, ...img }) => img);
}

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

export async function eliminaImmagine(nome: string): Promise<string | null> {
  if (!nome) return 'Nome file non specificato';
  const safe = safeName(nome);
  if (!safe || isMini(safe)) return 'File non trovato';
  try {
    await unlink(filePath(safe));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') return 'Errore durante eliminazione';
  }
  await unlink(filePath(nomeMini(safe))).catch(() => {});
  await togliImmagine(safe);
  return null;
}
