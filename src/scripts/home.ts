/* ========================================
   INBALLET - HOMEPAGE
   1. Recensioni Google (Maps JS caricato solo quando la sezione è vicina)
   2. Galleria infinita con lightbox
   ======================================== */
import { PUBLIC_GOOGLE_PLACE_ID } from 'astro:env/client';
import { loadGoogleMaps, whenNear } from './google-maps';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
}

const MAX_REVIEWS = 5;
const MIN_RATING = 1;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]!);

const stars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => `<i class="${i < rating ? 'fas' : 'far'} fa-star"></i>`).join('');

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

// === 1. RECENSIONI GOOGLE ===

/** Valutazione e recensioni del luogo dalla Places API (timeout 10s). */
async function fetchReviews(placeId: string): Promise<{ rating: number; total: number; reviews: Review[] }> {
  const { Place } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
  const place = new Place({ id: placeId, requestedLanguage: 'it' });
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout caricamento recensioni')), 10000));
  await Promise.race([place.fetchFields({ fields: ['rating', 'userRatingCount', 'reviews'] }), timeout]);
  const reviews = (place.reviews ?? [])
    .filter((r) => (r.rating ?? 0) >= MIN_RATING)
    .map((r) => ({
      author_name: r.authorAttribution?.displayName || 'Anonimo',
      rating: r.rating ?? 0,
      text: r.text || '',
      time: r.publishTime?.getTime() ?? 0,
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, MAX_REVIEWS);
  return { rating: place.rating ?? 0, total: place.userRatingCount ?? 0, reviews };
}

function renderStats(rating: number, total: number) {
  const card = document.getElementById('googleStatsCard');
  const content = document.getElementById('statsContent');
  if (!card || !content) return;
  content.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${rating ? rating.toFixed(1).replace('.', ',') : 'N/A'}</span>
                <div class="stat-stars">${stars(Math.round(rating))}</div>
                <span class="stat-label">${total ? `${total} recensioni su Google` : 'Recensioni Google'}</span>
            </div>
        `;
  card.style.display = 'block';
}

function renderError(message: string | null) {
  document.querySelectorAll<HTMLElement>('.carousel-sidebar, .carousel-main').forEach((el) => (el.style.display = 'none'));
  const wrapper = document.querySelector('.carousel-with-cta');
  if (!wrapper) return;
  wrapper.innerHTML = `
                    <div class="no-reviews-message" style="width: 100%; display: flex; justify-content: center; padding: 3rem 0;">
                        <div class="alert-box">
                            <i class="fas fa-info-circle"></i>
                            <p>Le recensioni sono temporaneamente non disponibili. ${message ? `<br><code style="background:#333;padding:4px 8px;border-radius:4px;font-size:12px;margin-top:8px;display:inline-block;">${escapeHtml(message)}</code>` : ''}<br>
                            <small style="opacity: 0.7; margin-top: 0.5rem; display: block;">
                            Visualizza tutte le nostre recensioni direttamente su Google Maps.
                            </small></p>
                        </div>
                    </div>
                `;
}

function createSlide(review: Review, index: number) {
  const slide = document.createElement('div');
  slide.className = `testimonials-slide ${index === 0 ? 'active' : ''}`;
  const full = review.text;
  const isLong = full.length > 200;
  const short = isLong ? full.substring(0, 200) : full;
  slide.innerHTML = `
            <div class="testimonial-card">
                <div class="testimonial-header">
                    <div class="google-rating">
                        <div class="rating-badge">
                            <div class="stars">${stars(review.rating)}</div>
                            <span class="rating-text">${review.rating}.0</span>
                        </div>
                    </div>
                </div>
                <div class="testimonial-content">
                    <p class="testimonial-text">
                        <span class="review-text">${escapeHtml(short)}${isLong ? '...' : ''}</span>
                        ${isLong ? '<button class="read-more-btn">Leggi tutto</button>' : ''}
                    </p>
                </div>
                <div class="testimonial-footer">
                    <div class="testimonial-author">
                        <div class="author-avatar">${escapeHtml(initials(review.author_name))}</div>
                        <div class="author-info">
                            <h4>${escapeHtml(review.author_name)}</h4>
                            <div class="author-meta">
                                <span>Recensione su Google Maps</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  if (isLong) {
    const text = slide.querySelector<HTMLElement>('.review-text')!;
    const button = slide.querySelector<HTMLButtonElement>('.read-more-btn')!;
    button.addEventListener('click', () => {
      text.style.opacity = '0.7';
      setTimeout(() => {
        const expand = button.textContent === 'Leggi tutto';
        text.textContent = expand ? full : short + '...';
        button.textContent = expand ? 'Leggi meno' : 'Leggi tutto';
        text.style.opacity = '1';
      }, 150);
    });
  }
  return slide;
}

function renderReviews(reviews: Review[]) {
  const container = document.getElementById('reviewsContainer');
  const indicators = document.getElementById('indicatorsContainer');
  if (!container || !indicators) return;
  container.replaceChildren(...reviews.map(createSlide));
  indicators.replaceChildren(
    ...reviews.map((_, i) => {
      const dot = document.createElement('div');
      dot.className = `indicator ${i === 0 ? 'active' : ''}`;
      dot.dataset.slide = String(i);
      return dot;
    }),
  );
  const viewAll = document.getElementById('viewAllSection');
  if (viewAll) viewAll.style.display = 'block';
}

class TestimonialsCarousel {
  slides = document.querySelectorAll<HTMLElement>('.testimonials-slide');
  indicators = document.querySelectorAll<HTMLElement>('.indicator');
  carousel = document.querySelector<HTMLElement>('.testimonials-carousel');
  track = document.querySelector<HTMLElement>('.testimonials-track');
  current = 0;
  transitioning = false;
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  dragging = false;

  constructor() {
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    if (!this.slides.length || !prev || !next || !this.carousel || !this.track) return;
    this.setMinHeight();
    prev.addEventListener('click', () => this.prev());
    next.addEventListener('click', () => this.next());
    this.indicators.forEach((dot, i) => dot.addEventListener('click', () => this.goTo(i)));
    this.bindTouch(this.carousel);
  }

  /** Altezza minima = slide più alta, per evitare salti di layout. */
  setMinHeight() {
    this.slides.forEach((s) => Object.assign(s.style, { display: 'block', opacity: '0', position: 'absolute' }));
    const max = Math.max(...[...this.slides].map((s) => s.offsetHeight));
    this.slides.forEach((s, i) => Object.assign(s.style, { position: '', display: i === 0 ? 'block' : 'none', opacity: i === 0 ? '1' : '0' }));
    if (max > 0) this.track!.style.minHeight = `${max}px`;
  }

  bindTouch(carousel: HTMLElement) {
    const mobile = () => window.innerWidth <= 1024;
    carousel.addEventListener(
      'touchstart',
      (e) => {
        if (!mobile() || this.transitioning || this.slides.length <= 1) return;
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
        if (Math.abs(diffX) > diffY) e.preventDefault(); // swipe orizzontale: blocca lo scroll
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
    if (this.transitioning || index === this.current || this.slides.length <= 1) return;
    this.transitioning = true;
    const dir = index > this.current ? 1 : -1;
    const from = this.slides[this.current];
    from.style.opacity = '0';
    from.style.transform = `translateX(${-20 * dir}px)`;
    this.indicators[this.current].classList.remove('active');
    setTimeout(() => {
      from.classList.remove('active');
      from.style.display = 'none';
      this.current = index;
      const to = this.slides[index];
      Object.assign(to.style, { display: 'block', opacity: '0', transform: `translateX(${20 * dir}px)` });
      to.classList.add('active');
      void to.offsetHeight; // forza il reflow prima della transizione
      setTimeout(() => {
        to.style.opacity = '1';
        to.style.transform = 'translateX(0)';
        this.indicators[index].classList.add('active');
        setTimeout(() => (this.transitioning = false), 350);
      }, 30);
    }, 150);
  }

  next() {
    if (this.slides.length > 1) this.goTo((this.current + 1) % this.slides.length);
  }

  prev() {
    if (this.slides.length > 1) this.goTo((this.current - 1 + this.slides.length) % this.slides.length);
  }
}

async function initReviews() {
  try {
    await loadGoogleMaps();
    const { rating, total, reviews } = await fetchReviews(PUBLIC_GOOGLE_PLACE_ID);
    if (!reviews.length) return renderError(null);
    renderReviews(reviews);
    renderStats(rating, total);
    new TestimonialsCarousel();
  } catch (error) {
    console.error('Reviews error:', error);
    renderError((error as Error).message);
  }
}

const reviewsSection = document.querySelector('.dicono-di-noi-section');
if (reviewsSection) whenNear(reviewsSection, () => void initReviews());

// === 2. GALLERIA INFINITA CON LIGHTBOX ===

const track = document.getElementById('galleryTrack');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image') as HTMLImageElement | null;
const lightboxCounter = document.getElementById('lightbox-counter');

if (track && lightbox && lightboxImage && lightboxCounter) {
  const items = [...document.querySelectorAll<HTMLElement>('.gallery-item')];
  // Le prime 10 sono le immagini uniche (le altre sono il duplicato per lo scroll)
  const images = items.slice(0, 10).map((item) => {
    const img = item.querySelector('img')!;
    return { src: item.dataset.full || img.currentSrc || img.src, alt: img.alt };
  });
  const controls = ['lightbox-close', 'lightbox-prev', 'lightbox-next', 'lightbox-counter'].map((id) => document.getElementById(id));
  let index = 0;
  let swipeStart = 0;

  const ensureControls = () =>
    controls.forEach((c) => c && Object.assign(c.style, { zIndex: '10001', visibility: 'visible', opacity: '1' }));

  const preloadAdjacent = () => {
    const n = images.length;
    [(index - 1 + n) % n, (index + 1) % n].forEach((i) => (new Image().src = images[i].src));
  };

  const show = (i: number) => {
    index = (i + images.length) % images.length;
    lightboxImage.src = images[index].src;
    lightboxImage.alt = images[index].alt;
    lightboxCounter.textContent = `${index + 1} / ${images.length}`;
    lightboxImage.style.opacity = '0';
    setTimeout(() => {
      lightboxImage.style.opacity = '1';
      ensureControls();
    }, 100);
    preloadAdjacent();
  };

  const open = (i: number) => {
    show(i);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    ensureControls();
  };

  const close = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
  };

  items.forEach((item) => item.addEventListener('click', () => open(Number(item.dataset.index))));

  // Pausa dello scroll automatico al tocco (mobile)
  let resumeTimer = 0;
  track.addEventListener(
    'touchstart',
    () => {
      if (window.innerWidth > 768) return;
      track.classList.add('paused');
      clearTimeout(resumeTimer);
    },
    { passive: true },
  );
  track.addEventListener(
    'touchend',
    () => {
      if (window.innerWidth > 768) return;
      resumeTimer = window.setTimeout(() => track.classList.remove('paused'), 2000);
    },
    { passive: true },
  );

  document.getElementById('lightbox-close')?.addEventListener('click', close);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => show(index - 1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => show(index + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
  lightboxImage.addEventListener('touchstart', (e) => (swipeStart = e.changedTouches[0].screenX), { passive: true });
  lightboxImage.addEventListener(
    'touchend',
    (e) => {
      const diff = swipeStart - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) show(diff > 0 ? index + 1 : index - 1);
    },
    { passive: true },
  );
}
