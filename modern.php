<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Corso di Danza Modern per ragazzi e adulti. Espressività, tecnica e libertà di movimento. InBallet Lainate e Rho.">
    <meta name="keywords" content="danza modern, corso modern jazz, danza moderna, InBallet, Lainate, Rho">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Danza Modern - InBallet">
    <meta property="og:description" content="Corso di danza modern per tutti i livelli. Espressivita e tecnica.">

    <title>Danza Modern - InBallet</title>

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
        badge: 'Tutti i livelli',
        titolo: 'Danza Modern',
        tagline: 'Libertà espressiva e tecnica si fondono in un linguaggio unico',
        heroImage: 'assets/images/gallery-2.jpg',
        introImage: 'assets/images/gallery-8.jpg',
        intro: `
            <p>La <strong>danza modern</strong> nasce dalla fusione tra tecnica classica e
            libertà espressiva. Un linguaggio che permette di esplorare il movimento in modo
            personale, senza rinunciare al rigore tecnico.</p>
            <p>I nostri corsi sviluppano <strong>fluidità</strong>, <strong>dinamismo</strong> e
            <strong>consapevolezza corporea</strong>, preparando gli allievi a esprimersi
            attraverso coreografie che uniscono emozione e tecnica.</p>
        `,
        eta: 'Ragazzi e adulti',
        frequenza: '2-3 lezioni a settimana',
        metodoTitolo: 'Il Nostro Approccio',
        metodo: [
            {
                titolo: 'Tecnica Modern',
                testo: 'Studio delle tecniche fondamentali della danza moderna, dal floor work ai salti, con attenzione alla qualità del movimento.'
            },
            {
                titolo: 'Espressività',
                testo: 'Lavoro sull\'interpretazione e sulla capacità di trasmettere emozioni attraverso il corpo. Ogni movimento racconta una storia.'
            },
            {
                titolo: 'Coreografia',
                testo: 'Apprendimento di sequenze coreografiche che sfidano e sviluppano le capacità tecniche ed espressive di ogni allievo.'
            }
        ],
        imparaTitolo: 'Cosa imparerai',
        impara: [
            'Tecniche di floor work e lavoro a terra',
            'Dinamiche di movimento (sostenuto, staccato, fluido)',
            'Utilizzo del peso e della gravità',
            'Isolazioni e coordinazione avanzata',
            'Interpretazione musicale e coreografica',
            'Improvvisazione guidata'
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
