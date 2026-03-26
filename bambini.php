<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Corsi di danza per Bambini (9-11 anni). Tecnica, espressività e crescita. InBallet Lainate e Rho.">
    <meta name="keywords" content="danza bambini 9 anni, corso danza bambini, danza classica bambini, InBallet, Lainate, Rho">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Bambini - InBallet">
    <meta property="og:description" content="Percorsi di danza per bambini dai 9 agli 11 anni.">

    <title>Bambini - InBallet</title>

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
        badge: '9-11 anni',
        titolo: 'Bambini',
        tagline: 'L\'età della crescita: tecnica, espressività e passione',
        heroImage: 'assets/images/gallery-5.jpg',
        introImage: 'assets/images/gallery-7.jpg',
        intro: `
            <p>I percorsi per <strong>bambini</strong> dai 9 agli 11 anni rappresentano
            una fase cruciale nella formazione del danzatore. È il momento di consolidare
            la <strong>tecnica</strong> e sviluppare l'<strong>espressività</strong>.</p>
            <p>Gli allievi possono scegliere tra diverse discipline e iniziare a scoprire
            quale stile li rappresenta di più, sempre guidati da insegnanti attenti
            alla crescita individuale di ciascuno.</p>
        `,
        eta: 'Bambini 9-11 anni',
        frequenza: '2-3 lezioni a settimana',
        metodoTitolo: 'I Nostri Corsi',
        metodo: [
            {
                titolo: 'Danza Classica',
                testo: 'Studio della tecnica accademica: sbarra, centro, primi salti e giri. Le basi per qualsiasi percorso futuro.'
            },
            {
                titolo: 'Modern e Contemporanea',
                testo: 'Esplorazione di linguaggi più liberi: floor work, dinamiche, espressività. Per chi cerca movimento e creatività.'
            },
            {
                titolo: 'Hip-Hop e Breaking',
                testo: 'Energia e stile urbano: groove, coreografie, primi elementi acrobatici. Per chi ama i ritmi contemporanei.'
            }
        ],
        imparaTitolo: 'Cosa impareranno',
        impara: [
            'Tecnica specifica della disciplina scelta',
            'Coreografie di media complessità',
            'Espressività e interpretazione',
            'Forza, flessibilità e resistenza',
            'Preparazione per saggi e spettacoli',
            'Autonomia e responsabilità'
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
