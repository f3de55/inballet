import { SITO_ATTUALE, type Scena } from '../data/presentazione';

type Sito = Extract<Scena, { tipo: 'sito' }>;
type Dispositivo = Sito['dispositivo'];
type Riquadro = NonNullable<Sito['riquadro']>;

interface Schermo {
  el: HTMLElement;
  vista: HTMLElement;
  scala: HTMLElement;
  frame: HTMLIFrameElement;
  faro: HTMLElement;
  etichetta: HTMLElement;
  sito: HTMLElement;
  indirizzo: HTMLElement;
  bloccato: HTMLElement;
  bloccatoLink: HTMLAnchorElement;
  dispositivo: Dispositivo;
  url: string;
  selettore?: string;
  nota?: string;
  riquadro?: Riquadro;
  altezza: number;
  bersaglio?: HTMLElement;
  cerca: number;
}

const LARGHEZZA = { pc: 1366, telefono: 390 };
const ALTEZZA = { pc: 800, telefono: 844 };
const CORNICE = 28;
const MARGINE_FARO = 12;
const MARGINE_SCHEDA = 24;
const ridotto = matchMedia('(prefers-reduced-motion: reduce)');
let dopoFaro = () => {};

const radice = document.querySelector<HTMLElement>('[data-pres]');
if (radice) avvia(radice);

function trova<T extends Element>(dentro: ParentNode, selettore: string): T {
  const el = dentro.querySelector<T>(selettore);
  if (!el) throw new Error(`Manca ${selettore}`);
  return el;
}

function documento(s: Schermo): Document | null {
  if (!s.url.startsWith('/')) return null;
  try {
    const doc = s.frame.contentDocument;
    return doc && doc.location.href !== 'about:blank' ? doc : null;
  } catch {
    return null;
  }
}

function misura(s: Schermo) {
  const cw = s.vista.clientWidth;
  const ch = s.vista.clientHeight;
  if (!cw || !ch) return;
  const w = LARGHEZZA[s.dispositivo];
  const h = ALTEZZA[s.dispositivo];
  const cornice = s.dispositivo === 'pc' ? 0 : CORNICE;
  const scala = Math.min((cw - cornice * 2) / w, (ch - cornice * 2) / h);
  const x = (cw - w * scala) / 2;
  const y = (ch - h * scala) / 2;
  s.scala.style.setProperty('--w', `${w}px`);
  s.scala.style.setProperty('--h', `${h}px`);
  s.scala.style.setProperty('--s', String(scala));
  s.scala.style.setProperty('--x', `${x}px`);
  s.scala.style.setProperty('--y', `${y}px`);
  s.altezza = h;
  s.el.dataset.dispositivo = s.dispositivo;
  posiziona(s);
}

function rettangolo(s: Schermo) {
  if (s.bersaglio) return s.bersaglio.getBoundingClientRect();
  if (!s.riquadro) return null;
  const { x, y, w, h, basso } = s.riquadro;
  return new DOMRect(x, basso ? s.altezza - y : y, w, h);
}

function posiziona(s: Schermo) {
  const r = rettangolo(s);
  if (!r || s.faro.hidden) return;
  s.faro.style.width = `${r.width + MARGINE_FARO * 2}px`;
  s.faro.style.height = `${r.height + MARGINE_FARO * 2}px`;
  s.faro.style.transform = `translate(${r.left - MARGINE_FARO}px, ${r.top - MARGINE_FARO}px)`;
  s.faro.dataset.sotto = String(r.top < 90);
  s.faro.dataset.destra = String(r.left + r.width / 2 > LARGHEZZA[s.dispositivo] / 2);
}

function segui(s: Schermo) {
  const fine = performance.now() + 1200;
  const passo = () => {
    posiziona(s);
    if (performance.now() < fine) requestAnimationFrame(passo);
    else dopoFaro();
  };
  requestAnimationFrame(passo);
}

function accendi(s: Schermo) {
  s.etichetta.textContent = s.nota ?? '';
  s.etichetta.hidden = !s.nota;
  s.faro.hidden = false;
  posiziona(s);
  segui(s);
}

function evidenzia(s: Schermo) {
  s.faro.hidden = true;
  s.bersaglio = undefined;
  clearTimeout(s.cerca);
  if (s.riquadro) {
    s.cerca = window.setTimeout(() => accendi(s), 400);
    return;
  }
  const doc = documento(s);
  if (!s.selettore || !doc) return;
  const selettore = s.selettore;
  let tentativi = 0;
  const prova = () => {
    const el = doc.querySelector<HTMLElement>(selettore);
    if (!el) {
      if (++tentativi < 15) s.cerca = window.setTimeout(prova, 300);
      return;
    }
    s.bersaglio = el;
    el.scrollIntoView({ block: 'center', behavior: ridotto.matches ? 'instant' : 'smooth' });
    accendi(s);
  };
  prova();
}

function caricato(s: Schermo) {
  delete s.el.dataset.carica;
  if (!s.url.startsWith('/')) return evidenzia(s);
  const doc = documento(s);
  s.bloccato.hidden = !!doc;
  s.bloccatoLink.href = s.url;
  if (!doc) return;
  s.indirizzo.textContent = `${location.host}${doc.location.pathname}${doc.location.search}`;
  doc.defaultView?.addEventListener('scroll', () => posiziona(s), { passive: true });
  evidenzia(s);
}

function crea(el: HTMLElement): Schermo {
  const s: Schermo = {
    el,
    vista: trova(el, '[data-vista]'),
    scala: trova(el, '[data-scala]'),
    frame: trova(el, '[data-frame]'),
    faro: trova(el, '[data-faro]'),
    etichetta: trova(el, '[data-faro-etichetta]'),
    sito: trova(el, '[data-sito]'),
    indirizzo: trova(el, '[data-indirizzo]'),
    bloccato: trova(el, '[data-bloccato]'),
    bloccatoLink: trova(el, '[data-bloccato-link]'),
    dispositivo: 'pc',
    url: '',
    altezza: 0,
    cerca: 0,
  };
  s.frame.addEventListener('load', () => caricato(s));
  new ResizeObserver(() => misura(s)).observe(s.vista);
  return s;
}

function apri(s: Schermo, sito: 'attuale' | 'nuovo', percorso: string, dispositivo: Dispositivo, selettore?: string, nota?: string, riquadro?: Riquadro) {
  const url = sito === 'attuale' ? `${SITO_ATTUALE}${percorso}` : percorso;
  s.sito.textContent = sito === 'attuale' ? 'Sito di oggi' : 'Nuovo sito';
  s.frame.title = sito === 'attuale' ? 'Sito di oggi, inballet.it, dal vivo' : 'Nuovo sito InBallet, dal vivo';
  s.el.dataset.sito = sito;
  s.selettore = selettore;
  s.nota = nota;
  s.riquadro = riquadro;
  s.dispositivo = dispositivo;
  misura(s);
  const doc = documento(s);
  const giaAperto = sito === 'nuovo' && doc && `${doc.location.pathname}${doc.location.search}` === percorso;
  s.url = url;
  if (giaAperto || (sito === 'attuale' && s.frame.dataset.url === url)) {
    evidenzia(s);
    return;
  }
  const precedente = s.frame.dataset.url ?? '';
  const soloAncora = sito === 'attuale' && url.includes('#') && precedente.split('#')[0] === url.split('#')[0];
  s.indirizzo.textContent = sito === 'attuale' ? url.replace(/^https:\/\//, '').split('#')[0] : `${location.host}${percorso}`;
  s.faro.hidden = true;
  s.bloccato.hidden = true;
  s.frame.dataset.url = url;
  s.frame.src = url;
  if (soloAncora) return evidenzia(s);
  s.el.dataset.carica = '';
  window.setTimeout(() => delete s.el.dataset.carica, 2500);
}

async function leggiNuovoSito(radice: HTMLElement) {
  const campo = (nome: string) => radice.querySelector<HTMLElement>(`[data-google="${nome}"]`);
  const [home, mappa] = await Promise.all([fetch('/').then((r) => r.text()), fetch('/sitemap-0.xml').then((r) => r.text())]);
  const doc = new DOMParser().parseFromString(home, 'text/html');
  const tipi = [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
    try {
      const dati = JSON.parse(s.textContent ?? '');
      return (dati['@graph'] ?? [dati]).map((x: { '@type'?: string }) => x['@type']);
    } catch {
      return [];
    }
  });
  const titolo = campo('titolo');
  const descrizione = campo('descrizione');
  const pagine = campo('pagine');
  const scheda = campo('scheda');
  if (titolo) titolo.textContent = doc.title;
  if (descrizione) descrizione.textContent = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  if (pagine) pagine.textContent = String((mappa.match(/<loc>/g) ?? []).length);
  if (scheda && !tipi.includes('DanceSchool')) scheda.textContent = 'Da verificare';
}

function sovrapposizione(x: number, y: number, w: number, h: number, ostacoli: DOMRect[]) {
  return ostacoli.reduce((totale, r) => {
    const ox = Math.max(0, Math.min(x + w, r.right + 40) - Math.max(x, r.left - 40));
    const oy = Math.max(0, Math.min(y + h, r.bottom + 40) - Math.max(y, r.top - 80));
    return totale + ox * oy;
  }, 0);
}

function avvia(radice: HTMLElement) {
  const passi = [...radice.querySelectorAll<HTMLElement>('[data-passo]')];
  const palco = radice;
  const scheda = trova<HTMLElement>(radice, '[data-scheda]');
  const contenitore = trova<HTMLElement>(radice, '[data-schermi]');
  const pannelli = [...radice.querySelectorAll<HTMLElement>('[data-pannello]')];
  const [a, b] = [...radice.querySelectorAll<HTMLElement>('[data-schermo]')].map(crea);
  const numero = trova<HTMLElement>(radice, '[data-numero]');
  const barra = trova<HTMLElement>(radice, '[data-barra]');
  const avanti = trova<HTMLButtonElement>(radice, '[data-avanti]');
  const indietro = trova<HTMLButtonElement>(radice, '[data-indietro]');
  let attuale = -1;
  let nuovoLetto = false;
  let laterale = false;

  const disponiScheda = (decidi = false) => {
    const p = palco.getBoundingClientRect();
    const ancora = palco.dataset.modo === 'sito' && p.width >= 900 && !laterale ? 'libera' : p.width >= 1100 ? 'lato' : 'basso';
    palco.dataset.ancora = ancora;
    const w = scheda.offsetWidth;
    const h = scheda.offsetHeight;
    palco.style.setProperty('--riserva', ancora === 'basso' ? `${h + MARGINE_SCHEDA}px` : '0px');
    palco.style.setProperty('--riserva-sx', ancora === 'lato' ? `${w + MARGINE_SCHEDA}px` : '0px');
    let x = ancora === 'lato' ? MARGINE_SCHEDA : (p.width - w) / 2;
    let y = ancora === 'lato' ? (p.height - h) / 2 : p.height - h - MARGINE_SCHEDA;
    if (ancora === 'libera') {
      const v = a.vista.getBoundingClientRect();
      const ostacoli = a.faro.hidden ? [] : [a.faro.getBoundingClientRect()];
      const sx = v.left + MARGINE_SCHEDA;
      const dx = v.right - w - MARGINE_SCHEDA;
      const su = v.top + MARGINE_SCHEDA;
      const giu = v.bottom - h - MARGINE_SCHEDA;
      const [bx, by, coperto] = [
        [dx, giu],
        [sx, giu],
        [dx, su],
        [sx, su],
      ]
        .map(([cx, cy]) => [cx, cy, sovrapposizione(cx, cy, w, h, ostacoli)])
        .reduce((meglio, c) => (c[2] < meglio[2] ? c : meglio));
      if (decidi && coperto > w * h * 0.08 && p.width >= 1100) {
        laterale = true;
        return disponiScheda();
      }
      x = bx - p.left;
      y = by - p.top;
    }
    scheda.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    scheda.dataset.pronta = '';
  };
  dopoFaro = () => disponiScheda(true);
  new ResizeObserver(() => disponiScheda()).observe(scheda);
  new ResizeObserver(() => disponiScheda()).observe(palco);

  const mostra = (scena: Scena) => {
    laterale = false;
    palco.dataset.modo = scena.tipo;
    pannelli.forEach((p) => (p.hidden = scena.tipo !== 'pannello' || p.dataset.pannello !== scena.pannello));
    contenitore.hidden = scena.tipo === 'pannello';
    b.el.hidden = scena.tipo !== 'confronto';
    if (scena.tipo === 'sito') apri(a, scena.sito, scena.percorso, scena.dispositivo, scena.evidenzia, scena.etichetta, scena.riquadro);
    if (scena.tipo === 'confronto') {
      apri(a, 'attuale', scena.attuale, scena.dispositivo);
      apri(b, 'nuovo', scena.nuovo, scena.dispositivo);
    }
    if (scena.tipo === 'pannello' && scena.pannello === 'google' && !nuovoLetto) {
      nuovoLetto = true;
      leggiNuovoSito(radice).catch(() => (nuovoLetto = false));
    }
    requestAnimationFrame(() => disponiScheda());
  };

  const vai = (i: number) => {
    const n = Math.max(0, Math.min(passi.length - 1, i));
    if (n === attuale) return;
    attuale = n;
    passi.forEach((p, j) => (p.hidden = j !== n));
    numero.textContent = String(n + 1);
    barra.style.transform = `scaleX(${(n + 1) / passi.length})`;
    indietro.disabled = n === 0;
    avanti.disabled = n === passi.length - 1;
    history.replaceState(null, '', `#passo-${n + 1}`);
    const passo = passi[n];
    passo.querySelectorAll<HTMLButtonElement>('[data-percorso]').forEach((btn, j) => btn.setAttribute('aria-pressed', String(j === 0)));
    mostra(JSON.parse(passo.dataset.scena ?? '{}') as Scena);
  };

  avanti.addEventListener('click', () => vai(attuale + 1));
  indietro.addEventListener('click', () => vai(attuale - 1));

  radice.addEventListener('click', (e) => {
    const scelta = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-percorso]');
    if (!scelta) return;
    scelta.parentElement?.querySelectorAll('[data-percorso]').forEach((btn) => btn.setAttribute('aria-pressed', String(btn === scelta)));
    apri(a, 'nuovo', scelta.dataset.percorso ?? '/', a.dispositivo);
  });

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') vai(attuale + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') vai(attuale - 1);
    else return;
    e.preventDefault();
  });

  const iniziale = location.hash.match(/^#passo-(\d+)$/);
  vai(iniziale ? Number(iniziale[1]) - 1 : 0);
}
