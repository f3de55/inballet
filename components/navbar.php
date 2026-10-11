<nav class="nav-container" aria-label="Navigazione principale">
    <div class="logo-section">
        <a href="/" aria-label="InBallet - Torna alla homepage">
            <img src="./assets/images/logo.png" alt="InBallet Logo" />
        </a>
    </div>

    <ul class="nav-menu">
        <li class="nav-item" data-menu="corsi">
            <button class="nav-link" aria-expanded="false" aria-haspopup="true">CORSI</button>
            <div class="mega-menu" id="mega-menu-corsi" role="region" aria-label="Menu Corsi">
                <div class="mega-menu-content">
                    <div class="mega-menu-section">
                        <h4>Danza Classica e Moderna</h4>
                        <ul>
                            <li><a href="avviamento-danza">Avviamento alla Danza</a></li>
                            <li><a href="educazione-danza">Educazione alla Danza</a></li>
                            <li><a href="danza-classica">Danza Classica</a></li>
                            <li><a href="modern">Modern</a></li>
                        </ul>
                    </div>
                    <div class="mega-menu-section">
                        <h4>Danza Contemporanea</h4>
                        <ul>
                            <li><a href="danza-contemporanea">Danza Contemporanea</a></li>
                            <li><a href="contemporanea-adulti">Danza Contemporanea Adulti</a></li>
                            <li><a href="contact-improvisation">Contact Improvisation</a></li>
                            <li><a href="movimento-creativo">Movimento Creativo</a></li>
                        </ul>
                    </div>
                    <div class="mega-menu-section">
                        <h4>Urban Dance</h4>
                        <ul>
                            <li><a href="hip-hop">Hip-Hop</a></li>
                            <li><a href="heels">Heels</a></li>
                            <li><a href="breaking">Breaking</a></li>
                            <li><a href="danza-acrobatica">Danza Acrobatica</a></li>
                            <li><a href="contaminato">Contaminato</a></li>
                        </ul>
                    </div>
                    <div class="mega-menu-section">
                        <h4>Benessere e Movimento</h4>
                        <ul>
                            <li><a href="yoga">Yoga</a></li>
                            <li><a href="pilates">Pilates</a></li>
                            <li><a href="classi">Classi</a></li>
                            <li><a href="lezioni-individuali">Lezioni Individuali</a></li>
                        </ul>
                    </div>
                    <div class="mega-menu-section">
                        <h4>Percorsi per Età</h4>
                        <ul>
                            <li><a href="prima-infanzia">Prima Infanzia</a></li>
                            <li><a href="seconda-infanzia">Seconda Infanzia</a></li>
                            <li><a href="bambini">Bambini</a></li>
                            <li><a href="ragazzi">Ragazzi</a></li>
                            <li><a href="adulti">Adulti</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </li>

        <li class="nav-item" data-menu="scuola">
            <button class="nav-link" aria-expanded="false" aria-haspopup="true">LA SCUOLA</button>
            <div class="mega-menu" id="mega-menu-scuola" role="region" aria-label="Menu La Scuola">
                <div class="mega-menu-content">
                    <div class="mega-menu-section">
                        <h4>La Scuola</h4>
                        <ul>
                            <li><a href="chi-siamo">Chi Siamo</a></li>
                            <li><a href="spettacoli-eventi">Spettacoli ed Eventi</a></li>
                            <li><a href="collaborazioni-scuole">Collaborazioni con Scuole</a></li>
                            <li><a href="sportello-psicologico">Sportello Psicologico</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </li>

        <li class="nav-item" data-menu="progetti">
            <button class="nav-link" aria-expanded="false" aria-haspopup="true">PROGETTI</button>
            <div class="mega-menu" id="mega-menu-progetti" role="region" aria-label="Menu Progetti">
                <div class="mega-menu-content">
                    <div class="mega-menu-section">
                        <h4>Danza Integrativa</h4>
                        <ul>
                            <li><a href="classi-integrate">Classi Multidisciplinari Integrate</a></li>
                            <li><a href="progetto-noiconvoi">Progetto NoiConVoi</a></li>
                            <li><a href="sostenitori">Sostenitori Progetti Sociali</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </li>

        <li class="nav-item" data-menu="formazione">
            <button class="nav-link" aria-expanded="false" aria-haspopup="true">FORMAZIONE</button>
            <div class="mega-menu" id="mega-menu-formazione" role="region" aria-label="Menu Formazione">
                <div class="mega-menu-content">
                    <div class="mega-menu-section">
                        <h4>Percorsi Professionali</h4>
                        <ul>
                            <li><a href="formazione-insegnanti">Corso di Formazione per Insegnanti di Danza</a></li>
                            <li><a href="formazioni-personalizzate">Formazioni Personalizzate</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </li>

    </ul>

    <a href="contatti" class="cta-btn">Contattaci</a>
    <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Apri menu di navigazione">
        <i class="fas fa-bars"></i>
    </button>
</nav>

<!-- Mobile Menu -->
<div class="mobile-overlay" id="mobileOverlay"></div>
<div class="mobile-menu" id="mobileMenu" aria-hidden="true">
    <button class="mobile-menu-close" id="mobileMenuClose" aria-label="Chiudi menu">
        <i class="fas fa-times"></i>
    </button>

    <div class="mobile-nav-item">
        <button class="mobile-nav-toggle" data-target="corsi-submenu" aria-expanded="false" aria-controls="corsi-submenu">
            <span>CORSI</span>
            <i class="fas fa-chevron-down" aria-hidden="true"></i>
        </button>
        <div class="mobile-submenu" id="corsi-submenu">
            <h4>Danza Classica e Moderna</h4>
            <a href="avviamento-danza">Avviamento alla Danza</a>
            <a href="educazione-danza">Educazione alla Danza</a>
            <a href="danza-classica">Danza Classica</a>
            <a href="modern">Modern</a>
            <h4>Danza Contemporanea</h4>
            <a href="danza-contemporanea">Danza Contemporanea</a>
            <a href="contemporanea-adulti">Danza Contemporanea Adulti</a>
            <a href="contact-improvisation">Contact Improvisation</a>
            <a href="movimento-creativo">Movimento Creativo</a>
            <h4>Urban Dance</h4>
            <a href="hip-hop">Hip-Hop</a>
            <a href="heels">Heels</a>
            <a href="breaking">Breaking</a>
            <a href="danza-acrobatica">Danza Acrobatica</a>
            <a href="contaminato">Contaminato</a>
            <h4>Benessere e Movimento</h4>
            <a href="yoga">Yoga</a>
            <a href="pilates">Pilates</a>
            <a href="classi">Classi</a>
            <a href="lezioni-individuali">Lezioni Individuali</a>
            <h4>Percorsi per Età</h4>
            <a href="prima-infanzia">Prima Infanzia</a>
            <a href="seconda-infanzia">Seconda Infanzia</a>
            <a href="bambini">Bambini</a>
            <a href="ragazzi">Ragazzi</a>
            <a href="adulti">Adulti</a>
        </div>
    </div>

    <div class="mobile-nav-item">
        <button class="mobile-nav-toggle" data-target="scuola-submenu" aria-expanded="false" aria-controls="scuola-submenu">
            <span>LA SCUOLA</span>
            <i class="fas fa-chevron-down" aria-hidden="true"></i>
        </button>
        <div class="mobile-submenu" id="scuola-submenu">
            <h4>La Scuola</h4>
            <a href="chi-siamo">Chi Siamo</a>
            <a href="spettacoli-eventi">Spettacoli ed Eventi</a>
            <a href="collaborazioni-scuole">Collaborazioni con Scuole</a>
            <a href="sportello-psicologico">Sportello Psicologico</a>
        </div>
    </div>

    <div class="mobile-nav-item">
        <button class="mobile-nav-toggle" data-target="progetti-submenu" aria-expanded="false" aria-controls="progetti-submenu">
            <span>PROGETTI</span>
            <i class="fas fa-chevron-down" aria-hidden="true"></i>
        </button>
        <div class="mobile-submenu" id="progetti-submenu">
            <h4>Danza Integrativa</h4>
            <a href="classi-integrate">Classi Multidisciplinari Integrate</a>
            <a href="progetto-noiconvoi">Progetto NoiConVoi</a>
            <a href="sostenitori">Sostenitori Progetti Sociali</a>
        </div>
    </div>

    <div class="mobile-nav-item">
        <button class="mobile-nav-toggle" data-target="formazione-submenu" aria-expanded="false" aria-controls="formazione-submenu">
            <span>FORMAZIONE</span>
            <i class="fas fa-chevron-down" aria-hidden="true"></i>
        </button>
        <div class="mobile-submenu" id="formazione-submenu">
            <h4>Percorsi Professionali</h4>
            <a href="formazione-insegnanti">Corso di Formazione per Insegnanti di Danza</a>
            <a href="formazioni-personalizzate">Formazioni Personalizzate</a>
        </div>
    </div>

    <div class="mobile-cta">
        <a href="contatti" class="cta-btn">Contattaci</a>
    </div>
</div>
