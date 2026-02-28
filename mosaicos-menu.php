<?php
$lang = ($_GET['lang'] ?? 'es') === 'en' ? 'en' : 'es';
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mosaicos</title>
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
      <h2>Mosaicos</h2>
      <p>Seleccione el tipo de mosaico que desea consultar.</p>

      <div class="category-grid mosaic-options-grid">
        <article class="category-card">
          <img src="assets/placeholder-tile.svg" alt="Decorados" />
          <h3>Decorados</h3>
          <a class="cta-pill" href="mosaicos.php?lang=<?= $lang ?>">Ver decorados</a>
        </article>
        <article class="category-card">
          <img src="assets/placeholder-tile.svg" alt="Personalizar" />
          <h3>Personalizar</h3>
          <a class="cta-pill" href="personalizar.php?lang=<?= $lang ?>">Ir al simulador</a>
        </article>
        <article class="category-card">
          <img src="assets/placeholder-tile.svg" alt="Especiales" />
          <h3>Especiales</h3>
          <a class="cta-pill" href="especiales.php?lang=<?= $lang ?>">Ver especiales</a>
        </article>
      </div>
    </section>
  </main>

  <script src="app.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
