/* ========================================
   INBALLET - HOMEPAGE
   Recensioni Google (Maps JS caricato solo quando la sezione è vicina);
   la galleria è in galleria.ts
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

// === RECENSIONI GOOGLE ===

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
  const box = document.getElementById('googleStatsCard');
  if (!box || !rating) return;
  box.innerHTML = `
            <span class="sintesi-voto">${rating.toFixed(1).replace('.', ',')}</span>
            <span class="sintesi-stelle" aria-hidden="true">${stars(Math.round(rating))}</span>
            <span class="sintesi-totale">${total ? `${total} recensioni su Google` : 'Recensioni su Google'}</span>
        `;
  box.setAttribute('aria-label', `Valutazione media ${rating.toFixed(1)} su 5${total ? `, ${total} recensioni su Google` : ''}`);
  box.hidden = false;
}

function renderError() {
  const track = document.getElementById('reviewsContainer');
  if (!track) return;
  track.innerHTML = `
            <div class="testimonials-slide active">
                <p class="recensioni-messaggio">Le recensioni non sono disponibili in questo momento: puoi leggerle direttamente su Google.</p>
            </div>
        `;
}

function createSlide(review: Review, index: number) {
  const slide = document.createElement('figure');
  slide.className = `testimonials-slide ${index === 0 ? 'active' : ''}`;
  const full = review.text;
  const isLong = full.length > 200;
  // Taglio a fine parola, non a metà
  const short = isLong ? full.substring(0, 200).replace(/\s+\S*$/, '') : full;
  slide.innerHTML = `
            <div class="recensione-stelle" role="img" aria-label="${review.rating} stelle su 5">${stars(review.rating)}</div>
            <blockquote class="recensione-testo">
                <p>
                    <span class="review-text">${escapeHtml(short)}${isLong ? '…' : ''}</span>
                    ${isLong ? '<button type="button" class="read-more-btn">Leggi tutto</button>' : ''}
                </p>
            </blockquote>
            <figcaption class="recensione-autore">
                <span class="author-avatar" aria-hidden="true">${escapeHtml(initials(review.author_name))}</span>
                <span>
                    <strong>${escapeHtml(review.author_name)}</strong>
                    <span class="recensione-fonte">Recensione su Google</span>
                </span>
            </figcaption>
        `;
  if (isLong) {
    const text = slide.querySelector<HTMLElement>('.review-text')!;
    const button = slide.querySelector<HTMLButtonElement>('.read-more-btn')!;
    button.addEventListener('click', () => {
      text.style.opacity = '0.7';
      setTimeout(() => {
        const expand = button.textContent === 'Leggi tutto';
        text.textContent = expand ? full : short + '…';
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
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `indicator ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Recensione ${i + 1} di ${reviews.length}`);
      return dot;
    }),
  );
  const controls = document.getElementById('reviewsControls');
  if (controls) controls.hidden = reviews.length < 2;
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
    renderStats(rating, total);
    if (!reviews.length) return renderError();
    renderReviews(reviews);
    new TestimonialsCarousel();
  } catch (error) {
    console.error('Reviews error:', error);
    renderError();
  }
}

const reviewsSection = document.querySelector('.dicono-di-noi-section');
if (reviewsSection) whenNear(reviewsSection, () => void initReviews());
