<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Classi di gruppo per il benessere. Yoga, Pilates e discipline per corpo e mente. InBallet Lainate e Rho.">
    <meta name="keywords" content="classi gruppo, fitness gruppo, yoga gruppo, pilates gruppo, InBallet, Lainate, Rho">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Classi di Gruppo - InBallet">
    <meta property="og:description" content="Classi di gruppo per il benessere fisico e mentale.">

    <title>Classi di Gruppo - InBallet</title>

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
        titolo: 'Classi di Gruppo',
        tagline: 'Il benessere condiviso: energia, motivazione e divertimento insieme',
        heroImage: 'assets/images/gallery-6.jpg',
        introImage: 'assets/images/gallery-7.jpg',
        intro: `
            <p>Le nostre <strong>classi di gruppo</strong> sono pensate per chi vuole
            prendersi cura del proprio corpo in compagnia. L'energia del gruppo
            <strong>motiva</strong>, <strong>sostiene</strong> e rende ogni lezione più coinvolgente.</p>
            <p>Offriamo diverse tipologie di classi: dal <strong>Pilates</strong> allo
            <strong>Yoga</strong>, dal <strong>stretching</strong> al <strong>conditioning</strong>.
            Ogni classe è guidata da insegnanti qualificati in un ambiente accogliente.</p>
        `,
        eta: 'Adulti di tutte le età',
        frequenza: '1-3 lezioni a settimana',
        metodoTitolo: 'Il Nostro Approccio',
        metodo: [
            {
                titolo: 'Varietà',
                testo: 'Diverse tipologie di classi per soddisfare esigenze diverse: tonificazione, flessibilità, rilassamento, cardio.'
            },
            {
                titolo: 'Comunità',
                testo: 'Un ambiente dove nascono amicizie e dove l\'energia del gruppo diventa motore di motivazione e costanza.'
            },
            {
                titolo: 'Flessibilità',
                testo: 'Orari diversi e possibilità di scegliere le classi più adatte ai propri obiettivi e al proprio stile di vita.'
            }
        ],
        imparaTitolo: 'Cosa troverai',
        impara: [
            'Classi di Pilates matwork',
            'Sessioni di Yoga per tutti i livelli',
            'Stretching e mobilità articolare',
            'Conditioning e tonificazione',
            'Classi di rilassamento e respirazione',
            'Programmi combinati personalizzabili'
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
