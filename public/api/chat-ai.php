<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Allow: POST, OPTIONS');

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

function request_payload(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 40000) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function text_value(array $payload, string $key, int $limit = 4000): string
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

function compact_messages(array $messages): array
{
    $items = array_slice($messages, -12);
    $result = [];

    foreach ($items as $message) {
        if (!is_array($message)) {
            continue;
        }

        $sender = (string) ($message['from'] ?? $message['sender'] ?? '');
        $text = trim((string) ($message['text'] ?? ''));
        if ($text === '') {
            continue;
        }

        $result[] = [
            'role' => $sender === 'user' ? 'user' : 'assistant',
            'content' => function_exists('mb_substr') ? mb_substr($text, 0, 1000) : substr($text, 0, 1000),
        ];
    }

    return $result;
}

function output_text(array $payload): string
{
    if (isset($payload['output_text']) && is_string($payload['output_text'])) {
        return trim($payload['output_text']);
    }

    $parts = [];
    foreach (($payload['output'] ?? []) as $item) {
        foreach (($item['content'] ?? []) as $content) {
            if (isset($content['text']) && is_string($content['text'])) {
                $parts[] = $content['text'];
            }
        }
    }

    return trim(implode("\n", $parts));
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    respond(204, []);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'Metodo nao permitido.']);
}

if (!same_origin_request()) {
    respond(403, ['ok' => false, 'error' => 'Origem nao autorizada.']);
}

$apiKey = getenv('OPENAI_API_KEY') ?: '';
if ($apiKey === '') {
    respond(503, ['ok' => false, 'error' => 'IA nao configurada no servidor.']);
}

$payload = request_payload();
$message = text_value($payload, 'message', 2000);
if ($message === '') {
    respond(400, ['ok' => false, 'error' => 'Mensagem vazia.']);
}

$aiConfig = is_array($payload['ai'] ?? null) ? $payload['ai'] : [];
$model = trim((string) ($aiConfig['model'] ?? getenv('OPENAI_CHAT_MODEL') ?: 'gpt-5.6-luna'));
$systemPrompt = trim((string) ($aiConfig['systemPrompt'] ?? ''));
$temperature = isset($aiConfig['temperature']) ? (float) $aiConfig['temperature'] : 0.35;
$maxOutputTokens = isset($aiConfig['maxOutputTokens']) ? max(120, min(1000, (int) $aiConfig['maxOutputTokens'])) : 420;
$patientName = text_value($payload, 'patientName', 120);
$context = is_array($payload['context'] ?? null) ? $payload['context'] : [];
$history = compact_messages(is_array($payload['messages'] ?? null) ? $payload['messages'] : []);

$instructions = implode("\n\n", array_filter([
    $systemPrompt,
    'Contexto atual em JSON: ' . json_encode([
        'patientName' => $patientName,
        'conversationContext' => $context,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    'Responda em português do Brasil. Entregue somente a mensagem que seria enviada ao paciente, sem aspas, sem markdown e sem explicações internas.',
]));

$input = array_merge(
    [['role' => 'system', 'content' => $instructions]],
    $history,
    [['role' => 'user', 'content' => $message]]
);

$body = [
    'model' => $model,
    'input' => $input,
    'max_output_tokens' => $maxOutputTokens,
    'temperature' => max(0, min(1, $temperature)),
];

$ch = curl_init('https://api.openai.com/v1/responses');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ],
    CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    CURLOPT_TIMEOUT => 20,
]);

$raw = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($raw === false || $status < 200 || $status >= 300) {
    respond(502, [
        'ok' => false,
        'error' => $error ?: 'Falha ao gerar resposta da IA.',
        'status' => $status,
    ]);
}

$decoded = json_decode((string) $raw, true);
if (!is_array($decoded)) {
    respond(502, ['ok' => false, 'error' => 'Resposta invalida da IA.']);
}

$reply = output_text($decoded);
if ($reply === '') {
    respond(502, ['ok' => false, 'error' => 'IA retornou resposta vazia.']);
}

respond(200, [
    'ok' => true,
    'reply' => $reply,
    'model' => $model,
]);
