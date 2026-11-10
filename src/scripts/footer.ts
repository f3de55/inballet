const year = document.getElementById('footerYear');
if (year) year.textContent = String(new Date().getFullYear());

const mobile = window.matchMedia('(max-width: 700px)');
const riduci = window.matchMedia('(prefers-reduced-motion: reduce)');
const colonne = [...document.querySelectorAll<HTMLDetailsElement>('.footer-col')];
const animazioni = new WeakMap<HTMLDetailsElement, Animation>();

const adatta = () =>
  colonne.forEach((d) => {
    animazioni.get(d)?.cancel();
    d.open = !mobile.matches;
    d.querySelector('summary')!.tabIndex = mobile.matches ? 0 : -1;
  });

const anima = (d: HTMLDetailsElement) => {
  const apri = !d.open || d.classList.contains('footer-col--chiude');
  const da = d.getBoundingClientRect().height;
  animazioni.get(d)?.cancel();
  d.open = true;
  d.classList.toggle('footer-col--chiude', !apri);
  const a = apri ? d.getBoundingClientRect().height : d.querySelector('summary')!.getBoundingClientRect().height;
  const stile = getComputedStyle(document.documentElement);
  d.classList.add('footer-col--anima');
  const animazione = d.animate(
    { height: [`${da}px`, `${a}px`] },
    { duration: parseFloat(stile.getPropertyValue('--durata-pannello')) * 1000, easing: stile.getPropertyValue('--curva') },
  );
  animazioni.set(d, animazione);
  animazione.onfinish = () => {
    d.open = apri;
    d.classList.remove('footer-col--anima', 'footer-col--chiude');
  };
  animazione.oncancel = () => d.classList.remove('footer-col--anima', 'footer-col--chiude');
};

colonne.forEach((d) =>
  d.querySelector('summary')!.addEventListener('click', (e) => {
    if (mobile.matches && riduci.matches) return;
    e.preventDefault();
    if (mobile.matches) anima(d);
  }),
);
adatta();
mobile.addEventListener('change', adatta);
