import type { Scena, Schermata } from '../data/presentazione';

type Dispositivo = Schermata['dispositivo'];
type Riquadro = NonNullable<Schermata['riquadro']>;

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
  minimo: number;
  allinea: string;
  url: string;
  selettore?: string;
  nota?: string;
  riquadro?: Riquadro;
  larghezza: number;
  altezza: number;
  bersaglio?: HTMLElement;
  cerca: number;
}

const MISURATO = 1366;
const MINIMO_PC = 1280;
const LARGHEZZA_TELEFONO = 390;
const ALTEZZA_TELEFONO = 844;
const CORNICE = 28;
const ETICHETTA = 64;
const MARGINE_FARO = 12;
const BORDO_FARO = 20;

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
  let w = LARGHEZZA_TELEFONO;
  let h = ALTEZZA_TELEFONO;
  let scala = 1;
  let x = 0;
  let y = 0;
  if (s.dispositivo === 'pc') {
    w = Math.max(cw, s.minimo);
    scala = cw / w;
    h = ch / scala;
  } else {
    scala = Math.min(1, (cw - CORNICE * 2) / w, (ch - CORNICE * 2 - ETICHETTA) / h);
    const larga = w * scala;
    x = s.allinea === 'destra' ? cw - larga - CORNICE : s.allinea === 'sinistra' ? CORNICE : (cw - larga) / 2;
    y = (ch - ETICHETTA - h * scala) / 2 + ETICHETTA;
  }
  s.el.style.setProperty('--w', `${w}px`);
  s.el.style.setProperty('--h', `${h}px`);
  s.el.style.setProperty('--s', String(scala));
  s.el.style.setProperty('--x', `${x}px`);
  s.el.style.setProperty('--y', `${y}px`);
  s.larghezza = w;
  s.altezza = h;
  posiziona(s);
}

function rettangolo(s: Schermo) {
  if (s.bersaglio) return s.bersaglio.getBoundingClientRect();
  if (!s.riquadro) return null;
  const { x, y, w, h, basso, destra } = s.riquadro;
  const top = basso ? s.altezza - y : y;
  if (s.dispositivo !== 'pc') return new DOMRect(x, top, w, h);
  const margine = MISURATO - x - w;
  const sinistra = x + margine < MISURATO / 10 ? x : x + (s.larghezza - MISURATO) / 2;
  const fine = destra || sinistra === x ? s.larghezza - margine : sinistra + w;
  return new DOMRect(sinistra, top, fine - sinistra, h);
}

function posiziona(s: Schermo) {
  const r = rettangolo(s);
  if (!r || s.faro.hidden) return;
  const w = s.larghezza;
  const h = s.altezza;
  const x1 = Math.max(BORDO_FARO, r.left - MARGINE_FARO);
  const y1 = Math.max(BORDO_FARO, r.top - MARGINE_FARO);
  const x2 = Math.min(w - BORDO_FARO, r.right + MARGINE_FARO);
  const y2 = Math.min(h - BORDO_FARO, r.bottom + MARGINE_FARO);
  s.faro.style.width = `${Math.max(0, x2 - x1)}px`;
  s.faro.style.height = `${Math.max(0, y2 - y1)}px`;
  s.faro.style.transform = `translate(${x1}px, ${y1}px)`;
  s.faro.dataset.etichetta = y1 > 90 ? 'sopra' : h - y2 > 90 ? 'sotto' : 'dentro';
  s.faro.dataset.destra = String((x1 + x2) / 2 > w / 2);
}

function spegni(schermi: Schermo[]) {
  schermi.forEach((s) => {
    clearTimeout(s.cerca);
    s.faro.hidden = true;
  });
}

function segui(s: Schermo) {
  const fine = performance.now() + 1200;
  const passo = () => {
    posiziona(s);
    if (performance.now() < fine) requestAnimationFrame(passo);
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
    accendi(s);
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
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    accendi(s);
  };
  prova();
}

function caricato(s: Schermo) {
  delete s.el.dataset.carica;
  if (!s.url.startsWith('/')) return;
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
    minimo: MINIMO_PC,
    allinea: '',
    url: '',
    larghezza: MISURATO,
    altezza: 0,
    cerca: 0,
  };
  s.frame.addEventListener('load', () => caricato(s));
  new ResizeObserver(() => misura(s)).observe(s.vista);
  return s;
}

function apri(s: Schermo, schermata: Schermata, quanti = 1, posto = 0) {
  const { url, nome, dispositivo, evidenzia: selettore, etichetta, riquadro } = schermata;
  const interno = url.startsWith('/');
  s.el.hidden = false;
  s.sito.textContent = nome;
  s.frame.title = `${nome}, dal vivo`;
  s.el.dataset.sito = nome === 'Nuovo sito' ? 'nuovo' : interno ? 'interno' : 'esterno';
  s.selettore = selettore;
  s.nota = etichetta;
  s.riquadro = riquadro;
  s.dispositivo = dispositivo;
  s.minimo = quanti > 1 ? 0 : MINIMO_PC;
  s.allinea = quanti === 2 ? (posto === 0 ? 'destra' : 'sinistra') : '';
  s.el.dataset.dispositivo = dispositivo;
  misura(s);
  const doc = documento(s);
  const giaAperto = interno && doc && `${doc.location.pathname}${doc.location.search}` === url;
  s.url = url;
  if (giaAperto || (!interno && s.frame.dataset.url === url)) return evidenzia(s);
  const precedente = s.frame.dataset.url ?? '';
  const soloAncora = !interno && url.includes('#') && precedente.split('#')[0] === url.split('#')[0];
  s.indirizzo.textContent = interno ? `${location.host}${url}` : url.replace(/^https:\/\//, '').split(/[#?]/)[0];
  s.faro.hidden = true;
  s.bloccato.hidden = true;
  s.frame.dataset.url = url;
  s.frame.src = url;
  if (soloAncora || !interno) evidenzia(s);
  if (soloAncora) return;
  s.el.dataset.carica = '';
  window.setTimeout(() => delete s.el.dataset.carica, 4000);
}

async function leggiNuovoSito(radice: HTMLElement) {
  const doc = new DOMParser().parseFromString(await fetch('/').then((r) => r.text()), 'text/html');
  const campo = (nome: string) => trova<HTMLElement>(radice, `[data-serp-${nome}]`);
  campo('titolo').textContent = doc.title;
  campo('descrizione').textContent = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  const canonico = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (canonico) campo('url').textContent = canonico.replace(/\/$/, '');
}

function avvia(radice: HTMLElement) {
  const passi = [...radice.querySelectorAll<HTMLElement>('[data-passo]')].sort((a, b) => Number(a.dataset.passo) - Number(b.dataset.passo));
  const contenitore = trova<HTMLElement>(radice, '[data-schermi]');
  const schermi = [...radice.querySelectorAll<HTMLElement>('[data-schermo]')].map(crea);
  const numeri = [...radice.querySelectorAll<HTMLElement>('[data-numero]')];
  const barra = trova<HTMLElement>(radice, '[data-barra]');
  const avanti = [...radice.querySelectorAll<HTMLButtonElement>('[data-avanti]')];
  const indietro = [...radice.querySelectorAll<HTMLButtonElement>('[data-indietro]')];
  const scheda = trova<HTMLElement>(radice, '.pres-scheda');
  const serp = trova<HTMLElement>(radice, '[data-serp]');
  const nellaScheda = passi.filter((p) => scheda.contains(p));
  const totale = passi.length - 1;
  let attuale = -1;
  let scena: Scena | undefined;
  let nuovoLetto = false;

  const mostra = (s: Scena) => {
    scena = s;
    radice.dataset.modo = s.tipo === 'pannello' && s.pannello === 'copertina' ? 'copertina' : s.tipo;
    contenitore.hidden = s.tipo === 'pannello';
    if (s.tipo === 'pannello') return;
    contenitore.dataset.n = String(s.schermi.length);
    contenitore.dataset.dispositivo = s.schermi[0].dispositivo;
    schermi.forEach((sc, i) => {
      const schermata = s.schermi[i];
      if (schermata) apri(sc, schermata, s.schermi.length, i);
      else sc.el.hidden = true;
    });
  };

  const vai = (i: number) => {
    const n = Math.max(0, Math.min(totale, i));
    if (n === attuale) return;
    attuale = n;
    passi.forEach((p, j) => (p.hidden = j !== n));
    numeri.forEach((el) => (el.textContent = String(n)));
    barra.style.transform = `scaleX(${n / totale})`;
    indietro.forEach((b) => (b.disabled = n === 0));
    avanti.forEach((b) => (b.disabled = n === totale));
    history.replaceState(null, '', n ? `#passo-${n}` : location.pathname);
    const passo = passi[n];
    passo.querySelectorAll<HTMLButtonElement>('[data-percorso]').forEach((btn, j) => btn.setAttribute('aria-pressed', String(j === 0)));
    serp.hidden = !passo.hasAttribute('data-google');
    if (!serp.hidden && !nuovoLetto) {
      nuovoLetto = true;
      leggiNuovoSito(radice).catch(() => (nuovoLetto = false));
    }
    mostra(JSON.parse(passo.dataset.scena ?? '{}') as Scena);
  };

  const misuraScheda = () => {
    radice.style.removeProperty('--scheda-h');
    const modo = radice.dataset.modo;
    radice.dataset.modo = 'siti';
    const massima = nellaScheda.reduce((max, p) => {
      nellaScheda.forEach((q) => (q.hidden = q !== p));
      return Math.max(max, scheda.offsetHeight);
    }, 0);
    passi.forEach((p, j) => (p.hidden = j !== attuale));
    if (modo) radice.dataset.modo = modo;
    radice.style.setProperty('--scheda-h', `${massima}px`);
  };
  let larghezza = 0;
  new ResizeObserver(() => {
    if (radice.clientWidth === larghezza) return;
    larghezza = radice.clientWidth;
    misuraScheda();
  }).observe(radice);

  window.addEventListener('blur', () => {
    if (document.activeElement instanceof HTMLIFrameElement) spegni(schermi);
  });

  avanti.forEach((b) => b.addEventListener('click', () => vai(attuale + 1)));
  indietro.forEach((b) => b.addEventListener('click', () => vai(attuale - 1)));

  radice.addEventListener('click', (e) => {
    const scelta = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-percorso]');
    if (!scelta || scena?.tipo !== 'siti') return;
    scelta.parentElement?.querySelectorAll('[data-percorso]').forEach((btn) => btn.setAttribute('aria-pressed', String(btn === scelta)));
    apri(schermi[0], { ...scena.schermi[0], url: scelta.dataset.percorso ?? '/' });
  });

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') vai(attuale + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') vai(attuale - 1);
    else return;
    e.preventDefault();
  });

  const dalPasso = () => {
    const n = location.hash.match(/^#passo-(\d+)$/);
    vai(n ? Number(n[1]) : 0);
  };
  window.addEventListener('hashchange', dalPasso);
  dalPasso();
}
