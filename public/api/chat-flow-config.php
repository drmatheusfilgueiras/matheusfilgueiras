<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Allow: GET, POST, OPTIONS');

$accessKeyHash = getenv('CHAT_CONTROL_KEY_HASH') ?: 'dd69f8786a282536c7fa6ca077d12622b82c3963df23a3f7297040fda68d89b4';

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

function same_origin_request(): bool
{
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $origin = first_header(['HTTP_ORIGIN']);

    if ($origin !== '') {
        $originHost = strtolower((string) (parse_url($origin, PHP_URL_HOST) ?: ''));
        return $originHost === $host;
    }

    $referer = first_header(['HTTP_REFERER']);
    if ($referer !== '') {
        $refererHost = strtolower((string) (parse_url($referer, PHP_URL_HOST) ?: ''));
        return $refererHost === $host;
    }

    return true;
}

function is_authorized(string $accessKeyHash): bool
{
    $key = $_GET['key'] ?? first_header(['HTTP_X_CHAT_CONTROL_KEY']);
    if (!is_string($key) || $key === '') {
        return false;
    }

    return hash_equals($accessKeyHash, hash('sha256', $key));
}

function data_dir(): string
{
    $configured = getenv('CHAT_CONFIG_DIR');
    $candidates = array_filter([
        $configured ?: null,
        dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'chat_config',
        dirname(__DIR__) . DIRECTORY_SEPARATOR . '_chat_config',
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

    respond(500, ['ok' => false, 'error' => 'Nao foi possivel criar a pasta de configuracao.']);
}

function config_file(): string
{
    return data_dir() . DIRECTORY_SEPARATOR . 'chat-flow-config.json';
}

function request_payload(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 250000) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    respond(204, []);
}

if ($method === 'GET') {
    $file = config_file();
    if (!file_exists($file)) {
        respond(200, ['ok' => true, 'config' => null, 'updatedAt' => null]);
    }

    $decoded = json_decode((string) file_get_contents($file), true);
    respond(200, [
        'ok' => true,
        'config' => is_array($decoded['config'] ?? null) ? $decoded['config'] : null,
        'updatedAt' => $decoded['updatedAt'] ?? null,
    ]);
}

if ($method === 'POST') {
    if (!same_origin_request()) {
        respond(403, ['ok' => false, 'error' => 'Origem nao autorizada.']);
    }

    if (!is_authorized($accessKeyHash)) {
        usleep(250000);
        respond(401, ['ok' => false, 'error' => 'Chave de acesso invalida.']);
    }

    $payload = request_payload();
    $config = $payload['config'] ?? null;
    if (!is_array($config)) {
        respond(400, ['ok' => false, 'error' => 'Configuracao invalida.']);
    }

    $stored = [
        'updatedAt' => (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM),
        'config' => $config,
    ];
    $json = json_encode($stored, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false || file_put_contents(config_file(), $json, LOCK_EX) === false) {
        respond(500, ['ok' => false, 'error' => 'Nao foi possivel salvar a configuracao.']);
    }

    respond(200, ['ok' => true, 'updatedAt' => $stored['updatedAt']]);
}

respond(405, ['ok' => false, 'error' => 'Metodo nao permitido.']);
