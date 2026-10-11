/**
 * Dashboard › Eventi: modale crea/modifica, eliminazione, filtri e ricerca,
 * locandine (upload/selezione/eliminazione) e gestione tipi evento.
 * Il backend è chiamato tramite Astro Actions.
 */
import { actions } from 'astro:actions';
import { createEditor } from './editor';
import { toast } from './toast';

interface Evento {
  id: string;
  titolo: string;
  data: string;
  ora: string;
  tipo: string;
  luogo: string;
  descrizione: string;
  immagine: string;
  destinatari: string;
  costo: string;
}
interface Immagine {
  nome: string;
  path: string;
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
  tipo: $<HTMLSelectElement>('tipo'),
  luogo: $<HTMLInputElement>('luogo'),
  immagine: $<HTMLInputElement>('immagine'),
  destinatari: $<HTMLInputElement>('destinatari'),
  costo: $<HTMLInputElement>('costo'),
};

let tipiEvento: string[] = JSON.parse($('tipiEventoData').textContent || '[]');
let immagini: Immagine[] = [];
let immagineSelezionata = '';

// === CONTATORI CARATTERI ===

function updateCounter(input: HTMLInputElement) {
  const max = Number(input.dataset.counter);
  const counter = $(`${input.id}-counter`);
  const len = input.value.length;
  counter.textContent = `${len}/${max}`;
  counter.style.color = len > max * 0.9 ? 'var(--warning)' : 'var(--text-muted)';
}

function updateEditorCounter() {
  const counter = $('descrizione-counter');
  const len = editor.text.length;
  counter.textContent = `${len}/1000`;
  counter.style.color = len > 900 ? 'var(--warning)' : 'var(--text-muted)';
}

const editor = createEditor($('descrizione'), modalEvento.querySelector<HTMLElement>('.editor-toolbar')!, updateEditorCounter);
campi.titolo.addEventListener('input', () => updateCounter(campi.titolo));

// === MODALE EVENTO ===

function apriModal(ev?: Evento) {
  modalEvento.classList.add('open');
  $('modalTitle').textContent = ev ? 'Modifica Evento' : 'Nuovo Evento';
  form.reset();
  campi.id.value = ev?.id ?? '';
  editor.html = ev?.descrizione ?? '';
  if (ev) {
    campi.titolo.value = ev.titolo;
    campi.data.value = ev.data;
    campi.ora.value = ev.ora || '';
    if (tipiEvento.length) campi.tipo.value = ev.tipo && tipiEvento.includes(ev.tipo) ? ev.tipo : tipiEvento[0];
    campi.luogo.value = ev.luogo || '';
    campi.immagine.value = ev.immagine || '';
    campi.destinatari.value = ev.destinatari || '';
    campi.costo.value = ev.costo || '';
  }
  immagineSelezionata = ev?.immagine ?? '';
  updateCounter(campi.titolo);
  updateEditorCounter();
  void caricaImmagini();
}

const chiudiModal = () => modalEvento.classList.remove('open');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titolo = campi.titolo.value.trim();
  if (titolo.length < 3) return toast('Il titolo deve avere almeno 3 caratteri', 'error');
  if (!campi.data.value) return toast('La data è obbligatoria', 'error');
  if (editor.text.length > 1000) return toast('La descrizione non può superare i 1000 caratteri', 'error');

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
  if (error) return toast(error.message || 'Errore nel salvataggio', 'error');

  new Set(data.warnings).forEach((w) => toast(w, 'warning'));
  toast('Evento salvato!', 'success');
  chiudiModal();
  setTimeout(() => location.reload(), 1200);
});

async function eliminaEvento(id: string, titolo: string) {
  if (!confirm(`Sei sicuro di voler eliminare l'evento "${titolo}"?\n\nQuesta azione non può essere annullata.`)) return;
  const { error } = await actions.eventi.elimina({ id });
  if (error) return toast(error.message || "Errore durante l'eliminazione", 'error');

  toast('Evento eliminato con successo!', 'success');
  const row = document.querySelector<HTMLElement>(`tr[data-id="${CSS.escape(id)}"]`);
  if (row) {
    row.style.transition = 'opacity 0.3s, transform 0.3s';
    row.style.opacity = '0';
    row.style.transform = 'translateX(-20px)';
    setTimeout(() => row.remove(), 300);
  }
  setTimeout(() => location.reload(), 1000); // aggiorna i contatori
}

// === FILTRI E RICERCA ===

function filtraEventi(tab: HTMLElement) {
  document.querySelectorAll('.tabs .tab').forEach((t) => t.classList.remove('active'));
  tab.classList.add('active');
  const filtro = tab.dataset.filtro;
  document.querySelectorAll<HTMLElement>('.evento-row').forEach((r) => {
    const visibile =
      filtro === 'tutti' || (filtro === 'futuri' ? r.classList.contains('futuro') : r.classList.contains('passato'));
    r.style.display = visibile ? '' : 'none';
  });
}

document.getElementById('searchEventi')?.addEventListener('input', (e) => {
  const q = (e.target as HTMLInputElement).value.toLowerCase();
  document.querySelectorAll<HTMLElement>('.evento-row').forEach((r) => {
    r.style.display = r.textContent!.toLowerCase().includes(q) ? '' : 'none';
  });
});

// === LOCANDINE ===

async function caricaImmagini() {
  const { data, error } = await actions.immagini.lista();
  if (error) return console.error('Errore caricamento immagini', error);
  immagini = data.immagini;
  renderImmagini();
}

function renderImmagini() {
  const grid = $('imagesGrid');
  if (!immagini.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;grid-column:1/-1">Nessuna immagine caricata</p>';
    return;
  }
  grid.replaceChildren(
    ...immagini.map((img) => {
      const item = document.createElement('div');
      item.className = `img-item${img.path === immagineSelezionata ? ' selected' : ''}`;
      item.dataset.path = img.path;
      const el = document.createElement('img');
      el.src = `/${img.path}`;
      el.alt = img.nome;
      el.loading = 'lazy';
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'delete-img';
      del.title = 'Elimina';
      del.dataset.nome = img.nome;
      del.innerHTML = '<i class="fas fa-times"></i>';
      item.append(el, del);
      return item;
    }),
  );
}

function selezionaImmagine(path: string) {
  // Toggle: clic sull'immagine già selezionata la deseleziona
  immagineSelezionata = immagineSelezionata === path ? '' : path;
  campi.immagine.value = immagineSelezionata;
  renderImmagini();
}

$('imagesGrid').addEventListener('click', async (e) => {
  const target = e.target as Element;
  const del = target.closest<HTMLElement>('.delete-img');
  if (del) {
    const nome = del.dataset.nome!;
    if (!confirm('Eliminare questa immagine?')) return;
    const { error } = await actions.immagini.elimina({ nome });
    if (error) return toast(error.message || 'Errore eliminazione', 'error');
    toast('Immagine eliminata', 'success');
    immagini = immagini.filter((i) => i.nome !== nome);
    if (campi.immagine.value.includes(nome)) {
      campi.immagine.value = '';
      immagineSelezionata = '';
    }
    return renderImmagini();
  }
  const item = target.closest<HTMLElement>('.img-item');
  if (item) selezionaImmagine(item.dataset.path!);
});

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

fileInput.addEventListener('change', async () => {
  const formData = new FormData();
  for (const file of fileInput.files ?? []) {
    if (file.size > MAX_SIZE) toast(`${file.name}: troppo grande (max 20MB)`, 'error');
    else formData.append('immagini', file);
  }
  fileInput.value = '';
  if (!formData.has('immagini')) return;

  const { data, error } = await actions.immagini.carica(formData);
  if (error) return toast(error.message || 'Errore upload', 'error');

  const n = data.immagini.length;
  toast(`${n} immagin${n > 1 ? 'i caricate' : 'e caricata'}!`, 'success');
  immagini.unshift(...data.immagini);
  // Un evento ha una sola immagine: seleziona la prima caricata
  immagineSelezionata = '';
  selezionaImmagine(data.immagini[0].path);
  data.errori.forEach((err) => toast(err, 'warning'));
});

// === TIPI EVENTO ===

function apriModalTipi() {
  modalTipi.classList.add('open');
  renderTipi();
}
const chiudiModalTipi = () => modalTipi.classList.remove('open');

function renderTipi() {
  const list = $('tipiList');
  if (!tipiEvento.length) {
    list.innerHTML = '<span style="color:var(--text-muted);font-size:.9rem">Nessun tipo creato</span>';
    return;
  }
  list.replaceChildren(
    ...tipiEvento.map((t) => {
      const tag = document.createElement('span');
      tag.className = 'tipo-tag';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove';
      remove.title = 'Rimuovi';
      remove.dataset.tipo = t;
      remove.innerHTML = '<i class="fas fa-times"></i>';
      tag.append(t, remove);
      return tag;
    }),
  );
}

function aggiornaSelectTipo() {
  const label = document.querySelector('#tipoFormGroup label')!;
  let cogBtn = document.getElementById('tipoCogBtn') as HTMLButtonElement | null;
  if (!tipiEvento.length) {
    campi.tipo.style.display = 'none';
    campi.tipo.replaceChildren();
    $('noTipoMsg').style.display = '';
    cogBtn?.remove();
    return;
  }
  campi.tipo.style.display = '';
  $('noTipoMsg').style.display = 'none';
  if (!cogBtn) {
    cogBtn = document.createElement('button');
    cogBtn.type = 'button';
    cogBtn.id = 'tipoCogBtn';
    cogBtn.className = 'btn btn-sm';
    cogBtn.style.cssText = 'margin-left:.5rem;padding:.2rem .5rem;font-size:.7rem';
    cogBtn.dataset.apriTipi = '';
    cogBtn.setAttribute('aria-label', 'Gestisci tipi');
    cogBtn.innerHTML = '<i class="fas fa-cog"></i>';
    label.append(' ', cogBtn);
  }
  const corrente = campi.tipo.value;
  campi.tipo.replaceChildren(...tipiEvento.map((t) => new Option(t, t)));
  if (tipiEvento.includes(corrente)) campi.tipo.value = corrente;
}

$<HTMLFormElement>('formTipo').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = $<HTMLInputElement>('nuovoTipo');
  const tipo = input.value.trim();
  if (!tipo) return toast('Inserisci il nome del tipo', 'error');
  const { data, error } = await actions.tipi.aggiungi({ tipo });
  if (error) return toast(error.message || 'Errore', 'error');
  tipiEvento = data.tipi;
  renderTipi();
  aggiornaSelectTipo();
  input.value = '';
  toast('Tipo aggiunto!', 'success');
});

$('tipiList').addEventListener('click', async (e) => {
  const btn = (e.target as Element).closest<HTMLElement>('.remove');
  const tipo = btn?.dataset.tipo;
  if (!tipo) return;
  if (!confirm(`Eliminare il tipo "${tipo}"?\n\nIl tipo verrà rimosso dalla lista e non sarà più selezionabile per nuovi eventi.`)) return;
  const { data, error } = await actions.tipi.rimuovi({ tipo });
  if (error) return toast(error.message || 'Errore sconosciuto', 'error');
  tipiEvento = data.tipi;
  renderTipi();
  aggiornaSelectTipo();
  toast('Tipo eliminato', 'success');
});

// === EVENTI DI PAGINA (delegati) ===

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-nuovo-evento]')) return apriModal();
  if (t.closest('[data-chiudi-evento]') || t === modalEvento) return chiudiModal();
  if (t.closest('[data-apri-tipi]')) {
    e.preventDefault();
    return apriModalTipi();
  }
  if (t.closest('[data-chiudi-tipi]') || t === modalTipi) return chiudiModalTipi();

  const modifica = t.closest<HTMLElement>('[data-modifica]');
  if (modifica) return apriModal(JSON.parse(modifica.dataset.modifica!));
  const elimina = t.closest<HTMLElement>('[data-elimina]');
  if (elimina) return void eliminaEvento(elimina.dataset.elimina!, elimina.dataset.titolo ?? '');
  const tab = t.closest<HTMLElement>('.tabs .tab');
  if (tab) return filtraEventi(tab);
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (modalTipi.classList.contains('open')) chiudiModalTipi();
  else chiudiModal();
});
