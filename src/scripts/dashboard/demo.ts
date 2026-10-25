/**
 * Dashboard › Dati demo: apertura del pannello, scelta della quantità,
 * generazione e rimozione (sempre dopo una conferma).
 */
import { actions } from 'astro:actions';
import { conferma } from './conferma';
import { toast } from './toast';

const modal = document.getElementById('modalDemo');

if (modal) {
  const tipo = modal.dataset.demo as 'eventi' | 'chatbot';
  const eventi = tipo === 'eventi';
  const presenti = Number(modal.dataset.presenti);
  const form = document.getElementById('formDemo') as HTMLFormElement | null;
  const quanti = document.getElementById('demoQuanti') as HTMLInputElement | null;
  const genera = document.getElementById('demoGenera') as HTMLButtonElement | null;
  const unita = form?.dataset.unita ?? '';
  const max = Number(quanti?.max ?? 0);

  const valore = () => Math.max(1, Math.min(max, Math.round(Number(quanti?.value) || 1)));
  const aggiornaPulsante = () => {
    if (genera) genera.textContent = `Genera ${valore().toLocaleString('it-IT')} ${unita}`;
  };

  const apri = () => {
    modal.classList.add('open');
    document.documentElement.classList.add('modal-aperta');
  };
  const chiudi = () => {
    modal.classList.remove('open');
    document.documentElement.classList.remove('modal-aperta');
  };

  document.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('[data-apri-demo]')) return apri();
    if (t.closest('[data-chiudi-demo]') || t === modal) return chiudi();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open') && !document.querySelector('dialog[open]')) chiudi();
  });

  // Quantità: +/−, scorciatoie, campo libero
  modal.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const passo = t.closest<HTMLElement>('[data-passo]')?.dataset.passo;
    const rapido = t.closest<HTMLElement>('[data-valore]')?.dataset.valore;
    if (!quanti || (!passo && !rapido)) return;
    // Il passo cresce con il numero: 1 per gli eventi, 50 per i messaggi
    quanti.value = String(rapido ? Number(rapido) : Math.max(1, Math.min(max, valore() + Number(passo) * (eventi ? 1 : 50))));
    aggiornaPulsante();
  });
  quanti?.addEventListener('input', aggiornaPulsante);
  quanti?.addEventListener('blur', () => {
    quanti.value = String(valore());
    aggiornaPulsante();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const n = valore();
    const ok = await conferma({
      titolo: `Generare ${n.toLocaleString('it-IT')} ${unita} demo?`,
      testo: eventi
        ? 'Compariranno qui e anche nel calendario pubblico del sito, finché non li rimuovi.'
        : 'Verranno aggiunti al registro del chatbot e contati nelle statistiche, finché non li rimuovi.',
      ok: 'Genera',
    });
    if (!ok || !genera) return;

    genera.disabled = true;
    genera.textContent = eventi ? `Creo ${n} eventi e locandine…` : 'Generazione in corso…';
    const giorni = Number((document.getElementById('demoGiorni') as HTMLSelectElement | null)?.value ?? 30);
    const { data, error } = eventi
      ? await actions.demo.eventi({ quanti: n })
      : await actions.demo.chatbot({ quanti: n, giorni });
    if (error) {
      genera.disabled = false;
      aggiornaPulsante();
      return toast(error.message || 'Errore nella generazione', 'error');
    }
    toast(`${data.creati.toLocaleString('it-IT')} ${unita} demo creati`, 'success');
    setTimeout(() => {
      // Chatbot: mostra il periodo appena riempito (stesso link del filtro "N giorni", date di Roma)
      const periodo = [...document.querySelectorAll<HTMLAnchorElement>('.periodo .filtro')].find((a) => parseInt(a.textContent!, 10) === giorni);
      if (eventi || !periodo) location.reload();
      else location.href = periodo.href;
    }, 700);
  });

  document.getElementById('demoRimuovi')?.addEventListener('click', async (e) => {
    // currentTarget non è più disponibile dopo l'await: lo si legge subito
    const btn = e.currentTarget as HTMLButtonElement;
    const ok = await conferma({
      titolo: `Rimuovere ${presenti.toLocaleString('it-IT')} ${unita} demo?`,
      testo: eventi
        ? 'Gli eventi demo e le loro locandine verranno eliminati. Gli eventi inseriti da te non vengono toccati.'
        : 'I messaggi demo spariranno dalle statistiche. Le conversazioni vere non vengono toccate.',
      ok: 'Rimuovi',
      pericolo: true,
    });
    if (!ok) return;
    btn.disabled = true;
    btn.textContent = 'Rimozione…';
    const { data, error } = eventi ? await actions.demo.rimuoviEventi() : await actions.demo.rimuoviChatbot();
    if (error) {
      btn.disabled = false;
      return toast(error.message || 'Errore nella rimozione', 'error');
    }
    toast(`${data.rimossi.toLocaleString('it-IT')} ${unita} demo rimossi`, 'success');
    setTimeout(() => location.reload(), 700);
  });
}
