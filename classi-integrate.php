<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Classi Multidisciplinari Integrate InBallet - Percorsi di danza inclusivi per accogliere ogni bambino con professionalità e attenzione personalizzata.">
    <meta name="keywords" content="danza inclusiva, classi integrate, danza bambini speciali, inclusione danza, Lainate, corsi danza inclusivi">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Classi Multidisciplinari Integrate - InBallet">
    <meta property="og:description" content="Percorsi di danza inclusivi dove ogni bambino trova il suo spazio per crescere ed esprimersi.">

    <title>Classi Multidisciplinari Integrate - InBallet</title>

    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Francois+One&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
    <style>body{min-height:100vh}.main-header{min-height:80px}</style>
    <link rel="stylesheet" href="style.css">
    <style>
        /* === SEZIONI SPECIFICHE CLASSI INTEGRATE === */

        /* Intro Section */
        .integrate-intro-section{padding:5rem 0;background:#fff}
        .integrate-intro-wrapper{max-width:900px;margin:0 auto;padding:0 2rem}
        .integrate-intro-label{display:block;font-size:var(--text-sm);color:var(--primary-blue-dark);font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:1rem;text-align:center}
        .integrate-intro-title{font-size:var(--text-4xl);font-weight:700;color:var(--dark-navy);line-height:var(--leading-tight);margin-bottom:2rem;text-align:center}
        .integrate-intro-text{font-size:var(--text-lg);line-height:1.8;color:var(--text-light);margin-bottom:1.5rem;text-align:center}
        .integrate-intro-text strong{color:var(--dark-navy);font-weight:600}
        .integrate-intro-highlight{background:rgba(135,206,235,.1);border-left:4px solid var(--primary-blue);padding:1.5rem 2rem;border-radius:0 12px 12px 0;margin-top:2.5rem;max-width:750px;margin-left:auto;margin-right:auto}
        .integrate-intro-highlight p{font-size:var(--text-base);color:var(--dark-navy);font-weight:500;margin:0;line-height:1.7}

        /* Valori Section - CARD (unica sezione card) */
        .integrate-valori-section{padding:5rem 0;background:rgba(176,224,230,.1)}
        .integrate-valori-wrapper{max-width:1100px;margin:0 auto;padding:0 2rem}
        .integrate-valori-header{text-align:center;margin-bottom:4rem}
        .integrate-valori-label{display:block;font-size:var(--text-sm);color:var(--primary-blue-dark);font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:1rem}
        .integrate-valori-title{font-size:var(--text-4xl);font-weight:700;color:var(--dark-navy);line-height:var(--leading-tight);margin-bottom:1rem}
        .integrate-valori-subtitle{font-size:var(--text-base);color:var(--text-light);max-width:600px;margin:0 auto}
        .integrate-valori-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2.5rem}
        .integrate-valore-card{background:#fff;padding:2.5rem 2rem;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.05);border:1px solid rgba(135,206,235,.15);transition:all .3s ease;text-align:center}
        .integrate-valore-card:hover{transform:translateY(-8px);box-shadow:0 12px 35px rgba(135,206,235,.2);border-color:var(--primary-blue)}
        .integrate-valore-icon{width:80px;height:80px;background:linear-gradient(135deg,var(--primary-blue) 0%,var(--primary-blue-light) 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;color:var(--dark-navy);font-size:2rem}
        .integrate-valore-name{font-size:var(--text-xl);font-weight:700;color:var(--dark-navy);margin-bottom:1rem;text-transform:uppercase;letter-spacing:.5px}
        .integrate-valore-desc{font-size:var(--text-sm);color:var(--text-light);line-height:1.7}

        /* Classi Section */
        .integrate-classi-section{padding:5rem 0;background:var(--dark-navy);position:relative;overflow:hidden}
        .integrate-classi-section::before{content:'';position:absolute;top:-30%;right:-10%;width:500px;height:500px;background:radial-gradient(circle,rgba(135,206,235,.06) 0,transparent 70%);border-radius:50%}
        .integrate-classi-wrapper{max-width:900px;margin:0 auto;padding:0 2rem;position:relative;z-index:2}
        .integrate-classi-header{text-align:center;margin-bottom:3rem}
        .integrate-classi-label{display:block;font-size:var(--text-sm);color:var(--primary-blue);font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:1rem}
        .integrate-classi-title{font-size:var(--text-4xl);font-weight:700;color:#fff;line-height:var(--leading-tight);margin-bottom:1rem}
        .integrate-classi-subtitle{font-size:var(--text-lg);color:rgba(255,255,255,.7);max-width:600px;margin:0 auto;line-height:1.7}
        .integrate-classi-list{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem 3rem;margin-top:2.5rem}
        .integrate-classe-item{display:flex;align-items:center;gap:.8rem}
        .integrate-classe-item i{color:var(--primary-blue);font-size:1rem}
        .integrate-classe-item span{font-size:var(--text-base);color:#fff;font-weight:500}

        /* Responsive */
        @media(max-width:992px){
            .integrate-valori-grid{grid-template-columns:1fr;gap:2rem}
        }
        @media(max-width:600px){
            .integrate-classi-list{grid-template-columns:1fr}
        }
    </style>
</head>
<body>
    <a href="#main-content" class="skip-link">Salta al contenuto principale</a>
    <?php include 'components/header.php'; ?>

    <main id="main-content" role="main" tabindex="-1">

        <!-- Hero Section -->
        <section class="chisiamo-hero">
            <div class="chisiamo-hero-image" style="background-image: url('assets/images/gallery-5.jpg')"></div>
            <div class="chisiamo-hero-overlay"></div>
            <div class="chisiamo-hero-glass">
                <span class="chisiamo-hero-badge">Inclusione & Danza</span>
                <h1 class="chisiamo-hero-title">Classi Multidisciplinari Integrate</h1>
                <p class="chisiamo-hero-tagline">Percorsi dove ogni bambino trova il suo spazio per crescere, esprimersi e danzare.</p>
                <a href="#intro" class="chisiamo-scroll-arrow" aria-label="Scorri in basso">
                    <i class="fas fa-chevron-down"></i>
                </a>
            </div>
        </section>

        <!-- Intro Section -->
        <section id="intro" class="integrate-intro-section">
            <div class="integrate-intro-wrapper">
                <span class="integrate-intro-label">Il Nostro Approccio</span>
                <h2 class="integrate-intro-title">Un ambiente dove tutti sono benvenuti</h2>
                <p class="integrate-intro-text">
                    Quasi tutte le classi che proponiamo hanno la <strong>predisposizione tecnica e professionale</strong> per poter accogliere casi speciali, entro i livelli di competenza del nostro istituto.
                </p>
                <p class="integrate-intro-text">
                    Crediamo che la danza sia un <strong>linguaggio universale</strong> capace di abbattere barriere e creare connessioni. Per questo abbiamo sviluppato un approccio inclusivo che valorizza le unicità di ogni allievo.
                </p>
                <div class="integrate-intro-highlight">
                    <p>Il nostro team di insegnanti è formato per accogliere e supportare bambini con bisogni speciali, creando un ambiente sicuro dove ognuno può esprimersi liberamente attraverso il movimento.</p>
                </div>
            </div>
        </section>

        <!-- Valori Section - CARD -->
        <section class="integrate-valori-section">
            <div class="integrate-valori-wrapper">
                <div class="integrate-valori-header">
                    <span class="integrate-valori-label">I Nostri Valori</span>
                    <h2 class="integrate-valori-title">I principi che ci guidano</h2>
                </div>
                <div class="integrate-valori-grid">
                    <div class="integrate-valore-card">
                        <div class="integrate-valore-icon">
                            <i class="fas fa-hand-holding-heart"></i>
                        </div>
                        <h3 class="integrate-valore-name">Accoglienza</h3>
                        <p class="integrate-valore-desc">Ogni bambino viene accolto per quello che è, con le sue unicità e il suo potenziale da esprimere attraverso il movimento.</p>
                    </div>
                    <div class="integrate-valore-card">
                        <div class="integrate-valore-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <h3 class="integrate-valore-name">Integrazione</h3>
                        <p class="integrate-valore-desc">Lavoriamo per creare gruppi classe dove le differenze diventano ricchezza e occasione di crescita per tutti.</p>
                    </div>
                    <div class="integrate-valore-card">
                        <div class="integrate-valore-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h3 class="integrate-valore-name">Professionalità</h3>
                        <p class="integrate-valore-desc">Insegnanti formati e competenti, capaci di adattare le metodologie alle esigenze specifiche di ogni allievo.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Classi Section -->
        <section class="integrate-classi-section">
            <div class="integrate-classi-wrapper">
                <div class="integrate-classi-header">
                    <span class="integrate-classi-label">Le Nostre Discipline</span>
                    <h2 class="integrate-classi-title">Classi disponibili per l'inserimento</h2>
                    <p class="integrate-classi-subtitle">Molte delle nostre discipline sono predisposte per accogliere allievi con bisogni speciali.</p>
                </div>
                <div class="integrate-classi-list">
                    <div class="integrate-classe-item">
                        <i class="fas fa-check"></i>
                        <span>Danza Classica</span>
                    </div>
                    <div class="integrate-classe-item">
                        <i class="fas fa-check"></i>
                        <span>Danza Moderna</span>
                    </div>
                    <div class="integrate-classe-item">
                        <i class="fas fa-check"></i>
                        <span>Danza Contemporanea</span>
                    </div>
                    <div class="integrate-classe-item">
                        <i class="fas fa-check"></i>
                        <span>Movimento Creativo</span>
                    </div>
                    <div class="integrate-classe-item">
                        <i class="fas fa-check"></i>
                        <span>Hip Hop</span>
                    </div>
                    <div class="integrate-classe-item">
                        <i class="fas fa-check"></i>
                        <span>Propedeutica alla Danza</span>
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
                    <h2>Parliamo del tuo bambino</h2>
                    <p>Contattaci per un colloquio conoscitivo. Insieme troveremo il percorso più adatto.</p>
                    <a href="mailto:info@inballet.it?subject=Classi%20Integrate%20-%20Richiesta%20Informazioni" class="corso-btn-cta">
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
