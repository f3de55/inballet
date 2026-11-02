// I punti restano legati all'immagine; i richiami seguono il layout effettivo.
document.querySelectorAll<HTMLElement>('[data-sedi-mappa]').forEach((tavola) => {
  const svg = tavola.querySelector<SVGSVGElement>('.sedi-mappa-linee');
  const viewport = tavola.querySelector<HTMLElement>('.sedi-mappa-viewport');
  const cartografia = tavola.querySelector<HTMLElement>('.sedi-mappa-cartografia');
  const popup = [...tavola.querySelectorAll<HTMLElement>('.sedi-mappa-popup')];
  const punti = [...tavola.querySelectorAll<HTMLElement>('.sedi-mappa-punto')];
  if (!svg || !viewport || !cartografia || punti.length !== 2) return;
  const mobile = window.matchMedia('(max-width: 768px)');
  let frame = 0;

  const disegna = () => {
    if (mobile.matches) {
      const box = viewport.getBoundingClientRect();
      const coordinate = punti.map((punto) => ({
        x: parseFloat(punto.style.getPropertyValue('--punto-x')) / 100,
        y: parseFloat(punto.style.getPropertyValue('--punto-y')) / 100,
      }));
      // Riserva spazio sotto ogni punto per il popup, inclusa la sede più in basso.
      const altezzaPopup = Math.max(...popup.map((el) => el.getBoundingClientRect().height));
      const raggio = punti[0].getBoundingClientRect().height / 2;
      const primoY = 16 + raggio;
      const ultimoY = box.height - 16 - altezzaPopup - raggio - 8;
      const altezza = (ultimoY - primoY) / (coordinate[1].y - coordinate[0].y);
      const larghezza = altezza * 1111 / 852;
      const distanzaX = (coordinate[1].x - coordinate[0].x) * larghezza;
      cartografia.style.setProperty('--carta-width', `${larghezza}px`);
      cartografia.style.setProperty('--carta-height', `${altezza}px`);
      const origineX = (box.width - distanzaX) / 2 - coordinate[0].x * larghezza;
      cartografia.style.setProperty('--carta-x', `${origineX}px`);
      cartografia.style.setProperty('--carta-y', `${primoY - coordinate[0].y * altezza}px`);
      return;
    }
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
      const raggio = Math.max(pin.width, pin.height) / 2 + 3;
      let d: string;

      if (pin.bottom <= card.top || pin.top >= card.bottom) {
        const sx = card.left + card.width / 2 - area.left;
        const sy = (pin.bottom <= card.top ? card.top : card.bottom) - area.top;
        const fineY = y + (sy < y ? -raggio : raggio);
        const my = (sy + fineY) / 2;
        d = `M${sx} ${sy} C${sx} ${my} ${x} ${my} ${x} ${fineY}`;
      } else {
        const sx = (x < card.left - area.left ? card.left : card.right) - area.left;
        const sy = card.top + card.height * .4 - area.top;
        const fineX = x + (sx < x ? -raggio : raggio);
        const mx = (sx + fineX) / 2;
        d = `M${sx} ${sy} C${mx} ${sy} ${mx} ${y} ${fineX} ${y}`;
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
  tavola.querySelectorAll<HTMLElement>('.sedi-mappa-foto, .sedi-mappa-cartografia, .sedi-mappa-popup').forEach((el) => observer.observe(el));
  mobile.addEventListener('change', aggiorna);
  document.fonts.ready.then(aggiorna);
  aggiorna();
});
