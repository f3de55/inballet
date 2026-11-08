/** Una serpentina: la linea attraversa i nodi di una riga, gira con un tornante tondo fuori dal contenuto e
 *  torna indietro sulla riga successiva (le righe pari sono disposte da destra a sinistra, vedi chi-siamo.css). */
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
      return { x: box.left - area.left + nodo / 2, y: box.top - area.top + nodo / 2 };
    });
    if (punti.length < 2) return;
    svg.setAttribute('viewBox', `0 0 ${area.width} ${area.height}`);
    let d = `M ${punti[0].x} ${punti[0].y}`;
    for (let i = 1; i < punti.length; i++) {
      const a = punti[i - 1];
      const b = punti[i];
      if (Math.abs(b.y - a.y) <= TOLLERANZA) {
        d += ` L ${b.x} ${b.y}`;
        continue;
      }
      // Tornante: due quarti di cerchio e un tratto dritto, sul lato in cui la riga è finita.
      // Il raggio è lo spazio libero fuori dal contenuto (al massimo GIRO_MAX), uguale su entrambi i lati.
      const destra = a.x > area.width / 2;
      const libero = destra ? window.innerWidth - area.right : area.left;
      const r = Math.max(12, Math.min(GIRO_MAX, libero - 8, (b.y - a.y) / 2));
      const k = r * 0.5523;
      const s = destra ? 1 : -1;
      const x0 = destra ? area.width : 0;
      d += ` L ${x0} ${a.y}`;
      d += ` C ${x0 + s * k} ${a.y} ${x0 + s * r} ${a.y + r - k} ${x0 + s * r} ${a.y + r}`;
      d += ` L ${x0 + s * r} ${b.y - r}`;
      d += ` C ${x0 + s * r} ${b.y - r + k} ${x0 + s * k} ${b.y} ${x0} ${b.y}`;
      d += ` L ${b.x} ${b.y}`;
    }
    path.setAttribute('d', d);
  };

  new ResizeObserver(disegna).observe(timeline);
  document.fonts.ready.then(disegna);
  verticale.addEventListener('change', disegna);
  disegna();
}
