const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)');
const SOGLIA_TRASCINAMENTO = 6;

let puntatoreMouse: { x: number; y: number } | null = null;
const aggiornaPuntatore = (event: PointerEvent) => {
  puntatoreMouse = event.pointerType === 'mouse' ? { x: event.clientX, y: event.clientY } : null;
};
window.addEventListener('pointermove', aggiornaPuntatore, { capture: true, passive: true });
window.addEventListener('pointerdown', aggiornaPuntatore, { capture: true, passive: true });
window.addEventListener('pointerout', (event) => {
  if (event.pointerType === 'mouse' && !event.relatedTarget) puntatoreMouse = null;
});

document.querySelectorAll<HTMLElement>('.carosello').forEach((fila) => {
  const track = fila.querySelector<HTMLElement>('.carosello-track');
  if (!track) return;
  const secondi = Number(fila.dataset.giro) || 60;
  const giro = () => track.scrollWidth / 2;

  const foto = [...track.querySelectorAll<HTMLImageElement>('img')];
  const ricarica = (img: HTMLImageElement) => {
    const src = img.currentSrc || img.src;
    if (!src || img.dataset.riprovato === '2') return;
    img.dataset.riprovato = String(Number(img.dataset.riprovato ?? 0) + 1);
    img.removeAttribute('srcset');
    img.src = '';
    img.src = src;
  };
  foto.forEach((img) => img.addEventListener('error', () => setTimeout(() => ricarica(img), 1500)));
  const controlla = () => foto.forEach((img) => img.complete && img.naturalWidth === 0 && img.src && ricarica(img));
  document.addEventListener('visibilitychange', () => !document.hidden && controlla());
  window.addEventListener('pageshow', controlla);

  if (ridotto.matches) return;

  let pos = 0;
  let ultimo = 0;
  let fermo = false;
  let sopra = false;
  let ricalcolaHover = false;
  let visibile = false;
  let ripresa = 0;
  let ultimoScroll = 0;
  let trascinando = false;
  let spostato = false;

  const mod = (x: number) => {
    const g = giro();
    return g ? ((x % g) + g) % g : 0;
  };
  const mostra = () => {
    fila.scrollLeft = pos;
    track.style.transform = `translate3d(${fila.scrollLeft - pos}px, 0, 0)`;
  };

  const ferma = () => {
    fermo = true;
    clearTimeout(ripresa);
    track.style.transform = '';
  };
  const riparti = () => {
    clearTimeout(ripresa);
    ripresa = window.setTimeout(function ripresaTimer() {
      if (trascinando) return;
      if (performance.now() - ultimoScroll < 250) {
        ripresa = window.setTimeout(ripresaTimer, 300);
        return;
      }
      pos = mod(fila.scrollLeft);
      fermo = false;
    }, 2000);
  };

  document.addEventListener(
    'close',
    (event) => {
      if (!(event.target instanceof HTMLDialogElement) || document.querySelector('dialog[open]')) return;
      clearTimeout(ripresa);
      trascinando = false;
      spostato = false;
      fila.classList.remove('trascinando');
      ricalcolaHover = true;
      pos = mod(fila.scrollLeft);
      ultimo = performance.now();
      fermo = false;
    },
    true,
  );

  const inizia = () => {
    if (fermo) return;
    pos = mod(giro() / 2);
    mostra();
  };
  inizia();
  window.addEventListener('load', inizia, { once: true });

  const passo = (t: number) => {
    const modaleAperta = !!document.querySelector('dialog[open]');
    if (ricalcolaHover && !modaleAperta) {
      sopra = puntatoreMouse !== null && fila.contains(document.elementFromPoint(puntatoreMouse.x, puntatoreMouse.y));
      ricalcolaHover = false;
    }
    if (ultimo && !fermo && !sopra && visibile && !modaleAperta && !document.hidden) {
      pos = mod(pos + (giro() / secondi) * ((t - ultimo) / 1000));
      mostra();
    }
    ultimo = t;
    requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);

  new IntersectionObserver(([e]) => (visibile = e.isIntersecting)).observe(fila);

  fila.addEventListener(
    'scroll',
    () => {
      if (!fermo) return;
      ultimoScroll = performance.now();
      const g = giro();
      if (!g) return;
      if (fila.scrollLeft >= g) fila.scrollLeft -= g;
      else if (fila.scrollLeft <= 0) fila.scrollLeft += g;
    },
    { passive: true },
  );

  fila.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    aggiornaPuntatore(e);
    sopra = true;
  });
  fila.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    sopra = false;
  });
  let xPrec = 0;
  let totale = 0;
  fila.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    sopra = true;
    ferma();
    trascinando = true;
    spostato = false;
    totale = 0;
    xPrec = e.clientX;
  });
  window.addEventListener('pointermove', (e) => {
    if (!trascinando) return;
    const dx = e.clientX - xPrec;
    xPrec = e.clientX;
    totale += dx;
    if (!spostato && Math.abs(totale) > SOGLIA_TRASCINAMENTO) {
      spostato = true;
      fila.classList.add('trascinando');
    }
    if (!spostato) return;
    const g = giro();
    let x = fila.scrollLeft - dx;
    if (g && x >= g) x -= g;
    else if (g && x <= 0) x += g;
    fila.scrollLeft = x;
  });
  window.addEventListener('pointerup', () => {
    if (!trascinando) return;
    trascinando = false;
    fila.classList.remove('trascinando');
    riparti();
  });
  fila.addEventListener(
    'click',
    (e) => {
      if (!spostato) return;
      e.stopPropagation();
      e.preventDefault();
      spostato = false;
    },
    true,
  );

  fila.addEventListener('touchstart', ferma, { passive: true });
  fila.addEventListener('touchend', riparti, { passive: true });
  fila.addEventListener('touchcancel', riparti, { passive: true });
  fila.addEventListener(
    'wheel',
    () => {
      ferma();
      riparti();
    },
    { passive: true },
  );
});

export {};
