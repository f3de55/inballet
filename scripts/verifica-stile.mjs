#!/usr/bin/env node
/**
 * Verifica che il sito pubblico rispetti il sistema di stile unico (src/styles/):
 *  - nei file .astro niente <style> (gli stili stanno in src/styles/components e src/styles/pages)
 *    e stili inline (style="…") solo con variabili CSS che portano dati (--sfondo-lg, --fuoco-lg…);
 *  - nei CSS font-size solo con i gradini della scala (var(--text-*)) o le icone (var(--icona-*));
 *  - font-weight solo con i token (var(--font-*));
 *  - nessun colore scritto a mano (#hex, rgb/rgba/hsl con numeri): si usano i token della palette
 *    (i valori grezzi stanno solo in base/variables.css);
 *  - fuori da base/typography.css non si ridefiniscono le regole dei titoli h1-h6.
 * Il pannello chat (components/chatbot.css) ha una scala propria; dashboard e login (admin/) sono aree riservate.
 * Uso: npm run verifica:stile
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const radice = new URL('../src/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const escluseAstro = [/[\\/]dashboard[\\/]/, /[\\/]Admin\.astro$/, /[\\/]login\.astro$/, /[\\/]dashboard\.astro$/];
const escluseCss = [/[\\/]admin[\\/]/, /icons\.css$/];
const senzaScalaFont = [/chatbot\.css$/];
const coloriGrezziOk = [/variables\.css$/];
const titoliOk = [/typography\.css$/];

function file(dir, ext) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? file(p, ext) : p.endsWith(ext) ? [p] : [];
  });
}

const errori = [];
const segnala = (f, riga, msg) => errori.push(`${relative(radice, f)}:${riga}  ${msg}`);

// ---------- .astro: niente <style>, stili inline solo con dati ----------
for (const f of file(radice, '.astro')) {
  if (escluseAstro.some((r) => r.test(f))) continue;
  const testo = readFileSync(f, 'utf8');
  testo.split('\n').forEach((riga, i) => {
    if (/<style[\s>]/.test(riga)) segnala(f, i + 1, '<style> nel componente: il CSS va in src/styles/components o src/styles/pages');
    for (const s of riga.matchAll(/\sstyle=("([^"]*)"|\{`([^`]*)`\}|\{([^}]*)\})/g)) {
      const v = s[2] ?? s[3] ?? s[4] ?? '';
      // stile calcolato da funzioni che producono solo variabili (sfondo(), <Img fuoco>)
      if (/^[\w.]+\.style$/.test(v) || v === 'stile') continue;
      const dichiarazioni = v.split(';').map((d) => d.trim()).filter(Boolean);
      if (dichiarazioni.some((d) => !/^--[\w-]+\s*:/.test(d))) segnala(f, i + 1, `stile inline con proprietà vere: ${v}`);
    }
  });
}

// ---------- CSS ----------
for (const f of file(join(radice, 'styles'), '.css')) {
  if (escluseCss.some((r) => r.test(f))) continue;
  const testo = readFileSync(f, 'utf8');
  // I commenti (anche su più righe) non contano: si sostituiscono con spazi, mantenendo le righe
  const css = testo.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  css.split('\n').forEach((riga, n) => {
    const fs = riga.match(/font-size\s*:\s*([^;}]+)/);
    if (fs && !senzaScalaFont.some((r) => r.test(f)) && !/^(var\(--(text|icona|glifo)-[\w-]+\)|inherit)\s*$/.test(fs[1].trim())) segnala(f, n + 1, `font-size fuori scala: ${fs[1].trim()}`);
    const fw = riga.match(/font-weight\s*:\s*([^;}]+)/);
    if (fw && !/^(var\(--font-[\w-]+\)|inherit)\s*$/.test(fw[1].trim())) segnala(f, n + 1, `font-weight senza token: ${fw[1].trim()}`);
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
console.log('Stile: tutto conforme (nessun <style> nei componenti, scala tipografica, pesi, colori, titoli, stili inline).');
