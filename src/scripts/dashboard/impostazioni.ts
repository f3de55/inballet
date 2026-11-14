import { actions } from 'astro:actions';
import { toast } from './toast';
import { mostraModal, nascondiModal } from './comune';

const modal = document.getElementById('modalImpostazioni');
const form = document.getElementById('formImpostazioni') as HTMLFormElement | null;

if (modal && form) {
  const revisione = document.getElementById('impRevisione') as HTMLInputElement;
  const campi = document.getElementById('impCampiRevisione')!;
  const foglio = document.getElementById('impFoglio') as HTMLInputElement;
  const cartella = document.getElementById('impCartella') as HTMLInputElement;
  const salva = document.getElementById('impSalva') as HTMLButtonElement;

  const mostraCampi = () => {
    campi.hidden = !revisione.checked;
  };

  document.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('[data-apri-impostazioni]')) return mostraModal(modal);
    if (t.closest('[data-chiudi-impostazioni]') || t === modal) return nascondiModal(modal);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) nascondiModal(modal);
  });
  revisione.addEventListener('change', () => {
    mostraCampi();
    if (revisione.checked && !foglio.value) foglio.focus();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    salva.disabled = true;
    salva.textContent = revisione.checked ? 'Preparo la tabella…' : 'Salvataggio…';
    const { data, error } = await actions.impostazioni.salva({ revisione: revisione.checked, foglio: foglio.value, cartella: cartella.value });
    salva.disabled = false;
    salva.textContent = 'Salva';
    if (error) return toast(error.message || 'Impostazioni non salvate', 'error');
    if (data.avviso) return toast(data.avviso, 'warning');
    if (!revisione.checked) return toast('Modalità revisione spenta', 'success');
    const dove = data.cartella ? ` · file in «${data.cartella}»` : '';
    toast(`Modalità revisione attiva: tabella pronta in «${data.foglio}»${dove}`, 'success');
  });
}
