/* Chi Siamo: contatori animati */

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
