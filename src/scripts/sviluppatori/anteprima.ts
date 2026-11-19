import { $, emetti, normalizza, toast } from './comune';
import type { RegolaCss } from './regole';

type Ritocco = { file: string; selettore: string; contesti: string[]; props: Map<string, string | null> };
type RitoccoTesto = { file: string; vecchio: string; nuovo: string; attributo?: string };
type RitoccoImmagine = { file: string; radice: string; url: string };
type Salvati = { css: [string, Omit<Ritocco, 'props'> & { props: [string, string | null][] }][]; testi: RitoccoTesto[]; immagini: RitoccoImmagine[] };

const iframe = $<HTMLIFrameElement>('svAnteprima');
const cornice = $('svCornice');
const scena = $('svScena');
const sopra = $('svSopra');
const scelto = $('svScelto');
const sceltoNome = $('svSceltoNome');
const etichetta = $('svPercorso');

const ritocchi = new Map<string, Ritocco>();
const ritocchiTesto: RitoccoTesto[] = [];
const ritocchiImmagine: RitoccoImmagine[] = [];
const CHIAVE_RITOCCHI = 'sv-ritocchi';
const alCaricamento = new Set<() => void>();
const allaScelta = new Set<(e: Element | null) => void>();
const aiTasti = new Set<(e: KeyboardEvent) => void>();

let larghezza = 0;
let scala = 1;
let percorso = '/';
let tema: 'chiaro' | 'scuro' = 'chiaro';
let modo: 'modifica' | 'naviga' = 'modifica';
let elementoSopra: Element | null = null;
let elementoScelto: Element | null = null;
let statoSimulato: { stato: string; regole: RegolaCss[] } | null = null;
let fedele = true;

export const doc = () => iframe.contentDocument;
export const win = () => iframe.contentWindow;
export const elementoAttuale = () => elementoScelto;
export const temaAttuale = () => tema;
export const larghezzaAttuale = () => larghezza || Math.round(scena.clientWidth);
export const percorsoAttuale = () => {
  const w = win();
  try {
    return w?.location.protocol.startsWith('http') ? w.location.pathname + w.location.search : percorso;
  } catch {
    return '/';
  }
};
export const rettangoloScelto = () => (scelto.hidden ? null : scelto.getBoundingClientRect());

function mostraPercorso(p: string) {
  percorso = p;
  etichetta.textContent = p;
}

export function onCarica(fn: () => void) {
  alCaricamento.add(fn);
}

export function onSeleziona(fn: (e: Element | null) => void) {
  allaScelta.add(fn);
}

export function onTasto(fn: (e: KeyboardEvent) => void) {
  aiTasti.add(fn);
}

function nomeElemento(e: Element): string {
  const classi = [...e.classList].filter((c) => !c.startsWith('sv-')).slice(0, 2);
  return `${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ''}${classi.map((c) => `.${c}`).join('')}`;
}
export { nomeElemento };

function posiziona(riquadro: HTMLElement, e: Element | null) {
  if (!e || !e.isConnected) {
    riquadro.hidden = true;
    return;
  }
  const r = e.getBoundingClientRect();
  riquadro.hidden = false;
  riquadro.style.transform = `translate(${r.left * scala}px, ${r.top * scala}px)`;
  riquadro.style.width = `${Math.max(2, r.width * scala)}px`;
  riquadro.style.height = `${Math.max(2, r.height * scala)}px`;
}

function aggiornaRiquadri() {
  posiziona(sopra, modo === 'modifica' && elementoSopra !== elementoScelto ? elementoSopra : null);
  posiziona(scelto, elementoScelto);
}

export function dimensiona() {
  const stile = getComputedStyle(scena);
  const orizzontale = parseFloat(stile.paddingLeft) + parseFloat(stile.paddingRight);
  const verticale = parseFloat(stile.paddingTop) + parseFloat(stile.paddingBottom);
  const disponibile = scena.clientWidth - orizzontale;
  const larga = larghezza || disponibile;
  scala = Math.min(1, disponibile / larga);
  const altezza = Math.max(400, (scena.clientHeight - verticale) / scala);
  cornice.style.width = `${larga * scala}px`;
  cornice.style.height = `${altezza * scala}px`;
  iframe.style.width = `${larga}px`;
  iframe.style.height = `${altezza}px`;
  iframe.style.transform = `scale(${scala})`;
  aggiornaRiquadri();
  emetti('dimensioni');
}

export function seleziona(e: Element | null) {
  elementoScelto = e;
  sceltoNome.textContent = e ? nomeElemento(e) : '';
  aggiornaRiquadri();
  if (statoSimulato) applicaStato();
  allaScelta.forEach((fn) => fn(e));
}

export function vai(percorso: string) {
  let p = percorso.trim() || '/';
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.startsWith('/area-sviluppatori')) p = '/';
  mostraPercorso(p);
  seleziona(null);
  iframe.src = p;
}

export function ricarica() {
  const p = percorsoAttuale();
  seleziona(null);
  iframe.src = 'about:blank';
  requestAnimationFrame(() => (iframe.src = p));
}

export function impostaLarghezza(px: number, dispositivo: string) {
  larghezza = px;
  scena.dataset.dispositivo = dispositivo;
  dimensiona();
}

export function impostaTema(t: 'chiaro' | 'scuro') {
  tema = t;
  const d = doc();
  if (d?.documentElement) d.documentElement.dataset.tema = t;
  requestAnimationFrame(aggiornaRiquadri);
}

export function impostaModo(m: 'modifica' | 'naviga') {
  modo = m;
  elementoSopra = null;
  aggiornaRiquadri();
}

const pulisci = (s: string) => s.replace(/\s+/g, '').toLowerCase();
const comeIntervallo = (s: string) =>
  pulisci(s)
    .replace(/\(max-width:([^)]+)\)/g, '(width<=$1)')
    .replace(/\(min-width:([^)]+)\)/g, '(width>=$1)');

function canonico(selettore: string): string {
  const w = win() as (Window & typeof globalThis) | null;
  if (!w) return selettore;
  try {
    const foglio = new w.CSSStyleSheet();
    foglio.replaceSync(`${selettore}{}`);
    return (foglio.cssRules[0] as CSSStyleRule).selectorText;
  } catch {
    return selettore;
  }
}

function partiSelettore(s: string): string[] {
  const out: string[] = [];
  let profondita = 0;
  let attuale = '';
  for (const c of s) {
    if (c === '(' || c === '[') profondita++;
    if (c === ')' || c === ']') profondita--;
    if (c === ',' && profondita === 0) {
      out.push(attuale.trim());
      attuale = '';
    } else attuale += c;
  }
  out.push(attuale.trim());
  return out;
}
export { partiSelettore };

function regoleNelDocumento(selettore: string, contesti: string[]): CSSStyleRule[] {
  const d = doc();
  if (!d) return [];
  const cercato = canonico(selettore);
  const condizioni = contesti.map(comeIntervallo);
  const out: CSSStyleRule[] = [];
  const visita = (lista: CSSRuleList, attuali: string[]) => {
    for (const r of [...lista]) {
      if (r instanceof (win() as Window & typeof globalThis).CSSStyleRule) {
        if (attuali.length === condizioni.length && attuali.every((c, i) => c === condizioni[i]) && partiSelettore(r.selectorText).includes(cercato))
          out.push(r);
      } else if ('cssRules' in r && !(r instanceof (win() as Window & typeof globalThis).CSSKeyframesRule)) {
        const g = r as CSSGroupingRule & { conditionText?: string; name?: string };
        const tipo = r.constructor.name.replace(/^CSS|Rule$/g, '').toLowerCase();
        const testo = g.conditionText ?? (g as unknown as { media?: MediaList }).media?.mediaText ?? g.name ?? '';
        visita(g.cssRules, [...attuali, comeIntervallo(`@${tipo === 'media' ? 'media' : tipo} ${testo}`)]);
      }
    }
  };
  for (const foglio of [...d.styleSheets]) {
    try {
      visita(foglio.cssRules, []);
    } catch {
      continue;
    }
  }
  return out;
}

function avvolgi(contesti: string[], corpo: string): string {
  return contesti.reduceRight((dentro, c) => `${c}{${dentro}}`, corpo);
}

function iniettaRitocco(chiave: string, r: Ritocco) {
  const d = doc();
  if (!d) return;
  const regole = regoleNelDocumento(r.selettore, r.contesti);
  const id = `sv-ritocco-${[...chiave].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36)}`;
  d.getElementById(id)?.remove();
  if (regole.length) {
    for (const regola of regole) {
      for (const [prop, valore] of r.props) {
        if (valore === null) regola.style.removeProperty(prop);
        else {
          const importante = /!\s*important\s*$/i.test(valore);
          regola.style.setProperty(prop, valore.replace(/!\s*important\s*$/i, '').trim(), importante ? 'important' : '');
        }
      }
    }
    return;
  }
  const corpo = [...r.props].filter(([, v]) => v !== null).map(([p, v]) => `${p}:${v}`);
  if (!corpo.length) return;
  const stile = d.createElement('style');
  stile.id = id;
  stile.textContent = avvolgi(r.contesti, `${r.selettore}{${corpo.join(';')}}`);
  d.body.append(stile);
}

function salva() {
  const dati: Salvati = {
    css: [...ritocchi].map(([k, r]) => [k, { ...r, props: [...r.props] }]),
    testi: ritocchiTesto,
    immagini: ritocchiImmagine,
  };
  try {
    sessionStorage.setItem(CHIAVE_RITOCCHI, JSON.stringify(dati));
  } catch {
    return;
  }
}

function ripristina() {
  try {
    const dati = JSON.parse(sessionStorage.getItem(CHIAVE_RITOCCHI) ?? 'null') as Salvati | null;
    if (!dati) return;
    for (const [k, r] of dati.css) ritocchi.set(k, { ...r, props: new Map(r.props) });
    ritocchiTesto.push(...dati.testi);
    ritocchiImmagine.push(...dati.immagini);
  } catch {
    return;
  }
}

export function impostaModalita(modalita: string) {
  fedele = modalita === 'locale';
}

export function avvisaAnteprima(testo: string) {
  if (fedele) toast(testo, 'success');
  else toast(`${testo}. L’anteprima mostra il sito pubblicato: questa modifica si vedrà dopo «Pubblica».`, 'warning');
}

export const radiceImmagine = (indirizzo: string) => {
  const url = new URL(indirizzo, location.origin);
  const reale = url.pathname === '/_image' ? new URL(url.searchParams.get('href') ?? '', location.origin).pathname : url.pathname;
  return decodeURIComponent(reale.split('/').pop() ?? '')
    .replace(/\.[^.]+$/, '')
    .replace(/\.[\w-]{6,12}$/, '');
};

function sostituisciImmagini(r: RitoccoImmagine) {
  const d = doc();
  if (!d?.body) return;
  const stessa = (u: string) => Boolean(u) && !u.startsWith('blob:') && !u.includes('/area-sviluppatori/') && radiceImmagine(u) === r.radice;
  d.querySelectorAll('img').forEach((img) => {
    if (!stessa(img.currentSrc || img.src)) return;
    img.removeAttribute('srcset');
    img
      .closest('picture')
      ?.querySelectorAll('source')
      .forEach((s) => s.remove());
    img.src = r.url;
  });
  d.querySelectorAll<HTMLElement>('[style*="url("]').forEach((e) => {
    const stile = e.getAttribute('style') ?? '';
    const nuovo = stile.replace(/url\((['"]?)([^'")]+)\1\)/g, (tutto, _v, u: string) => (stessa(u) ? `url("${r.url}")` : tutto));
    if (nuovo !== stile) e.setAttribute('style', nuovo);
  });
}

export function ritoccaImmagine(file: string) {
  const r = { file, radice: radiceImmagine(`/${file}`), url: `/area-sviluppatori/file?p=${encodeURIComponent(file)}&v=${Date.now()}` };
  const i = ritocchiImmagine.findIndex((x) => x.file === file);
  if (i >= 0) ritocchiImmagine.splice(i, 1);
  ritocchiImmagine.push(r);
  salva();
  sostituisciImmagini(r);
  requestAnimationFrame(aggiornaRiquadri);
}

export function ritocca(file: string, selettore: string, contesti: string[], prop: string, valore: string | null) {
  const chiave = `${contesti.join('|')}§${selettore}`;
  const r = ritocchi.get(chiave) ?? { file, selettore, contesti, props: new Map() };
  r.props.set(prop, valore);
  ritocchi.set(chiave, r);
  salva();
  iniettaRitocco(chiave, r);
  requestAnimationFrame(aggiornaRiquadri);
}

export function valoreRitoccato(selettore: string, contesti: string[], prop: string): string | null | undefined {
  return ritocchi.get(`${contesti.join('|')}§${selettore}`)?.props.get(prop);
}

function sostituisciNodi(r: RitoccoTesto) {
  const d = doc();
  if (!d?.body) return;
  if (r.attributo) {
    d.querySelectorAll(`[${r.attributo}]`).forEach((e) => {
      if (normalizza(e.getAttribute(r.attributo!) ?? '') === r.vecchio) e.setAttribute(r.attributo!, r.nuovo);
    });
    if (r.attributo === 'title' && normalizza(d.title) === r.vecchio) d.title = r.nuovo;
    return;
  }
  const giro = d.createTreeWalker(d.documentElement, NodeFilter.SHOW_TEXT);
  for (let n = giro.nextNode() as Text | null; n; n = giro.nextNode() as Text | null) {
    if (normalizza(n.data) === r.vecchio) n.data = n.data.replace(/^(\s*)[\s\S]*?(\s*)$/, `$1${r.nuovo}$2`);
  }
}

export function ritoccaTesto(file: string, vecchio: string, nuovo: string, attributo?: string) {
  const r = { file, vecchio: normalizza(vecchio), nuovo: normalizza(nuovo), attributo };
  ritocchiTesto.push(r);
  salva();
  sostituisciNodi(r);
  requestAnimationFrame(aggiornaRiquadri);
}

export function dimenticaFile(file: string) {
  for (const [k, r] of ritocchi) if (r.file === file) ritocchi.delete(k);
  for (let i = ritocchiTesto.length - 1; i >= 0; i--) if (ritocchiTesto[i].file === file) ritocchiTesto.splice(i, 1);
  for (let i = ritocchiImmagine.length - 1; i >= 0; i--) if (ritocchiImmagine[i].file === file) ritocchiImmagine.splice(i, 1);
  salva();
}

export function dimenticaTutto() {
  ritocchi.clear();
  ritocchiTesto.length = 0;
  ritocchiImmagine.length = 0;
  salva();
}

function dichiarazioniCon(r: RegolaCss): string {
  return r.dichiarazioni
    .map((d) => {
      const v = valoreRitoccato(r.selettore, r.contesti, d.prop);
      if (v === null) return '';
      return `${d.prop}:${v ?? d.valore}${d.importante && v === undefined ? ' !important' : ''}`;
    })
    .filter(Boolean)
    .join(';');
}

function applicaStato() {
  const d = doc();
  if (!d?.body) return;
  d.getElementById('sv-stato')?.remove();
  d.querySelectorAll('[data-sv-stato]').forEach((e) => e.removeAttribute('data-sv-stato'));
  if (!statoSimulato || !elementoScelto) return;
  const { stato, regole } = statoSimulato;
  const pseudo = new RegExp(stato === 'focus' ? ':focus(?:-visible|-within)?(?![\\w-])' : `:${stato}(?![\\w-])`, 'g');
  const testo = regole
    .filter((r) => !r.fotogrammi && r.selettore.match(pseudo))
    .map((r) => avvolgi(r.contesti, `${r.selettore.replace(pseudo, '[data-sv-stato]')}{${dichiarazioniCon(r)}}`))
    .join('\n');
  const stile = d.createElement('style');
  stile.id = 'sv-stato';
  stile.textContent = testo;
  d.body.append(stile);
  for (let e: Element | null = elementoScelto; e; e = e.parentElement) e.setAttribute('data-sv-stato', '');
  requestAnimationFrame(aggiornaRiquadri);
}

export function simulaStato(stato: string | null, regole: RegolaCss[]) {
  statoSimulato = stato ? { stato, regole } : null;
  applicaStato();
}

export function aggiornaStato() {
  if (statoSimulato) applicaStato();
}

function aggancia() {
  const w = win() as (Window & typeof globalThis) | null;
  const d = doc();
  if (!w || !d) return;
  d.documentElement.dataset.tema = tema;
  for (const [k, r] of ritocchi) iniettaRitocco(k, r);
  ritocchiTesto.forEach(sostituisciNodi);
  ritocchiImmagine.forEach(sostituisciImmagini);
  const blocca = (e: Event) => {
    if (modo !== 'modifica') return;
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  for (const tipo of ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'dblclick', 'auxclick', 'submit', 'contextmenu'])
    w.addEventListener(tipo, blocca, true);
  w.addEventListener(
    'click',
    (e) => {
      if (modo !== 'modifica') return;
      blocca(e);
      seleziona(e.target instanceof w.Element ? e.target : null);
    },
    true,
  );
  w.addEventListener(
    'mouseover',
    (e) => {
      elementoSopra = e.target instanceof w.Element ? e.target : null;
      aggiornaRiquadri();
    },
    true,
  );
  d.documentElement.addEventListener('mouseleave', () => {
    elementoSopra = null;
    aggiornaRiquadri();
  });
  w.addEventListener('scroll', aggiornaRiquadri, true);
  w.addEventListener('resize', aggiornaRiquadri);
  w.addEventListener('keydown', (e) => aiTasti.forEach((fn) => fn(e)));
  new ResizeObserver(aggiornaRiquadri).observe(d.documentElement);
}

iframe.addEventListener('load', () => {
  const percorso = percorsoAttuale();
  if (percorso.startsWith('/area-sviluppatori')) {
    vai('/');
    return;
  }
  mostraPercorso(percorso);
  elementoSopra = null;
  elementoScelto = null;
  aggancia();
  aggiornaRiquadri();
  alCaricamento.forEach((fn) => fn());
  allaScelta.forEach((fn) => fn(null));
});

new ResizeObserver(dimensiona).observe(scena);
ripristina();
