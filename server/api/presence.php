<?php
/**
 * Anwesenheit (Stufe B light): andere Spieler im selben Weltbereich sehen.
 * POST {world, x, y, facing, classId, level, spec, state}  alle 2 s vom Client (nur angemeldet)
 *  → {others:[{name, x, y, facing, classId, level, spec, state, age}]} innerhalb von 900 Welteinheiten,
 *    zuletzt gesehen vor höchstens 12 s. Kein Kampf, keine Interaktion – nur Sichtbarkeit und Namen.
 * DELETE (POST {leave:true}) entfernt den eigenen Eintrag.
 */
declare(strict_types=1);
require __DIR__ . '/_lib.php';
mertloch_same_origin();
mertloch_method('POST');
$a = mertloch_require_account();
$body = mertloch_body();

try {
    $pdo = mertloch_pdo();
    if (!empty($body['leave'])) {
        $pdo->prepare('DELETE FROM presence WHERE account_id = ?')->execute([$a['id']]);
        mertloch_ok(['others' => []]);
    }
    $world = substr((string)($body['world'] ?? ''), 0, 80);
    $x = (float)($body['x'] ?? 0); $y = (float)($body['y'] ?? 0);
    if ($world === '' || !is_finite($x) || !is_finite($y)) mertloch_fail(400, 'position', 'Position fehlt.');
    $facing = (int)($body['facing'] ?? 1) >= 0 ? 1 : -1;
    $classId = substr((string)($body['classId'] ?? 'dieter'), 0, 20);
    $level = max(1, min(60, (int)($body['level'] ?? 1)));
    $spec = substr((string)($body['spec'] ?? ''), 0, 40);
    $state = substr((string)($body['state'] ?? 'idle'), 0, 16);
    $pdo->prepare('REPLACE INTO presence (account_id, world_key, x, y, facing, class_id, level, spec, state, seen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())')
        ->execute([$a['id'], $world, $x, $y, $facing, $classId, $level, $spec, $state]);
    // Alte Einträge aufräumen (günstig, klein)
    $pdo->exec('DELETE FROM presence WHERE seen_at < NOW() - INTERVAL 5 MINUTE');
    $st = $pdo->prepare('SELECT ac.display_name AS name, p.x, p.y, p.facing, p.class_id AS classId, p.level, p.spec, p.state, TIMESTAMPDIFF(SECOND, p.seen_at, NOW()) AS age
        FROM presence p JOIN account ac ON ac.id = p.account_id
        WHERE p.world_key = ? AND p.account_id <> ? AND p.seen_at > NOW() - INTERVAL 12 SECOND
          AND ABS(p.x - ?) < 900 AND ABS(p.y - ?) < 900
        LIMIT 40');
    $st->execute([$world, $a['id'], $x, $y]);
    $others = array_map(static fn(array $r) => ['name' => $r['name'], 'x' => (float)$r['x'], 'y' => (float)$r['y'], 'facing' => (int)$r['facing'], 'classId' => $r['classId'], 'level' => (int)$r['level'], 'spec' => $r['spec'], 'state' => $r['state'], 'age' => (int)$r['age']], $st->fetchAll());
    mertloch_ok(['others' => $others]);
} catch (PDOException $e) {
    mertloch_fail(503, 'db', 'Datenbank nicht erreichbar.');
}
