/**
 * Dashboard › Documenti: testi della pagina, modale crea/modifica documento
 * (con caricamento del PDF anche trascinando), ordine ed eliminazione.
 * Il backend è chiamato tramite Astro Actions.
 */
import { actions } from 'astro:actions';
import { conferma } from './conferma';
import { toast } from './toast';

interface Documento {
  id: string;
  titolo: string;
  nota: string;
  file: string;
  peso: string;
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

// === TESTI DELLA PAGINA ===

const formTesti = $<HTMLFormElement>('formTesti');

function aggiornaContatore(input: HTMLInputElement | HTMLTextAreaElement) {
  const max = Number(input.dataset.counter);
  const contatore = $(`${input.id}-counter`);
  const len = input.value.length;
  // Solo vicino al limite: altrimenti è rumore
  contatore.textContent = len > max * 0.8 ? `${len}/${max}` : '';
  contatore.classList.toggle('vicino', len > max * 0.9);
}

function aggiornaAnteprimaTitolo() {
  const titolo = $<HTMLInputElement>('titolo').value.trim();
  const accento = $<HTMLInputElement>('accento').value.trim();
  $('anteprimaTitolo').textContent = [titolo, accento].filter(Boolean).join(' ') || '—';
}

document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-counter]').forEach((el) => {
  aggiornaContatore(el);
  el.addEventListener('input', () => aggiornaContatore(el));
});
formTesti.addEventListener('input', aggiornaAnteprimaTitolo);
aggiornaAnteprimaTitolo();

formTesti.addEventListener('submit', async (e) => {
  e.preventDefault();
  const valore = (id: string) => $<HTMLInputElement>(id).value.trim();
  if (!valore('heroTitolo')) {
    $('heroTitolo').focus();
    return toast('Manca il titolo della pagina', 'error');
  }
  if (!valore('titolo')) {
    $('titolo').focus();
    return toast('Manca il titolo della sezione', 'error');
  }

  const salva = $<HTMLButtonElement>('btnSalvaTesti');
  salva.disabled = true;
  salva.textContent = 'Salvataggio…';
  const { error } = await actions.documenti.salvaTesti({
    heroTitolo: valore('heroTitolo'),
    heroTesto: valore('heroTesto'),
    eyebrow: valore('eyebrow'),
    titolo: valore('titolo'),
    accento: valore('accento'),
    intro: valore('intro'),
  });
  salva.disabled = false;
  salva.textContent = 'Salva i testi';
  if (error) return toast(error.message || 'Errore nel salvataggio', 'error');
  toast('Testi salvati', 'success');
});

// === MODALE DOCUMENTO ===

const modal = $('modalDocumento');
const form = $<HTMLFormElement>('formDocumento');
const campi = {
  id: $<HTMLInputElement>('documentoId'),
  titolo: $<HTMLInputElement>('docTitolo'),
  nota: $<HTMLInputElement>('docNota'),
  file: $<HTMLInputElement>('docFile'),
};
const zona = modal.querySelector<HTMLElement>('[data-upload-pdf]')!;
/** PDF scelto ma non ancora salvato. */
let nuovoFile: File | null = null;
let modificato = false;
let inCorso = false;

form.addEventListener('input', () => (modificato = true));
campi.titolo.addEventListener('input', () => aggiornaContatore(campi.titolo));
campi.nota.addEventListener('input', () => aggiornaContatore(campi.nota));

function mostraFile(doc?: Documento) {
  const nome = nuovoFile?.name;
  $('docFileAttuale').hidden = !doc;
  if (doc) {
    $('docFilePeso').textContent = doc.peso;
    $<HTMLAnchorElement>('docFileApri').href = doc.file;
  }
  $('docUploadTesto').textContent = nome ? nome : doc ? 'Sostituisci il PDF' : 'Carica il PDF';
  $('docUploadNota').textContent = nome ? 'Verrà caricato al salvataggio · clicca per cambiare file' : 'Solo file PDF, fino a 20 MB';
  zona.classList.toggle('scelto', !!nome);
}

let documentoAperto: Documento | undefined;

function apriModal(doc?: Documento) {
  form.reset();
  documentoAperto = doc;
  nuovoFile = null;
  $('modalDocumentoTitle').textContent = doc ? 'Modifica documento' : 'Nuovo documento';
  campi.id.value = doc?.id ?? '';
  campi.titolo.value = doc?.titolo ?? '';
  campi.nota.value = doc?.nota ?? '';
  aggiornaContatore(campi.titolo);
  aggiornaContatore(campi.nota);
  mostraFile(doc);
  modificato = false;

  modal.classList.add('open');
  document.documentElement.classList.add('modal-aperta');
  modal.querySelector('.modal-body')!.scrollTop = 0;
  // Su touch il focus aprirebbe subito la tastiera: solo con mouse
  if (matchMedia('(hover: hover)').matches) campi.titolo.focus();
}

async function chiudiModal(forza = false) {
  if (!modal.classList.contains('open') || inCorso) return;
  if (!forza && modificato && !(await conferma({ titolo: 'Chiudere senza salvare?', testo: 'Le modifiche a questo documento andranno perse.', ok: 'Chiudi senza salvare', pericolo: true }))) return;
  modal.classList.remove('open');
  document.documentElement.classList.remove('modal-aperta');
}

function sceltaFile(files: Iterable<File>) {
  const [file] = [...files];
  if (!file) return;
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return toast(`${file.name}: non è un PDF`, 'error');
  if (file.size > MAX_SIZE) return toast(`${file.name}: troppo grande (max 20 MB)`, 'error');
  nuovoFile = file;
  modificato = true;
  mostraFile(documentoAperto);
}

zona.addEventListener('click', (e) => {
  if (e.target !== campi.file) campi.file.click();
});
zona.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    campi.file.click();
  }
});
campi.file.addEventListener('change', () => {
  const files = [...(campi.file.files ?? [])];
  campi.file.value = '';
  sceltaFile(files);
});
zona.addEventListener('dragover', (e) => {
  e.preventDefault();
  zona.classList.add('sopra');
});
zona.addEventListener('dragleave', () => zona.classList.remove('sopra'));
zona.addEventListener('drop', (e) => {
  e.preventDefault();
  zona.classList.remove('sopra');
  sceltaFile(e.dataTransfer?.files ?? []);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titolo = campi.titolo.value.trim();
  if (!titolo) {
    campi.titolo.focus();
    return toast('Manca il titolo', 'error');
  }
  if (!documentoAperto && !nuovoFile) return toast('Carica il PDF del documento', 'error');

  const dati = new FormData();
  if (campi.id.value) dati.append('id', campi.id.value);
  dati.append('titolo', titolo);
  dati.append('nota', campi.nota.value.trim());
  if (nuovoFile) dati.append('file', nuovoFile);

  const salva = $<HTMLButtonElement>('btnSalvaDocumento');
  inCorso = true;
  salva.disabled = true;
  salva.textContent = nuovoFile ? 'Caricamento…' : 'Salvataggio…';
  const { error } = await actions.documenti.salva(dati);
  inCorso = false;
  if (error) {
    salva.disabled = false;
    salva.textContent = 'Salva documento';
    return toast(error.message || 'Errore nel salvataggio', 'error');
  }

  toast('Documento salvato', 'success');
  void chiudiModal(true);
  setTimeout(() => location.reload(), 700);
});

// === ELENCO: ORDINE ED ELIMINAZIONE ===

const lista = document.getElementById('docLista');

function aggiornaFrecce() {
  const righe = [...(lista?.querySelectorAll<HTMLElement>('.doc') ?? [])];
  righe.forEach((riga, i) => {
    riga.querySelector<HTMLButtonElement>('[data-azione="su"]')!.disabled = i === 0;
    riga.querySelector<HTMLButtonElement>('[data-azione="giu"]')!.disabled = i === righe.length - 1;
  });
}

async function sposta(riga: HTMLElement, verso: 'su' | 'giu') {
  const altra = verso === 'su' ? riga.previousElementSibling : riga.nextElementSibling;
  if (!altra) return;
  const tasto = riga.querySelector<HTMLButtonElement>(`[data-azione="${verso}"]`)!;
  // Aggiorna subito l'elenco; se il server rifiuta si ricarica la pagina
  if (verso === 'su') altra.before(riga);
  else altra.after(riga);
  aggiornaFrecce();
  (tasto.disabled ? riga.querySelector<HTMLButtonElement>(`[data-azione="${verso === 'su' ? 'giu' : 'su'}"]`)! : tasto).focus();

  const { error } = await actions.documenti.ordina({ ids: [...lista!.querySelectorAll<HTMLElement>('.doc')].map((r) => r.dataset.id!) });
  if (error) {
    toast(error.message || "Errore nel salvataggio dell'ordine", 'error');
    setTimeout(() => location.reload(), 1200);
    return;
  }
  toast('Ordine aggiornato', 'success');
}

async function elimina(riga: HTMLElement) {
  const doc = JSON.parse(riga.dataset.modifica!) as Documento;
  if (!(await conferma({ titolo: `Eliminare «${doc.titolo}»?`, testo: 'Il documento sparirà dalla pagina e il PDF caricato verrà cancellato. L’operazione non si può annullare.', ok: 'Elimina', pericolo: true }))) return;
  const { error } = await actions.documenti.elimina({ id: doc.id });
  if (error) return toast(error.message || "Errore durante l'eliminazione", 'error');

  toast('Documento eliminato', 'success');
  riga.style.transition = 'opacity .25s';
  riga.style.opacity = '0';
  setTimeout(() => location.reload(), 700); // aggiorna conteggi e stato vuoto
}

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-nuovo-documento]')) return apriModal();
  if (t.closest('[data-chiudi-documento]')) return void chiudiModal();

  const azione = t.closest<HTMLElement>('[data-azione]');
  const riga = azione?.closest<HTMLElement>('.doc');
  if (!azione || !riga) return;
  const quale = azione.dataset.azione;
  if (quale === 'elimina') return void elimina(riga);
  if (quale === 'su' || quale === 'giu') return void sposta(riga, quale);
  apriModal(JSON.parse(riga.dataset.modifica!));
});

document.addEventListener('keydown', (e) => {
  // Con un popup di conferma aperto, Esc chiude solo quello
  if (e.key !== 'Escape' || document.querySelector('dialog[open]')) return;
  void chiudiModal();
});
