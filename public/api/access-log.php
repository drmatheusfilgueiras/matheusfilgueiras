<?php
declare(strict_types=1);

date_default_timezone_set('UTC');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

$accessKeyHash = getenv('ACCESS_LOG_KEY_HASH') ?: '853ee8a0dfc76b927e313f4b7eb5c455ef55ff3696fd2761b08ffe8af7ec20f1';

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function first_header(array $names): string
{
    foreach ($names as $name) {
        if (!empty($_SERVER[$name])) {
            return trim((string) $_SERVER[$name]);
        }
    }

    return '';
}

function client_ip(): string
{
    $forwarded = first_header(['HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR']);
    if ($forwarded !== '') {
        $parts = array_map('trim', explode(',', $forwarded));
        if (!empty($parts[0])) {
            return $parts[0];
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? '';
}

function masked_ip(string $ip): string
{
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $parts = explode('.', $ip);
        return "{$parts[0]}.{$parts[1]}.x.x";
    }

    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        $parts = explode(':', $ip);
        return implode(':', array_slice($parts, 0, 3)) . ':...';
    }

    return '';
}

function data_dir(): string
{
    $configured = getenv('ACCESS_LOG_DIR');
    $candidates = array_filter([
        $configured ?: null,
        dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'access_logs',
        dirname(__DIR__) . DIRECTORY_SEPARATOR . '_access_logs',
    ]);

    foreach ($candidates as $candidate) {
        if ((is_dir($candidate) || mkdir($candidate, 0755, true)) && is_writable($candidate)) {
            $denyFile = $candidate . DIRECTORY_SEPARATOR . '.htaccess';
            if (!file_exists($denyFile)) {
                @file_put_contents($denyFile, "Require all denied\n");
            }

            return $candidate;
        }
    }

    respond(500, ['ok' => false, 'error' => 'Nao foi possivel criar a pasta de logs.']);
}

function log_file(): string
{
    return data_dir() . DIRECTORY_SEPARATOR . 'access-log.jsonl';
}

function request_payload(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 8192) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function text_value(array $payload, string $key, int $limit = 240): string
{
    $value = $payload[$key] ?? '';
    if (!is_scalar($value)) {
        return '';
    }

    $text = trim((string) $value);
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $limit);
    }

    return substr($text, 0, $limit);
}

function is_authorized(string $accessKeyHash): bool
{
    $key = $_GET['key'] ?? first_header(['HTTP_X_ACCESS_LOG_KEY']);
    if (!is_string($key) || $key === '') {
        return false;
    }

    return hash_equals($accessKeyHash, hash('sha256', $key));
}

function read_events(int $limit): array
{
    $file = log_file();
    if (!file_exists($file)) {
        return [];
    }

    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return [];
    }

    $lines = array_slice($lines, -$limit);
    $events = [];

    foreach ($lines as $line) {
        $event = json_decode($line, true);
        if (is_array($event)) {
            $events[] = $event;
        }
    }

    return array_reverse($events);
}

function summarize(array $events): array
{
    $today = (new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d');
    $weekStart = (new DateTimeImmutable('-6 days', new DateTimeZone('America/Sao_Paulo')))->setTime(0, 0);
    $unique = [];
    $byDocument = [];
    $byDay = [];
    $todayCount = 0;
    $weekCount = 0;

    foreach ($events as $event) {
        $documentId = $event['documentId'] ?? 'site';
        $byDocument[$documentId] = ($byDocument[$documentId] ?? 0) + 1;

        $when = new DateTimeImmutable($event['timestamp'] ?? 'now');
        $localWhen = $when->setTimezone(new DateTimeZone('America/Sao_Paulo'));
        $day = $localWhen->format('Y-m-d');
        $byDay[$day] = ($byDay[$day] ?? 0) + 1;

        if ($day === $today) {
            $todayCount++;
        }

        if ($localWhen >= $weekStart) {
            $weekCount++;
        }

        $visitor = ($event['visitorId'] ?? '') . ':' . ($event['ipHash'] ?? '');
        $unique[$visitor] = true;
    }

    ksort($byDay);
    arsort($byDocument);

    return [
        'total' => count($events),
        'today' => $todayCount,
        'last7Days' => $weekCount,
        'uniqueVisitors' => count($unique),
        'byDocument' => $byDocument,
        'byDay' => $byDay,
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    respond(204, []);
}

if ($method === 'POST') {
    $payload = request_payload();
    $ip = client_ip();
    $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));

    $event = [
        'timestamp' => $now->format(DateTimeInterface::ATOM),
        'localTimestamp' => $now->setTimezone(new DateTimeZone('America/Sao_Paulo'))->format(DateTimeInterface::ATOM),
        'documentId' => text_value($payload, 'documentId', 80) ?: 'site',
        'documentTitle' => text_value($payload, 'documentTitle', 160) ?: 'Site',
        'path' => text_value($payload, 'path', 240),
        'href' => text_value($payload, 'href', 500),
        'referrer' => text_value($payload, 'referrer', 500),
        'timezone' => text_value($payload, 'timezone', 80),
        'language' => text_value($payload, 'language', 40),
        'screen' => text_value($payload, 'screen', 40),
        'visitorId' => substr(hash('sha256', text_value($payload, 'visitorId', 120)), 0, 16),
        'ipHash' => substr(hash('sha256', $ip . '|' . __FILE__), 0, 16),
        'ipMasked' => masked_ip($ip),
        'country' => first_header(['HTTP_CF_IPCOUNTRY', 'HTTP_X_COUNTRY_CODE']),
        'userAgent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 300),
    ];

    $line = json_encode($event, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL;
    $written = file_put_contents(log_file(), $line, FILE_APPEND | LOCK_EX);

    if ($written === false) {
        respond(500, ['ok' => false, 'error' => 'Nao foi possivel gravar o acesso.']);
    }

    respond(200, ['ok' => true]);
}

if ($method === 'GET') {
    if (!is_authorized($accessKeyHash)) {
        respond(401, ['ok' => false, 'error' => 'Chave de acesso invalida.']);
    }

    $limit = isset($_GET['limit']) ? max(1, min(10000, (int) $_GET['limit'])) : 2000;
    $events = read_events($limit);

    respond(200, [
        'ok' => true,
        'generatedAt' => (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM),
        'limit' => $limit,
        'summary' => summarize($events),
        'events' => $events,
    ]);
}

respond(405, ['ok' => false, 'error' => 'Metodo nao permitido.']);
