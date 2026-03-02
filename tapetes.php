<?php
require_once __DIR__ . '/compat-php56.php';
if (defined('PHP_VERSION_ID') && PHP_VERSION_ID < 70000) {
    $legacy = __DIR__ . '/legacy-php56/tapetes.php';
    if (file_exists($legacy)) {
        require $legacy;
        exit;
    }
}

const VALID_CATEGORIAS = ['centro', 'cenefa', 'esquina', 'cenefa_exterior', 'esquina_exterior', 'hexagonales', 'antiderrapante'];

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
    if (preg_match('#(?:^|/)(?:Tapete|Tapetes)/([^/]+)/#i', $img, $m)) {
        return strtolower(rawurldecode($m[1]));
    }
    return '';
}



function build_image_rel_with_version(string $baseName, string $folder, string $fileName, string $absPath): string {
    $rel = $baseName . '/' . rawurlencode($folder) . '/' . rawurlencode($fileName);
    $mtime = @filemtime($absPath);
    if ($mtime !== false) $rel .= '?v=' . $mtime;
    return $rel;
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
    $bases = [__DIR__ . '/Tapete', __DIR__ . '/Tapetes'];
    $idx = 1;

    foreach ($bases as $baseDir) {
        if (!is_dir($baseDir)) continue;
        $folders = array_filter(scandir($baseDir) ?: [], static fn($n) => $n !== '.' && $n !== '..' && is_dir($baseDir . '/' . $n));
        sort($folders, SORT_NATURAL | SORT_FLAG_CASE);

        $baseName = basename($baseDir);
        foreach ($folders as $folder) {
            $pngs = glob($baseDir . '/' . $folder . '/*.png');
            if (!$pngs) continue;
            sort($pngs, SORT_NATURAL | SORT_FLAG_CASE);
            $src = $pngs[0];
            $items[] = normaliza_item([
                'id' => $idx,
                'nombre' => ucwords(str_replace(['_', '-'], ' ', $folder)),
                'imagen' => build_image_rel_with_version($baseName, $folder, basename($src), $src),
                'categoria' => '',
                'identificador' => strtoupper($folder),
                'carpeta_modelo' => $folder,
            ]);
            $idx++;
        }
    }

    usort($items, static fn($a, $b) => strcasecmp((string)$a['nombre'], (string)$b['nombre']));
    return $items;
}

function find_model(array $models, string $query): ?array {
    $needle = strtolower(trim($query));
    if ($needle === '') return null;
    $needleNorm = preg_replace('/[^a-z0-9]/', '', $needle);

    foreach ($models as $m) {
        $candidates = [
            strtolower((string)($m['identificador'] ?? '')),
            strtolower((string)($m['nombre'] ?? '')),
            strtolower((string)($m['carpeta_modelo'] ?? '')),
            (string)($m['id'] ?? ''),
        ];
        foreach ($candidates as $candidate) {
            if ($candidate === $needle) return $m;
            $candidateNorm = preg_replace('/[^a-z0-9]/', '', (string)$candidate);
            if ($candidateNorm !== '' && $candidateNorm === $needleNorm) return $m;
        }
    }
    return null;
}

function carga_tapetes_csv(string $csvPath, array $models): array {
    if (!file_exists($csvPath)) {
        $dir = dirname($csvPath);
        if (!is_dir($dir)) mkdir($dir, 0775, true);
        $h = fopen($csvPath, 'w');
        if ($h !== false) {
            fputcsv($h, ['Nombre_Tapete', 'Centro', 'Cenefa', 'Esquina', 'Cenefa_Exterior', 'Esquina_Exterior', 'Cenefa_Rotacion_Alterna']);
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
        $cenefaOuterQ = trim((string)($row[4] ?? ''));
        $esquinaOuterQ = trim((string)($row[5] ?? ''));
        $cenefaAltRotateRaw = trim((string)($row[6] ?? ''));
        $cenefaAltRotate = in_array(strtolower($cenefaAltRotateRaw), ['1','true','si','sí','yes'], true);
        if ($name === '' || str_starts_with($name, '#')) continue;

        $centro = find_model($models, $centroQ);
        $cenefa = find_model($models, $cenefaQ);
        $esquina = find_model($models, $esquinaQ);
        $cenefaOuter = find_model($models, $cenefaOuterQ);
        $esquinaOuter = find_model($models, $esquinaOuterQ);

        $rows[] = [
            'nombre' => $name,
            'centro' => $centro,
            'cenefa' => $cenefa,
            'esquina' => $esquina,
            'cenefa_exterior' => $cenefaOuter,
            'esquina_exterior' => $esquinaOuter,
            'cenefa_rotacion_alterna' => $cenefaAltRotate || !empty($cenefa['cenefa_rotacion_alterna']),
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
      <h2><?= $lang === 'en' ? 'Rugs' : 'Tapetes' ?></h2>
      <a class="action cta-pill" data-keep-lang href="personalizar.php?picker=dual&amp;source=tapete"><?= $lang === 'en' ? 'Customize rug' : 'Personalizar tapete' ?></a>
    </section>

    <section class="panel tapetes-list">
      <?php if (empty($tapetes)): ?>
        <p class="empty-msg"><?= $lang === 'en' ? 'No rugs configured yet. Add rows in <code>config/tapetes.csv</code>.' : 'Aún no hay tapetes configurados. Agrega filas en <code>config/tapetes.csv</code>.' ?></p>
      <?php else: ?>
        <?php foreach ($tapetes as $tapete): ?>
          <article class="tapete-card">
            <canvas class="tapete-preview-canvas"
              width="1200" height="800"
              data-center-image="<?= htmlspecialchars($tapete['centro']['imagen'] ?? '', ENT_QUOTES) ?>"
              data-cenefa-image="<?= htmlspecialchars($tapete['cenefa']['imagen'] ?? '', ENT_QUOTES) ?>"
              data-cenefa-alt-rotate="<?= !empty($tapete['cenefa_rotacion_alterna']) ? '1' : '' ?>"
              data-esquina-image="<?= htmlspecialchars($tapete['esquina']['imagen'] ?? '', ENT_QUOTES) ?>"
              data-cenefa-outer-image="<?= htmlspecialchars($tapete['cenefa_exterior']['imagen'] ?? '', ENT_QUOTES) ?>"
              data-esquina-outer-image="<?= htmlspecialchars($tapete['esquina_exterior']['imagen'] ?? '', ENT_QUOTES) ?>"></canvas>
            <div class="tapete-meta">
              <?php
                $centerId = (string)($tapete['centro']['id'] ?? '');
                $cenefaId = (string)($tapete['cenefa']['id'] ?? '');
                $esquinaId = (string)($tapete['esquina']['id'] ?? '');
                $params = [
                  'picker' => 'dual',
                  'source' => 'tapete',
                  'lang' => $lang,
                  'name' => (string)$tapete['nombre'],
                  'cat' => 'centro',
                  'center_img' => (string)($tapete['centro']['imagen'] ?? ''),
                  'cenefa_img' => (string)($tapete['cenefa']['imagen'] ?? ''),
                  'esquina_img' => (string)($tapete['esquina']['imagen'] ?? ''),
                  'center_name' => (string)($tapete['centro']['nombre'] ?? ''),
                  'cenefa_name' => (string)($tapete['cenefa']['nombre'] ?? ''),
                  'cenefa_alt_rotate' => !empty($tapete['cenefa_rotacion_alterna']) ? '1' : '',
                  'esquina_name' => (string)($tapete['esquina']['nombre'] ?? ''),
                  'cenefa_outer_img' => (string)($tapete['cenefa_exterior']['imagen'] ?? ''),
                  'esquina_outer_img' => (string)($tapete['esquina_exterior']['imagen'] ?? ''),
                  'cenefa_outer_name' => (string)($tapete['cenefa_exterior']['nombre'] ?? ''),
                  'esquina_outer_name' => (string)($tapete['esquina_exterior']['nombre'] ?? ''),
                ];
                if ($centerId !== '') $params['center_id'] = $centerId;
                if ($cenefaId !== '') $params['cenefa_id'] = $cenefaId;
                if ($esquinaId !== '') $params['esquina_id'] = $esquinaId;
                $customizeUrl = 'personalizar.php?' . http_build_query(array_filter($params, static fn($v) => $v !== ''));
              ?>
              <div class="tapete-meta-head">
                <h3><?= htmlspecialchars($tapete['nombre'], ENT_QUOTES) ?></h3>
                <a class="action cta-pill" href="<?= htmlspecialchars($customizeUrl, ENT_QUOTES) ?>"><?= $lang === 'en' ? 'Customize rug' : 'Personalizar tapete' ?></a>
              </div>
              <p>
                <?= $lang === 'en' ? 'Center' : 'Centro' ?>: <strong><?= htmlspecialchars($tapete['centro']['nombre'] ?? '—', ENT_QUOTES) ?></strong> ·
                <?= $lang === 'en' ? 'Border' : 'Cenefa' ?>: <strong><?= htmlspecialchars($tapete['cenefa']['nombre'] ?? '—', ENT_QUOTES) ?></strong> ·
                <?= $lang === 'en' ? 'Corner' : 'Esquina' ?>: <strong><?= htmlspecialchars($tapete['esquina']['nombre'] ?? '—', ENT_QUOTES) ?></strong><?php if (!empty($tapete['cenefa_exterior']) || !empty($tapete['esquina_exterior'])): ?> · <?= $lang === 'en' ? 'Outer border' : 'Cenefa exterior' ?>: <strong><?= htmlspecialchars($tapete['cenefa_exterior']['nombre'] ?? '—', ENT_QUOTES) ?></strong> · <?= $lang === 'en' ? 'Outer corner' : 'Esquina exterior' ?>: <strong><?= htmlspecialchars($tapete['esquina_exterior']['nombre'] ?? '—', ENT_QUOTES) ?></strong><?php endif; ?>
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
