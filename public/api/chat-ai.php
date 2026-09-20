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

function starts_with(string $value, string $prefix): bool
{
    return substr($value, 0, strlen($prefix)) === $prefix;
}

function complete_reply(string $reply): bool
{
    $reply = trim($reply);
    if ($reply === '') {
        return false;
    }

    return (bool) preg_match('/[.!?…)]$/u', $reply);
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

function openai_output_text(array $payload): string
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

function gemini_output_text(array $payload): string
{
    $parts = [];
    foreach (($payload['candidates'] ?? []) as $candidate) {
        foreach (($candidate['content']['parts'] ?? []) as $part) {
            if (isset($part['text']) && is_string($part['text'])) {
                $parts[] = $part['text'];
            }
        }
    }

    return trim(implode("\n", $parts));
}

function gemini_finish_reason(array $payload): string
{
    foreach (($payload['candidates'] ?? []) as $candidate) {
        if (isset($candidate['finishReason']) && is_string($candidate['finishReason'])) {
            return $candidate['finishReason'];
        }
    }

    return '';
}

function post_json(string $url, array $headers, array $body): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json'], $headers),
        CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 20,
    ]);

    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($raw === false || $status < 200 || $status >= 300) {
        return [
            'ok' => false,
            'status' => $status,
            'error' => $error ?: 'Falha ao gerar resposta da IA.',
            'raw' => is_string($raw) ? $raw : '',
        ];
    }

    $decoded = json_decode((string) $raw, true);
    if (!is_array($decoded)) {
        return [
            'ok' => false,
            'status' => $status,
            'error' => 'Resposta invalida da IA.',
            'raw' => (string) $raw,
        ];
    }

    return [
        'ok' => true,
        'status' => $status,
        'payload' => $decoded,
    ];
}

function call_openai(string $apiKey, string $model, string $instructions, array $history, string $message, float $temperature, int $maxOutputTokens): array
{
    $input = array_merge(
        [['role' => 'system', 'content' => $instructions]],
        $history,
        [['role' => 'user', 'content' => $message]]
    );

    $result = post_json('https://api.openai.com/v1/responses', [
        'Authorization: Bearer ' . $apiKey,
    ], [
        'model' => $model,
        'input' => $input,
        'max_output_tokens' => $maxOutputTokens,
        'temperature' => max(0, min(1, $temperature)),
    ]);

    if (!$result['ok']) {
        return $result;
    }

    $reply = openai_output_text($result['payload']);
    return !complete_reply($reply)
        ? ['ok' => false, 'status' => 502, 'error' => 'IA retornou resposta incompleta.']
        : ['ok' => true, 'reply' => $reply];
}

function call_gemini(string $apiKey, string $model, string $instructions, array $history, string $message, float $temperature, int $maxOutputTokens): array
{
    if ($model === 'gemini-3.6-flash') {
        $model = 'gemini-2.5-flash-lite';
    }

    $effectiveMaxOutputTokens = starts_with($model, 'gemini-3')
        ? max($maxOutputTokens, 1536)
        : $maxOutputTokens;
    $generationConfig = [
        'temperature' => max(0, min(1, $temperature)),
        'maxOutputTokens' => $effectiveMaxOutputTokens,
    ];

    if (stripos($model, 'gemini-2.5-flash') !== false) {
        $generationConfig['thinkingConfig'] = [
            'thinkingBudget' => 0,
        ];
    }

    $contents = [];
    foreach ($history as $item) {
        $contents[] = [
            'role' => $item['role'] === 'user' ? 'user' : 'model',
            'parts' => [['text' => $item['content']]],
        ];
    }
    $contents[] = [
        'role' => 'user',
        'parts' => [['text' => $message]],
    ];

    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($apiKey);
    $result = post_json($url, [], [
        'systemInstruction' => [
            'parts' => [['text' => $instructions]],
        ],
        'contents' => $contents,
        'generationConfig' => $generationConfig,
    ]);

    if (!$result['ok']) {
        return $result;
    }

    if (gemini_finish_reason($result['payload']) === 'MAX_TOKENS') {
        return ['ok' => false, 'status' => 502, 'error' => 'IA interrompeu a resposta por limite de tokens.'];
    }

    $reply = gemini_output_text($result['payload']);
    return !complete_reply($reply)
        ? ['ok' => false, 'status' => 502, 'error' => 'IA retornou resposta incompleta.']
        : ['ok' => true, 'reply' => $reply];
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

$payload = request_payload();
$message = text_value($payload, 'message', 2000);
if ($message === '') {
    respond(400, ['ok' => false, 'error' => 'Mensagem vazia.']);
}

$aiConfig = is_array($payload['ai'] ?? null) ? $payload['ai'] : [];
$provider = strtolower(trim((string) ($aiConfig['provider'] ?? getenv('AI_PROVIDER') ?: 'gemini')));
if (!in_array($provider, ['gemini', 'openai'], true)) {
    $provider = 'gemini';
}

$defaultModel = $provider === 'openai' ? 'gpt-5.6-luna' : 'gemini-2.5-flash-lite';
$modelEnv = $provider === 'openai' ? getenv('OPENAI_CHAT_MODEL') : getenv('GEMINI_CHAT_MODEL');
$configuredModel = trim((string) ($aiConfig['model'] ?? ''));
$envModel = trim((string) ($modelEnv ?: ''));
$model = $configuredModel !== '' ? $configuredModel : ($envModel !== '' ? $envModel : $defaultModel);
if ($provider === 'gemini' && (starts_with($model, 'gpt-') || $model === 'gemini-3.6-flash')) {
    $model = 'gemini-2.5-flash-lite';
}
if ($provider === 'openai' && starts_with($model, 'gemini-')) {
    $model = 'gpt-5.6-luna';
}
$systemPrompt = trim((string) ($aiConfig['systemPrompt'] ?? ''));
$temperature = isset($aiConfig['temperature']) ? (float) $aiConfig['temperature'] : 0.35;
$maxOutputTokens = isset($aiConfig['maxOutputTokens']) ? max(120, min(1000, (int) $aiConfig['maxOutputTokens'])) : 420;
$patientName = text_value($payload, 'patientName', 120);
$context = is_array($payload['context'] ?? null) ? $payload['context'] : [];
$history = compact_messages(is_array($payload['messages'] ?? null) ? $payload['messages'] : []);

$instructions = implode("\n\n", array_filter([
    $systemPrompt,
    implode("\n", [
        'Agenda fixa do Dr. Matheus:',
        '- Quintas na Salud Odontologia: 9h às 12h e 14h às 19h.',
        '- Sábados na Salud Odontologia: 9h às 13h.',
        '- Sextas na Naturale Dental Studio: 9h às 12h e 13h30 às 19h.',
        'Se a pessoa quiser marcar horário, use esses períodos como referência.',
        'Não diga "vou verificar a agenda", "te retorno" ou qualquer promessa de retorno futuro.',
        'Você não tem acesso à agenda real em tempo real. Depois de identificar dia/período ou preferência, peça para a pessoa confirmar pelo WhatsApp ou informe que a confirmação final do horário acontece pelo WhatsApp.',
    ]),
    'Contexto atual em JSON: ' . json_encode([
        'patientName' => $patientName,
        'conversationContext' => $context,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    'Responda em português do Brasil, em no máximo 45 palavras. Entregue somente a mensagem que seria enviada ao paciente, sem aspas, sem markdown e sem explicações internas.',
    'Nunca entregue uma frase incompleta. Toda resposta deve terminar com pontuação final e, quando a conversa ainda não estiver resolvida, com uma pergunta curta que conduza o próximo passo.',
]));

$apiKey = $provider === 'openai'
    ? (getenv('OPENAI_API_KEY') ?: '')
    : (getenv('GEMINI_API_KEY') ?: getenv('GOOGLE_API_KEY') ?: '');

if ($apiKey === '') {
    $keyName = $provider === 'openai' ? 'OPENAI_API_KEY' : 'GEMINI_API_KEY';
    respond(503, ['ok' => false, 'error' => 'IA nao configurada no servidor. Configure ' . $keyName . '.']);
}

$result = $provider === 'openai'
    ? call_openai($apiKey, $model, $instructions, $history, $message, $temperature, $maxOutputTokens)
    : call_gemini($apiKey, $model, $instructions, $history, $message, $temperature, $maxOutputTokens);

if (!$result['ok']) {
    respond((int) ($result['status'] ?? 502), [
        'ok' => false,
        'error' => $result['error'] ?? 'Falha ao gerar resposta da IA.',
        'provider' => $provider,
        'model' => $model,
    ]);
}

respond(200, [
    'ok' => true,
    'reply' => $result['reply'],
    'provider' => $provider,
    'model' => $model,
]);
