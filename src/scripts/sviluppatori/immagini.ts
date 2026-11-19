import { actions } from 'astro:actions';
import { $, chiama, chiedi, conferma, el, emetti, icona, toast } from './comune';
import { ritoccaImmagine } from './anteprima';
import { elencoFile } from './file';

const griglia = $('svImmagini');
const cerca = $<HTMLInputElement>('svCercaImmagini');
const IMMAGINE = /\.(webp|png|jpe?g|avif|gif|svg|ico)$/i;
let versione = Date.now();

const indirizzo = (p: string) => `/area-sviluppatori/file?p=${encodeURIComponent(p)}&v=${versione}`;

function carta(p: string): HTMLElement {
  const input = el('input', { type: 'file', accept: 'image/*', class: 'sr-only' });
  const sostituisci = el('label', { class: 'btn btn-secondary' }, icona('fa-cloud-upload-alt'), 'Sostituisci', input);
  const elimina = el('button', { type: 'button', class: 'btn btn-secondary btn-icona', 'aria-label': `Elimina ${p}`, title: 'Elimina' }, icona('fa-trash-alt'));
  const usata = el('button', { type: 'button', class: 'btn btn-link', text: 'Dove è usata' });
  const esito = el('small', { class: 'sv-usata' });
  const anteprima = el('img', { src: indirizzo(p), alt: '', loading: 'lazy' });
  const misure = el('small', { class: 'testo-piccolo' });
  anteprima.addEventListener('load', () => (misure.textContent = anteprima.naturalWidth ? `${anteprima.naturalWidth} × ${anteprima.naturalHeight}` : ''));
  input.addEventListener('change', async () => {
    const f = input.files?.[0];
    input.value = '';
    if (!f) return;
    const dati = new FormData();
    dati.append('percorso', p);
    dati.append('file', f);
    if ((await chiama(actions.sviluppatori.immagine(dati), 'Immagine non sostituita')) === undefined) return;
    versione = Date.now();
    anteprima.src = indirizzo(p);
    ritoccaImmagine(p);
    emetti('modificato');
    toast(`Sostituita: ${p}`, 'success');
  });
  elimina.addEventListener('click', async () => {
    if (
      !(await conferma({
        titolo: 'Eliminare l’immagine?',
        testo: `${p} sparirà alla prossima pubblicazione. Se il sito la usa ancora, l’area lo dice e non la elimina.`,
        ok: 'Elimina',
        pericolo: true,
      }))
    )
      return;
    if ((await chiama(actions.sviluppatori.elimina({ percorso: p }), 'Immagine non eliminata')) === undefined) return;
    await elencoFile(true);
    emetti('modificato');
    void disegna();
  });
  usata.addEventListener('click', async () => {
    const radice = (p.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
    const r = (await chiama(actions.sviluppatori.cerca({ query: radice }))) ?? [];
    const altrove = r.filter((x) => x.percorso !== p);
    esito.textContent = altrove.length ? altrove.map((x) => `${x.percorso}:${x.riga}`).join(' · ') : 'Non trovata nel codice';
  });
  return el(
    'article',
    { class: 'sv-immagine' },
    el('div', { class: 'sv-immagine-foto' }, anteprima),
    el('code', { text: p }),
    misure,
    el(
      'div',
      { class: 'sv-immagine-azioni' },
      sostituisci,
      el('a', { class: 'btn btn-secondary btn-icona', href: `${indirizzo(p)}&scarica`, 'aria-label': `Scarica ${p}`, title: 'Scarica' }, icona('fa-download')),
      elimina,
    ),
    usata,
    esito,
  );
}

async function disegna() {
  const q = cerca.value.trim().toLowerCase();
  const immagini = (await elencoFile()).filter((p) => IMMAGINE.test(p) && (!q || p.toLowerCase().includes(q)));
  griglia.replaceChildren(...(immagini.length ? immagini.map(carta) : [el('p', { class: 'sv-spiega', text: 'Nessuna immagine.' })]));
}

$<HTMLInputElement>('svNuoveImmagini').addEventListener('change', async (e) => {
  const input = e.target as HTMLInputElement;
  const file = [...(input.files ?? [])];
  input.value = '';
  if (!file.length) return;
  const cartella = await chiedi('Aggiungi immagini', 'Cartella', 'src/assets/images');
  if (!cartella) return;
  for (const f of file) {
    const dati = new FormData();
    dati.append('percorso', `${cartella.replace(/\/+$/, '')}/${f.name}`);
    dati.append('file', f);
    await chiama(actions.sviluppatori.carica(dati), `${f.name} non caricata`);
  }
  await elencoFile(true);
  emetti('modificato');
  toast(`${file.length} immagini aggiunte in ${cartella}`, 'success');
  void disegna();
});

cerca.addEventListener('input', () => void disegna());

export function mostraImmagini() {
  if (!griglia.childElementCount) void disegna();
}
