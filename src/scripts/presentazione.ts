import type { Scena, Schermata } from '../data/presentazione';

type Dispositivo = Schermata['dispositivo'];
type Riquadro = NonNullable<Schermata['barrato']>;

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
  frase?: [string, string];
  fermo: boolean;
  barra?: Riquadro;
  snippet?: Schermata['snippet'];
  serp: HTMLElement | null;
  larghezza: number;
  altezza: number;
  fattore: number;
  ox: number;
  oy: number;
  bersaglio?: () => DOMRect;
  radici: Element[];
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
const ASSESTAMENTO = 900;
const ATTESA_MASSIMA = 15000;
const FISSI = '.main-header, .event-banner, .topbar, .navbar-fixed-top';
const MARGINE_FARO = 12;
const BORDO_FARO = 20;
const DISTANZA_NOTA = 24;
const BORDO_NOTA = 16;

let ostacolo: HTMLElement | null = null;
let collocaNota: () => void = () => {};

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

function coperta(s: Schermo) {
  if (!ostacolo?.offsetParent) return null;
  const c = ostacolo.getBoundingClientRect();
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
    w = s.fissa ?? Math.max(cw, s.minimo);
    scala = cw / w;
    h = ch / scala;
  } else {
    const nav = ostacolo?.offsetParent ? ostacolo.getBoundingClientRect().top - s.vista.getBoundingClientRect().top : ch;
    const utile = Math.min(ch, nav);
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
  posiziona(s);
  barra(s);
}

function barra(s: Schermo) {
  if (s.serp && s.snippet) s.serp.style.transform = `translate(${s.snippet.x}px, ${s.snippet.y}px)`;
  s.barrato.hidden = !s.barra;
  if (!s.barra) return;
  const { x, y, w, h } = s.barra;
  s.barrato.style.width = `${w}px`;
  s.barrato.style.transform = `translate(${x}px, ${y + h / 2}px)`;
}

function posiziona(s: Schermo) {
  const r = s.bersaglio?.();
  if (!r || s.faro.hidden) return;
  const w = s.larghezza;
  const pieno = r.left <= 1 && r.right >= w - 1;
  const x1 = pieno ? -BORDO_FARO : Math.max(BORDO_FARO, r.left - MARGINE_FARO);
  const y1 = Math.max(BORDO_FARO, r.top - MARGINE_FARO);
  const x2 = pieno ? w + BORDO_FARO : Math.min(w - BORDO_FARO, r.right + MARGINE_FARO);
  const y2 = Math.min(libero(s, x1, x2), r.bottom + MARGINE_FARO);
  s.faro.style.width = `${Math.max(0, x2 - x1)}px`;
  s.faro.style.height = `${Math.max(0, y2 - y1)}px`;
  s.faro.style.transform = `translate(${x1}px, ${y1}px)`;
  collocaNota();
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

function mostra(s: Schermo) {
  delete s.el.dataset.carica;
  collocaNota();
}

function accendi(s: Schermo) {
  s.faro.hidden = false;
  s.tocco.hidden = s.url.startsWith('/');
  mostra(s);
  posiziona(s);
  segui(s);
}

function intervallo(el: Element, da: string, a: string) {
  const testi: Text[] = [];
  const giro = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (giro.nextNode()) testi.push(giro.currentNode as Text);
  const tutto = testi.map((t) => t.data).join('');
  const inizio = tutto.indexOf(da);
  const fine = tutto.indexOf(a, inizio) + a.length;
  if (inizio < 0 || fine < a.length) return null;
  const range = el.ownerDocument.createRange();
  let visti = 0;
  for (const t of testi) {
    const dopo = visti + t.data.length;
    if (inizio >= visti && inizio <= dopo) range.setStart(t, inizio - visti);
    if (fine >= visti && fine <= dopo) {
      range.setEnd(t, fine - visti);
      break;
    }
    visti = dopo;
  }
  return range;
}

function bersaglio(doc: Document, s: Schermo): (() => DOMRect) | null {
  if (!s.selettore) return null;
  const elementi = [...doc.querySelectorAll<HTMLElement>(s.selettore)];
  if (!elementi.length) return null;
  s.radici = elementi;
  if (s.frase) {
    const range = intervallo(elementi[0], ...s.frase);
    return range ? () => range.getBoundingClientRect() : null;
  }
  return () => {
    const r = elementi.map((el) => el.getBoundingClientRect());
    const left = Math.min(...r.map((x) => x.left));
    const top = Math.min(...r.map((x) => x.top));
    return new DOMRect(left, top, Math.max(...r.map((x) => x.right)) - left, Math.max(...r.map((x) => x.bottom)) - top);
  };
}

function porta(s: Schermo, doc: Document) {
  const r = s.bersaglio?.();
  const vista = doc.defaultView;
  if (!r || !vista) return;
  if (s.fermo) return vista.scrollTo({ top: 0, behavior: 'instant' });
  const testa = [...doc.querySelectorAll<HTMLElement>(FISSI)]
    .filter((f) => !s.radici.some((el) => f.contains(el)))
    .reduce((max, f) => Math.max(max, f.getBoundingClientRect().bottom), 0);
  const fondo = libero(s, r.left, r.right);
  doc.documentElement.style.paddingBottom = `${Math.max(0, s.altezza - fondo)}px`;
  const sopra = testa + Math.max(ARIA_SOPRA, (fondo - testa - r.height) / 2);
  vista.scrollTo({ top: vista.scrollY + r.top - sopra, behavior: 'instant' });
}

function evidenzia(s: Schermo) {
  s.faro.hidden = true;
  s.bersaglio = undefined;
  clearTimeout(s.cerca);
  const doc = documento(s);
  const attesa = 'carica' in s.el.dataset ? ASSESTAMENTO : 0;
  if (!s.selettore || !doc) {
    s.cerca = window.setTimeout(() => mostra(s), attesa);
    return;
  }
  let tentativi = 0;
  const prova = () => {
    const trovato = bersaglio(doc, s);
    if (!trovato) {
      if (++tentativi < 15) s.cerca = window.setTimeout(prova, 300);
      else mostra(s);
      return;
    }
    s.bersaglio = trovato;
    porta(s, doc);
    s.cerca = window.setTimeout(() => {
      porta(s, doc);
      accendi(s);
    }, attesa);
  };
  prova();
}

function vuoto(s: Schermo) {
  try {
    return s.frame.contentWindow?.location.href === 'about:blank';
  } catch {
    return false;
  }
}

function caricato(s: Schermo) {
  if (vuoto(s)) return;
  if (!s.url.startsWith('/')) {
    const url = s.url;
    window.setTimeout(() => s.url === url && mostra(s), ASSESTAMENTO);
    return;
  }
  const doc = documento(s);
  s.bloccato.hidden = !!doc;
  s.bloccatoLink.href = s.url;
  if (!doc) return mostra(s);
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
    serp: el.querySelector<HTMLElement>('[data-serp]'),
    dispositivo: 'pc',
    minimo: MINIMO_PC,
    allinea: '',
    nome: false,
    fermo: false,
    url: '',
    larghezza: MINIMO_PC,
    altezza: 0,
    fattore: 1,
    ox: 0,
    oy: 0,
    radici: [],
    cerca: 0,
  };
  s.frame.addEventListener('load', () => caricato(s));
  for (const tipo of ['wheel', 'pointerdown']) s.tocco.addEventListener(tipo, () => spegni([s]), { passive: true });
  new ResizeObserver(() => misura(s)).observe(s.vista);
  return s;
}

function apri(s: Schermo, schermata: Schermata, quanti = 1, posto = 0) {
  const { url, nome, dispositivo, evidenzia: selettore, frase, fermo, barrato, snippet, larghezza } = schermata;
  const interno = url.startsWith('/');
  s.el.hidden = false;
  s.sito.textContent = nome;
  s.frame.title = `${nome}, dal vivo`;
  s.el.dataset.sito = nome === 'Nuovo sito' ? 'nuovo' : 'oggi';
  s.selettore = selettore;
  s.frase = frase;
  s.fermo = !!fermo;
  s.barra = barrato;
  s.snippet = snippet;
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
  s.faro.hidden = true;
  s.bersaglio = undefined;
  s.bloccato.hidden = true;
  s.frame.dataset.url = url;
  s.el.dataset.carica = '';
  s.frame.src = url;
  window.setTimeout(() => s.url === url && mostra(s), ATTESA_MASSIMA);
}

async function leggiNuovoSito(radice: HTMLElement) {
  const doc = new DOMParser().parseFromString(await fetch('/').then((r) => r.text()), 'text/html');
  const campo = (nome: string) => trova<HTMLElement>(radice, `[data-serp-${nome}]`);
  campo('titolo').textContent = doc.title;
  campo('descrizione').textContent = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  const canonico = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (canonico) campo('url').textContent = canonico.replace(/\/$/, '');
}

function aggancio(schermi: Schermo[]): [DOMRect | null, boolean] {
  const s =
    schermi.find((x) => !x.el.hidden && !x.faro.hidden) ?? (schermi[0].dispositivo === 'telefono' ? schermi.filter((x) => !x.el.hidden).at(-1) : undefined);
  if (!s) return [null, false];
  const faro = s.faro.hidden ? null : s.faro.getBoundingClientRect();
  if (s.dispositivo === 'pc') return [faro, false];
  const telefono = s.scala.getBoundingClientRect();
  return [new DOMRect(telefono.left, faro?.top ?? telefono.top, telefono.width, faro?.height ?? telefono.height), true];
}

function colloca(nota: HTMLElement, palco: HTMLElement, [a, aiLati]: [DOMRect | null, boolean]) {
  const p = palco.getBoundingClientRect();
  const n = nota.getBoundingClientRect();
  const fine = (ostacolo?.offsetParent ? ostacolo.getBoundingClientRect().top : p.bottom) - p.top - BORDO_NOTA;
  if (!a) {
    nota.dataset.posto = 'angolo';
    nota.style.transform = `translate(${BORDO_NOTA}px, ${fine - n.height}px)`;
    return;
  }
  const r = new DOMRect(a.left - p.left, a.top - p.top, a.width, a.height);
  const entro = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const x = entro(r.left, BORDO_NOTA, p.width - n.width - BORDO_NOTA);
  const y = entro(r.top, BORDO_NOTA, fine - n.height);
  const posti: [string, number, number, boolean][] = [
    ['sotto', x, r.bottom + DISTANZA_NOTA, r.bottom + DISTANZA_NOTA + n.height <= fine],
    ['sopra', x, r.top - DISTANZA_NOTA - n.height, r.top - DISTANZA_NOTA - n.height >= BORDO_NOTA],
    ['destra', r.right + DISTANZA_NOTA, y, r.right + DISTANZA_NOTA + n.width <= p.width - BORDO_NOTA],
    ['sinistra', r.left - DISTANZA_NOTA - n.width, y, r.left - DISTANZA_NOTA - n.width >= BORDO_NOTA],
  ];
  if (aiLati) posti.push(...posti.splice(0, 2));
  const [posto, px, py] = posti.find((q) => q[3]) ?? [
    'dentro',
    r.right - n.width - DISTANZA_NOTA,
    entro(r.top + DISTANZA_NOTA, BORDO_NOTA, fine - n.height),
    true,
  ];
  nota.dataset.posto = posto;
  nota.style.transform = `translate(${Math.round(entro(px, BORDO_NOTA, p.width - n.width - BORDO_NOTA))}px, ${Math.round(py)}px)`;
}

function avvia(radice: HTMLElement) {
  const passi = [...radice.querySelectorAll<HTMLElement>('[data-passo]')].sort((a, b) => Number(a.dataset.passo) - Number(b.dataset.passo));
  const contenitore = trova<HTMLElement>(radice, '[data-schermi]');
  const schermi = [...radice.querySelectorAll<HTMLElement>('[data-schermo]')].map(crea);
  const numeri = [...radice.querySelectorAll<HTMLElement>('[data-numero]')];
  const avanti = [...radice.querySelectorAll<HTMLButtonElement>('[data-avanti]')];
  const indietro = [...radice.querySelectorAll<HTMLButtonElement>('[data-indietro]')];
  const nota = trova<HTMLElement>(radice, '[data-nota]');
  const serp = trova<HTMLElement>(radice, '[data-serp]');
  ostacolo = trova<HTMLElement>(radice, '.pres-navigazione');
  const totale = passi.length - 1;
  let attuale = -1;
  let scena: Scena | undefined;
  let nuovoLetto = false;

  collocaNota = () => {
    const pronta = schermi.every((s) => s.el.hidden || !('carica' in s.el.dataset));
    nota.toggleAttribute('data-attesa', !pronta);
    if (pronta) colloca(nota, radice, aggancio(schermi));
  };

  let chiave = '';
  const mostraScena = (s: Scena) => {
    scena = s;
    radice.dataset.modo = s.tipo;
    const nuova = s.tipo === 'siti' || s.tipo === 'confronto' ? s.schermi.map((x) => x.url).join(' ') : '';
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
    nota.setAttribute('data-attesa', '');
    schermi.forEach((sc, i) => {
      const schermata = s.schermi[i];
      if (schermata) apri(sc, schermata, s.schermi.length, i);
      else sc.el.hidden = true;
    });
    collocaNota();
  };

  const vai = (i: number) => {
    const n = Math.max(0, Math.min(totale, i));
    if (n === attuale) return;
    attuale = n;
    passi.forEach((p, j) => (p.hidden = j !== n));
    numeri.forEach((el) => (el.textContent = String(n)));
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
    mostraScena(JSON.parse(passo.dataset.scena ?? '{}') as Scena);
  };

  new ResizeObserver(() => {
    schermi.forEach(misura);
    collocaNota();
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
