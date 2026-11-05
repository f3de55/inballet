/** Una curva continua: le righe si raccordano lungo i margini e nello spazio fra le tappe. */
export {};

const timeline = document.querySelector<HTMLElement>('.timeline');
if (timeline) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const path = document.createElementNS(ns, 'path');
  svg.classList.add('timeline-linea');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.append(path);
  timeline.prepend(svg);
  const verticale = window.matchMedia('(max-width: 1024px)');

  const disegna = () => {
    svg.style.display = verticale.matches ? 'none' : 'block';
    if (verticale.matches) return;
    const area = timeline.getBoundingClientRect();
    const nodo = parseFloat(getComputedStyle(timeline).getPropertyValue('--nodo'));
    const punti = [...timeline.querySelectorAll<HTMLElement>(':scope > .voce')].map((voce) => {
      const box = voce.getBoundingClientRect();
      return { x: box.left - area.left + nodo / 2, y: box.top - area.top + nodo / 2, top: box.top - area.top, bottom: box.bottom - area.top };
    });
    if (punti.length < 2) return;
    svg.setAttribute('viewBox', `0 0 ${area.width} ${area.height}`);
    let d = `M ${punti[0].x} ${punti[0].y}`;
    for (let i = 1; i < punti.length; i++) {
      const a = punti[i - 1];
      const b = punti[i];
      if (b.x <= a.x) {
        // Due anse morbide e un'onda di ritorno, senza tratti rettilinei o angoli.
        const fondoRiga = Math.max(...punti.slice(Math.max(0, i - 3), i).map((p) => p.bottom));
        const mezzo = (fondoRiga + b.top) / 2;
        const onda = Math.min(12, (b.top - fondoRiga) / 4);
        const centro = (a.x + b.x) / 2;
        const passo = (a.x - b.x) / 4;
        // Le maniglie sono esterne, ma le anse restano entro 20px dai margini.
        const destra = a.x + (area.width + 20 - a.x) * 4 / 3;
        const sinistra = b.x - (b.x + 20) * 4 / 3;
        d += ` C ${destra} ${a.y} ${destra} ${mezzo} ${a.x} ${mezzo}`;
        d += ` C ${a.x - passo} ${mezzo} ${centro + passo} ${mezzo + onda} ${centro} ${mezzo + onda}`;
        d += ` C ${centro - passo} ${mezzo + onda} ${b.x + passo} ${mezzo} ${b.x} ${mezzo}`;
        d += ` C ${sinistra} ${mezzo} ${sinistra} ${b.y} ${b.x} ${b.y}`;
        continue;
      }
      const centro = (a.x + b.x) / 2;
      d += ` C ${centro} ${a.y} ${centro} ${b.y} ${b.x} ${b.y}`;
    }
    path.setAttribute('d', d);
  };

  new ResizeObserver(disegna).observe(timeline);
  document.fonts.ready.then(disegna);
  verticale.addEventListener('change', disegna);
  disegna();
}
