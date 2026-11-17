import { spawn } from 'node:child_process';
import path from 'node:path';
import sharp from 'sharp';
import { problemiStile } from '../regole-stile.mjs';
import { ErroreSviluppatori, elenco, esiste, leggi, leggiTesto, modalita, percorsoSicuro, radice, scrivi } from './deposito';
import { aggiungiRegola, applica, ErroreCss, regole, verificaCss, type ModificaCss, type RegolaCss } from './stili';
import { estratto, normalizza, riga, sostituisci, TestoCalcolato, trova, type Occorrenza } from './testi';

export { ErroreSviluppatori } from './deposito';

const FORMATTABILE = /^(src|scripts|tests)\/.*\.(css|ts|mts|js|mjs|json|md)$|^astro\.config\.mjs$/;
const TESTUALE = /\.(astro|ts|mts|js|mjs|cjs|json|css|md|txt|html|svg|xml|gs|yml|yaml|toml)$|(^|\/)(Dockerfile|\.gitignore|\.dockerignore|\.prettierignore)$/;
const DOVE_TESTI = /^(src\/(?!styles\/|icons\/).*\.(astro|ts|json|mjs|md)|astro\.config\.mjs)$/;
const IMMAGINE = /\.(webp|png|jpe?g|avif|gif|svg|ico)$/i;
const RASTER: Record<string, 'webp' | 'png' | 'jpeg' | 'avif'> = { webp: 'webp', png: 'png', jpg: 'jpeg', jpeg: 'jpeg', avif: 'avif' };
const MAX_TESTO = 2 * 1024 * 1024;

export const eTestuale = (percorso: string) => TESTUALE.test(percorso);

async function formatta(percorso: string, testo: string): Promise<string> {
  const prettier = await import('prettier');
  const file = path.join(radice(), ...percorso.split('/'));
  const opzioni = (await prettier.resolveConfig(file)) ?? {};
  try {
    return await prettier.format(testo, { ...opzioni, filepath: file });
  } catch (e) {
    throw new ErroreSviluppatori(`Errore di sintassi: ${(e as Error).message.split('\n')[0]}`);
  }
}

async function verificaAstro(testo: string): Promise<void> {
  const { transform } = await import('@astrojs/compiler-rs');
  const errori = transform(testo, { filename: 'pagina.astro' }).diagnostics.filter((d) => d.severity === 'error');
  if (errori.length) {
    const e = errori[0];
    const dove = e.labels[0] ? ` (riga ${e.labels[0].line})` : '';
    throw new ErroreSviluppatori(`Errore nel file Astro${dove}: ${e.text}`);
  }
}

export async function salvaTesto(percorso: string, contenuto: string): Promise<string> {
  const p = percorsoSicuro(percorso);
  if (contenuto.length > MAX_TESTO) throw new ErroreSviluppatori('File troppo grande per l’editor.');
  let testo = contenuto.replace(/\r\n/g, '\n');
  if (p.endsWith('.json')) {
    try {
      JSON.parse(testo);
    } catch (e) {
      throw new ErroreSviluppatori(`JSON non valido: ${(e as Error).message}`);
    }
  }
  if (p.endsWith('.css')) {
    try {
      verificaCss(testo);
    } catch (e) {
      throw new ErroreSviluppatori((e as Error).message);
    }
  }
  if (p.endsWith('.astro')) await verificaAstro(testo);
  if (FORMATTABILE.test(p)) testo = await formatta(p, testo);
  const problemi = problemiStile(p, testo);
  if (problemi.length) {
    throw new ErroreSviluppatori(
      `Non rispetta le regole del progetto, la build fallirebbe:\n${problemi.map((x: { riga: number; messaggio: string }) => `riga ${x.riga}: ${x.messaggio}`).join('\n')}`,
    );
  }
  await scrivi(p, testo);
  if (modalita() === 'locale' && /^src\/.*\.(astro|ts|js|json|css)$/.test(p) && /\bfa-/.test(testo)) await rigeneraIcone();
  return testo;
}

function rigeneraIcone(): Promise<void> {
  return new Promise((ok) => {
    const processo = spawn(process.execPath, ['scripts/icons.mjs'], { cwd: radice(), windowsHide: true, stdio: 'ignore' });
    processo.on('close', () => ok());
    processo.on('error', () => ok());
  });
}

async function fileTestuali(filtro: RegExp): Promise<{ percorso: string; testo: string }[]> {
  const tutti = (await elenco()).filter((p) => filtro.test(p));
  return Promise.all(tutti.map(async (percorso) => ({ percorso, testo: await leggiTesto(percorso) })));
}

export type Candidato = { file: string; inizio: number; riga: number; estratto: string; punti: number };
type Trovato = Candidato & { occ: Occorrenza; src: string };
export type EsitoTesto =
  | { esito: 'fatto'; file: { percorso: string; riga: number }[] }
  | { esito: 'scegli'; candidati: Candidato[] }
  | { esito: 'nessuno' }
  | { esito: 'calcolato'; espressione: string; file: string; riga: number };

function parolaChiave(testo: string): string {
  return [...testo.matchAll(/[\p{L}\p{N}][\p{L}\p{N}_-]*/gu)].map((m) => m[0]).sort((a, b) => b.length - a.length)[0] ?? '';
}

function punteggio(t: { percorso: string; testo: string }, occ: Occorrenza, vicini: string[], pagina: string): number {
  const nome = pagina.replace(/^\/+|\/+$/g, '') || 'index';
  let punti = 0;
  if (t.percorso === `src/pages/${nome}.astro`) punti += 4;
  else if (nome.length > 3 && t.percorso.includes(nome)) punti += 2;
  const zona = t.testo.slice(Math.max(0, occ.inizio - 2500), occ.fine + 2500);
  if (nome.length > 3 && nome !== 'index' && zona.includes(nome)) punti += 2;
  for (const v of vicini.slice(0, 8)) {
    const parola = parolaChiave(v);
    if (parola.length >= 4 && zona.includes(parola)) punti += 3;
  }
  return punti;
}

export async function modificaTesto(input: {
  vecchio: string;
  nuovo: string;
  vicini: string[];
  pagina: string;
  scelta?: { file: string; inizio: number };
  tutte?: boolean;
}): Promise<EsitoTesto> {
  if (!normalizza(input.vecchio)) throw new ErroreSviluppatori('Testo vuoto');
  if (normalizza(input.vecchio) === normalizza(input.nuovo)) return { esito: 'fatto', file: [] };
  const trovati: Trovato[] = [];
  for (const t of await fileTestuali(DOVE_TESTI)) {
    for (const occ of trova(t.percorso, t.testo, input.vecchio)) {
      trovati.push({
        file: t.percorso,
        inizio: occ.inizio,
        riga: riga(t.testo, occ.inizio),
        estratto: estratto(t.testo, occ),
        punti: punteggio(t, occ, input.vicini, input.pagina),
        occ,
        src: t.testo,
      });
    }
  }
  if (!trovati.length) return { esito: 'nessuno' };
  trovati.sort((a, b) => b.punti - a.punti);
  let scelti: Trovato[];
  if (input.scelta) {
    const s = trovati.find((t) => t.file === input.scelta!.file && t.inizio === input.scelta!.inizio);
    if (!s) throw new ErroreSviluppatori('Il file è cambiato nel frattempo: riprova.');
    scelti = [s];
  } else if (input.tutte || trovati.length === 1) scelti = trovati;
  else if (trovati[0].punti >= 3 && trovati[0].punti > trovati[1].punti) scelti = [trovati[0]];
  else return { esito: 'scegli', candidati: trovati.slice(0, 12).map(({ occ: _o, src: _s, ...c }) => c) };

  const perFile = new Map<string, Trovato[]>();
  for (const s of scelti) perFile.set(s.file, [...(perFile.get(s.file) ?? []), s]);
  const fatti: { percorso: string; riga: number }[] = [];
  for (const [file, lista] of perFile) {
    let src = lista[0].src;
    for (const s of [...lista].sort((a, b) => b.inizio - a.inizio)) {
      try {
        src = sostituisci(src, s.occ, input.vecchio, input.nuovo);
      } catch (e) {
        if (e instanceof TestoCalcolato) return { esito: 'calcolato', espressione: e.message, file, riga: s.riga };
        throw e;
      }
    }
    await salvaTesto(file, src);
    fatti.push(...lista.map((s) => ({ percorso: file, riga: s.riga })));
  }
  return { esito: 'fatto', file: fatti };
}

export type Risultato = { percorso: string; riga: number; testo: string };

export async function cerca(query: string): Promise<Risultato[]> {
  const q = query.toLowerCase();
  if (q.length < 2) return [];
  const out: Risultato[] = [];
  for (const t of await fileTestuali(TESTUALE)) {
    t.testo.split('\n').forEach((r, i) => {
      if (out.length < 300 && r.toLowerCase().includes(q)) out.push({ percorso: t.percorso, riga: i + 1, testo: r.trim().slice(0, 200) });
    });
  }
  return out;
}

export async function tutteLeRegole(): Promise<RegolaCss[]> {
  const file = await fileTestuali(/^src\/styles\/(?!icons\.css$).*\.css$/);
  return file.flatMap((f) => regole(f.percorso, f.testo));
}

function erroreCss<T>(azione: () => T): T {
  try {
    return azione();
  } catch (e) {
    if (e instanceof ErroreCss) throw new ErroreSviluppatori(e.message);
    throw e;
  }
}

function soloCss(file: string): string {
  const p = percorsoSicuro(file);
  if (!/^src\/styles\/.*\.css$/.test(p) || p.endsWith('icons.css')) throw new ErroreSviluppatori('Si possono modificare solo i fogli di stile in src/styles.');
  return p;
}

export async function modificaRegola(file: string, percorso: number[], selettore: string, modifiche: ModificaCss[]): Promise<RegolaCss[]> {
  const p = soloCss(file);
  const sorgente = await leggiTesto(p);
  const risultato = await salvaTesto(
    p,
    erroreCss(() => applica(sorgente, percorso, selettore, modifiche)),
  );
  return regole(p, risultato);
}

export async function nuovaRegola(file: string, selettore: string, contesti: string[], dichiarazioni: ModificaCss[]): Promise<RegolaCss[]> {
  const p = soloCss(file);
  const sorgente = (await esiste(p)) ? await leggiTesto(p) : '';
  const risultato = await salvaTesto(
    p,
    erroreCss(() => aggiungiRegola(sorgente, selettore, contesti, dichiarazioni)),
  );
  return regole(p, risultato);
}

export async function trovaImmagine(indirizzo: string): Promise<string[]> {
  const url = new URL(indirizzo, 'http://x');
  const reale = url.pathname === '/_image' ? new URL(url.searchParams.get('href') ?? '', 'http://x').pathname : url.pathname;
  const tutti = (await elenco()).filter((p) => IMMAGINE.test(p));
  const pubblico = `public${decodeURIComponent(reale)}`;
  if (tutti.includes(pubblico)) return [pubblico];
  const base = decodeURIComponent(reale.split('/').pop() ?? '');
  const radiceNome = base.replace(/\.[^.]+$/, '').replace(/\.[\w-]{6,12}$/, '');
  return tutti.filter((p) => {
    const nome = (p.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
    return nome === radiceNome || nome === base.replace(/\.[^.]+$/, '');
  });
}

export async function sostituisciImmagine(percorso: string, file: File): Promise<void> {
  const p = percorsoSicuro(percorso);
  if (!IMMAGINE.test(p)) throw new ErroreSviluppatori('Non è un’immagine');
  const dati = Buffer.from(await file.arrayBuffer());
  const estensione = (p.split('.').pop() ?? '').toLowerCase();
  const formato = RASTER[estensione];
  if (!formato) {
    if (!file.name.toLowerCase().endsWith(`.${estensione}`)) throw new ErroreSviluppatori(`Serve un file .${estensione}`);
    await scrivi(p, dati);
    return;
  }
  let immagine: Buffer;
  try {
    immagine = await sharp(dati)
      .rotate()
      .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
      .toFormat(formato, { quality: 84 })
      .toBuffer();
  } catch {
    throw new ErroreSviluppatori('File immagine non leggibile');
  }
  await scrivi(p, immagine);
}

export async function caricaFile(percorso: string, file: File): Promise<void> {
  await scrivi(percorsoSicuro(percorso), Buffer.from(await file.arrayBuffer()));
}

export async function leggiPerEditor(percorso: string): Promise<{ testo: string | null; peso: number }> {
  const dati = await leggi(percorso);
  const binario = !eTestuale(percorso) || dati.subarray(0, 8000).includes(0);
  return { testo: binario ? null : dati.toString('utf8'), peso: dati.length };
}

export async function cambiaFont(nome: string): Promise<void> {
  const font = nome.trim();
  if (!/^[A-Za-z0-9 ]{2,40}$/.test(font)) throw new ErroreSviluppatori('Nome del font non valido');
  const famiglia = font.replace(/ /g, '+');
  const prova = await fetch(`https://fonts.googleapis.com/css2?family=${famiglia}:ital,wght@0,300..900;1,300..900&display=swap`).catch(() => null);
  if (!prova?.ok) throw new ErroreSviluppatori(`«${font}» non esiste su Google Fonts con i pesi 300-900 e il corsivo che il sito usa.`);
  const config = await leggiTesto('astro.config.mjs');
  const aggiornato = config.replace(/(fonts:\s*\[\s*\{[\s\S]*?name:\s*)'[^']*'/, `$1'${font}'`);
  if (aggiornato === config) throw new ErroreSviluppatori('Configurazione del font non trovata in astro.config.mjs');
  await salvaTesto('astro.config.mjs', aggiornato);
}

export async function fontAttuale(): Promise<string> {
  const config = await leggiTesto('astro.config.mjs').catch(() => '');
  return /fonts:\s*\[\s*\{[\s\S]*?name:\s*'([^']*)'/.exec(config)?.[1] ?? '';
}
