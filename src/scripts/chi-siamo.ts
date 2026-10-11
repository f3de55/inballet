/* Chi Siamo: contatori animati e carousel delle sedi */

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

// === CAROUSEL SEDI (con swipe) ===
const slides = document.querySelectorAll<HTMLElement>('.sede-slide');
const thumbs = document.querySelectorAll<HTMLElement>('.sede-thumb');
const dots = document.querySelectorAll<HTMLElement>('.sede-dot');
let current = 0;
let autoPlay = 0;
let touchStartX = 0;

function goTo(index: number) {
  for (const list of [slides, thumbs, dots]) list[current]?.classList.remove('active');
  current = (index + slides.length) % slides.length;
  for (const list of [slides, thumbs, dots]) list[current]?.classList.add('active');
}

function restartAutoPlay() {
  clearInterval(autoPlay);
  autoPlay = window.setInterval(() => goTo(current + 1), 6000);
}

if (slides.length) {
  const navigate = (index: number) => {
    goTo(index);
    restartAutoPlay();
  };
  document.querySelector('.sede-prev')?.addEventListener('click', () => navigate(current - 1));
  document.querySelector('.sede-next')?.addEventListener('click', () => navigate(current + 1));
  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => navigate(i)));
  dots.forEach((dot, i) => dot.addEventListener('click', () => navigate(i)));

  const carousel = document.querySelector<HTMLElement>('.sede-carousel');
  carousel?.addEventListener('touchstart', (e) => (touchStartX = e.changedTouches[0].screenX), { passive: true });
  carousel?.addEventListener(
    'touchend',
    (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) navigate(diff > 0 ? current + 1 : current - 1);
    },
    { passive: true },
  );

  restartAutoPlay();
}
