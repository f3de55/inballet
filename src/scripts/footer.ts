/* ========================================
   FOOTER (anno corrente, mappa del sito a fisarmonica su mobile)
   ======================================== */
// La pagina è statica: aggiorna l'anno se il build è di un anno precedente
const year = document.getElementById('footerYear');
if (year) year.textContent = String(new Date().getFullYear());

// Mappa del sito: colonne aperte su desktop e tablet, fisarmonica chiusa su mobile
const mobile = window.matchMedia('(max-width: 700px)');
const colonne = [...document.querySelectorAll<HTMLDetailsElement>('.footer-col')];

const adatta = () =>
  colonne.forEach((d) => {
    d.open = !mobile.matches;
    d.querySelector('summary')!.tabIndex = mobile.matches ? 0 : -1;
  });

colonne.forEach((d) =>
  d.querySelector('summary')!.addEventListener('click', (e) => {
    if (!mobile.matches) e.preventDefault();
  }),
);
adatta();
mobile.addEventListener('change', adatta);

// Active state footer links
const path = window.location.pathname.replace(/\/$/, '') || '/';
document.querySelectorAll<HTMLAnchorElement>('.footer-nav a').forEach((a) => {
  const href = a.getAttribute('href') ?? '';
  if (href === path || (href !== '/' && path.startsWith(href + '#'))) {
    a.classList.add('attiva');
  }
});
