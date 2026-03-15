<?php
/**
 * InBallet Chatbot Dashboard
 * Analytics e monitoraggio per Ilenia
 */

// === CONFIGURAZIONE ===
$LOG_FILE = __DIR__ . '/data/analytics.json';
$RATE_DIR = __DIR__ . '/data/ratelimit';

// === CARICA DATI ===
$logs = [];
if (file_exists($LOG_FILE)) {
    $logs = json_decode(file_get_contents($LOG_FILE), true) ?: [];
}

// Filtro data
$filterFrom = $_GET['from'] ?? date('Y-m-d', strtotime('-30 days'));
$filterTo = $_GET['to'] ?? date('Y-m-d');

$filteredLogs = array_filter($logs, function($log) use ($filterFrom, $filterTo) {
    return $log['date'] >= $filterFrom && $log['date'] <= $filterTo;
});

// === CALCOLA STATISTICHE ===

// Totali
$totalMessages = count($filteredLogs);
$uniqueUsers = count(array_unique(array_column($filteredLogs, 'ip_hash')));
$cachedResponses = count(array_filter($filteredLogs, fn($l) => $l['cached'] ?? false));
$successResponses = count(array_filter($filteredLogs, fn($l) => $l['type'] === 'success'));
$blockedResponses = count(array_filter($filteredLogs, fn($l) => $l['type'] === 'blocked'));
$filteredResponses = count(array_filter($filteredLogs, fn($l) => $l['type'] === 'filtered'));
$errorResponses = count(array_filter($filteredLogs, fn($l) => $l['type'] === 'error'));

$cacheHitRate = $totalMessages > 0 ? round(($cachedResponses / $totalMessages) * 100, 1) : 0;
$apiCalls = $successResponses; // Solo success sono chiamate API effettive

// Messaggi per giorno
$messagesByDay = [];
foreach ($filteredLogs as $log) {
    $day = $log['date'];
    $messagesByDay[$day] = ($messagesByDay[$day] ?? 0) + 1;
}
ksort($messagesByDay);

// Messaggi per ora
$messagesByHour = array_fill(0, 24, 0);
foreach ($filteredLogs as $log) {
    $hour = $log['hour'] ?? 0;
    $messagesByHour[$hour]++;
}

// Parole più cercate
$wordCounts = [];
foreach ($filteredLogs as $log) {
    $words = preg_split('/\s+/', mb_strtolower($log['message'] ?? ''));
    foreach ($words as $word) {
        $word = preg_replace('/[^\p{L}\p{N}]/u', '', $word);
        if (mb_strlen($word) > 2) {
            $wordCounts[$word] = ($wordCounts[$word] ?? 0) + 1;
        }
    }
}
// Rimuovi parole comuni
$stopWords = ['che','per','come','sono','una','con','non','dei','del','della','delle','gli','nella','sul','alla','anche','questo','quella','dove','quando','cosa','quali','quale','chi','perché','vorrei','avete','fate','posso','puoi','può','hai','hanno','fare','essere','stato','stati','stata','state','molto','tanto','poco','più','meno','solo','tutti','tutto','tutte','tutte'];
foreach ($stopWords as $sw) unset($wordCounts[$sw]);
arsort($wordCounts);
$topWords = array_slice($wordCounts, 0, 20, true);

// Domande frequenti
$questionCounts = [];
foreach ($filteredLogs as $log) {
    if (!empty($log['message']) && $log['type'] !== 'blocked') {
        $q = mb_strtolower(trim($log['message']));
        $q = mb_substr($q, 0, 100);
        $questionCounts[$q] = ($questionCounts[$q] ?? 0) + 1;
    }
}
arsort($questionCounts);
$topQuestions = array_slice($questionCounts, 0, 15, true);

// Ultimi messaggi
$recentLogs = array_slice(array_reverse($filteredLogs), 0, 50);

// Statistiche per tipo
$typeStats = [
    'success' => $successResponses,
    'cached' => $cachedResponses,
    'blocked' => $blockedResponses,
    'filtered' => $filteredResponses,
    'error' => $errorResponses
];
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Chatbot - InBallet</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --primary: #87CEEB;
            --primary-dark: #5bb8e0;
            --bg-dark: #0f0f0f;
            --bg-card: #1a1a1a;
            --bg-card-hover: #222;
            --text: #ffffff;
            --text-muted: #888;
            --success: #4ade80;
            --warning: #fbbf24;
            --danger: #f87171;
            --info: #60a5fa;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: var(--bg-dark);
            color: var(--text);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
        }
        .header h1 {
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .header h1 span { color: var(--primary); }
        .filters {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        .filters input, .filters button {
            padding: 10px 16px;
            border-radius: 8px;
            border: 1px solid #333;
            background: var(--bg-card);
            color: var(--text);
            font-size: 14px;
        }
        .filters button {
            background: var(--primary);
            color: #000;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
        }
        .filters button:hover { background: var(--primary-dark); }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid #2a2a2a;
            transition: transform 0.2s, border-color 0.2s;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            border-color: var(--primary);
        }
        .stat-card .icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-bottom: 16px;
        }
        .stat-card .icon.blue { background: rgba(135,206,235,0.2); color: var(--primary); }
        .stat-card .icon.green { background: rgba(74,222,128,0.2); color: var(--success); }
        .stat-card .icon.yellow { background: rgba(251,191,36,0.2); color: var(--warning); }
        .stat-card .icon.red { background: rgba(248,113,113,0.2); color: var(--danger); }
        .stat-card .value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 4px;
        }
        .stat-card .label {
            color: var(--text-muted);
            font-size: 14px;
        }

        /* Charts */
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .chart-card {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid #2a2a2a;
        }
        .chart-card h3 {
            margin-bottom: 20px;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .chart-card h3 i { color: var(--primary); }

        /* Tables */
        .tables-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .table-card {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid #2a2a2a;
            max-height: 500px;
            overflow-y: auto;
        }
        .table-card h3 {
            margin-bottom: 20px;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 10px;
            position: sticky;
            top: 0;
            background: var(--bg-card);
            padding-bottom: 10px;
        }
        .table-card h3 i { color: var(--primary); }
        .word-list, .question-list { list-style: none; }
        .word-list li, .question-list li {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #2a2a2a;
            font-size: 14px;
        }
        .word-list li:last-child, .question-list li:last-child { border-bottom: none; }
        .word-list .word { color: var(--primary); font-weight: 500; }
        .word-list .count, .question-list .count {
            background: rgba(135,206,235,0.2);
            color: var(--primary);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .question-list .question {
            flex: 1;
            margin-right: 10px;
            word-break: break-word;
        }

        /* Log Table */
        .log-card {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid #2a2a2a;
            overflow-x: auto;
        }
        .log-card h3 {
            margin-bottom: 20px;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .log-card h3 i { color: var(--primary); }
        .log-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        .log-table th, .log-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #2a2a2a;
        }
        .log-table th {
            color: var(--text-muted);
            font-weight: 500;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
        }
        .log-table td { color: var(--text); }
        .log-table tr:hover { background: var(--bg-card-hover); }
        .badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge.success { background: rgba(74,222,128,0.2); color: var(--success); }
        .badge.cached { background: rgba(96,165,250,0.2); color: var(--info); }
        .badge.blocked { background: rgba(248,113,113,0.2); color: var(--danger); }
        .badge.filtered { background: rgba(251,191,36,0.2); color: var(--warning); }
        .badge.error { background: rgba(248,113,113,0.2); color: var(--danger); }

        /* Type Stats */
        .type-stats {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom: 30px;
        }
        .type-stat {
            background: var(--bg-card);
            padding: 16px 24px;
            border-radius: 12px;
            border: 1px solid #2a2a2a;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .type-stat .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        .type-stat .dot.success { background: var(--success); }
        .type-stat .dot.cached { background: var(--info); }
        .type-stat .dot.blocked { background: var(--danger); }
        .type-stat .dot.filtered { background: var(--warning); }
        .type-stat .dot.error { background: var(--danger); }

        /* Responsive */
        @media (max-width: 768px) {
            .charts-grid { grid-template-columns: 1fr; }
            .tables-grid { grid-template-columns: 1fr; }
            .header { flex-direction: column; align-items: flex-start; }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg-dark); }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>
                <i class="fas fa-chart-line" style="color: var(--primary)"></i>
                Dashboard <span>Chatbot InBallet</span>
            </h1>
            <form class="filters" method="GET">
                <input type="date" name="from" value="<?= htmlspecialchars($filterFrom) ?>">
                <span style="color: var(--text-muted)">→</span>
                <input type="date" name="to" value="<?= htmlspecialchars($filterTo) ?>">
                <button type="submit"><i class="fas fa-filter"></i> Filtra</button>
            </form>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="icon blue"><i class="fas fa-comments"></i></div>
                <div class="value"><?= number_format($totalMessages) ?></div>
                <div class="label">Messaggi Totali</div>
            </div>
            <div class="stat-card">
                <div class="icon green"><i class="fas fa-users"></i></div>
                <div class="value"><?= number_format($uniqueUsers) ?></div>
                <div class="label">Utenti Unici</div>
            </div>
            <div class="stat-card">
                <div class="icon yellow"><i class="fas fa-bolt"></i></div>
                <div class="value"><?= $cacheHitRate ?>%</div>
                <div class="label">Cache Hit Rate</div>
            </div>
            <div class="stat-card">
                <div class="icon blue"><i class="fas fa-robot"></i></div>
                <div class="value"><?= number_format($apiCalls) ?></div>
                <div class="label">Chiamate API</div>
            </div>
        </div>

        <!-- Type Stats -->
        <div class="type-stats">
            <div class="type-stat">
                <div class="dot success"></div>
                <span><strong><?= $typeStats['success'] ?></strong> Successo</span>
            </div>
            <div class="type-stat">
                <div class="dot cached"></div>
                <span><strong><?= $typeStats['cached'] ?></strong> Cache</span>
            </div>
            <div class="type-stat">
                <div class="dot blocked"></div>
                <span><strong><?= $typeStats['blocked'] ?></strong> Bloccati</span>
            </div>
            <div class="type-stat">
                <div class="dot filtered"></div>
                <span><strong><?= $typeStats['filtered'] ?></strong> Filtrati</span>
            </div>
            <div class="type-stat">
                <div class="dot error"></div>
                <span><strong><?= $typeStats['error'] ?></strong> Errori</span>
            </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
            <div class="chart-card">
                <h3><i class="fas fa-calendar-alt"></i> Messaggi per Giorno</h3>
                <canvas id="chartDaily"></canvas>
            </div>
            <div class="chart-card">
                <h3><i class="fas fa-clock"></i> Messaggi per Ora</h3>
                <canvas id="chartHourly"></canvas>
            </div>
        </div>

        <!-- Tables -->
        <div class="tables-grid">
            <div class="table-card">
                <h3><i class="fas fa-hashtag"></i> Parole Più Cercate</h3>
                <ul class="word-list">
                    <?php foreach ($topWords as $word => $count): ?>
                    <li>
                        <span class="word"><?= htmlspecialchars($word) ?></span>
                        <span class="count"><?= $count ?></span>
                    </li>
                    <?php endforeach; ?>
                    <?php if (empty($topWords)): ?>
                    <li><span style="color: var(--text-muted)">Nessun dato</span></li>
                    <?php endif; ?>
                </ul>
            </div>
            <div class="table-card">
                <h3><i class="fas fa-question-circle"></i> Domande Frequenti</h3>
                <ul class="question-list">
                    <?php foreach ($topQuestions as $question => $count): ?>
                    <li>
                        <span class="question"><?= htmlspecialchars($question) ?></span>
                        <span class="count"><?= $count ?></span>
                    </li>
                    <?php endforeach; ?>
                    <?php if (empty($topQuestions)): ?>
                    <li><span style="color: var(--text-muted)">Nessun dato</span></li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>

        <!-- Recent Logs -->
        <div class="log-card">
            <h3><i class="fas fa-history"></i> Ultimi 50 Messaggi</h3>
            <table class="log-table">
                <thead>
                    <tr>
                        <th>Data/Ora</th>
                        <th>Messaggio</th>
                        <th>Tipo</th>
                        <th>Risposta</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($recentLogs as $log): ?>
                    <tr>
                        <td style="white-space: nowrap"><?= htmlspecialchars(substr($log['timestamp'], 0, 16)) ?></td>
                        <td><?= htmlspecialchars(mb_substr($log['message'], 0, 60)) ?><?= mb_strlen($log['message']) > 60 ? '...' : '' ?></td>
                        <td><span class="badge <?= $log['type'] ?>"><?= $log['type'] ?></span></td>
                        <td><?= htmlspecialchars(mb_substr($log['response_preview'], 0, 50)) ?>...</td>
                    </tr>
                    <?php endforeach; ?>
                    <?php if (empty($recentLogs)): ?>
                    <tr><td colspan="4" style="text-align: center; color: var(--text-muted)">Nessun messaggio registrato</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Chart.js config
        Chart.defaults.color = '#888';
        Chart.defaults.borderColor = '#2a2a2a';

        // Daily Chart
        new Chart(document.getElementById('chartDaily'), {
            type: 'line',
            data: {
                labels: <?= json_encode(array_keys($messagesByDay)) ?>,
                datasets: [{
                    label: 'Messaggi',
                    data: <?= json_encode(array_values($messagesByDay)) ?>,
                    borderColor: '#87CEEB',
                    backgroundColor: 'rgba(135, 206, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#2a2a2a' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Hourly Chart
        new Chart(document.getElementById('chartHourly'), {
            type: 'bar',
            data: {
                labels: <?= json_encode(array_map(fn($h) => sprintf('%02d:00', $h), range(0, 23))) ?>,
                datasets: [{
                    label: 'Messaggi',
                    data: <?= json_encode(array_values($messagesByHour)) ?>,
                    backgroundColor: 'rgba(135, 206, 235, 0.6)',
                    borderColor: '#87CEEB',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#2a2a2a' } },
                    x: { grid: { display: false } }
                }
            }
        });
    </script>
</body>
</html>
