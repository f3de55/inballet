/**
 * Dashboard › Insegnanti: intestazione della sezione, modale crea/modifica
 * insegnante (con foto caricabile anche trascinando), ordine ed eliminazione.
 * Il backend è chiamato tramite Astro Actions.
 */
import { actions } from 'astro:actions';
import { conferma } from './conferma';
import { toast } from './toast';

interface Insegnante {
  id: string;
  nome: string;
  ruolo: string;
  bio: string;
  competenze: string[];
  foto: string;
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

function aggiornaContatore(input: HTMLInputElement | HTMLTextAreaElement) {
  const max = Number(input.dataset.counter);
  const contatore = $(`${input.id}-counter`);
  const len = input.value.length;
  // Solo vicino al limite: altrimenti è rumore
  contatore.textContent = len > max * 0.8 ? `${len}/${max}` : '';
  contatore.classList.toggle('vicino', len > max * 0.9);
}

document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-counter]').forEach((el) => {
  aggiornaContatore(el);
  el.addEventListener('input', () => aggiornaContatore(el));
});

// === INTESTAZIONE DELLA SEZIONE ===

const formTesti = $<HTMLFormElement>('formTestiInsegnanti');
const valore = (id: string) => $<HTMLInputElement>(id).value.trim();

function aggiornaAnteprimaTitolo() {
  $('anteprimaTitolo').textContent = [valore('titolo'), valore('accento')].filter(Boolean).join(' ') || '—';
}
formTesti.addEventListener('input', aggiornaAnteprimaTitolo);
aggiornaAnteprimaTitolo();

formTesti.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!valore('titolo')) {
    $('titolo').focus();
    return toast('Manca il titolo della sezione', 'error');
  }
  const salva = $<HTMLButtonElement>('btnSalvaTesti');
  salva.disabled = true;
  salva.textContent = 'Salvataggio…';
  const { error } = await actions.insegnanti.salvaTesti({
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

// === MODALE INSEGNANTE ===

const modal = $('modalInsegnante');
const form = $<HTMLFormElement>('formInsegnante');
const campi = {
  id: $<HTMLInputElement>('insegnanteId'),
  nome: $<HTMLInputElement>('insNome'),
  ruolo: $<HTMLInputElement>('insRuolo'),
  bio: $<HTMLTextAreaElement>('insBio'),
  competenze: $<HTMLTextAreaElement>('insCompetenze'),
  file: $<HTMLInputElement>('insFile'),
};
const zona = modal.querySelector<HTMLElement>('[data-upload-foto]')!;
/** Foto scelta ma non ancora salvata. */
let nuovaFoto: File | null = null;
let togliFoto = false;
let anteprimaUrl = '';
let aperto: Insegnante | undefined;
let modificato = false;
let inCorso = false;

form.addEventListener('input', () => (modificato = true));

function mostraFoto() {
  if (anteprimaUrl) URL.revokeObjectURL(anteprimaUrl);
  anteprimaUrl = nuovaFoto ? URL.createObjectURL(nuovaFoto) : '';
  const src = anteprimaUrl || (!togliFoto && aperto?.foto) || '';
  $('insFotoAttuale').hidden = !src;
  if (src) $<HTMLImageElement>('insFotoAnteprima').src = src;
  $('insUploadTesto').textContent = nuovaFoto ? nuovaFoto.name : src ? 'Sostituisci la foto' : 'Carica la foto';
  $('insUploadNota').textContent = nuovaFoto ? 'Verrà caricata al salvataggio · clicca per cambiare file' : 'JPG, PNG o WebP fino a 20 MB · viene ritagliata in verticale';
  zona.classList.toggle('scelto', !!nuovaFoto);
}

function apriModal(ins?: Insegnante) {
  form.reset();
  aperto = ins;
  nuovaFoto = null;
  togliFoto = false;
  $('modalInsegnanteTitle').textContent = ins ? 'Modifica insegnante' : 'Nuovo insegnante';
  campi.id.value = ins?.id ?? '';
  campi.nome.value = ins?.nome ?? '';
  campi.ruolo.value = ins?.ruolo ?? '';
  campi.bio.value = ins?.bio ?? '';
  campi.competenze.value = (ins?.competenze ?? []).join('\n');
  [campi.nome, campi.ruolo, campi.bio].forEach(aggiornaContatore);
  mostraFoto();
  modificato = false;

  modal.classList.add('open');
  document.documentElement.classList.add('modal-aperta');
  modal.querySelector('.modal-body')!.scrollTop = 0;
  // Su touch il focus aprirebbe subito la tastiera: solo con mouse
  if (matchMedia('(hover: hover)').matches) campi.nome.focus();
}

async function chiudiModal(forza = false) {
  if (!modal.classList.contains('open') || inCorso) return;
  if (!forza && modificato && !(await conferma({ titolo: 'Chiudere senza salvare?', testo: 'Le modifiche a questo insegnante andranno perse.', ok: 'Chiudi senza salvare', pericolo: true }))) return;
  modal.classList.remove('open');
  document.documentElement.classList.remove('modal-aperta');
}

function sceltaFile(files: Iterable<File>) {
  const [file] = [...files];
  if (!file) return;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return toast(`${file.name}: usa una foto JPG, PNG o WebP`, 'error');
  if (file.size > MAX_SIZE) return toast(`${file.name}: troppo grande (max 20 MB)`, 'error');
  nuovaFoto = file;
  togliFoto = false;
  modificato = true;
  mostraFoto();
}

$('insTogliFoto').addEventListener('click', () => {
  nuovaFoto = null;
  togliFoto = true;
  modificato = true;
  mostraFoto();
});
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
  const nome = campi.nome.value.trim();
  if (!nome) {
    campi.nome.focus();
    return toast('Manca il nome', 'error');
  }

  const dati = new FormData();
  if (campi.id.value) dati.append('id', campi.id.value);
  dati.append('nome', nome);
  dati.append('ruolo', campi.ruolo.value.trim());
  dati.append('bio', campi.bio.value.trim());
  dati.append('competenze', campi.competenze.value);
  if (nuovaFoto) dati.append('foto', nuovaFoto);
  if (togliFoto) dati.append('togliFoto', 'true');

  const salva = $<HTMLButtonElement>('btnSalvaInsegnante');
  inCorso = true;
  salva.disabled = true;
  salva.textContent = nuovaFoto ? 'Caricamento…' : 'Salvataggio…';
  const { error } = await actions.insegnanti.salva(dati);
  inCorso = false;
  if (error) {
    salva.disabled = false;
    salva.textContent = 'Salva insegnante';
    return toast(error.message || 'Errore nel salvataggio', 'error');
  }

  toast('Insegnante salvato', 'success');
  void chiudiModal(true);
  setTimeout(() => location.reload(), 700);
});

// === ELENCO: ORDINE ED ELIMINAZIONE ===

const lista = document.getElementById('insLista');

function aggiornaFrecce() {
  const righe = [...(lista?.querySelectorAll<HTMLElement>('.ins') ?? [])];
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

  const { error } = await actions.insegnanti.ordina({ ids: [...lista!.querySelectorAll<HTMLElement>('.ins')].map((r) => r.dataset.id!) });
  if (error) {
    toast(error.message || "Errore nel salvataggio dell'ordine", 'error');
    setTimeout(() => location.reload(), 1200);
    return;
  }
  toast('Ordine aggiornato', 'success');
}

async function elimina(riga: HTMLElement) {
  const ins = JSON.parse(riga.dataset.modifica!) as Insegnante;
  if (!(await conferma({ titolo: `Eliminare ${ins.nome}?`, testo: 'La scheda sparirà dalla pagina Chi siamo e la foto caricata verrà cancellata. L’operazione non si può annullare.', ok: 'Elimina', pericolo: true }))) return;
  const { error } = await actions.insegnanti.elimina({ id: ins.id });
  if (error) return toast(error.message || "Errore durante l'eliminazione", 'error');

  toast('Insegnante eliminato', 'success');
  riga.style.transition = 'opacity .25s';
  riga.style.opacity = '0';
  setTimeout(() => location.reload(), 700); // aggiorna conteggi e stato vuoto
}

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-nuovo-insegnante]')) return apriModal();
  if (t.closest('[data-chiudi-insegnante]')) return void chiudiModal();

  const azione = t.closest<HTMLElement>('[data-azione]');
  const riga = azione?.closest<HTMLElement>('.ins');
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
