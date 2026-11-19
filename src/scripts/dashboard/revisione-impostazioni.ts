import { actions } from 'astro:actions';
import { toast } from './toast';

const form = document.getElementById('formRevisione') as HTMLFormElement | null;

if (form) {
  const revisione = document.getElementById('impRevisione') as HTMLInputElement;
  const campi = document.getElementById('impCampiRevisione')!;
  const foglio = document.getElementById('impFoglio') as HTMLInputElement;
  const cartella = document.getElementById('impCartella') as HTMLInputElement;
  const email = document.getElementById('impEmail') as HTMLInputElement;
  const salva = document.getElementById('impSalva') as HTMLButtonElement;

  revisione.addEventListener('change', () => {
    campi.hidden = !revisione.checked;
    if (revisione.checked && !foglio.value) foglio.focus();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    salva.disabled = true;
    salva.textContent = revisione.checked ? 'Preparo la tabella…' : 'Salvataggio…';
    const { data, error } = await actions.impostazioni.salva({
      revisione: revisione.checked,
      foglio: foglio.value,
      cartella: cartella.value,
      email: email.value,
    });
    salva.disabled = false;
    salva.textContent = 'Salva';
    if (error) return toast(error.message || 'Impostazioni non salvate', 'error');
    if (data.avviso) return toast(data.avviso, 'warning');
    if (!revisione.checked) return toast('Modalità revisione spenta', 'success');
    const dove = data.cartella ? ` · file in «${data.cartella}»` : '';
    toast(`Modalità revisione attiva: tabella pronta in «${data.foglio}»${dove}`, 'success');
  });
}
