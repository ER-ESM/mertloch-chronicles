<?php
/**
 * Cloud-Spielstand je Konto und Welt-Schlüssel.
 * GET  ?world=<worldKey>            → {save, savedAt, updatedAt} oder save:null
 * GET  ?list=1                      → alle Spielstände des Kontos (Kopfzeilen)
 * POST {world, save, savedAt}       → speichert, wenn savedAt neuer als der gespeicherte Stand;
 *                                     sonst {ok:true, stale:true, server:{save,savedAt}} – der Client entscheidet.
 * Der Spielstand ist das JSON aus Game.save() (Version 1); Größe begrenzt. Der vorherige Stand bleibt als Sicherung.
 */
declare(strict_types=1);
require __DIR__ . '/_lib.php';
mertloch_same_origin();
$method = mertloch_method('GET', 'POST');
$a = mertloch_require_account();

try {
    $pdo = mertloch_pdo();
    if ($method === 'GET') {
        if (isset($_GET['list'])) {
            $st = $pdo->prepare('SELECT world_key, saved_at, updated_at, LENGTH(save_json) AS bytes, level, class_id, spec FROM character_save WHERE account_id = ? ORDER BY updated_at DESC');
            $st->execute([$a['id']]);
            mertloch_ok(['saves' => $st->fetchAll()]);
        }
        $world = (string)($_GET['world'] ?? '');
        if ($world === '' || strlen($world) > 80) mertloch_fail(400, 'world', 'Welt-Schlüssel fehlt.');
        $st = $pdo->prepare('SELECT save_json, saved_at, updated_at FROM character_save WHERE account_id = ? AND world_key = ?');
        $st->execute([$a['id'], $world]);
        $row = $st->fetch();
        if (!$row) mertloch_ok(['save' => null]);
        mertloch_ok(['save' => json_decode($row['save_json'], true), 'savedAt' => (int)$row['saved_at'], 'updatedAt' => $row['updated_at']]);
    }
    $body = mertloch_body(MERTLOCH_SAVE_MAX_BYTES);
    $world = (string)($body['world'] ?? '');
    $save = $body['save'] ?? null;
    $savedAt = (int)($body['savedAt'] ?? 0);
    if ($world === '' || strlen($world) > 80) mertloch_fail(400, 'world', 'Welt-Schlüssel fehlt.');
    if (!is_array($save) || ($save['version'] ?? null) !== 1) mertloch_fail(400, 'save', 'Spielstand hat nicht Version 1.');
    if ($savedAt <= 0) mertloch_fail(400, 'savedAt', 'Zeitstempel fehlt.');
    $json = json_encode($save, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || strlen($json) > MERTLOCH_SAVE_MAX_BYTES) mertloch_fail(413, 'too-large', 'Spielstand ist zu groß.');
    $level = (int)($save['level'] ?? 0);
    $classId = substr((string)($save['classId'] ?? ''), 0, 20);
    $spec = substr((string)($save['rpg']['talents']['spec'] ?? ''), 0, 40);

    $st = $pdo->prepare('SELECT save_json, saved_at FROM character_save WHERE account_id = ? AND world_key = ? FOR UPDATE');
    $pdo->beginTransaction();
    $st->execute([$a['id'], $world]);
    $row = $st->fetch();
    if ($row && (int)$row['saved_at'] > $savedAt) {
        $pdo->rollBack();
        mertloch_ok(['stale' => true, 'server' => ['save' => json_decode($row['save_json'], true), 'savedAt' => (int)$row['saved_at']]]);
    }
    if ($row) {
        $pdo->prepare('UPDATE character_save SET previous_json = save_json, save_json = ?, saved_at = ?, updated_at = NOW(), level = ?, class_id = ?, spec = ? WHERE account_id = ? AND world_key = ?')
            ->execute([$json, $savedAt, $level, $classId, $spec, $a['id'], $world]);
    } else {
        $pdo->prepare('INSERT INTO character_save (account_id, world_key, save_json, previous_json, saved_at, updated_at, level, class_id, spec) VALUES (?, ?, ?, NULL, ?, NOW(), ?, ?, ?)')
            ->execute([$a['id'], $world, $json, $savedAt, $level, $classId, $spec]);
    }
    $pdo->commit();
    mertloch_ok(['savedAt' => $savedAt]);
} catch (PDOException $e) {
    mertloch_fail(503, 'db', 'Datenbank nicht erreichbar.');
}
