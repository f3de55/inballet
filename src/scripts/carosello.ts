/* ========================================
   FILE A SCORRIMENTO CONTINUO (insegnanti di Chi siamo)
   Su PC scorre l'animazione CSS; su touch la fila (.carosello, con dentro
   .carosello-track fatta di due metà identiche) si trascina col dito e scorre
   da sola: al tocco si ferma, riparte 2 secondi dopo. Stessa logica della galleria.
   ======================================== */

const touch = window.matchMedia('(hover: none), (pointer: coarse)');
const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)');

if (touch.matches && !ridotto.matches) {
  document.querySelectorAll<HTMLElement>('.carosello').forEach((fila) => {
    const track = fila.querySelector<HTMLElement>('.carosello-track');
    if (!track) return;
    const DURATA_GIRO = 50; // secondi per far passare una metà
    let pos = 0;
    let ultimo = 0;
    let fermo = false;
    let visibile = false;
    let ripresa = 0;
    const giro = () => track.scrollWidth / 2;
    const avvolgi = (x: number) => ((x % giro()) + giro()) % giro();

    const passo = (t: number) => {
      if (ultimo && !fermo && visibile && !document.querySelector('dialog[open]') && !document.hidden) {
        pos = avvolgi(pos + (giro() / DURATA_GIRO) * ((t - ultimo) / 1000));
        fila.scrollLeft = pos;
      }
      ultimo = t;
      requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);

    new IntersectionObserver(([e]) => (visibile = e.isIntersecting)).observe(fila);

    fila.addEventListener(
      'touchstart',
      () => {
        fermo = true;
        clearTimeout(ripresa);
      },
      { passive: true },
    );
    fila.addEventListener(
      'touchend',
      () => {
        clearTimeout(ripresa);
        ripresa = window.setTimeout(() => {
          pos = avvolgi(fila.scrollLeft);
          fila.scrollLeft = pos;
          fermo = false;
        }, 2000);
      },
      { passive: true },
    );
  });
}

export {};
