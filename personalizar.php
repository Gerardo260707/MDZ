<?php
const VALID_CATEGORIAS = ['centro', 'cenefa', 'esquina', 'cenefa_exterior', 'esquina_exterior', 'hexagonales', 'antiderrapante'];

function carga_meta_categorias_csv(string $csvPath): array {
    if (!file_exists($csvPath)) return ['categorias' => [], 'cenefa_rotacion_alterna' => []];
    $h = fopen($csvPath, 'r');
    if ($h === false) return ['categorias' => [], 'cenefa_rotacion_alterna' => []];
    $header = fgetcsv($h);
    if (!is_array($header)) { fclose($h); return ['categorias' => [], 'cenefa_rotacion_alterna' => []]; }
    $mapCategorias = [];
    $mapRotacionAlterna = [];
    while (($row = fgetcsv($h)) !== false) {
        $folder = strtolower(trim((string)($row[0] ?? '')));
        $cat = strtolower(trim((string)($row[1] ?? '')));
        $flagRaw = trim((string)($row[2] ?? ''));
        if ($folder === '' || str_starts_with($folder, '#')) continue;
        if (!in_array($cat, VALID_CATEGORIAS, true)) $cat = '';
        $mapCategorias[$folder] = $cat;
        $mapRotacionAlterna[$folder] = $cat === 'cenefa' && in_array(strtolower($flagRaw), ['1','true','si','sí','yes'], true);
    }
    fclose($h);
    return ['categorias' => $mapCategorias, 'cenefa_rotacion_alterna' => $mapRotacionAlterna];
}

function carga_mapa_categorias_csv(string $csvPath): array {
    $meta = carga_meta_categorias_csv($csvPath);
    return (array)($meta['categorias'] ?? []);
}

function carpeta_modelo_de_item(array $item): string {
    $folder = trim((string)($item['carpeta_modelo'] ?? ''));
    if ($folder !== '') return strtolower($folder);
    $img = trim((string)($item['imagen'] ?? ''));
    if (preg_match('#(?:^|/)(?:Tapiz|Tapete|Tapetes)/([^/]+)/#i', $img, $m)) {
        return strtolower(rawurldecode($m[1]));
    }
    return '';
}

function carga_conexiones_cenefa_esquina(string $csvPath): array {
    if (!file_exists($csvPath)) {
        $dir = dirname($csvPath);
        if (!is_dir($dir)) mkdir($dir, 0775, true);
        $h = fopen($csvPath, 'w');
        if ($h !== false) {
            fputcsv($h, ['cenefa', 'esquina', 'cenefa_exterior', 'esquina_exterior']);
            fclose($h);
        }
        return ['primary' => [], 'outer' => [], 'rows' => []];
    }

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
        if ($cenefaOuter !== '') {
            $outer[$cenefa] = ['cenefa' => $cenefaOuter, 'esquina' => $esquinaOuter];
        }
        $rows[$cenefa] = [
            'esquina' => $esquina,
            'cenefa_exterior' => $cenefaOuter,
            'esquina_exterior' => $esquinaOuter,
        ];
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
        $keys = [
            $folder,
            (string)($m['nombre'] ?? ''),
            (string)($m['identificador'] ?? ''),
        ];
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

function build_image_rel_with_version(string $baseName, string $folder, string $fileName, string $absPath): string {
    $rel = $baseName . '/' . rawurlencode($folder) . '/' . rawurlencode($fileName);
    $mtime = @filemtime($absPath);
    if ($mtime !== false) $rel .= '?v=' . $mtime;
    return $rel;
}

function normaliza_item(array $m): array {
    $id = (int)($m['id'] ?? 0);
    $categoria = strtolower(trim((string)($m['categoria'] ?? '')));
    $identificador = (string)($m['identificador'] ?? '');
    if ($identificador === '') {
        $identificador = categoria_prefix($categoria) . '-' . str_pad((string)$id, 4, '0', STR_PAD_LEFT);
    }

    return [
        'id' => $id,
        'nombre' => (string)($m['nombre'] ?? 'Sin nombre'),
        'imagen' => (string)($m['imagen'] ?? 'assets/placeholder-tile.svg'),
        'categoria' => $categoria,
        'identificador' => $identificador,
        'carpeta_modelo' => (string)($m['carpeta_modelo'] ?? ''),
        'cenefa_rotacion_alterna' => !empty($m['cenefa_rotacion_alterna']) ? 1 : 0,
    ];
}


function carga_modelos_tapete(): array {
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

    $metaCategorias = carga_meta_categorias_csv(__DIR__ . '/config/categorias.csv');
    $catMap = (array)($metaCategorias['categorias'] ?? []);
    $rotMap = (array)($metaCategorias['cenefa_rotacion_alterna'] ?? []);
    if (!empty($catMap)) {
        foreach ($items as &$item) {
            $folder = carpeta_modelo_de_item($item);
            if ($folder !== '' && array_key_exists($folder, $catMap)) {
                $item['categoria'] = $catMap[$folder];
                $item['cenefa_rotacion_alterna'] = !empty($rotMap[$folder]) ? 1 : 0;
            }
        }
        unset($item);
    }

    usort($items, static fn($a, $b) => strcasecmp((string)$a['nombre'], (string)$b['nombre']));
    return $items;
}



function find_model(array $models, string $query): ?array {
    $needle = strtolower(trim($query));
    if ($needle === '') return null;
    foreach ($models as $m) {
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
    if (!file_exists($csvPath)) return [];
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
        ];
    }
    fclose($h);
    return $rows;
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
                $slug = strtolower(trim((string)preg_replace('/[^a-zA-Z0-9]+/', '-', $folder), '-'));
                if ($slug === '') $slug = 'modelo-' . $idx;
                $targetRel = build_image_rel_with_version('Tapiz', $folder, basename($src), $src);
                $items[] = normaliza_item([
                    'id' => $idx,
                    'nombre' => ucwords(str_replace(['_', '-'], ' ', $folder)),
                    'imagen' => $targetRel,
                    'categoria' => '',
                    'identificador' => '',
                    'carpeta_modelo' => $folder,
                ]);
                $idx++;
            }
        }
    }

    $metaCategorias = carga_meta_categorias_csv(__DIR__ . '/config/categorias.csv');
    $catMap = (array)($metaCategorias['categorias'] ?? []);
    $rotMap = (array)($metaCategorias['cenefa_rotacion_alterna'] ?? []);
    if (!empty($catMap)) {
        foreach ($items as &$item) {
            $folder = carpeta_modelo_de_item($item);
            if ($folder !== '' && array_key_exists($folder, $catMap)) {
                $item['categoria'] = $catMap[$folder];
                $item['cenefa_rotacion_alterna'] = !empty($rotMap[$folder]) ? 1 : 0;
            }
        }
        unset($item);
    }

    usort($items, static fn($a, $b) => strcasecmp((string)$a['nombre'], (string)$b['nombre']));
    return $items;
}

$lang = ($_GET['lang'] ?? 'es') === 'en' ? 'en' : 'es';
$pickerMode = (($_GET['picker'] ?? 'dual') === 'single') ? 'single' : 'dual';
$modelSource = strtolower(trim((string)($_GET['source'] ?? '')));
$models = ($modelSource === 'tapete') ? carga_modelos_tapete() : carga_modelos();
$tapetePresets = ($modelSource === 'tapete') ? carga_tapetes_csv(__DIR__ . '/config/tapetes.csv', $models) : [];
$conexionesCsv = carga_conexiones_cenefa_esquina(__DIR__ . '/config/conexiones_cenefa_esquina.csv');
$conexionesPrimary = (array)($conexionesCsv['primary'] ?? []);
$conexionesOuter = (array)($conexionesCsv['outer'] ?? []);
$conexionesNormalizadas = normalizar_conexiones_con_modelos($conexionesPrimary, $conexionesOuter, $models);
$conexionesPrimary = (array)($conexionesNormalizadas['primary'] ?? []);
$conexionesOuter = (array)($conexionesNormalizadas['outer'] ?? []);
$reverseOuterCenefa = [];
$reverseOuterEsquina = [];
foreach ($conexionesOuter as $innerFolder => $outerDef) {
    $oc = strtolower(trim((string)($outerDef['cenefa'] ?? '')));
    $oe = strtolower(trim((string)($outerDef['esquina'] ?? '')));
    if ($oc !== '') $reverseOuterCenefa[$oc] = strtolower((string)$innerFolder);
    if ($oe !== '') $reverseOuterEsquina[$oe] = strtolower((string)$innerFolder);
}
$modelById = [];
foreach ($models as $item) $modelById[(string)$item['id']] = $item;

$centerId = (string)($_GET['center_id'] ?? '');
$cenefaId = (string)($_GET['cenefa_id'] ?? '');
$esquinaId = (string)($_GET['esquina_id'] ?? '');
$cenefaOuterId = (string)($_GET['cenefa_outer_id'] ?? '');
$esquinaOuterId = (string)($_GET['esquina_outer_id'] ?? '');
$legacyId = (string)($_GET['id'] ?? '');
if ($centerId === '' && $legacyId !== '' && isset($modelById[$legacyId]) && $modelById[$legacyId]['categoria'] === 'centro') $centerId = $legacyId;
if ($cenefaId === '' && $legacyId !== '' && isset($modelById[$legacyId]) && $modelById[$legacyId]['categoria'] === 'cenefa') $cenefaId = $legacyId;
if ($esquinaId === '' && $legacyId !== '' && isset($modelById[$legacyId]) && $modelById[$legacyId]['categoria'] === 'esquina') $esquinaId = $legacyId;

$selectedCenter = ($centerId !== '' && isset($modelById[$centerId])) ? $modelById[$centerId] : null;
$selectedCenefa = ($cenefaId !== '' && isset($modelById[$cenefaId])) ? $modelById[$cenefaId] : null;
$selectedEsquina = ($esquinaId !== '' && isset($modelById[$esquinaId])) ? $modelById[$esquinaId] : null;
$selectedCenefaOuter = ($cenefaOuterId !== '' && isset($modelById[$cenefaOuterId])) ? $modelById[$cenefaOuterId] : null;
$selectedEsquinaOuter = ($esquinaOuterId !== '' && isset($modelById[$esquinaOuterId])) ? $modelById[$esquinaOuterId] : null;

$centerImgParam = trim((string)($_GET['center_img'] ?? ''));
$cenefaImgParam = trim((string)($_GET['cenefa_img'] ?? ''));
$esquinaImgParam = trim((string)($_GET['esquina_img'] ?? ''));
$cenefaOuterImgParam = trim((string)($_GET['cenefa_outer_img'] ?? ''));
$esquinaOuterImgParam = trim((string)($_GET['esquina_outer_img'] ?? ''));
$cenefaAltRotateParam = trim((string)($_GET['cenefa_alt_rotate'] ?? ''));
$cenefaOuterAltRotateParam = trim((string)($_GET['cenefa_outer_alt_rotate'] ?? ''));
if (!$selectedCenter && $centerImgParam !== '') {
    $selectedCenter = [
        'id' => 0,
        'nombre' => (string)($_GET['center_name'] ?? ($lang === 'en' ? 'Center' : 'Centro')),
        'imagen' => $centerImgParam,
        'categoria' => 'centro',
        'identificador' => '',
        'carpeta_modelo' => '',
        'cenefa_rotacion_alterna' => in_array(strtolower($cenefaAltRotateParam), ['1','true','si','sí','yes'], true) ? 1 : 0,
    ];
}
if (!$selectedCenefa && $cenefaImgParam !== '') {
    $selectedCenefa = [
        'id' => 0,
        'nombre' => (string)($_GET['cenefa_name'] ?? ($lang === 'en' ? 'Border' : 'Cenefa')),
        'imagen' => $cenefaImgParam,
        'categoria' => 'cenefa',
        'identificador' => '',
        'carpeta_modelo' => '',
        'cenefa_rotacion_alterna' => 0,
    ];
}
if (!$selectedEsquina && $esquinaImgParam !== '') {
    $selectedEsquina = [
        'id' => 0,
        'nombre' => (string)($_GET['esquina_name'] ?? ($lang === 'en' ? 'Corner' : 'Esquina')),
        'imagen' => $esquinaImgParam,
        'categoria' => 'esquina',
        'identificador' => '',
        'carpeta_modelo' => '',
        'cenefa_rotacion_alterna' => 0,
    ];
}


if (!$selectedCenefaOuter && $cenefaOuterImgParam !== '') {
    $selectedCenefaOuter = [
        'id' => 0,
        'nombre' => (string)($_GET['cenefa_outer_name'] ?? ($lang === 'en' ? 'Outer Border' : 'Cenefa exterior')),
        'imagen' => $cenefaOuterImgParam,
        'categoria' => 'cenefa_exterior',
        'identificador' => '',
        'carpeta_modelo' => '',
        'cenefa_rotacion_alterna' => in_array(strtolower($cenefaOuterAltRotateParam), ['1','true','si','sí','yes'], true) ? 1 : 0,
    ];
}
if (!$selectedEsquinaOuter && $esquinaOuterImgParam !== '') {
    $selectedEsquinaOuter = [
        'id' => 0,
        'nombre' => (string)($_GET['esquina_outer_name'] ?? ($lang === 'en' ? 'Outer Corner' : 'Esquina exterior')),
        'imagen' => $esquinaOuterImgParam,
        'categoria' => 'esquina_exterior',
        'identificador' => '',
        'carpeta_modelo' => '',
        'cenefa_rotacion_alterna' => 0,
    ];
}

if ($selectedCenefa && $cenefaAltRotateParam !== '') {
    $selectedCenefa['cenefa_rotacion_alterna'] = in_array(strtolower($cenefaAltRotateParam), ['1','true','si','sí','yes'], true) ? 1 : 0;
}
if ($selectedCenefaOuter && $cenefaOuterAltRotateParam !== '') {
    $selectedCenefaOuter['cenefa_rotacion_alterna'] = in_array(strtolower($cenefaOuterAltRotateParam), ['1','true','si','sí','yes'], true) ? 1 : 0;
}

if ($selectedCenefa && trim((string)($selectedCenefa['imagen'] ?? '')) === '' && $cenefaImgParam !== '') {
    $selectedCenefa['imagen'] = $cenefaImgParam;
    if (trim((string)($selectedCenefa['nombre'] ?? '')) === '') $selectedCenefa['nombre'] = (string)($_GET['cenefa_name'] ?? ($lang === 'en' ? 'Border' : 'Cenefa'));
}
if ($selectedEsquina && trim((string)($selectedEsquina['imagen'] ?? '')) === '' && $esquinaImgParam !== '') {
    $selectedEsquina['imagen'] = $esquinaImgParam;
    if (trim((string)($selectedEsquina['nombre'] ?? '')) === '') $selectedEsquina['nombre'] = (string)($_GET['esquina_name'] ?? ($lang === 'en' ? 'Corner' : 'Esquina'));
}
if ($selectedCenefaOuter && trim((string)($selectedCenefaOuter['imagen'] ?? '')) === '' && $cenefaOuterImgParam !== '') {
    $selectedCenefaOuter['imagen'] = $cenefaOuterImgParam;
    if (trim((string)($selectedCenefaOuter['nombre'] ?? '')) === '') $selectedCenefaOuter['nombre'] = (string)($_GET['cenefa_outer_name'] ?? ($lang === 'en' ? 'Outer Border' : 'Cenefa exterior'));
}
if ($selectedEsquinaOuter && trim((string)($selectedEsquinaOuter['imagen'] ?? '')) === '' && $esquinaOuterImgParam !== '') {
    $selectedEsquinaOuter['imagen'] = $esquinaOuterImgParam;
    if (trim((string)($selectedEsquinaOuter['nombre'] ?? '')) === '') $selectedEsquinaOuter['nombre'] = (string)($_GET['esquina_outer_name'] ?? ($lang === 'en' ? 'Outer Corner' : 'Esquina exterior'));
}

if ($selectedCenefa && !$selectedEsquina) {
    $cenefaFolder = carpeta_modelo_de_item($selectedCenefa);
    $mappedCornerFolder = $conexionesPrimary[$cenefaFolder] ?? '';
    if ($mappedCornerFolder !== '') {
        foreach ($models as $m) {
            if (($m['categoria'] ?? '') !== 'esquina') continue;
            if (carpeta_modelo_de_item($m) === $mappedCornerFolder) {
                $selectedEsquina = $m;
                break;
            }
        }
    }
}

if ($selectedEsquina && !$selectedCenefa) {
    $esquinaFolder = carpeta_modelo_de_item($selectedEsquina);
    $mappedCenefaFolder = array_search($esquinaFolder, $conexionesPrimary, true);
    if ($mappedCenefaFolder !== false) {
        foreach ($models as $m) {
            if (($m['categoria'] ?? '') !== 'cenefa') continue;
            if (carpeta_modelo_de_item($m) === $mappedCenefaFolder) {
                $selectedCenefa = $m;
                break;
            }
        }
    }
}

if ($selectedCenefaOuter && !$selectedCenefa) {
    $outerFolder = carpeta_modelo_de_item($selectedCenefaOuter);
    $innerFolder = (string)($reverseOuterCenefa[$outerFolder] ?? '');
    if ($innerFolder !== '') {
        foreach ($models as $m) {
            if (($m['categoria'] ?? '') !== 'cenefa') continue;
            if (carpeta_modelo_de_item($m) === $innerFolder) { $selectedCenefa = $m; break; }
        }
    }
}
if ($selectedEsquinaOuter && !$selectedCenefa) {
    $outerFolder = carpeta_modelo_de_item($selectedEsquinaOuter);
    $innerFolder = (string)($reverseOuterEsquina[$outerFolder] ?? '');
    if ($innerFolder !== '') {
        foreach ($models as $m) {
            if (($m['categoria'] ?? '') !== 'cenefa') continue;
            if (carpeta_modelo_de_item($m) === $innerFolder) { $selectedCenefa = $m; break; }
        }
    }
}


if ($selectedCenefa && !$selectedEsquina) {
    $cenefaFolder = carpeta_modelo_de_item($selectedCenefa);
    $mappedCornerFolder = $conexionesPrimary[$cenefaFolder] ?? '';
    if ($mappedCornerFolder !== '') {
        foreach ($models as $m) {
            if (($m['categoria'] ?? '') !== 'esquina') continue;
            if (carpeta_modelo_de_item($m) === $mappedCornerFolder) { $selectedEsquina = $m; break; }
        }
    }
}

if ($selectedCenefa && !$selectedCenefaOuter) {
    $cenefaFolder = carpeta_modelo_de_item($selectedCenefa);
    $outerDef = $conexionesOuter[$cenefaFolder] ?? null;
    $outerCenefaFolder = strtolower(trim((string)($outerDef['cenefa'] ?? '')));
    if ($outerCenefaFolder !== '') {
        foreach ($models as $m) {
            if (($m['categoria'] ?? '') !== 'cenefa_exterior') continue;
            if (carpeta_modelo_de_item($m) === $outerCenefaFolder) { $selectedCenefaOuter = $m; break; }
        }
    }
}
if ($selectedCenefa && $selectedCenefaOuter && !$selectedEsquinaOuter) {
    $cenefaFolder = carpeta_modelo_de_item($selectedCenefa);
    $outerDef = $conexionesOuter[$cenefaFolder] ?? null;
    $outerCornerFolder = strtolower(trim((string)($outerDef['esquina'] ?? '')));
    if ($outerCornerFolder !== '') {
        foreach ($models as $m) {
            if (($m['categoria'] ?? '') !== 'esquina_exterior') continue;
            if (carpeta_modelo_de_item($m) === $outerCornerFolder) { $selectedEsquinaOuter = $m; break; }
        }
    }
}
$entryCategoryRaw = strtolower(trim((string)($_GET['cat'] ?? '')));
if ($pickerMode === 'dual') {
    $editable = $selectedCenter;
} else {
    $editable = match ($entryCategoryRaw) {
        'cenefa' => $selectedCenefa,
        'esquina' => $selectedEsquina,
        'centro' => $selectedCenter,
        'cenefa_exterior' => ($selectedCenefaOuter ?: $selectedCenefa),
        'esquina_exterior' => ($selectedEsquinaOuter ?: $selectedEsquina),
        default => ($selectedCenter ?: $selectedCenefa ?: $selectedEsquina),
    };
}
if (!$editable && isset($_GET['img']) && (string)$_GET['img'] !== '') {
    $editable = [
        'id' => (int)($_GET['id'] ?? 0),
        'nombre' => (string)($_GET['name'] ?? 'Modelo'),
        'imagen' => (string)$_GET['img'],
        'categoria' => strtolower(trim((string)($_GET['cat'] ?? ''))),
        'identificador' => '',
        'carpeta_modelo' => '',
        'cenefa_rotacion_alterna' => 0,
    ];
}

$selectedName = $editable['nombre'] ?? ($lang === 'en' ? 'Choose center and border to begin' : 'Elige centro y cenefa para comenzar');
$selectedImage = $editable['imagen'] ?? '';
$selectedCategory = $editable['categoria'] ?? '';
$editTarget = ($pickerMode === 'dual') ? 'centro' : ($selectedCategory !== '' ? $selectedCategory : 'centro');
$entryCategory = strtolower(trim((string)($_GET['cat'] ?? ($editable['categoria'] ?? ''))));
$searchMode = ($modelSource === 'tapete') ? 'tapete' : 'modelo';
$isBorderSelection = in_array($selectedCategory, ['cenefa', 'esquina', 'cenefa_exterior', 'esquina_exterior'], true);
$isSingleBorderEntry = ($pickerMode === 'single' && $isBorderSelection);
$showCenterEditor = !$isSingleBorderEntry;
$showCenterSearch = ($searchMode === 'tapete') || !$isSingleBorderEntry;
$showCenefaSearch = ($searchMode !== 'tapete') && ($pickerMode === 'dual' || ($pickerMode === 'single' && $selectedCategory === 'cenefa'));
$showSearch = $showCenterSearch || $showCenefaSearch;
$disableSearch = false;
$showCenefaExtra = (bool)$selectedCenefa;
$showEsquinaExtra = (bool)$selectedEsquina;
$showCenefaOuterExtra = (bool)$selectedCenefaOuter;
$showEsquinaOuterExtra = (bool)$selectedEsquinaOuter;
$showCenterSelectionHint = (!$selectedCenter && (bool)$selectedCenefa);
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Personalizar mosaico</title>
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
      <h2 data-i18n="custom_title">Personalizar Diseño</h2>
      <p><strong id="selectedModelName"><?= htmlspecialchars($selectedName, ENT_QUOTES) ?></strong></p>
      <div class="model-search-row" data-picker-mode="<?= $pickerMode ?>" data-search-mode="<?= htmlspecialchars($searchMode, ENT_QUOTES) ?>" data-search-disabled="<?= $disableSearch ? '1' : '0' ?>">
        <?php if ($showCenterSearch): ?><div class="model-search" id="centerSearchWrap">
          <input id="centerSearchInput" type="search" autocomplete="off" <?= $disableSearch ? 'disabled' : '' ?> <?= $searchMode === 'tapete' ? '' : 'data-i18n-placeholder="custom_select_center"' ?> placeholder="<?= $searchMode === 'tapete' ? 'Seleccionar tapete' : 'Seleccionar centro' ?>" />
          <div class="model-search-results" id="centerSearchResults"></div>
        </div><?php endif; ?>
        <?php if ($showCenefaSearch): ?>
        <div class="model-search" id="cenefaSearchWrap">
          <input id="cenefaSearchInput" type="search" autocomplete="off" <?= $disableSearch ? 'disabled' : '' ?> data-i18n-placeholder="custom_select_cenefa" placeholder="Seleccionar cenefa" />
          <div class="model-search-results" id="cenefaSearchResults"></div>
        </div>
        <?php endif; ?>
      </div>
      <?php if ($showCenterSelectionHint): ?>
      <p class="note" id="centerSelectionHint" data-i18n="custom_center_hint_no_center">Seleccione un centro en la barra de búsqueda o pinte el cuadro para usar un color liso.</p>
      <?php endif; ?>
    </section>

    <section class="panel">
      <div class="custom-wrap" id="customWrap" data-has-model="<?= $editable ? '1' : '0' ?>">
        <div>
          <p data-i18n="custom_step1">Selecciona un color, luego dar click sobre la imagen.</p>
          <p class="note" data-i18n="custom_color_policy">La cantidad de colores debe ser igual a los que tiene la imagen de línea. Si desea sumar más colores aumentará el costo por pieza. El máximo es de 6 colores por modelo.</p>
          <?php if ($showCenterEditor): ?>
          <div class="vector-editor" id="vectorEditor"></div>
          <?php endif; ?>
          <?php if ($showCenefaExtra || $showEsquinaExtra || $showCenefaOuterExtra || $showEsquinaOuterExtra): ?>
          <div class="extra-editors">
            <?php if ($showCenefaExtra): ?>
            <div class="vector-editor extra-editor" id="extraCenefaPreview" data-extra-src="<?= htmlspecialchars($selectedCenefa['imagen'] ?? '', ENT_QUOTES) ?>" aria-label="Cenefa"></div>
            <?php endif; ?>
            <?php if ($showEsquinaExtra): ?>
            <div class="vector-editor extra-editor" id="extraCornerPreview" data-extra-src="<?= htmlspecialchars($selectedEsquina['imagen'] ?? '', ENT_QUOTES) ?>" aria-label="Esquina"></div>
            <?php endif; ?>
            <?php if ($showCenefaOuterExtra): ?>
            <div class="vector-editor extra-editor" id="extraCenefaOuterPreview" data-extra-src="<?= htmlspecialchars($selectedCenefaOuter['imagen'] ?? '', ENT_QUOTES) ?>" aria-label="Cenefa exterior"></div>
            <?php endif; ?>
            <?php if ($showEsquinaOuterExtra): ?>
            <div class="vector-editor extra-editor" id="extraCornerOuterPreview" data-extra-src="<?= htmlspecialchars($selectedEsquinaOuter['imagen'] ?? '', ENT_QUOTES) ?>" aria-label="Esquina exterior"></div>
            <?php endif; ?>
          </div>
          <?php endif; ?>
        </div>
        <div>
          <div class="palette" id="palette"></div>
          <div class="custom-controls">
            <button id="undoColor" class="action control-btn" type="button" data-i18n-title="custom_undo" title="Regresar color" aria-label="Regresar color">↶</button>
            <button id="redoColor" class="action control-btn" type="button" data-i18n-title="custom_redo" title="Adelante color" aria-label="Adelante color">↷</button>
            <button id="resetColor" class="action control-btn" type="button" data-i18n-title="custom_home" title="Imagen original" aria-label="Imagen original">⌂</button>
          </div>
        </div>
        <div>
          <p data-i18n="custom_step2">Vista principal del patrón personalizado.</p>
          <div id="bigPreview" class="preview-big"
               data-image="<?= htmlspecialchars($selectedImage, ENT_QUOTES) ?>"
               data-category="<?= htmlspecialchars($selectedCategory, ENT_QUOTES) ?>"
               data-entry-category="<?= htmlspecialchars($entryCategory, ENT_QUOTES) ?>"
               data-edit-target="<?= htmlspecialchars($editTarget, ENT_QUOTES) ?>"
               data-center-image="<?= htmlspecialchars($selectedCenter['imagen'] ?? '', ENT_QUOTES) ?>"
               data-cenefa-image="<?= htmlspecialchars($selectedCenefa['imagen'] ?? '', ENT_QUOTES) ?>"
               data-cenefa-alt-rotate="<?= !empty($selectedCenefa['cenefa_rotacion_alterna']) ? '1' : '' ?>"
               data-esquina-image="<?= htmlspecialchars($selectedEsquina['imagen'] ?? '', ENT_QUOTES) ?>"
               data-cenefa-outer-image="<?= htmlspecialchars($selectedCenefaOuter['imagen'] ?? '', ENT_QUOTES) ?>"
               data-cenefa-outer-alt-rotate="<?= !empty($selectedCenefaOuter['cenefa_rotacion_alterna']) ? '1' : '' ?>"
               data-esquina-outer-image="<?= htmlspecialchars($selectedEsquinaOuter['imagen'] ?? '', ENT_QUOTES) ?>"
               data-picker-mode="<?= htmlspecialchars($pickerMode, ENT_QUOTES) ?>"></div>
          <button id="download" class="action" style="margin-top:8px" data-i18n="custom_download">Descargar imagen</button>
        </div>
      </div>
    </section>
  </main>

  <script>
    window.CUSTOMIZER_MODELS = <?= json_encode($models, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
    window.CUSTOMIZER_SELECTION = <?= json_encode([
      'centerId' => $selectedCenter['id'] ?? null,
      'cenefaId' => $selectedCenefa['id'] ?? null,
      'esquinaId' => $selectedEsquina['id'] ?? null,
      'cenefaOuterId' => $selectedCenefaOuter['id'] ?? null,
      'esquinaOuterId' => $selectedEsquinaOuter['id'] ?? null,
      'pickerMode' => $pickerMode,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
    window.CUSTOMIZER_TAPETES = <?= json_encode($tapetePresets, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
    window.CUSTOMIZER_CONNECTIONS = <?= json_encode($conexionesPrimary, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
    window.CUSTOMIZER_CONNECTIONS_OUTER = <?= json_encode($conexionesOuter, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
  </script>
  <script src="app.js"></script>
  <script src="customizer-colors.js"></script>
  <script src="customizer-pdf-template.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
