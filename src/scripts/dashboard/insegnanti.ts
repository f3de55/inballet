import { actions } from 'astro:actions';
import { conferma } from './conferma';
import { $, aggiornaContatore, attivaContatori, elencoOrdinabile, MAX_SIZE, mostraModal, nascondiModal, zonaCaricamento } from './comune';
import { toast } from './toast';

interface Insegnante {
  id: string;
  nome: string;
  ruolo: string;
  bio: string;
  competenze: string[];
  foto: string;
}

attivaContatori();

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
  $('insUploadNota').textContent = nuovaFoto
    ? 'Verrà caricata al salvataggio · clicca per cambiare file'
    : 'JPG, PNG o WebP fino a 20 MB · viene ritagliata in verticale';
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

  mostraModal(modal);
  modal.querySelector('.modal-body')!.scrollTop = 0;
  if (matchMedia('(hover: hover)').matches) campi.nome.focus();
}

async function chiudiModal(forza = false) {
  if (!modal.classList.contains('open') || inCorso) return;
  if (
    !forza &&
    modificato &&
    !(await conferma({
      titolo: 'Chiudere senza salvare?',
      testo: 'Le modifiche a questo insegnante andranno perse.',
      ok: 'Chiudi senza salvare',
      pericolo: true,
    }))
  )
    return;
  nascondiModal(modal);
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
zonaCaricamento(zona, campi.file, sceltaFile);

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

const lista = document.getElementById('insLista');

const sposta = elencoOrdinabile(lista, '.ins', (ids) => actions.insegnanti.ordina({ ids }));

async function elimina(riga: HTMLElement) {
  const ins = JSON.parse(riga.dataset.modifica!) as Insegnante;
  if (
    !(await conferma({
      titolo: `Eliminare ${ins.nome}?`,
      testo: 'La scheda sparirà dalla pagina Chi siamo e la foto caricata verrà cancellata. L’operazione non si può annullare.',
      ok: 'Elimina',
      pericolo: true,
    }))
  )
    return;
  const { error } = await actions.insegnanti.elimina({ id: ins.id });
  if (error) return toast(error.message || "Errore durante l'eliminazione", 'error');

  toast('Insegnante eliminato', 'success');
  riga.classList.add('in-uscita');
  setTimeout(() => location.reload(), 700);
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
  if (e.key !== 'Escape' || document.querySelector('dialog[open]')) return;
  void chiudiModal();
});
