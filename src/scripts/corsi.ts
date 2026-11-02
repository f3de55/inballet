/* Corsi: catalogo filtrabile per stile.
 * La barra dei filtri resta in vista mentre si scorre. «Tutti» mostra ogni gruppo; uno stile mostra solo il suo
 * e porta l'inizio del catalogo sotto la barra. Lo stile scelto finisce nell'indirizzo (/corsi#urban), così i
 * link del menu e del footer aprono già filtrato. Senza JavaScript i filtri sono link ai gruppi, tutti visibili. */
const filtri = [...document.querySelectorAll<HTMLAnchorElement>('.filtro[data-filtro]')];
const gruppi = [...document.querySelectorAll<HTMLElement>('.gruppo[data-gruppo]')];
const catalogo = document.getElementById('catalogo-corsi');

function applica(id: string) {
  const scelto = gruppi.some((g) => g.dataset.gruppo === id) ? id : 'tutti';
  filtri.forEach((f) => f.setAttribute('aria-pressed', String(f.dataset.filtro === scelto)));
  gruppi.forEach((g) => (g.hidden = scelto !== 'tutti' && g.dataset.gruppo !== scelto));
  return scelto;
}

/* Porta l'inizio del catalogo appena sotto la barra dei filtri, nella posizione in cui la barra resta fissa sotto la
 * navbar: i corsi scelti sono subito in vista, qualunque sia il punto della pagina da cui si parte */
function inizio(behavior: ScrollBehavior = 'smooth') {
  const barra = document.querySelector<HTMLElement>('.catalogo-filtri');
  if (!catalogo || !barra) return;
  const fissa = parseFloat(getComputedStyle(barra).top) || 0;
  const obiettivo = fissa + barra.offsetHeight + 16;
  const scarto = catalogo.getBoundingClientRect().top - obiettivo;
  if (Math.abs(scarto) > 4) window.scrollBy({ top: scarto, behavior });
}

const daHash = () => location.hash.replace('#', '');

if (filtri.length && gruppi.length && catalogo) {
  // Altezza della barra dei filtri: l'ancora dei gruppi atterra subito sotto (scroll-margin-top in corsi.css)
  const barra = document.querySelector<HTMLElement>('.catalogo-filtri');
  const misura = () => barra && document.documentElement.style.setProperty('--altezza-filtri', `${barra.offsetHeight}px`);
  misura();
  window.addEventListener('resize', misura);

  filtri.forEach((f) => {
    f.setAttribute('role', 'button');
    f.addEventListener('click', (e) => {
      e.preventDefault();
      const scelto = applica(f.dataset.filtro ?? 'tutti');
      history.replaceState(null, '', scelto === 'tutti' ? location.pathname : `#${scelto}`);
      inizio();
    });
    // Come un pulsante: anche la barra spaziatrice lo attiva
    f.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        f.click();
      }
    });
  });

  // Da un link (/corsi#urban): catalogo già filtrato e portato in vista, subito
  const iniziale = applica(daHash());
  if (iniziale !== 'tutti') {
    inizio('instant');
    // Il browser salta all'ancora dopo aver caricato la pagina (quando i gruppi erano tutti visibili): si ripete
    // il posizionamento a caricamento finito
    const riposiziona = () => requestAnimationFrame(() => inizio('instant'));
    if (document.readyState === 'complete') riposiziona();
    else window.addEventListener('load', riposiziona, { once: true });
  }

  window.addEventListener('hashchange', () => {
    applica(daHash());
    inizio();
  });
}
