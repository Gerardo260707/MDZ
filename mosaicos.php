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

function categoria_rank(?string $categoria): int {
    $cat = strtolower(trim((string)$categoria));
    return match ($cat) {
        'centro' => 1,
        'cenefa', 'esquina' => 2,
        'hexagonales' => 3,
        'antiderrapante' => 4,
        default => 9,
    };
}

function normaliza_item(array $m): array {
    $id = (int)($m['id'] ?? 0);
    $categoria = $m['categoria'] ?? 'centro';
    $identificador = $m['identificador'] ?? '';
    if ($identificador === '') {
        $identificador = categoria_prefix($categoria) . '-' . str_pad((string)$id, 4, '0', STR_PAD_LEFT);
    }

    return [
        'id' => $id,
        'nombre' => (string)($m['nombre'] ?? 'Sin nombre'),
        'imagen' => (string)($m['imagen'] ?? 'assets/placeholder-tile.svg'),
        'descripcion' => (string)($m['descripcion'] ?? ''),
        'precio' => (float)($m['precio'] ?? 0),
        'categoria' => (string)$categoria,
        'identificador' => (string)$identificador,
    ];
}

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

        $stmt = $pdo->query(
            "SELECT id, nombre, imagen, descripcion, precio, categoria, identificador
             FROM mosaicos"
        );
        $items = array_map('normaliza_item', $stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (Throwable $e) {
        $items = [];
    }
}

if (empty($items)) {
    $jsonPath = __DIR__ . '/config/modelos.json';
    if (file_exists($jsonPath)) {
        $decoded = json_decode((string)file_get_contents($jsonPath), true);
        if (is_array($decoded)) {
            $items = array_map('normaliza_item', $decoded);
        }
    }
}

if (empty($items)) {
    $tapizDir = __DIR__ . '/Tapiz';
    if (is_dir($tapizDir)) {
        $folders = array_filter(scandir($tapizDir) ?: [], static fn($n) => $n !== '.' && $n !== '..' && is_dir($tapizDir . '/' . $n));
        sort($folders, SORT_NATURAL | SORT_FLAG_CASE);

        $idx = 1;
        $catCounters = ['centro'=>0,'cenefa'=>0,'esquina'=>0,'hexagonales'=>0,'antiderrapante'=>0];
        foreach ($folders as $folder) {
            $path = $tapizDir . '/' . $folder;
            $pngs = glob($path . '/*.png');
            if (!$pngs) {
                continue;
            }
            sort($pngs, SORT_NATURAL | SORT_FLAG_CASE);
            $src = $pngs[0];
            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $folder));
            $slug = trim($slug, '-');
            if ($slug === '') {
                $slug = 'modelo-' . $idx;
            }
            $targetRel = 'Tapiz/' . rawurlencode($folder) . '/' . rawurlencode(basename($src));

            $categoria = 'centro';
            if (isset($catCounters[$categoria])) {
                $catCounters[$categoria]++;
            }
            $items[] = normaliza_item([
                'id' => $idx,
                'nombre' => ucwords(str_replace(['_', '-'], ' ', $folder)),
                'imagen' => $targetRel,
                'descripcion' => '',
                'precio' => 0,
                'categoria' => $categoria,
                'identificador' => '',
            ]);
            $idx++;
        }
    }
}

if (!empty($items)) {
usort($items, static function ($a, $b) {
    $rankCmp = categoria_rank($a['categoria']) <=> categoria_rank($b['categoria']);
    if ($rankCmp !== 0) {
        return $rankCmp;
    }
    return strcasecmp((string)$a['nombre'], (string)$b['nombre']);
});
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
        <div class="logo"><img src="assets/logo-dzununcan.svg" alt="Mosaicos Dzununcan" /></div>
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
      <h2 data-i18n="decorated_title">Mosaicos Decorados</h2>
      <p data-i18n="decorated_desc">Seleccione un modelo para ver su ficha. Puede personalizar colores en el simulador.</p>
    </section>

    <section class="panel decorated-layout">
      <div class="mosaic-grid-wrap">
        <div class="mosaic-grid mosaic-grid-small">
          <?php if (!empty($items)): ?>
            <?php foreach ($items as $m): ?>
              <article class="mosaic-card">
                <img src="<?= htmlspecialchars($m['imagen'] ?: 'assets/placeholder-tile.svg', ENT_QUOTES) ?>" alt="<?= htmlspecialchars($m['nombre'], ENT_QUOTES) ?>" />
                <p class="code"><?= htmlspecialchars(strtoupper($m['categoria']), ENT_QUOTES) ?> · <?= htmlspecialchars($m['identificador'], ENT_QUOTES) ?></p>
                <p class="name"><?= htmlspecialchars($m['nombre'], ENT_QUOTES) ?></p>
                <a class="action" href="personalizar.php?picker=single&id=<?= urlencode((string)$m['id']) ?>&lang=<?= $lang ?>&img=<?= urlencode((string)($m['imagen'] ?: "assets/placeholder-tile.svg")) ?>&name=<?= urlencode((string)$m['nombre']) ?>&cat=<?= urlencode((string)$m['categoria']) ?>" data-i18n="btn_customize">Personalizar</a>
              </article>
            <?php endforeach; ?>
          <?php else: ?>
            <p class="empty-msg">Aún no hay modelos cargados en <strong>Tapiz/</strong>. Agrega carpetas con PNG y ejecuta <code>python3 scripts/import_tapiz.py</code>.</p>
          <?php endif; ?>
        </div>
      </div>
      <aside class="quote-box">
        <div class="quote-top">
          <h4 data-i18n="custom_panel_title">Personalizar Diseño</h4>
          <p data-i18n="custom_panel_desc">Cambie los colores del mosaico de su elección.</p>
          <a class="action quote-top-btn" data-keep-lang href="personalizar.php" data-i18n="custom_panel_cta">Pruebe el simulador de colores ahora</a>
        </div>
        <h3 data-i18n="quote_title">Solicite una Cotización</h3>
        <p data-i18n="quote_desc">Llene el siguiente formulario, comente los productos que desea y a la brevedad uno de nuestros agentes de venta se comunicará con usted.</p>
        <form class="quote-form" action="mailto:ventas@mosaicosdzununcan.com" method="post" enctype="text/plain">
          <input type="text" name="nombre" data-i18n-placeholder="quote_name" placeholder="Nombre" required />
          <input type="email" name="email" data-i18n-placeholder="quote_email" placeholder="Email" required />
          <input type="tel" name="telefono" data-i18n-placeholder="quote_phone" placeholder="Teléfono" />
          <textarea name="comentarios" rows="8" data-i18n-placeholder="quote_comments" placeholder="Comentarios" required></textarea>
          <button type="submit" class="action quote-submit" data-i18n="quote_send">Enviar</button>
        </form>
      </aside>
    </section>
  </main>
  <script src="app.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
