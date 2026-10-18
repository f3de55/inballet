/** Popup di conferma con lo stile della dashboard. Risolve true solo con il pulsante di conferma. */
interface Opzioni {
  titolo: string;
  testo: string;
  ok?: string;
  /** Azione distruttiva: pulsante rosso, focus su Annulla */
  pericolo?: boolean;
}

export function conferma({ titolo, testo, ok = 'Conferma', pericolo = false }: Opzioni): Promise<boolean> {
  const dlg = document.getElementById('dlgConferma') as HTMLDialogElement;
  const btnOk = document.getElementById('confermaOk') as HTMLButtonElement;
  document.getElementById('confermaTitolo')!.textContent = titolo;
  document.getElementById('confermaTesto')!.textContent = testo;
  btnOk.textContent = ok;
  btnOk.classList.toggle('btn-danger', pericolo);
  btnOk.classList.toggle('btn-primary', !pericolo);
  dlg.returnValue = '';
  dlg.showModal();
  (pericolo ? document.getElementById('confermaNo')! : btnOk).focus();

  return new Promise((resolve) => {
    dlg.addEventListener('close', () => resolve(dlg.returnValue === 'si'), { once: true });
  });
}
