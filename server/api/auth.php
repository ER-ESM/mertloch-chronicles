<?php
/**
 * Konto: register | login | logout | me | rename | password | delete
 * POST JSON {action, email, password, name, newPassword, confirm}
 * E-Mail + Passwort (bcrypt). Keine Bestätigungsmail in Stufe A; die Adresse dient als Anmeldename und
 * für die spätere Passwort-Zurücksetzung. Kontolöschung entfernt Konto, Sitzungen, Spielstände, Anwesenheit.
 */
declare(strict_types=1);
require __DIR__ . '/_lib.php';
mertloch_same_origin();
$method = mertloch_method('GET', 'POST');
$body = $method === 'POST' ? mertloch_body() : [];
$action = (string)($body['action'] ?? ($_GET['action'] ?? 'me'));

try {
    switch ($action) {
        case 'me': {
            $a = mertloch_account();
            mertloch_ok(['account' => $a ? mertloch_public_account($a) : null]);
        }
        case 'register': {
            if (!mertloch_throttle_ok('register')) mertloch_fail(429, 'throttled', 'Zu viele Versuche. Bitte in 15 Minuten erneut.');
            $email = strtolower(trim((string)($body['email'] ?? '')));
            $password = (string)($body['password'] ?? '');
            $name = trim((string)($body['name'] ?? ''));
            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) mertloch_fail(400, 'email', 'Bitte eine gültige E-Mail-Adresse angeben.');
            if (strlen($password) < 10 || strlen($password) > 200) mertloch_fail(400, 'password', 'Das Passwort braucht mindestens 10 Zeichen.');
            if (!mertloch_valid_name($name)) mertloch_fail(400, 'name', 'Der Spielername braucht 3 bis 20 Zeichen (Buchstaben, Ziffern, Leerzeichen, Bindestrich).');
            $pdo = mertloch_pdo();
            $st = $pdo->prepare('SELECT id FROM account WHERE email = ? OR display_name = ?');
            $st->execute([$email, $name]);
            if ($st->fetch()) { mertloch_throttle_fail('register'); mertloch_fail(409, 'taken', 'E-Mail oder Spielername ist schon vergeben.'); }
            $pdo->prepare('INSERT INTO account (email, display_name, password_hash, created_at, role) VALUES (?, ?, ?, NOW(), \'player\')')
                ->execute([$email, $name, password_hash($password, PASSWORD_DEFAULT)]);
            $id = (int)$pdo->lastInsertId();
            mertloch_session_start($id);
            mertloch_throttle_reset('register');
            mertloch_ok(['account' => ['id' => $id, 'email' => $email, 'name' => $name, 'since' => date('Y-m-d H:i:s'), 'role' => 'player']]);
        }
        case 'login': {
            if (!mertloch_throttle_ok('login')) mertloch_fail(429, 'throttled', 'Zu viele Fehlversuche. Bitte in 15 Minuten erneut.');
            $email = strtolower(trim((string)($body['email'] ?? '')));
            $password = (string)($body['password'] ?? '');
            $st = mertloch_pdo()->prepare('SELECT * FROM account WHERE email = ? AND deleted_at IS NULL');
            $st->execute([$email]);
            $a = $st->fetch();
            if (!$a || !password_verify($password, $a['password_hash'])) { mertloch_throttle_fail('login'); mertloch_fail(401, 'credentials', 'E-Mail oder Passwort stimmt nicht.'); }
            if (password_needs_rehash($a['password_hash'], PASSWORD_DEFAULT)) {
                mertloch_pdo()->prepare('UPDATE account SET password_hash = ? WHERE id = ?')->execute([password_hash($password, PASSWORD_DEFAULT), $a['id']]);
            }
            mertloch_session_start((int)$a['id']);
            mertloch_throttle_reset('login');
            mertloch_ok(['account' => mertloch_public_account($a)]);
        }
        case 'logout': {
            mertloch_session_end();
            mertloch_ok(['account' => null]);
        }
        case 'rename': {
            $a = mertloch_require_account();
            $name = trim((string)($body['name'] ?? ''));
            if (!mertloch_valid_name($name)) mertloch_fail(400, 'name', 'Der Spielername braucht 3 bis 20 Zeichen.');
            $st = mertloch_pdo()->prepare('SELECT id FROM account WHERE display_name = ? AND id <> ?');
            $st->execute([$name, $a['id']]);
            if ($st->fetch()) mertloch_fail(409, 'taken', 'Dieser Spielername ist schon vergeben.');
            mertloch_pdo()->prepare('UPDATE account SET display_name = ? WHERE id = ?')->execute([$name, $a['id']]);
            $a['display_name'] = $name;
            mertloch_ok(['account' => mertloch_public_account($a)]);
        }
        case 'password': {
            $a = mertloch_require_account();
            $old = (string)($body['password'] ?? '');
            $new = (string)($body['newPassword'] ?? '');
            $st = mertloch_pdo()->prepare('SELECT password_hash FROM account WHERE id = ?');
            $st->execute([$a['id']]);
            if (!password_verify($old, (string)$st->fetchColumn())) mertloch_fail(401, 'credentials', 'Das bisherige Passwort stimmt nicht.');
            if (strlen($new) < 10 || strlen($new) > 200) mertloch_fail(400, 'password', 'Das neue Passwort braucht mindestens 10 Zeichen.');
            mertloch_pdo()->prepare('UPDATE account SET password_hash = ? WHERE id = ?')->execute([password_hash($new, PASSWORD_DEFAULT), $a['id']]);
            mertloch_ok();
        }
        case 'delete': {
            $a = mertloch_require_account();
            if (($body['confirm'] ?? '') !== 'LÖSCHEN') mertloch_fail(400, 'confirm', 'Zum Löschen das Wort LÖSCHEN mitsenden.');
            $pdo = mertloch_pdo();
            $pdo->beginTransaction();
            $pdo->prepare('DELETE FROM presence WHERE account_id = ?')->execute([$a['id']]);
            $pdo->prepare('DELETE FROM leaderboard_entry WHERE account_id = ?')->execute([$a['id']]);
            $pdo->prepare('DELETE FROM character_save WHERE account_id = ?')->execute([$a['id']]);
            $pdo->prepare('DELETE FROM session WHERE account_id = ?')->execute([$a['id']]);
            $pdo->prepare('UPDATE account SET email = CONCAT(\'deleted-\', id, \'@invalid\'), display_name = CONCAT(\'gelöscht-\', id), password_hash = \'\', deleted_at = NOW() WHERE id = ?')->execute([$a['id']]);
            $pdo->commit();
            mertloch_session_end();
            mertloch_ok(['account' => null]);
        }
        default:
            mertloch_fail(400, 'action', 'Unbekannte Aktion.');
    }
} catch (PDOException $e) {
    mertloch_fail(503, 'db', 'Datenbank nicht erreichbar.');
}
