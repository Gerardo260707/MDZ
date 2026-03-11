<?php
$lang = (($_GET['lang'] ?? 'es') === 'en') ? 'en' : 'es';
$baseDir = __DIR__ . '/Galeria';
$items = [];
if (is_dir($baseDir)) {
    $folders = array_values(array_filter(scandir($baseDir) ?: [], static fn($n) => $n !== '.' && $n !== '..' && is_dir($baseDir . '/' . $n)));
    natcasesort($folders);
    foreach ($folders as $folder) {
        $folderPath = $baseDir . '/' . $folder;
        $caption = '';
        $textFiles = glob($folderPath . '/*.txt') ?: [];
        natcasesort($textFiles);
        if (!empty($textFiles)) {
            $caption = trim((string)@file_get_contents(array_values($textFiles)[0]));
        }

        $images = [];
        foreach ((glob($folderPath . '/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}', GLOB_BRACE) ?: []) as $imgPath) {
            $rel = ltrim(str_replace(__DIR__, '', $imgPath), '/\\');
            $v = @filemtime($imgPath);
            if ($v) $rel .= (str_contains($rel, '?') ? '&' : '?') . 'v=' . $v;
            $images[] = str_replace(' ', '%20', $rel);
        }
        natcasesort($images);
        foreach ($images as $imgRel) {
            $items[] = [
                'folder' => $folder,
                'title' => $folder,
                'caption' => $caption,
                'src' => $imgRel,
            ];
        }
    }
}
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Galería | Mosaicos Dzununcán</title>
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
      <h2 data-i18n="nav_gallery">Galería</h2>
      <p><?= $lang === 'en' ? 'Click an image to view it in full format.' : 'Da clic sobre una imagen para verla completa.' ?></p>
      <div id="galleryGrid" class="gallery-grid">
        <?php if (!empty($items)): ?>
          <?php foreach ($items as $item): ?>
            <article class="gallery-card">
              <button type="button" class="gallery-thumb-btn" data-gallery-src="<?= htmlspecialchars($item['src'], ENT_QUOTES) ?>" data-gallery-title="<?= htmlspecialchars($item['title'], ENT_QUOTES) ?>" data-gallery-caption="<?= htmlspecialchars($item['caption'], ENT_QUOTES) ?>">
                <img src="<?= htmlspecialchars($item['src'], ENT_QUOTES) ?>" alt="<?= htmlspecialchars($item['title'], ENT_QUOTES) ?>" loading="lazy" />
              </button>
              <p class="gallery-name"><?= htmlspecialchars($item['title'], ENT_QUOTES) ?></p>
              <?php if ($item['caption'] !== ''): ?><p class="gallery-caption"><?= htmlspecialchars($item['caption'], ENT_QUOTES) ?></p><?php endif; ?>
            </article>
          <?php endforeach; ?>
        <?php else: ?>
          <p class="empty-msg">Aún no hay imágenes en la carpeta <strong>Galeria/</strong>.</p>
        <?php endif; ?>
      </div>
    </section>
  </main>

  <div id="galleryOverlay" class="gallery-overlay" aria-hidden="true">
    <div class="gallery-overlay-backdrop" data-gallery-close="1"></div>
    <div class="gallery-overlay-card" role="dialog" aria-modal="true" aria-label="Vista de imagen">
      <button type="button" class="gallery-overlay-close" data-gallery-close="1" aria-label="Cerrar">×</button>
      <img id="galleryOverlayImg" src="" alt="" />
      <div class="gallery-overlay-footer">
        <strong id="galleryOverlayTitle"></strong>
        <span id="galleryOverlayCaption"></span>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
