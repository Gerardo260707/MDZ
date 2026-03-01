<?php
$lang = ($_GET['lang'] ?? 'es') === 'en' ? 'en' : 'es';
$labels = [
  'title' => $lang === 'en' ? 'Tiles' : 'Mosaicos',
  'intro' => $lang === 'en' ? 'Select the tile type you want to browse.' : 'Seleccione el tipo de mosaico que desea consultar.',
  'decorated' => $lang === 'en' ? 'Decorated' : 'Decorados',
  'customize' => $lang === 'en' ? 'Customize' : 'Personalizar',
  'specials' => $lang === 'en' ? 'Specials' : 'Especiales',
  'decorated_cta' => $lang === 'en' ? 'View decorated' : 'Ver decorados',
  'customize_cta' => $lang === 'en' ? 'Go to simulator' : 'Ir al simulador',
  'specials_cta' => $lang === 'en' ? 'View specials' : 'Ver especiales',
];
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= htmlspecialchars($labels['title'], ENT_QUOTES) ?></title>
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

    <section id="mosaic-options">
      <h2><?= htmlspecialchars($labels['title'], ENT_QUOTES) ?></h2>
      <p><?= htmlspecialchars($labels['intro'], ENT_QUOTES) ?></p>

      <div class="category-grid mosaic-options-grid">
        <article class="category-card">
          <img src="assets/mosaicos-menu/decorados.jpg" alt="<?= htmlspecialchars($labels['decorated'], ENT_QUOTES) ?>" onerror="this.src='assets/placeholder-tile.svg'" />
          <h3><?= htmlspecialchars($labels['decorated'], ENT_QUOTES) ?></h3>
          <a class="cta-pill" href="mosaicos.php?lang=<?= $lang ?>"><?= htmlspecialchars($labels['decorated_cta'], ENT_QUOTES) ?></a>
        </article>
        <article class="category-card">
          <img src="assets/mosaicos-menu/personalizar.jpg" alt="<?= htmlspecialchars($labels['customize'], ENT_QUOTES) ?>" onerror="this.src='assets/placeholder-tile.svg'" />
          <h3><?= htmlspecialchars($labels['customize'], ENT_QUOTES) ?></h3>
          <a class="cta-pill" href="personalizar.php?lang=<?= $lang ?>"><?= htmlspecialchars($labels['customize_cta'], ENT_QUOTES) ?></a>
        </article>
        <article class="category-card">
          <img src="assets/mosaicos-menu/especiales.jpg" alt="<?= htmlspecialchars($labels['specials'], ENT_QUOTES) ?>" onerror="this.src='assets/placeholder-tile.svg'" />
          <h3><?= htmlspecialchars($labels['specials'], ENT_QUOTES) ?></h3>
          <a class="cta-pill" href="especiales.php?lang=<?= $lang ?>"><?= htmlspecialchars($labels['specials_cta'], ENT_QUOTES) ?></a>
        </article>
      </div>
    </section>
  </main>

  <script src="app.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
