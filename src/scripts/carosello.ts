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

  // Due rappresentazioni della stessa posizione `pos` (px dall'inizio della prima metà):
  // - automatico: scrollLeft = 0 e il track traslato di -pos (la trasformazione ha precisione al
  //   decimo di pixel: scorre fluido anche a 30-40 px/s, mentre scrollLeft è a pixel interi e a
  //   quella velocità scatta a gradini, con l'effetto di tremolio)
  // - manuale: scrollLeft = pos, track fermo (scorrimento nativo di mouse, rotella e dito)
  let modo: 'auto' | 'manuale' = 'auto';
  let pos = 0;
  let ultimo = 0;
  let fermo = false;
  let sopra = false;
  let visibile = false;
  let ripresa = 0;
  let trascinando = false;
  let spostato = false;

  const mod = (x: number) => {
    const g = giro();
    return g ? ((x % g) + g) % g : 0;
  };
  const mostra = () => {
    track.style.transform = `translate3d(${-pos}px, 0, 0)`;
  };

  const inManuale = () => {
    if (modo === 'manuale') return;
    modo = 'manuale';
    track.style.transform = '';
    // Con spazio da entrambi i lati: le due metà sono identiche, si può stare nella seconda
    fila.scrollLeft = pos < fila.clientWidth ? pos + giro() : pos;
  };
  const inAutomatico = () => {
    if (modo === 'auto') return;
    pos = mod(fila.scrollLeft);
    modo = 'auto';
    fila.scrollLeft = 0;
    mostra();
  };

  const ferma = () => {
    inManuale();
    fermo = true;
    clearTimeout(ripresa);
  };
  const riparti = () => {
    clearTimeout(ripresa);
    ripresa = window.setTimeout(() => {
      if (trascinando) return;
      fermo = false;
      if (!sopra) inAutomatico();
    }, 2000);
  };

  // Posizione iniziale: a metà del giro; si aggiorna al caricamento (le foto fissano le larghezze)
  const inizia = () => {
    if (modo !== 'auto') return;
    pos = mod(giro() / 2);
    fila.scrollLeft = 0;
    mostra();
  };
  inizia();
  window.addEventListener('load', inizia, { once: true });

  const passo = (t: number) => {
    if (ultimo && modo === 'auto' && !fermo && !sopra && visibile && !document.querySelector('dialog[open]') && !document.hidden) {
      pos = mod(pos + (giro() / secondi) * ((t - ultimo) / 1000));
      mostra();
    }
    ultimo = t;
    requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);

  new IntersectionObserver(([e]) => (visibile = e.isIntersecting)).observe(fila);

  // Giro infinito anche a mano: oltre una metà si torna indietro di una metà (contenuto identico)
  fila.addEventListener(
    'scroll',
    () => {
      if (modo !== 'manuale') return;
      const g = giro();
      if (!g) return;
      if (fila.scrollLeft >= g) fila.scrollLeft -= g;
      else if (fila.scrollLeft <= 0) fila.scrollLeft += g;
    },
    { passive: true },
  );

  // Mouse: pausa al passaggio e trascinamento
  fila.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    sopra = true;
    inManuale(); // già in scorrimento nativo prima che arrivino rotella o clic: nessuna gara tra le due modalità
  });
  fila.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    sopra = false;
    if (!trascinando && !fermo) inAutomatico();
  });
  let xPrec = 0;
  let totale = 0;
  fila.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
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
    // Spostamento incrementale, con il giro già applicato: non si resta mai bloccati ai bordi
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
