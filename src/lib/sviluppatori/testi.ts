export type Contesto = 'json' | 'js1' | 'js2' | 'jst' | 'markup' | 'attr1' | 'attr2' | 'testo';

export type Tratto = { da: number; a: number; jolly?: boolean };

export type Occorrenza = { inizio: number; fine: number; mappa: Tratto[]; contesto: Contesto };

const ENTITA: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  laquo: '«',
  raquo: '»',
  agrave: 'à',
  egrave: 'è',
  eacute: 'é',
  igrave: 'ì',
  ograve: 'ò',
  ugrave: 'ù',
  copy: '©',
  middot: '·',
  euro: '€',
  bull: '•',
  times: '×',
};

const VUOTI = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

export function normalizza(testo: string): string {
  return testo.replace(/\s+/g, ' ').trim();
}

function letture(src: string, p: number): { c: string; n: number }[] {
  const out: { c: string; n: number }[] = [];
  if (src[p] === '&') {
    const m = /^&(#x[0-9a-f]+|#\d+|[a-z]+);/i.exec(src.slice(p, p + 12));
    if (m) {
      const nome = m[1];
      const c =
        nome[0] === '#'
          ? String.fromCodePoint(nome[1] === 'x' || nome[1] === 'X' ? parseInt(nome.slice(2), 16) : Number(nome.slice(1)))
          : ENTITA[nome.toLowerCase()];
      if (c) out.push({ c, n: m[0].length });
    }
  }
  if (src[p] === '\\' && p + 1 < src.length) {
    const s = src[p + 1];
    const u = /^u([0-9a-f]{4})|^u\{([0-9a-f]+)\}|^x([0-9a-f]{2})/i.exec(src.slice(p + 1, p + 10));
    if (u) out.push({ c: String.fromCodePoint(parseInt(u[1] ?? u[2] ?? u[3], 16)), n: u[0].length + 1 });
    else out.push({ c: s === 'n' ? '\n' : s === 't' ? '\t' : s, n: 2 });
  }
  out.push({ c: src[p], n: 1 });
  return out;
}

function spazi(src: string, p: number): number {
  let q = p;
  for (;;) {
    if (q < src.length && /\s/.test(src[q])) q++;
    else if (/^(&nbsp;|&#160;|&#xa0;)/i.test(src.slice(q, q + 6))) q = src.indexOf(';', q) + 1;
    else if (/^\\(n|t|u00a0)/i.test(src.slice(q, q + 6))) q += src[q + 1] === 'u' || src[q + 1] === 'U' ? 6 : 2;
    else if (/^\{\s*(['"])\s\1\s*\}/.test(src.slice(q, q + 10))) q = src.indexOf('}', q) + 1;
    else return q;
  }
}

function espressione(src: string, p: number, astro: boolean): number {
  let q = p;
  if (src.startsWith('${', p)) q = p + 2;
  else if (astro && src[p] === '{') q = p + 1;
  else return -1;
  let profondita = 1;
  let quota = '';
  for (; q < src.length; q++) {
    const c = src[q];
    if (quota) {
      if (c === '\\') q++;
      else if (c === quota) quota = '';
    } else if (c === "'" || c === '"' || c === '`') quota = c;
    else if (c === '{') profondita++;
    else if (c === '}' && --profondita === 0) return q + 1;
  }
  return -1;
}

function confronta(src: string, p: number, unita: string[], i: number, mappa: Tratto[], astro: boolean): number {
  while (i < unita.length) {
    const u = unita[i];
    if (u === ' ') {
      const q = spazi(src, p);
      if (q > p) {
        mappa[i] = { da: p, a: q };
        p = q;
        i++;
        continue;
      }
    } else if (p < src.length) {
      const l = letture(src, p).find((x) => x.c === u);
      if (l) {
        mappa[i] = { da: p, a: p + l.n };
        p += l.n;
        i++;
        continue;
      }
    }
    const fine = espressione(src, p, astro);
    if (fine < 0) return -1;
    for (let k = 0; k <= Math.min(120, unita.length - i); k++) {
      const r = confronta(src, fine, unita, i + k, mappa, astro);
      if (r >= 0) {
        for (let j = i; j < i + k; j++) mappa[j] = { da: p, a: fine, jolly: true };
        return r;
      }
    }
    return -1;
  }
  return p;
}

function ancora(testo: string): { parola: string; indice: number } {
  let migliore = { parola: testo[0] ?? '', indice: 0 };
  for (const m of testo.matchAll(/[\p{L}\p{N}][\p{L}\p{N}_-]*/gu)) if (m[0].length > migliore.parola.length) migliore = { parola: m[0], indice: m.index };
  return migliore;
}

type Cornice =
  | { t: 'm'; d: number; radice?: boolean }
  | { t: 'e'; g: number; radice?: boolean }
  | { t: 't' }
  | { t: 's'; q: string }
  | { t: 'a'; q: string }
  | { t: 'com'; fine: string }
  | { t: 'raw'; nome: string }
  | { t: 'tag'; nome: string };

function scansiona(src: string, da: number, a: number, inizio: 'm' | 'e', jsx: boolean): Contesto | null {
  const pila: Cornice[] = [inizio === 'm' ? { t: 'm', d: 0, radice: true } : { t: 'e', g: 0, radice: true }];
  let ultimo = '(';
  let i = da;
  const chiudiSeCompleto = () => {
    const m = pila[pila.length - 1];
    if (m.t === 'm' && !m.radice && m.d <= 0) {
      pila.pop();
      ultimo = ')';
    }
  };
  while (i < a) {
    const f = pila[pila.length - 1];
    const ch = src[i];
    switch (f.t) {
      case 's':
        if (ch === '\\') i += 2;
        else {
          if (ch === f.q || ch === '\n') {
            pila.pop();
            ultimo = 'x';
          }
          i++;
        }
        break;
      case 'a':
        if (ch === f.q) pila.pop();
        i++;
        break;
      case 'com': {
        const fine = src.indexOf(f.fine, i);
        if (fine < 0 || fine + f.fine.length > a) return null;
        i = fine + f.fine.length;
        pila.pop();
        break;
      }
      case 'raw': {
        const fine = src.indexOf(`</${f.nome}`, i);
        if (fine < 0 || fine >= a) return null;
        i = fine;
        pila.pop();
        break;
      }
      case 't':
        if (ch === '\\') i += 2;
        else if (ch === '`') {
          pila.pop();
          ultimo = 'x';
          i++;
        } else if (ch === '$' && src[i + 1] === '{') {
          pila.push({ t: 'e', g: 0 });
          ultimo = '(';
          i += 2;
        } else i++;
        break;
      case 'e':
        if (ch === "'" || ch === '"') pila.push({ t: 's', q: ch });
        else if (ch === '`') pila.push({ t: 't' });
        else if (ch === '/' && src[i + 1] === '/') {
          pila.push({ t: 'com', fine: '\n' });
          break;
        } else if (ch === '/' && src[i + 1] === '*') {
          pila.push({ t: 'com', fine: '*/' });
          break;
        } else if (ch === '/' && /[(,=:[!&|?{};+\-*%~^<>]/.test(ultimo)) {
          let j = i + 1;
          let classe = false;
          for (; j < src.length && src[j] !== '\n'; j++) {
            if (src[j] === '\\') j++;
            else if (src[j] === '[') classe = true;
            else if (src[j] === ']') classe = false;
            else if (src[j] === '/' && !classe) break;
          }
          if (j >= a) return null;
          i = j + 1;
          ultimo = 'x';
          break;
        } else if (ch === '{') f.g++;
        else if (ch === '}') {
          if (f.g === 0 && !f.radice) {
            pila.pop();
            i++;
            ultimo = ')';
            chiudiSeCompleto();
            break;
          }
          f.g--;
        } else if (jsx && ch === '<' && /[A-Za-z>]/.test(src[i + 1] ?? '') && /[(,?:&|>{[=]/.test(ultimo)) {
          pila.push({ t: 'm', d: 0 });
          break;
        }
        if (!/\s/.test(ch)) ultimo = ch;
        i++;
        break;
      case 'm':
        if (src.startsWith('<!--', i)) {
          pila.push({ t: 'com', fine: '-->' });
          i += 4;
        } else if (ch === '<' && src[i + 1] === '/') {
          const fine = src.indexOf('>', i);
          i = fine < 0 ? a : fine + 1;
          if (!f.radice) {
            f.d--;
            chiudiSeCompleto();
          }
        } else if (ch === '<' && /[A-Za-z>]/.test(src[i + 1] ?? '')) {
          const m = /^<([A-Za-z][\w.:-]*)?/.exec(src.slice(i, i + 80))!;
          pila.push({ t: 'tag', nome: (m[1] ?? '').toLowerCase() });
          i += m[0].length;
        } else if (ch === '{') {
          pila.push({ t: 'e', g: 0 });
          ultimo = '(';
          i++;
        } else i++;
        break;
      case 'tag':
        if (ch === '"' || ch === "'") {
          pila.push({ t: 'a', q: ch });
          i++;
        } else if (ch === '{') {
          pila.push({ t: 'e', g: 0 });
          ultimo = '(';
          i++;
        } else if (ch === '/' && src[i + 1] === '>') {
          pila.pop();
          i += 2;
          chiudiSeCompleto();
        } else if (ch === '>') {
          pila.pop();
          i++;
          const m = pila[pila.length - 1];
          if (m.t !== 'm') break;
          if (VUOTI.has(f.nome)) chiudiSeCompleto();
          else {
            m.d++;
            if (f.nome === 'script' || f.nome === 'style') pila.push({ t: 'raw', nome: f.nome });
          }
        } else i++;
        break;
    }
  }
  const f = pila[pila.length - 1];
  if (f.t === 's') return f.q === "'" ? 'js1' : 'js2';
  if (f.t === 't') return 'jst';
  if (f.t === 'a') return f.q === '"' ? 'attr2' : 'attr1';
  if (f.t === 'm') return 'markup';
  return null;
}

export function contesto(percorso: string, src: string, pos: number): Contesto | null {
  if (/\.json$/.test(percorso)) return scansiona(src, 0, pos, 'e', false) === 'js2' ? 'json' : null;
  if (/\.(ts|mts|js|mjs|cjs)$/.test(percorso)) return scansiona(src, 0, pos, 'e', false);
  if (/\.astro$/.test(percorso)) {
    const fm = /^---\r?\n[\s\S]*?\r?\n---/.exec(src);
    const fine = fm ? fm[0].length : 0;
    if (fm && pos < fine) return scansiona(src, 4, pos, 'e', false);
    return scansiona(src, fine, pos, 'm', true);
  }
  if (/\.(html|svg|xml)$/.test(percorso)) return scansiona(src, 0, pos, 'm', false);
  return 'testo';
}

export function scappa(testo: string, c: Contesto): string {
  switch (c) {
    case 'json':
      return JSON.stringify(testo).slice(1, -1);
    case 'js1':
      return testo.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
    case 'js2':
      return testo.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    case 'jst':
      return testo.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    case 'markup':
      return testo
        .replace(/&(?=[#a-z0-9]+;)/gi, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\{/g, '&#123;')
        .replace(/\}/g, '&#125;');
    case 'attr2':
      return testo.replace(/"/g, '&quot;');
    case 'attr1':
      return testo.replace(/'/g, '&#39;');
    default:
      return testo;
  }
}

export function trova(percorso: string, src: string, cercato: string): Occorrenza[] {
  const testo = normalizza(cercato);
  if (!testo) return [];
  const unita = [...testo];
  const { parola, indice } = ancora(testo);
  const k = [...testo.slice(0, indice)].length;
  const astro = percorso.endsWith('.astro');
  const out: Occorrenza[] = [];
  let fineUltima = -1;
  for (let idx = src.indexOf(parola); idx >= 0; idx = src.indexOf(parola, idx + 1)) {
    if (idx < fineUltima) continue;
    const minimo = Math.max(fineUltima, idx - k * 6 - 40, 0);
    const prove = [idx - k];
    for (let s = idx - k - 1; s >= minimo; s--) prove.push(s);
    for (let s = idx - k + 1; s <= idx; s++) prove.push(s);
    for (const s of prove) {
      if (s < minimo) continue;
      const mappa: Tratto[] = [];
      const fine = confronta(src, s, unita, 0, mappa, astro);
      if (fine < 0 || !mappa.slice(k, k + 1).some((t) => t.da <= idx && idx < t.a + parola.length)) continue;
      const c = contesto(percorso, src, s);
      if (!c) break;
      out.push({ inizio: s, fine, mappa, contesto: c });
      fineUltima = fine;
      break;
    }
  }
  return out;
}

export class TestoCalcolato extends Error {}

export function sostituisci(src: string, occ: Occorrenza, vecchio: string, nuovo: string): string {
  const o = [...normalizza(vecchio)];
  const n = [...normalizza(nuovo)];
  let a = 0;
  while (a < o.length && a < n.length && o[a] === n[a]) a++;
  let b = 0;
  while (b < o.length - a && b < n.length - a && o[o.length - 1 - b] === n[n.length - 1 - b]) b++;
  const medio = scappa(n.slice(a, n.length - b).join(''), occ.contesto);
  const regione = occ.mappa.slice(a, o.length - b);
  const jolly = regione.find((t) => t.jolly);
  if (jolly) throw new TestoCalcolato(src.slice(jolly.da, jolly.a));
  if (!regione.length) {
    const pos = a === 0 ? occ.inizio : occ.mappa[a - 1].a;
    return src.slice(0, pos) + medio + src.slice(pos);
  }
  return src.slice(0, regione[0].da) + medio + src.slice(regione[regione.length - 1].a);
}

export function riga(src: string, pos: number): number {
  return src.slice(0, pos).split('\n').length;
}

export function estratto(src: string, occ: { inizio: number; fine: number }): string {
  const da = src.lastIndexOf('\n', occ.inizio - 1) + 1;
  const a = src.indexOf('\n', occ.fine);
  return src
    .slice(da, a < 0 ? undefined : a)
    .trim()
    .slice(0, 240);
}
