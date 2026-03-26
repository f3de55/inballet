<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Scopri la storia di InBallet, la scuola di danza fondata da Ilenia Nobile. Dal 2007 formiamo ballerini a Lainate e Rho con passione e professionalità.">
    <meta name="keywords" content="chi siamo InBallet, storia scuola danza, Ilenia Nobile, team insegnanti danza, Lainate, Rho">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Chi Siamo - InBallet">
    <meta property="og:description" content="La storia, la visione e il team di InBallet. Dal 2007 formiamo ballerini con passione.">

    <title>Chi Siamo - InBallet</title>

    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Francois+One&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
    <style>body{min-height:100vh}.main-header{min-height:80px}</style>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <a href="#main-content" class="skip-link">Salta al contenuto principale</a>
    <?php include 'components/header.php'; ?>

    <main id="main-content" role="main" tabindex="-1">

        <!-- Hero Chi Siamo -->
        <section class="chisiamo-hero">
            <div class="chisiamo-hero-image" style="background-image: url('assets/images/gallery-6.jpg')"></div>
            <div class="chisiamo-hero-overlay"></div>
            <div class="chisiamo-hero-glass">
                <span class="chisiamo-hero-badge">Chi Siamo</span>
                <h1 class="chisiamo-hero-title">La nostra storia</h1>
                <p class="chisiamo-hero-tagline">Dal 2007 formiamo ballerini con passione e dedizione.</p>
                <a href="#fondatrice" class="chisiamo-scroll-arrow" aria-label="Scorri in basso">
                    <i class="fas fa-chevron-down"></i>
                </a>
            </div>
        </section>

        <!-- Fondatrice Section -->
        <section id="fondatrice" class="fondatrice-section">
            <div class="container">
                <div class="fondatrice-layout">
                    <div class="fondatrice-visual">
                        <div class="fondatrice-image-wrapper">
                            <img src="assets/images/ilenia.jpg" alt="Ilenia Nobile, Fondatrice e Direttrice Artistica di InBallet" loading="lazy">
                            <div class="fondatrice-quote-card">
                                <span class="quote-icon"><i class="fas fa-quote-left"></i></span>
                                <blockquote>
                                    "La danza è un linguaggio universale che connette corpo, mente e anima"
                                </blockquote>
                                <cite>— Ilenia Nobile</cite>
                            </div>
                        </div>
                    </div>
                    <div class="fondatrice-content">
                        <span class="fondatrice-label">Fondatrice & Direttrice Artistica</span>
                        <h2 class="fondatrice-name">Ilenia Nobile</h2>
                        <div class="fondatrice-bio">
                            <p>Dallo skate park di Lainate a 3 sedi operative: <strong>Ilenia Nobile</strong> ha trasformato la sua passione in una scuola dove la danza è accessibile a tutti.</p>
                            <div class="fondatrice-separator"></div>
                            <p>La sua filosofia: il movimento come strumento di crescita personale completa.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Timeline Storia con Serpentina -->
        <section class="storia-section">
            <div class="container">
                <div class="storia-header">
                    <span class="storia-label">Il Nostro Percorso</span>
                    <h2 class="storia-title">Una storia di passione</h2>
                </div>
                <div class="timeline-snake">
                    <!-- SVG Serpentina -->
                    <svg class="timeline-path" viewBox="-8 0 116 100" preserveAspectRatio="none">
                        <path class="snake-line" d="
                            M 17 20 H 83
                            Q 108 20, 108 30
                            L 108 40
                            Q 108 50, 98 50
                            L 2 50
                            Q -8 50, -8 60
                            L -8 70
                            Q -8 80, 2 80
                            L 17 80 H 83
                        "></path>
                    </svg>
                    <!-- Riga 1 -->
                    <div class="timeline-row">
                        <div class="timeline-card">
                            <span class="timeline-year">2007</span>
                            <h3>Il Primo Passo</h3>
                            <p>Ilenia fonda InBallet nello skate park di Lainate.</p>
                        </div>
                        <div class="timeline-card">
                            <span class="timeline-year">2010</span>
                            <h3>Crescita</h3>
                            <p>Dalla strada alla prima sede stabile.</p>
                        </div>
                        <div class="timeline-card">
                            <span class="timeline-year">2015</span>
                            <h3>Espansione</h3>
                            <p>Apertura della seconda sede a Rho.</p>
                        </div>
                    </div>
                    <!-- Riga 2 -->
                    <div class="timeline-row">
                        <div class="timeline-card">
                            <span class="timeline-year">2020</span>
                            <h3>Innovazione</h3>
                            <p>Didattica online durante la pandemia.</p>
                        </div>
                        <div class="timeline-card">
                            <span class="timeline-year">2023</span>
                            <h3>Riconoscimento</h3>
                            <p>Ente Formativo CSEN e CONI. Qualità certificata.</p>
                        </div>
                        <div class="timeline-card timeline-card-highlight">
                            <span class="timeline-year">2025</span>
                            <h3>Oggi</h3>
                            <p>500+ allievi, 3 sedi operative e un team di professionisti.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- InBallet in Numeri -->
        <section class="numeri-section">
            <div class="container">
                <div class="numeri-header">
                    <span class="numeri-label">InBallet in Numeri</span>
                    <h2 class="numeri-title">I risultati parlano da soli</h2>
                </div>
                <div class="numeri-grid">
                    <div class="numero-item">
                        <div class="numero-value-wrapper">
                            <span class="numero-value" data-target="18">0</span>
                        </div>
                        <span class="numero-label">Anni di esperienza</span>
                    </div>
                    <div class="numero-item">
                        <div class="numero-value-wrapper">
                            <span class="numero-value" data-target="500">0</span><span class="numero-suffix">+</span>
                        </div>
                        <span class="numero-label">Allievi formati</span>
                    </div>
                    <div class="numero-item">
                        <div class="numero-value-wrapper">
                            <span class="numero-value" data-target="2">0</span>
                        </div>
                        <span class="numero-label">Sedi a Lainate e Rho</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Team Professionisti -->
        <section class="team-section">
            <div class="container">
                <div class="team-header">
                    <span class="team-label">Il Nostro Team</span>
                    <h2 class="team-title">I professionisti di InBallet</h2>
                    <p class="team-subtitle">Insegnanti qualificati, uniti dalla passione per la danza.</p>
                </div>
                <div class="team-grid">
                    <article class="team-card">
                        <div class="team-card-image">
                            <img src="assets/images/gallery-1.jpg" alt="Ilenia Nobile" loading="lazy">
                        </div>
                        <div class="team-card-content">
                            <h3>Ilenia Nobile</h3>
                            <span class="team-role">Direttrice Artistica</span>
                            <p>Fondatrice di InBallet. Danza classica e contemporanea.</p>
                        </div>
                    </article>
                    <article class="team-card">
                        <div class="team-card-image">
                            <img src="assets/images/gallery-2.jpg" alt="Marco Bianchi" loading="lazy">
                        </div>
                        <div class="team-card-content">
                            <h3>Marco Bianchi</h3>
                            <span class="team-role">Coreografo Hip Hop</span>
                            <p>15 anni nelle street dance. Giudice in competizioni nazionali.</p>
                        </div>
                    </article>
                    <article class="team-card">
                        <div class="team-card-image">
                            <img src="assets/images/gallery-3.jpg" alt="Sofia Russo" loading="lazy">
                        </div>
                        <div class="team-card-content">
                            <h3>Sofia Russo</h3>
                            <span class="team-role">Insegnante Danza Classica</span>
                            <p>Diplomata Accademia Nazionale. Propedeutica e tecnica classica.</p>
                        </div>
                    </article>
                    <article class="team-card">
                        <div class="team-card-image">
                            <img src="assets/images/gallery-4.jpg" alt="Giulia Ferrara" loading="lazy">
                        </div>
                        <div class="team-card-content">
                            <h3>Giulia Ferrara</h3>
                            <span class="team-role">Insegnante Modern Jazz</span>
                            <p>Ballerina professionista. Produzioni teatrali e TV.</p>
                        </div>
                    </article>
                    <article class="team-card">
                        <div class="team-card-image">
                            <img src="assets/images/gallery-7.jpg" alt="Luca Martini" loading="lazy">
                        </div>
                        <div class="team-card-content">
                            <h3>Luca Martini</h3>
                            <span class="team-role">Insegnante Breaking</span>
                            <p>B-boy dal 2008. Vincitore di battle nazionali.</p>
                        </div>
                    </article>
                    <article class="team-card">
                        <div class="team-card-image">
                            <img src="assets/images/gallery-8.jpg" alt="Elena Costa" loading="lazy">
                        </div>
                        <div class="team-card-content">
                            <h3>Elena Costa</h3>
                            <span class="team-role">Insegnante Pilates & Yoga</span>
                            <p>Certificata internazionalmente. Benessere per danzatori.</p>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <!-- Carosello Sede Fullwidth -->
        <section class="sede-section">
            <div class="sede-header">
                <div class="container">
                    <span class="sede-label">I Nostri Spazi</span>
                    <h2 class="sede-title">Dove nasce la magia</h2>
                    <p class="sede-subtitle">Spazi progettati per ispirare e far crescere ogni ballerino.</p>
                </div>
            </div>
            <div class="sede-carousel-wrapper">
                <div class="sede-carousel">
                    <div class="sede-slide active">
                        <div class="sede-slide-image">
                            <img src="assets/images/gallery-9.jpg" alt="Sede Centrale Lainate">
                        </div>
                        <div class="sede-slide-content">
                            <h3>Sede Centrale</h3>
                            <p>500mq di spazi dedicati alla danza nel cuore di Lainate.</p>
                            <ul class="sede-features">
                                <li><i class="fas fa-check"></i> 3 sale danza professionali</li>
                                <li><i class="fas fa-check"></i> Pavimentazione tecnica</li>
                                <li><i class="fas fa-check"></i> Specchi e sbarre</li>
                                <li><i class="fas fa-check"></i> Climatizzazione</li>
                            </ul>
                        </div>
                    </div>
                    <div class="sede-slide">
                        <div class="sede-slide-image">
                            <img src="assets/images/gallery-10.jpg" alt="Sale Danza">
                        </div>
                        <div class="sede-slide-content">
                            <h3>Sale Danza</h3>
                            <p>Ambienti luminosi e attrezzati per ogni disciplina.</p>
                            <ul class="sede-features">
                                <li><i class="fas fa-check"></i> Impianto audio professionale</li>
                                <li><i class="fas fa-check"></i> Illuminazione regolabile</li>
                                <li><i class="fas fa-check"></i> Ampi spazi per il movimento</li>
                                <li><i class="fas fa-check"></i> Attrezzature specifiche</li>
                            </ul>
                        </div>
                    </div>
                    <div class="sede-slide">
                        <div class="sede-slide-image">
                            <img src="assets/images/gallery-6.jpg" alt="Area Famiglie">
                        </div>
                        <div class="sede-slide-content">
                            <h3>Spazio Famiglie</h3>
                            <p>Area accoglienza dove i genitori possono attendere in tranquillità.</p>
                            <ul class="sede-features">
                                <li><i class="fas fa-couch"></i> Area relax</li>
                                <li><i class="fas fa-wifi"></i> WiFi gratuito</li>
                                <li><i class="fas fa-child"></i> Spazio genitori</li>
                                <li><i class="fas fa-heart"></i> Atmosfera accogliente</li>
                            </ul>
                        </div>
                    </div>
                    <div class="sede-slide">
                        <div class="sede-slide-image">
                            <img src="assets/images/ballerina.jpg" alt="Spogliatoi">
                        </div>
                        <div class="sede-slide-content">
                            <h3>Spogliatoi</h3>
                            <p>Spazi puliti e funzionali per prepararsi alle lezioni.</p>
                            <ul class="sede-features">
                                <li><i class="fas fa-check"></i> Armadietti personali</li>
                                <li><i class="fas fa-check"></i> Docce</li>
                                <li><i class="fas fa-check"></i> Pulizia quotidiana</li>
                                <li><i class="fas fa-check"></i> Spazi separati</li>
                            </ul>
                        </div>
                    </div>
                    <div class="sede-slide">
                        <div class="sede-slide-image">
                            <img src="assets/images/hero-bg.jpg" alt="Sede Rho">
                        </div>
                        <div class="sede-slide-content">
                            <h3>Sede Rho</h3>
                            <p>La metodologia InBallet ancora più vicino alle famiglie.</p>
                            <ul class="sede-features">
                                <li><i class="fas fa-check"></i> 2 sale danza</li>
                                <li><i class="fas fa-check"></i> Stessi standard qualitativi</li>
                                <li><i class="fas fa-check"></i> Facile accessibilità</li>
                                <li><i class="fas fa-check"></i> Parcheggio</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <button class="sede-nav sede-prev" aria-label="Slide precedente"><i class="fas fa-chevron-left"></i></button>
                <button class="sede-nav sede-next" aria-label="Slide successiva"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="sede-thumbnails">
                <button class="sede-thumb active" data-slide="0">
                    <img src="assets/images/gallery-9.jpg" alt="Sede Centrale">
                    <span>Sede Centrale</span>
                </button>
                <button class="sede-thumb" data-slide="1">
                    <img src="assets/images/gallery-10.jpg" alt="Sale Danza">
                    <span>Sale Danza</span>
                </button>
                <button class="sede-thumb" data-slide="2">
                    <img src="assets/images/gallery-6.jpg" alt="Area Famiglie">
                    <span>Area Famiglie</span>
                </button>
                <button class="sede-thumb" data-slide="3">
                    <img src="assets/images/ballerina.jpg" alt="Spogliatoi">
                    <span>Spogliatoi</span>
                </button>
                <button class="sede-thumb" data-slide="4">
                    <img src="assets/images/hero-bg.jpg" alt="Sede Rho">
                    <span>Sede Rho</span>
                </button>
            </div>
            <div class="sede-dots">
                <button class="sede-dot active" data-slide="0" aria-label="Vai a slide 1"></button>
                <button class="sede-dot" data-slide="1" aria-label="Vai a slide 2"></button>
                <button class="sede-dot" data-slide="2" aria-label="Vai a slide 3"></button>
                <button class="sede-dot" data-slide="3" aria-label="Vai a slide 4"></button>
                <button class="sede-dot" data-slide="4" aria-label="Vai a slide 5"></button>
            </div>
        </section>

        <!-- CTA Finale - Stesso stile template corsi -->
        <section class="corso-contatto-section">
            <div class="corso-contatto-bg" style="background: url('assets/images/bg-progetti-territorio.jpg') center/cover no-repeat"></div>
            <div class="corso-contatto-overlay"></div>
            <div class="corso-contatto-wrapper">
                <div class="corso-contatto-content">
                    <h2>Vuoi far parte della famiglia InBallet?</h2>
                    <p>Prenota una lezione di prova gratuita.</p>
                    <a href="index.html#prenota" class="corso-btn-cta">
                        Prenota una Prova <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </section>

    </main>

    <footer class="footer" role="contentinfo">
        <?php include 'components/footer.php'; ?>
    </footer>

    <script src="js/main.js"></script>
    <script>window.dispatchEvent(new Event('componentsLoaded'));</script>
    <script>
    // Counter Animation
    function animateCounters() {
        const counters = document.querySelectorAll('.numero-value');
        const speed = 200;

        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const increment = target / speed;

            const updateCount = () => {
                const count = +counter.innerText;
                if (count < target) {
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target;
                }
            };

            updateCount();
        });
    }

    // Intersection Observer per counter
    const numeriSection = document.querySelector('.numeri-section');
    if (numeriSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(numeriSection);
    }

    // Sede Carousel - CON swipe touch
    const sedeCarousel = {
        currentSlide: 0,
        slides: document.querySelectorAll('.sede-slide'),
        thumbs: document.querySelectorAll('.sede-thumb'),
        dots: document.querySelectorAll('.sede-dot'),
        autoPlayInterval: null,
        touchStartX: 0,
        touchEndX: 0,

        init() {
            if (!this.slides.length) return;

            const carousel = document.querySelector('.sede-carousel');

            document.querySelector('.sede-prev')?.addEventListener('click', () => {
                this.prev();
                this.resetAutoPlay();
            });
            document.querySelector('.sede-next')?.addEventListener('click', () => {
                this.next();
                this.resetAutoPlay();
            });

            this.thumbs.forEach((thumb, index) => {
                thumb.addEventListener('click', () => {
                    this.goTo(index);
                    this.resetAutoPlay();
                });
            });

            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    this.goTo(index);
                    this.resetAutoPlay();
                });
            });

            // Touch swipe (solo mobile)
            carousel?.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            carousel?.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            }, { passive: true });

            this.startAutoPlay();
        },

        handleSwipe() {
            const diff = this.touchStartX - this.touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
                this.resetAutoPlay();
            }
        },

        goTo(index) {
            this.slides[this.currentSlide].classList.remove('active');
            this.thumbs[this.currentSlide].classList.remove('active');
            this.dots[this.currentSlide].classList.remove('active');

            this.currentSlide = index;
            if (this.currentSlide >= this.slides.length) this.currentSlide = 0;
            if (this.currentSlide < 0) this.currentSlide = this.slides.length - 1;

            this.slides[this.currentSlide].classList.add('active');
            this.thumbs[this.currentSlide].classList.add('active');
            this.dots[this.currentSlide].classList.add('active');
        },

        next() {
            this.goTo(this.currentSlide + 1);
        },

        prev() {
            this.goTo(this.currentSlide - 1);
        },

        startAutoPlay() {
            this.autoPlayInterval = setInterval(() => this.next(), 6000);
        },

        resetAutoPlay() {
            clearInterval(this.autoPlayInterval);
            this.startAutoPlay();
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        sedeCarousel.init();
    });
    </script>
</body>
</html>
