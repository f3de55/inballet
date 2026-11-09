const contatori = [...document.querySelectorAll<HTMLElement>('.numero-value')];
const sezione = document.querySelector('.numeri-section');
const DURATA = 1200;

if (sezione && contatori.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const conta = () => {
    const inizio = performance.now();
    const passo = (t: number) => {
      const avanzamento = Math.min(1, (t - inizio) / DURATA);
      const curva = 1 - (1 - avanzamento) ** 3;
      for (const contatore of contatori) contatore.textContent = String(Math.round(Number(contatore.dataset.target) * curva));
      if (avanzamento < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  const osservatore = new IntersectionObserver(
    (voci) => {
      if (!voci.some((voce) => voce.isIntersecting)) return;
      osservatore.disconnect();
      conta();
    },
    { threshold: 0.5 },
  );
  osservatore.observe(sezione);
}

export {};
