<div class="footer-main">
    <!-- Logo a sinistra -->
    <div class="footer-logo">
        <img src="assets/images/logo.png" alt="InBallet Logo" />
        <p class="footer-desc">Scuola di danza a Lainate e Rho, dal 2010 formiamo ballerini di tutte le età con passione e professionalità.</p>
        <span>Ente Formativo CSEN • CONI</span>
    </div>

    <!-- Griglia colonne -->
    <div class="footer-grid">
        <div class="footer-col">
            <h4 class="footer-corsi-title" onclick="toggleCorsiModal()">
                CORSI
                <i id="corsiArrow" class="fas fa-chevron-down"></i>
            </h4>
            <h4>LA SCUOLA</h4>
            <a href="chi-siamo">Chi Siamo</a>
            <a href="spettacoli-eventi">Calendario Eventi</a>
            <a href="spettacoli-eventi">Spettacoli ed Eventi</a>
            <a href="collaborazioni-scuole">Collaborazioni con Scuole</a>
            <a href="sportello-psicologico">Sportello Psicologico</a>
        </div>
        <div class="footer-col">
            <h4>PROGETTI</h4>
            <a href="classi-integrate">Classi Multidisciplinari Integrate</a>
            <a href="progetto-noiconvoi">Progetto NoiConVoi</a>
            <a href="sostenitori">Sostenitori Progetti Sociali</a>
        </div>
        <div class="footer-col">
            <h4>FORMAZIONE</h4>
            <a href="formazione-insegnanti">Corso Insegnanti di Danza</a>
            <a href="formazioni-personalizzate">Formazioni Personalizzate</a>
        </div>
        <div class="footer-col" id="contatti">
            <h4>CONTATTI</h4>
            <p><i class="fas fa-phone"></i> <a href="tel:+393937802996">+39 393 780 2996</a></p>
            <p><i class="fas fa-envelope"></i> <a href="mailto:info@inballet.it">info@inballet.it</a></p>
            <p><i class="fas fa-map-marker-alt"></i> <a href="https://www.google.com/maps/search/?api=1&query=Via+Puccini+14+Lainate+MI" target="_blank" rel="noopener">Via Puccini, 14 - Lainate (MI)</a></p>
            <div class="footer-social">
                <a href="https://www.instagram.com/i.n.ballet/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://www.facebook.com/inballetasd/" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
            </div>
        </div>
    </div>
</div>

<!-- Modale CORSI -->
<div id="corsiModal" class="corsi-modal" onclick="closeCorsiModal(event)">
    <div class="corsi-modal-content">
        <div class="corsi-modal-header">
            <h3>I Nostri Corsi</h3>
            <button onclick="toggleCorsiModal()" aria-label="Chiudi"><i class="fas fa-times"></i></button>
        </div>
        <div class="corsi-modal-grid">
            <div>
                <strong>Classica e Moderna</strong>
                <a href="avviamento-danza">Avviamento alla Danza</a>
                <a href="educazione-danza">Educazione alla Danza</a>
                <a href="danza-classica">Danza Classica</a>
                <a href="modern">Modern</a>
            </div>
            <div>
                <strong>Contemporanea</strong>
                <a href="danza-contemporanea">Danza Contemporanea</a>
                <a href="contemporanea-adulti">Contemporanea Adulti</a>
                <a href="contact-improvisation">Contact Improvisation</a>
                <a href="movimento-creativo">Movimento Creativo</a>
            </div>
            <div>
                <strong>Urban Dance</strong>
                <a href="hip-hop">Hip-Hop</a>
                <a href="heels">Heels</a>
                <a href="breaking">Breaking</a>
                <a href="danza-acrobatica">Danza Acrobatica</a>
                <a href="contaminato">Contaminato</a>
            </div>
            <div>
                <strong>Benessere</strong>
                <a href="yoga">Yoga</a>
                <a href="pilates">Pilates</a>
                <a href="classi">Classi</a>
                <a href="lezioni-individuali">Lezioni Individuali</a>
            </div>
            <div>
                <strong>Percorsi per Età</strong>
                <a href="prima-infanzia">Prima Infanzia (3-5 anni)</a>
                <a href="seconda-infanzia">Seconda Infanzia (6-8 anni)</a>
                <a href="ragazzi">Ragazzi (9-16 anni)</a>
                <a href="adulti">Adulti</a>
            </div>
        </div>
    </div>
</div>

<div class="footer-bottom">
    <p>&copy; <?= date('Y') ?> InBallet ASD - Tutti i diritti riservati</p>
</div>

<?php include __DIR__ . '/chatbot.html'; ?>
