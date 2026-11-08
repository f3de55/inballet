/** Una serpentina: la linea attraversa i nodi di una riga da sinistra a destra, gira con un tornante tondo
 *  fuori dal contenuto, torna indietro nello spazio fra le righe e rientra a sinistra sulla riga successiva,
 *  così l'ultima tappa («oggi») è sempre in basso a destra. */
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
  const TOLLERANZA = 2;
  const GIRO_MAX = 40;

  const disegna = () => {
    svg.style.display = verticale.matches ? 'none' : 'block';
    if (verticale.matches) return;
    const area = timeline.getBoundingClientRect();
    const nodo = parseFloat(getComputedStyle(timeline).getPropertyValue('--nodo'));
    const punti = [...timeline.querySelectorAll<HTMLElement>(':scope > .voce')].map((voce) => {
      const box = voce.getBoundingClientRect();
      return { x: box.left - area.left + nodo / 2, y: box.top - area.top + nodo / 2, fondo: box.bottom - area.top };
    });
    if (punti.length < 2) return;
    svg.setAttribute('viewBox', `0 0 ${area.width} ${area.height}`);
    let d = `M ${punti[0].x} ${punti[0].y}`;
    let fondoRiga = punti[0].fondo;
    for (let i = 1; i < punti.length; i++) {
      const a = punti[i - 1];
      const b = punti[i];
      if (Math.abs(b.y - a.y) <= TOLLERANZA) {
        d += ` L ${b.x} ${b.y}`;
        fondoRiga = Math.max(fondoRiga, b.fondo);
        continue;
      }
      // A capo come nel testo: ogni riga si legge da sinistra a destra. La linea esce a destra con un tornante
      // tondo, torna indietro a sinistra nello spazio fra le due righe e rientra con un secondo tornante tondo.
      // Il raggio è lo spazio libero fuori dal contenuto (al massimo GIRO_MAX), uguale sui due lati.
      const mezzo = fondoRiga + (b.y - nodo / 2 - fondoRiga) / 2;
      const libero = Math.min(window.innerWidth - area.right, area.left);
      const r = Math.max(12, Math.min(GIRO_MAX, libero - 8, (b.y - mezzo) / 2));
      const k = r * 0.5523;
      const W = area.width;
      d += ` L ${W} ${a.y}`;
      d += ` C ${W + k} ${a.y} ${W + r} ${a.y + r - k} ${W + r} ${a.y + r}`;
      d += ` L ${W + r} ${mezzo - r}`;
      d += ` C ${W + r} ${mezzo - r + k} ${W + k} ${mezzo} ${W} ${mezzo}`;
      d += ` L 0 ${mezzo}`;
      d += ` C ${-k} ${mezzo} ${-r} ${mezzo + r - k} ${-r} ${mezzo + r}`;
      d += ` L ${-r} ${b.y - r}`;
      d += ` C ${-r} ${b.y - r + k} ${-k} ${b.y} 0 ${b.y}`;
      d += ` L ${b.x} ${b.y}`;
      fondoRiga = b.fondo;
    }
    path.setAttribute('d', d);
  };

  new ResizeObserver(disegna).observe(timeline);
  document.fonts.ready.then(disegna);
  verticale.addEventListener('change', disegna);
  disegna();
}
