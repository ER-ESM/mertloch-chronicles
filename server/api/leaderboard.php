<?php
/**
 * Bestenlisten. GET ?board=level|arena-dps|arena-fight → Top 20 (je Konto ein Eintrag, bester Wert).
 * POST {board, value, meta} (angemeldet) → eigener Bestwert wird ersetzt, wenn value höher ist.
 * Werte kommen vom Client und sind daher nur so ehrlich wie der Client (Stufe A ohne Server-Autorität) –
 * deshalb keine Belohnungen daran knüpfen.
 */
declare(strict_types=1);
require __DIR__ . '/_lib.php';
mertloch_same_origin();
$method = mertloch_method('GET', 'POST');
const BOARDS = ['level', 'arena-dps', 'arena-fight'];

try {
    $pdo = mertloch_pdo();
    if ($method === 'GET') {
        $board = (string)($_GET['board'] ?? 'level');
        if (!in_array($board, BOARDS, true)) mertloch_fail(400, 'board', 'Unbekannte Liste.');
        $st = $pdo->prepare('SELECT ac.display_name AS name, l.value, l.meta_json AS meta, l.updated_at FROM leaderboard_entry l JOIN account ac ON ac.id = l.account_id WHERE l.board = ? AND ac.deleted_at IS NULL ORDER BY l.value DESC, l.updated_at ASC LIMIT 20');
        $st->execute([$board]);
        $rows = array_map(static fn(array $r) => ['name' => $r['name'], 'value' => (float)$r['value'], 'meta' => $r['meta'] ? json_decode($r['meta'], true) : null, 'at' => $r['updated_at']], $st->fetchAll());
        $a = mertloch_account();
        $mine = null;
        if ($a) {
            $st = $pdo->prepare('SELECT value, meta_json FROM leaderboard_entry WHERE board = ? AND account_id = ?');
            $st->execute([$board, $a['id']]);
            $m = $st->fetch();
            if ($m) $mine = ['value' => (float)$m['value'], 'meta' => $m['meta_json'] ? json_decode($m['meta_json'], true) : null];
        }
        mertloch_ok(['board' => $board, 'entries' => $rows, 'mine' => $mine]);
    }
    $a = mertloch_require_account();
    $body = mertloch_body();
    $board = (string)($body['board'] ?? '');
    $value = (float)($body['value'] ?? 0);
    if (!in_array($board, BOARDS, true)) mertloch_fail(400, 'board', 'Unbekannte Liste.');
    if (!is_finite($value) || $value < 0 || $value > 1e9) mertloch_fail(400, 'value', 'Wert ungültig.');
    $meta = isset($body['meta']) && is_array($body['meta']) ? json_encode($body['meta'], JSON_UNESCAPED_UNICODE) : null;
    if ($meta !== null && strlen($meta) > 2000) $meta = null;
    $pdo->prepare('INSERT INTO leaderboard_entry (board, account_id, value, meta_json, updated_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE value = IF(VALUES(value) > value, VALUES(value), value), meta_json = IF(VALUES(value) > value, VALUES(meta_json), meta_json), updated_at = IF(VALUES(value) > value, NOW(), updated_at)')
        ->execute([$board, $a['id'], $value, $meta]);
    mertloch_ok();
} catch (PDOException $e) {
    mertloch_fail(503, 'db', 'Datenbank nicht erreichbar.');
}
