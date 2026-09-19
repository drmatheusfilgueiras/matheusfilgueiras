<?php
declare(strict_types=1);

date_default_timezone_set('UTC');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
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
    $configured = getenv('CHAT_CONVERSATION_DIR');
    $candidates = array_filter([
        $configured ?: null,
        dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'chat_conversations',
        dirname(__DIR__) . DIRECTORY_SEPARATOR . '_chat_conversations',
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

    respond(500, ['ok' => false, 'error' => 'Nao foi possivel criar a pasta de conversas.']);
}

function request_payload(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 20000) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function text_value(array $payload, string $key, int $limit = 1000): string
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

function safe_id(string $value): string
{
    return preg_replace('/[^a-zA-Z0-9_-]/', '', $value) ?: '';
}

function new_id(): string
{
    return bin2hex(random_bytes(16));
}

function conversation_file(string $conversationId): string
{
    return data_dir() . DIRECTORY_SEPARATOR . safe_id($conversationId) . '.json';
}

function read_conversation(string $conversationId): ?array
{
    $file = conversation_file($conversationId);
    if (!file_exists($file)) {
        return null;
    }

    $decoded = json_decode((string) file_get_contents($file), true);
    return is_array($decoded) ? $decoded : null;
}

function write_conversation(array $conversation): void
{
    $file = conversation_file((string) $conversation['id']);
    $json = json_encode($conversation, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false || file_put_contents($file, $json, LOCK_EX) === false) {
        respond(500, ['ok' => false, 'error' => 'Nao foi possivel gravar a conversa.']);
    }
}

function conversation_summary(array $conversation): array
{
    $messages = $conversation['messages'] ?? [];
    $last = is_array($messages) && count($messages) ? $messages[count($messages) - 1] : [];

    return [
        'id' => $conversation['id'] ?? '',
        'createdAt' => $conversation['createdAt'] ?? '',
        'updatedAt' => $conversation['updatedAt'] ?? '',
        'patientName' => $conversation['patientName'] ?? '',
        'status' => $conversation['status'] ?? 'open',
        'messageCount' => is_array($messages) ? count($messages) : 0,
        'lastSender' => $last['sender'] ?? '',
        'lastMessage' => $last['text'] ?? '',
        'ipMasked' => $conversation['ipMasked'] ?? '',
        'timezone' => $conversation['timezone'] ?? '',
        'language' => $conversation['language'] ?? '',
        'path' => $conversation['path'] ?? '',
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    respond(204, []);
}

if ($method === 'POST') {
    if (!same_origin_request()) {
        respond(403, ['ok' => false, 'error' => 'Origem nao autorizada.']);
    }

    $payload = request_payload();
    $action = text_value($payload, 'action', 40) ?: 'visitor_message';
    $conversationId = safe_id(text_value($payload, 'conversationId', 80));
    $now = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM);

    if ($action === 'operator_message' && !is_authorized($accessKeyHash)) {
        usleep(250000);
        respond(401, ['ok' => false, 'error' => 'Chave de acesso invalida.']);
    }

    if ($conversationId === '') {
        $conversationId = new_id();
    }

    $conversation = read_conversation($conversationId);
    if ($conversation === null) {
        $ip = client_ip();
        $conversation = [
            'id' => $conversationId,
            'createdAt' => $now,
            'updatedAt' => $now,
            'status' => 'open',
            'patientName' => '',
            'visitorId' => substr(hash('sha256', text_value($payload, 'visitorId', 120)), 0, 16),
            'ipHash' => substr(hash('sha256', $ip . '|' . __FILE__), 0, 16),
            'ipMasked' => masked_ip($ip),
            'timezone' => text_value($payload, 'timezone', 80),
            'language' => text_value($payload, 'language', 40),
            'path' => text_value($payload, 'path', 240),
            'href' => text_value($payload, 'href', 500),
            'userAgent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 300),
            'messages' => [],
        ];
    }

    $patientName = text_value($payload, 'patientName', 80);
    if ($patientName !== '') {
        $conversation['patientName'] = $patientName;
    }

    $messageText = text_value($payload, 'text', 2000);
    if ($messageText === '') {
        respond(400, ['ok' => false, 'error' => 'Mensagem vazia.']);
    }

    $sender = in_array($action, ['bot_message', 'operator_message'], true) ? ($action === 'operator_message' ? 'operator' : 'assistant') : 'user';
    $conversation['messages'][] = [
        'id' => new_id(),
        'sender' => $sender,
        'text' => $messageText,
        'createdAt' => $now,
    ];
    $conversation['updatedAt'] = $now;
    if ($sender === 'operator') {
        $conversation['status'] = 'answered';
    } elseif ($sender === 'user') {
        $conversation['status'] = 'needs_attention';
    }

    write_conversation($conversation);

    respond(200, [
        'ok' => true,
        'conversationId' => $conversationId,
        'conversation' => $conversation,
    ]);
}

if ($method === 'GET') {
    $conversationId = safe_id((string) ($_GET['conversationId'] ?? ''));
    if ($conversationId !== '') {
        $conversation = read_conversation($conversationId);
        if ($conversation === null) {
            respond(404, ['ok' => false, 'error' => 'Conversa nao encontrada.']);
        }

        if (!is_authorized($accessKeyHash)) {
            $conversation['ipHash'] = '';
            $conversation['visitorId'] = '';
            $conversation['userAgent'] = '';
        }

        respond(200, ['ok' => true, 'conversation' => $conversation]);
    }

    if (!is_authorized($accessKeyHash)) {
        usleep(250000);
        respond(401, ['ok' => false, 'error' => 'Chave de acesso invalida.']);
    }

    $files = glob(data_dir() . DIRECTORY_SEPARATOR . '*.json') ?: [];
    $conversations = [];
    foreach ($files as $file) {
        $decoded = json_decode((string) file_get_contents($file), true);
        if (is_array($decoded)) {
            $conversations[] = conversation_summary($decoded);
        }
    }

    usort($conversations, fn ($a, $b) => strcmp((string) ($b['updatedAt'] ?? ''), (string) ($a['updatedAt'] ?? '')));
    respond(200, [
        'ok' => true,
        'generatedAt' => (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM),
        'conversations' => array_slice($conversations, 0, 500),
    ]);
}

respond(405, ['ok' => false, 'error' => 'Metodo nao permitido.']);
