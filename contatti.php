<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Contatta InBallet - Scuola di danza a Lainate e Rho. Telefono, email, sedi e orari di apertura.">
    <meta name="keywords" content="contatti InBallet, scuola danza Lainate, scuola danza Rho, telefono, email, dove siamo">
    <meta name="author" content="InBallet ASD">
    <meta name="theme-color" content="#87CEEB">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Contatti - InBallet">
    <meta property="og:description" content="Vieni a trovarci a Lainate o Rho. Contattaci per informazioni sui corsi.">

    <title>Contatti - InBallet</title>

    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Francois+One&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
    <style>body{min-height:100vh}.main-header{min-height:80px}</style>
    <link rel="stylesheet" href="style.css">
    <style>
        /* Sezione Come Contattarci */
        .come-contattarci-section {
            padding: 5rem 0;
            background: var(--white);
        }

        .come-contattarci-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--primary-blue);
        }

        .contatti-wrapper {
            max-width: 1200px;
            margin: 0 auto;
        }

        .contatti-header {
            margin-bottom: 3rem;
        }

        .contatti-label {
            font-size: var(--text-lg);
            color: var(--primary-blue-dark);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            display: block;
        }

        .contatti-title {
            font-size: var(--text-4xl);
            font-weight: 700;
            color: var(--dark-navy);
            line-height: var(--leading-tight);
            letter-spacing: -0.02em;
        }

        /* Grid orizzontale metodi */
        .metodi-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 3rem;
        }

        .metodo-item {
            padding: 0;
        }

        .metodo-numero {
            font-size: var(--text-sm);
            font-weight: 700;
            color: var(--primary-blue-dark);
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .metodo-item h3 {
            font-size: var(--text-2xl);
            font-weight: 700;
            color: var(--dark-navy);
            margin-bottom: 1rem;
            letter-spacing: -0.01em;
        }

        .metodo-value {
            font-size: var(--text-lg);
            margin-bottom: 0.5rem;
        }

        .metodo-value a {
            color: var(--primary-blue-dark);
            text-decoration: none;
            font-weight: 500;
        }

        .metodo-detail {
            font-size: var(--text-sm);
            color: var(--text-light);
            margin: 0;
            line-height: 1.6;
        }

        /* Sezione Sedi - Layout orizzontale */
        .sedi-section {
            padding: 5rem 0;
            background: rgba(176, 224, 230, 0.25);
            position: relative;
        }

        .sedi-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--primary-blue);
        }

        .sedi-wrapper {
            max-width: 1200px;
            margin: 0 auto;
        }

        .sedi-header {
            margin-bottom: 3rem;
        }

        .sedi-label {
            font-size: var(--text-lg);
            color: var(--primary-blue-dark);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            display: block;
        }

        .sedi-title {
            font-size: var(--text-4xl);
            font-weight: 700;
            color: var(--dark-navy);
            line-height: var(--leading-tight);
            letter-spacing: -0.02em;
        }

        /* Grid sedi orizzontale */
        .sedi-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4rem;
        }

        .sede-item {
            display: flex;
            flex-direction: column;
        }

        .sede-tag {
            display: inline-block;
            align-self: flex-start;
            padding: 0.3rem 0.9rem;
            background: var(--primary-blue);
            color: var(--dark-navy);
            font-size: var(--text-xs);
            font-weight: 700;
            border-radius: 16px;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .sede-item:last-child .sede-tag {
            background: rgba(135, 206, 235, 0.2);
            color: var(--primary-blue-dark);
        }

        .sede-nome {
            font-size: var(--text-3xl);
            font-weight: 700;
            color: var(--dark-navy);
            margin-bottom: 1.5rem;
            line-height: var(--leading-tight);
        }

        .sede-dettagli {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .sede-riga {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
        }

        .sede-riga-label {
            font-size: var(--text-xs);
            color: var(--text-light);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .sede-riga-value {
            font-size: var(--text-base);
            color: var(--dark-navy);
            font-weight: 500;
        }

        .sede-riga-value a {
            color: var(--dark-navy);
            text-decoration: none;
        }

        .sede-actions {
            display: flex;
            gap: 0.8rem;
        }

        .sede-btn {
            flex: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.8rem 1.5rem;
            background: var(--dark-navy);
            color: var(--white);
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            font-size: var(--text-xs);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .sede-btn.outline {
            background: transparent;
            border: 2px solid var(--dark-navy);
            color: var(--dark-navy);
        }

        /* Orari */
        .orari-section {
            padding: 5rem 0;
            background: var(--white);
            position: relative;
        }

        .orari-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--primary-blue);
        }

        .orari-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .orari-header {
            text-align: center;
            margin-bottom: 2.5rem;
        }

        .section-tagline {
            font-size: var(--text-lg);
            color: var(--primary-blue-dark);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
        }

        .section-title {
            font-size: var(--text-4xl);
            font-weight: 700;
            color: var(--dark-navy);
            line-height: var(--leading-tight);
            letter-spacing: -0.02em;
        }

        .orari-status {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.6rem 1.3rem;
            border-radius: 30px;
            font-size: var(--text-sm);
            font-weight: 600;
            margin-top: 0.8rem;
        }

        .orari-status.aperto {
            background: rgba(76, 175, 80, 0.15);
            color: #2e7d32;
        }

        .orari-status.chiuso {
            background: rgba(158, 158, 158, 0.15);
            color: #666;
        }

        .orari-status i {
            font-size: 0.7rem;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .orari-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1.2rem;
        }

        .orario-item {
            background: rgba(176, 224, 230, 0.08);
            padding: 1.3rem 1rem;
            border-radius: 8px;
            border: 1px solid rgba(135, 206, 235, 0.2);
        }

        .orario-item.oggi {
            background: rgba(135, 206, 235, 0.12);
            border: 2px solid var(--primary-blue);
        }

        .orario-day {
            font-size: var(--text-base);
            font-weight: 700;
            color: var(--dark-navy);
            margin-bottom: 0.5rem;
        }

        .orario-time {
            font-size: var(--text-sm);
            color: var(--text-light);
            font-weight: 500;
            line-height: 1.4;
        }

        .orario-time.chiuso {
            color: #999;
            font-style: italic;
        }

        /* Responsive */
        @media (max-width: 992px) {
            .metodi-grid {
                grid-template-columns: 1fr;
                gap: 2.5rem;
            }

            .metodo-item {
                padding-bottom: 2.5rem;
                border-bottom: 1px solid rgba(135, 206, 235, 0.2);
            }

            .metodo-item:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }

            .sedi-grid {
                grid-template-columns: 1fr;
                gap: 3rem;
            }

            .orari-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .sede-actions {
                flex-direction: column;
            }
        }

        @media (max-width: 600px) {
            .orari-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <a href="#main-content" class="skip-link">Salta al contenuto principale</a>
    <?php include 'components/header.php'; ?>

    <main id="main-content" role="main" tabindex="-1">

        <!-- Hero -->
        <section class="chisiamo-hero">
            <div class="chisiamo-hero-image" style="background-image: url('assets/images/gallery-6.jpg')"></div>
            <div class="chisiamo-hero-overlay"></div>
            <div class="chisiamo-hero-glass">
                <span class="chisiamo-hero-badge">Contatti</span>
                <h1 class="chisiamo-hero-title">Vieni a trovarci</h1>
                <p class="chisiamo-hero-tagline">Due sedi a Lainate e Rho. Siamo pronti ad accoglierti.</p>
                <a href="#contatti" class="chisiamo-scroll-arrow" aria-label="Scorri in basso">
                    <i class="fas fa-chevron-down"></i>
                </a>
            </div>
        </section>

        <!-- Come Contattarci -->
        <section id="contatti" class="come-contattarci-section">
            <div class="container">
                <div class="contatti-wrapper">
                    <div class="contatti-header">
                        <span class="contatti-label">Come Contattarci</span>
                        <h2 class="contatti-title">Parliamo</h2>
                    </div>

                    <div class="metodi-grid">
                        <div class="metodo-item">
                            <div class="metodo-numero">Telefono</div>
                            <h3><a href="tel:+393937802996">+39 393 780 2996</a></h3>
                            <p class="metodo-detail">Lun-Ven 15:00-21:00<br>Sab 10:30-19:00</p>
                        </div>

                        <div class="metodo-item">
                            <div class="metodo-numero">WhatsApp</div>
                            <h3><a href="https://wa.me/393937802996" target="_blank" rel="noopener">+39 393 780 2996</a></h3>
                            <p class="metodo-detail">Risposta rapida<br>Disponibile sempre</p>
                        </div>

                        <div class="metodo-item">
                            <div class="metodo-numero">Email</div>
                            <h3><a href="mailto:info@inballet.it">info@inballet.it</a></h3>
                            <p class="metodo-detail">Risposta entro 24 ore<br>Tutti i giorni</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Le Nostre Sedi -->
        <section class="sedi-section">
            <div class="container">
                <div class="sedi-wrapper">
                    <div class="sedi-header">
                        <span class="sedi-label">Dove Siamo</span>
                        <h2 class="sedi-title">Le Nostre Sedi</h2>
                    </div>

                    <div class="sedi-grid">
                        <!-- Sede Lainate -->
                        <div class="sede-item">
                            <span class="sede-tag">Sede Centrale</span>
                            <h3 class="sede-nome">Lainate</h3>

                            <div class="sede-dettagli">
                                <div class="sede-riga">
                                    <div class="sede-riga-label">Indirizzo</div>
                                    <div class="sede-riga-value">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Via+Puccini+14+Lainate+MI" target="_blank" rel="noopener">
                                            Via Puccini, 14 - 20045 Lainate (MI)
                                        </a>
                                    </div>
                                </div>

                                <div class="sede-riga">
                                    <div class="sede-riga-label">Contatti</div>
                                    <div class="sede-riga-value">
                                        <a href="tel:+393937802996">+39 393 780 2996</a> • <a href="mailto:info@inballet.it">info@inballet.it</a>
                                    </div>
                                </div>

                                <div class="sede-riga">
                                    <div class="sede-riga-label">Parcheggio</div>
                                    <div class="sede-riga-value">Disponibile in zona</div>
                                </div>
                            </div>

                            <div class="sede-actions">
                                <a href="https://www.google.com/maps/search/?api=1&query=Via+Puccini+14+Lainate+MI" target="_blank" rel="noopener" class="sede-btn">
                                    <i class="fas fa-directions"></i>
                                    Indicazioni
                                </a>
                                <a href="https://wa.me/393937802996" target="_blank" rel="noopener" class="sede-btn outline">
                                    <i class="fab fa-whatsapp"></i>
                                    WhatsApp
                                </a>
                            </div>
                        </div>

                        <!-- Sede Rho -->
                        <div class="sede-item">
                            <span class="sede-tag">Altra Sede</span>
                            <h3 class="sede-nome">Rho</h3>

                            <div class="sede-dettagli">
                                <div class="sede-riga">
                                    <div class="sede-riga-label">Indirizzo</div>
                                    <div class="sede-riga-value">
                                        <a href="https://www.google.com/maps/search/?api=1&query=Via+Tevere+19+Rho+MI" target="_blank" rel="noopener">
                                            Via Tevere, 19 - 20017 Rho (MI)
                                        </a>
                                    </div>
                                </div>

                                <div class="sede-riga">
                                    <div class="sede-riga-label">Contatti</div>
                                    <div class="sede-riga-value">
                                        <a href="tel:+393937802996">+39 393 780 2996</a> • <a href="mailto:info@inballet.it">info@inballet.it</a>
                                    </div>
                                </div>

                                <div class="sede-riga">
                                    <div class="sede-riga-label">Info</div>
                                    <div class="sede-riga-value">Contattaci per dettagli</div>
                                </div>
                            </div>

                            <div class="sede-actions">
                                <a href="https://www.google.com/maps/search/?api=1&query=Via+Tevere+19+Rho+MI" target="_blank" rel="noopener" class="sede-btn">
                                    <i class="fas fa-directions"></i>
                                    Indicazioni
                                </a>
                                <a href="tel:+393937802996" class="sede-btn outline">
                                    <i class="fas fa-phone"></i>
                                    Chiama
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Orari -->
        <section class="orari-section">
            <div class="orari-container">
                <div class="orari-header">
                    <p class="section-tagline">Orari Segreteria</p>
                    <h2 class="section-title">Quando Siamo Aperti</h2>
                    <div id="open-status" class="orari-status"></div>
                </div>

                <div class="orari-grid" id="orari-grid">
                    <div class="orario-item">
                        <div class="orario-day">Caricamento...</div>
                        <div class="orario-time">Recupero orari...</div>
                    </div>
                </div>
            </div>
        </section>

    </main>

    <footer class="footer" role="contentinfo">
        <?php include 'components/footer.php'; ?>
    </footer>

    <script src="js/main.js"></script>
    <script>window.dispatchEvent(new Event('componentsLoaded'));</script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB1T64uyO5Ke-MttLo9Amscl5ViUvYYvtI&libraries=places&loading=async"></script>
    <script>
        async function initOrari() {
            try {
                const { Place } = await google.maps.importLibrary("places");

                const request = {
                    textQuery: 'InBallet Via Puccini 14 Lainate',
                    fields: ['id', 'displayName', 'regularOpeningHours'],
                    locationBias: { lat: 45.5722, lng: 9.0425 }
                };

                const { places } = await Place.searchByText(request);

                if (places.length > 0) {
                    const place = places[0];
                    await place.fetchFields({ fields: ['regularOpeningHours'] });

                    const hours = place.regularOpeningHours;
                    if (hours && hours.weekdayDescriptions) {
                        const statusEl = document.getElementById('open-status');
                        const now = new Date();
                        const currentDay = now.getDay();
                        const currentTime = now.getHours() * 100 + now.getMinutes();

                        let isOpen = false;
                        if (hours.periods) {
                            isOpen = hours.periods.some(period => {
                                if (period.open && period.open.day === currentDay) {
                                    const openTime = period.open.hour * 100 + (period.open.minute || 0);
                                    const closeTime = period.close ? period.close.hour * 100 + (period.close.minute || 0) : 2359;
                                    return currentTime >= openTime && currentTime <= closeTime;
                                }
                                return false;
                            });
                        }

                        if (isOpen) {
                            statusEl.innerHTML = '<i class="fas fa-circle"></i> Aperto ora';
                            statusEl.className = 'orari-status aperto';
                        } else {
                            statusEl.innerHTML = '<i class="fas fa-circle"></i> Chiuso ora';
                            statusEl.className = 'orari-status chiuso';
                        }

                        const grid = document.getElementById('orari-grid');
                        grid.innerHTML = '';

                        const dayMap = {
                            'Monday': 'Lun',
                            'Tuesday': 'Mar',
                            'Wednesday': 'Mer',
                            'Thursday': 'Gio',
                            'Friday': 'Ven',
                            'Saturday': 'Sab',
                            'Sunday': 'Dom'
                        };
                        const dayOrder = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
                        const dayOrderFull = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

                        const orariItems = [];
                        hours.weekdayDescriptions.forEach(text => {
                            const parts = text.split(': ');
                            const dayEn = parts[0];
                            const time = parts[1] || 'Chiuso';
                            const dayIt = dayMap[dayEn] || dayEn;
                            orariItems.push({
                                day: dayIt,
                                time: time,
                                order: dayOrder.indexOf(dayIt)
                            });
                        });

                        orariItems.sort((a, b) => a.order - b.order);

                        const todayName = dayOrder[currentDay === 0 ? 6 : currentDay - 1];

                        orariItems.forEach(item => {
                            const card = document.createElement('div');
                            card.className = 'orario-item';
                            if (item.day === todayName) {
                                card.classList.add('oggi');
                            }

                            const isChiuso = item.time.toLowerCase().includes('closed') || item.time === 'Chiuso';
                            const timeClass = isChiuso ? 'orario-time chiuso' : 'orario-time';

                            card.innerHTML = `
                                <div class="orario-day">${item.day}</div>
                                <div class="${timeClass}">${item.time}</div>
                            `;
                            grid.appendChild(card);
                        });
                    }
                }
            } catch (error) {
                console.error('Errore nel caricamento degli orari:', error);
                const grid = document.getElementById('orari-grid');
                grid.innerHTML = '<div class="orario-item"><div class="orario-day">Errore</div><div class="orario-time">Contattaci</div></div>';
            }
        }

        window.addEventListener('load', initOrari);
    </script>
</body>
</html>
