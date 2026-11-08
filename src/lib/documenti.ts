import { randomBytes } from 'node:crypto';
import { unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { documentiPredefiniti, type Documento, type PaginaDocumenti } from '../data/documenti';
import { ensureDir, paths, readJson, serialized, writeJson } from './storage';
import { controllaLunghezza, riga as str, slug } from './text';

export type { Documento };

export class ErroreDocumenti extends Error {}

const PUBLIC_PREFIX = '/assets/documenti/';
const MAX_SIZE = 20 * 1024 * 1024;
const MAX_DOCUMENTI = 20;

const LIMITI = {
  heroTitolo: 80,
  heroTesto: 250,
  eyebrow: 40,
  titolo: 60,
  accento: 40,
  intro: 600,
  docTitolo: 100,
  docNota: 150,
} as const;

export async function leggiDocumenti(): Promise<PaginaDocumenti> {
  const salvato = await readJson<Partial<PaginaDocumenti> | null>(paths.documenti, null);
  const base = documentiPredefiniti;
  return {
    hero: { ...base.hero, ...salvato?.hero },
    sezione: { ...base.sezione, ...salvato?.sezione },
    documenti: Array.isArray(salvato?.documenti) ? salvato.documenti : base.documenti,
  };
}

type TestiInput = Partial<Record<'heroTitolo' | 'heroTesto' | 'eyebrow' | 'titolo' | 'accento' | 'intro', string>>;

export async function salvaTesti(input: TestiInput): Promise<PaginaDocumenti> {
  const v = {
    heroTitolo: str(input.heroTitolo),
    heroTesto: str(input.heroTesto),
    eyebrow: str(input.eyebrow),
    titolo: str(input.titolo),
    accento: str(input.accento),
    intro: str(input.intro),
  };
  const errors: string[] = [];
  controllaLunghezza(errors, 'Titolo della pagina', v.heroTitolo, LIMITI.heroTitolo, true);
  controllaLunghezza(errors, 'Testo sotto il titolo', v.heroTesto, LIMITI.heroTesto);
  controllaLunghezza(errors, 'Etichetta', v.eyebrow, LIMITI.eyebrow);
  controllaLunghezza(errors, 'Titolo della sezione', v.titolo, LIMITI.titolo, true);
  controllaLunghezza(errors, 'Parola in evidenza', v.accento, LIMITI.accento);
  controllaLunghezza(errors, 'Introduzione', v.intro, LIMITI.intro);
  if (errors.length) throw new ErroreDocumenti(errors.join('. '));

  return serialized(async () => {
    const pagina = await leggiDocumenti();
    pagina.hero = { titolo: v.heroTitolo, testo: v.heroTesto };
    pagina.sezione = { eyebrow: v.eyebrow, titolo: v.titolo, accento: v.accento, intro: v.intro };
    await writeJson(paths.documenti, pagina);
    return pagina;
  });
}

export function nomePdfSicuro(name: string): string | null {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*\.pdf$/.test(name) ? name : null;
}

export const percorsoPdf = (nome: string) => path.join(paths.fileDocumenti, nome);

function formattaPeso(bytes: number): string {
  const kb = Math.max(1, Math.round(bytes / 1024));
  return kb >= 1024 ? `PDF, ${(kb / 1024).toFixed(1).replace('.', ',')} MB` : `PDF, ${kb} KB`;
}

async function salvaPdf(file: File): Promise<{ file: string; peso: string }> {
  if (file.size > MAX_SIZE) throw new ErroreDocumenti('Il PDF è troppo grande (massimo 20 MB)');
  const buf = new Uint8Array(await file.arrayBuffer());
  const intestazione = String.fromCharCode(...buf.subarray(0, 5));
  if (intestazione !== '%PDF-') throw new ErroreDocumenti('Il file non è un PDF valido');

  const base = slug(file.name.replace(/\.pdf$/i, '')) || 'documento';
  const nome = `${base}-${randomBytes(3).toString('hex')}.pdf`;
  await ensureDir(paths.fileDocumenti);
  await writeFile(percorsoPdf(nome), buf);
  return { file: PUBLIC_PREFIX + nome, peso: formattaPeso(buf.length) };
}

async function rimuoviPdf(file: string): Promise<void> {
  if (!file.startsWith(PUBLIC_PREFIX)) return;
  const nome = nomePdfSicuro(file.slice(PUBLIC_PREFIX.length));
  if (nome) await unlink(percorsoPdf(nome)).catch(() => {});
}

const ID = /^doc_[a-z0-9]+$/;
const nuovoId = () => 'doc_' + randomBytes(6).toString('hex');

interface DocumentoInput {
  id?: string;
  titolo?: string;
  nota?: string;
  categoria?: 'modulo' | 'statuto';
  file?: File;
}

export async function salvaDocumento(input: DocumentoInput): Promise<Documento> {
  const id = str(input.id) || null;
  const titolo = str(input.titolo);
  const nota = str(input.nota);
  const file = input.file && input.file.size > 0 ? input.file : undefined;

  const errors: string[] = [];
  if (id && !ID.test(id)) errors.push('ID documento non valido');
  controllaLunghezza(errors, 'Titolo', titolo, LIMITI.docTitolo, true);
  controllaLunghezza(errors, 'Descrizione', nota, LIMITI.docNota);
  if (!id && !file) errors.push('Carica il PDF del documento');
  if (errors.length) throw new ErroreDocumenti(errors.join('. '));

  return serialized(async () => {
    const pagina = await leggiDocumenti();
    const esistente = id ? pagina.documenti.find((d) => d.id === id) : undefined;
    if (id && !esistente) throw new ErroreDocumenti('Documento non trovato');
    if (!id && pagina.documenti.length >= MAX_DOCUMENTI) throw new ErroreDocumenti(`Puoi avere al massimo ${MAX_DOCUMENTI} documenti`);
    const categoria = input.categoria ?? esistente?.categoria ?? 'modulo';
    if (categoria === 'statuto' && pagina.documenti.some((d) => d.categoria === 'statuto' && d.id !== id)) {
      throw new ErroreDocumenti('Uno statuto è già presente: modifica quel documento per sostituire il PDF.');
    }

    const pdf = file ? await salvaPdf(file) : { file: esistente!.file, peso: esistente!.peso };
    const documento: Documento = { id: esistente?.id ?? nuovoId(), titolo, nota, categoria, ...pdf };

    if (esistente) {
      pagina.documenti = pagina.documenti.map((d) => (d.id === documento.id ? documento : d));
      if (file) await rimuoviPdf(esistente.file);
    } else {
      pagina.documenti.push(documento);
    }
    await writeJson(paths.documenti, pagina);
    return documento;
  });
}

export async function eliminaDocumento(id: string): Promise<void> {
  if (!ID.test(id)) throw new ErroreDocumenti('ID documento non valido');
  await serialized(async () => {
    const pagina = await leggiDocumenti();
    const documento = pagina.documenti.find((d) => d.id === id);
    if (!documento) throw new ErroreDocumenti('Documento non trovato');
    pagina.documenti = pagina.documenti.filter((d) => d.id !== id);
    await writeJson(paths.documenti, pagina);
    await rimuoviPdf(documento.file);
  });
}

export async function ordinaDocumenti(ids: string[]): Promise<void> {
  await serialized(async () => {
    const pagina = await leggiDocumenti();
    const perId = new Map(pagina.documenti.map((d) => [d.id, d]));
    if (ids.length !== perId.size || new Set(ids).size !== ids.length || ids.some((i) => !perId.has(i))) {
      throw new ErroreDocumenti('Elenco non aggiornato: ricarica la pagina');
    }
    pagina.documenti = ids.map((i) => perId.get(i)!);
    await writeJson(paths.documenti, pagina);
  });
}
