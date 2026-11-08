/** Pezzi condivisi dagli script della dashboard (eventi, documenti, insegnanti). */
import { toast } from './toast';

export const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

/** Peso massimo di un file caricato (lo stesso limite del server). */
export const MAX_SIZE = 20 * 1024 * 1024;

/** Contatore «12/40» accanto ai campi con `data-counter`: compare solo vicino al limite, altrimenti è rumore. */
export function aggiornaContatore(input: HTMLInputElement | HTMLTextAreaElement) {
  const max = Number(input.dataset.counter);
  const contatore = $(`${input.id}-counter`);
  const len = input.value.length;
  contatore.textContent = len > max * 0.8 ? `${len}/${max}` : '';
  contatore.classList.toggle('vicino', len > max * 0.9);
}

export function attivaContatori() {
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-counter]').forEach((el) => {
    aggiornaContatore(el);
    el.addEventListener('input', () => aggiornaContatore(el));
  });
}

/** Zona di caricamento: clic, Invio o spazio aprono la scelta dei file; si possono anche trascinare. */
export function zonaCaricamento(zona: HTMLElement, input: HTMLInputElement, scelti: (files: File[]) => void) {
  zona.addEventListener('click', (e) => {
    if (e.target !== input) input.click();
  });
  zona.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });
  input.addEventListener('change', () => {
    const files = [...(input.files ?? [])];
    input.value = '';
    scelti(files);
  });
  zona.addEventListener('dragover', (e) => {
    e.preventDefault();
    zona.classList.add('sopra');
  });
  zona.addEventListener('dragleave', () => zona.classList.remove('sopra'));
  zona.addEventListener('drop', (e) => {
    e.preventDefault();
    zona.classList.remove('sopra');
    scelti([...(e.dataTransfer?.files ?? [])]);
  });
}

/**
 * Elenco riordinabile con i tasti su/giù (`data-azione`) delle righe `selettore` (con `data-id`):
 * l'elenco si aggiorna subito, `salva` riceve il nuovo ordine; se il server rifiuta si ricarica la pagina.
 */
export function elencoOrdinabile(lista: HTMLElement | null, selettore: string, salva: (ids: string[]) => Promise<{ error?: { message: string } }>) {
  const righe = () => [...(lista?.querySelectorAll<HTMLElement>(selettore) ?? [])];
  const tasto = (riga: HTMLElement, verso: 'su' | 'giu') => riga.querySelector<HTMLButtonElement>(`[data-azione="${verso}"]`)!;

  return async function sposta(riga: HTMLElement, verso: 'su' | 'giu') {
    const altra = verso === 'su' ? riga.previousElementSibling : riga.nextElementSibling;
    if (!altra) return;
    if (verso === 'su') altra.before(riga);
    else altra.after(riga);
    const tutte = righe();
    tutte.forEach((r, i) => {
      tasto(r, 'su').disabled = i === 0;
      tasto(r, 'giu').disabled = i === tutte.length - 1;
    });
    (tasto(riga, verso).disabled ? tasto(riga, verso === 'su' ? 'giu' : 'su') : tasto(riga, verso)).focus();

    const { error } = await salva(tutte.map((r) => r.dataset.id!));
    if (error) {
      toast(error.message || "Errore nel salvataggio dell'ordine", 'error');
      setTimeout(() => location.reload(), 1200);
      return;
    }
    toast('Ordine aggiornato', 'success');
  };
}
