<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Corso di Hip-Hop per ragazzi e adulti. Groove, stile e attitudine urbana. InBallet Lainate e Rho.">
    <meta name="keywords" content="hip hop, corso hip hop, danza urbana, street dance, InBallet, Lainate, Rho">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Hip-Hop - InBallet">
    <meta property="og:description" content="Corso di Hip-Hop per tutti i livelli. Groove, stile e attitudine.">

    <title>Hip-Hop - InBallet</title>

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
        badge: 'Ragazzi e adulti',
        titolo: 'Hip-Hop',
        tagline: 'Energia, groove e stile urbano in ogni passo',
        heroImage: 'assets/images/gallery-9.jpg',
        introImage: 'assets/images/gallery-1.jpg',
        intro: `
            <p>L'<strong>Hip-Hop</strong> è molto più di uno stile di danza: è una cultura,
            un'attitudine, un modo di esprimersi. I nostri corsi insegnano le basi tecniche
            insieme alla storia e ai valori di questo movimento.</p>
            <p>Dalle fondamenta del <strong>groove</strong> alle coreografie più complesse,
            ogni allievo sviluppa il proprio stile personale, imparando a muoversi con
            <strong>ritmo</strong>, <strong>energia</strong> e <strong>sicurezza</strong>.</p>
        `,
        eta: 'Ragazzi e adulti',
        frequenza: '1-2 lezioni a settimana',
        metodoTitolo: 'Il Nostro Approccio',
        metodo: [
            {
                titolo: 'Foundation',
                testo: 'Studio delle basi fondamentali: groove, bounce, ritmo. Senza foundation solide non esiste stile autentico.'
            },
            {
                titolo: 'Stili',
                testo: 'Esplorazione dei diversi stili hip-hop: new style, old school, popping, locking. Ogni stile ha la sua storia e il suo linguaggio.'
            },
            {
                titolo: 'Freestyle',
                testo: 'Sviluppo della capacità di improvvisare e creare il proprio movimento, esprimendo la propria personalità.'
            }
        ],
        imparaTitolo: 'Cosa imparerai',
        impara: [
            'Groove e bounce fondamentali',
            'Isolazioni e controllo del corpo',
            'Coreografie su diversi stili musicali',
            'Elementi di popping e locking',
            'Freestyle e improvvisazione',
            'Storia e cultura hip-hop'
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
