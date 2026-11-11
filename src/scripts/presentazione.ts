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
const ridotto = matchMedia('(prefers-reduced-motion: reduce)');

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
  s.scala.style.setProperty('--w', `${w}px`);
  s.scala.style.setProperty('--h', `${h}px`);
  s.scala.style.setProperty('--s', String(scala));
  s.scala.style.setProperty('--x', `${(cw - w * scala) / 2}px`);
  s.scala.style.setProperty('--y', `${(ch - h * scala) / 2}px`);
  s.altezza = h;
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
    url: '',
    altezza: 0,
    cerca: 0,
  };
  s.frame.addEventListener('load', () => caricato(s));
  new ResizeObserver(() => misura(s)).observe(s.vista);
  return s;
}

function apri(s: Schermo, schermata: Schermata) {
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
  const campo = (nome: string) => radice.querySelector<HTMLElement>(`[data-google="${nome}"]`);
  const titolo = campo('titolo');
  const descrizione = campo('descrizione');
  if (titolo) titolo.textContent = doc.title;
  if (descrizione) descrizione.textContent = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
}

function avvia(radice: HTMLElement) {
  const passi = [...radice.querySelectorAll<HTMLElement>('[data-passo]')];
  const pannelli = [...radice.querySelectorAll<HTMLElement>('[data-pannello]')];
  const contenitore = trova<HTMLElement>(radice, '[data-schermi]');
  const schermi = [...radice.querySelectorAll<HTMLElement>('[data-schermo]')].map(crea);
  const numero = trova<HTMLElement>(radice, '[data-numero]');
  const barra = trova<HTMLElement>(radice, '[data-barra]');
  const avanti = trova<HTMLButtonElement>(radice, '[data-avanti]');
  const indietro = trova<HTMLButtonElement>(radice, '[data-indietro]');
  let attuale = -1;
  let scena: Scena | undefined;
  let nuovoLetto = false;

  const mostra = (s: Scena) => {
    scena = s;
    radice.dataset.modo = s.tipo;
    pannelli.forEach((p) => (p.hidden = s.tipo !== 'pannello' || p.dataset.pannello !== s.pannello));
    contenitore.hidden = s.tipo !== 'siti';
    if (s.tipo !== 'siti') return;
    contenitore.dataset.n = String(s.schermi.length);
    schermi.forEach((sc, i) => {
      const schermata = s.schermi[i];
      if (schermata) apri(sc, schermata);
      else sc.el.hidden = true;
    });
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
    if (passo.querySelector('[data-google]') && !nuovoLetto) {
      nuovoLetto = true;
      leggiNuovoSito(radice).catch(() => (nuovoLetto = false));
    }
    mostra(JSON.parse(passo.dataset.scena ?? '{}') as Scena);
  };

  avanti.addEventListener('click', () => vai(attuale + 1));
  indietro.addEventListener('click', () => vai(attuale - 1));

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
    vai(n ? Number(n[1]) - 1 : 0);
  };
  window.addEventListener('hashchange', dalPasso);
  dalPasso();
}
