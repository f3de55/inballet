const year = document.getElementById('footerYear');
if (year) year.textContent = String(new Date().getFullYear());

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

const path = window.location.pathname.replace(/\/$/, '') || '/';
document.querySelectorAll<HTMLAnchorElement>('.footer-nav a').forEach((a) => {
  const href = a.getAttribute('href') ?? '';
  if (href === path || (href !== '/' && path.startsWith(href + '#'))) {
    a.classList.add('attiva');
  }
});
