import { emetti } from './comune';

type Posizione = { x: number; y: number };

const CHIAVE = 'sv-finestre';
const MARGINE = 12;
const piccolo = matchMedia('(max-width: 700px)');
const finestre = [...document.querySelectorAll<HTMLDialogElement>('dialog.sv-finestra')];
let livello = 10;

function leggi(): Record<string, Posizione> {
  try {
    return JSON.parse(localStorage.getItem(CHIAVE) ?? '{}') as Record<string, Posizione>;
  } catch {
    return {};
  }
}
const posizioni = leggi();

function ricorda() {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(posizioni));
  } catch {
    return;
  }
}

function spazioDock(): number {
  const dock = document.getElementById('svDock');
  return dock ? innerHeight - dock.getBoundingClientRect().top + MARGINE : MARGINE;
}

function limita(f: HTMLDialogElement, x: number, y: number): Posizione {
  const { width, height } = f.getBoundingClientRect();
  return {
    x: Math.round(Math.min(Math.max(MARGINE, x), Math.max(MARGINE, innerWidth - width - MARGINE))),
    y: Math.round(Math.min(Math.max(MARGINE, y), Math.max(MARGINE, innerHeight - spazioDock() - Math.min(height, 120)))),
  };
}

function iniziale(f: HTMLDialogElement): Posizione {
  const { width, height } = f.getBoundingClientRect();
  if (f.classList.contains('sv-finestra--grande')) return { x: (innerWidth - width) / 2, y: Math.max(MARGINE, (innerHeight - spazioDock() - height) / 2) };
  return { x: f.dataset.lato === 'sinistra' ? MARGINE : innerWidth - width - MARGINE, y: MARGINE };
}

function sposta(f: HTMLDialogElement, p: Posizione) {
  f.style.left = `${p.x}px`;
  f.style.top = `${p.y}px`;
  f.style.maxHeight = `${innerHeight - spazioDock() - p.y}px`;
}

function colloca(f: HTMLDialogElement) {
  f.style.setProperty('--sv-sotto', `${spazioDock()}px`);
  if (piccolo.matches) {
    f.style.removeProperty('left');
    f.style.removeProperty('top');
    f.style.removeProperty('max-height');
    return;
  }
  const base = posizioni[f.id] ?? iniziale(f);
  sposta(f, limita(f, base.x, base.y));
}

function segnaAperte() {
  for (const f of finestre) document.querySelectorAll(`[aria-controls="${f.id}"]`).forEach((b) => b.setAttribute('aria-expanded', String(f.open)));
  emetti('finestre');
}

export function inPrimoPiano(f: HTMLDialogElement) {
  f.style.zIndex = String(++livello);
}

export function apri(id: string, fuoco?: HTMLElement | null) {
  const f = document.getElementById(id) as HTMLDialogElement;
  const nuova = !f.open;
  if (nuova) {
    f.show();
    f.removeAttribute('data-ridotta');
    colloca(f);
    segnaAperte();
  }
  inPrimoPiano(f);
  if (nuova || fuoco) (fuoco ?? f).focus({ preventScroll: true });
}

export function chiudi(id: string) {
  const f = document.getElementById(id) as HTMLDialogElement;
  if (f.open) f.close();
}

export function allarga(id: string, larga: boolean) {
  const f = document.getElementById(id) as HTMLDialogElement;
  if (f.hasAttribute('data-larga') === larga) return;
  f.toggleAttribute('data-larga', larga);
  f.style.removeProperty('width');
  f.style.removeProperty('height');
  if (f.open) colloca(f);
}

export const aperta = (id: string) => (document.getElementById(id) as HTMLDialogElement).open;

export function inCima(): HTMLDialogElement | null {
  return finestre.filter((f) => f.open).sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex))[0] ?? null;
}

export function evita(id: string, area: DOMRect | null) {
  const f = document.getElementById(id) as HTMLDialogElement;
  if (!area || !f.open || posizioni[id] || piccolo.matches) return;
  const r = f.getBoundingClientRect();
  const sovrapposto = (x: number) => Math.max(0, Math.min(x + r.width, area.right) - Math.max(x, area.left));
  const destra = innerWidth - r.width - MARGINE;
  const lato = sovrapposto(MARGINE) < sovrapposto(destra) ? 'sinistra' : 'destra';
  if (sovrapposto(r.left) === 0 || lato === f.dataset.lato) return;
  f.dataset.lato = lato;
  colloca(f);
}

function trascinabile(f: HTMLDialogElement) {
  const testa = f.querySelector<HTMLElement>('[data-trascina]');
  testa?.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || piccolo.matches || (e.target as Element).closest('button, a, input, select, textarea, [role="tab"]')) return;
    const r = f.getBoundingClientRect();
    const dx = e.clientX - r.left;
    const dy = e.clientY - r.top;
    testa.setPointerCapture(e.pointerId);
    document.documentElement.classList.add('sv-trascina');
    inPrimoPiano(f);
    const muovi = (ev: PointerEvent) => {
      sposta(f, limita(f, ev.clientX - dx, ev.clientY - dy));
    };
    const fine = () => {
      document.documentElement.classList.remove('sv-trascina');
      testa.removeEventListener('pointermove', muovi);
      posizioni[f.id] = { x: parseFloat(f.style.left), y: parseFloat(f.style.top) };
      ricorda();
    };
    testa.addEventListener('pointermove', muovi);
    testa.addEventListener('pointerup', fine, { once: true });
    testa.addEventListener('pointercancel', fine, { once: true });
  });
  testa?.addEventListener('dblclick', (e) => {
    if ((e.target as Element).closest('button, a, input, [role="tab"]')) return;
    delete posizioni[f.id];
    ricorda();
    colloca(f);
  });
}

for (const f of finestre) {
  trascinabile(f);
  f.addEventListener('pointerdown', () => inPrimoPiano(f));
  f.addEventListener('focusin', () => inPrimoPiano(f));
  f.addEventListener('close', segnaAperte);
  f.querySelector('[data-chiudi]')?.addEventListener('click', () => f.close());
  const riduci = f.querySelector<HTMLButtonElement>('[data-riduci]');
  riduci?.addEventListener('click', () => {
    const ridotta = f.toggleAttribute('data-ridotta');
    riduci.setAttribute('aria-expanded', String(!ridotta));
    riduci.setAttribute('aria-label', ridotta ? 'Espandi la finestra' : 'Riduci la finestra');
    colloca(f);
  });
}

addEventListener('resize', () => finestre.filter((f) => f.open).forEach(colloca));
piccolo.addEventListener('change', () => finestre.filter((f) => f.open).forEach(colloca));
