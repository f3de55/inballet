/**
 * Sezione «Insegnanti» di Chi siamo, modificabile dalla dashboard: testi e schede
 * (nome, disciplina, breve presentazione, foto). I testi stanno in
 * DATA_DIR/insegnanti.json, le foto in DATA_DIR/uploads/insegnanti, servite su
 * /assets/images/insegnanti/<file>. Ogni foto caricata è ritagliata in verticale
 * (4:5, 800x1000) e convertita in WebP.
 */
import { randomBytes } from 'node:crypto';
import { unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { insegnantiPredefiniti, type Insegnante, type SezioneInsegnanti } from '../data/insegnanti';
import { ensureDir, paths, readJson, serialized, writeJson } from './storage';
import { mbLen } from './text';

export type { Insegnante, SezioneInsegnanti };

/** Errore di validazione con messaggio da mostrare all'utente. */
export class ErroreInsegnanti extends Error {}

export const PUBLIC_PREFIX = '/assets/images/insegnanti/';
export const MAX_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_INSEGNANTI = 40;

const LIMITI = {
  eyebrow: 40,
  titolo: 60,
  accento: 40,
  intro: 300,
  nome: 60,
  ruolo: 80,
  bio: 400,
  competenza: 50,
  competenze: 12,
} as const;

/** Contenuti correnti: quelli salvati, con i predefiniti per ciò che manca. */
export async function leggiInsegnanti(): Promise<SezioneInsegnanti> {
  const salvato = await readJson<Partial<SezioneInsegnanti> | null>(paths.insegnanti, null);
  const base = insegnantiPredefiniti;
  return {
    sezione: { ...base.sezione, ...salvato?.sezione },
    insegnanti: (Array.isArray(salvato?.insegnanti) ? salvato.insegnanti : base.insegnanti).map((i) => ({
      ...i,
      competenze: Array.isArray(i.competenze) ? i.competenze : [],
    })),
  };
}

const str = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

function controllaLunghezza(errors: string[], nome: string, valore: string, max: number, obbligatorio = false) {
  if (obbligatorio && !valore) errors.push(`${nome}: campo obbligatorio`);
  else if (mbLen(valore) > max) errors.push(`${nome}: massimo ${max} caratteri`);
}

export type TestiInput = Partial<Record<'eyebrow' | 'titolo' | 'accento' | 'intro', string>>;

/** Valida e salva l'intestazione della sezione. */
export async function salvaTesti(input: TestiInput): Promise<SezioneInsegnanti> {
  const v = { eyebrow: str(input.eyebrow), titolo: str(input.titolo), accento: str(input.accento), intro: str(input.intro) };
  const errors: string[] = [];
  controllaLunghezza(errors, 'Etichetta', v.eyebrow, LIMITI.eyebrow);
  controllaLunghezza(errors, 'Titolo', v.titolo, LIMITI.titolo, true);
  controllaLunghezza(errors, 'Parola in evidenza', v.accento, LIMITI.accento);
  controllaLunghezza(errors, 'Introduzione', v.intro, LIMITI.intro);
  if (errors.length) throw new ErroreInsegnanti(errors.join('. '));

  return serialized(async () => {
    const dati = await leggiInsegnanti();
    dati.sezione = v;
    await writeJson(paths.insegnanti, dati);
    return dati;
  });
}

// === FOTO ===

/** Nome file sicuro per le foto caricate (lo stesso formato che genera `salvaFoto`). */
export function nomeFotoSicuro(name: string): string | null {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/.test(name) ? name : null;
}

export const percorsoFoto = (nome: string) => path.join(paths.fotoInsegnanti, nome);

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');

/** Tipo immagine dai primi byte (JPEG, PNG, WebP), o null. */
function eImmagine(buf: Uint8Array): boolean {
  const ascii = (a: number, b: number) => String.fromCharCode(...buf.subarray(a, b));
  return (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) || (buf[0] === 0x89 && ascii(1, 4) === 'PNG') || (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP');
}

/** Salva la foto: orientamento corretto, ritaglio 4:5 sul soggetto, WebP. */
async function salvaFoto(file: File, nome: string): Promise<string> {
  if (file.size > MAX_SIZE) throw new ErroreInsegnanti('La foto è troppo grande (massimo 20 MB)');
  const buf = new Uint8Array(await file.arrayBuffer());
  if (!eImmagine(buf)) throw new ErroreInsegnanti('La foto deve essere un file JPG, PNG o WebP');
  const sharp = (await import('sharp')).default;
  const out = await sharp(buf).rotate().resize(800, 1000, { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toBuffer();
  const file_ = `${slug(nome) || 'insegnante'}-${randomBytes(3).toString('hex')}.webp`;
  await ensureDir(paths.fotoInsegnanti);
  await writeFile(percorsoFoto(file_), out);
  return PUBLIC_PREFIX + file_;
}

async function rimuoviFoto(foto: string): Promise<void> {
  if (!foto.startsWith(PUBLIC_PREFIX)) return;
  const nome = nomeFotoSicuro(foto.slice(PUBLIC_PREFIX.length));
  if (nome) await unlink(percorsoFoto(nome)).catch(() => {});
}

// === SCHEDE ===

const ID = /^ins_[a-z0-9]+$/;
const nuovoId = () => 'ins_' + randomBytes(6).toString('hex');

export interface InsegnanteInput {
  id?: string;
  nome?: string;
  ruolo?: string;
  bio?: string;
  /** Competenze, una per riga (o separate da virgola o «|») */
  competenze?: string;
  /** Nuova foto (facoltativa) */
  foto?: File;
  /** Togli la foto attuale */
  togliFoto?: boolean;
}

/** Crea o aggiorna un insegnante. Con `foto` sostituisce la foto. */
export async function salvaInsegnante(input: InsegnanteInput): Promise<Insegnante> {
  const id = str(input.id) || null;
  const nome = str(input.nome);
  const ruolo = str(input.ruolo);
  const bio = str(input.bio);
  const foto = input.foto && input.foto.size > 0 ? input.foto : undefined;
  const competenze = [...new Set((input.competenze ?? '').split(/[\n,|]/).map(str).filter(Boolean))];

  const errors: string[] = [];
  if (id && !ID.test(id)) errors.push('ID non valido');
  controllaLunghezza(errors, 'Nome', nome, LIMITI.nome, true);
  controllaLunghezza(errors, 'Disciplina', ruolo, LIMITI.ruolo);
  controllaLunghezza(errors, 'Presentazione', bio, LIMITI.bio);
  if (competenze.length > LIMITI.competenze) errors.push(`Competenze: massimo ${LIMITI.competenze}`);
  const lunga = competenze.find((c) => mbLen(c) > LIMITI.competenza);
  if (lunga) errors.push(`Competenza «${lunga.slice(0, 20)}…»: massimo ${LIMITI.competenza} caratteri`);
  if (errors.length) throw new ErroreInsegnanti(errors.join('. '));

  return serialized(async () => {
    const dati = await leggiInsegnanti();
    const esistente = id ? dati.insegnanti.find((d) => d.id === id) : undefined;
    if (id && !esistente) throw new ErroreInsegnanti('Insegnante non trovato');
    if (!id && dati.insegnanti.length >= MAX_INSEGNANTI) throw new ErroreInsegnanti(`Puoi avere al massimo ${MAX_INSEGNANTI} insegnanti`);

    let percorso = esistente?.foto ?? '';
    if (foto) percorso = await salvaFoto(foto, nome);
    else if (input.togliFoto) percorso = '';
    const insegnante: Insegnante = { id: esistente?.id ?? nuovoId(), nome, ruolo, bio, competenze, foto: percorso, ...(esistente?.demo && { demo: true }) };

    if (esistente) {
      dati.insegnanti = dati.insegnanti.map((d) => (d.id === insegnante.id ? insegnante : d));
      if (esistente.foto && esistente.foto !== percorso) await rimuoviFoto(esistente.foto);
    } else {
      dati.insegnanti.push(insegnante);
    }
    await writeJson(paths.insegnanti, dati);
    return insegnante;
  });
}

export async function eliminaInsegnante(id: string): Promise<void> {
  if (!ID.test(id)) throw new ErroreInsegnanti('ID non valido');
  await serialized(async () => {
    const dati = await leggiInsegnanti();
    const insegnante = dati.insegnanti.find((d) => d.id === id);
    if (!insegnante) throw new ErroreInsegnanti('Insegnante non trovato');
    dati.insegnanti = dati.insegnanti.filter((d) => d.id !== id);
    await writeJson(paths.insegnanti, dati);
    await rimuoviFoto(insegnante.foto);
  });
}

// === DATI DEMO (src/lib/demo.ts) ===

export const nuovoIdInsegnante = nuovoId;

/** Aggiunge in coda insegnanti demo già pronti (foto comprese). */
export async function aggiungiInsegnanti(nuovi: Insegnante[]): Promise<void> {
  await serialized(async () => {
    const dati = await leggiInsegnanti();
    dati.insegnanti.push(...nuovi);
    await writeJson(paths.insegnanti, dati);
  });
}

/** Rimuove gli insegnanti demo e le loro foto; restituisce quanti erano. */
export async function rimuoviInsegnantiDemo(): Promise<number> {
  const demo = await serialized(async () => {
    const dati = await leggiInsegnanti();
    const demo = dati.insegnanti.filter((i) => i.demo);
    dati.insegnanti = dati.insegnanti.filter((i) => !i.demo);
    await writeJson(paths.insegnanti, dati);
    return demo;
  });
  await Promise.all(demo.map((i) => rimuoviFoto(i.foto)));
  return demo.length;
}

/** Riordina: `ids` è il nuovo ordine (devono essere tutti e soli quelli esistenti). */
export async function ordinaInsegnanti(ids: string[]): Promise<void> {
  await serialized(async () => {
    const dati = await leggiInsegnanti();
    const perId = new Map(dati.insegnanti.map((d) => [d.id, d]));
    if (ids.length !== perId.size || new Set(ids).size !== ids.length || ids.some((i) => !perId.has(i))) {
      throw new ErroreInsegnanti('Elenco non aggiornato: ricarica la pagina');
    }
    dati.insegnanti = ids.map((i) => perId.get(i)!);
    await writeJson(paths.insegnanti, dati);
  });
}
