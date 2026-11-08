#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const radice = new URL('../src/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const escluseCss = [/icons\.css$/];
const coloriGrezziOk = [/variables\.css$/];
const titoliOk = [/typography\.css$/, /[\\/]admin[\\/]/];

function file(dir, ext) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? file(p, ext) : p.endsWith(ext) ? [p] : [];
  });
}

const errori = [];
const segnala = (f, riga, msg) => errori.push(`${relative(radice, f)}:${riga}  ${msg}`);

for (const f of file(radice, '.astro')) {
  const testo = readFileSync(f, 'utf8');
  testo.split('\n').forEach((riga, i) => {
    if (/<style[\s>]/.test(riga)) segnala(f, i + 1, '<style> nel componente: il CSS va in src/styles/components o src/styles/pages');
    if (/<!--/.test(riga) || /\{\s*\/\*/.test(riga)) segnala(f, i + 1, 'commento nel markup');
    for (const s of riga.matchAll(/\sstyle=("([^"]*)"|\{`([^`]*)`\}|\{([^}]*)\})/g)) {
      const v = s[2] ?? s[3] ?? s[4] ?? '';
      if (/^[\w.]+\.style$/.test(v) || v === 'stile') continue;
      const dichiarazioni = v
        .split(';')
        .map((d) => d.trim())
        .filter(Boolean);
      if (dichiarazioni.some((d) => !/^--[\w-]+\s*:/.test(d))) segnala(f, i + 1, `stile inline con proprietà vere: ${v}`);
    }
  });
}

for (const f of [...file(radice, '.astro'), ...file(radice, '.ts')]) {
  readFileSync(f, 'utf8')
    .split('\n')
    .forEach((riga, i) => {
      if (/<p\b[^>]*\btesto-piccolo\b/.test(riga))
        segnala(f, i + 1, 'paragrafo piccolo: ogni <p> è testo corpo, i dati brevi vanno in <small class="testo-piccolo">');
      if (/^\s*(\/\/(?!\/ <reference)|\/\*)/.test(riga)) segnala(f, i + 1, 'commento nel codice');
    });
}

for (const f of file(join(radice, 'styles'), '.css')) {
  if (escluseCss.some((r) => r.test(f))) continue;
  const testo = readFileSync(f, 'utf8');
  if (/\/\*/.test(testo)) segnala(f, testo.slice(0, testo.indexOf('/*')).split('\n').length, 'commento nel CSS');
  const css = testo.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  css.split('\n').forEach((riga, n) => {
    const fs = riga.match(/font-size\s*:\s*([^;}]+)/);
    if (fs && !/^(var\(--(text|icona|glifo)-[\w-]+\)|var\(--[a-z0-9-]+-size(-[a-z]+)?\)|inherit)\s*$/.test(fs[1].trim()))
      segnala(f, n + 1, `font-size fuori scala: ${fs[1].trim()}`);
    const fw = riga.match(/font-weight\s*:\s*([^;}]+)/);
    if (fw && !/^(var\(--(font|[a-z]+)-[a-z]+\)|inherit)\s*$/.test(fw[1].trim())) segnala(f, n + 1, `font-weight senza token: ${fw[1].trim()}`);
    if (coloriGrezziOk.some((r) => r.test(f))) return;
    if (/#[0-9a-fA-F]{3,8}\b/.test(riga) || /(rgba?|hsla?)\(\s*\d/.test(riga)) segnala(f, n + 1, `colore a mano: ${riga.trim()}`);
  });
  if (titoliOk.some((r) => r.test(f))) continue;
  for (const r of css.matchAll(/([^{}@;]+)\{([^{}]*)\}/g)) {
    const sel = r[1].trim();
    if (/(^|[\s,>+~])h[1-6](?![\w-])/.test(sel) && /font-(size|weight)|line-height|letter-spacing/.test(r[2])) {
      const n = css.slice(0, r.index).split('\n').length;
      segnala(f, n, `titolo ridefinito fuori da base/typography.css: ${sel.replace(/\s+/g, ' ')}`);
    }
  }
}

if (errori.length) {
  console.error(`Stile: ${errori.length} problemi\n` + errori.join('\n'));
  process.exit(1);
}
console.log('Stile: tutto conforme (niente <style> né commenti, scala tipografica, pesi, colori, titoli, paragrafi, stili inline).');
