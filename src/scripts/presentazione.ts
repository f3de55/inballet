import { SITO_ATTUALE, type Scena } from '../data/presentazione';

type Dispositivo = 'pc' | 'telefono';
type Segni = Extract<Scena, { tipo: 'sito' }>['segni'];

interface Schermo {
  el: HTMLElement;
  vista: HTMLElement;
  scala: HTMLElement;
  frame: HTMLIFrameElement;
  faro: HTMLElement;
  etichetta: HTMLElement;
  segni: HTMLElement;
  sito: HTMLElement;
  indirizzo: HTMLElement;
  bloccato: HTMLElement;
  bloccatoLink: HTMLAnchorElement;
  dispositivo: Dispositivo;
  url: string;
  selettore?: string;
  nota?: string;
  bersaglio?: HTMLElement;
  cerca: number;
}

const LARGHEZZA = { pc: 1366, telefono: 390 };
const ALTEZZA_TELEFONO = 844;
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
  let scala: number;
  let h: number;
  let x = 0;
  let y = 0;
  if (s.dispositivo === 'pc') {
    scala = cw / w;
    h = ch / scala;
  } else {
    h = ALTEZZA_TELEFONO;
    scala = Math.min((cw - CORNICE * 2) / w, (ch - CORNICE * 2) / h);
    x = (cw - w * scala) / 2;
    y = (ch - h * scala) / 2;
  }
  s.scala.style.setProperty('--w', `${w}px`);
  s.scala.style.setProperty('--h', `${h}px`);
  s.scala.style.setProperty('--s', String(scala));
  s.scala.style.setProperty('--x', `${x}px`);
  s.scala.style.setProperty('--y', `${y}px`);
  s.el.dataset.dispositivo = s.dispositivo;
  posiziona(s);
}

function posiziona(s: Schermo) {
  if (!s.bersaglio || s.faro.hidden) return;
  const r = s.bersaglio.getBoundingClientRect();
  s.faro.style.width = `${r.width + MARGINE_FARO * 2}px`;
  s.faro.style.height = `${r.height + MARGINE_FARO * 2}px`;
  s.faro.style.transform = `translate(${r.left - MARGINE_FARO}px, ${r.top - MARGINE_FARO}px)`;
  s.faro.dataset.sotto = String(r.top < 90);
}

function segui(s: Schermo) {
  const fine = performance.now() + 1200;
  const passo = () => {
    posiziona(s);
    if (performance.now() < fine) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

function evidenzia(s: Schermo) {
  s.faro.hidden = true;
  s.bersaglio = undefined;
  clearTimeout(s.cerca);
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
    s.etichetta.textContent = s.nota ?? '';
    s.etichetta.hidden = !s.nota;
    el.scrollIntoView({ block: 'center', behavior: ridotto.matches ? 'instant' : 'smooth' });
    s.faro.hidden = false;
    posiziona(s);
    segui(s);
  };
  prova();
}

function disegnaSegni(s: Schermo, segni: Segni = []) {
  s.segni.replaceChildren(
    ...segni.map((segno, i) => {
      const li = document.createElement('li');
      li.className = 'pres-segno';
      li.style.setProperty('--sx', `${segno.x}px`);
      li.style.setProperty('--sy', `${segno.y}px`);
      li.dataset.n = String(i + 1);
      li.textContent = segno.testo;
      return li;
    }),
  );
}

function caricato(s: Schermo) {
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
    segni: trova(el, '[data-segni]'),
    sito: trova(el, '[data-sito]'),
    indirizzo: trova(el, '[data-indirizzo]'),
    bloccato: trova(el, '[data-bloccato]'),
    bloccatoLink: trova(el, '[data-bloccato-link]'),
    dispositivo: 'pc',
    url: '',
    cerca: 0,
  };
  s.frame.addEventListener('load', () => caricato(s));
  new ResizeObserver(() => misura(s)).observe(s.vista);
  return s;
}

function apri(s: Schermo, sito: 'attuale' | 'nuovo', percorso: string, dispositivo: Dispositivo, selettore?: string, nota?: string, segni?: Segni) {
  const url = sito === 'attuale' ? `${SITO_ATTUALE}${percorso}` : percorso;
  s.sito.textContent = sito === 'attuale' ? 'Sito di oggi' : 'Nuovo sito';
  s.frame.title = sito === 'attuale' ? 'Sito di oggi, inballet.it, dal vivo' : 'Nuovo sito InBallet, dal vivo';
  s.el.dataset.sito = sito;
  s.selettore = selettore;
  s.nota = nota;
  s.dispositivo = dispositivo;
  disegnaSegni(s, segni);
  misura(s);
  const doc = documento(s);
  const giaAperto = sito === 'nuovo' && doc && `${doc.location.pathname}${doc.location.search}` === percorso;
  s.url = url;
  if (giaAperto || (sito === 'attuale' && s.frame.dataset.url === url)) {
    evidenzia(s);
    return;
  }
  s.indirizzo.textContent = sito === 'attuale' ? url.replace(/^https:\/\//, '') : `${location.host}${percorso}`;
  s.faro.hidden = true;
  s.bloccato.hidden = true;
  s.frame.dataset.url = url;
  s.frame.src = url;
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

function avvia(radice: HTMLElement) {
  const passi = [...radice.querySelectorAll<HTMLElement>('[data-passo]')];
  const palco = trova<HTMLElement>(radice, '.pres-palco');
  const contenitore = trova<HTMLElement>(radice, '[data-schermi]');
  const pannelli = [...radice.querySelectorAll<HTMLElement>('[data-pannello]')];
  const [a, b] = [...radice.querySelectorAll<HTMLElement>('[data-schermo]')].map(crea);
  const dispositivi = trova<HTMLElement>(radice, '[data-dispositivi]');
  const numero = trova<HTMLElement>(radice, '[data-numero]');
  const barra = trova<HTMLElement>(radice, '[data-barra]');
  const avanti = trova<HTMLButtonElement>(radice, '[data-avanti]');
  const indietro = trova<HTMLButtonElement>(radice, '[data-indietro]');
  const capitoli = [...radice.querySelectorAll<HTMLButtonElement>('[data-vai]')];
  let attuale = -1;
  let nuovoLetto = false;

  const visibili = () => [a, b].filter((s) => !s.el.hidden);

  const segnaDispositivo = () => {
    const d = visibili()[0]?.dispositivo ?? 'pc';
    dispositivi
      .querySelectorAll<HTMLButtonElement>('[data-dispositivo]')
      .forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.dispositivo === d)));
  };

  const mostra = (scena: Scena) => {
    palco.dataset.modo = scena.tipo;
    pannelli.forEach((p) => (p.hidden = scena.tipo !== 'pannello' || p.dataset.pannello !== scena.pannello));
    contenitore.hidden = scena.tipo === 'pannello';
    dispositivi.hidden = scena.tipo === 'pannello';
    b.el.hidden = scena.tipo !== 'confronto';
    if (scena.tipo === 'sito') apri(a, scena.sito, scena.percorso, scena.dispositivo, scena.evidenzia, scena.etichetta, scena.segni);
    if (scena.tipo === 'confronto') {
      apri(a, 'attuale', scena.attuale, scena.dispositivo);
      apri(b, 'nuovo', scena.nuovo, scena.dispositivo);
    }
    if (scena.tipo === 'pannello' && scena.pannello === 'google' && !nuovoLetto) {
      nuovoLetto = true;
      leggiNuovoSito(radice).catch(() => (nuovoLetto = false));
    }
    segnaDispositivo();
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
    const capitolo = capitoli.filter((c) => Number(c.dataset.vai) <= n).at(-1);
    capitoli.forEach((c) => (c === capitolo ? c.setAttribute('aria-current', 'step') : c.removeAttribute('aria-current')));
    history.replaceState(null, '', `#passo-${n + 1}`);
    const passo = passi[n];
    passo.querySelectorAll<HTMLButtonElement>('[data-percorso]').forEach((btn, j) => btn.setAttribute('aria-pressed', String(j === 0)));
    mostra(JSON.parse(passo.dataset.scena ?? '{}') as Scena);
  };

  avanti.addEventListener('click', () => vai(attuale + 1));
  indietro.addEventListener('click', () => vai(attuale - 1));
  capitoli.forEach((c) => c.addEventListener('click', () => vai(Number(c.dataset.vai))));

  radice.addEventListener('click', (e) => {
    const scelta = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-percorso]');
    if (!scelta) return;
    scelta.parentElement?.querySelectorAll('[data-percorso]').forEach((btn) => btn.setAttribute('aria-pressed', String(btn === scelta)));
    apri(a, 'nuovo', scelta.dataset.percorso ?? '/', a.dispositivo);
  });

  dispositivi.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-dispositivo]');
    if (!btn) return;
    const d = btn.dataset.dispositivo === 'telefono' ? 'telefono' : 'pc';
    visibili().forEach((s) => {
      s.dispositivo = d;
      misura(s);
      evidenzia(s);
    });
    segnaDispositivo();
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
