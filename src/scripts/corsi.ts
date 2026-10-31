/* Corsi: i percorsi come schede. Le pillole in alto (link #percorso) mostrano un percorso alla volta,
 * così la pagina resta corta e non si ripetono cinque strisce di box una sotto l'altra.
 * Senza JavaScript restano link e i percorsi sono tutti visibili uno sotto l'altro. */
const nav = document.querySelector<HTMLElement>('.salti');
const schede = [...document.querySelectorAll<HTMLAnchorElement>('.salti a[data-percorso]')];
const pannelli = schede.map((a) => document.getElementById(a.dataset.percorso ?? ''));
const stretto = window.matchMedia('(max-width: 900px)');

function mostra(id: string) {
  schede.forEach((a, i) => {
    const attiva = a.dataset.percorso === id;
    a.setAttribute('aria-selected', String(attiva));
    a.tabIndex = attiva ? 0 : -1;
    pannelli[i]!.hidden = !attiva;
  });
}

/* Porta in vista il percorso. Lo spazio per l'header fisso è già nello scroll-padding-top di html (reset.css);
 * lo scorrimento è fluido o immediato secondo il CSS (scroll-behavior, che rispetta "riduci movimento"). */
function vai(id: string, behavior: ScrollBehavior = 'auto') {
  document.getElementById(id)?.scrollIntoView({ block: 'start', behavior });
}

function scegli(a: HTMLAnchorElement) {
  const id = a.dataset.percorso!;
  mostra(id);
  history.replaceState(null, '', `#${id}`);
  // Tablet e mobile: le pillole sono una lista alta, il percorso scelto sta sotto; si scorre fino al titolo.
  // Su PC le pillole sono subito sopra il percorso: la pagina resta ferma
  if (stretto.matches) vai(id);
}

if (nav && schede.length && pannelli.every(Boolean)) {
  nav.setAttribute('role', 'tablist');
  schede.forEach((a, i) => {
    const pannello = pannelli[i]!;
    a.id = `scheda-${pannello.id}`;
    a.setAttribute('role', 'tab');
    a.setAttribute('aria-controls', pannello.id);
    pannello.setAttribute('role', 'tabpanel');
    pannello.setAttribute('aria-labelledby', a.id);

    a.addEventListener('click', (e) => {
      e.preventDefault();
      scegli(a);
    });

    // Frecce sinistra/destra (o su/giù) tra le schede, come in ogni elenco di schede
    a.addEventListener('keydown', (e) => {
      const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!passo) return;
      e.preventDefault();
      const prossima = schede[(i + passo + schede.length) % schede.length];
      prossima.focus();
      scegli(prossima);
    });
  });

  // Da un link condiviso o da un'altra pagina (/corsi#urban) si apre quel percorso; altrimenti il primo.
  // Il browser può aver già saltato all'ancora quando i percorsi erano tutti visibili (la pagina era più lunga):
  // dopo averli nascosti si riporta il percorso in vista, subito e senza animazione
  const daHash = () => schede.find((a) => `#${a.dataset.percorso}` === location.hash)?.dataset.percorso;
  const iniziale = daHash();
  mostra(iniziale ?? schede[0].dataset.percorso!);
  if (iniziale) vai(iniziale, 'instant');

  // Link del footer con la pagina già aperta: il percorso era nascosto e il browser non ha potuto scorrere
  window.addEventListener('hashchange', () => {
    const id = daHash();
    if (!id) return;
    mostra(id);
    vai(id);
  });
}
