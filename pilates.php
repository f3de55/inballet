<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Corso di Pilates per adulti. Tonificazione, postura e core stability. InBallet Lainate e Rho.">
    <meta name="keywords" content="pilates, corso pilates, core stability, postura, InBallet, Lainate, Rho">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Pilates - InBallet">
    <meta property="og:description" content="Corso di Pilates per tutti i livelli. Tonificazione e benessere.">

    <title>Pilates - InBallet</title>

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
        badge: 'Adulti - tutti i livelli',
        titolo: 'Pilates',
        tagline: 'Forza, controllo e consapevolezza: il metodo che trasforma il corpo',
        heroImage: 'assets/images/gallery-8.jpg',
        introImage: 'assets/images/gallery-9.jpg',
        intro: `
            <p>Il <strong>Pilates</strong> è un metodo di allenamento che sviluppa
            <strong>forza</strong>, <strong>flessibilità</strong> e <strong>controllo</strong>
            attraverso movimenti precisi e consapevoli.</p>
            <p>Ideale per migliorare la <strong>postura</strong>, rafforzare il
            <strong>core</strong> e prevenire dolori muscolari. I nostri corsi sono
            adatti a tutti i livelli, con esercizi adattabili alle esigenze individuali.</p>
        `,
        eta: 'Adulti di tutte le età',
        frequenza: '1-2 lezioni a settimana',
        metodoTitolo: 'Il Nostro Approccio',
        metodo: [
            {
                titolo: 'Core Stability',
                testo: 'Lavoro mirato sul centro del corpo (powerhouse) per sviluppare stabilità, forza e controllo in ogni movimento.'
            },
            {
                titolo: 'Precisione',
                testo: 'Ogni esercizio viene eseguito con attenzione alla qualità del movimento. Meglio poche ripetizioni perfette che tante approssimative.'
            },
            {
                titolo: 'Respirazione',
                testo: 'La respirazione è parte integrante di ogni esercizio, aiutando a mantenere il controllo e a ossigenare i muscoli.'
            }
        ],
        imparaTitolo: 'Cosa imparerai',
        impara: [
            'Esercizi per il core e la stabilità',
            'Tecniche di respirazione Pilates',
            'Allineamento posturale corretto',
            'Stretching e flessibilità',
            'Tonificazione muscolare profonda',
            'Prevenzione di dolori e tensioni'
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
