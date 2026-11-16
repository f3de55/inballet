import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { aliases, drawing, icons, svg } from '../src/icons/inballet.mjs';

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
const image = (name, layer) => `url("data:image/svg+xml,${encodeURIComponent(svg(name, { layer }))}")`;
const names = [...new Set([...used].map((name) => aliases[name] ?? name))].sort();
const rules = names.map((name) => {
  const selectors = [...used].filter((item) => (aliases[item] ?? item) === name).map((item) => `.fa-${item}`);
  return `${selectors.join(',')}{--ib-icon:${image(name, 'outline')};--ib-accent:${image(name, 'accent')};--ib-control:${image(name, 'monochrome')}}`;
});
const base = `:where(.fas,.far,.fab){font-size:var(--icona-in-testo)}:is(.fas,.far,.fab){position:relative;display:inline-block;isolation:isolate;flex-shrink:0;width:1em;height:1em;font-style:normal;line-height:1;vertical-align:-.125em}:is(.fas,.far,.fab)::before,:is(.fas,.far,.fab)::after{content:'';position:absolute;inset:0;display:block;width:1em;height:1em;-webkit-mask:var(--ib-icon) center/contain no-repeat;mask:var(--ib-icon) center/contain no-repeat}:is(.fas,.far,.fab)::before{z-index:1;background:currentColor}:is(.fas,.far,.fab)::after{z-index:0;background:var(--icona-secondario,var(--primary-blue));-webkit-mask-image:var(--ib-accent);mask-image:var(--ib-accent)}.far.fa-star::after{opacity:0}`;
const controls = `:where(a,button,summary,[role="button"],.link-cta)>:is(.fas,.far,.fab)::before{-webkit-mask-image:var(--ib-control);mask-image:var(--ib-control)}:where(a,button,summary,[role="button"],.link-cta)>:is(.fas,.far,.fab)::after{display:none}`;
await writeFile(output, `${base}\n${rules.join('\n')}\n${controls}\n`);
const exports = path.join(root, 'public/assets/icons');
await mkdir(exports, { recursive: true });
const symbols = Object.keys(icons)
  .sort()
  .map((name) => `<symbol id="${name}" viewBox="0 0 24 24">${drawing(name)}</symbol>`);
await writeFile(path.join(exports, 'inballet.svg'), `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`);
console.log(`[icons] InBallet: ${Object.keys(icons).length} disegni SVG, ${used.size} nomi usati, nessun font`);
