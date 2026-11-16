import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { aliases, icons, svg } from '../src/icons/inballet.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'src/styles/icons.css');

async function* sources(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sources(file);
    else if (/\.(astro|ts|js|json|css)$/.test(entry.name) && file !== output) yield file;
  }
}

const used = new Set();
for await (const file of sources(path.join(root, 'src'))) {
  for (const [, name] of (await readFile(file, 'utf8')).matchAll(/(?<!-)\bfa-([a-z0-9-]+)/g)) used.add(name);
}
const unknown = [...used].filter((name) => !icons[aliases[name] ?? name]);
if (unknown.length) throw new Error(`[icons] aggiungere al set InBallet: ${unknown.join(', ')}`);
const image = (name, filled = false) => `url("data:image/svg+xml,${encodeURIComponent(svg(name, { filled }))}")`;
const names = [...new Set([...used].map((name) => aliases[name] ?? name))].sort();
const rules = names.map((name) => {
  const selectors = [...used].filter((item) => (aliases[item] ?? item) === name).map((item) => `.fa-${item}`);
  return `${selectors.join(',')}{--ib-icon:${image(name)}}`;
});
const base = `:is(.fas,.far,.fab){display:inline-block;flex-shrink:0;width:1em;height:1em;font-style:normal;line-height:1;vertical-align:-.125em}:is(.fas,.far,.fab)::before{content:'';display:block;width:1em;height:1em;background:currentColor;-webkit-mask:var(--ib-icon) center/contain no-repeat;mask:var(--ib-icon) center/contain no-repeat}`;
await writeFile(output, `${base}\n${rules.join('\n')}\n.fas.fa-star{--ib-icon:${image('star', true)}}\n`);
const exports = path.join(root, 'public/assets/icons');
await mkdir(exports, { recursive: true });
const symbols = names.map(
  (name) =>
    `<symbol id="${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</symbol>`,
);
await writeFile(path.join(exports, 'inballet.svg'), `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`);
console.log(`[icons] InBallet: ${names.length} disegni SVG, ${used.size} nomi coperti, nessun font`);
