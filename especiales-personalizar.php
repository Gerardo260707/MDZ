<?php
$lang = (($_GET['lang'] ?? 'es') === 'en') ? 'en' : 'es';
$img = trim((string)($_GET['img'] ?? ''));
$name = trim((string)($_GET['name'] ?? ($lang === 'en' ? 'Special model' : 'Modelo especial')));
$pattern = strtolower(trim((string)($_GET['pattern'] ?? 'hexagonal')));
$hexRot = trim((string)($_GET['hex_rot'] ?? ''));

$imgDecoded = $img;
for ($i = 0; $i < 3; $i++) {
    $next = rawurldecode($imgDecoded);
    if ($next === $imgDecoded) break;
    $imgDecoded = $next;
}
$img = $imgDecoded;
$img = preg_replace('#^https?://[^/]+/#i', '', $img);
if ($img === '' || str_contains($img, '..')) {
    $img = 'assets/placeholder-tile.svg';
}

$title = $lang === 'en' ? 'Customize Special Mosaic' : 'Personalizar Mosaico Especial';

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

function carga_personalizables(string $csv, string $baseEspeciales): array {
    if (!file_exists($csv) || !is_dir($baseEspeciales)) return [];
    $h = fopen($csv, 'r');
    if (!$h) return [];

    $header = fgetcsv($h);
    $headerNorm = array_map(fn($x) => strtolower(trim((string)$x)), is_array($header) ? $header : []);
    $byName = array_flip($headerNorm);

    $idxFolder = $byName['carpeta'] ?? 0;
    $idxTipo = $byName['tipo_modelo'] ?? 1;
    $idxPersonalizable = $byName['personalizable'] ?? 4;
    $idxHex = $byName['hex_rotacion'] ?? 3;

    $out = [];
    while (($r = fgetcsv($h)) !== false) {
      $folder = trim((string)($r[$idxFolder] ?? ''));
      if ($folder === '' || str_starts_with($folder, '#')) continue;
      $flag = strtolower(trim((string)($r[$idxPersonalizable] ?? '')));
      if (!in_array($flag, ['1', 'si', 'sí', 'yes', 'true'], true)) continue;

      $dir = $baseEspeciales . '/' . $folder;
      if (!is_dir($dir)) continue;
      $imgs = glob($dir . '/*.{png,jpg,jpeg,webp,avif,svg,gif,bmp,tif,tiff}', GLOB_BRACE);
      if (!$imgs) continue;
      sort($imgs, SORT_NATURAL | SORT_FLAG_CASE);
      $src = $imgs[0];
      $patternType = normalizar_tipo_patron_especial((string)($r[$idxTipo] ?? ''));
      $hexRotRaw = trim((string)($r[$idxHex] ?? ''));
      $hexRot = ($hexRotRaw !== '' && is_numeric($hexRotRaw)) ? (string)fmod((float)$hexRotRaw, 360.0) : '';

      $out[] = [
        'name' => ucwords(str_replace(['_', '-'], ' ', $folder)),
        'img' => 'Especiales/' . rawurlencode($folder) . '/' . rawurlencode(basename($src)) . '?v=' . (@filemtime($src) ?: time()),
        'pattern' => $patternType,
        'hex_rot' => $hexRot,
      ];
    }
    fclose($h);
    usort($out, fn($a, $b) => strcasecmp($a['name'], $b['name']));
    return $out;
}

$personalizables = carga_personalizables(__DIR__ . '/config/categorias_especiales.csv', __DIR__ . '/Especiales');
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= htmlspecialchars($title, ENT_QUOTES) ?> | Mosaicos Dzununcán</title>
  <link rel="stylesheet" href="assets.css" />
</head>
<body>
  <main class="site especiales-customizer-page">
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

    <section>
      <h2><?= htmlspecialchars($title, ENT_QUOTES) ?></h2>
      <p class="especiales-desc"><?= htmlspecialchars($name, ENT_QUOTES) ?></p>
    </section>

    <section class="panel especiales-customizer-wrap"
      data-special-customizer="1"
      data-pattern-type="<?= htmlspecialchars($pattern, ENT_QUOTES) ?>"
      <?= $hexRot !== '' ? 'data-hex-rotation="' . htmlspecialchars($hexRot, ENT_QUOTES) . '"' : '' ?>>
      <div class="especiales-customizer-layout">
        <div>
          <h3><?= $lang === 'en' ? 'Model customization' : 'Personalización del modelo' ?></h3>
          <div class="special-editor-targets" <?= $pattern === 'octagonal' ? '' : 'hidden' ?>>
            <button type="button" id="specialTargetMain" class="btn btn-small active"><?= $lang === 'en' ? 'Octagonal piece' : 'Pieza octagonal' ?></button>
            <button type="button" id="specialTargetSquare" class="btn btn-small"><?= $lang === 'en' ? 'Solid' : 'Liso' ?></button>
          </div>
          <div class="vector-editor"><canvas id="specialEditCanvas" class="vector-canvas" width="600" height="600"></canvas></div>
          <div id="specialSquareEditorWrap" <?= $pattern === 'octagonal' ? '' : 'hidden' ?>>
            <h3><?= $lang === 'en' ? 'Solid customization' : 'Personalización de liso' ?></h3>
            <div class="vector-editor"><canvas id="specialSquareEditCanvas" class="vector-canvas" width="600" height="600"></canvas></div>
          </div>
        </div>
        <div class="especiales-palette-col">
          <div id="specialPalette" class="palette"></div>
          <div class="custom-controls">
            <button id="specialUndoColor" class="action control-btn" type="button" data-i18n-title="custom_undo" title="Regresar color" aria-label="Regresar color">↶</button>
            <button id="specialRedoColor" class="action control-btn" type="button" data-i18n-title="custom_redo" title="Adelante color" aria-label="Adelante color">↷</button>
            <button id="specialResetColor" class="action control-btn" type="button" data-i18n-title="custom_home" title="Imagen original" aria-label="Imagen original">⌂</button>
          </div>
        </div>
        <div>
          <h3><?= $lang === 'en' ? 'Pattern preview' : 'Vista de patrón' ?></h3>
          <canvas id="specialCustomizerCanvas" width="1200" height="800"></canvas>
        </div>
      </div>
      <img id="specialCustomizerSource" src="<?= htmlspecialchars($img, ENT_QUOTES) ?>" alt="<?= htmlspecialchars($name, ENT_QUOTES) ?>" hidden />
    </section>

    <footer id="siteDarkFooter" class="dark-footer">
      <div class="dark-cols">
        <div>
          <h4>Mosaicos Dzununcán</h4>
          <?php if ($lang === 'en'): ?>
            <p>Mexican cement tile manufacturer with custom projects.</p>
            <p>
              <a href="legal.html?lang=en#privacy">Privacy Policy</a><br>
              <a href="legal.html?lang=en#terms">Terms and Conditions</a><br>
              <a href="sitemap.html?lang=en">Site map</a>
            </p>
          <?php else: ?>
            <p>Fabricantes de mosaicos de pasta mexicanos con proyectos personalizados.</p>
            <p>
              <a href="legal.html?lang=es#privacy">Políticas de privacidad</a><br>
              <a href="legal.html?lang=es#terms">Términos y condiciones</a><br>
              <a href="sitemap.html?lang=es">Mapa del sitio</a>
            </p>
          <?php endif; ?>
        </div>
        <div>
          <h4><?= $lang === 'en' ? 'Phones' : 'Teléfonos' ?></h4>
          <p>Local: +52 (999) 217-9326</p>
          <p><?= $lang === 'en' ? 'Factory' : 'Fábrica' ?>: +52 (999) 249-5158</p>
          <p>Email: ventas@mosaicosdzununcan.com</p>
        </div>
        <div>
          <h4><?= $lang === 'en' ? 'Address' : 'Dirección' ?></h4>
          <?php if ($lang === 'en'): ?>
            <p>Sales & Showroom:<br>Calle 37, No. 318 entre 24 y 26, Mérida, Yucatán.</p>
            <p>Factory:<br>Carretera Mérida - Dzununcan Km 2.5</p>
          <?php else: ?>
            <p>Venta y sala de exhibición:<br>Calle 37, No. 318 entre 24 y 26, Mérida, Yucatán.</p>
            <p>Fábrica:<br>Carretera Mérida - Dzununcan Km 2.5</p>
          <?php endif; ?>
        </div>
        <div>
          <h4><?= $lang === 'en' ? 'Social' : 'Redes' ?></h4>
          <p>
            <a target="_blank" rel="noopener" href="https://www.facebook.com/mosaicosdecimononicos#">Facebook</a><br>
            <a target="_blank" rel="noopener" href="https://www.instagram.com/mosaicosdzununcan/">Instagram</a><br>
            <a target="_blank" rel="noopener" href="https://wa.me/529992179326">WhatsApp</a>
          </p>
        </div>
      </div>
    </footer>
  </main>
  <script src="app.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
