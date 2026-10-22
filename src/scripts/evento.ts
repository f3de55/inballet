/**
 * Pagina di un evento: locandina a tutto schermo e pulsante Condividi
 * (condivisione nativa del telefono, altrimenti copia del link).
 */

const locandina = document.getElementById('locandinaBtn');
const dialog = document.getElementById('locandinaDialog') as HTMLDialogElement | null;
if (locandina && dialog) {
  locandina.addEventListener('click', () => dialog.showModal());
  // Clic ovunque (X compresa) chiude
  dialog.addEventListener('click', () => dialog.close());
}

const condividi = document.getElementById('btnCondividi') as HTMLButtonElement | null;
const etichetta = document.getElementById('btnCondividiTesto');
if (condividi && etichetta && (navigator.share || navigator.clipboard)) {
  condividi.hidden = false;
  condividi.addEventListener('click', async () => {
    const url = location.origin + location.pathname;
    if (navigator.share) {
      await navigator.share({ title: condividi.dataset.titolo, text: condividi.dataset.testo, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      etichetta.textContent = 'Link copiato';
    } catch {
      etichetta.textContent = 'Copia non riuscita';
    }
    setTimeout(() => (etichetta.textContent = 'Condividi'), 2500);
  });
}
