/** Una serpentina continua fra le tappe; il testo resta un elenco cronologico. */
export {};

const timeline = document.querySelector<HTMLElement>('.timeline');
if (timeline) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const path = document.createElementNS(ns, 'path');
  svg.classList.add('timeline-linea');
  svg.setAttribute('aria-hidden', 'true');
  svg.append(path);
  timeline.prepend(svg);
  const mobile = window.matchMedia('(max-width: 700px)');

  const disegna = () => {
    svg.style.display = mobile.matches ? 'none' : 'block';
    if (mobile.matches) return;
    const area = timeline.getBoundingClientRect();
    const nodo = parseFloat(getComputedStyle(timeline).getPropertyValue('--nodo'));
    const punti = [...timeline.querySelectorAll<HTMLElement>(':scope > .voce')].map((voce) => {
      const box = voce.getBoundingClientRect();
      return { x: box.left - area.left + nodo / 2, y: box.top - area.top + nodo / 2 };
    });
    svg.setAttribute('viewBox', `0 0 ${area.width} ${area.height}`);
    let d = `M ${punti[0].x} ${punti[0].y}`;
    for (let i = 1; i < punti.length; i++) {
      const a = punti[i - 1];
      const b = punti[i];
      if (Math.abs(a.y - b.y) < 2) {
        d += ` L ${b.x} ${b.y}`;
        continue;
      }
      const destra = a.x > area.width / 2;
      const direzione = destra ? 1 : -1;
      const esterno = destra ? area.width - 2 : 2;
      const raggio = Math.min(24, (b.y - a.y) / 2);
      const curva = destra ? 1 : 0;
      const bordo = esterno - direzione * raggio;
      d += ` L ${bordo} ${a.y} A ${raggio} ${raggio} 0 0 ${curva} ${esterno} ${a.y + raggio}`;
      d += ` L ${esterno} ${b.y - raggio} A ${raggio} ${raggio} 0 0 ${curva} ${bordo} ${b.y} L ${b.x} ${b.y}`;
    }
    path.setAttribute('d', d);
  };

  new ResizeObserver(disegna).observe(timeline);
  document.fonts.ready.then(disegna);
  mobile.addEventListener('change', disegna);
  disegna();
}
