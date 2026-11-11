import { MISURATO, type Scena, type Schermata } from '../data/presentazione';

type Dispositivo = Schermata['dispositivo'];
type Riquadro = NonNullable<Schermata['riquadro']>;

interface Schermo {
  el: HTMLElement;
  vista: HTMLElement;
  scala: HTMLElement;
  frame: HTMLIFrameElement;
  faro: HTMLElement;
  barrato: HTMLElement;
  tocco: HTMLElement;
  sito: HTMLElement;
  bloccato: HTMLElement;
  bloccatoLink: HTMLAnchorElement;
  dispositivo: Dispositivo;
  minimo: number;
  fissa?: number;
  allinea: string;
  nome: boolean;
  url: string;
  selettore?: string;
  riquadro?: Riquadro;
  barra?: Riquadro;
  larghezza: number;
  altezza: number;
  fattore: number;
  ox: number;
  oy: number;
  cima: number;
  bersaglio?: HTMLElement;
  cerca: number;
}

const MINIMO_PC = 1280;
const LARGHEZZA_TELEFONO = 390;
const ALTEZZA_TELEFONO = 844;
const CORNICE = 28;
const TELEFONO_SOPRA = 74;
const TELEFONO_SOTTO = 34;
const ETICHETTA = 64;
const ARIA_SOPRA = 48;
const ASSESTAMENTO = 400;
const ATTESA_MASSIMA = 15000;
const FISSI = '.main-header, .event-banner, .topbar';
const MARGINE_FARO = 12;
const BORDO_FARO = 20;

let scheda: HTMLElement | null = null;

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

function cimaScheda(s: Schermo) {
  if (!scheda?.offsetParent) return null;
  const c = scheda.getBoundingClientRect();
  const v = s.vista.getBoundingClientRect();
  return c.left >= v.right - 1 || c.right <= v.left + 1 ? null : c.top - v.top;
}

function misura(s: Schermo) {
  const cw = s.vista.clientWidth;
  const ch = s.vista.clientHeight;
  if (!cw || !ch) return;
  const sotto = cimaScheda(s);
  let w = LARGHEZZA_TELEFONO;
  let h = ALTEZZA_TELEFONO;
  let scala = 1;
  let x = 0;
  let y = 0;
  let cima = 0;
  if (s.dispositivo === 'pc') {
    w = s.fissa ?? Math.max(cw, s.minimo);
    scala = cw / w;
    h = ch / scala;
    s.larghezza = w;
    s.altezza = h;
    const r = s.riquadro && sotto !== null ? rettangolo(s) : null;
    const libero = (sotto ?? ch) / scala - BORDO_FARO;
    if (r && s.riquadro?.basso) h = (sotto ?? ch) / scala;
    else if (r && r.bottom + MARGINE_FARO > libero) {
      cima = Math.max(0, Math.min(r.bottom + MARGINE_FARO - libero, r.top - MARGINE_FARO - BORDO_FARO));
      h += cima;
      y = -cima * scala;
    }
  } else {
    const utile = Math.min(ch, sotto === null ? ch : sotto - BORDO_FARO);
    const telefono = h + TELEFONO_SOPRA + TELEFONO_SOTTO;
    const nome = s.nome ? ETICHETTA : 0;
    scala = Math.min(1, (cw - CORNICE * 2) / (w + 40), (utile - CORNICE * 2 - nome) / telefono);
    const larga = w * scala;
    x = s.allinea === 'destra' ? cw - larga - CORNICE : s.allinea === 'sinistra' ? CORNICE : (cw - larga) / 2;
    y = (utile - nome - telefono * scala) / 2 + nome + TELEFONO_SOPRA * scala;
  }
  s.el.style.setProperty('--w', `${w}px`);
  s.el.style.setProperty('--h', `${h}px`);
  s.el.style.setProperty('--s', String(scala));
  s.el.style.setProperty('--x', `${x}px`);
  s.el.style.setProperty('--y', `${y}px`);
  s.larghezza = w;
  s.altezza = h;
  s.fattore = scala;
  s.ox = x;
  s.oy = y;
  s.cima = cima;
  posiziona(s);
  barra(s);
}

function barra(s: Schermo) {
  s.barrato.hidden = !s.barra;
  if (!s.barra) return;
  const { x, y, w, h } = s.barra;
  s.barrato.style.width = `${w}px`;
  s.barrato.style.transform = `translate(${x}px, ${y + h / 2}px)`;
}

function coperta(s: Schermo) {
  if (!scheda?.offsetParent) return null;
  const c = scheda.getBoundingClientRect();
  const v = s.vista.getBoundingClientRect();
  return {
    x1: (c.left - v.left - s.ox) / s.fattore,
    x2: (c.right - v.left - s.ox) / s.fattore,
    y: (c.top - v.top - s.oy) / s.fattore,
  };
}

function libero(s: Schermo, sinistra: number, destra: number) {
  const z = coperta(s);
  const fondo = s.altezza - BORDO_FARO;
  return z && destra > z.x1 && sinistra < z.x2 ? Math.min(fondo, z.y - BORDO_FARO) : fondo;
}

function rettangolo(s: Schermo) {
  if (s.bersaglio) return s.bersaglio.getBoundingClientRect();
  if (!s.riquadro) return null;
  const { x, y, w, h, basso, destra } = s.riquadro;
  const top = basso ? s.altezza - y : y;
  if (s.dispositivo !== 'pc' || s.fissa) return new DOMRect(x, top, w, h);
  const margine = MISURATO - x - w;
  const sinistra = x + margine < MISURATO / 10 ? x : x + (s.larghezza - MISURATO) / 2;
  const fine = destra || sinistra === x ? s.larghezza - margine : sinistra + w;
  return new DOMRect(sinistra, top, fine - sinistra, h);
}

function posiziona(s: Schermo) {
  const r = rettangolo(s);
  if (!r || s.faro.hidden) return;
  const w = s.larghezza;
  const pieno = r.left <= 0 && r.right >= w;
  const x1 = pieno ? -BORDO_FARO : Math.max(BORDO_FARO, r.left - MARGINE_FARO);
  const y1 = Math.max(s.cima + BORDO_FARO, r.top - MARGINE_FARO);
  const x2 = pieno ? w + BORDO_FARO : Math.min(w - BORDO_FARO, r.right + MARGINE_FARO);
  const y2 = Math.min(libero(s, x1, x2), r.bottom + MARGINE_FARO);
  s.faro.style.width = `${Math.max(0, x2 - x1)}px`;
  s.faro.style.height = `${Math.max(0, y2 - y1)}px`;
  s.faro.style.transform = `translate(${x1}px, ${y1}px)`;
}

function spegni(schermi: Schermo[]) {
  schermi.forEach((s) => {
    clearTimeout(s.cerca);
    s.faro.hidden = true;
    s.tocco.hidden = true;
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
  s.faro.hidden = false;
  s.tocco.hidden = s.url.startsWith('/');
  posiziona(s);
  segui(s);
}

function porta(s: Schermo, doc: Document, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const testa = [...doc.querySelectorAll<HTMLElement>(FISSI)]
    .filter((f) => !f.contains(el))
    .reduce((max, f) => Math.max(max, f.getBoundingClientRect().bottom), 0);
  const fondo = libero(s, r.left, r.right);
  const spazio = fondo - testa;
  doc.documentElement.style.paddingBottom = `${Math.max(0, s.altezza - fondo)}px`;
  el.style.scrollMarginTop = `${testa + Math.max(ARIA_SOPRA, (spazio - r.height) / 2)}px`;
  el.scrollIntoView({ block: 'start', behavior: 'instant' });
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
    porta(s, doc, el);
    accendi(s);
    s.cerca = window.setTimeout(() => porta(s, doc, el), 800);
  };
  prova();
}

function pronto(s: Schermo) {
  if (!('carica' in s.el.dataset)) return;
  delete s.el.dataset.carica;
  if (!s.url.startsWith('/')) evidenzia(s);
}

function caricato(s: Schermo) {
  if (!s.url.startsWith('/')) {
    const url = s.url;
    window.setTimeout(() => s.url === url && pronto(s), ASSESTAMENTO);
    return;
  }
  pronto(s);
  const doc = documento(s);
  s.bloccato.hidden = !!doc;
  s.bloccatoLink.href = s.url;
  if (!doc) return;
  doc.defaultView?.addEventListener('scroll', () => posiziona(s), { passive: true });
  for (const tipo of ['wheel', 'touchmove']) doc.addEventListener(tipo, () => spegni([s]), { passive: true });
  evidenzia(s);
}

function crea(el: HTMLElement): Schermo {
  const s: Schermo = {
    el,
    vista: trova(el, '[data-vista]'),
    scala: trova(el, '[data-scala]'),
    frame: trova(el, '[data-frame]'),
    faro: trova(el, '[data-faro]'),
    barrato: trova(el, '[data-barrato]'),
    tocco: trova(el, '[data-tocco]'),
    sito: trova(el, '[data-sito]'),
    bloccato: trova(el, '[data-bloccato]'),
    bloccatoLink: trova(el, '[data-bloccato-link]'),
    dispositivo: 'pc',
    minimo: MINIMO_PC,
    allinea: '',
    nome: false,
    url: '',
    larghezza: MISURATO,
    altezza: 0,
    fattore: 1,
    ox: 0,
    oy: 0,
    cima: 0,
    cerca: 0,
  };
  s.frame.addEventListener('load', () => caricato(s));
  for (const tipo of ['wheel', 'pointerdown']) s.tocco.addEventListener(tipo, () => spegni([s]), { passive: true });
  new ResizeObserver(() => misura(s)).observe(s.vista);
  return s;
}

function apri(s: Schermo, schermata: Schermata, quanti = 1, posto = 0) {
  const { url, nome, dispositivo, evidenzia: selettore, riquadro, barrato, larghezza } = schermata;
  const interno = url.startsWith('/');
  s.el.hidden = false;
  s.sito.textContent = nome;
  s.frame.title = `${nome}, dal vivo`;
  s.el.dataset.sito = nome === 'Nuovo sito' ? 'nuovo' : interno ? 'interno' : 'esterno';
  s.selettore = selettore;
  s.riquadro = riquadro;
  s.barra = barrato;
  s.fissa = larghezza;
  s.nome = quanti > 1;
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
  s.faro.hidden = true;
  s.bloccato.hidden = true;
  s.frame.dataset.url = url;
  s.frame.src = url;
  if (soloAncora) return evidenzia(s);
  s.el.dataset.carica = '';
  window.setTimeout(() => s.url === url && pronto(s), ATTESA_MASSIMA);
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
  const foglio = trova<HTMLElement>(radice, '.pres-scheda');
  scheda = foglio;
  const serp = trova<HTMLElement>(radice, '[data-serp]');
  const riduci = trova<HTMLButtonElement>(radice, '[data-riduci]');
  const riapri = trova<HTMLButtonElement>(radice, '[data-riapri]');
  const nellaScheda = passi.filter((p) => foglio.contains(p));
  const totale = passi.length - 1;
  let attuale = -1;
  let scena: Scena | undefined;
  let nuovoLetto = false;

  let chiave = '';
  const mostra = (s: Scena) => {
    scena = s;
    radice.dataset.modo = s.tipo;
    const nuova = s.tipo === 'siti' || s.tipo === 'confronto' ? s.schermi.map((x) => x.url.split('#')[0]).join(' ') : '';
    if (nuova && nuova !== chiave) {
      contenitore.removeAttribute('data-entra');
      void contenitore.offsetWidth;
      contenitore.setAttribute('data-entra', '');
    }
    chiave = nuova;
    contenitore.hidden = s.tipo === 'pannello' || s.tipo === 'apertura';
    if (s.tipo === 'pannello' || s.tipo === 'apertura') return radice.removeAttribute('data-dispositivo');
    contenitore.dataset.n = String(s.schermi.length);
    radice.dataset.dispositivo = s.schermi[0].dispositivo;
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
    const dispositivo = radice.dataset.dispositivo;
    radice.dataset.modo = 'siti';
    radice.removeAttribute('data-dispositivo');
    const massima = nellaScheda.reduce((max, p) => {
      if (p.classList.contains('pres-confronto')) return max;
      nellaScheda.forEach((q) => (q.hidden = q !== p));
      return Math.max(max, foglio.offsetHeight);
    }, 0);
    passi.forEach((p, j) => (p.hidden = j !== attuale));
    if (modo) radice.dataset.modo = modo;
    if (dispositivo) radice.dataset.dispositivo = dispositivo;
    radice.style.setProperty('--scheda-h', `${massima}px`);
    schermi.forEach(misura);
  };
  let larghezza = 0;
  new ResizeObserver(() => {
    if (radice.clientWidth === larghezza) return;
    larghezza = radice.clientWidth;
    misuraScheda();
  }).observe(radice);

  let sulSito = false;
  const riprendi = () => {
    if (document.activeElement instanceof HTMLIFrameElement) radice.focus({ preventScroll: true });
  };
  schermi.forEach((s) => {
    s.vista.addEventListener('pointerenter', () => (sulSito = true));
    s.vista.addEventListener('pointerleave', () => {
      sulSito = false;
      riprendi();
    });
  });
  window.addEventListener('blur', () => {
    if (!(document.activeElement instanceof HTMLIFrameElement)) return;
    if (sulSito) spegni(schermi);
    else window.setTimeout(riprendi);
  });

  const ridotta = (si: boolean) => {
    radice.toggleAttribute('data-ridotta', si);
    (si ? riapri : riduci).focus();
    schermi.forEach(misura);
  };
  riduci.addEventListener('click', () => ridotta(true));
  riapri.addEventListener('click', () => ridotta(false));

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
