import { actions } from 'astro:actions';

const domande: string[] = JSON.parse(document.querySelector<HTMLElement>('.catena')?.dataset.verifiche ?? '[]');
const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

function riga(domanda: string, esito: { ok: boolean; risposta: string; problemi: string[] } | undefined, errore?: string) {
  const li = document.createElement('li');
  li.className = esito?.ok ? 'ok' : 'ko';
  const d = document.createElement('details');
  const s = document.createElement('summary');
  const icona = document.createElement('i');
  icona.className = `fas ${esito?.ok ? 'fa-check-circle' : 'fa-times-circle'}`;
  icona.setAttribute('aria-label', esito?.ok ? 'Corretta' : 'Da controllare');
  const testo = document.createElement('span');
  testo.textContent = domanda;
  s.append(icona, testo);
  const problemi = errore ?? esito?.problemi.join(', ');
  if (problemi) {
    const p = document.createElement('span');
    p.className = 'verifica-problemi';
    p.textContent = problemi;
    s.append(p);
  }
  const risposta = document.createElement('p');
  risposta.className = 'verifica-risposta';
  risposta.textContent = esito?.risposta || 'Nessuna risposta';
  d.append(s, risposta);
  li.append(d);
  return li;
}

document.querySelectorAll<HTMLButtonElement>('.anello-verifica').forEach((btn) =>
  btn.addEventListener('click', async () => {
    const box = btn.closest('.anello')!.querySelector<HTMLElement>('.verifica')!;
    const stato = document.createElement('p');
    stato.className = 'verifica-stato';
    const lista = document.createElement('ol');
    lista.className = 'verifica-lista';
    box.replaceChildren(stato, lista);
    box.hidden = false;
    btn.disabled = true;
    let corrette = 0;
    let costo = 0;
    for (const [i, domanda] of domande.entries()) {
      stato.textContent = `Domanda ${i + 1} di ${domande.length}…`;
      const { data, error } = await actions.chatbot.verifica({ fornitore: btn.dataset.fornitore!, modello: btn.dataset.modello!, indice: i });
      if (data?.ok) corrette++;
      costo += data?.costo ?? 0;
      lista.append(riga(domanda, data, error?.message));
      if (i < domande.length - 1) await pausa(1500);
    }
    stato.textContent = `${corrette} risposte corrette su ${domande.length}${costo ? ` · costo della verifica ${costo.toFixed(4).replace('.', ',')} $` : ''}`;
    btn.disabled = false;
  }),
);
