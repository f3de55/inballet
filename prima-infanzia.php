<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Corsi di danza per la Prima Infanzia (3-5 anni). Gioco, musica e movimento per i più piccoli. InBallet Lainate e Rho.">
    <meta name="keywords" content="danza bambini 3 anni, danza prima infanzia, corso danza piccoli, InBallet, Lainate, Rho">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Prima Infanzia - InBallet">
    <meta property="og:description" content="Percorsi di danza per bambini dai 3 ai 5 anni.">

    <title>Prima Infanzia - InBallet</title>

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
        badge: '3-5 anni',
        titolo: 'Prima Infanzia',
        tagline: 'I primi passi nel mondo della danza, attraverso il gioco e la fantasia',
        heroImage: 'assets/images/gallery-3.jpg',
        introImage: 'assets/images/gallery-5.jpg',
        intro: `
            <p>I percorsi per la <strong>prima infanzia</strong> sono pensati per accompagnare
            i bambini dai 3 ai 5 anni nella scoperta del movimento. Un approccio giocoso
            che rispetta i tempi e le esigenze di ogni piccolo allievo.</p>
            <p>Attraverso <strong>giochi</strong>, <strong>musica</strong> e <strong>storie</strong>,
            i bambini sviluppano coordinazione, ritmo e socialità, preparandosi naturalmente
            ai percorsi di danza più strutturati.</p>
        `,
        eta: 'Bambini 3-5 anni',
        frequenza: '1 lezione a settimana',
        metodoTitolo: 'I Nostri Corsi',
        metodo: [
            {
                titolo: 'Avviamento alla Danza',
                testo: 'Il primissimo approccio al movimento per i bambini di 3 anni. Giochi, ritmo e scoperta del proprio corpo nello spazio.'
            },
            {
                titolo: 'Movimento Creativo',
                testo: 'Espressione libera attraverso la fantasia. I bambini esplorano il movimento guidati da storie e immagini.'
            },
            {
                titolo: 'Educazione alla Danza',
                testo: 'Per i bambini di 4-5 anni pronti a un primo approccio più strutturato, sempre nel rispetto del gioco.'
            }
        ],
        imparaTitolo: 'Cosa impareranno',
        impara: [
            'Riconoscere e seguire il ritmo',
            'Muoversi nello spazio con consapevolezza',
            'Coordinare i movimenti del corpo',
            'Esprimersi attraverso il movimento',
            'Collaborare e giocare con gli altri',
            'Sviluppare ascolto e concentrazione'
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
