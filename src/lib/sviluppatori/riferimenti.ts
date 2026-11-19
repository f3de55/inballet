import path from 'node:path';
import { ErroreSviluppatori, elenco, elimina, leggiTesto, percorsoSicuro, rinomina } from './deposito';
import { salvaTesto } from './index';

type Uso = { file: string; riga: number; inizio: number; fine: number; spec: string };

const SORGENTI =
  /^(src\/(?!styles\/icons\.css$).*\.(astro|ts|mts|js|mjs|json|css|md)|(scripts|tests)\/.*\.(mjs|js|ts)|astro\.config\.mjs|public\/.*\.(css|html|xml|webmanifest|json|txt))$/;
const STRINGHE = /(['"`])((?:(?!\1)[^\n\\])+)\1/g;
const PERCORSO = /[\w./@~-]/;
const DOPO_NOME = /[\w.-]/;
const SUFFISSI = /-(scuro|desktop|tablet|mobile|unica)$/;
const MODULO = /\.(ts|mts|js|mjs)$/;

const senzaEstensione = (p: string) => p.replace(/\.[^./]+$/, '');
const scappa = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const riga = (testo: string, indice: number) => testo.slice(0, indice).split('\n').length;

function puntaA(spec: string, da: string, bersaglio: string): boolean {
  const s = spec.split(/[?#]/)[0];
  if (!s) return false;
  if (s.startsWith('.')) {
    const c = path.posix.normalize(path.posix.join(path.posix.dirname(da), s));
    return c === bersaglio || (MODULO.test(bersaglio) && c === senzaEstensione(bersaglio));
  }
  if (s.startsWith('/')) return bersaglio === `public${s}` || bersaglio === s.slice(1);
  return bersaglio === s || bersaglio.endsWith(`/${s}`);
}

function citazioni(file: string, testo: string, bersaglio: string): Uso[] {
  const nome = path.posix.basename(bersaglio);
  const cercati = MODULO.test(bersaglio) ? [nome, senzaEstensione(nome)] : [nome];
  const out: Uso[] = [];
  const visti = new Set<number>();
  for (const c of cercati) {
    for (let i = testo.indexOf(c); i >= 0; i = testo.indexOf(c, i + 1)) {
      const fine = i + c.length;
      if (DOPO_NOME.test(testo[fine] ?? '')) continue;
      let inizio = i;
      while (inizio > 0 && PERCORSO.test(testo[inizio - 1])) inizio--;
      const spec = testo.slice(inizio, fine);
      if (visti.has(inizio) || !puntaA(spec, file, bersaglio)) continue;
      visti.add(inizio);
      out.push({ file, riga: riga(testo, inizio), inizio, fine, spec });
    }
  }
  return out;
}

function costruito(spec: string, bersaglio: string): boolean {
  if (!spec.includes('${')) return false;
  const schema = spec
    .replace(/^(\.{0,2}\/)+/, '')
    .split(/\$\{[^}]*\}/)
    .map(scappa)
    .join('[^/]+');
  return new RegExp(`(^|/)${schema}$`).test(bersaglio);
}

function radici(bersaglio: string): string[] {
  let r = senzaEstensione(path.posix.basename(bersaglio));
  const out = [r];
  while (SUFFISSI.test(r)) {
    r = r.replace(SUFFISSI, '');
    out.push(r);
  }
  return out;
}

async function usi(bersaglio: string): Promise<{ citati: Uso[]; costruiti: Uso[] }> {
  const radice = senzaEstensione(path.posix.basename(bersaglio));
  const nomi = radici(bersaglio);
  const sorgenti = await Promise.all(
    (await elenco()).filter((f) => f !== bersaglio && SORGENTI.test(f)).map(async (file) => ({ file, testo: await leggiTesto(file) })),
  );
  const citati: Uso[] = [];
  const modelli: Uso[] = [];
  let nominato = false;
  for (const { file, testo } of sorgenti) {
    if (testo.includes(radice)) citati.push(...citazioni(file, testo, bersaglio));
    if (!testo.includes('${') && !nomi.some((n) => testo.includes(n))) continue;
    for (const m of testo.matchAll(STRINGHE)) {
      const inizio = m.index + 1;
      if (costruito(m[2], bersaglio)) modelli.push({ file, riga: riga(testo, inizio), inizio, fine: inizio + m[2].length, spec: m[2] });
      else if (nomi.includes(m[2])) nominato = true;
    }
  }
  return { citati, costruiti: nominato ? modelli : [] };
}

const elenca = (lista: Uso[]) =>
  lista
    .slice(0, 8)
    .map((u) => `${u.file}:${u.riga}`)
    .join(', ') + (lista.length > 8 ? ` e altri ${lista.length - 8}` : '');

export async function eliminaFile(percorso: string): Promise<void> {
  const p = percorsoSicuro(percorso);
  const { citati, costruiti } = await usi(p);
  const tutti = [...citati, ...costruiti];
  if (tutti.length) throw new ErroreSviluppatori(`${p} è ancora usato in ${elenca(tutti)}: toglilo prima da lì, altrimenti la build su Railway fallisce.`);
  await elimina(p);
}

function nuovoSpec(spec: string, da: string, vecchio: string, nuovo: string): string {
  const [base, coda = ''] = spec.split(/(?=[?#])/);
  const fine = (p: string) => (path.posix.extname(base) ? p : senzaEstensione(p));
  let risultato: string;
  if (base.startsWith('.')) {
    const rel = path.posix.relative(path.posix.dirname(da), nuovo);
    risultato = fine(rel.startsWith('.') ? rel : `./${rel}`);
  } else if (base.startsWith('/')) risultato = fine(`/${nuovo.replace(/^public\//, '')}`);
  else risultato = fine(nuovo.split('/').slice(-base.split('/').length).join('/'));
  if (!puntaA(risultato, da, nuovo))
    throw new ErroreSviluppatori(`Non so aggiornare ${da} (${spec}) per il nuovo percorso: sposta il file dentro la stessa cartella.`);
  return risultato + coda;
}

export async function rinominaFile(da: string, a: string): Promise<string[]> {
  const vecchio = percorsoSicuro(da);
  const nuovo = percorsoSicuro(a);
  const { citati, costruiti } = await usi(vecchio);
  if (costruiti.length)
    throw new ErroreSviluppatori(
      `${vecchio} è scelto dal codice in base al nome (${elenca(costruiti)}): rinominarlo romperebbe il sito. Cambia prima quel nome nei dati.`,
    );
  const perFile = new Map<string, Uso[]>();
  for (const u of citati) perFile.set(u.file, [...(perFile.get(u.file) ?? []), u]);
  const aggiornati = new Map<string, string>();
  for (const [file, lista] of perFile) {
    let testo = await leggiTesto(file);
    for (const u of [...lista].sort((x, y) => y.inizio - x.inizio))
      testo = testo.slice(0, u.inizio) + nuovoSpec(u.spec, file, vecchio, nuovo) + testo.slice(u.fine);
    aggiornati.set(file, testo);
  }
  await rinomina(vecchio, nuovo);
  for (const [file, testo] of aggiornati) await salvaTesto(file, testo);
  return [...aggiornati.keys()];
}
