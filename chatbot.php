<?php
/**
 * InBallet AI Chatbot - BELLA
 * Sicuro, ottimizzato, con logging per analytics
 */

// === HEADERS SICUREZZA ===
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

// === CONFIGURAZIONE ===
$CONFIG = [
    'groq_key' => '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',
    'cache_dir' => __DIR__ . '/data/cache',
    'rate_dir' => __DIR__ . '/data/ratelimit',
    'log_file' => __DIR__ . '/data/analytics.json',
    'cache_time' => 7200,
    'rate_limit_hour' => 30,
    'rate_limit_day' => 100,
    'min_interval' => 2,
    'max_msg_length' => 500,
    'max_input_size' => 2048
];

// Crea cartelle
foreach (['cache_dir', 'rate_dir'] as $dir) {
    if (!is_dir($CONFIG[$dir])) mkdir($CONFIG[$dir], 0755, true);
}
if (!is_dir(dirname($CONFIG['log_file']))) mkdir(dirname($CONFIG['log_file']), 0755, true);

// === FUNZIONI SICUREZZA ===

function sanitizeInput($input) {
    if (!is_string($input)) return '';
    // Rimuovi null bytes e caratteri di controllo
    $input = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $input);
    // Trim e limita lunghezza
    $input = mb_substr(trim($input), 0, 500);
    return $input;
}

function escapeHtml($text) {
    return htmlspecialchars($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function getClientIP() {
    // Priorità: header proxy affidabili → IP diretto
    $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($headers as $h) {
        if (!empty($_SERVER[$h])) {
            $ip = explode(',', $_SERVER[$h])[0];
            $ip = filter_var(trim($ip), FILTER_VALIDATE_IP);
            if ($ip) return $ip;
        }
    }
    return '0.0.0.0';
}

function hashIP($ip) {
    return hash('sha256', $ip . 'inballet_salt_2024');
}

// === RATE LIMITING ===

function checkRateLimit($config) {
    $ipHash = hashIP(getClientIP());
    $file = $config['rate_dir'] . '/' . substr($ipHash, 0, 16) . '.json';
    $now = time();

    $data = ['requests' => [], 'last' => 0, 'blocked_until' => 0];
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true) ?: $data;
    }

    // Controlla se bloccato
    if ($data['blocked_until'] > $now) {
        $wait = $data['blocked_until'] - $now;
        return ['ok' => false, 'error' => "Troppe richieste. Riprova tra {$wait} secondi. ⏳", 'blocked' => true];
    }

    // Intervallo minimo
    if ($now - $data['last'] < $config['min_interval']) {
        return ['ok' => false, 'error' => 'Aspetta qualche secondo tra i messaggi. ⏳'];
    }

    // Pulisci vecchie richieste
    $data['requests'] = array_values(array_filter($data['requests'], fn($t) => $now - $t < 86400));

    // Conta
    $lastHour = count(array_filter($data['requests'], fn($t) => $now - $t < 3600));
    $lastDay = count($data['requests']);

    // Blocco progressivo per abuso
    if ($lastHour >= $config['rate_limit_hour'] * 2) {
        $data['blocked_until'] = $now + 3600; // Blocca 1 ora
        file_put_contents($file, json_encode($data));
        return ['ok' => false, 'error' => 'Limite superato. Bloccato per 1 ora. 🚫', 'blocked' => true];
    }

    if ($lastHour >= $config['rate_limit_hour']) {
        return ['ok' => false, 'error' => "Limite orario raggiunto ({$config['rate_limit_hour']}/ora). Riprova tra poco! ⏰"];
    }

    if ($lastDay >= $config['rate_limit_day']) {
        return ['ok' => false, 'error' => "Limite giornaliero raggiunto. Contattaci: +39 393 780 2996 📞"];
    }

    // Registra
    $data['requests'][] = $now;
    $data['last'] = $now;
    file_put_contents($file, json_encode($data));

    return ['ok' => true, 'remaining' => $config['rate_limit_hour'] - $lastHour - 1];
}

// === FILTRI CONTENUTO ===

function containsBadWords($text) {
    $badWords = [
        'cazzo','merda','stronzo','vaffanculo','idiota','coglione','puttana','minchia',
        'fanculo','fuck','shit','asshole','bitch','cretino','deficiente','scemo',
        'stupido','porco','troia','bastardo','negro','frocio','ritardato','mongoloide',
        'porca','madonna','dio','cane','zoccola','mignotta','cazzi','merde','stronzi'
    ];
    $lower = mb_strtolower($text);
    foreach ($badWords as $word) {
        if (mb_strpos($lower, $word) !== false) return true;
    }
    return false;
}

function containsInjection($text) {
    $patterns = [
        '/<script/i', '/javascript:/i', '/on\w+\s*=/i', // XSS
        '/\bunion\b.*\bselect\b/i', '/;\s*drop\b/i', '/--\s*$/m', // SQL
        '/\.\.\//','/%2e%2e/i', // Path traversal
        '/\$\{/', '/\{\{/' // Template injection
    ];
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $text)) return true;
    }
    return false;
}

function isSpamPattern($text) {
    // Troppi link
    if (preg_match_all('/https?:\/\//i', $text) > 2) return true;
    // Ripetizioni eccessive
    if (preg_match('/(.)\1{10,}/', $text)) return true;
    // Testo tutto maiuscolo lungo
    if (mb_strlen($text) > 20 && $text === mb_strtoupper($text)) return true;
    return false;
}

// === LOGGING ANALYTICS ===

function logMessage($msg, $response, $type, $cached = false) {
    global $CONFIG;

    $entry = [
        'timestamp' => date('c'),
        'date' => date('Y-m-d'),
        'hour' => (int)date('H'),
        'ip_hash' => substr(hashIP(getClientIP()), 0, 8),
        'message' => mb_substr($msg, 0, 200),
        'response_preview' => mb_substr(strip_tags($response), 0, 100),
        'type' => $type, // 'success', 'blocked', 'filtered', 'cached', 'error'
        'cached' => $cached,
        'user_agent' => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 100)
    ];

    // Leggi log esistente
    $logs = [];
    if (file_exists($CONFIG['log_file'])) {
        $logs = json_decode(file_get_contents($CONFIG['log_file']), true) ?: [];
    }

    // Aggiungi entry
    $logs[] = $entry;

    // Mantieni solo ultimi 30 giorni (max 10000 entries)
    if (count($logs) > 10000) {
        $logs = array_slice($logs, -10000);
    }

    file_put_contents($CONFIG['log_file'], json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// === CACHE ===

function getHtmlVersion() {
    $latest = 0;
    $count = 0;
    try {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(__DIR__, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getExtension()) === 'html') {
                $path = $file->getPathname();
                if (strpos($path, 'data') !== false) continue;
                $count++;
                $mtime = filemtime($path);
                if ($mtime > $latest) $latest = $mtime;
            }
        }
    } catch (Exception $e) {}
    return $latest . '_' . $count;
}

function cacheGet($msg, $config) {
    $key = hash('sha256', mb_strtolower(trim($msg)) . '_v' . getHtmlVersion());
    $file = $config['cache_dir'] . '/' . substr($key, 0, 32) . '.txt';
    if (file_exists($file) && (time() - filemtime($file)) < $config['cache_time']) {
        return file_get_contents($file);
    }
    return null;
}

function cacheSet($msg, $response, $config) {
    $key = hash('sha256', mb_strtolower(trim($msg)) . '_v' . getHtmlVersion());
    $file = $config['cache_dir'] . '/' . substr($key, 0, 32) . '.txt';
    file_put_contents($file, $response);
}

// === FORMATTAZIONE OUTPUT ===

function makeLinks($text) {
    // Escape HTML first per sicurezza
    $text = escapeHtml($text);
    // Numeri telefono
    $text = preg_replace('/(\+?\d{2,3}[\s\-]?\d{2,3}[\s\-]?\d{3}[\s\-]?\d{4})/', '<a href="tel:$1" class="cb-link">$1</a>', $text);
    // Email
    $text = preg_replace('/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/', '<a href="mailto:$1" class="cb-link">$1</a>', $text);
    // Newlines
    $text = nl2br($text);
    return $text;
}

// === SCRAPING ===

function getSiteData() {
    static $data = null;
    if ($data !== null) return $data;

    $text = '';
    try {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(__DIR__, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getExtension()) === 'html') {
                $path = $file->getPathname();
                if (strpos($path, 'data') !== false) continue;
                $html = @file_get_contents($path);
                if ($html) {
                    $html = preg_replace('/<(script|style|noscript)[^>]*>.*?<\/\1>/is', '', $html);
                    $html = preg_replace('/<!--.*?-->/s', '', $html);
                    $text .= ' ' . strip_tags($html);
                }
            }
        }
    } catch (Exception $e) {}

    $data = mb_substr(preg_replace('/\s+/', ' ', trim($text)), 0, 6000);
    return $data;
}

// === MAIN ===

// Validazione input grezzo
$rawInput = file_get_contents('php://input');
if (strlen($rawInput) > $CONFIG['max_input_size']) {
    logMessage('', 'Input troppo grande', 'blocked');
    exit(json_encode(['response' => 'Richiesta troppo grande. ❌']));
}

$input = json_decode($rawInput, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    logMessage('', 'JSON invalido', 'blocked');
    exit(json_encode(['response' => 'Richiesta non valida. ❌']));
}

$msg = sanitizeInput($input['message'] ?? '');

// Validazioni
if (empty($msg)) {
    exit(json_encode(['response' => 'Scrivi qualcosa! 💃']));
}

if (mb_strlen($msg) > $CONFIG['max_msg_length']) {
    logMessage($msg, 'Messaggio troppo lungo', 'filtered');
    exit(json_encode(['response' => 'Messaggio troppo lungo! Max 500 caratteri. ✂️']));
}

if (containsInjection($msg)) {
    logMessage($msg, 'Injection tentato', 'blocked');
    exit(json_encode(['response' => 'Richiesta non valida. ❌']));
}

if (containsBadWords($msg)) {
    logMessage($msg, 'Contenuto inappropriato', 'filtered');
    exit(json_encode(['response' => 'Preferisco una conversazione rispettosa 🩰 Come posso aiutarti?']));
}

if (isSpamPattern($msg)) {
    logMessage($msg, 'Pattern spam', 'filtered');
    exit(json_encode(['response' => 'Messaggio non valido. Scrivi una domanda normale! 😊']));
}

// Rate limiting
$rateCheck = checkRateLimit($CONFIG);
if (!$rateCheck['ok']) {
    logMessage($msg, $rateCheck['error'], 'blocked');
    exit(json_encode(['response' => $rateCheck['error']]));
}

// Cache
$cached = cacheGet($msg, $CONFIG);
if ($cached) {
    logMessage($msg, $cached, 'cached', true);
    exit(json_encode(['response' => makeLinks($cached)]));
}

// API Groq
$site = getSiteData();

$prompt = "Sei BELLA, l'assistente virtuale di InBallet - scuola di danza multidisciplinare a Lainate e Rho (Milano), fondata nel 2008 da Ilenia Nobile. Oltre 200 allievi ogni anno.

STILE:
- Cordiale, entusiasta, professionale
- Risposte concise (2-4 frasi max)
- Emoji appropriati: 💃🩰✨📞📧📍

CONTATTI:
📞 +39 393 780 2996
📧 info@inballet.it
🕐 Segreteria: Lun-Ven 15:00-20:00

SEDI:
📍 Via Puccini 14, Lainate (centrale)
📍 Via Tevere 9, Rho
📍 Via Chiminello 2, Rho

REGOLE STRICT:
1. Rispondi SOLO su InBallet
2. OFF-TOPIC → 'Mi occupo solo di InBallet! Posso aiutarti con info sui nostri corsi? 💃'
3. Mai inventare info
4. Prezzi/orari specifici → invita a contattare

DATI:
$site

DOMANDA: $msg";

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $CONFIG['groq_key']
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'model' => 'llama-3.3-70b-versatile',
        'messages' => [['role' => 'user', 'content' => $prompt]],
        'temperature' => 0.7,
        'max_tokens' => 300
    ]),
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10
]);

$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($code !== 200 || $error) {
    logMessage($msg, "API Error: $code - $error", 'error');
    exit(json_encode(['response' => 'Momentaneamente non disponibile. Contattaci: <a href="tel:+393937802996" class="cb-link">+39 393 780 2996</a> 📞']));
}

$data = json_decode($res, true);
$reply = $data['choices'][0]['message']['content'] ?? null;

if (!$reply) {
    logMessage($msg, 'Risposta vuota da API', 'error');
    exit(json_encode(['response' => 'Contattaci per info: <a href="mailto:info@inballet.it" class="cb-link">info@inballet.it</a> 📧']));
}

// Salva e rispondi
cacheSet($msg, $reply, $CONFIG);
logMessage($msg, $reply, 'success');

echo json_encode(['response' => makeLinks($reply)]);
