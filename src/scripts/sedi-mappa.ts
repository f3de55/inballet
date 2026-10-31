// I punti restano legati all'immagine; i richiami seguono il layout effettivo.
document.querySelectorAll<HTMLElement>('[data-sedi-mappa]').forEach((tavola) => {
  const svg = tavola.querySelector<SVGSVGElement>('.sedi-mappa-linee');
  if (!svg) return;
  let frame = 0;

  const disegna = () => {
    const area = svg.getBoundingClientRect();
    if (!area.width || !area.height) return;
    svg.setAttribute('viewBox', `0 0 ${area.width} ${area.height}`);

    tavola.querySelectorAll<SVGGElement>('[data-collegamento]').forEach((gruppo) => {
      const id = gruppo.dataset.collegamento;
      const foto = tavola.querySelector<HTMLElement>(`.sedi-mappa-foto[data-sede="${id}"]`);
      const punto = tavola.querySelector<HTMLElement>(`.sedi-mappa-punto[data-sede="${id}"]`);
      if (!foto || !punto) return;
      const card = foto.getBoundingClientRect();
      const pin = punto.getBoundingClientRect();
      const x = pin.left + pin.width / 2 - area.left;
      const y = pin.top + pin.height / 2 - area.top;
      let d: string;

      if (pin.bottom <= card.top || pin.top >= card.bottom) {
        const sx = card.left + card.width / 2 - area.left;
        const sy = (pin.bottom <= card.top ? card.top : card.bottom) - area.top;
        const my = (sy + y) / 2;
        d = `M${sx} ${sy} C${sx} ${my} ${x} ${my} ${x} ${y}`;
      } else {
        const sx = (x < card.left - area.left ? card.left : card.right) - area.left;
        const sy = card.top + card.height * .4 - area.top;
        const mx = (sx + x) / 2;
        d = `M${sx} ${sy} C${mx} ${sy} ${mx} ${y} ${x} ${y}`;
      }
      gruppo.querySelectorAll('path').forEach((path) => path.setAttribute('d', d));
    });
  };

  const aggiorna = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(disegna);
  };
  const observer = new ResizeObserver(aggiorna);
  observer.observe(tavola);
  tavola.querySelectorAll<HTMLElement>('.sedi-mappa-foto, .sedi-mappa-cartografia').forEach((el) => observer.observe(el));
  document.fonts.ready.then(aggiorna);
  aggiorna();
});
