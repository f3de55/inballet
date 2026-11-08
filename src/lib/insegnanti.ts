import { randomBytes } from 'node:crypto';
import { unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { insegnantiPredefiniti, type Insegnante, type SezioneInsegnanti } from '../data/insegnanti';
import { ensureDir, paths, readJson, serialized, writeJson } from './storage';
import { sniffMime } from './uploads';
import { controllaLunghezza, mbLen, riga as str, slug } from './text';

export type { SezioneInsegnanti };

export class ErroreInsegnanti extends Error {}

export const PUBLIC_PREFIX = '/assets/images/insegnanti/';
const MAX_SIZE = 20 * 1024 * 1024;
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

type TestiInput = Partial<Record<'eyebrow' | 'titolo' | 'accento' | 'intro', string>>;

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

export function nomeFotoSicuro(name: string): string | null {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/.test(name) ? name : null;
}

export const percorsoFoto = (nome: string) => path.join(paths.fotoInsegnanti, nome);

async function salvaFoto(file: File, nome: string): Promise<string> {
  if (file.size > MAX_SIZE) throw new ErroreInsegnanti('La foto è troppo grande (massimo 20 MB)');
  const buf = new Uint8Array(await file.arrayBuffer());
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(sniffMime(buf) ?? '')) throw new ErroreInsegnanti('La foto deve essere un file JPG, PNG o WebP');
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

const ID = /^ins_[a-z0-9]+$/;
const nuovoId = () => 'ins_' + randomBytes(6).toString('hex');

interface InsegnanteInput {
  id?: string;
  nome?: string;
  ruolo?: string;
  bio?: string;
  competenze?: string;
  foto?: File;
  togliFoto?: boolean;
}

export async function salvaInsegnante(input: InsegnanteInput): Promise<Insegnante> {
  const id = str(input.id) || null;
  const nome = str(input.nome);
  const ruolo = str(input.ruolo);
  const bio = str(input.bio);
  const foto = input.foto && input.foto.size > 0 ? input.foto : undefined;
  const competenze = [
    ...new Set(
      (input.competenze ?? '')
        .split(/[\n,|]/)
        .map(str)
        .filter(Boolean),
    ),
  ];

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

export const nuovoIdInsegnante = nuovoId;

export async function aggiungiInsegnanti(nuovi: Insegnante[]): Promise<void> {
  await serialized(async () => {
    const dati = await leggiInsegnanti();
    dati.insegnanti.push(...nuovi);
    await writeJson(paths.insegnanti, dati);
  });
}

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
