import { actions } from 'astro:actions';
import { $, ascolta, chiama, chiedi, conferma, el, emetti, icona, toast } from './comune';
import { dimentica } from './regole';
import type { Editor } from './codice';

const albero = $('svAlbero');
const filtro = $<HTMLInputElement>('svFiltroFile');
const cercaCodice = $<HTMLInputElement>('svCercaCodice');
const nome = $('svFileNome');
const azioni = $('svFileAzioni');
const salvaBtn = $<HTMLButtonElement>('svFileSalva');
const scarica = $<HTMLAnchorElement>('svFileScarica');
const zona = $('svEditor');
const IMMAGINE = /\.(webp|png|jpe?g|avif|gif|svg|ico)$/i;

let elenco: string[] | null = null;
let corrente: string | null = null;
let editor: Editor | null = null;
let sporco = false;

export async function elencoFile(forza = false): Promise<string[]> {
  if (!elenco || forza) elenco = (await chiama(actions.sviluppatori.elenco(), 'Elenco dei file non leggibile')) ?? [];
  return elenco;
}

function bottoneFile(percorso: string, etichetta = percorso.split('/').pop()!): HTMLElement {
  const b = el('button', {
    type: 'button',
    class: 'sv-voce-file',
    'data-file': percorso,
    title: percorso,
    'aria-current': percorso === corrente ? 'true' : undefined,
    text: etichetta,
  });
  b.addEventListener('click', () => void apri(percorso));
  return b;
}

type Cartella = { cartelle: Map<string, Cartella>; file: string[] };

function disegnaCartella(c: Cartella, nomeCartella: string, aperta: boolean): HTMLElement {
  const contenuto = el(
    'div',
    { class: 'sv-cartella-corpo' },
    ...[...c.cartelle].sort(([a], [b]) => a.localeCompare(b)).map(([n, sotto]) => disegnaCartella(sotto, n, Boolean(corrente?.includes(`${n}/`)))),
    ...c.file.map((f) => bottoneFile(f)),
  );
  return el('details', { class: 'sv-cartella', open: aperta }, el('summary', { text: nomeCartella }), contenuto);
}

async function disegna() {
  const tutti = await elencoFile();
  const q = filtro.value.trim().toLowerCase();
  if (q) {
    const trovati = tutti.filter((p) => p.toLowerCase().includes(q)).slice(0, 300);
    albero.replaceChildren(...(trovati.length ? trovati.map((p) => bottoneFile(p, p)) : [el('p', { class: 'sv-spiega', text: 'Nessun file.' })]));
    return;
  }
  const radice: Cartella = { cartelle: new Map(), file: [] };
  for (const p of tutti) {
    const parti = p.split('/');
    let c = radice;
    for (const parte of parti.slice(0, -1)) {
      if (!c.cartelle.has(parte)) c.cartelle.set(parte, { cartelle: new Map(), file: [] });
      c = c.cartelle.get(parte)!;
    }
    c.file.push(p);
  }
  albero.replaceChildren(...disegnaCartella(radice, 'Progetto', true).querySelector('.sv-cartella-corpo')!.childNodes);
}

async function puoiLasciare(): Promise<boolean> {
  if (!sporco) return true;
  return conferma({ titolo: 'Modifiche non salvate', testo: `Le modifiche a ${corrente} andranno perse.`, ok: 'Lascia senza salvare', pericolo: true });
}

async function salva() {
  if (!corrente || !editor || !sporco) return;
  salvaBtn.disabled = true;
  const r = await chiama(actions.sviluppatori.scrivi({ percorso: corrente, testo: editor.valore() }), 'File non salvato');
  if (!r) {
    salvaBtn.disabled = false;
    return;
  }
  if (r.testo !== editor.valore()) editor.imposta(r.testo);
  sporco = false;
  salvaBtn.disabled = true;
  emetti('modificato');
  if (corrente.endsWith('.css')) {
    dimentica();
    emetti('stili', '');
  }
  toast(`Salvato: ${corrente}`, 'success');
}

export async function apri(percorso: string, riga?: number) {
  emetti('mostra-vista', 'file');
  if (percorso !== corrente && !(await puoiLasciare())) return;
  const r = await chiama(actions.sviluppatori.leggi({ percorso }), 'File non leggibile');
  if (!r) return;
  editor?.distruggi();
  editor = null;
  corrente = percorso;
  sporco = false;
  nome.textContent = percorso;
  azioni.hidden = false;
  salvaBtn.disabled = true;
  salvaBtn.hidden = r.testo === null;
  scarica.href = `/area-sviluppatori/file?p=${encodeURIComponent(percorso)}&scarica`;
  zona.replaceChildren();
  albero.querySelectorAll('[aria-current]').forEach((b) => b.removeAttribute('aria-current'));
  albero.querySelector(`[data-file="${CSS.escape(percorso)}"]`)?.setAttribute('aria-current', 'true');
  if (r.testo === null) {
    const input = el('input', { type: 'file', class: 'sr-only' });
    const sostituisci = el('label', { class: 'btn btn-secondary' }, icona('fa-cloud-upload-alt'), 'Sostituisci il file', input);
    input.addEventListener('change', async () => {
      const f = input.files?.[0];
      if (!f) return;
      const dati = new FormData();
      dati.append('percorso', percorso);
      dati.append('file', f);
      const azione = IMMAGINE.test(percorso) ? actions.sviluppatori.immagine : actions.sviluppatori.carica;
      if ((await chiama(azione(dati), 'File non sostituito')) === undefined) return;
      emetti('modificato');
      toast(`Sostituito: ${percorso}`, 'success');
      void apri(percorso);
    });
    zona.append(
      el(
        'div',
        { class: 'sv-binario' },
        IMMAGINE.test(percorso)
          ? el('img', { src: `/area-sviluppatori/file?p=${encodeURIComponent(percorso)}&v=${Date.now()}`, alt: `Anteprima di ${percorso}` })
          : null,
        el('p', { text: `File binario, ${(r.peso / 1024).toFixed(1)} KB.` }),
        sostituisci,
      ),
    );
    return;
  }
  const { creaEditor } = await import('./codice');
  const nuovo = await creaEditor(
    zona,
    r.testo,
    percorso,
    () => {
      sporco = true;
      salvaBtn.disabled = false;
    },
    () => void salva(),
  );
  if (corrente !== percorso) {
    nuovo.distruggi();
    return;
  }
  editor = nuovo;
  if (riga) editor.vaiRiga(riga);
}

async function cerca() {
  const q = cercaCodice.value.trim();
  if (q.length < 2) {
    void disegna();
    return;
  }
  const risultati = (await chiama(actions.sviluppatori.cerca({ query: q }))) ?? [];
  const torna = el('button', { type: 'button', class: 'btn btn-link', text: 'Torna all’elenco dei file' });
  torna.addEventListener('click', () => {
    cercaCodice.value = '';
    void disegna();
  });
  albero.replaceChildren(
    el('p', { class: 'sv-spiega', text: `${risultati.length}${risultati.length === 300 ? '+' : ''} risultati` }),
    torna,
    ...risultati.map((r) => {
      const b = el('button', { type: 'button', class: 'sv-risultato' }, el('code', { text: `${r.percorso}:${r.riga}` }), el('small', { text: r.testo }));
      b.addEventListener('click', () => void apri(r.percorso, r.riga));
      return b;
    }),
  );
}

async function dopoCambio(messaggio: string) {
  await elencoFile(true);
  void disegna();
  dimentica();
  emetti('modificato');
  emetti('stili', '');
  toast(messaggio, 'success');
}

$('svNuovoFile').addEventListener('click', async () => {
  const cartella = corrente ? corrente.split('/').slice(0, -1).join('/') : 'src';
  const percorso = await chiedi('Nuovo file', 'Percorso del file', `${cartella}/`);
  if (!percorso) return;
  const r = await chiama(actions.sviluppatori.scrivi({ percorso, testo: percorso.endsWith('.json') ? '{}\n' : '' }), 'File non creato');
  if (!r) return;
  await dopoCambio(`Creato: ${percorso}`);
  void apri(percorso);
});

$<HTMLInputElement>('svCaricaFile').addEventListener('change', async (e) => {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  input.value = '';
  if (!f) return;
  const cartella = corrente ? corrente.split('/').slice(0, -1).join('/') : 'public';
  const percorso = await chiedi('Carica un file', 'Dove salvarlo', `${cartella}/${f.name}`);
  if (!percorso) return;
  const dati = new FormData();
  dati.append('percorso', percorso);
  dati.append('file', f);
  if ((await chiama(actions.sviluppatori.carica(dati), 'File non caricato')) === undefined) return;
  await dopoCambio(`Caricato: ${percorso}`);
});

$('svFileRinomina').addEventListener('click', async () => {
  if (!corrente) return;
  const a = await chiedi('Rinomina o sposta', 'Nuovo percorso', corrente);
  if (!a || a === corrente) return;
  if ((await chiama(actions.sviluppatori.rinomina({ da: corrente, a }), 'File non rinominato')) === undefined) return;
  sporco = false;
  await dopoCambio(`Rinominato in ${a}`);
  void apri(a);
});

$('svFileElimina').addEventListener('click', async () => {
  if (!corrente) return;
  const ok = await conferma({
    titolo: 'Eliminare il file?',
    testo: `${corrente} sparirà dal sito alla prossima pubblicazione. Fino ad allora puoi recuperarlo da «Pubblica».`,
    ok: 'Elimina',
    pericolo: true,
  });
  if (!ok) return;
  const percorso = corrente;
  if ((await chiama(actions.sviluppatori.elimina({ percorso }), 'File non eliminato')) === undefined) return;
  editor?.distruggi();
  editor = null;
  corrente = null;
  sporco = false;
  nome.textContent = '';
  azioni.hidden = true;
  zona.replaceChildren();
  await dopoCambio(`Eliminato: ${percorso}`);
});

salvaBtn.addEventListener('click', () => void salva());
filtro.addEventListener('input', () => void disegna());
cercaCodice.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    void cerca();
  }
});
window.addEventListener('beforeunload', (e) => {
  if (sporco) e.preventDefault();
});
ascolta('apri-file', (dato) => {
  const { percorso, riga } = dato as { percorso: string; riga?: number };
  void apri(percorso, riga);
});
ascolta('file-scartato', async (percorso) => {
  await elencoFile(true);
  if (typeof percorso === 'string' && percorso === corrente) {
    sporco = false;
    void apri(percorso);
  }
});

export function mostraFile() {
  if (!albero.childElementCount) void disegna();
}
