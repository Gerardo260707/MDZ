<?php
$lang = (($_GET['lang'] ?? 'es') === 'en') ? 'en' : 'es';

function carga_cat_especiales(string $csv): array {
    if (!file_exists($csv)) {
        $dir = dirname($csv);
        if (!is_dir($dir)) mkdir($dir, 0775, true);
        $h = fopen($csv, 'w');
        if ($h) { fputcsv($h, ['carpeta','categoria','hex_rotacion']); fclose($h); }
        return [];
    }
    $h = fopen($csv,'r');
    if (!$h) return [];
    fgetcsv($h);
    $m=[];
    while (($r=fgetcsv($h))!==false) {
        $folder = strtolower(trim((string)($r[0]??'')));
        $cat = strtolower(trim((string)($r[1]??'')));
        $hexRotRaw = trim((string)($r[2]??''));
        if ($folder==='') continue;
        $hexRot = null;
        if ($hexRotRaw !== '' && is_numeric($hexRotRaw)) {
            $hexRot = fmod((float)$hexRotRaw, 360.0);
        }
        $m[$folder]=['cat'=>$cat,'hex_rot'=>$hexRot];
    }
    fclose($h);
    return $m;
}

$map = carga_cat_especiales(__DIR__ . '/config/categorias_especiales.csv');
$base = __DIR__ . '/Especiales';
$items = [];
if (is_dir($base)) {
    foreach (array_filter(scandir($base)?:[], fn($n)=>$n!=='.'&&$n!=='..'&&is_dir($base.'/'.$n)) as $folder) {
        $pngs = glob($base.'/'.$folder.'/*.{png,jpg,jpeg,webp,avif}', GLOB_BRACE);
        if (!$pngs) continue;
        sort($pngs, SORT_NATURAL|SORT_FLAG_CASE);
        $src = $pngs[0];
        $meta = $map[strtolower($folder)] ?? ['cat' => 'formas', 'hex_rot' => null];
        $cat = $meta['cat'] ?: 'formas';
        $items[] = [
          'folder'=>$folder,
          'cat'=>$cat,
          'img'=>'Especiales/'.rawurlencode($folder).'/'.rawurlencode(basename($src)).'?v='.(@filemtime($src)?:time()),
          'name'=>ucwords(str_replace(['_','-'],' ',$folder)),
          'hex_rot'=>$meta['hex_rot'],
        ];
    }
}
$order=['formas'=>1,'antiderrapantes'=>2,'zoclos'=>3];
usort($items, fn($a,$b)=> (($order[$a['cat']]??9)<=>($order[$b['cat']]??9)) ?: strcasecmp($a['name'],$b['name']));
$labels=[
  'es'=>['formas'=>'Formas','antiderrapantes'=>'Antiderrapantes','zoclos'=>'Zoclos','other'=>'Otros'],
  'en'=>['formas'=>'Shapes','antiderrapantes'=>'Anti-slip','zoclos'=>'Baseboards','other'=>'Others'],
];
?>
<!doctype html>
<html lang="<?= $lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= $lang === 'en' ? 'Specials' : 'Especiales' ?> | Mosaicos Dzununcán</title>
  <link rel="stylesheet" href="assets.css" />
</head>
<body>
  <main class="site">
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
      <h2><?= $lang==='en' ? 'Specials' : 'Especiales' ?></h2>
    </section>
    <section class="panel especiales-grid">
      <?php foreach ($items as $it): $c=$it['cat']; $lbl=$labels[$lang][$c] ?? $labels[$lang]['other']; ?>
      <article class="mosaic-card special-card">
        <img src="<?= htmlspecialchars($it['img'], ENT_QUOTES) ?>" alt="<?= htmlspecialchars($it['name'], ENT_QUOTES) ?>" <?= $it['hex_rot'] !== null ? "data-hex-rotation=\"" . htmlspecialchars((string)$it['hex_rot'], ENT_QUOTES) . "\"" : "" ?> />
        <div class="name"><?= htmlspecialchars($it['name'], ENT_QUOTES) ?></div>
        <div class="code"><?= htmlspecialchars($lbl, ENT_QUOTES) ?></div>
      </article>
      <?php endforeach; ?>
    </section>
  </main>
  <script src="app.js"></script>
  <script src="site-pages.js"></script>
</body>
</html>
