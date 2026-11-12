import { actions } from 'astro:actions';
import { QUERY_GOOGLE, type Scena, type Schermata } from '../data/presentazione';

type Dispositivo = Schermata['dispositivo'];

interface Schermo {
  el: HTMLElement;
  vista: HTMLElement;
  scala: HTMLElement;
  frame: HTMLIFrameElement;
  cornici: Map<string, HTMLIFrameElement>;
  faro: HTMLElement;
  tocco: HTMLElement;
  sito: HTMLElement;
  bloccato: HTMLElement;
  bloccatoLink: HTMLAnchorElement;
  dispositivo: Dispositivo;
  minimo: number;
  allinea: string;
  nome: boolean;
  url: string;
  selettore?: string;
  frase?: [string, string];
  fermo: boolean;
  larghezza: number;
  altezza: number;
  fattore: number;
  ox: number;
  oy: number;
  bersaglio?: () => DOMRect;
  radici: Element[];
  cerca: number;
  attesa: number;
}

const MINIMO_PC = 1280;
const LARGHEZZA_TELEFONO = 390;
const ALTEZZA_TELEFONO = 844;
const CORNICE = 28;
const SPAZIO_VS = 76;
const TELEFONO_SOPRA = 74;
const TELEFONO_SOTTO = 34;
const ETICHETTA = 64;
const ARIA_SOPRA = 48;
const ASSESTAMENTO = 250;
const ATTESA_MASSIMA = 15000;
const CORNICI = 4;
const CONTROLLO_FOCUS = 250;
const RIAPRI = 'Riapri la spiegazione';
const FISSI = '.main-header, .event-banner, .topbar, .navbar-fixed-top';
const BORDO_FARO = 8;
const DISTANZA_NOTA = 24;
const BORDO_NOTA = 16;
const TASTI_AVANTI = ['ArrowRight', 'PageDown'];
const TASTI_INDIETRO = ['ArrowLeft', 'PageUp'];

let ostacolo: HTMLElement | null = null;
let collocaNota: () => void = () => {};
let tasto: (e: KeyboardEvent) => void = () => {};
let interazione = () => {};

const radice = document.querySelector<HTMLElement>('[data-pres]');
if (radice) avvia(radice);

function trova<T extends Element>(dentro: ParentNode, selettore: string): T {
  const el = dentro.querySelector<T>(selettore);
  if (!el) throw new Error(`Manca ${selettore}`);
  return el;
}

function interno(f: HTMLIFrameElement): Document | null {
  try {
    const doc = f.contentDocument;
    return doc && doc.location.href !== 'about:blank' ? doc : null;
  } catch {
    return null;
  }
}

function documento(s: Schermo) {
  return s.url.startsWith('/') ? interno(s.frame) : null;
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
    w = Math.max(cw, s.minimo);
    scala = cw / w;
    h = ch / scala;
  } else {
    const telefono = h + TELEFONO_SOPRA + TELEFONO_SOTTO;
    const nome = s.nome ? ETICHETTA : 0;
    scala = Math.min((cw - CORNICE * 2) / (w + 40), (ch - CORNICE * 2 - nome) / telefono);
    const larga = w * scala;
    x = s.allinea === 'destra' ? cw - larga - SPAZIO_VS : s.allinea === 'sinistra' ? SPAZIO_VS : (cw - larga) / 2;
    y = (ch - nome - telefono * scala) / 2 + nome + TELEFONO_SOPRA * scala;
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
}

function posiziona(s: Schermo) {
  if (s.faro.hidden) return;
  const r = s.bersaglio?.();
  if (!r) return;
  const w = s.larghezza;
  const pieno = r.left <= 1 && r.right >= w - 1;
  const x1 = pieno ? -BORDO_FARO : Math.max(BORDO_FARO, r.left);
  const y1 = Math.max(BORDO_FARO, r.top);
  const x2 = pieno ? w + BORDO_FARO : Math.min(w - BORDO_FARO, r.right);
  const y2 = Math.min(libero(s, x1, x2), r.bottom);
  s.faro.style.width = `${Math.max(0, x2 - x1)}px`;
  s.faro.style.height = `${Math.max(0, y2 - y1)}px`;
  s.faro.style.transform = `translate(${x1}px, ${y1}px)`;
  collocaNota();
}

function tocca(s: Schermo) {
  s.frame.dataset.toccata = '';
  spegni(s);
  interazione();
}

function spegni(s: Schermo) {
  clearTimeout(s.cerca);
  s.faro.hidden = true;
  s.tocco.hidden = true;
}

function segui(s: Schermo) {
  const fine = performance.now() + 600;
  const passo = () => {
    posiziona(s);
    if (performance.now() < fine) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

function mostra(s: Schermo) {
  clearTimeout(s.attesa);
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

const SOSTANZA = 'img, svg, video, canvas, picture, iframe, input, select, textarea';

function visibile(st: CSSStyleDeclaration) {
  return (
    st.backgroundImage !== 'none' ||
    !/rgba\(.*, 0\)|transparent/.test(st.backgroundColor) ||
    st.boxShadow !== 'none' ||
    ['Top', 'Right', 'Bottom', 'Left'].some(
      (l) => parseFloat(st.getPropertyValue(`border-${l.toLowerCase()}-width`)) > 0 && st.getPropertyValue(`border-${l.toLowerCase()}-style`) !== 'none',
    )
  );
}

function contenuto(el: Element): DOMRect {
  const box = el.getBoundingClientRect();
  const vista = el.ownerDocument.defaultView;
  if (!vista || visibile(vista.getComputedStyle(el))) return box;
  const rects: DOMRect[] = [];
  const giro = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      if (n.nodeType === Node.TEXT_NODE) return n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      const st = vista.getComputedStyle(n as Element);
      if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return NodeFilter.FILTER_REJECT;
      return (n as Element).matches(SOSTANZA) || visibile(st) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  const range = el.ownerDocument.createRange();
  while (giro.nextNode()) {
    const n = giro.currentNode;
    if (n.nodeType === Node.TEXT_NODE) {
      range.selectNodeContents(n);
      rects.push(...range.getClientRects());
    } else rects.push((n as Element).getBoundingClientRect());
  }
  const pieni = rects.filter((r) => r.width && r.height);
  if (!pieni.length) return box;
  const left = Math.max(box.left, Math.min(...pieni.map((r) => r.left)));
  const top = Math.max(box.top, Math.min(...pieni.map((r) => r.top)));
  const right = Math.min(box.right, Math.max(...pieni.map((r) => r.right)));
  const bottom = Math.min(box.bottom, Math.max(...pieni.map((r) => r.bottom)));
  return new DOMRect(left, top, right - left, bottom - top);
}

function unione(r: DOMRect[]) {
  const left = Math.min(...r.map((x) => x.left));
  const top = Math.min(...r.map((x) => x.top));
  return new DOMRect(left, top, Math.max(...r.map((x) => x.right)) - left, Math.max(...r.map((x) => x.bottom)) - top);
}

function bersaglio(doc: Document, s: Schermo): (() => DOMRect) | null {
  if (!s.selettore) return null;
  const elementi = [...doc.querySelectorAll<HTMLElement>(s.selettore)].filter((el) => el.getClientRects().length);
  if (!elementi.length) return null;
  s.radici = elementi;
  if (s.frase) {
    const range = intervallo(elementi[0], ...s.frase);
    return range ? () => unione([...range.getClientRects()].filter((r) => r.width)) : null;
  }
  const margini = elementi.map((el) => {
    const box = el.getBoundingClientRect();
    const c = contenuto(el);
    return [c.left - box.left, c.top - box.top, box.right - c.right, box.bottom - c.bottom];
  });
  return () =>
    unione(
      elementi.map((el, i) => {
        const r = el.getBoundingClientRect();
        const [sx, su, dx, gi] = margini[i];
        return new DOMRect(r.left + sx, r.top + su, r.width - sx - dx, r.height - su - gi);
      }),
    );
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

function evidenzia(s: Schermo, attesa: number) {
  s.faro.hidden = true;
  s.bersaglio = undefined;
  clearTimeout(s.cerca);
  const doc = documento(s);
  if (!s.selettore || !doc) {
    s.cerca = window.setTimeout(() => mostra(s), attesa);
    return;
  }
  let tentativi = 0;
  const prova = () => {
    const trovato = bersaglio(doc, s);
    if (!trovato) {
      if (++tentativi < 15) s.cerca = window.setTimeout(prova, 200);
      else mostra(s);
      return;
    }
    s.bersaglio = trovato;
    porta(s, doc);
    const finale = () => {
      s.bersaglio = bersaglio(doc, s) ?? trovato;
      porta(s, doc);
      accendi(s);
    };
    if (attesa) s.cerca = window.setTimeout(finale, attesa);
    else finale();
  };
  prova();
}

function ascolta(s: Schermo, f: HTMLIFrameElement) {
  const doc = interno(f);
  if (!doc) return;
  const attiva = () => f === s.frame;
  doc.defaultView?.addEventListener('scroll', () => attiva() && posiziona(s), { passive: true });
  for (const tipo of ['wheel', 'touchmove', 'pointerdown']) doc.addEventListener(tipo, () => attiva() && tocca(s), { passive: true });
  doc.addEventListener('keydown', (e) => tasto(e));
}

function vuota(f: HTMLIFrameElement) {
  try {
    return f.contentWindow?.location.href === 'about:blank';
  } catch {
    return false;
  }
}

const DITO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='12' fill='rgba(0,0,0,.28)' stroke='rgba(255,255,255,.9)' stroke-width='2'/%3E%3C/svg%3E\") 14 14, pointer";
const SCAMBIO: Record<string, string> = { hover: 'none', none: 'hover', fine: 'coarse', coarse: 'fine' };

function daTelefono(testo: string) {
  return testo.replace(/\((any-)?(hover|pointer):\s*(hover|none|fine|coarse)\)/g, (_, tutti = '', chiave, valore) => `(${tutti}${chiave}: ${SCAMBIO[valore]})`);
}

function regole(lista: CSSRuleList) {
  for (const regola of Array.from(lista)) {
    if (regola instanceof CSSMediaRule) regola.media.mediaText = daTelefono(regola.media.mediaText);
    if (regola instanceof CSSGroupingRule) regole(regola.cssRules);
  }
}

function telefono(doc: Document) {
  const win = doc.defaultView;
  if (!win) return;
  for (const foglio of Array.from(doc.styleSheets)) {
    try {
      regole(foglio.cssRules);
    } catch {
      continue;
    }
  }
  const originale = win.matchMedia.bind(win);
  win.matchMedia = (query: string) => originale(daTelefono(query));
  const stile = doc.createElement('style');
  stile.textContent = `html{scrollbar-width:none}html::-webkit-scrollbar{display:none}*,*::before,*::after{cursor:${DITO}!important;-webkit-tap-highlight-color:transparent}`;
  doc.head.append(stile);
  let inizio: { y: number; x: number; ultimo: number } | null = null;
  let trascinato = false;
  doc.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    inizio = { x: e.clientX, y: e.clientY, ultimo: e.clientY };
    trascinato = false;
  });
  doc.addEventListener('mousemove', (e) => {
    if (!inizio || !(e.buttons & 1)) return (inizio = null);
    if (!trascinato && Math.abs(e.clientY - inizio.y) > 6 && Math.abs(e.clientY - inizio.y) > Math.abs(e.clientX - inizio.x)) trascinato = true;
    if (!trascinato) return;
    e.preventDefault();
    win.scrollBy({ top: inizio.ultimo - e.clientY, behavior: 'instant' });
    inizio.ultimo = e.clientY;
  });
  doc.addEventListener('mouseup', () => (inizio = null));
  doc.addEventListener(
    'click',
    (e) => {
      if (!trascinato) return;
      trascinato = false;
      e.preventDefault();
      e.stopPropagation();
    },
    true,
  );
}

function caricata(s: Schermo, f: HTMLIFrameElement) {
  if (vuota(f)) return;
  f.dataset.caricata = '';
  const doc = interno(f);
  if (doc && f.dataset.dispositivo === 'telefono') telefono(doc);
  ascolta(s, f);
  if (f !== s.frame || !('carica' in s.el.dataset)) return;
  const interna = f.dataset.url?.startsWith('/');
  s.bloccato.hidden = !interna || !!interno(f);
  s.bloccatoLink.href = s.url;
  evidenzia(s, ASSESTAMENTO);
}

function cornice(s: Schermo, url: string, dispositivo: Dispositivo) {
  const chiave = `${dispositivo} ${url}`;
  let f = s.cornici.get(chiave);
  if (f) {
    s.cornici.delete(chiave);
    s.cornici.set(chiave, f);
    if ('toccata' in f.dataset) {
      delete f.dataset.toccata;
      delete f.dataset.caricata;
      f.src = url;
    }
    return f;
  }
  f = document.createElement('iframe');
  f.title = 'Sito dal vivo';
  f.dataset.url = url;
  f.dataset.dispositivo = dispositivo;
  f.src = url;
  const nuova = f;
  f.addEventListener('load', () => caricata(s, nuova));
  s.scala.prepend(f);
  s.cornici.set(chiave, f);
  for (const [vecchiaChiave, vecchia] of s.cornici) {
    if (s.cornici.size <= CORNICI) break;
    if (vecchia === s.frame || vecchia === f) continue;
    vecchia.remove();
    s.cornici.delete(vecchiaChiave);
  }
  return f;
}

function crea(el: HTMLElement): Schermo {
  const s: Schermo = {
    el,
    vista: trova(el, '[data-vista]'),
    scala: trova(el, '[data-scala]'),
    frame: document.createElement('iframe'),
    cornici: new Map(),
    faro: trova(el, '[data-faro]'),
    tocco: trova(el, '[data-tocco]'),
    sito: trova(el, '[data-sito]'),
    bloccato: trova(el, '[data-bloccato]'),
    bloccatoLink: trova(el, '[data-bloccato-link]'),
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
    attesa: 0,
  };
  for (const tipo of ['wheel', 'pointerdown']) s.tocco.addEventListener(tipo, () => tocca(s), { passive: true });
  new ResizeObserver(() => misura(s)).observe(s.vista);
  return s;
}

function apri(s: Schermo, schermata: Schermata, quanti = 1, posto = 0) {
  const { url, nome, dispositivo, evidenzia: selettore, frase, fermo } = schermata;
  s.el.hidden = false;
  s.sito.textContent = nome;
  s.el.dataset.sito = nome === 'Nuovo sito' ? 'nuovo' : 'oggi';
  s.selettore = selettore;
  s.frase = frase;
  s.fermo = !!fermo;
  s.nome = quanti > 1;
  s.dispositivo = dispositivo;
  s.minimo = quanti > 1 ? 0 : MINIMO_PC;
  s.allinea = quanti === 2 ? (posto === 0 ? 'destra' : 'sinistra') : '';
  s.el.dataset.dispositivo = dispositivo;
  s.url = url;
  const f = cornice(s, url, dispositivo);
  if (f !== s.frame) {
    s.frame.removeAttribute('data-attiva');
    f.dataset.attiva = '';
    f.title = `${nome}, dal vivo`;
    s.frame = f;
  }
  misura(s);
  s.faro.hidden = true;
  s.bersaglio = undefined;
  clearTimeout(s.cerca);
  clearTimeout(s.attesa);
  if ('caricata' in f.dataset) {
    delete s.el.dataset.carica;
    s.bloccato.hidden = !url.startsWith('/') || !!interno(f);
    return evidenzia(s, 0);
  }
  s.el.dataset.carica = '';
  s.bloccato.hidden = true;
  s.attesa = window.setTimeout(() => s.url === url && mostra(s), ATTESA_MASSIMA);
}

interface RisultatoGoogle {
  titolo: string;
  link: string;
  sito: string;
  indirizzo: string;
  icona: string;
  testo: string;
  evidenze: string[];
}

async function nuovoSito(): Promise<RisultatoGoogle> {
  const doc = new DOMParser().parseFromString(await fetch('/').then((r) => r.text()), 'text/html');
  const canonico = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? location.origin;
  return {
    titolo: doc.title,
    link: canonico,
    sito: doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ?? '',
    indirizzo: canonico.replace(/\/$/, ''),
    icona: '/favicon.ico',
    testo: doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    evidenze: QUERY_GOOGLE.split(' '),
  };
}

function grassetto(el: HTMLElement, testo: string, parole: string[]) {
  const voci = parole.filter(Boolean).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!voci.length) return (el.textContent = testo);
  testo.split(new RegExp(`(${voci.join('|')})`, 'gi')).forEach((pezzo, i) => {
    if (i % 2) el.append(Object.assign(document.createElement('strong'), { textContent: pezzo }));
    else el.append(pezzo);
  });
}

function risultato(modello: HTMLTemplateElement, r: RisultatoGoogle, esito?: 'si' | 'no') {
  const li = modello.content.firstElementChild?.cloneNode(true) as HTMLElement;
  const campo = <T extends HTMLElement>(nome: string) => trova<T>(li, `[data-${nome}]`);
  campo('sito').textContent = r.sito;
  campo('indirizzo').textContent = r.indirizzo;
  campo('titolo').textContent = r.titolo;
  grassetto(campo('testo'), r.testo, r.evidenze);
  const icona = campo<HTMLImageElement>('icona');
  if (r.icona) icona.src = r.icona;
  icona.hidden = !r.icona;
  campo('globo').hidden = !!r.icona;
  if (!esito) return li;
  li.classList.add(`pres-ricerca-risultato--${esito === 'no' ? 'oggi' : 'nuovo'}`);
  const segno = campo('esito');
  segno.hidden = false;
  segno.classList.add(`pres-punto--${esito}`);
  trova(segno, 'i').classList.add(esito === 'no' ? 'fa-times' : 'fa-check');
  campo('esito-testo').textContent = esito === 'no' ? 'Così è oggi' : 'Così apparirà il nuovo sito';
  return li;
}

async function mostraGoogle(radice: HTMLElement) {
  const lista = trova<HTMLElement>(radice, '[data-risultati-google]');
  const stato = trova<HTMLElement>(radice, '[data-stato-google]');
  const modello = trova<HTMLTemplateElement>(radice, '[data-risultato-google]');
  const [nuovo, { data, error }] = await Promise.all([nuovoSito(), actions.presentazione.google()]);
  const veri = data?.risultati ?? [];
  const oggi = veri.findIndex((r) => new URL(r.link).hostname.endsWith('inballet.it'));
  lista.replaceChildren(...veri.map((r, i) => risultato(modello, r, i === oggi ? 'no' : undefined)));
  if (oggi < 0) lista.prepend(risultato(modello, nuovo, 'si'));
  else lista.children[oggi].after(risultato(modello, nuovo, 'si'));
  const quando = data && new Date(data.aggiornato).toLocaleString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  stato.textContent = quando
    ? `Risultati veri di Google per «${QUERY_GOOGLE}», letti il ${quando}`
    : error
      ? 'Risultati di Google non raggiungibili in questo momento'
      : 'Risultati di Google non disponibili: manca la chiave SERPAPI_KEY';
}

function aggancio(schermi: Schermo[]) {
  const s = schermi.find((x) => !x.el.hidden && !x.faro.hidden);
  return s?.dispositivo === 'pc' ? s.faro.getBoundingClientRect() : null;
}

function colloca(nota: HTMLElement, palco: HTMLElement, a: DOMRect | null) {
  const p = palco.getBoundingClientRect();
  const n = nota.getBoundingClientRect();
  const fine = (ostacolo?.offsetParent ? ostacolo.getBoundingClientRect().top : p.bottom) - p.top - BORDO_NOTA;
  if (!a) {
    nota.style.transform = `translate(${Math.round((p.width - n.width) / 2)}px, ${Math.round(fine - n.height)}px)`;
    return;
  }
  const r = new DOMRect(a.left - p.left, a.top - p.top, a.width, a.height);
  const entro = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const x = entro(r.left + (r.width - n.width) / 2, BORDO_NOTA, p.width - n.width - BORDO_NOTA);
  const y = entro(r.top, BORDO_NOTA, fine - n.height);
  const posti: [number, number, boolean][] = [
    [x, r.bottom + DISTANZA_NOTA, r.bottom + DISTANZA_NOTA + n.height <= fine],
    [x, r.top - DISTANZA_NOTA - n.height, r.top - DISTANZA_NOTA - n.height >= BORDO_NOTA],
    [r.right + DISTANZA_NOTA, y, r.right + DISTANZA_NOTA + n.width <= p.width - BORDO_NOTA],
    [r.left - DISTANZA_NOTA - n.width, y, r.left - DISTANZA_NOTA - n.width >= BORDO_NOTA],
  ];
  const [px, py] = posti.find((q) => q[2]) ?? [r.right - n.width - DISTANZA_NOTA, entro(r.top + DISTANZA_NOTA, BORDO_NOTA, fine - n.height)];
  nota.style.transform = `translate(${Math.round(entro(px, BORDO_NOTA, p.width - n.width - BORDO_NOTA))}px, ${Math.round(py)}px)`;
}

function avvia(radice: HTMLElement) {
  const passi = [...radice.querySelectorAll<HTMLElement>('[data-passo]')].sort((a, b) => Number(a.dataset.passo) - Number(b.dataset.passo));
  const contenitore = trova<HTMLElement>(radice, '[data-schermi]');
  const schermi = [...radice.querySelectorAll<HTMLElement>('[data-schermo]')].map(crea);
  const numeri = [...radice.querySelectorAll<HTMLElement>('[data-numero]')];
  const fondali = [...radice.querySelectorAll<HTMLElement>('[data-fondale-foto]')];
  const avanti = [...radice.querySelectorAll<HTMLButtonElement>('[data-avanti]')];
  const indietro = [...radice.querySelectorAll<HTMLButtonElement>('[data-indietro]')];
  const nota = trova<HTMLElement>(radice, '[data-nota]');
  const riapri = trova<HTMLButtonElement>(radice, '[data-riapri-nota]');
  ostacolo = trova<HTMLElement>(radice, '.pres-navigazione');
  const scene = passi.map((p) => JSON.parse(p.dataset.scena ?? '{}') as Scena);
  const totale = passi.length - 1;
  let attuale = -1;
  let googleLetto = false;

  collocaNota = () => {
    const pronta = schermi.every((s) => s.el.hidden || !('carica' in s.el.dataset));
    nota.toggleAttribute('data-attesa', !pronta);
    if (pronta) colloca(nota, radice, aggancio(schermi));
  };

  const precarica = (n: number) => {
    const scena = scene[n];
    if (scena?.tipo !== 'siti' && scena?.tipo !== 'confronto') return;
    scena.schermi.forEach((x, i) => cornice(schermi[i], x.url, x.dispositivo));
  };

  let chiave = '';
  const mostraScena = (s: Scena) => {
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
    radice.removeAttribute('data-nota-chiusa');
    riapri.textContent = passi[n].dataset.riapri ?? RIAPRI;
    passi.forEach((p, j) => (p.hidden = j !== n));
    numeri.forEach((el) => (el.textContent = String(n)));
    indietro.forEach((b) => (b.disabled = n === 0));
    avanti.forEach((b) => (b.disabled = n === totale));
    history.replaceState(null, '', n ? `#passo-${n}` : location.pathname);
    const passo = passi[n];
    fondali.forEach((foto) => (foto.hidden = foto.dataset.fondaleFoto !== passo.dataset.fondale));
    passo.querySelectorAll<HTMLButtonElement>('[data-percorso]').forEach((btn, j) => btn.setAttribute('aria-pressed', String(j === 0)));
    if (passo.hasAttribute('data-google') && !googleLetto) {
      googleLetto = true;
      mostraGoogle(radice).catch(() => (googleLetto = false));
    }
    mostraScena(scene[n]);
    window.setTimeout(() => {
      if (attuale !== n) return;
      precarica(n + 1);
      precarica(n + 2);
      precarica(n - 1);
    }, 300);
  };

  tasto = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as Element | null)?.closest?.('input, textarea, select, [contenteditable]')) return;
    if (TASTI_AVANTI.includes(e.key)) vai(attuale + 1);
    else if (TASTI_INDIETRO.includes(e.key)) vai(attuale - 1);
    else return;
    e.preventDefault();
  };
  document.addEventListener('keydown', tasto);

  new ResizeObserver(() => {
    schermi.forEach(misura);
    collocaNota();
  }).observe(radice);

  window.setInterval(() => {
    const attivo = document.activeElement;
    if (!(attivo instanceof HTMLIFrameElement) || interno(attivo)) return;
    attivo.dataset.toccata = '';
    radice.focus({ preventScroll: true });
  }, CONTROLLO_FOCUS);

  avanti.forEach((b) => b.addEventListener('click', () => vai(attuale + 1)));
  indietro.forEach((b) => b.addEventListener('click', () => vai(attuale - 1)));

  const chiudiNota = (chiusa: boolean) => {
    radice.toggleAttribute('data-nota-chiusa', chiusa);
    if (chiusa) {
      schermi.forEach(spegni);
      riapri.focus({ preventScroll: true });
    } else collocaNota();
  };
  trova(radice, '[data-chiudi-nota]').addEventListener('click', () => chiudiNota(true));
  interazione = () => radice.setAttribute('data-nota-chiusa', '');
  radice.addEventListener(
    'wheel',
    (e) => {
      const s = schermi.find((x) => !x.el.hidden);
      if (!s || contenitore.hidden || (e.target as Element).closest('.pres-navigazione')) return;
      tocca(s);
      interno(s.frame)?.defaultView?.scrollBy({ top: e.deltaY });
    },
    { passive: true },
  );
  riapri.addEventListener('click', () => chiudiNota(false));

  radice.addEventListener('click', (e) => {
    const scelta = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-percorso]');
    const scena = scene[attuale];
    if (!scelta || scena?.tipo !== 'siti') return;
    scelta.parentElement?.querySelectorAll('[data-percorso]').forEach((btn) => btn.setAttribute('aria-pressed', String(btn === scelta)));
    chiudiNota(true);
    apri(schermi[0], { ...scena.schermi[0], url: scelta.dataset.percorso ?? '/' });
  });

  const dalPasso = () => {
    const n = location.hash.match(/^#passo-(\d+)$/);
    vai(n ? Number(n[1]) : 0);
  };
  window.addEventListener('hashchange', dalPasso);
  dalPasso();
}
