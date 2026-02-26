<?php
const VALID_CATEGORIAS = ['centro', 'cenefa', 'esquina', 'hexagonales', 'antiderrapante'];

function carga_mapa_categorias_csv(string $csvPath): array {
    if (!file_exists($csvPath)) return [];
    $h = fopen($csvPath, 'r');
    if ($h === false) return [];
    $header = fgetcsv($h);
    if (!is_array($header)) {
        fclose($h);
        return [];
    }
    $map = [];
    while (($row = fgetcsv($h)) !== false) {
        $folder = strtolower(trim((string)($row[0] ?? '')));
        $cat = strtolower(trim((string)($row[1] ?? '')));
        if ($folder === '' || str_starts_with($folder, '#')) continue;
        $map[$folder] = in_array($cat, VALID_CATEGORIAS, true) ? $cat : '';
    }
    fclose($h);
    return $map;
}

function carpeta_modelo_de_item(array $item): string {
    $folder = trim((string)($item['carpeta_modelo'] ?? ''));
    if ($folder !== '') return strtolower($folder);
    $img = trim((string)($item['imagen'] ?? ''));
    if (preg_match('#(?:^|/)Tapiz/([^/]+)/#i', $img, $m)) {
        return strtolower(rawurldecode($m[1]));
    }
    return '';
}

function normaliza_item(array $m): array {
    return [
        'id' => (int)($m['id'] ?? 0),
        'nombre' => (string)($m['nombre'] ?? 'Sin nombre'),
        'imagen' => (string)($m['imagen'] ?? 'assets/placeholder-tile.svg'),
        'categoria' => strtolower(trim((string)($m['categoria'] ?? ''))),
        'identificador' => (string)($m['identificador'] ?? ''),
        'carpeta_modelo' => (string)($m['carpeta_modelo'] ?? ''),
    ];
}

function carga_modelos(): array {
    $items = [];
    $configFile = __DIR__ . '/config/database.php';
    if (file_exists($configFile)) {
        $db = require $configFile;
        try {
            $pdo = new PDO(
                "mysql:host={$db['host']};port={$db['port']};dbname={$db['dbname']};charset=utf8mb4",
                $db['user'],
                $db['pass'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            $stmt = $pdo->query("SELECT id, nombre, imagen, categoria, identificador, carpeta_modelo FROM mosaicos");
            $items = array_map('normaliza_item', $stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Throwable $e) {
            $items = [];
        }
    }

    if (empty($items)) {
        $jsonPath = __DIR__ . '/config/modelos.json';
        if (file_exists($jsonPath)) {
            $decoded = json_decode((string)file_get_contents($jsonPath), true);
            if (is_array($decoded)) $items = array_map('normaliza_item', $decoded);
        }
    }

    if (empty($items)) {
        $tapizDir = __DIR__ . '/Tapiz';
        if (is_dir($tapizDir)) {
            $folders = array_filter(scandir($tapizDir) ?: [], static fn($n) => $n !== '.' && $n !== '..' && is_dir($tapizDir . '/' . $n));
            sort($folders, SORT_NATURAL | SORT_FLAG_CASE);
            $idx = 1;
            foreach ($folders as $folder) {
                $pngs = glob($tapizDir . '/' . $folder . '/*.png');
                if (!$pngs) continue;
                sort($pngs, SORT_NATURAL | SORT_FLAG_CASE);
                $src = $pngs[0];
                $items[] = normaliza_item([
                    'id' => $idx,
                    'nombre' => ucwords(str_replace(['_', '-'], ' ', $folder)),
                    'imagen' => 'Tapiz/' . rawurlencode($folder) . '/' . rawurlencode(basename($src)),
                    'categoria' => '',
                    'identificador' => '',
                    'carpeta_modelo' => $folder,
                ]);
                $idx++;
            }
        }
    }

    $catMap = carga_mapa_categorias_csv(__DIR__ . '/config/categorias.csv');
    if (!empty($catMap)) {
        foreach ($items as &$item) {
            $folder = carpeta_modelo_de_item($item);
            if ($folder !== '' && array_key_exists($folder, $catMap)) {
                $item['categoria'] = $catMap[$folder];
            }
        }
        unset($item);
    }

    usort($items, static fn($a, $b) => strcasecmp((string)$a['nombre'], (string)$b['nombre']));
    return $items;
}

function find_model(array $models, string $query, string $expectedCategory): ?array {
    $needle = strtolower(trim($query));
    if ($needle === '') return null;

    foreach ($models as $m) {
        if ($expectedCategory !== '' && ($m['categoria'] ?? '') !== $expectedCategory) continue;
        $candidates = [
            strtolower((string)($m['identificador'] ?? '')),
            strtolower((string)($m['nombre'] ?? '')),
            strtolower((string)($m['carpeta_modelo'] ?? '')),
            (string)($m['id'] ?? ''),
        ];
        if (in_array($needle, $candidates, true)) return $m;
    }
    return null;
}

function carga_tapetes_csv(string $csvPath, array $models): array {
    if (!file_exists($csvPath)) {
        $dir = dirname($csvPath);
        if (!is_dir($dir)) mkdir($dir, 0775, true);
        $h = fopen($csvPath, 'w');
        if ($h !== false) {
            fputcsv($h, ['Nombre_Tapete', 'Centro', 'Cenefa', 'Esquina']);
            fclose($h);
        }
        return [];
    }

    $h = fopen($csvPath, 'r');
    if ($h === false) return [];
    $header = fgetcsv($h);
    if (!is_array($header)) {
        fclose($h);
        return [];
    }

    $rows = [];
    while (($row = fgetcsv($h)) !== false) {
        $name = trim((string)($row[0] ?? ''));
        $centroQ = trim((string)($row[1] ?? ''));
        $cenefaQ = trim((string)($row[2] ?? ''));
        $esquinaQ = trim((string)($row[3] ?? ''));
        if ($name === '' || str_starts_with($name, '#')) continue;

        $centro = find_model($models, $centroQ, 'centro');
        $cenefa = find_model($models, $cenefaQ, 'cenefa');
        $esquina = find_model($models, $esquinaQ, 'esquina');

        $rows[] = [
            'nombre' => $name,
            'centro' => $centro,
            'cenefa' => $cenefa,
            'esquina' => $esquina,
        ];
    }
    fclose($h);
    return $rows;
}

$lang = ($_GET['lang'] ?? 'es') === 'en' ? 'en' : 'es';
$models = carga_modelos();
$tapetes = carga_tapetes_csv(__DIR__ . '/config/tapetes.csv', $models);
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tapetes | Mosaicos Dzununcán</title>
  <link rel="stylesheet" href="assets.css" />
</head>
<body>
  <main class="site">
    <header class="top">
      <div class="brand-row">
        <div class="logo"><img src="assets/logo-dzununcan.svg" alt="Mosaicos Dzununcán" /></div>
        <div class="langs"><span data-i18n="lang_label">Idioma</span> ▪
          <button class="lang-btn" data-set-lang="es" data-lang-active="es">🇲🇽</button>
          <button class="lang-btn" data-set-lang="en" data-lang-active="en">🇺🇸</button>
        </div>
      </div>
      <nav>
        <a data-keep-lang href="index.html" data-i18n="nav_home">Inicio</a>
        <a data-keep-lang href="mosaicos.html" data-i18n="nav_mosaics">Mosaicos</a>
        <a data-keep-lang href="galeria.html" data-i18n="nav_gallery">Galería</a>
        <a data-keep-lang href="mantenimiento.html" data-i18n="nav_maintenance">Mantenimiento</a>
        <a data-keep-lang href="instalacion.html" data-i18n="nav_installation">Instalación</a>
        <a data-keep-lang href="contacto.html" data-i18n="nav_contact">Contacto</a>
      </nav>
    </header>

    <div class="mosaic-strip"></div>

    <section>
      <h2>Tapetes</h2>
      <p>Defina sus tapetes en <code>config/tapetes.csv</code> con el formato: <strong>Nombre_Tapete,Centro,Cenefa,Esquina</strong>.</p>
      <a class="action cta-pill" data-keep-lang href="personalizar.php">Personalizar tapete</a>
    </section>

    <section class="panel tapetes-list">
      <?php if (empty($tapetes)): ?>
        <p class="empty-msg">Aún no hay tapetes configurados. Agrega filas en <code>config/tapetes.csv</code>.</p>
      <?php else: ?>
        <?php foreach ($tapetes as $tapete): ?>
          <article class="tapete-card">
            <canvas class="tapete-preview-canvas"
              width="1200" height="800"
              data-center-image="<?= htmlspecialchars($tapete['centro']['imagen'] ?? '', ENT_QUOTES) ?>"
              data-cenefa-image="<?= htmlspecialchars($tapete['cenefa']['imagen'] ?? '', ENT_QUOTES) ?>"
              data-esquina-image="<?= htmlspecialchars($tapete['esquina']['imagen'] ?? '', ENT_QUOTES) ?>"></canvas>
            <div class="tapete-meta">
              <h3><?= htmlspecialchars($tapete['nombre'], ENT_QUOTES) ?></h3>
              <p>
                Centro: <strong><?= htmlspecialchars($tapete['centro']['nombre'] ?? '—', ENT_QUOTES) ?></strong> ·
                Cenefa: <strong><?= htmlspecialchars($tapete['cenefa']['nombre'] ?? '—', ENT_QUOTES) ?></strong> ·
                Esquina: <strong><?= htmlspecialchars($tapete['esquina']['nombre'] ?? '—', ENT_QUOTES) ?></strong>
              </p>
            </div>
          </article>
        <?php endforeach; ?>
      <?php endif; ?>
    </section>
  </main>

  <script src="app.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
