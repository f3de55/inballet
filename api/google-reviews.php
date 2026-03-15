<?php
/**
 * Google Places API - Reviews Endpoint
 */

// Mostra errori per debug
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// === CONFIGURAZIONE ===
$apiKey = 'AIzaSyB1T64uyO5Ke-MttLo9Amscl5ViUvYYvtI';
$placeId = 'ChIJMTLpHKeUhkcR23yEdflvQRQ';

// === FUNZIONI ===
function sendJson($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// === VERIFICA cURL ===
if (!function_exists('curl_init')) {
    sendJson([
        'status' => 'ERROR',
        'error_message' => 'cURL non abilitato. Abilita php_curl in php.ini',
        'result' => null
    ], 500);
}

// === CACHE ===
$cacheDir = __DIR__ . '/cache';
$cacheFile = $cacheDir . '/reviews.json';
$cacheDuration = 3600;

// Prova a creare la cartella cache
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

// Controlla cache
if (file_exists($cacheFile)) {
    $cache = @json_decode(file_get_contents($cacheFile), true);
    if ($cache && isset($cache['time']) && (time() - $cache['time']) < $cacheDuration) {
        sendJson(['status' => 'OK', 'result' => $cache['data']]);
    }
}

// === CHIAMATA API ===
$url = 'https://maps.googleapis.com/maps/api/place/details/json?' . http_build_query([
    'place_id' => $placeId,
    'fields' => 'name,rating,user_ratings_total,reviews',
    'language' => 'it',
    'key' => $apiKey
]);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_TIMEOUT => 15
]);

$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    sendJson([
        'status' => 'ERROR',
        'error_message' => 'cURL error: ' . $error,
        'result' => null
    ], 500);
}

$data = json_decode($response, true);

if (!$data) {
    sendJson([
        'status' => 'ERROR',
        'error_message' => 'JSON decode failed',
        'result' => null
    ], 500);
}

if ($data['status'] !== 'OK') {
    sendJson([
        'status' => 'ERROR',
        'error_message' => $data['error_message'] ?? $data['status'],
        'result' => null
    ], 400);
}

// Salva in cache
$result = $data['result'] ?? null;
if ($result && is_dir($cacheDir)) {
    @file_put_contents($cacheFile, json_encode(['time' => time(), 'data' => $result]));
}

sendJson(['status' => 'OK', 'result' => $result]);
