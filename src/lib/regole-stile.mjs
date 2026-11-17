const escluseCss = [/(^|\/)icons\.css$/];
const coloriGrezziOk = [/variables\.css$/];
const titoliOk = [/typography\.css$/, /\/admin\//];

const riga = (testo, indice) => testo.slice(0, indice).split('\n').length;

function problemiAstro(testo) {
  const out = [];
  testo.split('\n').forEach((r, i) => {
    if (/<style[\s>]/.test(r)) out.push([i + 1, '<style> nel componente: il CSS va in src/styles/components o src/styles/pages']);
    if (/<!--/.test(r) || /\{\s*\/\*/.test(r)) out.push([i + 1, 'commento nel markup']);
    for (const s of r.matchAll(/\sstyle=("([^"]*)"|\{`([^`]*)`\}|\{([^}]*)\})/g)) {
      const v = s[2] ?? s[3] ?? s[4] ?? '';
      if (/^[\w.]+\.style$/.test(v) || v === 'stile') continue;
      const dichiarazioni = v
        .split(';')
        .map((d) => d.trim())
        .filter(Boolean);
      if (dichiarazioni.some((d) => !/^--[\w-]+\s*:/.test(d))) out.push([i + 1, `stile inline con proprietà vere: ${v}`]);
    }
  });
  return out;
}

function problemiCodice(testo) {
  const out = [];
  testo.split('\n').forEach((r, i) => {
    if (/<p\b[^>]*\btesto-piccolo\b/.test(r))
      out.push([i + 1, 'paragrafo piccolo: ogni <p> è testo corpo, i dati brevi vanno in <small class="testo-piccolo">']);
    if (/^\s*(\/\/(?!\/ <reference)|\/\*)/.test(r)) out.push([i + 1, 'commento nel codice']);
  });
  return out;
}

function problemiCss(percorso, testo) {
  if (escluseCss.some((r) => r.test(percorso))) return [];
  const out = [];
  if (/\/\*/.test(testo)) out.push([riga(testo, testo.indexOf('/*')), 'commento nel CSS']);
  const css = testo.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const coloriOk = coloriGrezziOk.some((r) => r.test(percorso));
  css.split('\n').forEach((r, n) => {
    const fs = r.match(/font-size\s*:\s*([^;}]+)/);
    if (fs && !/^(var\(--(text|icona|glifo)-[\w-]+\)|var\(--[a-z0-9-]+-size(-[a-z]+)?\)|inherit)\s*$/.test(fs[1].trim()))
      out.push([n + 1, `font-size fuori scala: ${fs[1].trim()}`]);
    const fw = r.match(/font-weight\s*:\s*([^;}]+)/);
    if (fw && !/^(var\(--(font|[a-z]+)-[a-z]+\)|inherit)\s*$/.test(fw[1].trim())) out.push([n + 1, `font-weight senza token: ${fw[1].trim()}`]);
    if (!coloriOk && (/#[0-9a-fA-F]{3,8}\b/.test(r) || /(rgba?|hsla?)\(\s*\d/.test(r))) out.push([n + 1, `colore a mano: ${r.trim()}`]);
  });
  if (titoliOk.some((r) => r.test(percorso))) return out;
  for (const r of css.matchAll(/([^{}@;]+)\{([^{}]*)\}/g)) {
    const sel = r[1].trim();
    if (/(^|[\s,>+~])h[1-6](?![\w-])/.test(sel) && /font-(size|weight)|line-height|letter-spacing/.test(r[2])) {
      out.push([riga(css, r.index), `titolo ridefinito fuori da base/typography.css: ${sel.replace(/\s+/g, ' ')}`]);
    }
  }
  return out;
}

export function problemiStile(percorso, testo) {
  const p = percorso.replace(/\\/g, '/');
  if (!/^src\//.test(p)) return [];
  const out = [];
  if (p.endsWith('.astro')) out.push(...problemiAstro(testo), ...problemiCodice(testo));
  if (p.endsWith('.ts')) out.push(...problemiCodice(testo));
  if (p.startsWith('src/styles/') && p.endsWith('.css')) out.push(...problemiCss(p, testo));
  return out.map(([n, messaggio]) => ({ riga: n, messaggio }));
}
