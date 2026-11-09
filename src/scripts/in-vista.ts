const osservatore = new IntersectionObserver((voci) => {
  for (const voce of voci) voce.target.classList.toggle('in-vista', voce.isIntersecting);
});

document.querySelectorAll('[data-in-vista]').forEach((elemento) => osservatore.observe(elemento));

export {};
