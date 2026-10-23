/**
 * Dashboard › Eventi: modale crea/modifica, eliminazione, filtri e ricerca,
 * locandine (upload anche trascinando, selezione, eliminazione) e gestione
 * tipi evento. Il backend è chiamato tramite Astro Actions.
 */
import { actions, isInputError } from 'astro:actions';
import { createEditor } from './editor';
import { conferma } from './conferma';
import { toast } from './toast';

/** Come salvato sul server (testi puri, senza escape). */
interface Evento {
  id: string;
  slug: string;
  titolo: string;
  data: string;
  ora: string;
  dataFine: string;
  oraFine: string;
  stato: 'pubblicato' | 'bozza' | 'annullato' | 'esaurito';
  tipo: string;
  luogo: string;
  descrizione: string;
  immagine: string;
  destinatari: string;
  costo: string;
  prenotazione: string;
}
interface Immagine {
  nome: string;
  path: string;
  /** Miniatura per la libreria */
  mini: string;
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const modalEvento = $('modalEvento');
const modalTipi = $('modalTipi');
const form = $<HTMLFormElement>('formEvento');
const campi = {
  id: $<HTMLInputElement>('eventoId'),
  titolo: $<HTMLInputElement>('titolo'),
  data: $<HTMLInputElement>('data'),
  ora: $<HTMLInputElement>('ora'),
  dataFine: $<HTMLInputElement>('dataFine'),
  oraFine: $<HTMLInputElement>('oraFine'),
  tipo: $<HTMLSelectElement>('tipo'),
  luogo: $<HTMLInputElement>('luogo'),
  immagine: $<HTMLInputElement>('immagine'),
  destinatari: $<HTMLInputElement>('destinatari'),
  costo: $<HTMLInputElement>('costo'),
  prenotazione: $<HTMLInputElement>('prenotazione'),
  stato: $<HTMLSelectElement>('stato'),
};
/** Campi del modulo per nome (per mettere il cursore sul campo con l'errore). */
const campoDi = (nome: string): HTMLElement | null => (nome === 'descrizione' ? $('descrizione') : (campi as Record<string, HTMLElement>)[nome] ?? null);

let tipiEvento: string[] = JSON.parse($('tipiEventoData').textContent || '[]');
let immagini: Immagine[] = [];
let immagineSelezionata = '';
/** Modifiche non salvate nel modulo aperto. */
let modificato = false;

// === CONTATORI CARATTERI ===

function updateCounter(input: HTMLInputElement) {
  const max = Number(input.dataset.counter);
  const counter = $(`${input.id}-counter`);
  const len = input.value.length;
  // Solo vicino al limite: altrimenti è rumore
  counter.textContent = len > max * 0.8 ? `${len}/${max}` : '';
  counter.classList.toggle('vicino', len > max * 0.9);
}

function updateEditorCounter() {
  const counter = $('descrizione-counter');
  const len = editor.text.trim().length;
  counter.textContent = len > 800 ? `${len}/1000` : '';
  counter.classList.toggle('vicino', len > 900);
}

const editor = createEditor($('descrizione'), modalEvento.querySelector<HTMLElement>('.editor-toolbar')!, () => {
  modificato = true;
  updateEditorCounter();
});
campi.titolo.addEventListener('input', () => updateCounter(campi.titolo));
form.addEventListener('input', () => (modificato = true));

// === MODALE EVENTO ===

function apriModal(ev?: Evento) {
  form.reset();
  $('modalTitle').textContent = ev ? 'Modifica evento' : 'Nuovo evento';
  campi.id.value = ev?.id ?? '';
  editor.html = ev?.descrizione ?? '';
  if (ev) {
    campi.titolo.value = ev.titolo;
    campi.data.value = ev.data;
    // <input type="time"> vuole "09:30": alcune ore sono salvate come "9:30"
    campi.ora.value = ev.ora ? ev.ora.padStart(5, '0') : '';
    if (tipiEvento.length) campi.tipo.value = ev.tipo && tipiEvento.includes(ev.tipo) ? ev.tipo : tipiEvento[0];
    campi.luogo.value = ev.luogo || '';
    campi.destinatari.value = ev.destinatari || '';
    campi.costo.value = ev.costo || '';
  }
  impostaLocandina(ev?.immagine ?? '');
  $<HTMLDetailsElement>('libreria').open = false;
  updateCounter(campi.titolo);
  updateEditorCounter();
  modificato = false;

  modalEvento.classList.add('open');
  document.documentElement.classList.add('modal-aperta');
  modalEvento.querySelector('.modal-body')!.scrollTop = 0;
  // Su touch il focus aprirebbe subito la tastiera: solo con mouse
  if (matchMedia('(hover: hover)').matches) campi.titolo.focus();
  void caricaImmagini();
}

async function chiudiModal(forza = false) {
  if (!modalEvento.classList.contains('open')) return;
  if (!forza && modificato && !(await conferma({ titolo: 'Chiudere senza salvare?', testo: 'Le modifiche a questo evento andranno perse.', ok: 'Chiudi senza salvare', pericolo: true }))) return;
  modalEvento.classList.remove('open');
  document.documentElement.classList.remove('modal-aperta');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titolo = campi.titolo.value.trim();
  if (titolo.length < 3) {
    campi.titolo.focus();
    return toast('Il titolo deve avere almeno 3 caratteri', 'error');
  }
  if (!campi.data.value) {
    campi.data.focus();
    return toast('Manca la data', 'error');
  }
  if (editor.text.length > 1000) return toast('La descrizione supera i 1000 caratteri', 'error');

  const salva = $<HTMLButtonElement>('btnSalva');
  salva.disabled = true;
  salva.textContent = 'Salvataggio…';
  const { data, error } = await actions.eventi.salva({
    id: campi.id.value || undefined,
    titolo,
    data: campi.data.value,
    ora: campi.ora.value,
    tipo: campi.tipo.value,
    luogo: campi.luogo.value.trim(),
    descrizione: editor.html,
    immagine: campi.immagine.value.trim(),
    destinatari: campi.destinatari.value.trim(),
    costo: campi.costo.value.trim(),
  });
  if (error) {
    salva.disabled = false;
    salva.textContent = 'Salva evento';
    return toast(error.message || 'Errore nel salvataggio', 'error');
  }

  new Set(data.warnings).forEach((w) => toast(w, 'warning'));
  toast('Evento salvato', 'success');
  void chiudiModal(true);
  setTimeout(() => location.reload(), data.warnings.length ? 2500 : 700);
});

// Sedi: un tocco compila il luogo
modalEvento.addEventListener('click', (e) => {
  const chip = (e.target as Element).closest<HTMLElement>('[data-luogo]');
  if (!chip) return;
  campi.luogo.value = chip.dataset.luogo!;
  modificato = true;
});

async function eliminaEvento(row: HTMLElement) {
  const ev = JSON.parse(row.dataset.modifica!) as Evento;
  if (!(await conferma({ titolo: `Eliminare «${ev.titolo}»?`, testo: "L'evento sparirà dal calendario del sito. L'operazione non si può annullare.", ok: 'Elimina', pericolo: true }))) return;
  const { error } = await actions.eventi.elimina({ id: ev.id });
  if (error) return toast(error.message || "Errore durante l'eliminazione", 'error');

  toast('Evento eliminato', 'success');
  row.style.transition = 'opacity .25s';
  row.style.opacity = '0';
  setTimeout(() => location.reload(), 700); // aggiorna conteggi e gruppi
}

// === FILTRI E RICERCA ===

const cerca = document.getElementById('searchEventi') as HTMLInputElement | null;
let filtro = 'futuri';

function aggiornaElenco() {
  const q = cerca?.value.trim().toLowerCase() ?? '';
  let trovati = 0;
  document.querySelectorAll<HTMLElement>('.ev-gruppo').forEach((gruppo) => {
    // La ricerca guarda in tutti gli eventi, non solo nel filtro scelto
    const nelFiltro = q || filtro === 'tutti' || gruppo.dataset.gruppo === filtro;
    let visibiliGruppo = 0;
    gruppo.querySelectorAll<HTMLElement>('.ev-mese').forEach((mese) => {
      let visibiliMese = 0;
      mese.querySelectorAll<HTMLElement>('.ev').forEach((r) => {
        const ok = !q || r.dataset.cerca!.includes(q);
        r.hidden = !ok;
        if (ok) visibiliMese++;
      });
      mese.hidden = !visibiliMese;
      visibiliGruppo += visibiliMese;
    });
    const vuotoGruppo = gruppo.querySelector<HTMLElement>(':scope > .ev-vuoto');
    if (vuotoGruppo) vuotoGruppo.hidden = !!q;
    gruppo.hidden = !nelFiltro || (!!q && !visibiliGruppo);
    if (!gruppo.hidden) trovati += visibiliGruppo;
  });
  const nessuno = document.getElementById('nessunRisultato');
  if (nessuno) nessuno.hidden = !q || trovati > 0;
}

function scegliFiltro(btn: HTMLElement) {
  filtro = btn.dataset.filtro!;
  document.querySelectorAll<HTMLElement>('.filtro').forEach((b) => {
    b.classList.toggle('attivo', b === btn);
    b.setAttribute('aria-pressed', String(b === btn));
  });
  aggiornaElenco();
}

cerca?.addEventListener('input', aggiornaElenco);

// === LOCANDINE ===

/** Imposta la locandina scelta: campo nascosto, anteprima e griglia. */
function impostaLocandina(path: string) {
  immagineSelezionata = path;
  campi.immagine.value = path;
  const anteprima = $('locandinaAnteprima');
  anteprima.hidden = !path;
  if (path) $<HTMLImageElement>('locandinaImg').src = `/${path}`;
  $('uploadTesto').textContent = path ? 'Carica un’altra locandina' : 'Carica una locandina';
  renderImmagini();
}

$('locandinaTogli').addEventListener('click', () => {
  impostaLocandina('');
  modificato = true;
});

async function caricaImmagini() {
  const { data, error } = await actions.immagini.lista();
  if (error) return console.error('Errore caricamento immagini', error);
  immagini = data.immagini;
  renderImmagini();
}

function renderImmagini() {
  const grid = $('imagesGrid');
  $('libreriaN').textContent = immagini.length ? `(${immagini.length})` : '';
  if (!immagini.length) {
    grid.innerHTML = '<p class="nota">Nessuna locandina caricata finora.</p>';
    return;
  }
  grid.replaceChildren(
    ...immagini.map((img) => {
      const item = document.createElement('div');
      item.className = `img-item${img.path === immagineSelezionata ? ' selected' : ''}`;
      item.dataset.path = img.path;
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.setAttribute('aria-pressed', String(img.path === immagineSelezionata));
      item.setAttribute('aria-label', `Usa ${img.nome}`);
      const el = document.createElement('img');
      el.src = `/${img.path}`;
      el.alt = '';
      el.loading = 'lazy';
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'delete-img';
      del.title = 'Elimina definitivamente';
      del.setAttribute('aria-label', `Elimina ${img.nome}`);
      del.dataset.nome = img.nome;
      del.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
      item.append(el, del);
      return item;
    }),
  );
}

async function gestisciGriglia(target: Element) {
  const del = target.closest<HTMLElement>('.delete-img');
  if (del) {
    const nome = del.dataset.nome!;
    if (!(await conferma({ titolo: 'Eliminare questa locandina?', testo: 'Il file viene cancellato definitivamente: gli eventi che la usano resteranno senza immagine.', ok: 'Elimina', pericolo: true }))) return;
    const { error } = await actions.immagini.elimina({ nome });
    if (error) return toast(error.message || 'Errore eliminazione', 'error');
    toast('Locandina eliminata', 'success');
    immagini = immagini.filter((i) => i.nome !== nome);
    if (campi.immagine.value.includes(nome)) impostaLocandina('');
    else renderImmagini();
    return;
  }
  const item = target.closest<HTMLElement>('.img-item');
  if (!item) return;
  // Clic sulla locandina già scelta: la toglie
  impostaLocandina(immagineSelezionata === item.dataset.path ? '' : item.dataset.path!);
  modificato = true;
}

const grid = $('imagesGrid');
grid.addEventListener('click', (e) => void gestisciGriglia(e.target as Element));
grid.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).classList.contains('img-item')) {
    e.preventDefault();
    void gestisciGriglia(e.target as Element);
  }
});

async function caricaFile(files: Iterable<File>) {
  const formData = new FormData();
  for (const file of files) {
    if (!file.type.startsWith('image/')) toast(`${file.name}: non è un'immagine`, 'error');
    else if (file.size > MAX_SIZE) toast(`${file.name}: troppo grande (max 20 MB)`, 'error');
    else formData.append('immagini', file);
  }
  if (!formData.has('immagini')) return;

  uploadZone.classList.add('in-corso');
  const { data, error } = await actions.immagini.carica(formData);
  uploadZone.classList.remove('in-corso');
  if (error) return toast(error.message || 'Errore nel caricamento', 'error');

  const n = data.immagini.length;
  toast(n > 1 ? `${n} locandine caricate` : 'Locandina caricata', 'success');
  immagini.unshift(...data.immagini);
  // Un evento ha una sola locandina: si usa la prima caricata
  impostaLocandina(data.immagini[0].path);
  modificato = true;
  data.errori.forEach((err) => toast(err, 'warning'));
}

const fileInput = $<HTMLInputElement>('fileInput');
const uploadZone = modalEvento.querySelector<HTMLElement>('[data-upload]')!;
uploadZone.addEventListener('click', (e) => {
  if (e.target !== fileInput) fileInput.click();
});
uploadZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});
fileInput.addEventListener('change', () => {
  const files = [...(fileInput.files ?? [])];
  fileInput.value = '';
  void caricaFile(files);
});

// Trascinamento dal computer
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('sopra');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('sopra'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('sopra');
  void caricaFile(e.dataTransfer?.files ?? []);
});

// === TIPI EVENTO ===

function apriModalTipi() {
  modalTipi.classList.add('open');
  document.documentElement.classList.add('modal-aperta');
  renderTipi();
}
function chiudiModalTipi() {
  modalTipi.classList.remove('open');
  if (!modalEvento.classList.contains('open')) document.documentElement.classList.remove('modal-aperta');
}

function renderTipi() {
  const list = $('tipiList');
  if (!tipiEvento.length) {
    list.innerHTML = '<li class="nota">Nessun tipo creato.</li>';
    return;
  }
  list.replaceChildren(
    ...tipiEvento.map((t) => {
      const li = document.createElement('li');
      const nome = document.createElement('span');
      nome.textContent = t;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'btn-link btn-link--rosso';
      remove.dataset.tipo = t;
      remove.textContent = 'Rimuovi';
      remove.setAttribute('aria-label', `Rimuovi ${t}`);
      li.append(nome, remove);
      return li;
    }),
  );
}

function aggiornaSelectTipo() {
  campi.tipo.hidden = !tipiEvento.length;
  $('noTipoMsg').hidden = tipiEvento.length > 0;
  const corrente = campi.tipo.value;
  campi.tipo.replaceChildren(...tipiEvento.map((t) => new Option(t, t)));
  if (tipiEvento.includes(corrente)) campi.tipo.value = corrente;
}

$<HTMLFormElement>('formTipo').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = $<HTMLInputElement>('nuovoTipo');
  const tipo = input.value.trim();
  if (!tipo) return toast('Scrivi il nome del tipo', 'error');
  const { data, error } = await actions.tipi.aggiungi({ tipo });
  if (error) return toast(error.message || 'Errore', 'error');
  tipiEvento = data.tipi;
  renderTipi();
  aggiornaSelectTipo();
  campi.tipo.value = tipo;
  input.value = '';
  toast('Tipo aggiunto', 'success');
});

$('tipiList').addEventListener('click', async (e) => {
  const tipo = (e.target as Element).closest<HTMLElement>('[data-tipo]')?.dataset.tipo;
  if (!tipo) return;
  if (!(await conferma({ titolo: `Rimuovere il tipo «${tipo}»?`, testo: 'Gli eventi che lo usano lo mantengono, ma non sarà più selezionabile.', ok: 'Rimuovi', pericolo: true }))) return;
  const { data, error } = await actions.tipi.rimuovi({ tipo });
  if (error) return toast(error.message || 'Errore', 'error');
  tipiEvento = data.tipi;
  renderTipi();
  aggiornaSelectTipo();
  toast('Tipo rimosso', 'success');
});

// === EVENTI DI PAGINA (delegati) ===

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-nuovo-evento]')) return apriModal();
  if (t.closest('[data-chiudi-evento]')) return void chiudiModal();
  if (t.closest('[data-apri-tipi]')) {
    e.preventDefault();
    return apriModalTipi();
  }
  if (t.closest('[data-chiudi-tipi]') || t === modalTipi) return chiudiModalTipi();

  const azione = t.closest<HTMLElement>('[data-azione]');
  const row = azione?.closest<HTMLElement>('.ev');
  if (azione && row) {
    if (azione.dataset.azione === 'elimina') return void eliminaEvento(row);
    return apriModal(JSON.parse(row.dataset.modifica!));
  }
  const btnFiltro = t.closest<HTMLElement>('.filtro');
  if (btnFiltro) return scegliFiltro(btnFiltro);
});

document.addEventListener('keydown', (e) => {
  // Con un popup di conferma aperto, Esc chiude solo quello
  if (e.key !== 'Escape' || document.querySelector('dialog[open]')) return;
  if (modalTipi.classList.contains('open')) chiudiModalTipi();
  else void chiudiModal();
});
