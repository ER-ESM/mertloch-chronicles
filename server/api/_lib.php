<?php
/**
 * Mertloch Chronicles · Online-API (Stufe A/B nach docs/ONLINE-MMORPG-VORBEREITUNG-2026-09-19.md).
 * Läuft auf dem Strato-Webspace (PHP 8.4, MariaDB). Konfiguration liegt AUSSERHALB des Docroot:
 *   /home/www/mertloch-config.php  (chmod 600, Vorlage: server/mertloch-config.example.php)
 * Docroot ist /home/www/Mertloch, diese Datei liegt unter /home/www/Mertloch/api/.
 * Grundsätze: nur JSON, nur gleiche Herkunft (kein CORS), Sitzungstoken als HttpOnly-Cookie,
 * Prepared Statements, Bremse gegen Passwortraten, fail-open bei DB-Störung nur für die Bremse.
 */
declare(strict_types=1);

const MERTLOCH_API_VERSION = 1;
const MERTLOCH_SESSION_COOKIE = 'mertloch_session';
const MERTLOCH_SESSION_DAYS = 90;
const MERTLOCH_SAVE_MAX_BYTES = 512 * 1024;

function mertloch_config_path(): string {
    return dirname(__DIR__, 2) . '/mertloch-config.php';
}

function mertloch_config(): array {
    static $cfg = null;
    if ($cfg === null) {
        $path = mertloch_config_path();
        if (!is_file($path)) {
            mertloch_fail(503, 'config-missing', 'Server-Konfiguration fehlt (mertloch-config.php).');
        }
        $cfg = require $path;
        if (!is_array($cfg)) {
            mertloch_fail(503, 'config-invalid', 'Server-Konfiguration ist unlesbar.');
        }
    }
    return $cfg;
}

function mertloch_pdo(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $c = mertloch_config();
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $c['db_host'], (int)($c['db_port'] ?? 3306), $c['db_name']);
        $pdo = new PDO($dsn, $c['db_user'], $c['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

// ── Antworten ────────────────────────────────────────────────────────────────
function mertloch_headers(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
}

function mertloch_ok(array $data = []): never {
    mertloch_headers();
    echo json_encode(['ok' => true, 'api' => MERTLOCH_API_VERSION] + $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function mertloch_fail(int $status, string $code, string $message, array $extra = []): never {
    http_response_code($status);
    mertloch_headers();
    echo json_encode(['ok' => false, 'api' => MERTLOCH_API_VERSION, 'error' => $code, 'message' => $message] + $extra, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** JSON-Body lesen; leerer Body ergibt ein leeres Array. */
function mertloch_body(int $maxBytes = 64 * 1024): array {
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || $raw === '') return [];
    if (strlen($raw) > $maxBytes) mertloch_fail(413, 'too-large', 'Anfrage ist zu groß.');
    $data = json_decode($raw, true);
    if (!is_array($data)) mertloch_fail(400, 'bad-json', 'Anfrage ist kein gültiges JSON.');
    return $data;
}

function mertloch_method(string ...$allowed): string {
    $m = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($m, $allowed, true)) mertloch_fail(405, 'method', 'Methode nicht erlaubt.');
    return $m;
}

/** Gleiche Herkunft erzwingen: Browser senden bei Cross-Site-Anfragen Sec-Fetch-Site ≠ same-origin. */
function mertloch_same_origin(): void {
    $site = $_SERVER['HTTP_SEC_FETCH_SITE'] ?? '';
    if ($site !== '' && $site !== 'same-origin' && $site !== 'none') {
        mertloch_fail(403, 'origin', 'Nur von der Spielseite selbst erlaubt.');
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $host = $_SERVER['HTTP_HOST'] ?? '';
        $originHost = parse_url($origin, PHP_URL_HOST) ?: '';
        if (strcasecmp($originHost, $host) !== 0) mertloch_fail(403, 'origin', 'Nur von der Spielseite selbst erlaubt.');
    }
}

// ── Bremse (wie homepage/demos/api/_lib.php) ─────────────────────────────────
function mertloch_client_ip(): string {
    return substr((string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), 0, 45);
}

function mertloch_throttle_ok(string $scope): bool {
    try {
        $st = mertloch_pdo()->prepare('SELECT locked_until FROM login_attempt WHERE ip = ? AND scope = ?');
        $st->execute([mertloch_client_ip(), $scope]);
        $lu = $st->fetchColumn();
        return !($lu && strtotime((string)$lu) > time());
    } catch (Throwable) {
        return true;
    }
}

function mertloch_throttle_fail(string $scope, int $limit = 8, int $minutes = 15): void {
    try {
        $pdo = mertloch_pdo();
        $ip = mertloch_client_ip();
        $st = $pdo->prepare('SELECT fails, first_fail FROM login_attempt WHERE ip = ? AND scope = ?');
        $st->execute([$ip, $scope]);
        $row = $st->fetch();
        if (!$row || strtotime((string)$row['first_fail']) < time() - $minutes * 60) {
            $pdo->prepare('REPLACE INTO login_attempt (ip, scope, fails, first_fail, locked_until) VALUES (?, ?, 1, NOW(), NULL)')->execute([$ip, $scope]);
            return;
        }
        $fails = (int)$row['fails'] + 1;
        $lock = $fails >= $limit ? date('Y-m-d H:i:s', time() + $minutes * 60) : null;
        $pdo->prepare('UPDATE login_attempt SET fails = ?, locked_until = ? WHERE ip = ? AND scope = ?')->execute([$fails, $lock, $ip, $scope]);
    } catch (Throwable) {
    }
}

function mertloch_throttle_reset(string $scope): void {
    try {
        mertloch_pdo()->prepare('DELETE FROM login_attempt WHERE ip = ? AND scope = ?')->execute([mertloch_client_ip(), $scope]);
    } catch (Throwable) {
    }
}

// ── Sitzungen ────────────────────────────────────────────────────────────────
function mertloch_token_hash(string $token): string {
    return hash('sha256', $token);
}

function mertloch_session_start(int $accountId): string {
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', time() + MERTLOCH_SESSION_DAYS * 86400);
    mertloch_pdo()->prepare('INSERT INTO session (token_hash, account_id, created_at, expires_at, last_seen_at, user_agent) VALUES (?, ?, NOW(), ?, NOW(), ?)')
        ->execute([mertloch_token_hash($token), $accountId, $expires, substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 200)]);
    setcookie(MERTLOCH_SESSION_COOKIE, $token, [
        'expires' => time() + MERTLOCH_SESSION_DAYS * 86400,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    return $token;
}

function mertloch_session_end(): void {
    $token = $_COOKIE[MERTLOCH_SESSION_COOKIE] ?? '';
    if ($token !== '') {
        try {
            mertloch_pdo()->prepare('DELETE FROM session WHERE token_hash = ?')->execute([mertloch_token_hash($token)]);
        } catch (Throwable) {
        }
    }
    setcookie(MERTLOCH_SESSION_COOKIE, '', ['expires' => time() - 3600, 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Strict']);
}

/** Konto der aktuellen Sitzung oder null. Verlängert die Sitzung beim Zugriff. */
function mertloch_account(): ?array {
    static $account = false;
    if ($account !== false) return $account;
    $account = null;
    $token = $_COOKIE[MERTLOCH_SESSION_COOKIE] ?? '';
    if ($token === '' || strlen($token) !== 64) return null;
    $st = mertloch_pdo()->prepare('SELECT a.id, a.email, a.display_name, a.created_at, a.role FROM session s JOIN account a ON a.id = s.account_id WHERE s.token_hash = ? AND s.expires_at > NOW() AND a.deleted_at IS NULL');
    $st->execute([mertloch_token_hash($token)]);
    $row = $st->fetch();
    if (!$row) return null;
    mertloch_pdo()->prepare('UPDATE session SET last_seen_at = NOW(), expires_at = ? WHERE token_hash = ?')
        ->execute([date('Y-m-d H:i:s', time() + MERTLOCH_SESSION_DAYS * 86400), mertloch_token_hash($token)]);
    $account = $row;
    return $account;
}

function mertloch_require_account(): array {
    $a = mertloch_account();
    if (!$a) mertloch_fail(401, 'not-signed-in', 'Bitte zuerst anmelden.');
    return $a;
}

function mertloch_public_account(array $a): array {
    return ['id' => (int)$a['id'], 'email' => $a['email'], 'name' => $a['display_name'], 'since' => $a['created_at'], 'role' => $a['role'] ?? 'player'];
}

/** Anzeigename: 3–20 Zeichen, Buchstaben/Ziffern/Leerzeichen/Bindestrich, kein reiner Zahlenname. */
function mertloch_valid_name(string $name): bool {
    $name = trim($name);
    return (bool)preg_match('/^[\p{L}\p{N}][\p{L}\p{N} \-]{1,18}[\p{L}\p{N}]$/u', $name) && !preg_match('/^\p{N}+$/u', $name);
}
