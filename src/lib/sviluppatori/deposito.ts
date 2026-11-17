import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GITHUB_BRANCH, GITHUB_REPO, GITHUB_TOKEN, RAILWAY_GIT_COMMIT_SHA } from 'astro:env/server';
import { paths, readJson, writeJson } from '../storage';

export class ErroreSviluppatori extends Error {}

export type Modalita = 'locale' | 'clone' | 'assente';
export type Modifica = { percorso: string; stato: 'modificato' | 'nuovo' | 'eliminato' };
export type Commit = { sha: string; autore: string; data: string; messaggio: string };

const progetto = path.resolve('.');
const cartellaClone = path.join(paths.data, 'sviluppatori', 'repo');
const fileToccati = path.join(paths.data, 'sviluppatori', 'toccati.json');
const PROFONDITA = '30';
const AUTORE = ['-c', 'user.name=Area sviluppatori InBallet', '-c', 'user.email=area-sviluppatori@users.noreply.github.com'];
const VIETATI = /^(\.git|\.env|node_modules|dist|data|\.astro|\.claude)(\/|$)|(^|\/)\.env(\.|$)/;

export function modalita(): Modalita {
  const repoLocale = existsSync(path.join(progetto, '.git')) && existsSync(path.join(progetto, 'src'));
  if (import.meta.env.DEV && repoLocale) return 'locale';
  if (GITHUB_TOKEN) return 'clone';
  return repoLocale ? 'locale' : 'assente';
}

export function radice(): string {
  return modalita() === 'locale' ? progetto : cartellaClone;
}

export function percorsoSicuro(percorso: string): string {
  const p = percorso.replace(/\\/g, '/').replace(/^\.\//, '');
  if (!p || p.startsWith('/') || /^[a-z]:/i.test(p) || p.split('/').some((s) => s === '..' || s === '' || s === '.') || VIETATI.test(p)) {
    throw new ErroreSviluppatori(`Percorso non ammesso: ${percorso}`);
  }
  return p;
}

export function assoluto(percorso: string): string {
  return path.join(radice(), ...percorsoSicuro(percorso).split('/'));
}

function pulisci(messaggio: string): string {
  if (/could not read Username|Authentication failed|returned error: 40[13]|Permission .* denied/i.test(messaggio)) {
    return 'GitHub ha rifiutato l’accesso: controlla che GITHUB_TOKEN sia valido e abbia il permesso «Contents: read and write» sul repository.';
  }
  const t = GITHUB_TOKEN ? messaggio.split(GITHUB_TOKEN).join('***') : messaggio;
  return t.replace(/AUTHORIZATION: basic \S+/gi, 'AUTHORIZATION: ***').trim();
}

function git(args: string[], opzioni: { remoto?: boolean; cwd?: string } = {}): Promise<string> {
  const accesso =
    opzioni.remoto && modalita() === 'clone'
      ? ['-c', `http.https://github.com/.extraheader=AUTHORIZATION: basic ${Buffer.from(`x-access-token:${GITHUB_TOKEN}`).toString('base64')}`]
      : [];
  return new Promise((ok, ko) =>
    execFile(
      'git',
      [...accesso, '-c', 'safe.directory=*', '-c', 'core.quotepath=off', '-c', 'core.autocrlf=false', ...args],
      { cwd: opzioni.cwd ?? radice(), maxBuffer: 64 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, windowsHide: true },
      (errore, stdout, stderr) => (errore ? ko(new ErroreSviluppatori(pulisci(stderr || errore.message))) : ok(stdout)),
    ),
  );
}

let coda: Promise<unknown> = Promise.resolve();
export function inCoda<T>(compito: () => Promise<T>): Promise<T> {
  const r = coda.then(compito, compito);
  coda = r.catch(() => {});
  return r;
}

let ultimoAggiornamento = 0;

async function assicuraClone(): Promise<void> {
  if (existsSync(path.join(cartellaClone, '.git'))) return;
  await rm(cartellaClone, { recursive: true, force: true });
  await mkdir(path.dirname(cartellaClone), { recursive: true });
  await git(['clone', '--depth', PROFONDITA, '--branch', GITHUB_BRANCH, `https://github.com/${GITHUB_REPO}.git`, cartellaClone], {
    remoto: true,
    cwd: path.dirname(cartellaClone),
  });
  ultimoAggiornamento = Date.now();
}

export function prepara(): Promise<void> {
  return inCoda(async () => {
    const m = modalita();
    if (m === 'assente') throw new ErroreSviluppatori('Area non configurata: manca GITHUB_TOKEN sul server.');
    if (m === 'locale') return;
    await assicuraClone();
    if (Date.now() - ultimoAggiornamento < 60_000) return;
    ultimoAggiornamento = Date.now();
    if ((await elencoModifiche()).length) return;
    await git(['fetch', '--depth', PROFONDITA, 'origin', GITHUB_BRANCH], { remoto: true });
    await git(['reset', '--hard', `origin/${GITHUB_BRANCH}`]);
  });
}

async function toccati(): Promise<string[]> {
  return readJson<string[]>(fileToccati, []);
}

async function segnaToccato(percorso: string): Promise<void> {
  if (modalita() !== 'locale') return;
  const lista = await toccati();
  if (!lista.includes(percorso)) await writeJson(fileToccati, [...lista, percorso]);
}

async function elencoModifiche(): Promise<Modifica[]> {
  const locale = modalita() === 'locale';
  const uscita = await git(['status', '--porcelain=v1', '-z', '--untracked-files=all', ...(locale ? [] : ['--ignored'])]);
  const voci = uscita.split('\0').filter(Boolean);
  const out: Modifica[] = [];
  for (let i = 0; i < voci.length; i++) {
    const codice = voci[i].slice(0, 2);
    const percorso = voci[i].slice(3);
    if (codice[0] === 'R' || codice[0] === 'C') i++;
    if (VIETATI.test(percorso) || percorso.endsWith('/')) continue;
    const stato = codice === '??' || codice === '!!' || codice.includes('A') ? 'nuovo' : codice.includes('D') ? 'eliminato' : 'modificato';
    out.push({ percorso, stato });
  }
  if (!locale) return out;
  const miei = await toccati();
  const visti = new Set(out.map((m) => m.percorso));
  const ignorati: Modifica[] = [];
  for (const p of miei) {
    if (visti.has(p) || !(await esiste(p))) continue;
    if (!(await git(['ls-files', '--', p])).trim()) ignorati.push({ percorso: p, stato: 'nuovo' });
  }
  return [...out.filter((m) => miei.includes(m.percorso)), ...ignorati];
}

export function modifiche(): Promise<Modifica[]> {
  return inCoda(elencoModifiche);
}

export async function elenco(): Promise<string[]> {
  const uscita = await git(['ls-files', '-co', '--exclude-standard', '-z']);
  const tutti = [...new Set(uscita.split('\0').filter(Boolean))];
  return tutti.filter((p) => !VIETATI.test(p) && existsSync(path.join(radice(), ...p.split('/')))).sort();
}

export async function leggi(percorso: string): Promise<Buffer> {
  try {
    return await readFile(assoluto(percorso));
  } catch {
    throw new ErroreSviluppatori(`File non trovato: ${percorso}`);
  }
}

export async function leggiTesto(percorso: string): Promise<string> {
  return (await leggi(percorso)).toString('utf8');
}

export async function esiste(percorso: string): Promise<boolean> {
  return stat(assoluto(percorso)).then(
    (s) => s.isFile(),
    () => false,
  );
}

export async function scrivi(percorso: string, dati: string | Buffer): Promise<void> {
  const p = percorsoSicuro(percorso);
  const file = assoluto(p);
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, dati);
  await rename(tmp, file);
  await segnaToccato(p);
}

export async function elimina(percorso: string): Promise<void> {
  const p = percorsoSicuro(percorso);
  await rm(assoluto(p), { force: true });
  await segnaToccato(p);
}

export async function rinomina(da: string, a: string): Promise<void> {
  const origine = percorsoSicuro(da);
  const destinazione = percorsoSicuro(a);
  if (await esiste(destinazione)) throw new ErroreSviluppatori(`Esiste già: ${destinazione}`);
  await mkdir(path.dirname(assoluto(destinazione)), { recursive: true });
  await rename(assoluto(origine), assoluto(destinazione));
  await segnaToccato(origine);
  await segnaToccato(destinazione);
}

export async function differenza(percorso: string): Promise<string> {
  const p = percorsoSicuro(percorso);
  const tracciato = await git(['ls-files', '--', p]);
  if (tracciato.trim()) return git(['diff', '--no-color', '--no-ext-diff', 'HEAD', '--', p]);
  const testo = await leggiTesto(p).catch(() => '');
  return [`+++ ${p}`, ...testo.split('\n').map((r) => `+${r}`)].join('\n');
}

export function scarta(percorso: string): Promise<void> {
  return inCoda(async () => {
    const p = percorsoSicuro(percorso);
    const tracciato = (await git(['ls-files', '--', p])).trim() || (await git(['ls-tree', '--name-only', 'HEAD', '--', p])).trim();
    if (tracciato) {
      await git(['reset', '-q', 'HEAD', '--', p]).catch(() => {});
      await git(['checkout', 'HEAD', '--', p]);
    } else await rm(assoluto(p), { force: true });
    if (modalita() === 'locale')
      await writeJson(
        fileToccati,
        (await toccati()).filter((t) => t !== p),
      );
  });
}

export async function storia(): Promise<Commit[]> {
  const uscita = await git(['log', '-n', '20', '--format=%H%x1f%an%x1f%aI%x1f%s%x1e']);
  return uscita
    .split('\x1e')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => {
      const [sha, autore, data, messaggio] = r.split('\x1f');
      return { sha, autore, data, messaggio };
    });
}

export async function testa(): Promise<string> {
  return (await git(['rev-parse', 'HEAD'])).trim();
}

export function online(): string | null {
  return RAILWAY_GIT_COMMIT_SHA ?? null;
}

export function annulla(sha: string): Promise<void> {
  return inCoda(async () => {
    if (!/^[0-9a-f]{7,40}$/.test(sha)) throw new ErroreSviluppatori('Versione non valida');
    if ((await elencoModifiche()).length) throw new ErroreSviluppatori('Prima pubblica o scarta le modifiche in sospeso.');
    const file = (await git(['diff-tree', '--no-commit-id', '--name-only', '-r', sha])).split('\n').filter(Boolean);
    try {
      await git(['revert', '--no-commit', sha]);
    } catch (e) {
      await git(['revert', '--abort']).catch(() => {});
      throw new ErroreSviluppatori(`Non si può annullare automaticamente: ${(e as Error).message}`);
    }
    await git(['reset', '-q']);
    for (const f of file) await segnaToccato(f);
  });
}

async function riallinea(lista: Modifica[]): Promise<void> {
  await git(['fetch', '--depth', PROFONDITA, 'origin', GITHUB_BRANCH], { remoto: true });
  const remoto = (await git(['rev-parse', `origin/${GITHUB_BRANCH}`])).trim();
  if (remoto === (await testa())) return;
  const blob = (rif: string, p: string) =>
    git(['rev-parse', `${rif}:${p}`]).then(
      (s) => s.trim(),
      () => '',
    );
  const conflitti: string[] = [];
  for (const m of lista) if ((await blob('HEAD', m.percorso)) !== (await blob(`origin/${GITHUB_BRANCH}`, m.percorso))) conflitti.push(m.percorso);
  if (conflitti.length) {
    throw new ErroreSviluppatori(
      `Questi file sono stati cambiati anche da qualcun altro dopo l'ultimo aggiornamento: ${conflitti.join(', ')}. Scarta le tue modifiche a quei file e rifalle.`,
    );
  }
  const salvati = await Promise.all(lista.map(async (m) => ({ ...m, dati: m.stato === 'eliminato' ? null : await readFile(assoluto(m.percorso)) })));
  await git(['reset', '--hard', `origin/${GITHUB_BRANCH}`]);
  for (const s of salvati) {
    const file = assoluto(s.percorso);
    if (s.dati) {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, s.dati);
    } else await rm(file, { force: true });
  }
}

export function pubblica(messaggio: string): Promise<string> {
  return inCoda(async () => {
    const lista = await elencoModifiche();
    if (!lista.length) throw new ErroreSviluppatori('Nessuna modifica da pubblicare.');
    const percorsi = lista.map((m) => m.percorso);
    const testo = messaggio.trim() || `Area sviluppatori: aggiorna ${percorsi.length === 1 ? percorsi[0] : `${percorsi.length} file`}`;
    if (modalita() === 'locale') {
      await git(['add', '-f', '-A', '--', ...percorsi]);
      await git(['commit', '-m', testo, '--', ...percorsi]);
      await writeJson(fileToccati, []);
      try {
        await git(['push']);
      } catch {
        await git(['pull', '--rebase', '--autostash']);
        await git(['push']);
      }
      return testa();
    }
    await riallinea(lista);
    await git(['add', '-f', '-A', '--', ...percorsi]);
    await git([...AUTORE, 'commit', '-m', testo]);
    try {
      await git(['push', 'origin', `HEAD:${GITHUB_BRANCH}`], { remoto: true });
    } catch (e) {
      await git(['reset', '--soft', 'HEAD~1']);
      await git(['reset', '-q']);
      throw e;
    }
    ultimoAggiornamento = Date.now();
    return testa();
  });
}
