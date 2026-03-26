<?php
/**
 * InBallet Dashboard - Gestione Completa
 * Bot Analytics + Calendario Eventi + Predisposta per altro
 */

// === CONFIGURAZIONE ===
date_default_timezone_set('Europe/Rome');

// === AUTENTICAZIONE ===
session_start();

// Verifica se utente è autenticato
if (!isset($_SESSION['dashboard_logged_in']) || $_SESSION['dashboard_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: login.php');
    exit;
}

// === FILE DATI ===
$LOG_FILE = __DIR__ . '/data/analytics.json';
$EVENTI_FILE = __DIR__ . '/data/eventi.json';
$TIPI_FILE = __DIR__ . '/data/tipi_evento.json';
$IMAGES_DIR = __DIR__ . '/assets/images/eventi';

// Assicura directory
if (!is_dir(__DIR__ . '/data')) mkdir(__DIR__ . '/data', 0755, true);
if (!is_dir($IMAGES_DIR)) mkdir($IMAGES_DIR, 0755, true);

// Tipi evento - si parte da zero, nessun default
if (!file_exists($TIPI_FILE)) {
    file_put_contents($TIPI_FILE, json_encode([], JSON_PRETTY_PRINT));
}
$tipiEvento = json_decode(file_get_contents($TIPI_FILE), true) ?: [];

// === API TIPI EVENTO ===
if (isset($_GET['api']) && $_GET['api'] === 'tipi') {
    header('Content-Type: application/json; charset=utf-8');

    // DELETE - Rimuovi tipo (controlla prima di GET per priorità)
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'delete')) {
        $tipoRimuovere = urldecode(trim($_GET['tipo'] ?? ''));
        if (empty($tipoRimuovere)) {
            echo json_encode(['error' => 'Tipo da rimuovere non specificato']);
            exit;
        }

        // Rimuovi tipo dalla lista
        $tipiEvento = array_values(array_filter($tipiEvento, fn($t) => $t !== $tipoRimuovere));
        // Permetti array vuoto - nessun fallback

        if (file_put_contents($TIPI_FILE, json_encode($tipiEvento, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
            echo json_encode(['error' => 'Errore nel salvataggio']);
            exit;
        }

        // Rimuovi il tipo anche da tutti gli eventi esistenti
        if (file_exists($EVENTI_FILE)) {
            $eventi = json_decode(file_get_contents($EVENTI_FILE), true) ?: [];
            $modificato = false;
            foreach ($eventi as &$evento) {
                if (isset($evento['tipo']) && $evento['tipo'] === $tipoRimuovere) {
                    $evento['tipo'] = ''; // Rimuovi il tipo dall'evento
                    $modificato = true;
                }
            }
            unset($evento);
            if ($modificato) {
                file_put_contents($EVENTI_FILE, json_encode($eventi, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
        }

        echo json_encode(['success' => true, 'tipi' => $tipiEvento]);
        exit;
    }

    // GET - Lista tipi (solo senza action)
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['action'])) {
        echo json_encode(['tipi' => $tipiEvento]);
        exit;
    }

    // POST - Aggiungi tipo
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $nuovoTipo = trim($input['tipo'] ?? '');

        if (empty($nuovoTipo)) {
            echo json_encode(['error' => 'Nome tipo obbligatorio']);
            exit;
        }
        if (mb_strlen($nuovoTipo) > 30) {
            echo json_encode(['error' => 'Nome tipo troppo lungo (max 30 caratteri)']);
            exit;
        }
        if (in_array($nuovoTipo, $tipiEvento)) {
            echo json_encode(['error' => 'Tipo già esistente']);
            exit;
        }

        $tipiEvento[] = $nuovoTipo;
        file_put_contents($TIPI_FILE, json_encode($tipiEvento, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'tipi' => $tipiEvento]);
        exit;
    }

    exit;
}

// === API IMMAGINI ===
if (isset($_GET['api']) && $_GET['api'] === 'immagini') {
    header('Content-Type: application/json; charset=utf-8');

    // GET - Lista immagini
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['action'])) {
        $immagini = [];
        if (is_dir($IMAGES_DIR)) {
            $files = glob($IMAGES_DIR . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
            foreach ($files as $file) {
                $immagini[] = [
                    'nome' => basename($file),
                    'path' => 'assets/images/eventi/' . basename($file),
                    'size' => filesize($file),
                    'data' => date('Y-m-d H:i:s', filemtime($file))
                ];
            }
            usort($immagini, fn($a, $b) => strtotime($b['data']) - strtotime($a['data']));
        }
        echo json_encode(['immagini' => $immagini]);
        exit;
    }

    // POST - Upload immagine (supporta multi-upload)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_FILES['immagine'])) {
            echo json_encode(['error' => 'Nessun file caricato']);
            exit;
        }

        $maxSize = 20 * 1024 * 1024; // 20MB
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $immaginiCaricate = [];
        $errori = [];

        // Normalizza array per gestire sia singolo che multiplo
        $files = $_FILES['immagine'];
        if (!is_array($files['name'])) {
            $files = [
                'name' => [$files['name']],
                'type' => [$files['type']],
                'tmp_name' => [$files['tmp_name']],
                'error' => [$files['error']],
                'size' => [$files['size']]
            ];
        }

        for ($i = 0; $i < count($files['name']); $i++) {
            $fileName = $files['name'][$i];
            $tmpName = $files['tmp_name'][$i];
            $fileError = $files['error'][$i];
            $fileSize = $files['size'][$i];

            if ($fileError !== UPLOAD_ERR_OK) {
                $errori[] = "$fileName: errore caricamento";
                continue;
            }
            if ($fileSize > $maxSize) {
                $errori[] = "$fileName: troppo grande (max 20MB)";
                continue;
            }

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $tmpName);
            finfo_close($finfo);

            if (!in_array($mimeType, $allowedTypes)) {
                $errori[] = "$fileName: tipo non supportato";
                continue;
            }

            $ext = pathinfo($fileName, PATHINFO_EXTENSION);
            $nome = 'evt_' . bin2hex(random_bytes(6)) . '.' . strtolower($ext);
            $destPath = $IMAGES_DIR . '/' . $nome;

            if (move_uploaded_file($tmpName, $destPath)) {
                $immaginiCaricate[] = [
                    'nome' => $nome,
                    'path' => 'assets/images/eventi/' . $nome
                ];
            } else {
                $errori[] = "$fileName: errore salvataggio";
            }
        }

        if (count($immaginiCaricate) > 0) {
            echo json_encode([
                'success' => true,
                'immagini' => $immaginiCaricate,
                'immagine' => $immaginiCaricate[0], // Retrocompatibilità
                'errori' => $errori
            ]);
        } else {
            echo json_encode(['error' => count($errori) > 0 ? implode(', ', $errori) : 'Nessun file caricato']);
        }
        exit;
    }

    // DELETE - Elimina immagine
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'delete')) {
        $nomeFile = basename($_GET['file'] ?? '');
        if (empty($nomeFile)) {
            echo json_encode(['error' => 'Nome file non specificato']);
            exit;
        }

        $filePath = $IMAGES_DIR . '/' . $nomeFile;
        if (!file_exists($filePath)) {
            echo json_encode(['error' => 'File non trovato']);
            exit;
        }

        if (!unlink($filePath)) {
            echo json_encode(['error' => 'Errore durante eliminazione']);
            exit;
        }

        echo json_encode(['success' => true]);
        exit;
    }
    exit;
}

// === API EVENTI ===
if (isset($_GET['api']) && $_GET['api'] === 'eventi') {
    header('Content-Type: application/json; charset=utf-8');

    $eventi = file_exists($EVENTI_FILE) ? json_decode(file_get_contents($EVENTI_FILE), true) ?: [] : [];

    // GET - Lista eventi
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['action'])) {
        usort($eventi, fn($a, $b) => strtotime($a['data']) - strtotime($b['data']));
        echo json_encode(['eventi' => $eventi]);
        exit;
    }

    // POST - Salva evento
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $errors = [];
        $warnings = [];

        // === VALIDAZIONI CAMPI OBBLIGATORI ===
        if (!$input) {
            echo json_encode(['error' => 'Dati JSON non validi']);
            exit;
        }

        // Titolo obbligatorio (min 3, max 100 caratteri)
        $titolo = trim($input['titolo'] ?? '');
        if (empty($titolo)) {
            $errors[] = 'Il titolo è obbligatorio';
        } elseif (mb_strlen($titolo) < 3) {
            $errors[] = 'Il titolo deve avere almeno 3 caratteri';
        } elseif (mb_strlen($titolo) > 100) {
            $errors[] = 'Il titolo non può superare i 100 caratteri';
        }

        // Data obbligatoria e formato valido
        $data = trim($input['data'] ?? '');
        $ora = trim($input['ora'] ?? '');

        if (empty($data)) {
            $errors[] = 'La data è obbligatoria';
        } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) {
            $errors[] = 'Formato data non valido (usa YYYY-MM-DD)';
        } else {
            // Costruisci timestamp completo con data e ora
            $dataOraStr = $data;
            if (!empty($ora) && preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $ora)) {
                $dataOraStr .= ' ' . $ora;
            } else {
                $dataOraStr .= ' 23:59'; // Se no ora, considera fine giornata
            }
            $eventoTs = strtotime($dataOraStr);

            if ($eventoTs === false) {
                $errors[] = 'Data non valida';
            } elseif ($eventoTs < time() && empty($input['id'])) {
                // Warning solo per NUOVI eventi nel passato, non per aggiornamenti
                $warnings[] = 'Attenzione: stai inserendo un evento nel passato';
            }
        }

        // Ora (formato valido se presente)
        if (!empty($ora) && !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $ora)) {
            $errors[] = 'Formato ora non valido (usa HH:MM)';
        }

        // Tipo (valori ammessi - usa tipi dinamici dal file JSON)
        $tipo = trim($input['tipo'] ?? '');
        // Cerca match case-insensitive nei tipi esistenti
        $tipoTrovato = null;
        if (!empty($tipo)) {
            foreach ($tipiEvento as $t) {
                if (strtolower($t) === strtolower($tipo)) {
                    $tipoTrovato = $t;
                    break;
                }
            }
        }
        $tipo = $tipoTrovato ?? '';

        // Luogo (max 150 caratteri)
        $luogo = trim($input['luogo'] ?? '');
        if (mb_strlen($luogo) > 150) {
            $errors[] = 'Il luogo non può superare i 150 caratteri';
        }

        // Descrizione (max 1000 caratteri di testo, esclusi tag HTML)
        $descrizione = trim($input['descrizione'] ?? '');
        $descrizioneTestoPuro = strip_tags($descrizione);
        if (mb_strlen($descrizioneTestoPuro) > 1000) {
            $errors[] = 'La descrizione non può superare i 1000 caratteri';
        }

        // Immagine (URL valido se presente)
        $immagine = trim($input['immagine'] ?? '');
        if (!empty($immagine)) {
            // Accetta path relativi o URL assoluti
            if (!preg_match('/^(https?:\/\/|assets\/|images\/|\.\/|\/)/', $immagine)) {
                $warnings[] = 'Il percorso immagine potrebbe non essere valido';
            }
            if (mb_strlen($immagine) > 500) {
                $errors[] = 'URL immagine troppo lungo (max 500 caratteri)';
            }
        }

        // Destinatari (max 100 caratteri)
        $destinatari = trim($input['destinatari'] ?? '');
        if (mb_strlen($destinatari) > 100) {
            $errors[] = 'I destinatari non possono superare i 100 caratteri';
        }

        // Costo (max 50 caratteri)
        $costo = trim($input['costo'] ?? '');
        if (mb_strlen($costo) > 50) {
            $errors[] = 'Il costo non può superare i 50 caratteri';
        }

        // === VERIFICA ERRORI ===
        if (!empty($errors)) {
            echo json_encode(['error' => implode('. ', $errors)]);
            exit;
        }

        // === CHECK DUPLICATI ===
        $eventoId = $input['id'] ?? null;
        foreach ($eventi as $e) {
            // Ignora se è lo stesso evento in modifica
            if ($eventoId && $e['id'] === $eventoId) continue;

            // Stesso titolo + stessa data = probabile duplicato
            if (strtolower($e['titolo']) === strtolower($titolo) && $e['data'] === $data) {
                $warnings[] = 'Esiste già un evento con lo stesso titolo nella stessa data';
                break;
            }
        }

        // === COSTRUISCI EVENTO ===
        // Sanitizza descrizione: permetti solo tag sicuri (bold, corsivo, liste)
        $allowedTags = '<b><strong><i><em><ul><li>';
        $descrizioneClean = strip_tags($descrizione, $allowedTags);
        // Rimuovi attributi potenzialmente pericolosi
        $descrizioneClean = preg_replace('/<([a-z]+)\s+[^>]*>/i', '<$1>', $descrizioneClean);

        $evento = [
            'id' => $eventoId ?? 'evt_' . bin2hex(random_bytes(6)),
            'titolo' => htmlspecialchars(strip_tags($titolo), ENT_QUOTES, 'UTF-8'),
            'data' => $data,
            'ora' => $ora,
            'tipo' => $tipo,
            'luogo' => htmlspecialchars(strip_tags($luogo), ENT_QUOTES, 'UTF-8'),
            'descrizione' => $descrizioneClean,
            'immagine' => htmlspecialchars(strip_tags($immagine), ENT_QUOTES, 'UTF-8'),
            'destinatari' => htmlspecialchars(strip_tags($destinatari), ENT_QUOTES, 'UTF-8'),
            'costo' => htmlspecialchars(strip_tags($costo), ENT_QUOTES, 'UTF-8'),
            'creato' => $eventoId ? ($eventi[array_search($eventoId, array_column($eventi, 'id'))]['creato'] ?? date('c')) : date('c'),
            'modificato' => date('c')
        ];

        // Aggiorna o aggiungi
        $trovato = false;
        foreach ($eventi as $i => $e) {
            if ($e['id'] === $evento['id']) {
                $eventi[$i] = $evento;
                $trovato = true;
                break;
            }
        }
        if (!$trovato) $eventi[] = $evento;

        // Salva con backup atomico
        $tempFile = $EVENTI_FILE . '.tmp';
        $jsonData = json_encode($eventi, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if (file_put_contents($tempFile, $jsonData) !== false) {
            rename($tempFile, $EVENTI_FILE);
        } else {
            echo json_encode(['error' => 'Errore nel salvataggio del file']);
            exit;
        }

        $response = ['success' => true, 'evento' => $evento];
        if (!empty($warnings)) {
            $response['warnings'] = $warnings;
        }
        echo json_encode($response);
        exit;
    }

    // DELETE
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'delete')) {
        $id = trim($_GET['id'] ?? '');

        // Validazione ID
        if (empty($id)) {
            echo json_encode(['error' => 'ID evento mancante']);
            exit;
        }
        if (!preg_match('/^evt_[a-f0-9]{12}$/', $id)) {
            echo json_encode(['error' => 'ID evento non valido']);
            exit;
        }

        // Verifica esistenza
        $eventoEsiste = false;
        foreach ($eventi as $e) {
            if ($e['id'] === $id) {
                $eventoEsiste = true;
                break;
            }
        }
        if (!$eventoEsiste) {
            echo json_encode(['error' => 'Evento non trovato']);
            exit;
        }

        $eventi = array_values(array_filter($eventi, fn($e) => $e['id'] !== $id));

        // Salva con backup atomico
        $tempFile = $EVENTI_FILE . '.tmp';
        $jsonData = json_encode($eventi, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if (file_put_contents($tempFile, $jsonData) !== false) {
            rename($tempFile, $EVENTI_FILE);
        }

        echo json_encode(['success' => true]);
        exit;
    }

    exit;
}

// === CARICA DATI ===
// Bot Analytics
$logs = file_exists($LOG_FILE) ? json_decode(file_get_contents($LOG_FILE), true) ?: [] : [];
$filterFrom = $_GET['from'] ?? date('Y-m-d', strtotime('-30 days'));
$filterTo = $_GET['to'] ?? date('Y-m-d');
$filteredLogs = array_filter($logs, fn($l) => $l['date'] >= $filterFrom && $l['date'] <= $filterTo);

$totalMessages = count($filteredLogs);
$uniqueUsers = count(array_unique(array_column($filteredLogs, 'ip_hash')));
$cachedResponses = count(array_filter($filteredLogs, fn($l) => $l['cached'] ?? false));
$cacheHitRate = $totalMessages > 0 ? round(($cachedResponses / $totalMessages) * 100, 1) : 0;

$messagesByDay = [];
foreach ($filteredLogs as $log) {
    $day = $log['date'];
    $messagesByDay[$day] = ($messagesByDay[$day] ?? 0) + 1;
}
ksort($messagesByDay);

$messagesByHour = array_fill(0, 24, 0);
foreach ($filteredLogs as $log) {
    $hour = $log['hour'] ?? 0;
    $messagesByHour[$hour]++;
}

$topQuestions = [];
foreach ($filteredLogs as $log) {
    if (!empty($log['message']) && ($log['type'] ?? '') !== 'blocked') {
        $q = mb_strtolower(mb_substr(trim($log['message']), 0, 80));
        $topQuestions[$q] = ($topQuestions[$q] ?? 0) + 1;
    }
}
arsort($topQuestions);
$topQuestions = array_slice($topQuestions, 0, 10, true);

// Eventi
$eventi = file_exists($EVENTI_FILE) ? json_decode(file_get_contents($EVENTI_FILE), true) ?: [] : [];
usort($eventi, fn($a, $b) => strtotime($b['data']) - strtotime($a['data']));
$adesso = time();
$eventiFuturi = count(array_filter($eventi, function($e) use ($adesso) {
    $dt = $e['data'] . ' ' . (!empty($e['ora']) ? $e['ora'] : '23:59');
    return strtotime($dt) >= $adesso;
}));
$eventiPassati = count($eventi) - $eventiFuturi;

// Sezione attiva
$sezione = $_GET['s'] ?? 'bot';
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - InBallet</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Francois+One&family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root{--primary:#87CEEB;--primary-dark:#5bb8e0;--bg:#0a0a0a;--bg-card:#141414;--bg-card-2:#1a1a1a;--text:#fff;--text-muted:#888;--success:#4ade80;--warning:#fbbf24;--danger:#f87171;--info:#60a5fa}
        *{margin:0;padding:0;box-sizing:border-box}
        html,body{overflow-x:hidden;max-width:100vw}
        body{font-family:'Rubik','Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex}

        /* Sidebar */
        .sidebar{width:240px;background:var(--bg-card);border-right:1px solid #222;padding:1.5rem 0;display:flex;flex-direction:column;position:fixed;height:100vh;z-index:100}
        .sidebar-logo{padding:0 1.5rem 1.5rem;border-bottom:1px solid #222;margin-bottom:1rem;text-align:center}
        .sidebar-logo img{max-width:140px;height:auto;margin:0 auto}
        .sidebar-logo span{font-size:.75rem;color:var(--text-muted);display:block;margin-top:.5rem}
        .sidebar-nav{flex:1}
        .nav-item{display:flex;align-items:center;gap:.8rem;padding:1rem 1.5rem;color:var(--text-muted);text-decoration:none;transition:all .2s;border-left:3px solid transparent}
        .nav-item:hover{background:rgba(135,206,235,.05);color:var(--text)}
        .nav-item.active{background:rgba(135,206,235,.1);color:var(--primary);border-left-color:var(--primary)}
        .nav-item i{width:20px;text-align:center}
        .nav-divider{height:1px;background:#222;margin:1rem 0}
        .sidebar-header{display:flex;justify-content:flex-end;gap:.5rem;padding:0 1rem 1rem;border-bottom:1px solid #222;margin-bottom:1rem}
        .sidebar-header a{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);text-decoration:none;transition:all .2s;background:rgba(255,255,255,.05)}
        .sidebar-header a:hover{background:rgba(135,206,235,.15);color:var(--primary)}
        .sidebar-header a.logout{color:var(--danger)}
        .sidebar-header a.logout:hover{background:rgba(248,113,113,.15)}

        /* Main */
        .main{flex:1;margin-left:240px;padding:2rem;overflow-x:hidden;max-width:calc(100vw - 240px)}
        .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;flex-wrap:wrap;gap:1rem}
        .header h2{font-size:1.5rem;display:flex;align-items:center;gap:.8rem}
        .header h2 i{color:var(--primary)}

        /* Stats */
        .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem}
        .stat{background:var(--bg-card);padding:1.2rem 1.4rem;border-radius:12px;border:1px solid #222}
        .stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:.8rem;font-size:1rem}
        .stat-icon.blue{background:rgba(135,206,235,.15);color:var(--primary)}
        .stat-icon.green{background:rgba(74,222,128,.15);color:var(--success)}
        .stat-icon.yellow{background:rgba(251,191,36,.15);color:var(--warning)}
        .stat-icon.red{background:rgba(248,113,113,.15);color:var(--danger)}
        .stat-value{font-size:1.75rem;font-weight:700;margin-bottom:.3rem}
        .stat-label{color:var(--text-muted);font-size:.9rem}

        /* Cards */
        .card{background:var(--bg-card);border-radius:12px;border:1px solid #222;margin-bottom:1.5rem}
        .card-header{padding:1.25rem 1.5rem;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center}
        .card-header h3{font-size:1rem;display:flex;align-items:center;gap:.6rem}
        .card-header h3 i{color:var(--primary)}
        .card-body{padding:1.5rem}

        /* Grids */
        .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem}

        /* Filters */
        .filters{display:flex;gap:.8rem;align-items:center;flex-wrap:wrap}
        .filters input,.filters select{padding:.6rem 1rem;border-radius:8px;border:1px solid #333;background:var(--bg-card-2);color:var(--text);font-size:.85rem}
        .filters input:focus,.filters select:focus{outline:none;border-color:var(--primary)}

        /* Buttons */
        .btn{padding:.75rem 1.3rem;border-radius:8px;border:none;cursor:pointer;font-weight:600;font-size:.95rem;transition:all .2s;display:inline-flex;align-items:center;gap:.5rem}
        .btn-primary{background:var(--primary);color:#000}
        .btn-primary:hover{background:var(--primary-dark)}
        .btn-secondary{background:var(--bg-card-2);color:var(--text);border:1px solid #333}
        .btn-secondary:hover{border-color:var(--primary)}
        .btn-danger{background:rgba(248,113,113,.15);color:var(--danger)}
        .btn-danger:hover{background:rgba(248,113,113,.25)}
        .btn-sm{padding:.5rem .8rem;font-size:.8rem}

        /* Table */
        table{width:100%;border-collapse:collapse}
        th,td{padding:1rem 1.1rem;text-align:left;border-bottom:1px solid #222;font-size:.95rem}
        th{color:var(--text-muted);font-weight:500;font-size:.85rem;text-transform:uppercase;letter-spacing:.5px}
        tr:hover{background:rgba(255,255,255,.02)}

        /* Badge */
        .badge{padding:.35rem .8rem;border-radius:20px;font-size:.8rem;font-weight:600;text-transform:uppercase}
        .badge-blue{background:rgba(135,206,235,.15);color:var(--primary)}
        .badge-green{background:rgba(74,222,128,.15);color:var(--success)}
        .badge-yellow{background:rgba(251,191,36,.15);color:var(--warning)}
        .badge-purple{background:rgba(156,39,176,.15);color:#ce93d8}
        .badge-gray{background:rgba(158,158,158,.15);color:#9e9e9e}

        /* Actions */
        .actions{display:flex;gap:.5rem}
        .actions button{width:32px;height:32px;border-radius:6px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .actions .edit{background:rgba(96,165,250,.15);color:var(--info)}
        .actions .edit:hover{background:rgba(96,165,250,.25)}
        .actions .delete{background:rgba(248,113,113,.15);color:var(--danger)}
        .actions .delete:hover{background:rgba(248,113,113,.25)}

        /* Lista domande */
        .question-list{list-style:none}
        .question-list li{display:flex;justify-content:space-between;align-items:center;padding:.8rem 0;border-bottom:1px solid #222;font-size:.9rem}
        .question-list li:last-child{border-bottom:none}
        .question-list .q{flex:1;color:var(--text-muted);margin-right:1rem}
        .question-list .count{background:rgba(135,206,235,.15);color:var(--primary);padding:.25rem .6rem;border-radius:12px;font-size:.75rem;font-weight:600}

        /* Modal */
        .modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:1000;align-items:center;justify-content:center;padding:1rem}
        .modal.open{display:flex}
        .modal-box{background:#1f1f1f;border-radius:16px;max-width:720px;width:100%;max-height:90vh;overflow-y:auto}
        .modal-header{padding:1.5rem;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center}
        .modal-header h3{font-size:1.1rem}
        .modal-close{width:32px;height:32px;border-radius:50%;background:#222;border:none;color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center}
        .modal-close:hover{background:#333}
        .modal-body{padding:1.5rem}
        .form-group{margin-bottom:1.2rem}
        .form-group label{display:block;margin-bottom:.5rem;color:var(--text-muted);font-size:.85rem}
        .form-group input,.form-group select,.form-group textarea{width:100%;padding:.8rem 1rem;border-radius:8px;border:1px solid #333;background:var(--bg);color:var(--text);font-size:.95rem}
        .form-group input[type="date"],.form-group input[type="time"]{color-scheme:dark}
        .form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:var(--primary)}
        .form-group textarea{resize:vertical;min-height:80px}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .modal-footer{padding:1rem 1.5rem;border-top:1px solid #222;display:flex;justify-content:flex-end;gap:.8rem}

        /* Tipo con gestione */
        .tipo-wrapper{display:flex;gap:.5rem}
        .tipo-wrapper select{flex:1}
        .tipo-wrapper .btn-icon{width:40px;height:40px;padding:0;display:flex;align-items:center;justify-content:center;flex-shrink:0}

        /* Gestione tipi modal */
        .tipi-list{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}
        .tipo-tag{display:flex;align-items:center;gap:.4rem;padding:.4rem .8rem;background:rgba(135,206,235,.15);border-radius:20px;font-size:.8rem;color:var(--primary)}
        .tipo-tag .remove{width:18px;height:18px;border-radius:50%;background:rgba(248,113,113,.3);border:none;color:var(--danger);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.7rem}
        .tipo-tag .remove:hover{background:rgba(248,113,113,.5)}

        /* Immagini grid */
        .images-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-top:.8rem;max-height:150px;overflow-y:auto;padding:.25rem}
        .img-item{position:relative;width:100%;padding-bottom:100%;border-radius:6px;overflow:hidden;cursor:pointer;border:2px solid transparent;transition:all .2s}
        .img-item:hover{border-color:rgba(135,206,235,.5)}
        .img-item.selected{border-color:var(--primary);box-shadow:0 0 0 2px rgba(135,206,235,.3)}
        .img-item img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover}
        .img-item .delete-img{position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:rgba(248,113,113,.9);border:none;color:#fff;cursor:pointer;display:none;align-items:center;justify-content:center;font-size:.6rem}
        .img-item:hover .delete-img{display:flex}
        .upload-zone{border:2px dashed #333;border-radius:8px;padding:.8rem;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:.5rem;display:flex;align-items:center;justify-content:center;gap:.8rem}
        .upload-zone:hover{border-color:var(--primary);background:rgba(135,206,235,.05)}
        .upload-zone i{font-size:1.2rem;color:var(--text-muted)}
        .upload-zone p{color:var(--text-muted);font-size:.8rem;margin:0}
        .upload-zone input{display:none}

        /* Editor WYSIWYG minimale */
        .editor-wrapper{border:1px solid #333;border-radius:8px;overflow:hidden;background:var(--bg)}
        .editor-toolbar{display:flex;gap:.25rem;padding:.5rem;background:var(--bg-card-2);border-bottom:1px solid #333}
        .editor-toolbar button{width:32px;height:32px;border:none;border-radius:6px;background:transparent;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .editor-toolbar button:hover{background:rgba(135,206,235,.15);color:var(--primary)}
        .editor-toolbar button.active{background:rgba(135,206,235,.2);color:var(--primary)}
        .editor-toolbar .separator{width:1px;background:#333;margin:0 .25rem}
        .editor-content{min-height:100px;max-height:200px;overflow-y:auto;padding:.8rem 1rem;color:var(--text);font-size:.95rem;line-height:1.6}
        .editor-content:focus{outline:none}
        .editor-content:empty:before{content:attr(data-placeholder);color:var(--text-muted)}
        .editor-content ul{margin:.5rem 0;padding-left:1.5rem}
        .editor-content li{margin:.25rem 0}

        /* Toast */
        #toast-container{position:fixed;top:2rem;left:50%;transform:translateX(-50%);z-index:2000;display:flex;flex-direction:column;gap:.8rem;min-width:300px}
        .toast{padding:1rem 1.5rem;border-radius:10px;font-weight:500;display:flex;align-items:center;gap:.8rem;animation:slideDown .3s;box-shadow:0 4px 12px rgba(0,0,0,.15)}
        @keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        .toast.success{background:var(--success);color:#000}
        .toast.error{background:var(--danger);color:#fff}
        .toast.warning{background:var(--warning);color:#000}

        /* Tabs interne */
        .tabs{display:flex;gap:.5rem;margin-bottom:1.5rem}
        .tab{padding:.6rem 1.2rem;background:transparent;border:none;color:var(--text-muted);cursor:pointer;border-radius:8px;font-weight:500;transition:all .2s}
        .tab.active{background:rgba(135,206,235,.15);color:var(--primary)}
        .tab:hover:not(.active){background:rgba(255,255,255,.05)}

        /* Empty */
        .empty{text-align:center;padding:3rem;color:var(--text-muted)}
        .empty i{font-size:2.5rem;margin-bottom:1rem;opacity:.3}

        /* Hamburger menu */
        .hamburger{display:none;position:fixed;top:1rem;right:1rem;z-index:200;width:44px;height:44px;border-radius:10px;background:var(--bg-card);border:1px solid #333;cursor:pointer;flex-direction:column;align-items:center;justify-content:center;gap:5px}
        .hamburger span{display:block;width:20px;height:2px;background:var(--text);border-radius:2px;transition:all .2s}
        .hamburger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
        .hamburger.open span:nth-child(2){opacity:0}
        .hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}
        .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99}
        .sidebar-overlay.open{display:block}

        /* Tabella wrapper per scroll */
        .table-wrapper{overflow-x:auto;margin:0 -1rem;padding:0 1rem}
        .table-wrapper table{min-width:600px}

        /* Responsive - prevenire layout shift */
        .sidebar,.main,.modal-box{transition:none}

        @media(max-width:900px){
            .sidebar{width:60px}
            .sidebar-logo span,.nav-item span{display:none}
            .sidebar-logo{padding:0 .5rem 1rem}
            .sidebar-logo img{max-width:40px}
            .sidebar-header{justify-content:center;padding:0 .5rem 1rem}
            .sidebar-header a{width:30px;height:30px}
            .nav-item{justify-content:center;padding:1rem .5rem}
            .main{margin-left:60px;padding:1.5rem;max-width:calc(100vw - 60px)}
            .grid-2{grid-template-columns:1fr}
            .header{flex-direction:column;align-items:flex-start}
            .filters{width:100%}
            .filters input[type="date"]{flex:1;min-width:0}
            .modal-box{max-width:90vw}
        }
        @media(max-width:600px){
            .hamburger{display:flex}
            .sidebar{position:fixed;left:-240px;width:240px;transition:left .3s;z-index:150}
            .sidebar.open{left:0}
            .sidebar-logo span,.nav-item span{display:block}
            .sidebar-logo{padding:0 1.5rem 1.5rem}
            .sidebar-logo img{max-width:140px}
            .sidebar-header{justify-content:flex-end;padding:0 1rem 1rem}
            .sidebar-header a{width:36px;height:36px}
            .nav-item{justify-content:flex-start;padding:1rem 1.5rem}
            .main{margin-left:0;padding:1rem;padding-top:4rem;max-width:100vw}
            .stats{display:flex;flex-wrap:wrap;gap:.8rem}
            .stat{flex:1 1 calc(50% - .4rem);min-width:140px}
            .form-row{grid-template-columns:1fr}
            .header h2{font-size:1.3rem}
            .modal{padding:.5rem;align-items:flex-end}
            .modal-box{margin:0;max-height:95vh;max-width:100%;border-radius:16px 16px 0 0}
            .modal-body{padding:1rem}
            .card-header{flex-direction:column;gap:.8rem;align-items:flex-start}
            .card-header input{width:100%}
            .card-body{padding:0}
            table{font-size:.9rem}
            th,td{padding:.7rem .6rem}
            .actions{flex-wrap:nowrap}
            .actions button{width:30px;height:30px;flex-shrink:0}
            .images-grid{grid-template-columns:repeat(3,1fr)}
            .btn{padding:.65rem 1rem;font-size:.9rem}
            .tabs{flex-wrap:wrap}
            .tab{padding:.55rem .9rem;font-size:.9rem}
        }
        @media(max-width:400px){
            .stat{flex:1 1 100%}
            .images-grid{grid-template-columns:repeat(2,1fr)}
            .modal-body{padding:.8rem}
            .form-group{margin-bottom:1rem}
        }

        ::-webkit-scrollbar{width:8px;height:8px}
        ::-webkit-scrollbar-track{background:var(--bg)}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:4px}
    </style>
</head>
<body>
    <!-- Hamburger menu mobile -->
    <button class="hamburger" onclick="toggleSidebar()">
        <span></span><span></span><span></span>
    </button>
    <div class="sidebar-overlay" onclick="toggleSidebar()"></div>

    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <a href="index.html" target="_blank" title="Vai al sito"><i class="fas fa-external-link-alt"></i></a>
        </div>
        <div class="sidebar-logo">
            <img src="./assets/images/logo.png" alt="InBallet Logo">
            <span>Dashboard Admin</span>
        </div>
        <nav class="sidebar-nav">
            <a href="?s=bot" class="nav-item <?= $sezione === 'bot' ? 'active' : '' ?>">
                <i class="fas fa-robot"></i><span>Chatbot</span>
            </a>
            <a href="?s=eventi" class="nav-item <?= $sezione === 'eventi' ? 'active' : '' ?>">
                <i class="fas fa-calendar-alt"></i><span>Eventi</span>
            </a>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="main">

        <?php if ($sezione === 'bot'): ?>
        <!-- ========== SEZIONE BOT ========== -->
        <div class="header">
            <h2><i class="fas fa-robot"></i> Analytics Chatbot</h2>
            <form class="filters" method="GET">
                <input type="hidden" name="s" value="bot">
                <input type="date" name="from" value="<?= htmlspecialchars($filterFrom) ?>">
                <span style="color:var(--text-muted)">-</span>
                <input type="date" name="to" value="<?= htmlspecialchars($filterTo) ?>">
                <button type="submit" class="btn btn-primary"><i class="fas fa-filter"></i> Filtra</button>
            </form>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-icon blue"><i class="fas fa-comments"></i></div>
                <div class="stat-value"><?= number_format($totalMessages) ?></div>
                <div class="stat-label">Messaggi Totali</div>
            </div>
            <div class="stat">
                <div class="stat-icon green"><i class="fas fa-users"></i></div>
                <div class="stat-value"><?= number_format($uniqueUsers) ?></div>
                <div class="stat-label">Utenti Unici</div>
            </div>
            <div class="stat">
                <div class="stat-icon yellow"><i class="fas fa-bolt"></i></div>
                <div class="stat-value"><?= $cacheHitRate ?>%</div>
                <div class="stat-label">Cache Hit Rate</div>
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-header"><h3><i class="fas fa-chart-line"></i> Messaggi per Giorno</h3></div>
                <div class="card-body"><canvas id="chartDaily" height="200"></canvas></div>
            </div>
            <div class="card">
                <div class="card-header"><h3><i class="fas fa-clock"></i> Messaggi per Ora</h3></div>
                <div class="card-body"><canvas id="chartHourly" height="200"></canvas></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h3><i class="fas fa-question-circle"></i> Domande Frequenti</h3></div>
            <div class="card-body">
                <?php if (empty($topQuestions)): ?>
                <div class="empty"><i class="fas fa-inbox"></i><p>Nessun dato disponibile</p></div>
                <?php else: ?>
                <ul class="question-list">
                    <?php foreach ($topQuestions as $q => $c): ?>
                    <li><span class="q"><?= htmlspecialchars($q) ?></span><span class="count"><?= $c ?></span></li>
                    <?php endforeach; ?>
                </ul>
                <?php endif; ?>
            </div>
        </div>

        <script>
        Chart.defaults.color='#888';Chart.defaults.borderColor='#222';
        new Chart(document.getElementById('chartDaily'),{type:'line',data:{labels:<?= json_encode(array_keys($messagesByDay)) ?>,datasets:[{label:'Messaggi',data:<?= json_encode(array_values($messagesByDay)) ?>,borderColor:'#87CEEB',backgroundColor:'rgba(135,206,235,.1)',fill:true,tension:.4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#222'}},x:{grid:{display:false}}}}});
        new Chart(document.getElementById('chartHourly'),{type:'bar',data:{labels:<?= json_encode(array_map(fn($h)=>sprintf('%02d:00',$h),range(0,23))) ?>,datasets:[{label:'Messaggi',data:<?= json_encode(array_values($messagesByHour)) ?>,backgroundColor:'rgba(135,206,235,.5)',borderColor:'#87CEEB',borderWidth:1,borderRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#222'}},x:{grid:{display:false}}}}});
        </script>

        <?php elseif ($sezione === 'eventi'): ?>
        <!-- ========== SEZIONE EVENTI ========== -->
        <div class="header">
            <h2><i class="fas fa-calendar-alt"></i> Gestione Eventi</h2>
        </div>

        <div style="display:flex;gap:.8rem;margin-bottom:1.5rem">
            <button class="btn btn-primary" onclick="apriModal()"><i class="fas fa-plus"></i> Nuovo Evento</button>
            <a href="/spettacoli-eventi/" target="_blank" class="btn btn-secondary" style="text-decoration:none"><i class="fas fa-external-link-alt"></i> Vedi Calendario</a>
        </div>

        <?php if (count($eventi) > 0): ?>
        <div class="stats">
            <div class="stat">
                <div class="stat-icon blue"><i class="fas fa-calendar"></i></div>
                <div class="stat-value"><?= count($eventi) ?></div>
                <div class="stat-label">Eventi Totali</div>
            </div>
            <?php if ($eventiFuturi > 0): ?>
            <div class="stat">
                <div class="stat-icon green"><i class="fas fa-clock"></i></div>
                <div class="stat-value"><?= $eventiFuturi ?></div>
                <div class="stat-label">In Programma</div>
            </div>
            <?php endif; ?>
            <?php if ($eventiPassati > 0): ?>
            <div class="stat">
                <div class="stat-icon yellow"><i class="fas fa-history"></i></div>
                <div class="stat-value"><?= $eventiPassati ?></div>
                <div class="stat-label">Passati</div>
            </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        <?php if (!empty($eventi)): ?>
        <div class="tabs">
            <button class="tab active" onclick="filtraEventi('tutti')">Tutti</button>
            <?php if ($eventiFuturi > 0): ?>
            <button class="tab" onclick="filtraEventi('futuri')">In Programma</button>
            <?php endif; ?>
            <?php if ($eventiPassati > 0): ?>
            <button class="tab" onclick="filtraEventi('passati')">Passati</button>
            <?php endif; ?>
        </div>

        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-list"></i> Lista Eventi</h3>
                <input type="text" id="searchEventi" placeholder="Cerca..." style="padding:.5rem 1rem;border-radius:8px;border:1px solid #333;background:var(--bg);color:var(--text);font-size:.85rem" onkeyup="cercaEventi()">
            </div>
            <div class="card-body" style="padding:0">
                <div class="table-wrapper">
                <table>
                    <thead>
                        <tr><th>Evento</th><th style="width:100px">Azioni</th><th>Data</th><th>Tipo</th><th>Luogo</th></tr>
                    </thead>
                    <tbody id="eventiBody">
                        <?php foreach ($eventi as $ev):
                            // Controlla se evento è passato considerando anche l'orario
                            $eventoDateTime = $ev['data'] . ' ' . (!empty($ev['ora']) ? $ev['ora'] : '23:59');
                            $isPassato = strtotime($eventoDateTime) < time();
                        ?>
                        <tr class="evento-row <?= $isPassato ? 'passato' : 'futuro' ?>" data-id="<?= $ev['id'] ?>">
                            <td>
                                <strong><?= htmlspecialchars($ev['titolo']) ?></strong>
                                <?php if (!empty($ev['ora'])): ?><br><small style="color:var(--text-muted)"><i class="fas fa-clock"></i> <?= $ev['ora'] ?></small><?php endif; ?>
                            </td>
                            <td>
                                <div class="actions">
                                    <button class="edit" onclick='modificaEvento(<?= json_encode($ev) ?>)' title="Modifica"><i class="fas fa-edit"></i></button>
                                    <button class="delete" onclick="eliminaEvento('<?= $ev['id'] ?>','<?= htmlspecialchars(addslashes($ev['titolo'])) ?>')" title="Elimina"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                            <td style="color:var(--primary)"><?= date('d/m/Y', strtotime($ev['data'])) ?><?php if ($isPassato): ?> <span class="badge badge-gray">Passato</span><?php endif; ?></td>
                            <td><?php if (!empty($ev['tipo'])): ?><span class="badge badge-blue"><?= htmlspecialchars($ev['tipo']) ?></span><?php else: ?>-<?php endif; ?></td>
                            <td style="color:var(--text-muted)"><?= htmlspecialchars($ev['luogo'] ?? '-') ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                </div>
            </div>
        </div>
        <?php else: ?>
        <div class="card">
            <div class="card-body">
                <div class="empty">
                    <i class="fas fa-calendar-plus"></i>
                    <p>Nessun evento presente</p>
                    <p style="font-size:.85rem;margin-top:.5rem">Clicca "Nuovo Evento" per aggiungere il primo evento.</p>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Modal Evento -->
        <div class="modal" id="modalEvento">
            <div class="modal-box">
                <div class="modal-header">
                    <h3 id="modalTitle">Nuovo Evento</h3>
                    <button class="modal-close" onclick="chiudiModal()"><i class="fas fa-times"></i></button>
                </div>
                <form id="formEvento" onsubmit="salvaEvento(event)">
                    <div class="modal-body">
                        <input type="hidden" id="eventoId">
                        <div class="form-group">
                            <label>Titolo * <small style="color:var(--text-muted);font-weight:400">(3-100 caratteri)</small></label>
                            <input type="text" id="titolo" required placeholder="Es: Workshop Hip-Hop" maxlength="100" oninput="updateCounter(this, 100)">
                            <small class="char-counter" id="titolo-counter" style="color:var(--text-muted);font-size:.75rem"></small>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Data *</label>
                                <input type="date" id="data" required>
                            </div>
                            <div class="form-group">
                                <label>Ora</label>
                                <input type="time" id="ora">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group" id="tipoFormGroup">
                                <label>Tipo <?php if (!empty($tipiEvento)): ?><button type="button" class="btn btn-sm" id="tipoCogBtn" style="margin-left:.5rem;padding:.2rem .5rem;font-size:.7rem" onclick="apriModalTipi()"><i class="fas fa-cog"></i></button><?php endif; ?></label>
                                <select id="tipo" <?= empty($tipiEvento) ? 'style="display:none"' : '' ?>>
                                    <?php foreach ($tipiEvento as $t): ?>
                                    <option value="<?= htmlspecialchars($t) ?>"><?= htmlspecialchars($t) ?></option>
                                    <?php endforeach; ?>
                                </select>
                                <span id="noTipoMsg" style="color:var(--text-muted);font-size:.85rem;<?= empty($tipiEvento) ? '' : 'display:none' ?>">Nessun tipo creato. <a href="#" onclick="apriModalTipi();return false" style="color:var(--primary)">Aggiungi tipo</a></span>
                            </div>
                            <div class="form-group">
                                <label>Luogo</label>
                                <input type="text" id="luogo" placeholder="Es: Sede Lainate" maxlength="150">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Descrizione <small style="color:var(--text-muted);font-weight:400">(max 1000 caratteri)</small></label>
                            <div class="editor-wrapper">
                                <div class="editor-toolbar">
                                    <button type="button" onclick="formatText('bold')" title="Grassetto (Ctrl+B)"><i class="fas fa-bold"></i></button>
                                    <button type="button" onclick="formatText('italic')" title="Corsivo (Ctrl+I)"><i class="fas fa-italic"></i></button>
                                    <div class="separator"></div>
                                    <button type="button" onclick="formatText('insertUnorderedList')" title="Elenco puntato"><i class="fas fa-list-ul"></i></button>
                                </div>
                                <div class="editor-content" id="descrizione" contenteditable="true" data-placeholder="Descrizione evento..." oninput="updateEditorCounter()"></div>
                            </div>
                            <small class="char-counter" id="descrizione-counter" style="color:var(--text-muted);font-size:.75rem"></small>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Destinatari</label>
                                <input type="text" id="destinatari" placeholder="Es: Tutti i livelli" maxlength="100">
                            </div>
                            <div class="form-group">
                                <label>Costo</label>
                                <input type="text" id="costo" placeholder="Es: Gratuito / 15€" maxlength="50">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Immagine</label>
                            <input type="hidden" id="immagine">
                            <div class="upload-zone" onclick="document.getElementById('fileInput').click()">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Clicca per caricare (max 20MB, multiplo)</p>
                                <input type="file" id="fileInput" accept="image/jpeg,image/png,image/gif,image/webp" multiple onchange="uploadImmagini(this)">
                            </div>
                            <div class="images-grid" id="imagesGrid"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="chiudiModal()">Annulla</button>
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Salva</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal Gestione Tipi -->
        <div class="modal" id="modalTipi">
            <div class="modal-box" style="max-width:400px">
                <div class="modal-header">
                    <h3>Gestione Tipi Evento</h3>
                    <button class="modal-close" onclick="chiudiModalTipi()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Tipi esistenti</label>
                        <div class="tipi-list" id="tipiList"></div>
                    </div>
                    <div class="form-group">
                        <label>Aggiungi nuovo tipo</label>
                        <div style="display:flex;gap:.5rem">
                            <input type="text" id="nuovoTipo" placeholder="Es: Masterclass" maxlength="30" style="flex:1">
                            <button type="button" class="btn btn-primary" onclick="aggiungiTipo()"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
        function updateCounter(el, max) {
            const counter = document.getElementById(el.id + '-counter');
            if (counter) {
                const len = el.value.length;
                counter.textContent = `${len}/${max}`;
                counter.style.color = len > max * 0.9 ? 'var(--warning)' : 'var(--text-muted)';
            }
        }

        // === EDITOR WYSIWYG ===
        function formatText(command) {
            document.execCommand(command, false, null);
            document.getElementById('descrizione').focus();
            updateToolbarState();
        }

        function updateToolbarState() {
            const toolbar = document.querySelector('.editor-toolbar');
            if (!toolbar) return;
            toolbar.querySelectorAll('button').forEach(btn => {
                const cmd = btn.getAttribute('onclick')?.match(/formatText\('(\w+)'\)/)?.[1];
                if (cmd) {
                    btn.classList.toggle('active', document.queryCommandState(cmd));
                }
            });
        }

        function updateEditorCounter() {
            const editor = document.getElementById('descrizione');
            const counter = document.getElementById('descrizione-counter');
            if (editor && counter) {
                const text = editor.innerText || '';
                const len = text.length;
                counter.textContent = `${len}/1000`;
                counter.style.color = len > 900 ? 'var(--warning)' : 'var(--text-muted)';
            }
            updateToolbarState();
        }

        // Keyboard shortcuts per editor
        document.addEventListener('keydown', function(e) {
            const editor = document.getElementById('descrizione');
            if (document.activeElement !== editor) return;

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'b') { e.preventDefault(); formatText('bold'); }
                if (e.key === 'i') { e.preventDefault(); formatText('italic'); }
            }
        });

        // Aggiorna stato toolbar su selezione
        document.addEventListener('selectionchange', updateToolbarState);

        function apriModal(ev=null){
            document.getElementById('modalEvento').classList.add('open');
            document.getElementById('modalTitle').textContent=ev?'Modifica Evento':'Nuovo Evento';
            if(ev){
                document.getElementById('eventoId').value=ev.id;
                document.getElementById('titolo').value=ev.titolo;
                document.getElementById('data').value=ev.data;
                document.getElementById('ora').value=ev.ora||'';
                if (tipiEvento.length > 0) {
                    document.getElementById('tipo').value = ev.tipo && tipiEvento.includes(ev.tipo) ? ev.tipo : tipiEvento[0];
                }
                document.getElementById('luogo').value=ev.luogo||'';
                document.getElementById('descrizione').innerHTML=ev.descrizione||'';
                document.getElementById('immagine').value=ev.immagine||'';
                document.getElementById('destinatari').value=ev.destinatari||'';
                document.getElementById('costo').value=ev.costo||'';
            }else{
                document.getElementById('formEvento').reset();
                document.getElementById('eventoId').value='';
                document.getElementById('descrizione').innerHTML='';
            }
            // Aggiorna contatori
            updateCounter(document.getElementById('titolo'), 100);
            updateEditorCounter();
        }
        function modificaEvento(ev){apriModal(ev)}
        function chiudiModal(){document.getElementById('modalEvento').classList.remove('open')}
        document.getElementById('modalEvento').onclick=e=>{if(e.target.id==='modalEvento')chiudiModal()};
        document.onkeydown=e=>{if(e.key==='Escape')chiudiModal()};

        async function salvaEvento(e){
            e.preventDefault();

            // Validazione frontend
            const titolo = document.getElementById('titolo').value.trim();
            const data = document.getElementById('data').value;

            if (titolo.length < 3) {
                toast('Il titolo deve avere almeno 3 caratteri', 'error');
                return;
            }
            if (!data) {
                toast('La data è obbligatoria', 'error');
                return;
            }

            const descrizioneText = document.getElementById('descrizione').innerText || '';
            if (descrizioneText.length > 1000) {
                toast('La descrizione non può superare i 1000 caratteri', 'error');
                return;
            }

            const ev={
                id: document.getElementById('eventoId').value || undefined,
                titolo: titolo,
                data: data,
                ora: document.getElementById('ora').value,
                tipo: document.getElementById('tipo').value,
                luogo: document.getElementById('luogo').value.trim(),
                descrizione: document.getElementById('descrizione').innerHTML.trim(),
                immagine: document.getElementById('immagine').value.trim(),
                destinatari: document.getElementById('destinatari').value.trim(),
                costo: document.getElementById('costo').value.trim()
            };

            try{
                const r=await fetch('dashboard.php?api=eventi',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ev)});
                const d=await r.json();
                if(d.success){
                    // Mostra warnings se presenti (solo unici)
                    if(d.warnings && d.warnings.length > 0){
                        const uniqueWarnings = [...new Set(d.warnings)];
                        uniqueWarnings.forEach(w => toast(w, 'warning'));
                    }
                    toast('Evento salvato!','success');
                    chiudiModal();
                    setTimeout(()=>location.reload(),1200);
                }
                else toast(d.error||'Errore nel salvataggio','error');
            }catch(err){toast('Errore di connessione','error')}
        }

        async function eliminaEvento(id,titolo){
            if(!confirm(`Sei sicuro di voler eliminare l'evento "${titolo}"?\n\nQuesta azione non può essere annullata.`))return;
            try{
                const r=await fetch(`dashboard.php?api=eventi&action=delete&id=${encodeURIComponent(id)}`);
                const d=await r.json();
                if(d.success){
                    toast('Evento eliminato con successo!','success');
                    const row = document.querySelector(`[data-id="${id}"]`);
                    if(row) {
                        row.style.transition = 'opacity 0.3s, transform 0.3s';
                        row.style.opacity = '0';
                        row.style.transform = 'translateX(-20px)';
                        setTimeout(() => row.remove(), 300);
                    }
                    // Aggiorna contatori stat
                    setTimeout(() => location.reload(), 1000);
                }
                else toast(d.error||'Errore durante l\'eliminazione','error');
            }catch(err){toast('Errore di connessione','error')}
        }

        function filtraEventi(tipo){
            document.querySelectorAll('.tabs .tab').forEach(t=>t.classList.remove('active'));
            event.target.classList.add('active');
            document.querySelectorAll('.evento-row').forEach(r=>{
                if(tipo==='tutti')r.style.display='';
                else if(tipo==='futuri')r.style.display=r.classList.contains('futuro')?'':'none';
                else r.style.display=r.classList.contains('passato')?'':'none';
            });
        }

        function cercaEventi(){
            const q=document.getElementById('searchEventi').value.toLowerCase();
            document.querySelectorAll('.evento-row').forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?'':'none');
        }

        function toast(msg,tipo){
            let container = document.getElementById('toast-container');
            if(!container){
                container = document.createElement('div');
                container.id = 'toast-container';
                document.body.appendChild(container);
            }
            const t=document.createElement('div');
            t.className=`toast ${tipo}`;
            const icons = {success:'check-circle', error:'times-circle', warning:'exclamation-triangle'};
            t.innerHTML=`<i class="fas fa-${icons[tipo]||'info-circle'}"></i> ${msg}`;
            container.appendChild(t);
            setTimeout(()=>t.remove(), tipo==='warning' ? 5000 : 3000);
        }

        // === GESTIONE IMMAGINI ===
        let immaginiCaricate = [];
        let immagineSelezionata = '';

        async function caricaImmagini(){
            try{
                const r = await fetch('dashboard.php?api=immagini');
                const d = await r.json();
                immaginiCaricate = d.immagini || [];
                renderImmagini();
            }catch(e){console.error('Errore caricamento immagini',e)}
        }

        function renderImmagini(){
            const grid = document.getElementById('imagesGrid');
            if(!grid) return;
            if(immaginiCaricate.length === 0){
                grid.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;grid-column:1/-1">Nessuna immagine caricata</p>';
                return;
            }
            grid.innerHTML = immaginiCaricate.map(img => `
                <div class="img-item ${img.path === immagineSelezionata ? 'selected' : ''}" onclick="selezionaImmagine('${img.path}')">
                    <img src="${img.path}" alt="${img.nome}">
                    <button type="button" class="delete-img" onclick="event.stopPropagation();eliminaImmagine('${img.nome}')" title="Elimina"><i class="fas fa-times"></i></button>
                </div>
            `).join('');
        }

        function selezionaImmagine(path){
            // Toggle: se clicco su immagine già selezionata, la deseleziono
            if(immagineSelezionata === path){
                immagineSelezionata = '';
                document.getElementById('immagine').value = '';
            } else {
                immagineSelezionata = path;
                document.getElementById('immagine').value = path;
            }
            renderImmagini();
        }

        async function uploadImmagini(input){
            if(!input.files || input.files.length === 0) return;

            const maxSize = 20 * 1024 * 1024; // 20MB
            const formData = new FormData();
            let filesValidi = 0;

            for(let i = 0; i < input.files.length; i++){
                const file = input.files[i];
                if(file.size > maxSize){
                    toast(`${file.name}: troppo grande (max 20MB)`,'error');
                    continue;
                }
                formData.append('immagine[]', file);
                filesValidi++;
            }

            if(filesValidi === 0){
                input.value = '';
                return;
            }

            try{
                const r = await fetch('dashboard.php?api=immagini', {method:'POST', body:formData});
                const d = await r.json();
                if(d.success){
                    const count = d.immagini ? d.immagini.length : 1;
                    toast(`${count} immagin${count > 1 ? 'i caricate' : 'e caricata'}!`,'success');
                    // Aggiungi tutte le immagini caricate
                    if(d.immagini){
                        d.immagini.forEach(img => immaginiCaricate.unshift(img));
                    } else if(d.immagine){
                        immaginiCaricate.unshift(d.immagine);
                    }
                    // Seleziona solo la prima immagine caricata (evento può avere solo 1 immagine)
                    if(d.immagini && d.immagini[0]){
                        selezionaImmagine(d.immagini[0].path);
                    } else if(d.immagine){
                        selezionaImmagine(d.immagine.path);
                    } else {
                        renderImmagini();
                    }
                    // Mostra eventuali errori
                    if(d.errori && d.errori.length > 0){
                        d.errori.forEach(e => toast(e, 'warning'));
                    }
                }else{
                    toast(d.error || 'Errore upload','error');
                }
            }catch(e){
                toast('Errore di connessione','error');
            }
            input.value = '';
        }

        async function eliminaImmagine(nome){
            if(!confirm('Eliminare questa immagine?')) return;
            try{
                const r = await fetch(`dashboard.php?api=immagini&action=delete&file=${encodeURIComponent(nome)}`);
                const d = await r.json();
                if(d.success){
                    toast('Immagine eliminata','success');
                    immaginiCaricate = immaginiCaricate.filter(i => i.nome !== nome);
                    if(document.getElementById('immagine').value.includes(nome)){
                        document.getElementById('immagine').value = '';
                        immagineSelezionata = '';
                    }
                    renderImmagini();
                }else{
                    toast(d.error || 'Errore eliminazione','error');
                }
            }catch(e){toast('Errore di connessione','error')}
        }

        // === GESTIONE TIPI EVENTO ===
        let tipiEvento = <?= json_encode($tipiEvento) ?>;

        function apriModalTipi(){
            document.getElementById('modalTipi').classList.add('open');
            renderTipi();
        }

        function chiudiModalTipi(){
            document.getElementById('modalTipi').classList.remove('open');
        }

        document.getElementById('modalTipi').onclick = e => {
            if(e.target.id === 'modalTipi') chiudiModalTipi();
        };

        function renderTipi(){
            const list = document.getElementById('tipiList');
            if (tipiEvento.length === 0) {
                list.innerHTML = '<span style="color:var(--text-muted);font-size:.9rem">Nessun tipo creato</span>';
                return;
            }
            list.innerHTML = tipiEvento.map((t, idx) => `
                <span class="tipo-tag">
                    ${escapeHtml(t)}
                    <button type="button" class="remove" data-idx="${idx}" title="Rimuovi"><i class="fas fa-times"></i></button>
                </span>
            `).join('');
            // Aggiungi event listeners per evitare problemi con caratteri speciali
            list.querySelectorAll('.remove').forEach(btn => {
                btn.onclick = () => rimuoviTipo(tipiEvento[btn.dataset.idx]);
            });
        }

        function escapeHtml(str){
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        async function aggiungiTipo(){
            const input = document.getElementById('nuovoTipo');
            const nuovoTipo = input.value.trim();
            if(!nuovoTipo){
                toast('Inserisci il nome del tipo','error');
                return;
            }
            try{
                const r = await fetch('dashboard.php?api=tipi',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo:nuovoTipo})});
                const d = await r.json();
                if(d.success){
                    tipiEvento = d.tipi;
                    renderTipi();
                    aggiornaSelectTipo();
                    input.value = '';
                    toast('Tipo aggiunto!','success');
                }else{
                    toast(d.error || 'Errore','error');
                }
            }catch(e){toast('Errore di connessione','error')}
        }

        async function rimuoviTipo(tipo){
            if(!tipo){
                toast('Tipo non valido','error');
                return;
            }
            const msg = `Eliminare il tipo "${tipo}"?\n\nIl tipo verrà rimosso dalla lista e non sarà più selezionabile per nuovi eventi.`;
            if(!confirm(msg)) return;
            try{
                const url = `dashboard.php?api=tipi&action=delete&tipo=${encodeURIComponent(tipo)}`;
                const r = await fetch(url);
                const text = await r.text();
                let d;
                try {
                    d = JSON.parse(text);
                } catch(parseErr) {
                    console.error('Risposta non JSON:', text);
                    toast('Errore: risposta non valida','error');
                    return;
                }
                if(d.success){
                    tipiEvento = d.tipi || [];
                    renderTipi();
                    aggiornaSelectTipo();
                    toast('Tipo eliminato','success');
                }else{
                    toast(d.error || 'Errore sconosciuto','error');
                }
            }catch(e){
                console.error('Errore rimozione tipo:', e);
                toast('Errore di connessione','error');
            }
        }

        function aggiornaSelectTipo(){
            const select = document.getElementById('tipo');
            const noTipoMsg = document.getElementById('noTipoMsg');
            const label = document.querySelector('#tipoFormGroup label');
            let cogBtn = document.getElementById('tipoCogBtn');

            if (tipiEvento.length === 0) {
                select.style.display = 'none';
                select.innerHTML = '';
                if (noTipoMsg) noTipoMsg.style.display = '';
                if (cogBtn) cogBtn.remove();
                return;
            }

            select.style.display = '';
            if (noTipoMsg) noTipoMsg.style.display = 'none';

            // Aggiungi pulsante cog se non esiste
            if (!cogBtn && label) {
                cogBtn = document.createElement('button');
                cogBtn.type = 'button';
                cogBtn.id = 'tipoCogBtn';
                cogBtn.className = 'btn btn-sm';
                cogBtn.style.cssText = 'margin-left:.5rem;padding:.2rem .5rem;font-size:.7rem';
                cogBtn.onclick = apriModalTipi;
                cogBtn.innerHTML = '<i class="fas fa-cog"></i>';
                label.appendChild(cogBtn);
            }

            const valCorrente = select.value;
            select.innerHTML = tipiEvento.map(t => {
                const escaped = escapeHtml(t);
                return `<option value="${escaped}">${escaped}</option>`;
            }).join('');
            if(tipiEvento.includes(valCorrente)){
                select.value = valCorrente;
            }
        }

        // Carica immagini all'apertura del modal
        const origApriModal = apriModal;
        apriModal = function(ev=null){
            origApriModal(ev);
            caricaImmagini();
            if(ev && ev.immagine){
                immagineSelezionata = ev.immagine;
            }else{
                immagineSelezionata = '';
            }
        };
        </script>

        <?php endif; ?>

    </main>

    <script>
    // Toggle sidebar mobile
    function toggleSidebar(){
        document.querySelector('.sidebar').classList.toggle('open');
        document.querySelector('.hamburger').classList.toggle('open');
        document.querySelector('.sidebar-overlay').classList.toggle('open');
    }
    </script>
</body>
</html>
