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

function scegli(a: HTMLAnchorElement) {
  const id = a.dataset.percorso!;
  mostra(id);
  history.replaceState(null, '', `#${id}`);
  // Tablet e mobile: le pillole sono una lista alta, il percorso scelto sta sotto; si scorre fino al titolo
  if (stretto.matches) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // Dal footer o da un link condiviso (/corsi#urban) si apre quel percorso; altrimenti il primo
  const daHash = () => schede.find((a) => `#${a.dataset.percorso}` === location.hash)?.dataset.percorso;
  mostra(daHash() ?? schede[0].dataset.percorso!);
  window.addEventListener('hashchange', () => {
    const id = daHash();
    if (id) mostra(id);
  });
}
