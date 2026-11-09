#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';

const INTERVALLO_MS = 4000;
const ATTESA_DEPLOY_MS = 180000;
const FINALI = { SUCCESS: 0, FAILED: 1, CRASHED: 1, REMOVED: 1 };

const tappe = [
  [/uploading snapshot/, 8],
  [/npm ci/, 14],
  [/\[icons\]/, 32],
  [/Building server entrypoints/, 40],
  [/prerendering static routes/, 46],
  [/exporting to docker image format/, 82],
  [/image push/, 90],
  [/Starting Container/, 100],
];

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

function railway(...args) {
  const r = spawnSync('railway', args, { encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error((r.stderr || r.stdout || 'railway non risponde').trim());
  return r.stdout;
}

const righeLog = (tipo, id) =>
  railway('logs', tipo, '--json', id)
    .split('\n')
    .flatMap((riga) => {
      try {
        return [JSON.parse(riga).message ?? ''];
      } catch {
        return [];
      }
    });

function percentuale(stato, id) {
  if (stato === 'SUCCESS') return 100;
  if (stato === 'DEPLOYING') return 95;
  if (stato === 'QUEUED' || stato === 'INITIALIZING') return 2;
  const testo = righeLog('--build', id).join('\n');
  let pct = 5;
  for (const [regola, valore] of tappe) if (regola.test(testo)) pct = Math.max(pct, valore);
  const immagini = [...testo.matchAll(/\((\d+)\/(\d+)\)/g)].map((m) => Number(m[1]) / Number(m[2]));
  if (immagini.length && pct < 82) pct = Math.max(pct, Math.round(46 + 34 * Math.max(...immagini)));
  return pct;
}

const durata = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
const dormi = (ms) => new Promise((ok) => setTimeout(ok, ms));
const elenco = () => JSON.parse(railway('deployment', 'list', '--json'));

const commit = process.argv[2] ?? git('rev-parse', 'HEAD');
const locale = git('rev-parse', 'HEAD');
if (!process.argv[2] && git('branch', '-r', '--contains', locale, '--list', 'origin/*') === '') {
  console.log('Il commit locale non è su origin: Railway non costruisce finché non fai push.');
  process.exit(1);
}

const inizio = Date.now();
let deploy;
while (!deploy) {
  deploy = elenco().find((d) => d.meta?.commitHash?.startsWith(commit));
  if (deploy) break;
  if (Date.now() - inizio > ATTESA_DEPLOY_MS) {
    console.log(`Nessun deploy Railway per ${commit.slice(0, 7)} dopo ${durata(ATTESA_DEPLOY_MS)}.`);
    process.exit(1);
  }
  console.log(`[  0%] in attesa che Railway veda ${commit.slice(0, 7)} · ${durata(Date.now() - inizio)}`);
  await dormi(INTERVALLO_MS);
}

const partenza = new Date(deploy.createdAt).getTime();
let ultimo = '';
for (;;) {
  const stato = elenco().find((d) => d.id === deploy.id)?.status ?? 'REMOVED';
  const pct = percentuale(stato, deploy.id);
  const riga = `[${String(pct).padStart(3)}%] ${stato.toLowerCase()} · ${durata(Date.now() - partenza)}`;
  if (riga.slice(0, 18) !== ultimo) console.log(riga);
  ultimo = riga.slice(0, 18);
  if (stato in FINALI) {
    if (FINALI[stato]) console.log(righeLog('--build', deploy.id).slice(-15).join('\n'));
    process.exit(FINALI[stato]);
  }
  await dormi(INTERVALLO_MS);
}
