<?php
$lang = (($_GET['lang'] ?? 'es') === 'en') ? 'en' : 'es';

function normalizar_seccion_especial(string $raw): string {
    $v = strtolower(trim($raw));
    if (in_array($v, ['formas', 'forma', 'mosaicos especiales', 'especiales'], true)) return 'formas';
    if (in_array($v, ['antiderrapantes', 'antiderrapante', 'anti-slip', 'anti slip'], true)) return 'antiderrapantes';
    if (in_array($v, ['zoclos', 'zóclos', 'zoclo', 'baseboards', 'baseboard'], true)) return 'zoclos';
    return 'formas';
}

function normalizar_tipo_patron_especial(string $raw): string {
    $v = strtolower(trim($raw));
    if (str_contains($v, 'triang')) return 'triangular';
    if (str_contains($v, 'cuadra')) return 'cuadrado';
    if (str_contains($v, 'hex')) return 'hexagonal';
    if (str_contains($v, 'octa')) return 'octagonal';
    if (str_contains($v, 'cantaro') || str_contains($v, 'cántaro')) return 'cantaro';
    if (str_contains($v, 'otro')) return 'otros';
    return 'hexagonal';
}

function infer_pattern_type_especial(string $folder, string $cat): string {
    return normalizar_tipo_patron_especial($folder . ' ' . $cat);
}

function carga_cat_especiales(string $csv): array {
    if (!file_exists($csv)) {
        $dir = dirname($csv);
        if (!is_dir($dir)) mkdir($dir, 0775, true);
        $h = fopen($csv, 'w');
        if ($h) { fputcsv($h, ['carpeta','tipo_modelo','seccion','hex_rotacion']); fclose($h); }
        return [];
    }

    $h = fopen($csv, 'r');
    if (!$h) return [];

    $header = fgetcsv($h);
    $headerNorm = array_map(fn($x) => strtolower(trim((string)$x)), is_array($header) ? $header : []);
    $byName = array_flip($headerNorm);

    $idxFolder = $byName['carpeta'] ?? 0;
    $idxTipo = $byName['tipo_modelo'] ?? 1;
    $idxSeccion = $byName['seccion'] ?? 2;
    $idxHex = $byName['hex_rotacion'] ?? 3;

    $m = [];
    while (($r = fgetcsv($h)) !== false) {
        $folder = strtolower(trim((string)($r[$idxFolder] ?? '')));
        if ($folder === '' || str_starts_with($folder, '#')) continue;

        $tipoRaw = trim((string)($r[$idxTipo] ?? ''));
        $seccionRaw = trim((string)($r[$idxSeccion] ?? ''));
        $hexRotRaw = trim((string)($r[$idxHex] ?? ''));

        $hexRot = null;
        if ($hexRotRaw !== '' && is_numeric($hexRotRaw)) {
            $hexRot = fmod((float)$hexRotRaw, 360.0);
        }

        $m[$folder] = [
            'cat' => normalizar_seccion_especial($seccionRaw),
            'hex_rot' => $hexRot,
            'pattern_type' => normalizar_tipo_patron_especial($tipoRaw),
        ];
    }

    fclose($h);
    return $m;
}

$map = carga_cat_especiales(__DIR__ . '/config/categorias_especiales.csv');
$base = __DIR__ . '/Especiales';
$items = [];
if (is_dir($base)) {
    foreach (array_filter(scandir($base) ?: [], fn($n) => $n !== '.' && $n !== '..' && is_dir($base . '/' . $n)) as $folder) {
        $imgs = glob($base . '/' . $folder . '/*.{png,jpg,jpeg,webp,avif}', GLOB_BRACE);
        if (!$imgs) continue;
        sort($imgs, SORT_NATURAL | SORT_FLAG_CASE);
        $src = $imgs[0];

        $meta = $map[strtolower($folder)] ?? ['cat' => 'formas', 'hex_rot' => null, 'pattern_type' => ''];
        $cat = $meta['cat'] ?: 'formas';
        $patternType = $meta['pattern_type'] ?: infer_pattern_type_especial($folder, $cat);

        $items[] = [
            'folder' => $folder,
            'cat' => $cat,
            'img' => 'Especiales/' . rawurlencode($folder) . '/' . rawurlencode(basename($src)) . '?v=' . (@filemtime($src) ?: time()),
            'name' => ucwords(str_replace(['_', '-'], ' ', $folder)),
            'hex_rot' => $meta['hex_rot'],
            'pattern_type' => $patternType,
        ];
    }
}

$order = ['formas' => 1, 'antiderrapantes' => 2, 'zoclos' => 3];
usort($items, fn($a, $b) => (($order[$a['cat']] ?? 9) <=> ($order[$b['cat']] ?? 9)) ?: strcasecmp($a['name'], $b['name']));

$sectionInfo = [
    'es' => [
        'formas' => [
            'title' => 'Mosaicos Especiales',
            'desc' => 'Ladrillos de pasta con formas y texturas especiales para diferentes usos en la construcción o remodelación, para interior o exterior.',
        ],
        'antiderrapantes' => [
            'title' => 'Antiderrapantes',
            'desc' => '',
        ],
        'zoclos' => [
            'title' => 'Zoclos',
            'desc' => 'Contamos con medidas 10x15, 10x20, 10x30 en color solido o marmoleados. También boleado y angular 10x20, 10x30, además con moldura 15x20 y 20x20 cm.',
        ],
    ],
    'en' => [
        'formas' => [
            'title' => 'Special Mosaics',
            'desc' => 'Cement tiles with special shapes and textures for different uses in construction or remodeling, for interior or exterior applications.',
        ],
        'antiderrapantes' => [
            'title' => 'Anti-slip',
            'desc' => '',
        ],
        'zoclos' => [
            'title' => 'Baseboards',
            'desc' => 'Available in 10x15, 10x20, and 10x30 cm in solid or marbled finishes. Also rounded and angular options in 10x20 and 10x30, plus molding in 15x20 and 20x20 cm.',
        ],
    ],
];

$groups = ['formas' => [], 'antiderrapantes' => [], 'zoclos' => []];
foreach ($items as $it) {
    $key = $it['cat'];
    if (!isset($groups[$key])) $key = 'formas';
    $groups[$key][] = $it;
}
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= $lang === 'en' ? 'Specials' : 'Especiales' ?> | Mosaicos Dzununcán</title>
  <link rel="stylesheet" href="assets.css" />
</head>
<body>
  <main class="site">
    <header class="top"><div class="brand-row"><div class="logo"><img src="assets/logo-dzununcan.svg" alt="Mosaicos Dzununcán" /></div><div class="langs"><span data-i18n="lang_label">Idioma</span> ▪<button class="lang-btn" data-set-lang="es" data-lang-active="es">🇲🇽</button><button class="lang-btn" data-set-lang="en" data-lang-active="en">🇺🇸</button></div></div>
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

    <?php foreach (['formas', 'antiderrapantes', 'zoclos'] as $sectionKey):
      $title = $sectionInfo[$lang][$sectionKey]['title'] ?? '';
      $desc = $sectionInfo[$lang][$sectionKey]['desc'] ?? '';
      $sectionItems = $groups[$sectionKey] ?? [];
    ?>
    <section>
      <h2><?= htmlspecialchars($title, ENT_QUOTES) ?></h2>
      <?php if ($desc !== ''): ?><p class="especiales-desc"><?= htmlspecialchars($desc, ENT_QUOTES) ?></p><?php endif; ?>
    </section>
    <section class="panel especiales-grid">
      <?php foreach ($sectionItems as $it): ?>
      <article class="mosaic-card special-card">
        <img src="<?= htmlspecialchars($it['img'], ENT_QUOTES) ?>" alt="<?= htmlspecialchars($it['name'], ENT_QUOTES) ?>" data-pattern-type="<?= htmlspecialchars((string)$it['pattern_type'], ENT_QUOTES) ?>" <?= $it['hex_rot'] !== null ? "data-hex-rotation=\"" . htmlspecialchars((string)$it['hex_rot'], ENT_QUOTES) . "\"" : "" ?> />
        <div class="name"><?= htmlspecialchars($it['name'], ENT_QUOTES) ?></div>
      </article>
      <?php endforeach; ?>
    </section>
    <?php endforeach; ?>
  </main>
  <script src="app.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
