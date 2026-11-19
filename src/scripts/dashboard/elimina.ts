import { actions } from 'astro:actions';
import { toast } from './toast';

const form = document.getElementById('formElimina') as HTMLFormElement | null;

if (form) {
  const parola = form.dataset.parola!;
  const input = document.getElementById('eliminaParola') as HTMLInputElement;
  const vai = document.getElementById('eliminaVai') as HTMLButtonElement;
  const scelta = (nome: string) => (form.elements.namedItem(nome) as HTMLInputElement).checked;

  const aggiorna = () => {
    vai.disabled = input.value.trim().toUpperCase() !== parola || (!scelta('eventi') && !scelta('chatbot'));
  };
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
    const elenco = parti.length > 1 ? `${parti.slice(0, -1).join(', ')} e ${parti.at(-1)}` : parti[0];
    toast(`Eliminati ${elenco}`, 'success');
    setTimeout(() => location.reload(), 900);
  });
}
