<?php
declare(strict_types=1);

// Security: do not put the administrator's password or its hash in the webroot
// or in the Git repository. Configure CHAT_CONTROL_KEY_HASH in the PHP
// environment, or create .chat-control-key-hash OUTSIDE public_html.
const CHAT_ADMIN_SESSION_NAME = 'matheus_chat_admin';
const CHAT_ADMIN_SESSION_TTL = 7200;

function chat_admin_expected_hash(): string
{
    $configured = trim((string) (getenv('CHAT_CONTROL_KEY_HASH') ?: ''));
    if (preg_match('/^[a-f0-9]{64}$/i', $configured)) {
        return strtolower($configured);
    }

    // __DIR__ is public_html/api in the deployed build; dirname(..., 2)
    // is the domain directory, outside the publicly served document root.
    $privateFile = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.chat-control-key-hash';
    if (is_readable($privateFile)) {
        $value = trim((string) file_get_contents($privateFile));
        if (preg_match('/^[a-f0-9]{64}$/i', $value)) {
            return strtolower($value);
        }
    }

    return '';
}

function chat_admin_key_configured(): bool
{
    return chat_admin_expected_hash() !== '';
}

function chat_admin_verify_key(string $candidate): bool
{
    $storedHash = chat_admin_expected_hash();
    if ($storedHash === '' || $candidate === '') {
        return false;
    }
    return hash_equals($storedHash, hash('sha256', $candidate));
}

function chat_admin_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name(CHAT_ADMIN_SESSION_NAME);
    ini_set('session.use_strict_mode', '1');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/api',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function chat_admin_is_authorized(): bool
{
    // Normal visitor traffic must not create administrator sessions.
    if (empty($_COOKIE[CHAT_ADMIN_SESSION_NAME])) {
        return false;
    }
    chat_admin_start_session();
    $authenticatedAt = $_SESSION['chat_admin_authenticated_at'] ?? 0;
    if (!is_int($authenticatedAt) || time() - $authenticatedAt > CHAT_ADMIN_SESSION_TTL) {
        unset($_SESSION['chat_admin_authenticated_at']);
        return false;
    }
    return true;
}

function chat_admin_authorize_session(): void
{
    chat_admin_start_session();
    session_regenerate_id(true);
    $_SESSION['chat_admin_authenticated_at'] = time();
}

function chat_admin_logout(): void
{
    if (empty($_COOKIE[CHAT_ADMIN_SESSION_NAME])) {
        return;
    }
    chat_admin_start_session();
    $_SESSION = [];
    session_destroy();
    setcookie(CHAT_ADMIN_SESSION_NAME, '', [
        'expires' => time() - 3600,
        'path' => '/api',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

function chat_admin_same_origin(): bool
{
    $siteHost = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $siteHost = preg_replace('/:\\d+$/', '', $siteHost);
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '') {
        $originHost = strtolower((string) (parse_url($origin, PHP_URL_HOST) ?: ''));
        return $originHost !== '' && hash_equals($siteHost, $originHost);
    }

    $referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
    if ($referer !== '') {
        $refererHost = strtolower((string) (parse_url($referer, PHP_URL_HOST) ?: ''));
        return $refererHost !== '' && hash_equals($siteHost, $refererHost);
    }
    return true;
}
