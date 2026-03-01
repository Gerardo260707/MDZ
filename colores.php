<?php
$lang = (($_GET['lang'] ?? 'es') === 'en') ? 'en' : 'es';
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= $lang === 'en' ? 'Colors' : 'Colores' ?> | Mosaicos Dzununcán</title>
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
      <h2 data-i18n="colors_title">Paleta de colores</h2>
      <p data-i18n="colors_desc">Consulta todos los colores disponibles para personalizar tus diseños.</p>
      <button id="toggleColorComparator" class="action cta-pill" type="button">Comparar colores</button>
      <div id="colorComparator" class="color-comparator" hidden>
        <div class="color-comparator-canvases">
          <section class="color-compare-editor" data-editor="left">
            <h3 id="compareLabelLeft">Color 1</h3>
            <canvas id="compareCanvasLeft" width="200" height="200" aria-label="Comparador lienzo izquierdo"></canvas>
          </section>
          <section class="color-compare-editor" data-editor="right">
            <h3 id="compareLabelRight">Color 2</h3>
            <canvas id="compareCanvasRight" width="200" height="200" aria-label="Comparador lienzo derecho"></canvas>
          </section>
          <section class="color-compare-preview" aria-label="Vista grande de comparación">
            <h3>Vista de comparación</h3>
            <canvas id="compareCanvasPattern" width="600" height="400" aria-label="Patrón intercalado de colores"></canvas>
          </section>
        </div>
        <div class="custom-controls compare-controls" aria-label="Controles comparador de color">
          <button type="button" id="compareUndo" class="action control-btn" title="Regresar color" aria-label="Regresar color">↶</button>
          <button type="button" id="compareHome" class="action control-btn" title="Color original" aria-label="Color original">⌂</button>
        </div>
        <div id="comparePaletteShared" class="palette compare-palette"></div>
      </div>
      <div id="colorsGrid" class="colors-grid"></div>
    </section>
  </main>
  <script src="app.js"></script>
  <script src="customizer-colors.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
