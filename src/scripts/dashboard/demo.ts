import { actions } from 'astro:actions';
import { conferma } from './conferma';
import { toast } from './toast';

type Tipo = 'eventi' | 'chatbot' | 'insegnanti';

const AZIONI = {
  eventi: { genera: (n: number) => actions.demo.eventi({ quanti: n }), rimuovi: () => actions.demo.rimuoviEventi() },
  insegnanti: { genera: (n: number) => actions.demo.insegnanti({ quanti: n }), rimuovi: () => actions.demo.rimuoviInsegnanti() },
  chatbot: {
    genera: (n: number) =>
      actions.demo.chatbot({ quanti: n, giorni: Number((document.getElementById('demoGiorni') as HTMLSelectElement | null)?.value ?? 30) }),
    rimuovi: () => actions.demo.rimuoviChatbot(),
  },
};

const TESTI = {
  eventi: {
    genera: 'Compariranno nella dashboard e anche nel calendario pubblico del sito, finché non li rimuovi.',
    attesa: (n: number) => `Creo ${n} eventi e locandine…`,
    rimuovi: 'Gli eventi demo e le loro locandine verranno eliminati. Gli eventi veri non vengono toccati.',
  },
  insegnanti: {
    genera: 'Compariranno nella dashboard e anche nella pagina Chi siamo del sito, finché non li rimuovi.',
    attesa: (n: number) => `Creo ${n} insegnanti e foto…`,
    rimuovi: 'Gli insegnanti demo e le loro foto verranno eliminati. Gli insegnanti veri non vengono toccati.',
  },
  chatbot: {
    genera: 'Verranno aggiunti al registro del chatbot e contati nelle statistiche, finché non li rimuovi.',
    attesa: () => 'Generazione in corso…',
    rimuovi: 'I messaggi demo spariranno dalle statistiche. Le conversazioni vere non vengono toccate.',
  },
};

for (const blocco of document.querySelectorAll<HTMLElement>('[data-demo]')) {
  const tipo = blocco.dataset.demo as Tipo;
  const presenti = Number(blocco.dataset.presenti);
  const form = blocco.querySelector<HTMLFormElement>('.demo-form');
  const quanti = blocco.querySelector<HTMLInputElement>('.demo-quanti');
  const genera = blocco.querySelector<HTMLButtonElement>('.demo-genera');
  const unita = form?.dataset.unita ?? '';
  const max = Number(quanti?.max ?? 0);

  const valore = () => Math.max(1, Math.min(max, Math.round(Number(quanti?.value) || 1)));
  const aggiornaPulsante = () => {
    if (genera) genera.textContent = `Genera ${valore().toLocaleString('it-IT')} ${unita}`;
  };

  blocco.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const passo = t.closest<HTMLElement>('[data-passo]')?.dataset.passo;
    const rapido = t.closest<HTMLElement>('[data-valore]')?.dataset.valore;
    if (!quanti || (!passo && !rapido)) return;
    quanti.value = String(rapido ? Number(rapido) : Math.max(1, Math.min(max, valore() + Number(passo) * (tipo === 'chatbot' ? 50 : 1))));
    aggiornaPulsante();
  });
  quanti?.addEventListener('input', aggiornaPulsante);
  quanti?.addEventListener('blur', () => {
    if (!quanti) return;
    quanti.value = String(valore());
    aggiornaPulsante();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const n = valore();
    if (!(await conferma({ titolo: `Generare ${n.toLocaleString('it-IT')} ${unita} demo?`, testo: TESTI[tipo].genera, ok: 'Genera' })) || !genera) return;
    genera.disabled = true;
    genera.textContent = TESTI[tipo].attesa(n);
    const { data, error } = await AZIONI[tipo].genera(n);
    if (error) {
      genera.disabled = false;
      aggiornaPulsante();
      return toast(error.message || 'Errore nella generazione', 'error');
    }
    toast(`${data.creati.toLocaleString('it-IT')} ${unita} demo creati`, 'success');
    setTimeout(() => location.reload(), 700);
  });

  blocco.querySelector<HTMLButtonElement>('.demo-rimuovi')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    if (
      !(await conferma({ titolo: `Rimuovere ${presenti.toLocaleString('it-IT')} ${unita} demo?`, testo: TESTI[tipo].rimuovi, ok: 'Rimuovi', pericolo: true }))
    )
      return;
    btn.disabled = true;
    btn.textContent = 'Rimozione…';
    const { data, error } = await AZIONI[tipo].rimuovi();
    if (error) {
      btn.disabled = false;
      return toast(error.message || 'Errore nella rimozione', 'error');
    }
    toast(`${data.rimossi.toLocaleString('it-IT')} ${unita} demo rimossi`, 'success');
    setTimeout(() => location.reload(), 700);
  });
}
