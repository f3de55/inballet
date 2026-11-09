const track = document.getElementById('galleryTrack');
const dialog = document.getElementById('lightbox') as HTMLDialogElement | null;
const fotoIniziale = document.getElementById('lightbox-image') as HTMLImageElement | null;
const didascalia = document.getElementById('lightbox-caption');
const contatore = document.getElementById('lightbox-counter');

if (track && dialog && fotoIniziale && didascalia && contatore) {
  let foto: HTMLImageElement = fotoIniziale;
  const bottoni = [...track.querySelectorAll<HTMLButtonElement>('.gallery-apri')];
  const originali = bottoni.slice(0, bottoni.length / 2).map((b) => ({ src: b.dataset.full!, alt: b.dataset.alt ?? '' }));
  const n = originali.length;
  let index = 0;
  let richiesta = 0;
  let opener: HTMLElement | null = null;

  const immagini = new Map<string, { img: HTMLImageElement; pronta: Promise<void> }>();
  const carica = (src: string) => {
    let voce = immagini.get(src);
    if (!voce) {
      const img = new Image();
      img.src = src;
      img.className = foto.className;
      voce = { img, pronta: img.decode().catch(() => {}) };
      immagini.set(src, voce);
    }
    return voce;
  };
  const sostituisci = (img: HTMLImageElement, alt: string) => {
    img.alt = alt;
    if (img === foto) return;
    foto.removeAttribute('id');
    img.id = 'lightbox-image';
    foto.replaceWith(img);
    foto = img;
  };
  const miniatura = (i: number) => bottoni[i].querySelector('img')?.currentSrc ?? '';
  const attesa = (ms: number) => new Promise<false>((risolvi) => setTimeout(() => risolvi(false), ms));

  const mostra = async (i: number, subito = false) => {
    index = (i + n) % n;
    const questa = ++richiesta;
    const { src, alt } = originali[index];
    const piena = carica(src);
    const caricata = await Promise.race([piena.pronta.then(() => true), attesa(subito ? 0 : 250)]);
    if (questa !== richiesta) return;
    if (!caricata) {
      const anteprima = miniatura(index);
      if (anteprima) {
        const mini = carica(anteprima);
        await mini.pronta;
        if (questa !== richiesta) return;
        sostituisci(mini.img, alt);
      }
    }
    didascalia.textContent = alt;
    contatore.textContent = `${index + 1} / ${n}`;
    [(index - 1 + n) % n, (index + 1) % n].forEach((j) => carica(originali[j].src));
    await piena.pronta;
    if (questa === richiesta) sostituisci(piena.img, alt);
  };

  const apri = (i: number, da: HTMLElement) => {
    opener = da;
    mostra(i, true);
    document.documentElement.classList.add('galleria-aperta');
    dialog.showModal();
  };

  bottoni.forEach((b) => {
    const precarica = () => {
      carica(originali[Number(b.dataset.index)].src);
    };
    b.addEventListener('pointerenter', precarica, { passive: true });
    b.addEventListener('pointerdown', precarica, { passive: true });
    b.addEventListener('focus', precarica);
  });

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
