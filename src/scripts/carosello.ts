/* ========================================
   FILE A SCORRIMENTO CONTINUO (galleria «Le nostre sale» e insegnanti di Chi siamo)
   Struttura: .carosello (contenitore che scorre, overflow-x) > .carosello-track (due metà
   identiche). Scorre da solo ovunque (PC, tablet, telefono) e si può spostare a mano:
   trascinando col mouse o col dito, con la rotella orizzontale o il trackpad. Si ferma
   con il mouse sopra, al tocco e mentre una finestra è aperta; riparte 2 secondi dopo.
   È scorrimento vero (scrollLeft), non un'animazione CSS: così le foto restano sempre
   disegnate anche dopo molto tempo e il giro è infinito in entrambi i versi.
   ======================================== */

const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)');
const SOGLIA_TRASCINAMENTO = 6; // px oltre i quali un clic diventa trascinamento

document.querySelectorAll<HTMLElement>('.carosello').forEach((fila) => {
  const track = fila.querySelector<HTMLElement>('.carosello-track');
  if (!track) return;
  const secondi = Number(fila.dataset.giro) || 60; // secondi per far passare una metà
  const giro = () => track.scrollWidth / 2; // larghezza di una metà (due metà identiche)

  // Foto che non si caricano o spariscono: si ricaricano (errore di rete, memoria liberata dal browser)
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
  setInterval(controlla, 30000);

  if (ridotto.matches) return; // movimento ridotto: solo scorrimento a mano, gestito dal CSS

  let pos = 0;
  let ultimo = 0;
  let fermo = false;
  let sopra = false;
  let visibile = false;
  let ripresa = 0;
  let trascinando = false;
  let spostato = false;

  const avvolgi = () => {
    const g = giro();
    if (!g) return;
    // Le due metà sono identiche: oltre la prima si torna indietro di una metà, e viceversa
    if (fila.scrollLeft >= g) fila.scrollLeft -= g;
    else if (fila.scrollLeft <= 0) fila.scrollLeft += g;
    pos = fila.scrollLeft;
  };

  const ferma = () => {
    fermo = true;
    clearTimeout(ripresa);
  };
  const riparti = () => {
    clearTimeout(ripresa);
    ripresa = window.setTimeout(() => {
      pos = fila.scrollLeft;
      fermo = false;
    }, 2000);
  };

  // Posizione iniziale: a metà del giro, così si può scorrere anche verso sinistra
  const inizia = () => {
    if (giro()) {
      fila.scrollLeft = giro() / 2;
      pos = fila.scrollLeft;
    }
  };
  inizia();
  window.addEventListener('load', inizia, { once: true });

  const passo = (t: number) => {
    if (ultimo && !fermo && !sopra && !trascinando && visibile && !document.querySelector('dialog[open]') && !document.hidden) {
      pos += (giro() / secondi) * ((t - ultimo) / 1000);
      fila.scrollLeft = pos;
      if (fila.scrollLeft >= giro()) avvolgi();
    }
    ultimo = t;
    requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);

  new IntersectionObserver(([e]) => (visibile = e.isIntersecting)).observe(fila);

  // Giro infinito anche a mano
  fila.addEventListener('scroll', () => {
    if (fila.scrollLeft >= giro() || fila.scrollLeft <= 0) avvolgi();
  }, { passive: true });

  // Mouse: pausa al passaggio e trascinamento
  fila.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') sopra = true;
  });
  fila.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') sopra = false;
  });
  let x0 = 0;
  let s0 = 0;
  fila.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    trascinando = true;
    spostato = false;
    x0 = e.clientX;
    s0 = fila.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!trascinando) return;
    const dx = e.clientX - x0;
    if (!spostato && Math.abs(dx) > SOGLIA_TRASCINAMENTO) {
      spostato = true;
      fila.classList.add('trascinando');
    }
    if (spostato) fila.scrollLeft = s0 - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!trascinando) return;
    trascinando = false;
    fila.classList.remove('trascinando');
    avvolgi();
  });
  // Un trascinamento non deve aprire la foto o la scheda sotto il mouse
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

  // Dito, rotella e trackpad: scorrimento nativo, con pausa
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
