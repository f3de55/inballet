#!/usr/bin/env node
/**
 * Verifica che il sito pubblico rispetti il sistema di stile unico (src/styles/global.css):
 *  - font-size solo con i gradini della scala (var(--text-*)) o le icone (var(--icona-*));
 *  - nessun colore scritto a mano (#hex, rgb/rgba con numeri): si usano i token della palette;
 *  - stili inline (style="…") solo con variabili CSS che portano dati (--sfondo-lg, --i…);
 *  - nei <style> dei componenti non si ridefiniscono le regole dei titoli h1-h6.
 * Il pannello chat (Chatbot.astro) ha una scala propria; dashboard e login sono aree riservate.
 * Uso: npm run verifica:stile
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const radice = new URL('../src/', import.meta.url).pathname;
const escluse = [/\/dashboard\//, /\/Admin\.astro$/, /\/login\.astro$/, /\/dashboard\.astro$/, /\/Chatbot\.astro$/];

function file(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? file(p) : p.endsWith('.astro') ? [p] : [];
  });
}

const errori = [];
const segnala = (f, riga, msg) => errori.push(`${relative(radice, f)}:${riga}  ${msg}`);

for (const f of file(radice)) {
  if (escluse.some((r) => r.test(f))) continue;
  const testo = readFileSync(f, 'utf8');
  const righe = testo.split('\n');
  const stili = [...testo.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
  for (const m of stili) {
    const inizio = testo.slice(0, m.index).split('\n').length;
    // I commenti (anche su più righe) non contano: si sostituiscono con spazi, mantenendo le righe
    const css = m[1].replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    css.split('\n').forEach((riga, i) => {
      const n = inizio + i;
      const senzaCommento = riga;
      const fs = senzaCommento.match(/font-size\s*:\s*([^;}]+)/);
      if (fs && !/^(var\(--(text|icona)-[\w-]+\)|inherit)\s*$/.test(fs[1].trim())) segnala(f, n, `font-size fuori scala: ${fs[1].trim()}`);
      if (/mask/.test(senzaCommento)) return;
      if (/#[0-9a-fA-F]{3,8}\b/.test(senzaCommento)) segnala(f, n, `colore a mano: ${senzaCommento.trim()}`);
      if (/rgba?\(\s*\d/.test(senzaCommento)) segnala(f, n, `colore a mano: ${senzaCommento.trim()}`);
    });
    for (const r of css.matchAll(/([^{}@;]+)\{([^{}]*)\}/g)) {
      const sel = r[1].trim();
      if (/(^|[\s,>+~])h[1-6](?![\w-])/.test(sel) && /font-(size|weight)|line-height|letter-spacing/.test(r[2])) {
        const n = inizio + css.slice(0, r.index).split('\n').length - 1;
        segnala(f, n, `titolo ridefinito nel componente: ${sel.replace(/\s+/g, ' ')}`);
      }
    }
  }
  righe.forEach((riga, i) => {
    for (const s of riga.matchAll(/\sstyle=("([^"]*)"|\{`([^`]*)`\}|\{([^}]*)\})/g)) {
      const v = s[2] ?? s[3] ?? s[4] ?? '';
      // stile calcolato da funzioni che producono solo variabili (sfondo(), <Img fuoco>)
      if (/^[\w.]+\.style$/.test(v) || v === 'stile' || /^velo\(\w+\)$/.test(v)) continue;
      if (/^[^`]*`--[\w-]+:\$\{[^}]*\}`[^`]*$/.test(v)) continue;
      const dichiarazioni = v.split(';').map((d) => d.trim()).filter(Boolean);
      if (dichiarazioni.some((d) => !/^--[\w-]+\s*:/.test(d))) segnala(f, i + 1, `stile inline con proprietà vere: ${v}`);
    }
  });
}

if (errori.length) {
  console.error(`Stile: ${errori.length} problemi\n` + errori.join('\n'));
  process.exit(1);
}
console.log('Stile: tutto conforme (scala tipografica, colori, titoli, stili inline).');
