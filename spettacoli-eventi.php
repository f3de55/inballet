<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Spettacoli ed eventi InBallet - Calendario completo di workshop, saggi, spettacoli e corsi aperti della scuola di danza a Lainate e Rho.">
    <title>Spettacoli ed Eventi - InBallet</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Francois+One&family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>body{min-height:100vh}.main-header{min-height:80px}</style>
    <link rel="stylesheet" href="style.css">
    <style>
        .eventi-section{padding:5rem 0;background:#fff}
        .eventi-wrapper{max-width:1200px;margin:0 auto;padding:0 2rem}

        /* Tabs */
        .vista-tabs{display:flex;justify-content:center;gap:.5rem;margin-bottom:2rem}
        .vista-tab{padding:.8rem 1.5rem;background:#f0f4f8;border:none;border-radius:25px;cursor:pointer;font-weight:600;font-size:var(--text-sm);color:var(--text-light);transition:all .3s}
        .vista-tab.active{background:var(--primary-blue);color:var(--dark-navy)}
        .vista-tab:hover:not(.active){background:#e2e8f0}

        /* Navigazione */
        .calendario-nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;padding:1rem 1.5rem;background:#f8fafc;border-radius:16px}
        .mese-corrente{font-size:var(--text-2xl);font-weight:700;color:var(--dark-navy)}
        .nav-mese{display:flex;gap:.5rem}
        .nav-mese button{width:44px;height:44px;border:1px solid rgba(135,206,235,.3);background:#fff;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;color:var(--text-dark);font-size:1rem}
        .nav-mese button:hover:not(:disabled){background:var(--primary-blue);border-color:var(--primary-blue)}
        .nav-mese button:disabled{opacity:.3;cursor:not-allowed}
        .nav-mese button.hidden{visibility:hidden}

        /* Calendario */
        .calendario-container{background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0}
        .calendario-grid{display:grid;grid-template-columns:repeat(7,1fr)}
        .giorno-header{padding:1rem .5rem;text-align:center;font-weight:600;font-size:var(--text-xs);color:var(--primary-blue-dark);text-transform:uppercase;letter-spacing:1px;background:#f8fafc;border-bottom:1px solid #e2e8f0}
        .giorno-cella{min-height:110px;background:#fff;padding:.8rem;position:relative;border-right:1px solid #e9ecef;border-bottom:1px solid #e9ecef;transition:all .2s;cursor:pointer}
        .giorno-cella:nth-child(7n){border-right:none}
        .giorno-cella:hover{background:#f8fafc}
        .giorno-cella.vuoto{background:#fafafa;cursor:default}
        .giorno-cella.vuoto:hover{background:#fafafa}
        .giorno-cella.oggi{background:rgba(135,206,235,.15);border:2px solid var(--primary-blue)}
        .giorno-cella.passato{background:#f7f7f7}
        .giorno-cella.passato .giorno-numero{color:#aaa}
        .giorno-numero{font-weight:700;font-size:1.1rem;color:var(--dark-navy);margin-bottom:.5rem}
        .giorno-cella.oggi .giorno-numero{color:var(--primary-blue-dark);font-size:1.2rem}

        /* Eventi nel calendario */
        .evento-mini{font-size:11px;padding:5px 8px;margin-bottom:4px;border-radius:6px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;background:rgba(135,206,235,.3);color:var(--dark-navy);transition:all .2s}
        .evento-mini:hover{background:rgba(135,206,235,.5)}
        .evento-mini.passato{background:#e0e0e0;color:#888}
        .piu-eventi{font-size:11px;color:var(--primary-blue-dark);font-weight:600;cursor:pointer;padding:2px 0}

        /* Vista Settimana */
        .vista-settimana{display:none}
        .vista-settimana.active,.vista-mese.active{display:block}
        .vista-mese{display:none}
        .settimana-calendario-container{background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0}
        .settimana-headers{display:none}
        .settimana-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1rem;padding:1rem}
        .settimana-giorno{background:#fff;border-radius:12px;padding:1.2rem;min-height:200px;border:1px solid #e2e8f0;position:relative;cursor:pointer}
        .settimana-giorno.oggi{border-color:var(--primary-blue);background:rgba(135,206,235,.08)}
        .settimana-giorno.passato{background:#f9f9f9}
        .settimana-giorno-info{margin-bottom:.8rem}
        .settimana-giorno-eventi{display:flex;flex-direction:column;gap:.3rem}
        .settimana-data{font-weight:700;font-size:1.5rem;color:var(--dark-navy);margin-bottom:.3rem}
        .settimana-nome{font-size:var(--text-xs);color:var(--text-light);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.3rem}
        .piu-eventi-sett{font-size:11px;color:var(--primary-blue-dark);font-weight:600;cursor:pointer;padding:2px 0}

        /* MODALE EVENTO */
        .evento-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:100000;align-items:center;justify-content:center;padding:1.5rem;backdrop-filter:blur(4px)}
        .evento-modal.open{display:flex}
        .modal-content{background:#fff;border-radius:20px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 25px 80px rgba(0,0,0,.25);animation:modalSlide .3s ease;position:relative}
        @keyframes modalSlide{from{opacity:0;transform:translateY(30px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}

        .modal-close{position:absolute;top:1.2rem;right:1.2rem;width:40px;height:40px;border:none;background:#f5f5f5;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s;color:#666;font-size:1rem;z-index:10}
        .modal-close:hover{background:#eee;color:#333}

        .modal-header{padding:2rem 2rem 1.5rem;border-bottom:1px solid #f0f0f0}
        .modal-badges{display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap}
        .modal-tipo-badge{display:inline-block;padding:.4rem 1rem;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;background:var(--primary-blue);color:var(--dark-navy)}
        .modal-tipo-badge.passato{background:#e0e0e0;color:#666}
        .modal-titolo{font-size:1.75rem;font-weight:700;color:var(--dark-navy);margin:0 0 .8rem;line-height:1.25;letter-spacing:-.02em}
        .modal-data-row{display:flex;align-items:center;justify-content:space-between;gap:1rem}
        .modal-data{color:var(--primary-blue-dark);font-weight:500;font-size:1rem}
        .modal-share-btn{width:38px;height:38px;border-radius:50%;background:var(--primary-blue);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--dark-navy);transition:all .2s;flex-shrink:0}
        .modal-share-btn:hover{transform:scale(1.08);box-shadow:0 4px 12px rgba(135,206,235,.4)}

        .modal-body{padding:1.5rem 2rem 2rem}
        .modal-main-grid{display:grid;grid-template-columns:1fr 180px;gap:2rem;margin-bottom:1.5rem}
        .modal-main-grid.no-image{grid-template-columns:1fr}

        .modal-dettagli-title{font-size:.85rem;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:.8px;margin-bottom:.8rem}
        .modal-descrizione{font-size:1rem;line-height:1.75;color:var(--text-dark)}
        .modal-descrizione ul{margin:.8rem 0;padding-left:1.5rem}
        .modal-descrizione li{margin:.4rem 0}
        .modal-descrizione b,.modal-descrizione strong{font-weight:600}
        .modal-descrizione i,.modal-descrizione em{font-style:italic}

        .modal-locandina{width:180px;height:auto;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.12);cursor:pointer;flex-shrink:0}
        .modal-locandina img{width:100%;height:auto;display:block}

        /* Info Grid - 2 colonne, box compatti */
        .modal-info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.8rem;margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #f0f0f0}
        .modal-info-card{display:flex;align-items:center;gap:.7rem;padding:.7rem .9rem;background:#f8fafc;border-radius:10px}
        .modal-info-icon{width:32px;height:32px;border-radius:8px;background:rgba(135,206,235,.2);display:flex;align-items:center;justify-content:center;color:var(--primary-blue-dark);flex-shrink:0;font-size:.85rem}
        .modal-info-text{display:flex;flex-direction:column;gap:0}
        .modal-info-label{font-weight:600;color:var(--dark-navy);font-size:.7rem;text-transform:uppercase;letter-spacing:.3px}
        .modal-info-value{color:var(--text-dark);font-size:.9rem}

        .modal-calendar-section{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #f0f0f0}
        .modal-calendar-title{display:flex;align-items:center;gap:.6rem;font-size:.8rem;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:.5px;margin-bottom:1rem}
        .modal-calendar-title i{color:var(--primary-blue-dark)}
        .modal-calendar-btns{display:flex;gap:.8rem;flex-wrap:wrap}
        .btn-calendar{display:flex;align-items:center;gap:.7rem;padding:.9rem 1.3rem;border-radius:10px;text-decoration:none;font-weight:600;font-size:.9rem;transition:all .2s;border:1px solid var(--primary-blue);background:rgba(135,206,235,.08);color:var(--dark-navy);cursor:pointer}
        .btn-calendar svg,.btn-calendar i{flex-shrink:0}
        .btn-calendar i{font-size:1.1rem}

        /* Modale Lista Eventi (multi-evento) */
        .lista-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:100000;align-items:center;justify-content:center;padding:1.5rem;backdrop-filter:blur(4px)}
        .lista-modal.open{display:flex}
        .lista-modal-content{background:#fff;border-radius:16px;max-width:400px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 25px 80px rgba(0,0,0,.25);animation:modalSlide .3s ease}
        .lista-modal-header{padding:1.5rem;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center}
        .lista-modal-header h3{font-size:1.1rem;font-weight:700;color:var(--dark-navy);margin:0}
        .lista-modal-header .modal-close{position:static;width:36px;height:36px}
        .lista-modal-body{padding:1rem}
        .lista-evento-item{display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:12px;cursor:pointer;transition:background .2s;border:1px solid #f0f0f0;margin-bottom:.5rem}
        .lista-evento-item:last-child{margin-bottom:0}
        .lista-evento-item:hover{background:#f8fafc}
        .lista-evento-dot{width:10px;height:10px;border-radius:50%;background:var(--primary-blue);flex-shrink:0}
        .lista-evento-dot.passato{background:#ccc}
        .lista-evento-info{flex:1;min-width:0}
        .lista-evento-titolo{font-weight:600;color:var(--dark-navy);font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .lista-evento-ora{font-size:.8rem;color:var(--text-light)}

        /* Lightbox */
        .lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:200000;align-items:center;justify-content:center;padding:2rem;cursor:zoom-out;opacity:0}
        .lightbox.open{display:flex !important;opacity:1 !important}
        .lightbox img{max-width:90%;max-height:90vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.5);cursor:default;opacity:1 !important}
        .lightbox-close{position:absolute;top:1.5rem;right:1.5rem;width:50px;height:50px;border:none;background:rgba(255,255,255,.15);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;transition:all .2s}
        .lightbox-close:hover{background:rgba(255,255,255,.25)}

        /* Responsive */
        @media(max-width:992px){
            /* Vista settimanale griglia 7 colonne */
            .settimana-calendario-container{border-radius:12px}
            .settimana-headers{display:grid;grid-template-columns:repeat(7,1fr);background:#f8fafc;border-bottom:1px solid #e2e8f0}
            .settimana-header-giorno{padding:.7rem .2rem;text-align:center;font-weight:600;font-size:10px;color:var(--primary-blue-dark);text-transform:uppercase;letter-spacing:1px}
            .settimana-grid{grid-template-columns:repeat(7,1fr);gap:0;padding:0}
            .settimana-giorno{min-height:60px;padding:.5rem;border-radius:0;border:none;border-right:1px solid #e9ecef;border-bottom:1px solid #e9ecef;display:block;background:#fff}
            .settimana-giorno:nth-child(7n){border-right:none}
            .settimana-giorno-info{display:block;padding:0;border:none}
            .settimana-nome{display:none}
            .settimana-data{font-size:.95rem;margin-bottom:0;font-weight:700}
            .settimana-giorno-eventi{display:none}
            .settimana-giorno .evento-mini{display:none}
            .settimana-giorno.ha-eventi::after{content:'\f25a';font-family:'Font Awesome 6 Free';font-weight:900;position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-size:18px;color:var(--primary-blue);z-index:2;animation:pulseIcon 2s infinite}
            .settimana-giorno.ha-eventi::before{content:'';position:absolute;bottom:6px;left:50%;transform:translate(-50%,-50%);width:26px;height:26px;border-radius:50%;background:rgba(135,206,235,0.3);animation:pulseRing 2s infinite;z-index:1}
        }
        @media(max-width:900px){
            .calendario-grid .giorno-cella{min-height:85px;padding:.6rem}
            .giorno-numero{font-size:1rem}
            .evento-mini{font-size:10px;padding:3px 6px}
            .modal-main-grid{grid-template-columns:1fr}
            .modal-locandina{width:100%;max-width:200px;margin:0 auto 1rem}
            .modal-info-grid{grid-template-columns:1fr}
        }
        @media(max-width:600px){
            .eventi-wrapper{padding:0 .5rem;max-width:100%}
            .calendario-container{border-radius:12px;border:1px solid #e2e8f0}
            .calendario-grid .giorno-header{font-size:10px;padding:.7rem .2rem}
            .giorno-cella{min-height:60px;padding:.5rem}
            .giorno-numero{font-size:.95rem}
            .giorno-cella.oggi .giorno-numero{font-size:.95rem}
            .evento-mini{display:none}
            .giorno-cella.ha-eventi{position:relative}
            .giorno-cella.ha-eventi::after{content:'\f25a';font-family:'Font Awesome 6 Free';font-weight:900;position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-size:18px;color:var(--primary-blue);cursor:pointer;z-index:2;animation:pulseIcon 2s infinite}
            .giorno-cella.ha-eventi::before{content:'';position:absolute;bottom:6px;left:50%;transform:translate(-50%,-50%);width:26px;height:26px;border-radius:50%;background:rgba(135,206,235,0.3);animation:pulseRing 2s infinite;z-index:1}
            @keyframes pulseIcon{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.15)}}
            @keyframes pulseRing{0%{transform:translate(-50%,-50%) scale(0.8);opacity:0.8}50%{transform:translate(-50%,-50%) scale(1.5);opacity:0.3}100%{transform:translate(-50%,-50%) scale(2);opacity:0}}
            /* Nav mese più piccolo */
            .nav-mese button{width:36px;height:36px;font-size:.85rem}
            .mese-corrente{font-size:1.1rem}
            .calendario-nav{padding:.8rem 1rem}
            /* Modale evento fullwidth */
            .evento-modal{padding:0}
            .modal-content{border-radius:0;max-height:100vh;height:100%;width:100%;max-width:100%;margin:0}
            .modal-calendar-btns{flex-direction:column}
            .modal-header{padding:1.5rem 1.5rem 1.2rem}
            .modal-body{padding:1.2rem 1.5rem 1.5rem}
            .modal-titolo{font-size:1.4rem}
            .modal-locandina{max-width:100%;width:100%}
            .modal-locandina img{width:100%}
            /* Modale lista eventi centrata */
            .lista-modal-content{max-width:90%;border-radius:16px;height:auto;max-height:70vh;margin:auto}
        }
    </style>
</head>
<body>
    <a href="#main-content" class="skip-link">Salta al contenuto principale</a>
    <?php include 'components/header.php'; ?>

    <main id="main-content" role="main">
        <!-- Hero -->
        <section class="chisiamo-hero">
            <div class="chisiamo-hero-image" style="background-image: url('assets/images/gallery-3.jpg')"></div>
            <div class="chisiamo-hero-overlay"></div>
            <div class="chisiamo-hero-glass">
                <span class="chisiamo-hero-badge">Calendario</span>
                <h1 class="chisiamo-hero-title">Spettacoli ed Eventi</h1>
                <p class="chisiamo-hero-tagline">Scopri tutti gli appuntamenti in programma: spettacoli, workshop, saggi e corsi aperti.</p>
                <a href="#calendario" class="chisiamo-scroll-arrow" aria-label="Scorri al calendario">
                    <i class="fas fa-chevron-down"></i>
                </a>
            </div>
        </section>

        <!-- Calendario -->
        <section id="calendario" class="eventi-section">
            <div class="eventi-wrapper">
                <!-- Messaggio Nessun Evento -->
                <div id="noEventiMsg" style="display:none;text-align:center;padding:4rem 2rem">
                    <i class="fas fa-calendar-times" style="font-size:4rem;color:#ccc;margin-bottom:1.5rem"></i>
                    <h3 style="font-size:1.5rem;color:var(--dark-navy);margin-bottom:.5rem">Nessun evento disponibile</h3>
                    <p style="color:var(--text-light);font-size:1rem">Al momento non ci sono eventi in programma. Torna presto per scoprire le novità!</p>
                </div>

                <!-- Calendario Content -->
                <div id="calendarioContent">
                    <!-- Tabs -->
                    <div class="vista-tabs">
                        <button class="vista-tab active" data-vista="mese">Mese</button>
                        <button class="vista-tab" data-vista="settimana">Settimana</button>
                    </div>

                    <!-- Vista Mese -->
                    <div class="vista-mese active" id="vistaMese">
                    <div class="calendario-nav">
                        <div class="nav-mese"><button id="btnMesePrev" title="Mese precedente"><i class="fas fa-chevron-left"></i></button></div>
                        <h2 class="mese-corrente" id="meseCorrente"></h2>
                        <div class="nav-mese"><button id="btnMeseNext" title="Mese successivo"><i class="fas fa-chevron-right"></i></button></div>
                    </div>
                    <div class="calendario-container">
                        <div class="calendario-grid" id="calendarioGrid"></div>
                    </div>
                </div>

                <!-- Vista Settimana -->
                <div class="vista-settimana" id="vistaSettimana">
                    <div class="calendario-nav">
                        <div class="nav-mese"><button id="btnSettPrev" title="Settimana precedente"><i class="fas fa-chevron-left"></i></button></div>
                        <h2 class="mese-corrente" id="rangeSettimana"></h2>
                        <div class="nav-mese"><button id="btnSettNext" title="Settimana successiva"><i class="fas fa-chevron-right"></i></button></div>
                    </div>
                    <div class="settimana-calendario-container">
                        <div class="settimana-headers" id="settimanaHeaders"></div>
                        <div class="settimana-grid" id="settimanaGrid"></div>
                    </div>
                </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Modale Evento -->
    <div class="evento-modal" id="eventoModal">
        <div class="modal-content">
            <button class="modal-close" onclick="chiudiModal()" title="Chiudi"><i class="fas fa-times"></i></button>
            <div class="modal-header">
                <div class="modal-badges" id="modalBadges"></div>
                <h2 class="modal-titolo" id="modalTitolo"></h2>
                <div class="modal-data-row">
                    <span class="modal-data" id="modalData"></span>
                    <button class="modal-share-btn" onclick="condividi()" title="Condividi evento"><i class="fas fa-share-alt"></i></button>
                </div>
            </div>
            <div class="modal-body">
                <div class="modal-main-grid" id="modalMainGrid">
                    <div class="modal-dettagli">
                        <div class="modal-dettagli-title">Dettagli dell'Evento</div>
                        <p class="modal-descrizione" id="modalDescrizione"></p>
                    </div>
                    <div class="modal-locandina" id="modalLocandinaWrap" style="display:none" onclick="apriLightbox(event)">
                        <img id="modalLocandina" src="" alt="Locandina evento">
                    </div>
                </div>

                <div class="modal-info-grid" id="modalInfoGrid"></div>

                <div class="modal-calendar-section">
                    <div class="modal-calendar-title"><i class="fas fa-calendar-plus"></i> Aggiungi al tuo calendario</div>
                    <div class="modal-calendar-btns">
                        <button class="btn-calendar" id="btnGoogle" style="border:none;cursor:pointer">
                            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Google Calendar
                        </button>
                        <button class="btn-calendar" id="btnApple" style="border:none;cursor:pointer">
                            <i class="fab fa-apple"></i>
                            Apple Calendar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modale Lista Eventi (multi-evento) -->
    <div class="lista-modal" id="listaModal" onclick="chiudiListaModal(event)">
        <div class="lista-modal-content" onclick="event.stopPropagation()">
            <div class="lista-modal-header">
                <h3 id="listaModalTitolo">Eventi del giorno</h3>
                <button class="modal-close" onclick="chiudiListaModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="lista-modal-body" id="listaModalBody"></div>
        </div>
    </div>

    <!-- Lightbox Immagine -->
    <div class="lightbox" id="lightbox">
        <button class="lightbox-close" onclick="chiudiLightbox(event)" title="Chiudi"><i class="fas fa-times"></i></button>
        <img id="lightboxImg" src="" alt="Locandina ingrandita" onclick="event.stopPropagation()">
    </div>

    <footer class="footer" role="contentinfo"><?php include 'components/footer.php'; ?></footer>
    <script src="js/main.js"></script>
    <script>window.dispatchEvent(new Event('componentsLoaded'));</script>
    <script>
    const mesiIt=['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
    const giorniIt=['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];
    const giorniShort=['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
    let eventi=[], mesiConEventi=[], currentMeseIndex=0, eventoCorrente=null;
    // Data oggi con timezone locale (non UTC)
    const d = new Date();
    const oggi = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    // Carica eventi
    fetch('dashboard.php?api=eventi').then(r=>{
        if(!r.ok)throw new Error('API non disponibile');
        return r.json();
    }).then(data=>{
        eventi=data.eventi||[];
        initCalendario();
    }).catch(()=>{
        fetch('data/eventi.json').then(r=>r.json()).then(data=>{
            eventi=data||[];
            initCalendario();
        }).catch(()=>{
            eventi=[];
            initCalendario();
        });
    });

    function initCalendario(){
        // Se non ci sono eventi, mostra messaggio
        if(!eventi || eventi.length === 0){
            document.getElementById('noEventiMsg').style.display = 'block';
            document.getElementById('calendarioContent').style.display = 'none';
            return;
        }

        document.getElementById('noEventiMsg').style.display = 'none';
        document.getElementById('calendarioContent').style.display = 'block';

        // Calcola lista ordinata di mesi con eventi
        const mesiSet = new Set();
        eventi.forEach(e=>{
            const d = new Date(e.data);
            mesiSet.add(`${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`);
        });
        mesiConEventi = Array.from(mesiSet).sort();

        // Trova il primo mese con eventi futuri o il primo disponibile
        const meseFuturo = mesiConEventi.find(m=>{
            const [y,mo] = m.split('-').map(Number);
            const ultimoGiorno = new Date(y, mo+1, 0);
            return ultimoGiorno >= new Date();
        });
        currentMeseIndex = meseFuturo ? mesiConEventi.indexOf(meseFuturo) : 0;
        if(currentMeseIndex < 0) currentMeseIndex = 0;

        setupNavButtons();
        renderMese();

        // Controlla URL parameter per aprire modale evento
        const urlParams = new URLSearchParams(window.location.search);
        const eventoId = urlParams.get('evento');
        if(eventoId){
            setTimeout(()=>apriModal(eventoId), 300);
        }
    }

    function setupNavButtons(){
        document.getElementById('btnMesePrev').onclick = ()=>cambiaMese(-1);
        document.getElementById('btnMeseNext').onclick = ()=>cambiaMese(1);
        document.getElementById('btnSettPrev').onclick = ()=>cambiaSettimana(-1);
        document.getElementById('btnSettNext').onclick = ()=>cambiaSettimana(1);
    }

    // Tabs
    document.querySelectorAll('.vista-tab').forEach(t=>{
        t.onclick=()=>{
            document.querySelectorAll('.vista-tab').forEach(x=>x.classList.remove('active'));
            t.classList.add('active');
            const v=t.dataset.vista;
            document.getElementById('vistaMese').classList.toggle('active',v==='mese');
            document.getElementById('vistaSettimana').classList.toggle('active',v==='settimana');
            if(v==='settimana') renderSettimana();
            else renderMese();
        };
    });

    function getCurrentMeseAnno(){
        if(mesiConEventi.length === 0) return {mese: new Date().getMonth(), anno: new Date().getFullYear()};
        const [anno, mese] = mesiConEventi[currentMeseIndex].split('-').map(Number);
        return {mese, anno};
    }

    function cambiaMese(dir){
        const newIndex = currentMeseIndex + dir;
        if(newIndex >= 0 && newIndex < mesiConEventi.length){
            currentMeseIndex = newIndex;
            renderMese();
        }
    }

    function cambiaSettimana(dir){
        // Cambia mese usando lo stesso sistema della vista mese
        const newIndex = currentMeseIndex + dir;
        if(newIndex >= 0 && newIndex < mesiConEventi.length){
            currentMeseIndex = newIndex;
            renderSettimana();
        }
    }

    function updateNavButtons(vista){
        if(vista === 'mese'){
            document.getElementById('btnMesePrev').classList.toggle('hidden', currentMeseIndex <= 0);
            document.getElementById('btnMeseNext').classList.toggle('hidden', currentMeseIndex >= mesiConEventi.length - 1);
        } else if(vista === 'settimana'){
            document.getElementById('btnSettPrev').classList.toggle('hidden', currentMeseIndex <= 0);
            document.getElementById('btnSettNext').classList.toggle('hidden', currentMeseIndex >= mesiConEventi.length - 1);
        }
    }

    function renderMese(){
        const {mese, anno} = getCurrentMeseAnno();
        document.getElementById('meseCorrente').textContent=`${mesiIt[mese]} ${anno}`;

        const primo=new Date(anno,mese,1);
        const giorni=new Date(anno,mese+1,0).getDate();
        const inizioSet=(primo.getDay()+6)%7;

        let html=giorniShort.map(g=>`<div class="giorno-header">${g}</div>`).join('');
        for(let i=0;i<inizioSet;i++)html+='<div class="giorno-cella vuoto"></div>';
        for(let g=1;g<=giorni;g++){
            const data=`${anno}-${String(mese+1).padStart(2,'0')}-${String(g).padStart(2,'0')}`;
            const isOggi=data===oggi, isPassato=data<oggi, isDom=new Date(anno,mese,g).getDay()===0;
            const evG=eventi.filter(e=>e.data===data);
            let cls='giorno-cella';
            if(isOggi)cls+=' oggi';
            else if(isPassato)cls+=' passato';
            if(isDom)cls+=' domenica';
            if(evG.length)cls+=' ha-eventi';
            html+=`<div class="${cls}" onclick="clickGiorno('${data}')"><div class="giorno-numero">${g}</div>`;
            evG.slice(0,2).forEach(e=>{
                const evPassato = e.data < oggi ? ' passato' : '';
                const titoloTrunc = e.titolo.length > 10 ? e.titolo.substring(0, 10) + '...' : e.titolo;
                html+=`<div class="evento-mini${evPassato}" onclick="event.stopPropagation();apriModal('${e.id}')">${titoloTrunc}</div>`;
            });
            if(evG.length>2){const n=evG.length-2;html+=`<div class="piu-eventi" onclick="event.stopPropagation();clickGiorno('${data}')">+${n} ${n===1?'altro':'altri'}</div>`;}
            html+='</div>';
        }
        document.getElementById('calendarioGrid').innerHTML=html;
        updateNavButtons('mese');
    }

    function renderSettimana(){
        const {mese, anno} = getCurrentMeseAnno();

        // Trova tutti gli eventi del mese corrente
        const eventiMese = eventi.filter(e => {
            const d = new Date(e.data);
            return d.getMonth() === mese && d.getFullYear() === anno;
        });

        if(eventiMese.length === 0){
            document.getElementById('rangeSettimana').textContent = `${mesiIt[mese]} ${anno} - Nessun evento`;
            document.getElementById('settimanaGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light)">Nessun evento in questo mese</div>';
            updateNavButtons('settimana');
            return;
        }

        // Raggruppa eventi per settimana
        const settimane = new Map();

        eventiMese.forEach(e => {
            const data = new Date(e.data);
            // Trova il lunedì della settimana di questo evento
            const giorno = data.getDay();
            const diff = (giorno === 0 ? -6 : 1) - giorno; // Lunedì
            const lunedi = new Date(data);
            lunedi.setDate(data.getDate() + diff);
            const keyLunedi = lunedi.toISOString().split('T')[0];

            if(!settimane.has(keyLunedi)){
                settimane.set(keyLunedi, []);
            }
            settimane.get(keyLunedi).push(e);
        });

        // Ordina le settimane
        const settimaneOrdinate = Array.from(settimane.keys()).sort();

        // Mostra titolo con range del mese
        document.getElementById('rangeSettimana').textContent = `${mesiIt[mese]} ${anno}`;

        // Render header giorni (LUN, MAR, MER...)
        document.getElementById('settimanaHeaders').innerHTML = giorniShort.map(g=>`<div class="settimana-header-giorno">${g}</div>`).join('');

        // Render tutte le settimane con eventi
        let html = '';
        settimaneOrdinate.forEach(keyLunedi => {
            const lunedi = new Date(keyLunedi);
            const domenica = new Date(lunedi);
            domenica.setDate(lunedi.getDate() + 6);

            // Crea 7 giorni per questa settimana
            for(let i = 0; i < 7; i++){
                const d = new Date(lunedi);
                d.setDate(lunedi.getDate() + i);
                const data = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                const isOggi = data === oggi;
                const isPassato = data < oggi;
                const evG = eventi.filter(e => e.data === data);

                let cls = 'settimana-giorno';
                if(isOggi) cls += ' oggi';
                else if(isPassato) cls += ' passato';
                if(evG.length) cls += ' ha-eventi';

                html += `<div class="${cls}" onclick="clickGiorno('${data}')">
                    <div class="settimana-giorno-info">
                        <div class="settimana-nome">${giorniShort[i]}</div>
                        <div class="settimana-data">${d.getDate()}</div>
                    </div>
                    <div class="settimana-giorno-eventi">`;

                // Mostra max 2 eventi, poi +N altri
                evG.slice(0,2).forEach(e => {
                    const evPassato = e.data < oggi ? ' passato' : '';
                    const titoloTrunc = e.titolo.length > 15 ? e.titolo.substring(0, 15) + '...' : e.titolo;
                    html += `<div class="evento-mini${evPassato}" onclick="event.stopPropagation();apriModal('${e.id}')">${titoloTrunc}</div>`;
                });
                if(evG.length > 2){
                    const n = evG.length - 2;
                    html += `<div class="piu-eventi-sett" onclick="event.stopPropagation();clickGiorno('${data}')">+${n} ${n===1?'altro':'altri'}</div>`;
                }

                html += '</div></div>';
            }
        });

        document.getElementById('settimanaGrid').innerHTML = html;
        updateNavButtons('settimana');
    }

    function clickGiorno(data){
        const evG=eventi.filter(e=>e.data===data);
        if(evG.length===0) return;
        if(evG.length===1) {
            apriModal(evG[0].id);
        } else {
            apriListaModal(data, evG);
        }
    }

    function apriListaModal(data, eventiGiorno){
        const d = new Date(data);
        const dataFormattata = `${d.getDate()} ${mesiIt[d.getMonth()]}`;
        document.getElementById('listaModalTitolo').textContent = `Eventi del ${dataFormattata}`;

        let html = '';
        eventiGiorno.forEach(e => {
            const isPassato = e.data < oggi;
            html += `<div class="lista-evento-item" onclick="chiudiListaModal();apriModal('${e.id}')">
                <div class="lista-evento-dot${isPassato ? ' passato' : ''}"></div>
                <div class="lista-evento-info">
                    <div class="lista-evento-titolo">${e.titolo}</div>
                    ${e.ora ? `<div class="lista-evento-ora"><i class="fas fa-clock"></i> ${e.ora}</div>` : ''}
                </div>
                <i class="fas fa-chevron-right" style="color:var(--text-light);font-size:.8rem"></i>
            </div>`;
        });
        document.getElementById('listaModalBody').innerHTML = html;
        document.getElementById('listaModal').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function chiudiListaModal(e){
        if(e && e.target !== e.currentTarget) return;
        document.getElementById('listaModal').classList.remove('open');
        document.body.style.overflow = '';
    }

    function apriModal(id){
        const e=eventi.find(ev=>ev.id===id);
        if(!e)return;
        eventoCorrente=e;
        const d=new Date(e.data);
        const isPassato = e.data < oggi;
        const dataFormattata=`${giorniIt[d.getDay()]} ${d.getDate()} ${mesiIt[d.getMonth()]} ${d.getFullYear()}${e.ora?' alle '+e.ora:''}`;

        // Badges
        let badgesHtml = '';
        if(e.tipo) badgesHtml += `<span class="modal-tipo-badge">${e.tipo}</span>`;
        if(isPassato) badgesHtml += `<span class="modal-tipo-badge passato">Evento Passato</span>`;
        document.getElementById('modalBadges').innerHTML = badgesHtml;

        document.getElementById('modalTitolo').textContent=e.titolo;
        document.getElementById('modalData').textContent=dataFormattata;
        document.getElementById('modalDescrizione').innerHTML=e.descrizione||'Maggiori informazioni disponibili contattando la segreteria.';

        const mainGrid = document.getElementById('modalMainGrid');

        // Locandina
        if(e.immagine){
            document.getElementById('modalLocandina').src=e.immagine;
            document.getElementById('modalLocandinaWrap').style.display='block';
            mainGrid.classList.remove('no-image');
        }else{
            document.getElementById('modalLocandinaWrap').style.display='none';
            mainGrid.classList.add('no-image');
        }

        // Info (senza orario - orario è già in modal-data)
        let infoHtml = '';
        if(e.luogo){
            infoHtml+=`<div class="modal-info-card">
                <div class="modal-info-icon"><i class="fas fa-map-marker-alt"></i></div>
                <div class="modal-info-text"><span class="modal-info-label">Sede</span><span class="modal-info-value">${e.luogo}</span></div>
            </div>`;
        }
        if(e.destinatari){
            infoHtml+=`<div class="modal-info-card">
                <div class="modal-info-icon"><i class="fas fa-users"></i></div>
                <div class="modal-info-text"><span class="modal-info-label">Destinatari</span><span class="modal-info-value">${e.destinatari}</span></div>
            </div>`;
        }
        if(e.costo){
            infoHtml+=`<div class="modal-info-card">
                <div class="modal-info-icon"><i class="fas fa-euro-sign"></i></div>
                <div class="modal-info-text"><span class="modal-info-label">Costo</span><span class="modal-info-value">${e.costo}</span></div>
            </div>`;
        }
        document.getElementById('modalInfoGrid').innerHTML=infoHtml;
        document.getElementById('modalInfoGrid').style.display = infoHtml ? 'grid' : 'none';

        // GOOGLE CALENDAR - formato corretto con onclick
        const dataGcal = e.data.replace(/-/g,'');
        let gcalUrl;
        if(e.ora){
            // Evento con orario: aggiungi T e durata 1 ora
            const oraStart = e.ora.replace(':','');
            const oraEndNum = parseInt(e.ora.split(':')[0]) + 1;
            const oraEnd = String(oraEndNum).padStart(2,'0') + e.ora.split(':')[1];
            gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.titolo)}&dates=${dataGcal}T${oraStart}00/${dataGcal}T${oraEnd.replace(':','')}00&details=${encodeURIComponent(e.descrizione||'')}&location=${encodeURIComponent(e.luogo||'')}`;
        } else {
            // Evento tutto il giorno
            const nextDay = new Date(e.data);
            nextDay.setDate(nextDay.getDate()+1);
            const dataEnd = nextDay.toISOString().split('T')[0].replace(/-/g,'');
            gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.titolo)}&dates=${dataGcal}/${dataEnd}&details=${encodeURIComponent(e.descrizione||'')}&location=${encodeURIComponent(e.luogo||'')}`;
        }
        const btnGoogle = document.getElementById('btnGoogle');
        btnGoogle.onclick = function() {
            window.open(gcalUrl, '_blank', 'noopener,noreferrer');
        };

        // APPLE CALENDAR - ICS file con onclick
        const btnApple = document.getElementById('btnApple');
        btnApple.onclick = function() {
            const icsContent = generateICS(e);
            const blob = new Blob([icsContent], {type: 'text/calendar;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${e.titolo.replace(/[^a-zA-Z0-9]/g,'_')}.ics`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        document.getElementById('eventoModal').classList.add('open');
        document.body.style.overflow='hidden';
    }

    function generateICS(e){
        const now = new Date();
        const pad = n => String(n).padStart(2,'0');
        const formatDate = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
        const formatDateTime = (d,t) => {
            const [h,m] = t.split(':');
            return `${formatDate(d)}T${pad(h)}${pad(m)}00`;
        };

        const eventDate = new Date(e.data);
        let dtstart, dtend;

        if(e.ora){
            dtstart = formatDateTime(eventDate, e.ora);
            const endHour = parseInt(e.ora.split(':')[0]) + 1;
            dtend = formatDateTime(eventDate, `${pad(endHour)}:${e.ora.split(':')[1]}`);
        } else {
            dtstart = formatDate(eventDate);
            const nextDay = new Date(eventDate);
            nextDay.setDate(nextDay.getDate()+1);
            dtend = formatDate(nextDay);
        }

        const uid = `${e.id}@inballet.it`;
        const dtstamp = `${formatDate(now)}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InBallet//Eventi//IT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART${e.ora ? '' : ';VALUE=DATE'}:${dtstart}
DTEND${e.ora ? '' : ';VALUE=DATE'}:${dtend}
SUMMARY:${e.titolo}
DESCRIPTION:${(e.descrizione||'').replace(/\n/g,'\\n')}
LOCATION:${e.luogo||''}
END:VEVENT
END:VCALENDAR`;
    }

    function chiudiModal(){
        document.getElementById('eventoModal').classList.remove('open');
        document.body.style.overflow='';
        eventoCorrente=null;
    }

    function apriLightbox(event){
        event.stopPropagation();
        if(!eventoCorrente || !eventoCorrente.immagine) return;
        document.getElementById('lightboxImg').src = eventoCorrente.immagine;
        document.getElementById('lightbox').classList.add('open');
    }

    function chiudiLightbox(event){
        if(event) event.stopPropagation();
        document.getElementById('lightbox').classList.remove('open');
    }

    document.getElementById('lightbox').onclick = function(e){
        if(e.target === this) chiudiLightbox();
    };

    document.getElementById('eventoModal').onclick=e=>{if(e.target.id==='eventoModal')chiudiModal()};
    document.onkeydown=e=>{
        if(e.key==='Escape'){
            if(document.getElementById('lightbox').classList.contains('open')) chiudiLightbox();
            else chiudiModal();
        }
    };

    function condividi(){
        if(!eventoCorrente)return;
        const url=location.href.split('?')[0];
        const txt=`${eventoCorrente.titolo} - ${eventoCorrente.data}${eventoCorrente.luogo?' @ '+eventoCorrente.luogo:''}\n\nInBallet - Scuola di Danza`;
        if(navigator.share){
            navigator.share({title:eventoCorrente.titolo,text:txt,url:url});
        }else{
            navigator.clipboard.writeText(txt+'\n'+url).then(()=>alert('Link copiato negli appunti!'));
        }
    }
    </script>
</body>
</html>
