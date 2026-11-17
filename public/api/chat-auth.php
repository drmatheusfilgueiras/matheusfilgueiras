<?php
declare(strict_types=1);

require_once __DIR__ . '/_chat-auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Allow: GET, POST, DELETE');

function auth_respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    auth_respond(200, [
        'ok' => true,
        'authorized' => chat_admin_is_authorized(),
    ]);
}

if ($method === 'POST') {
    if (!chat_admin_same_origin()) {
        auth_respond(403, ['ok' => false, 'error' => 'Origem nao autorizada.']);
    }

    if (!chat_admin_key_configured()) {
        auth_respond(503, ['ok' => false, 'error' => 'O acesso do painel ainda precisa ser configurado no servidor.']);
    }

    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 4096) {
        auth_respond(400, ['ok' => false, 'error' => 'Solicitacao invalida.']);
    }

    $payload = json_decode($raw, true);
    $key = is_array($payload) ? ($payload['key'] ?? null) : null;
    if (!is_string($key) || !chat_admin_verify_key($key)) {
        usleep(350000);
        auth_respond(401, ['ok' => false, 'error' => 'Chave de acesso invalida.']);
    }

    chat_admin_authorize_session();
    auth_respond(200, ['ok' => true, 'authorized' => true]);
}

if ($method === 'DELETE') {
    if (!chat_admin_same_origin()) {
        auth_respond(403, ['ok' => false, 'error' => 'Origem nao autorizada.']);
    }
    chat_admin_logout();
    auth_respond(200, ['ok' => true, 'authorized' => false]);
}

auth_respond(405, ['ok' => false, 'error' => 'Metodo nao permitido.']);
