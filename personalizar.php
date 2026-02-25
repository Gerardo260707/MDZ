<?php
$id = $_GET['id'] ?? '1';
$name = $_GET['name'] ?? ('Mosaico ejemplo ' . preg_replace('/[^0-9A-Za-z\- ]/', '', (string)$id));
$lang = ($_GET['lang'] ?? 'es') === 'en' ? 'en' : 'es';
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
      <p><strong><?= htmlspecialchars($name, ENT_QUOTES) ?></strong></p>
    </section>

    <section class="panel">
      <div class="custom-wrap">
        <div>
          <p data-i18n="custom_step1">1. Selecciona un color.</p>
          <p class="note">2. Da clic en una sección del mosaico (PNG) para aplicar el color solo en esa zona.</p>
          <div class="vector-editor" id="vectorEditor"></div>
        </div>
        <div>
          <div class="palette" id="palette"></div>
          <button id="resetColor" class="action" style="margin-top:8px" data-i18n="custom_reset">Imagen original</button>
        </div>
        <div>
          <p data-i18n="custom_step2">Vista principal del patrón personalizado.</p>
          <div class="preview-big" id="bigPreview" data-image="<?= htmlspecialchars($_GET['img'] ?? 'assets/placeholder-tile.svg', ENT_QUOTES) ?>" data-category="<?= htmlspecialchars($_GET['cat'] ?? 'centro', ENT_QUOTES) ?>"></div>
          <button id="download" class="action" style="margin-top:8px" data-i18n="custom_download">Descargar imagen</button>
        </div>
      </div>
    </section>
  </main>

  <script src="app.js"></script>
  <script src="customizer-colors.js"></script>
  <script src="customizer-pdf-template.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
