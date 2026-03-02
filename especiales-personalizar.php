<?php
$lang = (($_GET['lang'] ?? 'es') === 'en') ? 'en' : 'es';
$img = trim((string)($_GET['img'] ?? ''));
$name = trim((string)($_GET['name'] ?? ($lang === 'en' ? 'Special model' : 'Modelo especial')));
$pattern = strtolower(trim((string)($_GET['pattern'] ?? 'hexagonal')));
$hexRot = trim((string)($_GET['hex_rot'] ?? ''));

$img = preg_replace('#^https?://[^/]+/#i', '', $img);
if ($img === '' || str_contains($img, '..')) {
    $img = 'assets/placeholder-tile.svg';
}

$title = $lang === 'en' ? 'Customize Special Mosaic' : 'Personalizar Mosaico Especial';
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
        <a data-keep-lang href="especiales.php" data-i18n="nav_mosaics">Especiales</a>
        <a data-keep-lang href="mosaicos.html" data-i18n="nav_mosaics">Mosaicos</a>
        <a data-keep-lang href="contacto.html" data-i18n="nav_contact">Contacto</a>
      </nav>
    </header>

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
            <button type="button" id="specialTargetSquare" class="btn btn-small"><?= $lang === 'en' ? 'Center square' : 'Cuadro central' ?></button>
          </div>
          <div class="vector-editor"><canvas id="specialEditCanvas" class="vector-canvas" width="600" height="600"></canvas></div>
          <div id="specialSquareEditorWrap" <?= $pattern === 'octagonal' ? '' : 'hidden' ?>>
            <h3><?= $lang === 'en' ? 'Square customization' : 'Personalización del cuadro' ?></h3>
            <div class="vector-editor"><canvas id="specialSquareEditCanvas" class="vector-canvas" width="600" height="600"></canvas></div>
          </div>
        </div>
        <div>
          <h3><?= $lang === 'en' ? 'Pattern preview' : 'Vista de patrón' ?></h3>
          <canvas id="specialCustomizerCanvas" width="1200" height="800"></canvas>
        </div>
      </div>
      <div id="specialPalette" class="palette"></div>
      <img id="specialCustomizerSource" src="<?= htmlspecialchars($img, ENT_QUOTES) ?>" alt="<?= htmlspecialchars($name, ENT_QUOTES) ?>" hidden />
    </section>
  </main>
  <script src="app.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
