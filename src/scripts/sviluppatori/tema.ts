import { actions } from 'astro:actions';
import { $, aEsadecimale, ascolta, chiama, el, emetti, icona, toast } from './comune';
import { doc, ritocca } from './anteprima';
import { etichettaContesto, eVariabili, salvaRegola, tutte, type RegolaCss } from './regole';

type Valore = { regola: RegolaCss; valore: string };
type Voce = { nome: string; file: string; chiaro?: Valore; scuro?: Valore; media: (Valore & { contesto: string })[] };

const CATEGORIE: [string, RegExp][] = [
  ['Movimento e animazioni', /^--(durata|curva|transition|rivela)/],
  ['Tipografia', /^--(text-|compatto-|font-|h[1-4]-|body-|small-|lead-|label-|ui-|nav-|numero-|heading-)/],
  ['Icone', /^--(icona|link-|glifo)/],
  ['Angoli e ombre', /^--(radius|shadow|ombra|anello)/],
  ['Spazi e misure', /^--(section-y|spazio|header-h|hero|onda-[hw]|ondina-[hwp]|linea-sp|revisione-bordo|revisione-linguetta)/],
  ['Decorazioni e filtri', /^--(decoro|filtro|onda-svg|ondina-svg|link-segno)/],
];

const contenitore = $('svTema');
const cerca = $<HTMLInputElement>('svCercaToken');
let font = '';

const scuro = (r: RegolaCss) => /^:root\[data-tema=['"]?scuro['"]?\]$/.test(r.selettore);

function voci(regole: RegolaCss[]): Voce[] {
  const mappa = new Map<string, Voce>();
  for (const regola of regole) {
    if (!eVariabili(regola.file) || (regola.selettore !== ':root' && !scuro(regola))) continue;
    for (const d of regola.dichiarazioni) {
      if (!d.prop.startsWith('--')) continue;
      const chiave = `${regola.file}|${d.prop}`;
      const v = mappa.get(chiave) ?? { nome: d.prop, file: regola.file, media: [] };
      const val = { regola, valore: d.valore };
      if (regola.contesti.length) v.media.push({ ...val, contesto: regola.contesti.join(' ') });
      else if (scuro(regola)) v.scuro = val;
      else v.chiaro = val;
      mappa.set(chiave, v);
    }
  }
  return [...mappa.values()];
}

function categoria(v: Voce): string {
  return CATEGORIE.find(([, r]) => r.test(v.nome))?.[0] ?? 'Colori';
}

function campo(v: Voce, val: Valore, etichetta: string, temaScuro = false): HTMLElement {
  const id = `sv-tok-${Math.random().toString(36).slice(2)}`;
  const input = el('input', { id, value: val.valore, list: 'svToken', spellcheck: 'false', class: 'sv-valore' });
  const d = doc();
  const hex = d?.body ? aEsadecimale(val.valore, d) : null;
  const colore =
    hex && !/var\(/.test(val.valore) && !/-rgb$/.test(v.nome)
      ? el('input', { type: 'color', class: 'sv-campione', value: hex, 'aria-label': `Colore ${v.nome} ${etichetta}` })
      : null;
  const anteprima = () => ritocca(val.regola.file, val.regola.selettore, val.regola.contesti, v.nome, input.value.trim() || val.valore);
  const salva = async () => {
    const nuovo = input.value.trim();
    if (!nuovo || nuovo === val.valore) return;
    await salvaRegola(val.regola, [{ prop: v.nome, valore: nuovo }]);
  };
  input.addEventListener('input', anteprima);
  input.addEventListener('change', () => void salva());
  input.addEventListener('focus', () => emetti('tema-anteprima', temaScuro ? 'scuro' : 'chiaro'));
  colore?.addEventListener('input', () => {
    input.value = colore.value;
    anteprima();
  });
  colore?.addEventListener('change', () => void salva());
  return el('div', { class: 'sv-token-valore' }, el('label', { for: id, text: etichetta }), el('div', { class: 'sv-token-campo' }, colore, input));
}

function riga(v: Voce, regole: RegolaCss[]): HTMLElement {
  const campi: HTMLElement[] = [];
  if (v.chiaro) campi.push(campo(v, v.chiaro, v.scuro ? 'Chiaro' : 'Valore'));
  if (v.scuro) campi.push(campo(v, v.scuro, 'Scuro', true));
  for (const m of v.media) campi.push(campo(v, m, etichettaContesto(m.contesto)));
  const regolaScura = regole.find((r) => r.file === v.file && scuro(r) && !r.contesti.length);
  if (!v.scuro && v.chiaro && regolaScura && categoria(v) === 'Colori') {
    const b = el('button', { type: 'button', class: 'btn btn-link', text: '+ valore per il tema scuro' });
    b.addEventListener('click', () => void salvaRegola(regolaScura, [{ prop: v.nome, valore: v.chiaro!.valore }]));
    campi.push(b);
  }
  return el('div', { class: 'sv-token' }, el('code', { class: 'sv-token-nome', text: v.nome }), el('div', { class: 'sv-token-valori' }, ...campi));
}

function sezioneFont(): HTMLElement {
  const input = el('input', { id: 'svFont', value: font, spellcheck: 'false', class: 'sv-valore' });
  const applica = el('button', { type: 'button', class: 'btn btn-primary' }, icona('fa-check'), 'Usa questo font');
  const prova = () => {
    const d = doc();
    const nome = input.value.trim();
    if (!d?.head || !/^[A-Za-z0-9 ]{2,40}$/.test(nome)) return;
    d.getElementById('sv-font')?.remove();
    d.head.append(
      Object.assign(d.createElement('link'), {
        id: 'sv-font',
        rel: 'stylesheet',
        href: `https://fonts.googleapis.com/css2?family=${nome.replace(/ /g, '+')}:ital,wght@0,300..900;1,300..900&display=swap`,
      }),
    );
    d.documentElement.style.setProperty('--font-rubik', `'${nome}', sans-serif`);
  };
  input.addEventListener('input', prova);
  applica.addEventListener('click', async () => {
    applica.disabled = true;
    const ok = await chiama(actions.sviluppatori.font({ nome: input.value }), 'Font non cambiato');
    applica.disabled = false;
    if (ok === undefined) return;
    font = input.value.trim();
    emetti('modificato');
    toast(`Font del sito: ${font}`, 'success');
  });
  return el(
    'section',
    { class: 'sv-categoria' },
    el('h2', { text: 'Carattere' }),
    el('p', { class: 'sv-spiega', text: 'Nome di un font di Google Fonts con pesi da 300 a 900 e corsivo. L’anteprima lo mostra mentre scrivi.' }),
    el('div', { class: 'campo' }, el('label', { for: 'svFont', text: 'Font del sito e della dashboard' }), input),
    applica,
  );
}

async function disegna() {
  const regole = await tutte();
  const q = cerca.value.trim().toLowerCase();
  const tutteVoci = voci(regole).filter((v) => !q || v.nome.includes(q) || [v.chiaro, v.scuro, ...v.media].some((x) => x?.valore.toLowerCase().includes(q)));
  const blocchi: HTMLElement[] = q ? [] : [sezioneFont()];
  for (const [file, titolo] of [
    ['src/styles/base/variables.css', 'Sito'],
    ['src/styles/admin/variables.css', 'Dashboard e login'],
  ]) {
    const proprie = tutteVoci.filter((v) => v.file === file);
    const gruppi = new Map<string, Voce[]>();
    for (const v of proprie) gruppi.set(categoria(v), [...(gruppi.get(categoria(v)) ?? []), v]);
    const ordine = ['Colori', ...CATEGORIE.map(([n]) => n)];
    for (const nome of ordine) {
      const lista = gruppi.get(nome);
      if (!lista?.length) continue;
      blocchi.push(el('section', { class: 'sv-categoria' }, el('h2', { text: `${nome} · ${titolo}` }), ...lista.map((v) => riga(v, regole))));
    }
  }
  if (!blocchi.length) blocchi.push(el('p', { class: 'sv-spiega', text: 'Nessun valore trovato.' }));
  const scorrimento = contenitore.parentElement?.scrollTop ?? 0;
  contenitore.replaceChildren(...blocchi);
  if (contenitore.parentElement) contenitore.parentElement.scrollTop = scorrimento;
}

export function mostraTema(attuale: string) {
  font = attuale;
  void disegna();
}

cerca.addEventListener('input', () => void disegna());
ascolta('stili', (file) => {
  if ((file === '' || (typeof file === 'string' && eVariabili(file))) && !contenitore.closest('[hidden]')) void disegna();
});
