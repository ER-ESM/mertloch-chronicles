<?php
/** Lebenszeichen: PHP läuft, Konfiguration da, Datenbank antwortet, Tabellen vorhanden. Keine Geheimnisse in der Antwort. */
declare(strict_types=1);
require __DIR__ . '/_lib.php';
mertloch_method('GET');
$out = ['php' => PHP_VERSION, 'config' => is_file(mertloch_config_path()), 'db' => false, 'tables' => []];
try {
    $pdo = mertloch_pdo();
    $out['db'] = true;
    $out['tables'] = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    $out['accounts'] = (int)$pdo->query('SELECT COUNT(*) FROM account WHERE deleted_at IS NULL')->fetchColumn();
} catch (Throwable $e) {
    $out['db'] = false;
}
mertloch_ok($out);
