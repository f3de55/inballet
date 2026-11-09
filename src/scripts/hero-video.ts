const video = document.querySelector<HTMLVideoElement>('.hero-video');
const riduciMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
const risparmioDati = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

if (video && !risparmioDati) {
  let visibile = false;

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

  const osserva = () =>
    new IntersectionObserver(([entry]) => {
      visibile = entry.isIntersecting;
      sincronizza();
    }).observe(video);

  if (document.readyState === 'complete') osserva();
  else window.addEventListener('load', osserva, { once: true });

  riduciMovimento.addEventListener('change', sincronizza);
}
