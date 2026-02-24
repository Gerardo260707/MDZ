<?php
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
        $stmt = $pdo->query('SELECT id, nombre, imagen, descripcion, precio FROM mosaicos ORDER BY id DESC');
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        $items = [];
    }
}
if (empty($items)) {
    for ($i = 1; $i <= 12; $i++) {
        $items[] = [
            'id' => $i,
            'nombre' => 'Mosaico ejemplo ' . $i,
            'imagen' => 'assets/placeholder-tile.svg',
            'descripcion' => 'Modelo de demostración',
            'precio' => 0,
        ];
    }
}
$lang = ($_GET['lang'] ?? 'es') === 'en' ? 'en' : 'es';
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mosaicos Decorados</title>
  <link rel="stylesheet" href="assets.css" />
</head>
<body>
  <main class="site">
    <header class="top">
      <div class="brand-row">
        <div class="logo"><small>// Mosaicos</small>Dzununcán</div>
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
        <a data-keep-lang class="btn" href="pago.html" data-i18n="nav_pay">Pago Clip</a>
      </nav>
    </header>
    <div class="mosaic-strip"></div>

    <section>
      <h2 data-i18n="decorated_title">Mosaicos Decorados</h2>
      <p data-i18n="decorated_desc">Seleccione un modelo para ver su ficha. Puede personalizar colores en el simulador.</p>
    </section>

    <section class="panel">
      <div class="mosaic-grid">
        <?php foreach ($items as $m): ?>
          <article class="mosaic-card">
            <img src="<?= htmlspecialchars($m['imagen'] ?: 'assets/placeholder-tile.svg', ENT_QUOTES) ?>" alt="<?= htmlspecialchars($m['nombre'], ENT_QUOTES) ?>" />
            <p class="name"><?= htmlspecialchars($m['nombre'], ENT_QUOTES) ?></p>
            <a class="action" href="personalizar.php?id=<?= urlencode((string)$m['id']) ?>&lang=<?= $lang ?>&img=<?= urlencode((string)($m['imagen'] ?: "assets/placeholder-tile.svg")) ?>&name=<?= urlencode((string)$m['nombre']) ?>" data-i18n="btn_customize">Personalizar</a>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  </main>
  <script src="app.js"></script>
</body>
</html>
