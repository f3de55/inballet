/* ========================================
   HERO HOMEPAGE: video di sfondo in loop
   Parte solo se l'utente non ha chiesto "riduci movimento" né il risparmio dati;
   fuori schermo si ferma (CPU e batteria) e riparte quando l'hero torna visibile.
   Finché non va, resta la foto del primo fotogramma sotto.
   ======================================== */
const video = document.querySelector<HTMLVideoElement>('.hero-video');
const riduciMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
const risparmioDati = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

if (video && !risparmioDati) {
  let visibile = false;

  // Rifiuto di play() (es. iPhone in risparmio energetico): resta la foto
  const sincronizza = () => {
    if (visibile && !riduciMovimento.matches) {
      if (video.preload !== 'auto') video.preload = 'auto';
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    if (riduciMovimento.matches) video.classList.remove('is-playing');
  };

  video.addEventListener('playing', () => video.classList.add('is-playing'));

  new IntersectionObserver(([entry]) => {
    visibile = entry.isIntersecting;
    sincronizza();
  }).observe(video);

  riduciMovimento.addEventListener('change', sincronizza);
}
