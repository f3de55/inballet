/**
 * Dashboard › Elimina tutto: scelta di cosa cancellare e conferma scrivendo la parola.
 * Il pulsante si attiva solo con la parola giusta e almeno una scelta.
 */
import { actions } from 'astro:actions';
import { toast } from './toast';

const modal = document.getElementById('modalElimina');
const form = document.getElementById('formElimina') as HTMLFormElement | null;

if (modal && form) {
  const parola = form.dataset.parola!;
  const input = document.getElementById('eliminaParola') as HTMLInputElement;
  const vai = document.getElementById('eliminaVai') as HTMLButtonElement;
  const scelta = (nome: string) => (form.elements.namedItem(nome) as HTMLInputElement).checked;

  const aggiorna = () => {
    vai.disabled = input.value.trim().toUpperCase() !== parola || (!scelta('eventi') && !scelta('chatbot'));
  };

  const apri = () => {
    // Sostituisce la finestra dei dati demo, se aperta
    document.getElementById('modalDemo')?.classList.remove('open');
    form.reset();
    aggiorna();
    modal.classList.add('open');
    document.documentElement.classList.add('modal-aperta');
    if (matchMedia('(hover: hover)').matches) input.focus();
  };
  const chiudi = () => {
    modal.classList.remove('open');
    document.documentElement.classList.remove('modal-aperta');
  };

  document.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('[data-apri-elimina]')) return apri();
    if (t.closest('[data-chiudi-elimina]') || t === modal) return chiudi();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) chiudi();
  });
  form.addEventListener('input', aggiorna);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (vai.disabled) return;
    vai.disabled = true;
    vai.textContent = 'Eliminazione…';
    const { data, error } = await actions.demo.eliminaTutto({ eventi: scelta('eventi'), chatbot: scelta('chatbot'), conferma: input.value });
    if (error) {
      vai.textContent = 'Elimina definitivamente';
      aggiorna();
      return toast(error.message || "Errore durante l'eliminazione", 'error');
    }
    const parti = [
      ...(scelta('eventi') ? [`${data.eventi} eventi`, `${data.locandine} locandine`] : []),
      ...(scelta('chatbot') ? [`${data.messaggi.toLocaleString('it-IT')} messaggi`] : []),
    ];
    // "a, b e c"
    const elenco = parti.length > 1 ? `${parti.slice(0, -1).join(', ')} e ${parti.at(-1)}` : parti[0];
    toast(`Eliminati ${elenco}`, 'success');
    setTimeout(() => location.reload(), 900);
  });
}
