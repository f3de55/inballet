import { actions } from 'astro:actions';
import { aEsadecimale, chiama, el, emetti, icona, toast } from './comune';
import { aggiornaStato, doc, partiSelettore, ritocca, valoreRitoccato, win } from './anteprima';

export type Dichiarazione = { prop: string; valore: string; importante: boolean };
export type RegolaCss = { file: string; percorso: number[]; selettore: string; contesti: string[]; dichiarazioni: Dichiarazione[]; fotogrammi?: string };
export type Corrispondenza = { regola: RegolaCss; stati: string[]; pseudo: string | null; tema: string | null; attiva: boolean };

const STATI = /:(hover|focus-visible|focus-within|focus|active|visited|target)(?![\w-])/g;
const PSEUDO = /::?(before|after|placeholder|marker|selection|backdrop|first-line|first-letter|file-selector-button|-webkit-[\w-]+|-moz-[\w-]+)(?![\w-])/;
const TEMA = /\[data-tema=['"]?(scuro|chiaro)['"]?\]/;
const PROPRIETA = [
  'color',
  'background',
  'background-color',
  'border',
  'border-radius',
  'box-shadow',
  'padding',
  'padding-block',
  'padding-inline',
  'margin',
  'margin-block',
  'margin-inline',
  'gap',
  'width',
  'max-width',
  'min-height',
  'height',
  'display',
  'grid-template-columns',
  'flex-direction',
  'align-items',
  'justify-content',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'opacity',
  'transform',
  'transition',
  'animation',
  'filter',
  'outline',
  'z-index',
  'position',
  'inset',
  'top',
  'left',
  'overflow',
];

let cache: RegolaCss[] | null = null;
let inCorso: Promise<RegolaCss[]> | null = null;

export async function tutte(): Promise<RegolaCss[]> {
  if (cache) return cache;
  inCorso ??= chiama(actions.sviluppatori.regole(), 'Stili non leggibili').then((r) => (cache = r ?? []));
  return inCorso;
}

export function sostituisciFile(file: string, regole: RegolaCss[]) {
  cache = [...(cache ?? []).filter((r) => r.file !== file), ...regole];
  aggiornaElencoToken();
  emetti('stili', file);
}

export function dimentica() {
  cache = null;
  inCorso = null;
}

export const eVariabili = (file: string) => /variables\.css$/.test(file);

export function aggiornaElencoToken() {
  let lista = document.getElementById('svToken');
  if (!lista) {
    lista = el('datalist', { id: 'svToken' });
    document.body.append(lista);
  }
  const nomi = new Set((cache ?? []).filter((r) => eVariabili(r.file)).flatMap((r) => r.dichiarazioni.map((d) => d.prop).filter((p) => p.startsWith('--'))));
  lista.replaceChildren(...[...nomi].sort().map((n) => el('option', { value: `var(${n})` })));
  const prop = document.getElementById('svProprieta') ?? document.body.appendChild(el('datalist', { id: 'svProprieta' }));
  if (!prop.childElementCount) prop.append(...PROPRIETA.map((p) => el('option', { value: p })));
}

function contestoAttivo(w: Window & typeof globalThis, contesto: string): boolean {
  const m = /^@([\w-]+)\s+(.*)$/.exec(contesto);
  if (!m) return true;
  try {
    if (m[1] === 'media') return w.matchMedia(m[2]).matches;
    if (m[1] === 'supports') return w.CSS.supports(m[2]);
  } catch {
    return false;
  }
  return true;
}

export function corrispondenti(e: Element, regole: RegolaCss[]): Corrispondenza[] {
  const w = win() as (Window & typeof globalThis) | null;
  if (!w) return [];
  const temaOra = doc()?.documentElement.dataset.tema ?? 'chiaro';
  const out: Corrispondenza[] = [];
  for (const regola of regole) {
    if (regola.fotogrammi) continue;
    for (const parte of partiSelettore(regola.selettore)) {
      const stati = [...parte.matchAll(STATI)].map((m) => m[1]);
      const pseudo = PSEUDO.exec(parte)?.[0] ?? null;
      const tema = TEMA.exec(parte)?.[1] ?? null;
      const base = parte.replace(STATI, '').replace(new RegExp(PSEUDO.source, 'g'), '').replace(TEMA, '').trim() || '*';
      let tocca = false;
      try {
        tocca = e.matches(/[>+~]$/.test(base) ? `${base} *` : base);
      } catch {
        tocca = false;
      }
      if (!tocca) continue;
      const attiva = !stati.length && (!tema || tema === temaOra) && regola.contesti.every((c) => contestoAttivo(w, c));
      out.push({ regola, stati, pseudo, tema, attiva });
      break;
    }
  }
  return out;
}

export function etichettaContesto(c: string): string {
  const max = /max-width:\s*([\d.]+)px/.exec(c);
  const min = /min-width:\s*([\d.]+)px/.exec(c);
  if (max && min) return `${min[1]}–${max[1]}px`;
  if (max) return `fino a ${max[1]}px`;
  if (min) return `da ${min[1]}px`;
  if (/prefers-reduced-motion:\s*reduce/.test(c)) return 'movimento ridotto';
  if (/prefers-reduced-motion/.test(c)) return 'con animazioni';
  if (/prefers-color-scheme:\s*dark/.test(c)) return 'sistema scuro';
  if (/hover:\s*hover/.test(c)) return 'con mouse';
  if (/hover:\s*none/.test(c)) return 'touch';
  return c.replace(/^@media\s+/, '');
}

function campoColore(input: HTMLInputElement, regola: RegolaCss): HTMLElement | null {
  const d = doc();
  const valore = () => input.value.trim();
  const hex = d?.body ? aEsadecimale(valore().replace(/!\s*important$/, ''), d) : null;
  if (!hex && !/color|background|fill|stroke|border|shadow|outline/.test(input.dataset.prop ?? '')) return null;
  const campione = el('input', {
    type: 'color',
    class: 'sv-campione',
    value: hex ?? '#000000',
    'aria-label': `Colore di ${input.dataset.prop}`,
    title: eVariabili(regola.file) ? 'Scegli il colore' : 'Fuori da variables.css usa un token: il colore scelto diventa il token più vicino',
  });
  campione.addEventListener('input', () => {
    if (eVariabili(regola.file)) input.value = campione.value;
    else input.value = tokenPiuVicino(campione.value) ?? input.value;
    input.dispatchEvent(new Event('input'));
  });
  return campione;
}

function tokenPiuVicino(hex: string): string | null {
  const d = doc();
  if (!d?.body) return null;
  const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r, g, b] = rgb(hex);
  let migliore: { nome: string; distanza: number } | null = null;
  const stile = getComputedStyle(d.documentElement);
  for (const regola of cache ?? []) {
    if (!eVariabili(regola.file)) continue;
    for (const dich of regola.dichiarazioni) {
      if (!dich.prop.startsWith('--') || /-rgb$/.test(dich.prop)) continue;
      const risolto = aEsadecimale(stile.getPropertyValue(dich.prop).trim(), d);
      if (!risolto) continue;
      const [r2, g2, b2] = rgb(risolto);
      const distanza = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
      if (!migliore || distanza < migliore.distanza) migliore = { nome: dich.prop, distanza };
    }
  }
  return migliore ? `var(${migliore.nome})` : null;
}

export async function salvaRegola(regola: RegolaCss, modifiche: { prop: string; valore: string | null }[]): Promise<boolean> {
  const nuove = await chiama(
    actions.sviluppatori.regola({ file: regola.file, percorso: regola.percorso, selettore: regola.selettore, modifiche }),
    'Stile non salvato',
  );
  if (!nuove) return false;
  sostituisciFile(regola.file, nuove);
  emetti('modificato');
  toast(`Salvato in ${regola.file}`, 'success');
  return true;
}

export function cartaRegola(
  regola: RegolaCss,
  opzioni: { etichette?: string[]; attiva?: boolean; filtro?: (d: Dichiarazione) => boolean; titolo?: string } = {},
): HTMLElement {
  const modifiche = new Map<string, string | null>();
  const salva = el('button', { type: 'button', class: 'btn btn-primary sv-salva-regola', disabled: true }, icona('fa-check'), 'Salva');
  const annulla = el('button', { type: 'button', class: 'btn btn-link', hidden: true, text: 'Annulla' });
  const segna = (prop: string, valore: string | null, originale: string | null) => {
    if (valore === originale) modifiche.delete(prop);
    else modifiche.set(prop, valore);
    ritocca(regola.file, regola.selettore, regola.contesti, prop, valore ?? originale);
    aggiornaStato();
    salva.disabled = !modifiche.size;
    annulla.hidden = !modifiche.size;
  };
  const invia = async () => {
    if (!modifiche.size) return;
    salva.disabled = true;
    const ok = await salvaRegola(
      regola,
      [...modifiche].map(([prop, valore]) => ({ prop, valore })),
    );
    if (!ok) salva.disabled = false;
  };
  salva.addEventListener('click', invia);

  const righe = el('div', { class: 'sv-dichiarazioni' });
  const riga = (d: Dichiarazione) => {
    const originale = `${d.valore}${d.importante ? ' !important' : ''}`;
    const ritoccato = valoreRitoccato(regola.selettore, regola.contesti, d.prop);
    const input = el('input', {
      class: 'sv-valore',
      value: ritoccato ?? originale,
      list: 'svToken',
      spellcheck: 'false',
      'aria-label': `${d.prop} in ${regola.selettore}`,
      'data-prop': d.prop,
    });
    const togli = el('button', { type: 'button', class: 'sv-togli', 'aria-label': `Togli ${d.prop}`, title: `Togli ${d.prop}` }, icona('fa-times'));
    const r = el('div', { class: 'sv-dichiarazione' }, el('code', { class: 'sv-prop', text: d.prop }), input, togli);
    const campione = campoColore(input, regola);
    if (campione) input.before(campione);
    input.addEventListener('input', () => segna(d.prop, input.value.trim() || null, originale));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void invia();
      }
    });
    togli.addEventListener('click', () => {
      const via = !r.classList.toggle('sv-tolta');
      segna(d.prop, via ? input.value.trim() : null, originale);
    });
    return r;
  };
  regola.dichiarazioni.filter(opzioni.filtro ?? (() => true)).forEach((d) => righe.append(riga(d)));

  const nuovaProp = el('input', { class: 'sv-valore', placeholder: 'proprietà', list: 'svProprieta', spellcheck: 'false', 'aria-label': 'Nuova proprietà' });
  const nuovoValore = el('input', {
    class: 'sv-valore',
    placeholder: 'valore',
    list: 'svToken',
    spellcheck: 'false',
    'aria-label': 'Valore della nuova proprietà',
  });
  const aggiorna = () => {
    const p = nuovaProp.value.trim();
    if (p) segna(p, nuovoValore.value.trim() || null, null);
  };
  nuovaProp.addEventListener('input', aggiorna);
  nuovoValore.addEventListener('input', aggiorna);
  nuovoValore.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void invia();
    }
  });
  annulla.addEventListener('click', () => {
    for (const [prop] of modifiche) {
      const originale = regola.dichiarazioni.find((d) => d.prop === prop);
      ritocca(regola.file, regola.selettore, regola.contesti, prop, originale ? `${originale.valore}${originale.importante ? ' !important' : ''}` : null);
    }
    emetti('stili', regola.file);
  });

  const etichette = [...(opzioni.etichette ?? []), ...regola.contesti.map(etichettaContesto)];
  return el(
    'article',
    { class: `sv-regola${opzioni.attiva === false ? ' sv-regola--spenta' : ''}` },
    el(
      'header',
      { class: 'sv-regola-testa' },
      el('code', { class: 'sv-selettore', text: opzioni.titolo ?? regola.selettore }),
      el('div', { class: 'sv-etichette' }, ...etichette.map((t) => el('span', { class: 'sv-etichetta', text: t }))),
      el('button', { type: 'button', class: 'sv-file-link', 'data-apri-file': regola.file, text: regola.file.replace(/^src\/styles\//, '') }),
    ),
    righe,
    el('div', { class: 'sv-dichiarazione sv-dichiarazione--nuova' }, nuovaProp, nuovoValore),
    el('div', { class: 'sv-regola-piede' }, annulla, salva),
  );
}

export async function nuovaRegola(file: string, selettore: string, contesti: string[], prop: string, valore: string): Promise<boolean> {
  const nuove = await chiama(actions.sviluppatori.nuovaRegola({ file, selettore, contesti, dichiarazioni: [{ prop, valore }] }), 'Regola non creata');
  if (!nuove) return false;
  ritocca(file, selettore, contesti, prop, valore);
  sostituisciFile(file, nuove);
  emetti('modificato');
  toast(`Regola aggiunta in ${file}`, 'success');
  return true;
}
