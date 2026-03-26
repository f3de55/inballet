<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Corso Educazione alla Danza per bambini dai 6 anni. Sviluppo della tecnica base e della musicalità. InBallet Lainate e Rho.">
    <meta name="keywords" content="educazione danza, corso danza bambini, propedeutica danza, InBallet, Lainate, Rho">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Educazione alla Danza - InBallet">
    <meta property="og:description" content="Corso per bambini dai 6 anni. Sviluppo della tecnica base e della musicalità.">

    <title>Educazione alla Danza - InBallet</title>

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

    <main id="main-content" role="main" tabindex="-1"></main>

    <footer class="footer" role="contentinfo"><?php include 'components/footer.php'; ?></footer>

    <script src="js/main.js"></script>
    <script>window.dispatchEvent(new Event('componentsLoaded'));</script>

    <script>
    // Dati del corso
    const corsoData = {
        badge: 'Dai 6 anni',
        titolo: 'Educazione alla Danza',
        tagline: 'Il percorso che trasforma il gioco in tecnica, con dolcezza e professionalità',
        heroImage: 'assets/images/gallery-4.jpg',
        introImage: 'assets/images/gallery-6.jpg',
        intro: `
            <p>Un corso pensato per i bambini che hanno già sperimentato l'avviamento e sono pronti
            a fare un passo avanti. L'<strong>educazione alla danza</strong> introduce i primi elementi
            tecnici in modo graduale, sempre nel rispetto dei tempi di crescita di ogni allievo.</p>
            <p>Si lavora sulla <strong>postura</strong>, sulla <strong>coordinazione</strong> e sulla
            <strong>musicalità</strong>, preparando il corpo e la mente alla danza vera e propria.
            Un percorso che unisce disciplina e divertimento.</p>
        `,
        eta: 'Bambini dai 6 anni',
        frequenza: '1-2 lezioni a settimana',
        metodoTitolo: 'Il Nostro Approccio',
        metodo: [
            {
                titolo: 'Tecnica Graduale',
                testo: 'Introduzione progressiva agli elementi base della danza classica e moderna, rispettando i tempi di apprendimento di ogni bambino.'
            },
            {
                titolo: 'Postura e Consapevolezza',
                testo: 'Lavoro mirato sulla postura corretta e sulla consapevolezza del proprio corpo nello spazio, fondamenti per qualsiasi disciplina.'
            },
            {
                titolo: 'Musicalità',
                testo: 'Sviluppo dell\'orecchio musicale e della capacità di interpretare ritmi e melodie attraverso il movimento.'
            }
        ],
        imparaTitolo: 'Cosa impareranno',
        impara: [
            'Le basi della postura corretta',
            'Coordinazione braccia-gambe',
            'Riconoscere tempi e ritmi musicali',
            'Eseguire semplici sequenze coreografiche',
            'Lavorare in gruppo con rispetto e collaborazione',
            'Sviluppare concentrazione e disciplina'
        ]
    };

    // Carica template e popola dati
    async function loadCorsoTemplate() {
        try {
            const response = await fetch('components/template-corsi.html');
            const template = await response.text();
            document.querySelector('main').innerHTML = template;

            // Hero
            document.getElementById('corsoHeroImage').style.backgroundImage = `url('${corsoData.heroImage}')`;
            document.getElementById('corsoBadge').textContent = corsoData.badge;
            document.getElementById('corsoTitolo').textContent = corsoData.titolo;
            document.getElementById('corsoTagline').textContent = corsoData.tagline;

            // Intro section
            document.getElementById('corsoIntroText').innerHTML = corsoData.intro;
            document.getElementById('corsoIntroImg').src = corsoData.introImage;
            document.getElementById('corsoIntroImg').alt = corsoData.titolo;
            document.getElementById('corsoEta').textContent = corsoData.eta;
            document.getElementById('corsoFrequenza').textContent = corsoData.frequenza;

            // Metodo section
            document.getElementById('corsoMetodoTitolo').textContent = corsoData.metodoTitolo;
            document.getElementById('corsoMetodoContent').innerHTML = corsoData.metodo.map(item => `
                <div class="corso-metodo-item">
                    <h3>${item.titolo}</h3>
                    <p>${item.testo}</p>
                </div>
            `).join('');

            // Impara section
            document.getElementById('corsoImparaTitolo').textContent = corsoData.imparaTitolo;
            document.getElementById('corsoImparaGrid').innerHTML = corsoData.impara.map(item => `
                <li>${item}</li>
            `).join('');

        } catch (error) {
            console.error('Errore caricamento template:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', loadCorsoTemplate);
    </script>
</body>
</html>
