import { $, el, icona } from './comune';
import { tutte, eVariabili } from './regole';
import { elencoFile, apri as apriFile } from './file';

export type Comando = { gruppo: string; nome: string; dettaglio?: string; icona: string; tasto?: string; fai: () => void };
type Azioni = { vai: (percorso: string) => void; token: (nome: string) => void };

const finestra = $<HTMLDialogElement>('svPalette');
const campo = $<HTMLInputElement>('svPaletteCampo');
const lista = $('svPaletteRisultati');
const ORDINE_VUOTO = ['Strumenti', 'Vista', 'Pagine', 'Altro'];
let comandi: Comando[] = [];
let azioni: Azioni | null = null;
let file: string[] = [];
let token: string[] = [];
let mostrati: Comando[] = [];
let attivo = 0;

export function impostaComandi(nuovi: Comando[], a?: Azioni) {
  comandi = nuovi;
  if (a) azioni = a;
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

type Trovato = { c: Comando; p: number };

function migliori(q: string, voci: Comando[], quanti: number): Trovato[] {
  return voci
    .map((c) => ({ c, p: punteggio(q, `${c.nome} ${c.dettaglio ?? ''}`) }))
    .filter((x) => x.p >= 0)
    .sort((a, b) => b.p - a.p)
    .slice(0, quanti);
}

function risultati(): Comando[] {
  const q = campo.value.trim().toLowerCase();
  if (!q) return [...comandi].sort((a, b) => ORDINE_VUOTO.indexOf(a.gruppo) - ORDINE_VUOTO.indexOf(b.gruppo));
  const trovati: Trovato[] = [];
  if (q.startsWith('/') && !comandi.some((c) => c.nome === q))
    trovati.push({ c: { gruppo: 'Pagine', nome: `Vai a ${campo.value.trim()}`, icona: 'fa-route', fai: () => azioni?.vai(campo.value.trim()) }, p: Infinity });
  trovati.push(...migliori(q, comandi, 30));
  if (q.length >= 2 && !q.startsWith('--'))
    trovati.push(
      ...migliori(
        q,
        file.map((p) => ({ gruppo: 'File', nome: p.split('/').pop()!, dettaglio: p, icona: 'fa-code', fai: () => void apriFile(p) })),
        20,
      ),
    );
  if (q.length >= 3 || q.startsWith('--'))
    trovati.push(
      ...migliori(
        q,
        token.map((t) => ({ gruppo: 'Token', nome: t, icona: 'fa-layer-group', fai: () => azioni?.token(t) })),
        12,
      ),
    );
  trovati.sort((a, b) => b.p - a.p);
  const gruppi = [...new Set(trovati.map((x) => x.c.gruppo))];
  return trovati.map((x) => x.c).sort((a, b) => gruppi.indexOf(a.gruppo) - gruppi.indexOf(b.gruppo));
}

function disegna() {
  mostrati = risultati();
  attivo = Math.min(attivo, Math.max(0, mostrati.length - 1));
  const voci: HTMLElement[] = [];
  let gruppo = '';
  mostrati.forEach((c, i) => {
    if (c.gruppo !== gruppo) {
      gruppo = c.gruppo;
      voci.push(el('li', { class: 'sv-palette-gruppo', role: 'presentation', text: gruppo }));
    }
    const voce = el(
      'li',
      { id: `sv-op-${i}`, role: 'option', class: 'sv-palette-voce', 'aria-selected': String(i === attivo), 'data-indice': i },
      icona(c.icona),
      el('span', { class: 'sv-palette-nome', text: c.nome }),
      c.dettaglio ? el('small', { text: c.dettaglio }) : null,
      c.tasto ? el('kbd', { text: c.tasto }) : null,
    );
    voci.push(voce);
  });
  if (!mostrati.length)
    voci.push(el('li', { class: 'sv-palette-vuoto', role: 'presentation', text: 'Nessun risultato. Scrivi un indirizzo che inizia con / per aprirlo.' }));
  lista.replaceChildren(...voci);
  evidenzia();
}

function evidenzia() {
  lista.querySelectorAll('[role="option"]').forEach((o) => o.setAttribute('aria-selected', String(Number((o as HTMLElement).dataset.indice) === attivo)));
  const scelto = $(`sv-op-${attivo}`);
  if (scelto) {
    campo.setAttribute('aria-activedescendant', scelto.id);
    scelto.scrollIntoView({ block: 'nearest' });
  } else campo.removeAttribute('aria-activedescendant');
}

function esegui(i: number) {
  const c = mostrati[i];
  if (!c) return;
  finestra.close();
  c.fai();
}

export function apriPalette(testo = '') {
  if (finestra.open) {
    campo.select();
    return;
  }
  finestra.showModal();
  campo.value = testo;
  attivo = 0;
  disegna();
  campo.focus();
  campo.select();
  void Promise.all([elencoFile(), tutte()]).then(([f, regole]) => {
    file = f;
    token = [...new Set(regole.filter((r) => eVariabili(r.file)).flatMap((r) => r.dichiarazioni.map((d) => d.prop).filter((p) => p.startsWith('--'))))].sort();
    if (finestra.open && campo.value.trim()) disegna();
  });
}

campo.addEventListener('input', () => {
  attivo = 0;
  disegna();
});
campo.addEventListener('keydown', (e) => {
  const passo = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
  if (passo && mostrati.length) {
    e.preventDefault();
    attivo = (attivo + passo + mostrati.length) % mostrati.length;
    evidenzia();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    esegui(attivo);
  }
});
lista.addEventListener('pointermove', (e) => {
  const o = (e.target as Element).closest<HTMLElement>('[role="option"]');
  if (o && Number(o.dataset.indice) !== attivo) {
    attivo = Number(o.dataset.indice);
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
