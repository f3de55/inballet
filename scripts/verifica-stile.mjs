#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { problemiStile } from '../src/lib/regole-stile.mjs';

const progetto = new URL('../', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const radice = join(progetto, 'src');

function file(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? file(p) : /\.(astro|ts|css)$/.test(p) ? [p] : [];
  });
}

const errori = file(radice).flatMap((f) =>
  problemiStile(relative(progetto, f), readFileSync(f, 'utf8')).map(({ riga, messaggio }) => `${relative(radice, f)}:${riga}  ${messaggio}`),
);

if (errori.length) {
  console.error(`Stile: ${errori.length} problemi\n` + errori.join('\n'));
  process.exit(1);
}
console.log('Stile: tutto conforme (niente <style> né commenti, scala tipografica, pesi, colori, titoli, paragrafi, stili inline).');
