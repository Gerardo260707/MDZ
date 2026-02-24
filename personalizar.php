<?php
$id = $_GET['id'] ?? '1';
$name = 'Mosaico ejemplo ' . preg_replace('/[^0-9A-Za-z\- ]/', '', (string)$id);
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
      <h2 data-i18n="custom_title">Personalizar Diseño</h2>
      <p><strong><?= htmlspecialchars($name, ENT_QUOTES) ?></strong></p>
    </section>

    <section class="panel">
      <div class="custom-wrap">
        <div>
          <p data-i18n="custom_step1">1. Selecciona un color.</p>
          <div class="preview-small" id="smallPreview"></div>
        </div>
        <div>
          <div class="palette" id="palette"></div>
          <button id="applyColor" class="action" data-i18n="custom_apply">Aplicar color</button>
          <button id="resetColor" class="action" style="margin-top:8px" data-i18n="custom_reset">Imagen original</button>
        </div>
        <div>
          <p data-i18n="custom_step2">2. Haz clic en aplicar para actualizar la vista grande.</p>
          <div class="preview-big" id="bigPreview"></div>
          <button id="download" class="action" style="margin-top:8px" data-i18n="custom_download">Descargar imagen</button>
        </div>
      </div>
    </section>
  </main>

  <script src="app.js"></script>
  <script>
    const colors = ['#962f2f','#ca6f46','#f1ad2e','#2f658c','#7c90aa','#2b8481','#2a3a4f','#a3b57a','#dac9ad','#303030','#8d4d60','#f4f4f0','#1b4f72','#3d9970','#b03a2e'];
    const palette = document.getElementById('palette');
    const small = document.getElementById('smallPreview');
    const big = document.getElementById('bigPreview');
    let selected = '#2f658c';
    colors.forEach(c=>{
      const b = document.createElement('button');
      b.className = 'sw';
      b.style.background = c;
      b.addEventListener('click', ()=> selected = c);
      palette.appendChild(b);
    });
    function applyColor(c){
      small.style.setProperty('--sel', c);
      big.style.setProperty('--sel', c);
    }
    document.getElementById('applyColor').addEventListener('click', ()=>applyColor(selected));
    document.getElementById('resetColor').addEventListener('click', ()=>applyColor('#2f658c'));
    document.getElementById('download').addEventListener('click', () => {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='1200' height='800' fill='${selected}'/></svg>`;
      const blob = new Blob([svg], {type: 'image/svg+xml'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mosaico-personalizado.svg';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    applyColor(selected);
  </script>
</body>
</html>
