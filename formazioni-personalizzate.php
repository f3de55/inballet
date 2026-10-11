<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Percorsi formativi personalizzati per insegnanti, scuole e professionisti della danza. Workshop, aggiornamenti e consulenze su misura.">
    <meta name="keywords" content="formazione danza personalizzata, workshop danza, aggiornamento insegnanti, consulenza danza, Lainate Milano">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Formazioni Personalizzate - InBallet">
    <meta property="og:description" content="Percorsi formativi su misura per professionisti della danza e istituzioni.">

    <title>Formazioni Personalizzate - InBallet</title>

    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Francois+One&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
    <style>body{min-height:100vh}.main-header{min-height:80px}</style>
    <link rel="stylesheet" href="style.css">
    <style>
        /* Intro Section */
        .perso-intro-section{padding:5rem 0;background:#fff}
        .perso-intro-wrapper{max-width:800px;margin:0 auto;padding:0 2rem;text-align:center}
        .perso-intro-label{display:block;font-size:var(--text-sm);color:var(--primary-blue-dark);font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:1rem}
        .perso-intro-title{font-size:var(--text-4xl);font-weight:700;color:var(--dark-navy);line-height:var(--leading-tight);margin-bottom:2rem}
        .perso-intro-text{font-size:var(--text-lg);color:var(--text-light);line-height:1.8;margin-bottom:1.5rem}
        .perso-intro-text strong{color:var(--dark-navy);font-weight:600}

        /* Tipologie Section - stile corsi-section */
        .perso-tipo-section{padding:5rem 0;background:rgba(176,224,230,.25);position:relative;overflow:hidden}
        .perso-tipo-section::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--primary-blue)}
        .perso-tipo-section::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--primary-blue)}
        .perso-tipo-wrapper{max-width:1100px;margin:0 auto;padding:0 2rem}
        .perso-tipo-header{text-align:center;margin-bottom:3.5rem}
        .perso-tipo-label{display:block;font-size:var(--text-lg);color:var(--primary-blue-dark);font-weight:500;text-transform:uppercase;letter-spacing:1px;margin-bottom:1rem}
        .perso-tipo-title{font-size:var(--text-4xl);font-weight:700;color:var(--dark-navy);line-height:var(--leading-tight)}
        .perso-tipo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:2.5rem 4rem;position:relative}
        .perso-tipo-grid::before{content:'';position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(135,206,235,.3);transform:translateX(-50%)}
        .perso-tipo-item{display:grid;grid-template-columns:45px 1fr;gap:1rem;padding-bottom:2rem;border-bottom:1px solid rgba(135,206,235,.3)}
        .perso-tipo-item:nth-last-child(-n+2){border-bottom:none;padding-bottom:0}
        .perso-tipo-num{width:45px;height:45px;background:linear-gradient(135deg,var(--primary-blue) 0%,var(--primary-blue-light) 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--dark-navy);font-weight:700;font-size:var(--text-lg)}
        .perso-tipo-content h4{font-size:var(--text-lg);font-weight:700;color:var(--dark-navy);margin-bottom:.4rem}
        .perso-tipo-content p{font-size:var(--text-sm);color:var(--text-light);margin:0;line-height:1.6}
        @media(max-width:768px){.perso-tipo-grid{grid-template-columns:1fr;gap:2rem}.perso-tipo-grid::before{display:none}.perso-tipo-item:nth-last-child(2){border-bottom:1px solid rgba(135,206,235,.3);padding-bottom:2rem}}
    </style>
</head>
<body>
    <a href="#main-content" class="skip-link">Salta al contenuto principale</a>
    <?php include 'components/header.php'; ?>

    <main id="main-content" role="main" tabindex="-1">

        <!-- Hero Section -->
        <section class="chisiamo-hero">
            <div class="chisiamo-hero-image" style="background-image: url('assets/images/gallery-8.jpg')"></div>
            <div class="chisiamo-hero-overlay"></div>
            <div class="chisiamo-hero-glass">
                <span class="chisiamo-hero-badge">Formazione</span>
                <h1 class="chisiamo-hero-title">Formazioni Personalizzate</h1>
                <p class="chisiamo-hero-tagline">Percorsi su misura per insegnanti, scuole e professionisti.</p>
                <a href="#intro" class="chisiamo-scroll-arrow" aria-label="Scorri in basso">
                    <i class="fas fa-chevron-down"></i>
                </a>
            </div>
        </section>

        <!-- Intro Section -->
        <section id="intro" class="perso-intro-section">
            <div class="perso-intro-wrapper">
                <span class="perso-intro-label">Formazione su Misura</span>
                <h2 class="perso-intro-title">Progettiamo insieme il tuo percorso</h2>
                <p class="perso-intro-text">
                    Ogni professionista ha esigenze diverse. Offriamo <strong>percorsi formativi personalizzati</strong> per insegnanti che vogliono aggiornarsi, scuole che cercano consulenza didattica e istituti interessati a progetti di danza.
                </p>
                <p class="perso-intro-text">
                    Workshop, aggiornamenti metodologici, approfondimenti tecnici: costruiamo insieme il programma piu' adatto ai tuoi obiettivi.
                </p>
            </div>
        </section>

        <!-- Tipologie Section -->
        <section class="perso-tipo-section">
            <div class="perso-tipo-wrapper">
                <div class="perso-tipo-header">
                    <span class="perso-tipo-label">I Percorsi</span>
                    <h2 class="perso-tipo-title">Tipologie di formazione</h2>
                </div>
                <div class="perso-tipo-grid">
                    <div class="perso-tipo-item">
                        <div class="perso-tipo-num">1</div>
                        <div class="perso-tipo-content">
                            <h4>Aggiornamento Insegnanti</h4>
                            <p>Metodologie didattiche, gestione della classe, nuove tecniche</p>
                        </div>
                    </div>
                    <div class="perso-tipo-item">
                        <div class="perso-tipo-num">2</div>
                        <div class="perso-tipo-content">
                            <h4>Workshop Tematici</h4>
                            <p>Improvvisazione, composizione, danza-teatro, anatomia</p>
                        </div>
                    </div>
                    <div class="perso-tipo-item">
                        <div class="perso-tipo-num">3</div>
                        <div class="perso-tipo-content">
                            <h4>Consulenza per Scuole</h4>
                            <p>Programmi didattici, formazione staff, progetti educativi</p>
                        </div>
                    </div>
                    <div class="perso-tipo-item">
                        <div class="perso-tipo-num">4</div>
                        <div class="perso-tipo-content">
                            <h4>Progetti per Istituti</h4>
                            <p>Laboratori curriculari, percorsi extrascolastici, PON</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="corso-contatto-section">
            <div class="corso-contatto-bg" style="background: url('assets/images/bg-progetti-territorio.jpg') center/cover no-repeat"></div>
            <div class="corso-contatto-overlay"></div>
            <div class="corso-contatto-wrapper">
                <div class="corso-contatto-content">
                    <h2>Hai un progetto in mente?</h2>
                    <p>Contattaci per un colloquio gratuito. Definiremo insieme obiettivi e contenuti del tuo percorso formativo.</p>
                    <a href="mailto:info@inballet.it?subject=Formazione%20Personalizzata%20-%20Richiesta%20Info" class="corso-btn-cta">
                        Richiedi Informazioni <i class="fas fa-arrow-right"></i>
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
</body>
</html>
