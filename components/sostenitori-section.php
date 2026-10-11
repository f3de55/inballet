<!-- Sezione Sostenitori -->
<section class="sostenitori-section">
    <div class="sostenitori-container">
        <h2 class="sostenitori-title">I Nostri Sostenitori</h2>

        <div class="sostenitori-slider-wrapper">
            <div class="sostenitori-track">
                <!-- Set 1 -->
                <div class="sponsor-slide"><img src="assets/images/sponsors/panta-rei.png" alt="Panta Rei"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/clifford-chance.png" alt="Clifford Chance"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/banca-generali.png" alt="Banca Generali Private"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/terna.png" alt="Terna Rete Italia"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/mastrorlando.png" alt="Mastrorlando"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/santoro.png" alt="Santoro"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/tacchini.png" alt="Tacchini Denis"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/bottega-sport.png" alt="La Bottega dello Sport"></div>

                <!-- Set 2 - Duplicato per scroll infinito -->
                <div class="sponsor-slide"><img src="assets/images/sponsors/panta-rei.png" alt="Panta Rei"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/clifford-chance.png" alt="Clifford Chance"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/banca-generali.png" alt="Banca Generali Private"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/terna.png" alt="Terna Rete Italia"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/mastrorlando.png" alt="Mastrorlando"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/santoro.png" alt="Santoro"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/tacchini.png" alt="Tacchini Denis"></div>
                <div class="sponsor-slide"><img src="assets/images/sponsors/bottega-sport.png" alt="La Bottega dello Sport"></div>
            </div>
        </div>
    </div>
</section>

<style>
/* === SOSTENITORI SLIDER === */
.sostenitori-section {
    padding: 3rem 0;
    background: var(--white);
    position: relative;
    overflow: hidden;
}

.sostenitori-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
}

.sostenitori-title {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--dark-navy);
    text-align: center;
    margin-bottom: 2.5rem;
    letter-spacing: -0.02em;
}

.sostenitori-slider-wrapper {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    overflow: hidden;
    position: relative;
    padding: 2rem 0;
}

.sostenitori-slider-wrapper::before,
.sostenitori-slider-wrapper::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100px;
    z-index: 2;
    pointer-events: none;
}

.sostenitori-slider-wrapper::before {
    left: 0;
    background: linear-gradient(90deg, var(--white) 0%, transparent 100%);
}

.sostenitori-slider-wrapper::after {
    right: 0;
    background: linear-gradient(270deg, var(--white) 0%, transparent 100%);
}

.sostenitori-track {
    display: flex;
    gap: 3rem;
    width: fit-content;
    animation: scroll-sponsors 40s linear infinite;
    will-change: transform;
}

.sostenitori-track:hover {
    animation-play-state: paused;
}

.sponsor-slide {
    flex-shrink: 0;
    width: 220px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(248, 250, 252, 0.6);
    border: 1px solid rgba(135, 206, 235, 0.12);
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
}

.sponsor-slide:hover {
    background: var(--white);
    border-color: rgba(135, 206, 235, 0.25);
    box-shadow: 0 4px 16px rgba(135, 206, 235, 0.1);
    transform: translateY(-3px);
}

.sponsor-slide img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    filter: grayscale(30%) opacity(0.85);
    transition: filter 0.3s ease;
}

.sponsor-slide:hover img {
    filter: grayscale(0%) opacity(1);
}

@keyframes scroll-sponsors {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(calc(-220px * 8 - 3rem * 8));
    }
}

/* Responsive */
@media (max-width: 768px) {
    .sostenitori-section {
        padding: 2.5rem 0;
    }

    .sostenitori-title {
        font-size: var(--text-2xl);
        margin-bottom: 2rem;
    }

    .sostenitori-slider-wrapper {
        padding: 1.5rem 0;
    }

    .sostenitori-slider-wrapper::before,
    .sostenitori-slider-wrapper::after {
        width: 50px;
    }

    .sostenitori-track {
        gap: 2rem;
    }

    .sponsor-slide {
        width: 180px;
        height: 85px;
        padding: 1rem;
    }

    @keyframes scroll-sponsors {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(calc(-180px * 8 - 2rem * 8));
        }
    }
}

@media (max-width: 480px) {
    .sostenitori-title {
        font-size: var(--text-xl);
    }

    .sponsor-slide {
        width: 160px;
        height: 75px;
    }

    @keyframes scroll-sponsors {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(calc(-160px * 8 - 2rem * 8));
        }
    }
}
</style>
