<?php
const VALID_CATEGORIAS = ['centro', 'cenefa', 'esquina', 'cenefa_exterior', 'esquina_exterior', 'hexagonales', 'antiderrapante'];


function carga_meta_categorias_csv(string $csvPath): array {
    if (!file_exists($csvPath)) {
        return ['categorias' => [], 'cenefa_rotacion_alterna' => []];
    }

    $handle = fopen($csvPath, 'r');
    if ($handle === false) {
        return ['categorias' => [], 'cenefa_rotacion_alterna' => []];
    }

    $header = fgetcsv($handle);
    if (!is_array($header)) {
        fclose($handle);
        return ['categorias' => [], 'cenefa_rotacion_alterna' => []];
    }

    $mapCategorias = [];
    $mapRotacionAlterna = [];

    while (($row = fgetcsv($handle)) !== false) {
        $folder = strtolower(trim((string)($row[0] ?? '')));
        $category = strtolower(trim((string)($row[1] ?? '')));
        $flagRaw = trim((string)($row[2] ?? ''));

        if ($folder === '' || str_starts_with($folder, '#')) {
            continue;
        }

        if (!in_array($category, VALID_CATEGORIAS, true)) {
            $category = '';
        }

        $isAlterna = $category === 'cenefa' && in_array(strtolower($flagRaw), ['1', 'true', 'si', 'sí', 'yes'], true);
        $mapCategorias[$folder] = $category;
        $mapRotacionAlterna[$folder] = $isAlterna;
    }

    fclose($handle);
    return ['categorias' => $mapCategorias, 'cenefa_rotacion_alterna' => $mapRotacionAlterna];
}

function carga_mapa_categorias_csv(string $csvPath): array {
    $meta = carga_meta_categorias_csv($csvPath);
    return (array)($meta['categorias'] ?? []);
}

function sincroniza_categorias_csv(array $folders, string $csvPath): array {
    $meta = carga_meta_categorias_csv($csvPath);
    $existing = (array)($meta['categorias'] ?? []);
    $existingAlterna = (array)($meta['cenefa_rotacion_alterna'] ?? []);
    $dir = dirname($csvPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    $map = [];
    $mapAlterna = [];
    foreach ($folders as $folder) {
        $key = strtolower(trim((string)$folder));
        if ($key === '') {
            continue;
        }
        $map[$key] = $existing[$key] ?? '';
        $mapAlterna[$key] = !empty($existingAlterna[$key]);
    }

    $handle = fopen($csvPath, 'w');
    if ($handle !== false) {
        fputcsv($handle, ['carpeta_modelo', 'categoria', 'cenefa_rotacion_alterna']);
        foreach ($folders as $folder) {
            $key = strtolower(trim((string)$folder));
            if ($key === '') {
                continue;
            }
            $cat = (string)($map[$key] ?? '');
            $flag = ($cat === 'cenefa' && !empty($mapAlterna[$key])) ? '1' : '';
            fputcsv($handle, [$folder, $cat, $flag]);
        }
        fclose($handle);
    }

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


function imagen_con_version(string $src): string {
    $clean = trim($src);
    if ($clean === '' || preg_match('#^https?://#i', $clean)) return $clean;

    $normalized = str_replace('&amp;', '&', $clean);
    $parts = parse_url($normalized);
    $rawPath = (string)($parts['path'] ?? $normalized);
    if ($rawPath === '') return $clean;

    $decodedPath = rawurldecode($rawPath);
    $local = __DIR__ . '/' . ltrim($decodedPath, '/');
    if (!is_file($local)) {
        $local = __DIR__ . '/' . ltrim($rawPath, '/');
        if (!is_file($local)) return $clean;
    }

    $mtime = @filemtime($local);
    if ($mtime === false) return $clean;

    $query = [];
    if (!empty($parts['query'])) parse_str((string)$parts['query'], $query);
    $query['v'] = (string)$mtime;
    $queryString = http_build_query($query);

    $result = $decodedPath;
    if ($queryString !== '') $result .= '?' . $queryString;
    if (!empty($parts['fragment'])) $result .= '#' . $parts['fragment'];
    return $result;
}


function normaliza_conexion_clave(string $value): string {
    $v = strtolower(trim($value));
    $v = str_replace(['_', '-'], ' ', $v);
    $v = preg_replace('/\s+/', ' ', $v);
    return trim((string)$v);
}

function resolver_carpeta_desde_conexion(string $value, array $aliasMap): string {
    $k = normaliza_conexion_clave($value);
    if ($k === '') return '';
    return (string)($aliasMap[$k] ?? $k);
}

function normalizar_conexiones_con_modelos(array $primary, array $outer, array $models): array {
    $aliasMap = [];
    foreach ($models as $m) {
        $folder = carpeta_modelo_de_item($m);
        if ($folder === '') continue;
        $keys = [$folder, (string)($m['nombre'] ?? ''), (string)($m['identificador'] ?? '')];
        foreach ($keys as $raw) {
            $nk = normaliza_conexion_clave((string)$raw);
            if ($nk !== '' && !isset($aliasMap[$nk])) $aliasMap[$nk] = $folder;
        }
    }

    $normalizedPrimary = [];
    foreach ($primary as $cenefaRaw => $esquinaRaw) {
        $cenefaFolder = resolver_carpeta_desde_conexion((string)$cenefaRaw, $aliasMap);
        $esquinaFolder = resolver_carpeta_desde_conexion((string)$esquinaRaw, $aliasMap);
        if ($cenefaFolder === '') continue;
        $normalizedPrimary[$cenefaFolder] = $esquinaFolder;
    }

    $normalizedOuter = [];
    foreach ($outer as $cenefaRaw => $defs) {
        $cenefaFolder = resolver_carpeta_desde_conexion((string)$cenefaRaw, $aliasMap);
        if ($cenefaFolder === '') continue;
        $normalizedOuter[$cenefaFolder] = [
            'cenefa' => resolver_carpeta_desde_conexion((string)($defs['cenefa'] ?? ''), $aliasMap),
            'esquina' => resolver_carpeta_desde_conexion((string)($defs['esquina'] ?? ''), $aliasMap),
        ];
    }

    return ['primary' => $normalizedPrimary, 'outer' => $normalizedOuter];
}

function carga_conexiones_cenefa_esquina(string $csvPath): array {
    if (!file_exists($csvPath)) return ['primary' => [], 'outer' => [], 'rows' => []];
    $h = fopen($csvPath, 'r');
    if ($h === false) return ['primary' => [], 'outer' => [], 'rows' => []];
    $header = fgetcsv($h);
    if (!is_array($header)) {
        fclose($h);
        return ['primary' => [], 'outer' => [], 'rows' => []];
    }
    $primary = [];
    $outer = [];
    $rows = [];
    while (($row = fgetcsv($h)) !== false) {
        $cenefa = strtolower(trim((string)($row[0] ?? '')));
        $esquina = strtolower(trim((string)($row[1] ?? '')));
        $cenefaOuter = strtolower(trim((string)($row[2] ?? '')));
        $esquinaOuter = strtolower(trim((string)($row[3] ?? '')));
        if ($cenefa === '' || str_starts_with($cenefa, '#')) continue;
        if ($esquina !== '') $primary[$cenefa] = $esquina;
        if ($cenefaOuter !== '') $outer[$cenefa] = ['cenefa' => $cenefaOuter, 'esquina' => $esquinaOuter];
        $rows[$cenefa] = ['esquina' => $esquina, 'cenefa_exterior' => $cenefaOuter, 'esquina_exterior' => $esquinaOuter];
    }
    fclose($h);
    return ['primary' => $primary, 'outer' => $outer, 'rows' => $rows];
}

function categoria_prefix(?string $categoria): string {
    $cat = strtolower(trim((string)$categoria));
    return match ($cat) {
        'cenefa' => 'CEN',
        'esquina' => 'ESQ',
        'centro' => 'CTR',
        'cenefa_exterior' => 'CEX',
        'esquina_exterior' => 'EEX',
        'hexagonales' => 'HEX',
        'antiderrapante' => 'ANT',
        default => 'MOD',
    };
}

function categoria_rank(?string $categoria): int {
    $cat = strtolower(trim((string)$categoria));
    return match ($cat) {
        'centro' => 1,
        'cenefa', 'esquina', 'cenefa_exterior', 'esquina_exterior' => 2,
        'hexagonales' => 3,
        'antiderrapante' => 4,
        default => 9,
    };
}

function normaliza_item(array $m): array {
    $id = (int)($m['id'] ?? 0);
    $categoria = trim((string)($m['categoria'] ?? ''));
    $identificador = $m['identificador'] ?? '';
    if ($identificador === '') {
        $identificador = categoria_prefix($categoria) . '-' . str_pad((string)$id, 4, '0', STR_PAD_LEFT);
    }

    return [
        'id' => $id,
        'nombre' => (string)($m['nombre'] ?? 'Sin nombre'),
        'imagen' => (string)($m['imagen'] ?? 'assets/placeholder-tile.svg'),
        'descripcion' => (string)($m['descripcion'] ?? ''),
        'precio' => (float)($m['precio'] ?? 0),
        'categoria' => (string)$categoria,
        'identificador' => (string)$identificador,
        'cenefa_rotacion_alterna' => !empty($m['cenefa_rotacion_alterna']) ? 1 : 0,
    ];
}

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

        $stmt = $pdo->query(
            "SELECT id, nombre, imagen, descripcion, precio, categoria, identificador
             FROM mosaicos"
        );
        $items = array_map('normaliza_item', $stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (Throwable $e) {
        $items = [];
    }
}

if (empty($items)) {
    $jsonPath = __DIR__ . '/config/modelos.json';
    if (file_exists($jsonPath)) {
        $decoded = json_decode((string)file_get_contents($jsonPath), true);
        if (is_array($decoded)) {
            $items = array_map('normaliza_item', $decoded);
        }
    }
}

$categoriasPath = __DIR__ . '/config/categorias.csv';
$metaCategoriasGlobal = carga_meta_categorias_csv($categoriasPath);
$mapCategoriasGlobal = (array)($metaCategoriasGlobal['categorias'] ?? []);
$mapRotacionAlternaGlobal = (array)($metaCategoriasGlobal['cenefa_rotacion_alterna'] ?? []);
if (!empty($mapCategoriasGlobal)) {
    foreach ($items as &$item) {
        $folder = carpeta_modelo_de_item($item);
        if ($folder !== '' && array_key_exists($folder, $mapCategoriasGlobal)) {
            $item['categoria'] = $mapCategoriasGlobal[$folder];
            $item['cenefa_rotacion_alterna'] = !empty($mapRotacionAlternaGlobal[$folder]) ? 1 : 0;
            if (($item['identificador'] ?? '') === '' && (int)($item['id'] ?? 0) > 0) {
                $item['identificador'] = categoria_prefix($item['categoria']) . '-' . str_pad((string)$item['id'], 4, '0', STR_PAD_LEFT);
            }
        }
    }
    unset($item);
}

if (empty($items)) {
    $tapizDir = __DIR__ . '/Tapiz';
    if (is_dir($tapizDir)) {
        $folders = array_filter(scandir($tapizDir) ?: [], static fn($n) => $n !== '.' && $n !== '..' && is_dir($tapizDir . '/' . $n));
        sort($folders, SORT_NATURAL | SORT_FLAG_CASE);

        $categoriasPath = __DIR__ . '/config/categorias.csv';
        $metaCategorias = carga_meta_categorias_csv($categoriasPath);
        $mapCategorias = sincroniza_categorias_csv($folders, $categoriasPath);
        $mapRotacionAlterna = (array)($metaCategorias['cenefa_rotacion_alterna'] ?? []);

        $idx = 1;
        $catCounters = ['centro'=>0,'cenefa'=>0,'esquina'=>0,'hexagonales'=>0,'antiderrapante'=>0];
        foreach ($folders as $folder) {
            $path = $tapizDir . '/' . $folder;
            $pngs = glob($path . '/*.png');
            if (!$pngs) {
                continue;
            }
            sort($pngs, SORT_NATURAL | SORT_FLAG_CASE);
            $src = $pngs[0];
            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $folder));
            $slug = trim($slug, '-');
            if ($slug === '') {
                $slug = 'modelo-' . $idx;
            }
            $targetRel = 'Tapiz/' . rawurlencode($folder) . '/' . rawurlencode(basename($src));

            $categoria = trim((string)($mapCategorias[strtolower($folder)] ?? ''));
            if (isset($catCounters[$categoria])) {
                $catCounters[$categoria]++;
            }
            $items[] = normaliza_item([
                'id' => $idx,
                'nombre' => ucwords(str_replace(['_', '-'], ' ', $folder)),
                'imagen' => $targetRel,
                'descripcion' => '',
                'precio' => 0,
                'categoria' => $categoria,
                'identificador' => '',
                'cenefa_rotacion_alterna' => !empty($mapRotacionAlterna[strtolower((string)$folder)]) ? 1 : 0,
            ]);
            $idx++;
        }
    }
}

if (!empty($items)) {
    usort($items, static fn($a, $b) => strcasecmp((string)$a['nombre'], (string)$b['nombre']));
}

$lang = ($_GET['lang'] ?? 'es') === 'en' ? 'en' : 'es';
$conexiones = carga_conexiones_cenefa_esquina(__DIR__ . '/config/conexiones_cenefa_esquina.csv');
$conexionesPrimary = (array)($conexiones['primary'] ?? []);
$conexionesOuter = (array)($conexiones['outer'] ?? []);
$conexionesNormalizadas = normalizar_conexiones_con_modelos($conexionesPrimary, $conexionesOuter, $items);
$conexionesPrimary = (array)($conexionesNormalizadas['primary'] ?? []);
$conexionesOuter = (array)($conexionesNormalizadas['outer'] ?? []);
$conexionesRows = (array)($conexiones['rows'] ?? []);
$reverseOuterCenefa = [];
$reverseOuterEsquina = [];
foreach ($conexionesRows as $innerCenefa => $rowConn) {
    $oc = strtolower(trim((string)($rowConn['cenefa_exterior'] ?? '')));
    $oe = strtolower(trim((string)($rowConn['esquina_exterior'] ?? '')));
    if ($oc !== '') $reverseOuterCenefa[$oc] = (string)$innerCenefa;
    if ($oe !== '') $reverseOuterEsquina[$oe] = (string)$innerCenefa;
}

$byFolder = [];
foreach ($items as $it) {
    $folder = carpeta_modelo_de_item($it);
    if ($folder !== '') {
        $byFolder[$folder][strtolower((string)($it['categoria'] ?? ''))] = $it;
    }
}

$itemsCentros = array_values(array_filter($items, static fn($m) => strtolower((string)($m['categoria'] ?? '')) === 'centro'));
$itemsCenefas = array_values(array_filter($items, static fn($m) => strtolower((string)($m['categoria'] ?? '')) === 'cenefa'));
usort($itemsCentros, static fn($a, $b) => strcasecmp((string)($a['nombre'] ?? ''), (string)($b['nombre'] ?? '')));
usort($itemsCenefas, static fn($a, $b) => strcasecmp((string)($a['nombre'] ?? ''), (string)($b['nombre'] ?? '')));

$itemsCenefasSimples = [];
$itemsCenefasDobles = [];
foreach ($itemsCenefas as $cen) {
    $f = carpeta_modelo_de_item($cen);
    $out = (array)($conexionesOuter[$f] ?? []);
    $isDouble = trim((string)($out['cenefa'] ?? '')) !== '' || trim((string)($out['esquina'] ?? '')) !== '';
    if ($isDouble) $itemsCenefasDobles[] = $cen;
    else $itemsCenefasSimples[] = $cen;
}

$expandirGrupoCenefa = static function(array $cenefasBase) use ($conexionesPrimary, $conexionesOuter, $byFolder): array {
    $res = [];
    $seen = [];
    foreach ($cenefasBase as $cen) {
        $cenefaFolder = carpeta_modelo_de_item($cen);
        $toAdd = [$cen];

        $innerCornerFolder = (string)($conexionesPrimary[$cenefaFolder] ?? '');
        if ($innerCornerFolder !== '' && isset($byFolder[$innerCornerFolder]['esquina'])) {
            $toAdd[] = $byFolder[$innerCornerFolder]['esquina'];
        }

        $outer = (array)($conexionesOuter[$cenefaFolder] ?? []);
        $outerC = strtolower(trim((string)($outer['cenefa'] ?? '')));
        $outerE = strtolower(trim((string)($outer['esquina'] ?? '')));
        if ($outerC !== '') {
            if (isset($byFolder[$outerC]['cenefa_exterior'])) $toAdd[] = $byFolder[$outerC]['cenefa_exterior'];
            elseif (isset($byFolder[$outerC]['cenefa'])) $toAdd[] = $byFolder[$outerC]['cenefa'];
        }
        if ($outerE !== '') {
            if (isset($byFolder[$outerE]['esquina_exterior'])) $toAdd[] = $byFolder[$outerE]['esquina_exterior'];
            elseif (isset($byFolder[$outerE]['esquina'])) $toAdd[] = $byFolder[$outerE]['esquina'];
        }

        foreach ($toAdd as $item) {
            $k = (string)($item['id'] ?? '') . '|' . strtolower((string)($item['categoria'] ?? ''));
            if ($k !== '|' && isset($seen[$k])) continue;
            $seen[$k] = true;
            $res[] = $item;
        }
    }
    usort($res, static fn($a, $b) => strcasecmp((string)($a['nombre'] ?? ''), (string)($b['nombre'] ?? '')));
    return $res;
};

$itemsCenefasSimples = $expandirGrupoCenefa($itemsCenefasSimples);
$itemsCenefasDobles = $expandirGrupoCenefa($itemsCenefasDobles);

$lang = (($_GET['lang'] ?? 'es') === 'en') ? 'en' : 'es';

$sectionsDecorados = [
    [
        'title' => $lang === 'en' ? 'Decorated Cement Tiles' : 'Mosaicos Decorados',
        'description' => $lang === 'en'
            ? "Decorated cement tiles create linear layouts and links at different angles to provide continuity across the design.
Click on an image to preview its full layout.

Colors shown in this digital sample may differ from real tones. Please compare them with our in-person color palette in one of our showrooms."
            : "Los mosaicos hidráulicos decorados tienen la característica de generar un patrón lineal y enlaces con diferentes ángulos con la finalidad de dar unión y continuidad al dibujo.
Para ver su patrón, de clic sobre la imagen.

Los colores presentados en esta muestra digital pueden no representar con fidelidad sus tonalidades reales. Es necesario compararlo con la paleta de colores en alguna de nuestras salas de exhibición.",
        'items' => $itemsCentros,
        'anchor' => 'decorados-section',
    ],
    [
        'title' => $lang === 'en' ? 'Borders' : 'Cenefas',
        'description' => $lang === 'en'
            ? 'Ornamental border designs that add artistry and durability to floors and walls. Click on the image to display the complete layout.'
            : 'Diseños de ornamentación que dan bellesa, aportan arte y durabilidad a sus pisos y muros. Da clic sobre la imagen para desplegar el tapete.',
        'items' => $itemsCenefasSimples,
        'anchor' => 'cenefas-section',
    ],
    [
        'title' => $lang === 'en' ? 'Double Borders' : 'Cenefas Dobles',
        'description' => '',
        'items' => $itemsCenefasDobles,
        'anchor' => 'cenefas-dobles-section',
    ],
];
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= $lang === "en" ? "Decorated Cement Tiles" : "Mosaicos Decorados" ?></title>
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
      <h2 data-i18n="decorated_title">Mosaicos Decorados</h2>
      <p data-i18n="decorated_desc">Seleccione un modelo para ver su ficha. Puede personalizar colores en el simulador.</p>

      <div class="quote-top quote-top-inline">
        <h4 data-i18n="custom_panel_title">Personalizar Diseño</h4>
        <p data-i18n="custom_panel_desc">Cambie los colores del mosaico de su elección.</p>
        <div class="top-action-buttons">
          <a class="action quote-top-btn cta-pill" data-keep-lang href="personalizar.php" data-i18n="custom_panel_cta">Pruebe el simulador de colores ahora</a>
          <button type="button" id="compareModelsBtn" class="action cta-pill compare-toggle" aria-pressed="false" data-i18n="compare_models_toggle">Comparar modelos</button>
          <button type="button" id="quoteToggleBtn" class="action cta-pill secondary" aria-expanded="false" data-i18n="quote_toggle">Solicitar cotización</button>
        </div>
        <p id="compareModeNotice" class="compare-mode-notice" data-i18n="compare_mode_enabled_notice" hidden>Modo comparación activado: selecciona 2 modelos para verlos lado a lado, o presiona el botón nuevamente para salir.</p>
        <div id="quoteContainer" class="inline-quote-container" aria-hidden="true">
          <h3 data-i18n="quote_title">Solicite una Cotización</h3>
          <p data-i18n="quote_desc">Llene el siguiente formulario, comente los productos que desea y a la brevedad uno de nuestros agentes de venta se comunicará con usted.</p>
          <form class="quote-form" action="mailto:ventas@mosaicosdzununcan.com" method="post" enctype="text/plain">
            <input type="text" name="nombre" data-i18n-placeholder="quote_name" placeholder="Nombre" required />
            <input type="email" name="email" data-i18n-placeholder="quote_email" placeholder="Email" required />
            <input type="tel" name="telefono" data-i18n-placeholder="quote_phone" placeholder="Teléfono" required minlength="8" inputmode="tel" />
            <textarea name="comentarios" rows="6" data-i18n-placeholder="quote_comments" placeholder="Comentarios" required></textarea>
            <button type="submit" class="action quote-submit" data-i18n="quote_send">Enviar</button>
          </form>
        </div>
      </div>
    </section>

    <section id="catalogo-decorados" class="panel decorated-layout">
      <div class="mosaic-grid-wrap">
        <?php foreach ($sectionsDecorados as $section): ?>
          <div class="decorated-section-block" id="<?= htmlspecialchars((string)($section['anchor'] ?? ''), ENT_QUOTES) ?>">
            <h3><?= htmlspecialchars((string)$section['title'], ENT_QUOTES) ?></h3>
            <?php if (trim((string)($section['description'] ?? '')) !== ''): ?>
              <p class="decorated-section-text"><?= nl2br(htmlspecialchars((string)$section['description'], ENT_QUOTES)) ?></p>
            <?php endif; ?>
            <div class="mosaic-grid mosaic-grid-small">
            <?php if (!empty($section['items'])): ?>
              <?php foreach ($section['items'] as $m): ?>
              <?php
                $folder = carpeta_modelo_de_item($m);
                $cat = strtolower((string)($m['categoria'] ?? ''));
                $cenefaSrc = '';
                $esquinaSrc = '';
                $cenefaOuterSrc = '';
                $esquinaOuterSrc = '';
                $cenefaModel = null;
                $esquinaModel = null;
                $cenefaOuterModel = null;
                $esquinaOuterModel = null;

                $innerCenefaFolder = '';
                if ($cat === 'cenefa') {
                  $innerCenefaFolder = $folder;
                } elseif ($cat === 'esquina') {
                  $mappedCenefaFolder = array_search($folder, $conexionesPrimary, true);
                  $innerCenefaFolder = $mappedCenefaFolder !== false ? (string)$mappedCenefaFolder : '';
                } elseif ($cat === 'cenefa_exterior') {
                  $innerCenefaFolder = (string)($reverseOuterCenefa[$folder] ?? '');
                } elseif ($cat === 'esquina_exterior') {
                  $innerCenefaFolder = (string)($reverseOuterEsquina[$folder] ?? '');
                }

                if ($innerCenefaFolder !== '') {
                  if (isset($byFolder[$innerCenefaFolder]['cenefa'])) {
                    $cenefaModel = $byFolder[$innerCenefaFolder]['cenefa'];
                    $cenefaSrc = (string)($cenefaModel['imagen'] ?? '');
                  }

                  $innerCornerFolder = (string)($conexionesPrimary[$innerCenefaFolder] ?? '');
                  if ($innerCornerFolder !== '' && isset($byFolder[$innerCornerFolder]['esquina'])) {
                    $esquinaModel = $byFolder[$innerCornerFolder]['esquina'];
                    $esquinaSrc = (string)($esquinaModel['imagen'] ?? '');
                  }

                  $out = $conexionesOuter[$innerCenefaFolder] ?? [];
                  $outC = strtolower((string)($out['cenefa'] ?? ''));
                  $outE = strtolower((string)($out['esquina'] ?? ''));
                  if ($outC !== '') {
                    if (isset($byFolder[$outC]['cenefa_exterior'])) { $cenefaOuterModel = $byFolder[$outC]['cenefa_exterior']; $cenefaOuterSrc = (string)($cenefaOuterModel['imagen'] ?? ''); }
                    elseif (isset($byFolder[$outC]['cenefa'])) { $cenefaOuterModel = $byFolder[$outC]['cenefa']; $cenefaOuterSrc = (string)($cenefaOuterModel['imagen'] ?? ''); }
                  }
                  if ($outE !== '') {
                    if (isset($byFolder[$outE]['esquina_exterior'])) { $esquinaOuterModel = $byFolder[$outE]['esquina_exterior']; $esquinaOuterSrc = (string)($esquinaOuterModel['imagen'] ?? ''); }
                    elseif (isset($byFolder[$outE]['esquina'])) { $esquinaOuterModel = $byFolder[$outE]['esquina']; $esquinaOuterSrc = (string)($esquinaOuterModel['imagen'] ?? ''); }
                  }
                }

                if ($cat === 'cenefa') { $cenefaModel = $m; $cenefaSrc = (string)($m['imagen'] ?? $cenefaSrc); }
                if ($cat === 'esquina') { $esquinaModel = $m; $esquinaSrc = (string)($m['imagen'] ?? $esquinaSrc); }
                if ($cat === 'cenefa_exterior') { $cenefaOuterModel = $m; $cenefaOuterSrc = (string)($m['imagen'] ?? $cenefaOuterSrc); }
                if ($cat === 'esquina_exterior') { $esquinaOuterModel = $m; $esquinaOuterSrc = (string)($m['imagen'] ?? $esquinaOuterSrc); }
                $mainSrc = imagen_con_version((string)($m['imagen'] ?: 'assets/placeholder-tile.svg'));
                $cenefaSrcV = imagen_con_version($cenefaSrc);
                $esquinaSrcV = imagen_con_version($esquinaSrc);
                $cenefaOuterSrcV = imagen_con_version($cenefaOuterSrc);
                $esquinaOuterSrcV = imagen_con_version($esquinaOuterSrc);
                $targetModel = $m;
                $targetCategory = $cat;
                if ($cat === 'cenefa') {
                    $targetModel = $m;
                    $targetCategory = 'cenefa';
                } elseif (in_array($cat, ['esquina', 'cenefa_exterior', 'esquina_exterior'], true) && is_array($cenefaModel)) {
                    $targetModel = $cenefaModel;
                    $targetCategory = 'cenefa';
                }

                $targetImg = imagen_con_version((string)($targetModel['imagen'] ?? $mainSrc));
                $targetName = (string)($targetModel['nombre'] ?? ($m['nombre'] ?? 'Modelo'));
                $targetId = (string)($targetModel['id'] ?? '');

                $isBorderCategory = in_array($cat, ['cenefa', 'esquina', 'cenefa_exterior', 'esquina_exterior'], true);
                if ($isBorderCategory) {
                    $customizeParams = [
                        'lang' => $lang,
                        'picker' => 'dual',
                    ];
                    if (is_array($cenefaModel) && !empty($cenefaModel['id'])) $customizeParams['cenefa_id'] = (string)$cenefaModel['id'];
                    if (is_array($esquinaModel) && !empty($esquinaModel['id'])) $customizeParams['esquina_id'] = (string)$esquinaModel['id'];
                    if (is_array($cenefaOuterModel) && !empty($cenefaOuterModel['id'])) $customizeParams['cenefa_outer_id'] = (string)$cenefaOuterModel['id'];
                    if (is_array($esquinaOuterModel) && !empty($esquinaOuterModel['id'])) $customizeParams['esquina_outer_id'] = (string)$esquinaOuterModel['id'];
                    if (is_array($cenefaOuterModel)) {
                        $customizeParams['cenefa_outer_img'] = imagen_con_version((string)($cenefaOuterModel['imagen'] ?? ''));
                        $customizeParams['cenefa_outer_name'] = (string)($cenefaOuterModel['nombre'] ?? '');
                    }
                    if (is_array($esquinaOuterModel)) {
                        $customizeParams['esquina_outer_img'] = imagen_con_version((string)($esquinaOuterModel['imagen'] ?? ''));
                        $customizeParams['esquina_outer_name'] = (string)($esquinaOuterModel['nombre'] ?? '');
                    }
                } else {
                    $customizeParams = [
                        'picker' => 'single',
                        'lang' => $lang,
                        'img' => $targetImg,
                        'name' => $targetName,
                        'cat' => $targetCategory,
                    ];
                    if ($targetId !== '' && $targetId !== '0') $customizeParams['id'] = $targetId;
                    if (is_array($cenefaModel)) {
                        if (!empty($cenefaModel['id'])) $customizeParams['cenefa_id'] = (string)$cenefaModel['id'];
                        $customizeParams['cenefa_img'] = imagen_con_version((string)($cenefaModel['imagen'] ?? ''));
                        $customizeParams['cenefa_name'] = (string)($cenefaModel['nombre'] ?? '');
                    }
                    if (is_array($esquinaModel)) {
                        if (!empty($esquinaModel['id'])) $customizeParams['esquina_id'] = (string)$esquinaModel['id'];
                        $customizeParams['esquina_img'] = imagen_con_version((string)($esquinaModel['imagen'] ?? ''));
                        $customizeParams['esquina_name'] = (string)($esquinaModel['nombre'] ?? '');
                    }
                    if (is_array($cenefaOuterModel)) {
                        if (!empty($cenefaOuterModel['id'])) $customizeParams['cenefa_outer_id'] = (string)$cenefaOuterModel['id'];
                        $customizeParams['cenefa_outer_img'] = imagen_con_version((string)($cenefaOuterModel['imagen'] ?? ''));
                        $customizeParams['cenefa_outer_name'] = (string)($cenefaOuterModel['nombre'] ?? '');
                    }
                    if (is_array($esquinaOuterModel)) {
                        if (!empty($esquinaOuterModel['id'])) $customizeParams['esquina_outer_id'] = (string)$esquinaOuterModel['id'];
                        $customizeParams['esquina_outer_img'] = imagen_con_version((string)($esquinaOuterModel['imagen'] ?? ''));
                        $customizeParams['esquina_outer_name'] = (string)($esquinaOuterModel['nombre'] ?? '');
                    }
                }
                $customizeUrl = 'personalizar.php?' . http_build_query(array_filter($customizeParams, static fn($v) => $v !== ''));
                $isBorderCat = in_array($cat, ['cenefa', 'esquina', 'cenefa_exterior', 'esquina_exterior'], true);
                $showCustomizeBtn = !$isBorderCat || $cat === 'cenefa';
              ?>
              <article class="mosaic-card">
                <?php
                  $compareGroup = $innerCenefaFolder !== '' ? $innerCenefaFolder : '';
                  $cenefaAltRotate = (is_array($cenefaModel) && !empty($cenefaModel['cenefa_rotacion_alterna'])) ? '1' : '';
                  $cenefaOuterAltRotate = (is_array($cenefaOuterModel) && !empty($cenefaOuterModel['cenefa_rotacion_alterna'])) ? '1' : '';
                ?>
                <img class="mosaic-preview-trigger" src="<?= htmlspecialchars($mainSrc, ENT_QUOTES) ?>" alt="<?= htmlspecialchars($m['nombre'], ENT_QUOTES) ?>" data-model-name="<?= htmlspecialchars($m['nombre'], ENT_QUOTES) ?>" data-overlay-model-name="<?= htmlspecialchars($targetName, ENT_QUOTES) ?>" data-category="<?= htmlspecialchars($cat, ENT_QUOTES) ?>" data-compare-group="<?= htmlspecialchars($compareGroup, ENT_QUOTES) ?>" data-cenefa-src="<?= htmlspecialchars($cenefaSrcV, ENT_QUOTES) ?>" data-esquina-src="<?= htmlspecialchars($esquinaSrcV, ENT_QUOTES) ?>" data-cenefa-outer-src="<?= htmlspecialchars($cenefaOuterSrcV, ENT_QUOTES) ?>" data-esquina-outer-src="<?= htmlspecialchars($esquinaOuterSrcV, ENT_QUOTES) ?>" data-cenefa-alt-rotate="<?= htmlspecialchars($cenefaAltRotate, ENT_QUOTES) ?>" data-cenefa-outer-alt-rotate="<?= htmlspecialchars($cenefaOuterAltRotate, ENT_QUOTES) ?>" />
                <?php
                  $catRaw = strtolower(trim((string)($m['categoria'] ?? '')));
                  $catLabel = $catRaw !== ''
                    ? ucfirst(str_replace('_', ' ', $catRaw))
                    : 'Sin categoría';
                ?>
                <p class="code"><?= htmlspecialchars($catLabel, ENT_QUOTES) ?></p>
                <p class="name"><?= htmlspecialchars($m['nombre'], ENT_QUOTES) ?></p>
                <?php if ($showCustomizeBtn): ?>
                <a class="action cta-pill" href="<?= htmlspecialchars($customizeUrl, ENT_QUOTES) ?>" data-i18n="btn_customize">Personalizar</a>
                <?php endif; ?>
              </article>
              <?php endforeach; ?>
            <?php else: ?>
              <p class="empty-msg">Sin modelos en esta sección.</p>
            <?php endif; ?>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    </section>
  </main>
  <div id="modelOverlay" class="model-overlay" aria-hidden="true">
    <div class="model-overlay-backdrop" data-overlay-close="true"></div>
    <div class="model-overlay-card" role="dialog" aria-modal="true" aria-label="Vista previa del modelo">
      <button type="button" class="model-overlay-close" data-overlay-close="true" aria-label="Cerrar vista previa">×</button>
      <canvas id="modelOverlayPattern" class="model-overlay-pattern" width="1200" height="900" aria-hidden="true"></canvas>
      <div class="model-overlay-footer"><strong id="modelOverlayName">MODELO</strong></div>
    </div>
  </div>
  <div id="modelCompareOverlay" class="model-overlay model-overlay-compare" aria-hidden="true">
    <div class="model-overlay-backdrop" data-compare-overlay-close="true"></div>
    <div class="model-overlay-compare-wrap" role="dialog" aria-modal="true" aria-label="Comparación de modelos">
      <button type="button" class="model-overlay-close" data-compare-overlay-close="true" aria-label="Cerrar comparación">×</button>
      <div class="model-overlay-compare-grid">
        <div class="model-overlay-card compare-slot" data-compare-slot="0">
          <canvas id="modelOverlayPatternA" class="model-overlay-pattern" width="1200" height="900" aria-hidden="true"></canvas>
          <div class="model-overlay-footer"><strong id="modelOverlayNameA">MODELO A</strong></div>
        </div>
        <div class="model-overlay-card compare-slot" data-compare-slot="1">
          <canvas id="modelOverlayPatternB" class="model-overlay-pattern" width="1200" height="900" aria-hidden="true"></canvas>
          <div class="model-overlay-footer"><strong id="modelOverlayNameB">MODELO B</strong></div>
        </div>
        <div class="model-overlay-card compare-slot" data-compare-slot="2" hidden>
          <canvas id="modelOverlayPatternC" class="model-overlay-pattern" width="1200" height="900" aria-hidden="true"></canvas>
          <div class="model-overlay-footer"><strong id="modelOverlayNameC">MODELO C</strong></div>
        </div>
        <div class="model-overlay-card compare-slot" data-compare-slot="3" hidden>
          <canvas id="modelOverlayPatternD" class="model-overlay-pattern" width="1200" height="900" aria-hidden="true"></canvas>
          <div class="model-overlay-footer"><strong id="modelOverlayNameD">MODELO D</strong></div>
        </div>
      </div>
    </div>
  </div>
  <script src="app.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
