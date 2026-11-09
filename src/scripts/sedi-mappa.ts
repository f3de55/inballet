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
      let box = viewport.getBoundingClientRect();
      const coordinate = punti.map((punto) => ({
        x: parseFloat(punto.style.getPropertyValue('--punto-x')) / 100,
        y: parseFloat(punto.style.getPropertyValue('--punto-y')) / 100,
      }));
      const altezzaPopup = Math.max(...popup.map((el) => el.getBoundingClientRect().height));
      const raggio = punti[0].getBoundingClientRect().height / 2;
      const primoY = 16 + raggio;
      const distanzaY = coordinate[1].y - coordinate[0].y;
      const altezzaMinCarta = (box.width * 852) / 1111;
      const altezzaMinTavola = primoY + altezzaMinCarta * distanzaY + 16 + altezzaPopup + raggio + 8;
      tavola.style.setProperty('--mappa-altezza-min', `${Math.ceil(altezzaMinTavola)}px`);
      box = viewport.getBoundingClientRect();
      const ultimoY = box.height - 16 - altezzaPopup - raggio - 8;
      const altezza = Math.max(altezzaMinCarta, (ultimoY - primoY) / distanzaY);
      const larghezza = (altezza * 1111) / 852;
      const distanzaX = (coordinate[1].x - coordinate[0].x) * larghezza;
      cartografia.style.setProperty('--carta-width', `${larghezza}px`);
      cartografia.style.setProperty('--carta-height', `${altezza}px`);
      const centro = (box.width - distanzaX) / 2 - coordinate[0].x * larghezza;
      const origineX = Math.min(0, Math.max(box.width - larghezza, centro));
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
      let d: string;

      if (pin.bottom <= card.top || pin.top >= card.bottom) {
        const sx = card.left + card.width / 2 - area.left;
        const sy = (pin.bottom <= card.top ? card.top : card.bottom) - area.top;
        const my = (sy + y) / 2;
        d = `M${sx} ${sy} C${sx} ${my} ${x} ${my} ${x} ${y}`;
      } else {
        const sx = (x < card.left - area.left ? card.left : card.right) - area.left;
        const sy = card.top + card.height * 0.4 - area.top;
        const mx = (sx + x) / 2;
        d = `M${sx} ${sy} C${mx} ${sy} ${mx} ${y} ${x} ${y}`;
      }
      gruppo.querySelectorAll('path').forEach((path) => path.setAttribute('d', d));
    });
  };

  const evidenzia = (id: string | undefined, attiva: boolean) =>
    tavola.querySelectorAll(`[data-sede="${id}"], [data-collegamento="${id}"]`).forEach((el) => el.classList.toggle('attiva', attiva));
  tavola.querySelectorAll<HTMLElement>('.sedi-mappa-foto, .sedi-mappa-punto').forEach((el) => {
    const id = el.dataset.sede;
    el.addEventListener('pointerenter', () => evidenzia(id, true));
    el.addEventListener('pointerleave', () => evidenzia(id, false));
    el.addEventListener('focusin', () => evidenzia(id, true));
    el.addEventListener('focusout', () => evidenzia(id, false));
  });

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
