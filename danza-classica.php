<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Corso di Danza Classica per ragazzi e adulti. Tecnica accademica, grazia e disciplina. InBallet Lainate e Rho.">
    <meta name="keywords" content="danza classica, corso balletto, tecnica classica, InBallet, Lainate, Rho">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Danza Classica - InBallet">
    <meta property="og:description" content="Corso di tecnica classica accademica per tutti i livelli.">

    <title>Danza Classica - InBallet</title>

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
        titolo: 'Danza Classica',
        tagline: 'La disciplina che forma il corpo e lo spirito, dalla sbarra al centro',
        heroImage: 'assets/images/gallery-1.jpg',
        introImage: 'assets/images/gallery-7.jpg',
        intro: `
            <p>La <strong>danza classica</strong> è la base di tutte le discipline coreutiche.
            Un percorso rigoroso che sviluppa <strong>grazia</strong>, <strong>forza</strong> e
            <strong>controllo del corpo</strong> attraverso la tecnica accademica.</p>
            <p>I nostri corsi seguono i programmi delle principali scuole internazionali,
            adattandoli alle esigenze di ogni allievo. Dalla <strong>sbarra</strong> al
            <strong>centro</strong>, ogni lezione è un passo verso la perfezione tecnica.</p>
        `,
        eta: 'Ragazzi e adulti',
        frequenza: '2-3 lezioni a settimana',
        metodoTitolo: 'Il Nostro Metodo',
        metodo: [
            {
                titolo: 'Tecnica Accademica',
                testo: 'Studio approfondito delle posizioni, dei passi e delle combinazioni secondo il metodo classico, con attenzione alla pulizia del movimento.'
            },
            {
                titolo: 'Lavoro alla Sbarra',
                testo: 'Esercizi fondamentali per sviluppare forza, equilibrio e allineamento. La sbarra è il punto di partenza di ogni lezione.'
            },
            {
                titolo: 'Centro e Punte',
                testo: 'Progressione verso il lavoro al centro e, per chi è pronto, l\'introduzione alle punte con la dovuta preparazione.'
            }
        ],
        imparaTitolo: 'Cosa imparerai',
        impara: [
            'Le cinque posizioni fondamentali',
            'Tecnica alla sbarra e al centro',
            'Port de bras e utilizzo delle braccia',
            'Salti, giri e combinazioni',
            'Espressività e musicalità',
            'Preparazione alle punte (livelli avanzati)'
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
