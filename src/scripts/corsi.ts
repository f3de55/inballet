/** Controlli delle file dei corsi: nessuna riproduzione automatica, scorrimento nativo. */
document.querySelectorAll<HTMLElement>('.corsi-stile-contenuto').forEach((contenuto) => {
  const fila = contenuto.querySelector<HTMLElement>('.corsi-stile-elenco');
  const comandi = contenuto.querySelector<HTMLElement>('.corsi-stile-comandi');
  const indietro = contenuto.querySelector<HTMLButtonElement>('[data-corsi-direzione="-1"]');
  const avanti = contenuto.querySelector<HTMLButtonElement>('[data-corsi-direzione="1"]');
  if (!fila || !comandi || !indietro || !avanti) return;

  const aggiorna = () => {
    const fine = fila.scrollWidth - fila.clientWidth;
    comandi.hidden = fine <= 1;
    indietro.disabled = fila.scrollLeft <= 1;
    avanti.disabled = fila.scrollLeft >= fine - 1;
  };

  [indietro, avanti].forEach((pulsante) => {
    pulsante.addEventListener('click', () => {
      const corso = fila.querySelector<HTMLElement>('.corsi-scheda');
      if (!corso) return;
      const spazio = parseFloat(getComputedStyle(fila).columnGap) || 0;
      fila.scrollBy({
        left: Number(pulsante.dataset.corsiDirezione) * (corso.getBoundingClientRect().width + spazio),
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    });
  });

  fila.addEventListener('scroll', aggiorna, { passive: true });
  new ResizeObserver(aggiorna).observe(fila);
  aggiorna();
});
