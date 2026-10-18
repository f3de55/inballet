/* Chi Siamo: contatori animati e roster del team */

// === CONTATORI ===
function animateCounters() {
  document.querySelectorAll<HTMLElement>('.numero-value').forEach((counter) => {
    const target = Number(counter.dataset.target);
    const increment = target / 200;
    let count = 0;
    const update = () => {
      count = Math.min(target, Math.ceil(count + increment));
      counter.textContent = String(count);
      if (count < target) setTimeout(update, 10);
    };
    update();
  });
}

const numeriSection = document.querySelector('.numeri-section');
if (numeriSection) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      animateCounters();
      observer.disconnect();
    },
    { threshold: 0.5 },
  );
  observer.observe(numeriSection);
}

// === TEAM ===
// Desktop: un docente sempre selezionato (clic o passaggio del mouse sul nome).
// Tablet/mobile: fisarmonica, un pannello aperto alla volta, richiudibile.
const voci = [...document.querySelectorAll<HTMLButtonElement>('.team-voce')];
const desktop = window.matchMedia('(min-width: 901px)');
const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');

const seleziona = (scelta: HTMLButtonElement | null) =>
  voci.forEach((v) => {
    const aperta = v === scelta;
    v.setAttribute('aria-expanded', String(aperta));
    document.getElementById(v.getAttribute('aria-controls')!)!.hidden = !aperta;
  });

voci.forEach((v) => {
  v.addEventListener('click', () => {
    const aperta = v.getAttribute('aria-expanded') === 'true';
    seleziona(aperta && !desktop.matches ? null : v);
  });
  v.addEventListener('mouseenter', () => {
    if (desktop.matches && mouse.matches) seleziona(v);
  });
});

// Passando a desktop serve sempre un docente selezionato
desktop.addEventListener('change', (e) => {
  if (e.matches && !voci.some((v) => v.getAttribute('aria-expanded') === 'true')) seleziona(voci[0]);
});
