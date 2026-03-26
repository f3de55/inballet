<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Corso di Contact Improvisation. Esplora il movimento attraverso il contatto e il dialogo corporeo. InBallet Lainate e Rho.">
    <meta name="keywords" content="contact improvisation, danza contatto, improvvisazione danza, InBallet, Lainate, Rho">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Contact Improvisation - InBallet">
    <meta property="og:description" content="Corso di Contact Improvisation. Il dialogo corporeo attraverso il contatto.">

    <title>Contact Improvisation - InBallet</title>

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
        badge: 'Adulti',
        titolo: 'Contact Improvisation',
        tagline: 'Il dialogo dei corpi attraverso il peso, lo spazio e l\'ascolto reciproco',
        heroImage: 'assets/images/gallery-7.jpg',
        introImage: 'assets/images/gallery-3.jpg',
        intro: `
            <p>Il <strong>Contact Improvisation</strong> è una forma di danza basata sul dialogo
            fisico tra due o più persone. Si esplora il movimento attraverso il contatto,
            il peso condiviso e l'ascolto reciproco.</p>
            <p>Una pratica che sviluppa <strong>fiducia</strong>, <strong>presenza</strong> e
            <strong>reattività</strong>, dove ogni momento è unico e irripetibile.
            Non servono passi predefiniti, solo la volontà di esplorare.</p>
        `,
        eta: 'Adulti',
        frequenza: '1 lezione a settimana',
        metodoTitolo: 'Il Nostro Approccio',
        metodo: [
            {
                titolo: 'Ascolto',
                testo: 'Sviluppo della capacità di percepire e rispondere ai segnali del partner attraverso il contatto fisico.'
            },
            {
                titolo: 'Fiducia',
                testo: 'Costruzione di un ambiente sicuro dove sperimentare il dare e ricevere peso, cadere e sostenere.'
            },
            {
                titolo: 'Spontaneità',
                testo: 'Esplorazione del movimento senza schemi predefiniti, seguendo gli impulsi che nascono dal contatto.'
            }
        ],
        imparaTitolo: 'Cosa imparerai',
        impara: [
            'Principi di peso e contro-peso',
            'Rotolamenti e cadute controllate',
            'Lift e sostegni reciproci',
            'Ascolto attraverso il tatto',
            'Improvvisazione a coppia e in gruppo',
            'Consapevolezza dei confini personali'
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
