import { $, ascolta, el, icona, toast } from './comune';
import { doc } from './anteprima';
import { cartaRegola, tutte, type RegolaCss } from './regole';

const contenitore = $('svAnimazioni');
const cerca = $<HTMLInputElement>('svCercaAnimazioni');
const MOVIMENTO = /^(animation|transition)/;

function riproduci(nome: string) {
  const d = doc();
  const animazioni = (d?.getAnimations() ?? []).filter((a) => (a as CSSAnimation).animationName === nome);
  if (!animazioni.length) {
    toast(`«${nome}» non è in corso in questa pagina (può partire allo scorrimento o su un'altra pagina)`, 'warning');
    return;
  }
  for (const a of animazioni) {
    a.cancel();
    a.play();
  }
}

async function disegna() {
  const regole = await tutte();
  const q = cerca.value.trim().toLowerCase();
  const fotogrammi = new Map<string, RegolaCss[]>();
  for (const r of regole) {
    if (!r.fotogrammi) continue;
    const chiave = `${r.fotogrammi}|${r.file}`;
    fotogrammi.set(chiave, [...(fotogrammi.get(chiave) ?? []), r]);
  }
  const blocchi: HTMLElement[] = [];
  const animazioni = [...fotogrammi].filter(([k]) => !q || k.toLowerCase().includes(q));
  if (animazioni.length) {
    blocchi.push(
      el(
        'section',
        { class: 'sv-categoria' },
        el('h3', { text: 'Animazioni (@keyframes)' }),
        ...animazioni.map(([chiave, lista]) => {
          const [nome, file] = chiave.split('|');
          const play = el('button', { type: 'button', class: 'btn btn-secondary' }, icona('fa-redo-alt'), 'Riproduci');
          play.addEventListener('click', () => riproduci(nome));
          return el(
            'div',
            { class: 'sv-fotogrammi' },
            el('div', { class: 'sv-fotogrammi-testa' }, el('h4', { text: nome }), el('code', { text: file.replace(/^src\/styles\//, '') }), play),
            ...lista.map((r) => cartaRegola(r, { titolo: r.selettore })),
          );
        }),
      ),
    );
  }
  const movimento = regole.filter(
    (r) => !r.fotogrammi && r.dichiarazioni.some((d) => MOVIMENTO.test(d.prop)) && (!q || r.selettore.toLowerCase().includes(q) || r.file.includes(q)),
  );
  if (movimento.length) {
    blocchi.push(
      el(
        'section',
        { class: 'sv-categoria' },
        el('h3', { text: 'Transizioni ed effetti al passaggio del mouse' }),
        el('p', { class: 'sv-spiega', text: 'Durate e curve comuni sono nel Tema, gruppo «Movimento e animazioni».' }),
        ...movimento.slice(0, 150).map((r) => cartaRegola(r, { filtro: (d) => MOVIMENTO.test(d.prop) })),
      ),
    );
  }
  if (!blocchi.length) blocchi.push(el('p', { class: 'sv-spiega', text: 'Nessuna animazione trovata.' }));
  const scorrimento = contenitore.parentElement?.scrollTop ?? 0;
  contenitore.replaceChildren(...blocchi);
  if (contenitore.parentElement) contenitore.parentElement.scrollTop = scorrimento;
}

export function mostraAnimazioni() {
  void disegna();
}

cerca.addEventListener('input', () => void disegna());
ascolta('stili', () => {
  if (contenitore.checkVisibility()) void disegna();
});
