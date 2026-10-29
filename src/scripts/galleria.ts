/* ========================================
   LIGHTBOX DELLA GALLERIA (componente Galleria.astro; lo scorrimento è in carosello.ts)
   ======================================== */

const track = document.getElementById('galleryTrack');
const dialog = document.getElementById('lightbox') as HTMLDialogElement | null;
const foto = document.getElementById('lightbox-image') as HTMLImageElement | null;
const didascalia = document.getElementById('lightbox-caption');
const contatore = document.getElementById('lightbox-counter');

if (track && dialog && foto && didascalia && contatore) {
  const bottoni = [...track.querySelectorAll<HTMLButtonElement>('.gallery-apri')];
  // Le prime 10 sono le foto uniche (le altre sono il duplicato per lo scorrimento)
  const foto10 = bottoni.slice(0, 10).map((b) => ({ src: b.dataset.full!, alt: b.dataset.alt ?? '' }));
  const n = foto10.length;
  let index = 0;
  let opener: HTMLElement | null = null;

  const mostra = (i: number) => {
    index = (i + n) % n;
    const { src, alt } = foto10[index];
    foto.classList.add('in-caricamento');
    foto.onload = () => foto.classList.remove('in-caricamento');
    foto.src = src;
    foto.alt = alt;
    didascalia.textContent = alt;
    contatore.textContent = `${index + 1} / ${n}`;
    [(index - 1 + n) % n, (index + 1) % n].forEach((j) => (new Image().src = foto10[j].src));
  };

  const apri = (i: number, da: HTMLElement) => {
    opener = da;
    mostra(i);
    document.documentElement.classList.add('galleria-aperta');
    dialog.showModal();
  };

  // Esc, pulsante chiudi o clic fuori dalla foto: chiusura unica, focus restituito alla miniatura
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('galleria-aperta');
    opener?.focus({ preventScroll: true });
  });

  bottoni.forEach((b) => b.addEventListener('click', () => apri(Number(b.dataset.index), bottoni[Number(b.dataset.index)])));

  document.getElementById('lightbox-close')?.addEventListener('click', () => dialog.close());
  document.getElementById('lightbox-prev')?.addEventListener('click', () => mostra(index - 1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => mostra(index + 1));
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mostra(index - 1);
    else if (e.key === 'ArrowRight') mostra(index + 1);
  });

  let swipeX = 0;
  dialog.addEventListener('touchstart', (e) => (swipeX = e.changedTouches[0].clientX), { passive: true });
  dialog.addEventListener(
    'touchend',
    (e) => {
      const diff = swipeX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) mostra(diff > 0 ? index + 1 : index - 1);
    },
    { passive: true },
  );
}

export {};
