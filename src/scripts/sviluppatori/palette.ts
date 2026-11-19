import { $, el, icona } from './comune';

type Pagina = { gruppo: string; percorso: string };

const finestra = $<HTMLDialogElement>('svPalette');
const campo = $<HTMLInputElement>('svPaletteCampo');
const lista = $('svPaletteRisultati');
let pagine: Pagina[] = [];
let vai: (percorso: string) => void = () => {};
let mostrate: Pagina[] = [];
let attiva = 0;

export function impostaPagine(nuove: Pagina[], azione: (percorso: string) => void) {
  pagine = nuove;
  vai = azione;
  if (finestra.open) disegna();
}

function punteggio(q: string, testo: string): number {
  const t = testo.toLowerCase();
  const i = t.indexOf(q);
  if (i >= 0) return 1000 - i - t.length / 10 + (i === 0 || /[\s/._-]/.test(t[i - 1]) ? 300 : 0);
  let j = 0;
  let s = 0;
  let ultimo = -2;
  for (let k = 0; k < t.length && j < q.length; k++) {
    if (t[k] !== q[j]) continue;
    s += ultimo === k - 1 ? 6 : 1;
    ultimo = k;
    j++;
  }
  return j === q.length ? s : -1;
}

function risultati(): Pagina[] {
  const testo = campo.value.trim();
  const q = testo.toLowerCase();
  if (!q) return pagine;
  const trovate = pagine
    .map((p) => ({ p, s: punteggio(q, p.percorso) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
  const gruppi = [...new Set(trovate.map((p) => p.gruppo))];
  trovate.sort((a, b) => gruppi.indexOf(a.gruppo) - gruppi.indexOf(b.gruppo));
  if (q.startsWith('/') && !pagine.some((p) => p.percorso === testo)) trovate.unshift({ gruppo: 'Indirizzo', percorso: testo });
  return trovate;
}

function disegna() {
  mostrate = risultati();
  attiva = Math.min(attiva, Math.max(0, mostrate.length - 1));
  const voci: HTMLElement[] = [];
  let gruppo = '';
  mostrate.forEach((p, i) => {
    if (p.gruppo !== gruppo) {
      gruppo = p.gruppo;
      voci.push(el('li', { class: 'sv-palette-gruppo', role: 'presentation', text: gruppo }));
    }
    voci.push(
      el(
        'li',
        { id: `sv-op-${i}`, role: 'option', class: 'sv-palette-voce', 'aria-selected': String(i === attiva), 'data-indice': i },
        icona('fa-route'),
        el('span', { class: 'sv-palette-nome', text: p.percorso }),
      ),
    );
  });
  if (!mostrate.length)
    voci.push(el('li', { class: 'sv-palette-vuoto', role: 'presentation', text: 'Nessuna pagina. Scrivi un indirizzo che inizia con / per aprirlo.' }));
  lista.replaceChildren(...voci);
  evidenzia();
}

function evidenzia() {
  lista.querySelectorAll('[role="option"]').forEach((o) => o.setAttribute('aria-selected', String(Number((o as HTMLElement).dataset.indice) === attiva)));
  const scelta = $(`sv-op-${attiva}`);
  if (scelta) {
    campo.setAttribute('aria-activedescendant', scelta.id);
    scelta.scrollIntoView({ block: 'nearest' });
  } else campo.removeAttribute('aria-activedescendant');
}

function esegui(i: number) {
  const p = mostrate[i];
  if (!p) return;
  finestra.close();
  vai(p.percorso);
}

export function apriPalette() {
  finestra.showModal();
  campo.value = '';
  attiva = 0;
  disegna();
  campo.focus();
}

campo.addEventListener('input', () => {
  attiva = 0;
  disegna();
});
campo.addEventListener('keydown', (e) => {
  const passo = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
  if (passo && mostrate.length) {
    e.preventDefault();
    attiva = (attiva + passo + mostrate.length) % mostrate.length;
    evidenzia();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    esegui(attiva);
  }
});
lista.addEventListener('pointermove', (e) => {
  const o = (e.target as Element).closest<HTMLElement>('[role="option"]');
  if (o && Number(o.dataset.indice) !== attiva) {
    attiva = Number(o.dataset.indice);
    evidenzia();
  }
});
lista.addEventListener('click', (e) => {
  const o = (e.target as Element).closest<HTMLElement>('[role="option"]');
  if (o) esegui(Number(o.dataset.indice));
});
finestra.addEventListener('click', (e) => {
  if (e.target === finestra) finestra.close();
});
