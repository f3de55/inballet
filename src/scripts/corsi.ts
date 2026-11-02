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

/* Porta l'inizio del catalogo appena sotto la barra dei filtri (che è sticky), solo se non è già in vista */
function inizio(behavior: ScrollBehavior = 'smooth') {
  if (!catalogo) return;
  const barra = document.querySelector<HTMLElement>('.catalogo-filtri');
  const sotto = (barra?.getBoundingClientRect().bottom ?? 0) + 16;
  const top = catalogo.getBoundingClientRect().top;
  if (top < sotto || top > window.innerHeight * 0.6) window.scrollBy({ top: top - sotto, behavior });
}

const daHash = () => location.hash.replace('#', '');

if (filtri.length && gruppi.length && catalogo) {
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
  if (iniziale !== 'tutti') inizio('instant');

  window.addEventListener('hashchange', () => {
    applica(daHash());
    inizio();
  });
}
