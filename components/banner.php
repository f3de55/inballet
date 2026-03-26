<?php
// Banner Evento Prossimo - Logica PHP
date_default_timezone_set('Europe/Rome');
$EVENTI_FILE = __DIR__ . '/../data/eventi.json';
$eventoBanner = null;
$eventoTimestamp = 0;

if (file_exists($EVENTI_FILE)) {
    $eventi = json_decode(file_get_contents($EVENTI_FILE), true) ?: [];
    $adesso = time();

    // Filtra eventi futuri e ordina per data più vicina
    $eventiFuturi = array_filter($eventi, function($e) use ($adesso) {
        if (empty($e['data'])) return false;
        $dt = $e['data'] . ' ' . (!empty($e['ora']) ? $e['ora'] : '23:59');
        return strtotime($dt) >= $adesso;
    });

    usort($eventiFuturi, function($a, $b) {
        $dtA = strtotime($a['data'] . ' ' . (!empty($a['ora']) ? $a['ora'] : '23:59'));
        $dtB = strtotime($b['data'] . ' ' . (!empty($b['ora']) ? $b['ora'] : '23:59'));
        return $dtA - $dtB;
    });

    if (!empty($eventiFuturi)) {
        $eventoBanner = array_values($eventiFuturi)[0];
        // Calcola timestamp Unix dell'evento (in millisecondi per JS)
        $dt = $eventoBanner['data'] . ' ' . (!empty($eventoBanner['ora']) ? $eventoBanner['ora'] : '23:59');
        $eventoTimestamp = strtotime($dt) * 1000;
    }
}

// Formatta data per il banner
$bannerData = '';
$bannerDesc = '';
if ($eventoBanner) {
    $giorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    $mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    $d = strtotime($eventoBanner['data']);
    $bannerData = $giorni[date('w', $d)] . ' ' . date('j', $d) . ' ' . $mesi[date('n', $d) - 1];
    if (!empty($eventoBanner['ora'])) {
        $bannerData .= ' • ' . $eventoBanner['ora'];
    }

    // Titolo troncato (max 20 caratteri)
    $bannerTitolo = $eventoBanner['titolo'];
    if (mb_strlen($bannerTitolo) > 20) {
        $bannerTitolo = mb_substr($bannerTitolo, 0, 20) . '...';
    }
}
?>

<?php if ($eventoBanner): ?>
<!-- Banner Evento Prossimo -->
<div class="event-banner" id="eventBanner"
     data-evento-id="<?= htmlspecialchars($eventoBanner['id']) ?>"
     data-evento-ts="<?= $eventoTimestamp ?>">
    <div class="event-banner-content">
        <div class="event-banner-icon"><i class="fas fa-calendar-alt"></i></div>
        <div class="event-banner-info">
            <div class="event-banner-title"><?= htmlspecialchars($bannerTitolo) ?></div>
            <div class="event-banner-meta">
                <span class="event-banner-date"><?= $bannerData ?></span>
            </div>
            <a href="spettacoli-eventi?evento=<?= htmlspecialchars($eventoBanner['id']) ?>" class="event-banner-btn">Scopri di più <i class="fas fa-arrow-right"></i></a>
        </div>
        <button class="event-banner-close" id="bannerClose" aria-label="Chiudi banner"><i class="fas fa-times"></i></button>
    </div>
</div>
<script>
(function(){
    var banner = document.getElementById('eventBanner');
    var eventoId = banner.getAttribute('data-evento-id');
    var eventoTs = parseInt(banner.getAttribute('data-evento-ts'), 10);

    // Verifica se evento è scaduto (confronto timestamp Unix in ms)
    if (eventoTs < Date.now()) {
        banner.remove();
        return;
    }

    // Controlla se è stato già chiuso
    if (localStorage.getItem('banner_dismissed_' + eventoId)) {
        banner.style.display = 'none';
        return;
    }

    // Mostra banner e calcola altezza
    banner.classList.add('visible');
    document.body.classList.add('has-event-banner');

    function updateBannerHeight() {
        var h = banner.offsetHeight;
        document.documentElement.style.setProperty('--banner-height', h + 'px');
    }
    requestAnimationFrame(function() {
        requestAnimationFrame(updateBannerHeight);
    });
    window.addEventListener('resize', updateBannerHeight);

    // Funzione per nascondere banner
    function dismissBanner() {
        localStorage.setItem('banner_dismissed_' + eventoId, '1');
        banner.classList.remove('visible');
        document.body.classList.remove('has-event-banner');
        document.documentElement.style.setProperty('--banner-height', '0px');
    }

    // Chiusura con X
    document.getElementById('bannerClose').onclick = dismissBanner;

    // Chiusura con click su "Scopri di più"
    document.querySelector('.event-banner-btn').onclick = dismissBanner;

    // Auto-rimuovi quando evento scade (controllo ogni minuto)
    var checkInterval = setInterval(function() {
        if (eventoTs < Date.now()) {
            clearInterval(checkInterval);
            banner.classList.remove('visible');
            document.body.classList.remove('has-event-banner');
            document.documentElement.style.setProperty('--banner-height', '0px');
            banner.remove();
        }
    }, 60000);
})();
</script>
<?php endif; ?>
