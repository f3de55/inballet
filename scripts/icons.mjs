import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
const faDir = path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'));
const OUT_CSS = path.join(root, 'src/styles/icons.css');
const OUT_FONTS = path.join(root, 'src/assets/fonts');

const FONTS = [
  { file: 'fa-solid-900', family: 'Font Awesome 6 Free', weight: 900 },
  { file: 'fa-regular-400', family: 'Font Awesome 6 Free', weight: 400 },
  { file: 'fa-brands-400', family: 'Font Awesome 6 Brands', weight: 400 },
];

async function* sources(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sources(full);
    else if (/\.(astro|ts|js|json|css)$/.test(entry.name) && full !== OUT_CSS) yield full;
  }
}

const used = new Set();
const extraCodepoints = new Set();
for await (const file of sources(path.join(root, 'src'))) {
  const text = await readFile(file, 'utf8');
  for (const [, name] of text.matchAll(/\bfa-([a-z0-9-]+)/g)) used.add(name);
  for (const [, hex] of text.matchAll(/content:\s*['"]\\(f[0-9a-f]{3})['"]/gi)) extraCodepoints.add(parseInt(hex, 16));
}

const css = await readFile(path.join(faDir, 'css/all.min.css'), 'utf8');
const definite = new Set([...css.matchAll(/\.fa-([a-z0-9-]+)/g)].map((m) => m[1]));
const sconosciute = [...used].filter((n) => !definite.has(n));
if (sconosciute.length) throw new Error(`[icons] classi Font Awesome inesistenti: ${sconosciute.map((n) => `fa-${n}`).join(', ')}`);
const codepoints = new Set(extraCodepoints);
const iconRules = [];

let base = css.replace(/([^{}]+)\{--fa:"\\([0-9a-f]+)"\}/g, (_, selectors, hex) => {
  const kept = selectors.split(',').filter((sel) => {
    const m = /^\.fa-([a-z0-9-]+)$/.exec(sel.trim());
    return m && used.has(m[1]);
  });
  if (kept.length) {
    iconRules.push(`${kept.join(',')}{--fa:"\\${hex}"}`);
    codepoints.add(parseInt(hex, 16));
  }
  return '';
});

if (!iconRules.length) throw new Error('[icons] nessuna icona estratta: il formato del CSS di Font Awesome è cambiato');

base = base.replace(/@font-face\{[^}]*\}/g, '').replace(/\/\*![\s\S]*?\*\//, '');

function blocchi(testo) {
  const out = [];
  let inizio = 0;
  let livello = 0;
  for (let i = 0; i < testo.length; i++) {
    if (testo[i] === '{') livello++;
    else if (testo[i] === '}' && --livello === 0) {
      const blocco = testo.slice(inizio, i + 1);
      const graffa = blocco.indexOf('{');
      out.push({ testa: blocco.slice(0, graffa), corpo: blocco.slice(graffa + 1, -1) });
      inizio = i + 1;
    }
  }
  return out;
}

const selettoreUsato = (sel) => !/\.sr-only/.test(sel) && [...sel.matchAll(/\.fa-([a-z0-9-]+)/g)].every(([, nome]) => used.has(nome));

function pota(testo) {
  return blocchi(testo)
    .map(({ testa, corpo }) => {
      if (testa.startsWith('@keyframes')) return { testa, corpo };
      if (testa.startsWith('@')) {
        const interno = pota(corpo);
        return interno && { testa, corpo: interno };
      }
      const selettori = testa.split(',').filter(selettoreUsato);
      return selettori.length && { testa: selettori.join(','), corpo };
    })
    .filter(Boolean)
    .map(({ testa, corpo }) => `${testa}{${corpo}}`)
    .join('');
}

base = pota(base);
base = base.replace(/@keyframes ([\w-]+)\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, (regola, nome) => (base.includes(`animation-name:${nome}`) ? regola : ''));
const fontFaces = FONTS.map(
  (f) =>
    `@font-face{font-family:"${f.family}";font-style:normal;font-weight:${f.weight};font-display:block;src:url(../assets/fonts/${f.file}.woff2) format("woff2")}`,
);

await mkdir(OUT_FONTS, { recursive: true });
const text = String.fromCodePoint(...codepoints);
let fontBytes = 0;
for (const f of FONTS) {
  const source = await readFile(path.join(faDir, 'webfonts', `${f.file}.woff2`));
  const subset = await subsetFont(source, text, { targetFormat: 'woff2' });
  await writeFile(path.join(OUT_FONTS, `${f.file}.woff2`), subset);
  fontBytes += subset.length;
}

const header = `/* GENERATO da scripts/icons.mjs — non modificare. Font Awesome Free 6 (CC BY 4.0 / SIL OFL 1.1 / MIT), ${codepoints.size} icone. */\n`;
await writeFile(OUT_CSS, header + fontFaces.join('') + base + iconRules.join('') + '\n');

console.log(`[icons] ${iconRules.length} regole, ${codepoints.size} glifi, font ${(fontBytes / 1024).toFixed(1)}KB`);
