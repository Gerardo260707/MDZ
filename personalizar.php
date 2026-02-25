<?php
function categoria_prefix(?string $categoria): string {
    $cat = strtolower(trim((string)$categoria));
    return match ($cat) {
        'cenefa' => 'CEN',
        'esquina' => 'ESQ',
        'centro' => 'CTR',
        'hexagonales' => 'HEX',
        'antiderrapante' => 'ANT',
        default => 'MOD',
    };
}

function pair_key(array $m): string {
    $base = (string)($m['carpeta_modelo'] ?? $m['nombre'] ?? '');
    $base = strtolower($base);
    $base = str_replace(['centro', 'cenefa', 'esquina', 'corner', 'bord', 'border'], '', $base);
    $base = preg_replace('/[^a-z0-9]+/', '-', $base);
    return trim((string)$base, '-');
}

function normaliza_item(array $m): array {
    $id = (int)($m['id'] ?? 0);
    $categoria = strtolower((string)($m['categoria'] ?? 'centro'));
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
                $slug = strtolower(trim((string)preg_replace('/[^a-zA-Z0-9]+/', '-', $folder), '-'));
                if ($slug === '') $slug = 'modelo-' . $idx;
                $targetRel = 'Tapiz/' . rawurlencode($folder) . '/' . rawurlencode(basename($src));
                $items[] = normaliza_item([
                    'id' => $idx,
                    'nombre' => ucwords(str_replace(['_', '-'], ' ', $folder)),
                    'imagen' => $targetRel,
                    'categoria' => 'centro',
                    'identificador' => '',
                    'carpeta_modelo' => $folder,
                ]);
                $idx++;
            }
        }
    }

    usort($items, static fn($a, $b) => strcasecmp((string)$a['nombre'], (string)$b['nombre']));
    return $items;
}

$lang = ($_GET['lang'] ?? 'es') === 'en' ? 'en' : 'es';
$pickerMode = (($_GET['picker'] ?? 'dual') === 'single') ? 'single' : 'dual';
$models = carga_modelos();
$modelById = [];
foreach ($models as $item) $modelById[(string)$item['id']] = $item;

$centerId = (string)($_GET['center_id'] ?? '');
$cenefaId = (string)($_GET['cenefa_id'] ?? '');
$esquinaId = (string)($_GET['esquina_id'] ?? '');
$legacyId = (string)($_GET['id'] ?? '');
if ($centerId === '' && $legacyId !== '' && isset($modelById[$legacyId]) && $modelById[$legacyId]['categoria'] === 'centro') $centerId = $legacyId;
if ($cenefaId === '' && $legacyId !== '' && isset($modelById[$legacyId]) && $modelById[$legacyId]['categoria'] === 'cenefa') $cenefaId = $legacyId;

$selectedCenter = ($centerId !== '' && isset($modelById[$centerId])) ? $modelById[$centerId] : null;
$selectedCenefa = ($pickerMode === 'dual' && $cenefaId !== '' && isset($modelById[$cenefaId])) ? $modelById[$cenefaId] : null;
$selectedEsquina = ($pickerMode === 'dual' && $esquinaId !== '' && isset($modelById[$esquinaId])) ? $modelById[$esquinaId] : null;

if ($selectedCenefa && !$selectedEsquina) {
    $k = pair_key($selectedCenefa);
    foreach ($models as $m) {
        if ($m['categoria'] === 'esquina' && pair_key($m) === $k) { $selectedEsquina = $m; break; }
    }
}

$editable = $selectedCenefa ?: $selectedCenter;
if (!$editable && isset($_GET['img']) && (string)$_GET['img'] !== '') {
    $editable = [
        'id' => (int)($_GET['id'] ?? 0),
        'nombre' => (string)($_GET['name'] ?? 'Modelo'),
        'imagen' => (string)$_GET['img'],
        'categoria' => strtolower((string)($_GET['cat'] ?? 'centro')),
        'identificador' => '',
        'carpeta_modelo' => '',
    ];
}

$selectedName = $editable['nombre'] ?? ($lang === 'en' ? 'Choose center and border to begin' : 'Elige centro y cenefa para comenzar');
$selectedImage = $editable['imagen'] ?? '';
$selectedCategory = $editable['categoria'] ?? 'centro';
$editTarget = $selectedCenefa ? 'cenefa' : 'centro';
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
      <div class="model-search-row" data-picker-mode="<?= $pickerMode ?>">
        <div class="model-search" id="centerSearchWrap">
          <input id="centerSearchInput" type="search" autocomplete="off" data-i18n-placeholder="custom_select_center" placeholder="Seleccionar centro" />
          <div class="model-search-results" id="centerSearchResults"></div>
        </div>
        <?php if ($pickerMode === 'dual'): ?>
        <div class="model-search" id="cenefaSearchWrap">
          <input id="cenefaSearchInput" type="search" autocomplete="off" data-i18n-placeholder="custom_select_cenefa" placeholder="Seleccionar cenefa" />
          <div class="model-search-results" id="cenefaSearchResults"></div>
        </div>
        <div class="model-search" id="esquinaSearchWrap">
          <input id="esquinaSearchInput" type="search" autocomplete="off" data-i18n-placeholder="custom_select_esquina" placeholder="Seleccionar esquina" />
          <div class="model-search-results" id="esquinaSearchResults"></div>
        </div>
        <?php endif; ?>
      </div>
    </section>

    <section class="panel">
      <div class="custom-wrap" id="customWrap" data-has-model="<?= $editable ? '1' : '0' ?>">
        <div>
          <p data-i18n="custom_step1">1. Selecciona un color.</p>
          <p class="note" data-i18n="custom_step_area">2. Da clic en una sección del mosaico (PNG) para aplicar el color solo en esa zona.</p>
          <div class="vector-editor" id="vectorEditor"></div>
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
               data-edit-target="<?= htmlspecialchars($editTarget, ENT_QUOTES) ?>"
               data-center-image="<?= htmlspecialchars($selectedCenter['imagen'] ?? '', ENT_QUOTES) ?>"
               data-cenefa-image="<?= htmlspecialchars($selectedCenefa['imagen'] ?? '', ENT_QUOTES) ?>"
               data-esquina-image="<?= htmlspecialchars($selectedEsquina['imagen'] ?? '', ENT_QUOTES) ?>"
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
      'pickerMode' => $pickerMode,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
  </script>
  <script src="app.js"></script>
  <script src="customizer-colors.js"></script>
  <script src="customizer-pdf-template.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
