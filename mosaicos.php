<?php
/**
 * Página preparada para conectar BD.
 * 1) Copia config/database.example.php a config/database.php
 * 2) Ajusta credenciales
 * 3) Crea tabla `mosaicos`
 */

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
?>
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mosaicos | Catálogo</title>
    <link rel="stylesheet" href="assets.css" />
    <style>
      .catalog { display:grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
      .item { border:1px solid #ddd; background:#fff; padding:10px; }
      .item img { width:100%; height:180px; object-fit:cover; background:#f1f1f1; }
      .item h3 { margin:10px 0 6px; font-size:18px; }
      .item p { font-size:14px; }
      .price { margin-top:8px; font-weight:700; }
    </style>
  </head>
  <body>
    <main class="site">
      <header class="top">
        <div class="brand-row">
          <div class="logo"><small>// Mosaicos</small>Dzununcán</div>
          <div class="langs">Idioma ▪ 🇲🇽 ▪ 🇺🇸</div>
        </div>
        <nav>
          <a href="index.html">Inicio</a>
          <a href="mosaicos.php">Mosaicos</a>
          <a href="galeria.html">Galería</a>
          <a href="mantenimiento.html">Mantenimiento</a>
          <a href="instalacion.html">Instalación</a>
          <a href="contacto.html">Contacto</a>
          <a class="btn" href="pago.html">Pago Clip</a>
        </nav>
      </header>
      <div class="mosaic-strip"></div>

      <section>
        <h2>Catálogo de Mosaicos</h2>
        <p>Esta página está lista para mostrar +300 mosaicos desde base de datos.</p>
      </section>

      <section class="panel">
        <div class="catalog">
          <?php if (!empty($items)): ?>
            <?php foreach ($items as $m): ?>
              <article class="item">
                <img src="<?= htmlspecialchars($m['imagen'] ?: 'assets/placeholder-tile.svg', ENT_QUOTES) ?>" alt="<?= htmlspecialchars($m['nombre'], ENT_QUOTES) ?>" />
                <h3><?= htmlspecialchars($m['nombre'], ENT_QUOTES) ?></h3>
                <p><?= htmlspecialchars($m['descripcion'] ?? '', ENT_QUOTES) ?></p>
                <p class="price"><?= isset($m['precio']) ? '$' . number_format((float)$m['precio'], 2) : '' ?></p>
              </article>
            <?php endforeach; ?>
          <?php else: ?>
            <?php for ($i=1; $i<=9; $i++): ?>
              <article class="item">
                <img src="assets/placeholder-tile.svg" alt="Mosaico ejemplo <?= $i ?>" />
                <h3>Mosaico ejemplo <?= $i ?></h3>
                <p>Cuando conectes la base de datos, aquí aparecerán tus mosaicos reales.</p>
                <p class="price">$0.00</p>
              </article>
            <?php endfor; ?>
          <?php endif; ?>
        </div>
      </section>

      <footer>Archivo independiente: mosaicos.php</footer>
    </main>
  </body>
</html>
