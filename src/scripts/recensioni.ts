class CaroselloRecensioni {
  slides: HTMLElement[];
  indicators: HTMLElement[];
  track: HTMLElement | null;
  current = 0;
  transitioning = false;
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  dragging = false;

  constructor(root: HTMLElement) {
    this.slides = [...root.querySelectorAll<HTMLElement>('.testimonials-slide')];
    this.indicators = [...root.querySelectorAll<HTMLElement>('.indicator')];
    this.track = root.querySelector<HTMLElement>('.testimonials-track');
    const carousel = root.querySelector<HTMLElement>('.testimonials-carousel');
    if (this.slides.length < 2 || !carousel || !this.track) return;
    this.setMinHeight();
    root
      .querySelectorAll<HTMLElement>('.recensioni-nav')
      .forEach((b) => b.addEventListener('click', () => (b.dataset.passo === '1' ? this.next() : this.prev())));
    this.indicators.forEach((dot, i) => dot.addEventListener('click', () => this.goTo(i)));
    this.bindTouch(carousel);
  }

  setMinHeight() {
    this.slides.forEach((s) => Object.assign(s.style, { display: 'block', opacity: '0', position: 'absolute' }));
    const max = Math.max(...this.slides.map((s) => s.offsetHeight));
    this.slides.forEach((s, i) => Object.assign(s.style, { position: '', display: i === 0 ? 'block' : 'none', opacity: i === 0 ? '1' : '0' }));
    if (max > 0) this.track!.style.minHeight = `${max}px`;
  }

  bindTouch(carousel: HTMLElement) {
    const mobile = () => window.innerWidth <= 1024;
    carousel.addEventListener(
      'touchstart',
      (e) => {
        if (!mobile() || this.transitioning) return;
        this.dragging = true;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        carousel.style.userSelect = 'none';
      },
      { passive: true },
    );
    carousel.addEventListener(
      'touchmove',
      (e) => {
        if (!mobile() || !this.dragging || this.transitioning) return;
        this.currentX = e.touches[0].clientX;
        this.currentY = e.touches[0].clientY;
        const diffX = this.currentX - this.startX;
        const diffY = Math.abs(this.currentY - this.startY);
        if (Math.abs(diffX) > diffY) e.preventDefault();
        if (Math.abs(diffX) > 10 && Math.abs(diffX) > diffY) {
          const slide = this.slides[this.current];
          slide.style.transform = `translateX(${Math.max(-50, Math.min(50, diffX / 4))}px)`;
          slide.style.transition = 'none';
        }
      },
      { passive: false },
    );
    carousel.addEventListener(
      'touchend',
      () => {
        if (!mobile() || !this.dragging) return;
        this.dragging = false;
        carousel.style.userSelect = '';
        const slide = this.slides[this.current];
        slide.style.transform = '';
        slide.style.transition = '';
        const diffX = this.currentX - this.startX;
        const diffY = Math.abs(this.currentY - this.startY);
        if (this.currentX && Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
          if (diffX > 0) this.prev();
          else this.next();
        }
        this.startX = this.startY = this.currentX = this.currentY = 0;
      },
      { passive: true },
    );
  }

  goTo(index: number) {
    if (this.transitioning || index === this.current) return;
    this.transitioning = true;
    const dir = index > this.current ? 1 : -1;
    const from = this.slides[this.current];
    from.style.opacity = '0';
    from.style.transform = `translateX(${-20 * dir}px)`;
    this.indicators[this.current].classList.remove('active');
    this.indicators[index].classList.add('active');
    setTimeout(() => {
      from.classList.remove('active');
      from.style.display = 'none';
      this.current = index;
      const to = this.slides[index];
      Object.assign(to.style, { display: 'block', opacity: '0', transform: `translateX(${20 * dir}px)` });
      to.classList.add('active');
      void to.offsetHeight;
      setTimeout(() => {
        to.style.opacity = '1';
        to.style.transform = 'translateX(0)';
        setTimeout(() => (this.transitioning = false), 350);
      }, 30);
    }, 150);
  }

  next() {
    this.goTo((this.current + 1) % this.slides.length);
  }

  prev() {
    this.goTo((this.current - 1 + this.slides.length) % this.slides.length);
  }
}

function leggiTutto(slide: HTMLElement) {
  const text = slide.querySelector<HTMLElement>('.review-text');
  const button = slide.querySelector<HTMLButtonElement>('.read-more-btn');
  const completo = slide.dataset.completo;
  if (!text || !button || !completo) return;
  const breve = text.textContent ?? '';
  button.addEventListener('click', () => {
    text.style.opacity = '0.7';
    setTimeout(() => {
      const espandi = button.getAttribute('aria-expanded') !== 'true';
      text.textContent = espandi ? completo : breve;
      button.textContent = espandi ? 'Leggi meno' : 'Leggi tutto';
      button.setAttribute('aria-expanded', String(espandi));
      text.style.opacity = '1';
    }, 150);
  });
}

customElements.define(
  'recensioni-google',
  class extends HTMLElement {
    connectedCallback() {
      this.querySelectorAll<HTMLElement>('.testimonials-slide[data-completo]').forEach(leggiTutto);
      new CaroselloRecensioni(this);
    }
  },
);
