/* ========================================
   INBALLET - HOMEPAGE JAVASCRIPT
   ========================================
   1. Google Reviews API Integration
   2. Infinite Gallery with Lightbox
   3. Navigation (Mega Menu + Mobile Menu)
   ======================================== */

// 1. GOOGLE REVIEWS API INTEGRATION
const GOOGLE_CONFIG = {
    placeId: 'ChIJMTLpHKeUhkcR23yEdflvQRQ',
    apiKey: 'AIzaSyB1T64uyO5Ke-MttLo9Amscl5ViUvYYvtI',
    maxReviews: 5,
    minRating: 1
};

class StaticGoogleReviews {
    constructor() {
        this.reviews = [];
        this.placeData = null;
        this.currentSlide = 0;
        this.carousel = null;
        this.init();
    }
    async init() {
        await this.loadGoogleReviews();
        this.renderReviews();
        this.initCarousel();
    }
    async loadGoogleReviews() {
        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_CONFIG.placeId}&fields=reviews,rating,user_ratings_total&language=it&key=${GOOGLE_CONFIG.apiKey}`;
            const response = await fetch(proxyUrl + encodeURIComponent(googleUrl));
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.status === 'OK' && data.result) {
                this.placeData = data.result;
                if (data.result.reviews && Array.isArray(data.result.reviews) && data.result.reviews.length > 0) {
                    this.reviews = data.result.reviews
                        .filter(review => review.rating >= GOOGLE_CONFIG.minRating)
                        .sort((a, b) => b.time - a.time)
                        .slice(0, GOOGLE_CONFIG.maxReviews);
                } else {
                    this.reviews = [];
                }
            } else {
                this.reviews = [];
                this.placeData = null;
            }
        } catch (error) {
            this.reviews = [];
            this.placeData = null;
        }
    }
    populateGoogleStats() {
        const statsCard = document.getElementById('googleStatsCard');
        const statsContent = document.getElementById('statsContent');
        if (!this.placeData || !statsCard || !statsContent) {
            if (statsCard) statsCard.style.display = 'none';
            return;
        }
        const { rating, user_ratings_total } = this.placeData;
        const satisfactionPercentage = rating ? Math.round((rating / 5) * 100) : 0;
        const starsHtml = this.generateStars(Math.round(rating || 0));
        statsContent.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Valutazione media</span>
                <div class="stat-stars">${starsHtml}</div>
            </div>
            <div class="stat-item">
                <span class="stat-label">Recensioni totali</span>
                <span class="stat-value">${user_ratings_total || 'N/A'}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Soddisfazione clienti</span>
                <span class="stat-value">${satisfactionPercentage}%</span>
            </div>
        `;
        statsCard.style.display = 'block';
    }
    renderReviews() {
        const container = document.getElementById('reviewsContainer');
        const indicators = document.getElementById('indicatorsContainer');
        const carouselSidebar = document.querySelector('.carousel-sidebar');
        const carouselMain = document.querySelector('.carousel-main');
        const carouselWithCta = document.querySelector('.carousel-with-cta');
        if (this.reviews.length === 0) {
            if (carouselSidebar) carouselSidebar.style.display = 'none';
            if (carouselMain) carouselMain.style.display = 'none';
            carouselWithCta.innerHTML = `
                <div class="no-reviews-message" style="width: 100%; display: flex; justify-content: center; padding: 3rem 0;">
                    <div class="alert-box">
                        <i class="fas fa-info-circle"></i>
                        <p>Le recensioni sono temporaneamente non disponibili. <br>
                        <small style="opacity: 0.7; margin-top: 0.5rem; display: block;">
                        Visualizza tutte le nostre recensioni direttamente su Google Maps.
                        </small></p>
                    </div>
                </div>
            `;
            return;
        }
        if (carouselSidebar) carouselSidebar.style.display = '';
        if (carouselMain) carouselMain.style.display = '';
        container.innerHTML = '';
        indicators.innerHTML = '';
        this.reviews.forEach((review, index) => {
            const slide = this.createReviewSlide(review, index);
            container.appendChild(slide);
            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-slide', index);
            indicators.appendChild(indicator);
        });
        const viewAllSection = document.getElementById('viewAllSection');
        if (viewAllSection) {
            viewAllSection.style.display = 'block';
        }
        this.populateGoogleStats();
    }

    createReviewSlide(review, index) {
        const slide = document.createElement('div');
        slide.className = `testimonials-slide ${index === 0 ? 'active' : ''}`;
        const initials = this.getInitials(review.author_name);
        const starsHtml = this.generateStars(review.rating);
        const fullText = review.text;
        const isLongText = fullText.length > 200;
        const shortText = isLongText ? fullText.substring(0, 200) : fullText;
        const uniqueId = `review_${Date.now()}_${index}`;
        slide.innerHTML = `
            <div class="testimonial-card">
                <div class="testimonial-header">
                    <div class="google-rating">
                        <div class="rating-badge">
                            <div class="stars">${starsHtml}</div>
                            <span class="rating-text">${review.rating}.0</span>
                        </div>
                    </div>
                </div>
                <div class="testimonial-content">
                    <p class="testimonial-text">
                        <span id="${uniqueId}_text">${shortText}${isLongText ? '...' : ''}</span>
                        ${isLongText ? `<button class="read-more-btn" id="${uniqueId}_btn" onclick="toggleFullText('${uniqueId}', \`${this.escapeForJs(fullText)}\`, \`${this.escapeForJs(shortText)}\`)">Leggi tutto</button>` : ''}
                    </p>
                </div>
                <div class="testimonial-footer">
                    <div class="testimonial-author">
                        <div class="author-avatar">${initials}</div>
                        <div class="author-info">
                            <h4>${review.author_name}</h4>
                            <div class="author-meta">
                                <span>Recensione su Google Maps</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return slide;
    }
    escapeForJs(text) {
        return text
            .replace(/\\/g, "\\\\")
            .replace(/`/g, "\\`")
            .replace(/\$/g, "\\$")
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r");
    }
    generateStars(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        return starsHtml;
    }
    getInitials(name) {
        return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    }
    initCarousel() {
        this.carousel = new TestimonialsCarousel();
    }
}
function toggleFullText(uniqueId, fullText, shortText) {
    const textElement = document.getElementById(uniqueId + '_text');
    const buttonElement = document.getElementById(uniqueId + '_btn');
    if (!textElement || !buttonElement) return;
    if (buttonElement.textContent === 'Leggi tutto') {
        textElement.textContent = fullText;
        buttonElement.textContent = 'Leggi meno';
    } else {
        textElement.textContent = shortText + '...';
        buttonElement.textContent = 'Leggi tutto';
    }
}
class TestimonialsCarousel {
    constructor() {
        this.slides = document.querySelectorAll('.testimonials-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        this.isTransitioning = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.swipeThreshold = 50;
        this.carousel = document.querySelector('.testimonials-carousel');
        this.init();
    }
    init() {
        this.bindEvents();
        this.bindTouchEvents();
    }
    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
    }
    bindTouchEvents() {
        this.carousel.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 1024) {
                this.handleStart(e);
            }
        }, { passive: false });
        this.carousel.addEventListener('touchmove', (e) => {
            if (window.innerWidth <= 1024) {
                this.handleMove(e);
            }
        }, { passive: false });
        this.carousel.addEventListener('touchend', (e) => {
            if (window.innerWidth <= 1024) {
                this.handleEnd(e);
            }
        }, { passive: false });
        this.carousel.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 1024) {
                this.startY = e.touches[0].clientY;
            }
        }, { passive: false });
        this.carousel.addEventListener('touchmove', (e) => {
            if (window.innerWidth <= 1024 && this.isDragging) {
                const diffY = Math.abs(e.touches[0].clientY - this.startY);
                const diffX = Math.abs(e.touches[0].clientX - this.startX);
                if (diffX > diffY) {
                    e.preventDefault();
                }
            }
        }, { passive: false });
    }
    handleStart(e) {
        if (window.innerWidth > 1024 || this.isTransitioning || this.slides.length <= 1) return;
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.carousel.style.userSelect = 'none';
    }
    handleMove(e) {
        if (window.innerWidth > 1024 || !this.isDragging || this.isTransitioning) return;
        this.currentX = e.touches[0].clientX;
        this.currentY = e.touches[0].clientY;
        const diffX = this.currentX - this.startX;
        const diffY = Math.abs(this.currentY - this.startY);
        if (Math.abs(diffX) > 10 && Math.abs(diffX) > diffY) {
            const currentSlideElement = this.slides[this.currentSlide];
            const translateX = Math.max(-50, Math.min(50, diffX / 4));
            currentSlideElement.style.transform = `translateX(${translateX}px)`;
            currentSlideElement.style.transition = 'none';
        }
    }
    handleEnd(e) {
        if (window.innerWidth > 1024 || !this.isDragging) return;
        this.isDragging = false;
        this.carousel.style.userSelect = '';
        const currentSlideElement = this.slides[this.currentSlide];
        currentSlideElement.style.transform = '';
        currentSlideElement.style.transition = '';
        const diffX = this.currentX - this.startX;
        const diffY = Math.abs(this.currentY - this.startY);
        if (Math.abs(diffX) > this.swipeThreshold && Math.abs(diffX) > diffY) {
            if (diffX > 0) {
                this.prevSlide();
            } else {
                this.nextSlide();
            }
        }
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide || this.slides.length <= 1) return;
        this.isTransitioning = true;
        const direction = index > this.currentSlide ? 1 : -1;
        this.slides[this.currentSlide].style.opacity = '0';
        this.slides[this.currentSlide].style.transform = `translateX(${-50 * direction}px)`;
        this.indicators[this.currentSlide].classList.remove('active');
        setTimeout(() => {
            this.slides[this.currentSlide].classList.remove('active');
            this.slides[this.currentSlide].style.display = 'none';
            this.currentSlide = index;
            this.slides[this.currentSlide].style.display = 'block';
            this.slides[this.currentSlide].style.opacity = '0';
            this.slides[this.currentSlide].style.transform = `translateX(${50 * direction}px)`;
            this.slides[this.currentSlide].classList.add('active');
            this.slides[this.currentSlide].offsetHeight;
            setTimeout(() => {
                this.slides[this.currentSlide].style.opacity = '1';
                this.slides[this.currentSlide].style.transform = 'translateX(0)';
                this.indicators[this.currentSlide].classList.add('active');
                setTimeout(() => {
                    this.isTransitioning = false;
                }, 400);
            }, 50);
        }, 200);
    }
    nextSlide() {
        if (this.slides.length <= 1) return;
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    prevSlide() {
        if (this.slides.length <= 1) return;
        const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }
    startAutoPlay() {
    }
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new StaticGoogleReviews();
});

// 2. INFINITE GALLERY WITH LIGHTBOX
class InBalletInfiniteGallery {
    constructor() {
        this.galleryTrack = document.getElementById('galleryTrack');
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.getElementById('lightbox-image');
        this.lightboxCounter = document.getElementById('lightbox-counter');
        this.lightboxClose = document.getElementById('lightbox-close');
        this.lightboxPrev = document.getElementById('lightbox-prev');
        this.lightboxNext = document.getElementById('lightbox-next');
        this.currentLightboxIndex = 0;
        this.images = [];
        this.isMobile = window.innerWidth <= 768;
        this.lightboxSwipeStartX = 0;
        this.lightboxSwipeEndX = 0;
        this.init();
    }
    init() {
        const uniqueItems = Array.from(this.galleryItems).slice(0, 10);
        uniqueItems.forEach((item, index) => {
            const img = item.querySelector('img');
            this.images.push({
                src: img.src,
                alt: img.alt,
                index: index
            });
        });
        this.bindEvents();
    }
    bindEvents() {
        this.galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.openLightbox(index);
            });
        });
        if (this.isMobile) {
            let touchTimeout;
            this.galleryTrack.addEventListener('touchstart', () => {
                this.galleryTrack.classList.add('paused');
                clearTimeout(touchTimeout);
            });
            this.galleryTrack.addEventListener('touchend', () => {
                touchTimeout = setTimeout(() => {
                    this.galleryTrack.classList.remove('paused');
                }, 2000);
            });
        }
        this.lightboxClose.addEventListener('click', () => this.closeLightbox());
        this.lightboxPrev.addEventListener('click', () => this.prevLightboxImage());
        this.lightboxNext.addEventListener('click', () => this.nextLightboxImage());
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (this.lightbox.classList.contains('active')) {
                switch(e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.prevLightboxImage();
                        break;
                    case 'ArrowRight':
                        this.nextLightboxImage();
                        break;
                }
            }
        });
        this.lightboxImage.addEventListener('touchstart', (e) => {
            this.lightboxSwipeStartX = e.changedTouches[0].screenX;
        });
        this.lightboxImage.addEventListener('touchend', (e) => {
            this.lightboxSwipeEndX = e.changedTouches[0].screenX;
            this.handleLightboxSwipe();
        });
    }
    handleLightboxSwipe() {
        const threshold = 50;
        const diff = this.lightboxSwipeStartX - this.lightboxSwipeEndX;
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextLightboxImage();
            } else {
                this.prevLightboxImage();
            }
        }
    }
    openLightbox(index) {
        this.currentLightboxIndex = index;
        this.updateLightbox();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.preloadAdjacentImages();
        this.ensureControlsVisibility();
    }
    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    updateLightbox() {
        const currentImage = this.images[this.currentLightboxIndex];
        this.lightboxImage.src = currentImage.src;
        this.lightboxImage.alt = currentImage.alt;
        this.lightboxCounter.textContent = `${this.currentLightboxIndex + 1} / ${this.images.length}`;
        this.lightboxImage.style.opacity = '0';
        setTimeout(() => {
            this.lightboxImage.style.opacity = '1';
            this.ensureControlsVisibility();
        }, 100);
    }
    ensureControlsVisibility() {
        const controls = [
            this.lightboxClose,
            this.lightboxPrev,
            this.lightboxNext,
            this.lightboxCounter
        ];
        controls.forEach(control => {
            if (control) {
                control.style.zIndex = '10001';
                control.style.visibility = 'visible';
                control.style.opacity = '1';
            }
        });
    }
    prevLightboxImage() {
        this.currentLightboxIndex = this.currentLightboxIndex === 0 ? this.images.length - 1 : this.currentLightboxIndex - 1;
        this.updateLightbox();
    }
    nextLightboxImage() {
        this.currentLightboxIndex = this.currentLightboxIndex === this.images.length - 1 ? 0 : this.currentLightboxIndex + 1;
        this.updateLightbox();
    }
    preloadAdjacentImages() {
        const prevIndex = this.currentLightboxIndex === 0 ? this.images.length - 1 : this.currentLightboxIndex - 1;
        const nextIndex = this.currentLightboxIndex === this.images.length - 1 ? 0 : this.currentLightboxIndex + 1;
        [prevIndex, nextIndex].forEach(index => {
            const img = new Image();
            img.src = this.images[index].src;
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new InBalletInfiniteGallery();
});
window.addEventListener('resize', () => {
    location.reload();
});

// 3. NAVIGATION (MEGA MENU + MOBILE MENU)
function initNavbar() {
    const navItems = document.querySelectorAll('.nav-item[data-menu]');
    const megaMenus = document.querySelectorAll('.mega-menu');
    let currentMenu = null;
    let hoverTimeout;
    navItems.forEach(item => {
        const menuId = item.getAttribute('data-menu');
        const megaMenu = document.getElementById(`mega-menu-${menuId}`);
        item.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            megaMenus.forEach(menu => menu.classList.remove('active'));
            if (megaMenu) {
                megaMenu.classList.add('active');
                currentMenu = megaMenu;
            }
        });
        item.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                if (currentMenu && !currentMenu.matches(':hover')) {
                    currentMenu.classList.remove('active');
                    currentMenu = null;
                }
            }, 100);
        });
    });
    megaMenus.forEach(menu => {
        menu.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
        });
        menu.addEventListener('mouseleave', () => {
            menu.classList.remove('active');
            currentMenu = null;
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item') && !e.target.closest('.mega-menu')) {
            megaMenus.forEach(menu => menu.classList.remove('active'));
            currentMenu = null;
        }
    });
    function forceHideNavElements() {
        const navMenu = document.querySelector('.nav-menu');
        const ctaBtn = document.querySelector('.cta-btn');
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (window.innerWidth <= 1200) {
            if (navMenu) {
                navMenu.style.display = 'none';
                navMenu.style.visibility = 'hidden';
                navMenu.style.opacity = '0';
                navMenu.style.pointerEvents = 'none';
                navMenu.style.position = 'absolute';
                navMenu.style.left = '-9999px';
            }
            if (ctaBtn) {
                ctaBtn.style.display = 'none';
                ctaBtn.style.visibility = 'hidden';
                ctaBtn.style.opacity = '0';
                ctaBtn.style.pointerEvents = 'none';
                ctaBtn.style.position = 'absolute';
                ctaBtn.style.left = '-9999px';
            }
            if (mobileBtn) {
                mobileBtn.style.display = 'block';
            }
        } else {
            if (navMenu) {
                navMenu.style.display = '';
                navMenu.style.visibility = '';
                navMenu.style.opacity = '';
                navMenu.style.pointerEvents = '';
                navMenu.style.position = '';
                navMenu.style.left = '';
            }
            if (ctaBtn) {
                ctaBtn.style.display = '';
                ctaBtn.style.visibility = '';
                ctaBtn.style.opacity = '';
                ctaBtn.style.pointerEvents = '';
                ctaBtn.style.position = '';
                ctaBtn.style.left = '';
            }
            if (mobileBtn) {
                mobileBtn.style.display = 'none';
            }
        }
    }
    forceHideNavElements();
    window.addEventListener('resize', forceHideNavElements);
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileNavToggles = document.querySelectorAll('.mobile-nav-toggle');
    function toggleMobileMenu() {
        const isActive = mobileMenu.classList.contains('active');
        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
    function openMobileMenu() {
        mobileMenuBtn.style.display = 'none';
        mobileMenu.classList.add('active');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeMobileMenu() {
        mobileMenuBtn.style.display = 'block';
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    mobileMenuClose.addEventListener('click', closeMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);
    mobileNavToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const submenu = document.getElementById(targetId);
            mobileNavToggles.forEach(otherToggle => {
                if (otherToggle !== this) {
                    const otherId = otherToggle.getAttribute('data-target');
                    const otherSubmenu = document.getElementById(otherId);
                    otherSubmenu.classList.remove('active');
                    otherToggle.classList.remove('active');
                }
            });
            submenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    });
    document.querySelectorAll('.mobile-submenu a, .mobile-cta a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    window.addEventListener('resize', function() {
        forceHideNavElements();
        if (window.innerWidth > 1200) {
            closeMobileMenu();
            mobileMenuBtn.style.display = 'none';
            megaMenus.forEach(menu => menu.classList.remove('active'));
            currentMenu = null;
        } else {
            if (!mobileMenu.classList.contains('active')) {
                mobileMenuBtn.style.display = 'block';
            }
        }
    });
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.main-header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(42, 42, 42, 0.98)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        } else {
            header.style.background = 'var(--header-dark)';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
        }
    });
}
window.addEventListener('componentsLoaded', initNavbar);

// INTERSECTION OBSERVER
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
        }
    });
}, observerOptions);
document.querySelectorAll('.corso-card').forEach(card => {
    observer.observe(card);
});
document.querySelectorAll('.percorso-item').forEach(item => {
    observer.observe(item);
});
