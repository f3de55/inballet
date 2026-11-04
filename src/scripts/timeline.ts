/** Una curva per riga, da sinistra a destra: il cambio riga non attraversa i testi. */
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
      return { x: box.left - area.left + nodo / 2, y: box.top - area.top + nodo / 2 };
    });
    if (punti.length < 2) return;
    svg.setAttribute('viewBox', `0 0 ${area.width} ${area.height}`);
    let d = `M ${punti[0].x} ${punti[0].y}`;
    for (let i = 1; i < punti.length; i++) {
      const a = punti[i - 1];
      const b = punti[i];
      if (b.x <= a.x) {
        d += ` M ${b.x} ${b.y}`;
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
