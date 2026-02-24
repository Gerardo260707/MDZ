(function () {
  function q(id) { return document.getElementById(id); }

  function getLang() {
    return window.siteI18n ? window.siteI18n.getLang() : 'es';
  }

  function tByLang(lang, es, en) {
    return lang === 'en' ? en : es;
  }

  function initHome() {
    const slidesContainer = q('slides');
    const dotsContainer = q('dots');
    const cardsContainer = q('featureCards');
    if (!slidesContainer || !dotsContainer || !cardsContainer) return;

    const CAROUSEL_SLIDES = [
      { title: '¡50% DE DESCUENTO!', subtitle: 'EN PISOS DECORADOS 20x20 COLLAGE', background: 'repeating-linear-gradient(45deg,#5e7f99 0 32px,#e5dcc1 32px 64px,#8f2a2a 64px 96px,#f4f4f0 96px 128px,#2b8481 128px 160px,#be7a5c 160px 192px)' },
      { title: 'ENVÍOS A TODO MÉXICO', subtitle: 'COMPRA DESDE CUALQUIER ESTADO', background: 'repeating-linear-gradient(135deg,#295e85 0 26px,#f0deb9 26px 52px,#943636 52px 78px,#f8f7f2 78px 104px,#488780 104px 130px,#d27f5f 130px 156px)' },
      { title: 'NUEVOS DISEÑOS', subtitle: 'COLECCIONES PERSONALIZADAS', background: 'repeating-linear-gradient(25deg,#33608f 0 25px,#ebdbb8 25px 50px,#7d1f1f 50px 75px,#f4f2e9 75px 100px,#3c8f88 100px 125px,#ca8867 125px 150px)' }
    ];

    const lang = getLang();
    const FEATURE_CARDS = [
      { file: 'galeria.jpg', label: tByLang(lang, 'Mosaicos', 'Mosaics'), href: 'mosaicos.html' },
      { file: 'instalacion.jpg', label: tByLang(lang, 'Personalizar', 'Customize'), href: 'personalizar.php?id=1&name=Mosaico%20ejemplo%201&img=assets/placeholder-tile.svg' },
      { file: 'contacto.jpg', label: tByLang(lang, 'Colores', 'Colors'), href: 'galeria.html' }
    ];

    FEATURE_CARDS.forEach((card) => {
      const a = document.createElement('a');
      a.className = 'tile-card';
      a.href = `${card.href}${card.href.includes('?') ? '&' : '?'}lang=${lang}`;
      a.innerHTML = `<img src="assets/cuadros/${card.file}" alt="${card.label}" onerror="this.src='assets/placeholder-tile.svg'" /><span>${card.label}</span>`;
      cardsContainer.appendChild(a);
    });

    let activeIndex = 0;
    const slideEls = CAROUSEL_SLIDES.map((slide, index) => {
      const article = document.createElement('article');
      article.className = `slide ${index === 0 ? 'active' : ''}`;
      article.style.setProperty('--slide-bg', slide.background);
      article.innerHTML = `<div class="promo"><strong>${slide.title}</strong><span>${slide.subtitle}</span></div>`;
      slidesContainer.appendChild(article);

      const dot = document.createElement('button');
      dot.className = index === 0 ? 'active' : '';
      dot.addEventListener('click', () => showSlide(index));
      dotsContainer.appendChild(dot);
      return article;
    });

    const dotEls = [...dotsContainer.children];
    function showSlide(index) {
      activeIndex = index;
      slideEls.forEach((el, i) => el.classList.toggle('active', i === index));
      dotEls.forEach((el, i) => el.classList.toggle('active', i === index));
    }
    setInterval(() => showSlide((activeIndex + 1) % CAROUSEL_SLIDES.length), 4500);
  }

  function initCategories() {
    const el = q('catGrid');
    if (!el) return;
    const lang = getLang();
    const categories = [
      { key: 'cat_colors', img: 'assets/placeholder-tile.svg', href: 'galeria.html' },
      { key: 'cat_decorated', img: 'assets/placeholder-tile.svg', href: 'mosaicos.php' },
      { key: 'cat_specials', img: 'assets/placeholder-tile.svg', href: 'galeria.html' },
      { key: 'cat_customize', img: 'assets/placeholder-tile.svg', href: 'personalizar.php?id=1&name=Mosaico%20ejemplo%201&img=assets/placeholder-tile.svg' }
    ];
    const dict = {
      es: { cat_colors: 'Lisos', cat_decorated: 'Decorados', cat_specials: 'Especiales', cat_customize: 'Personalizar', btn: 'Ver modelos » clic aquí' },
      en: { cat_colors: 'Solid Colors', cat_decorated: 'Decorated', cat_specials: 'Specials', cat_customize: 'Customize', btn: 'View models » click here' }
    };
    const t = dict[lang] || dict.es;
    categories.forEach((c) => {
      const card = document.createElement('article');
      card.className = 'category-card';
      const href = c.href + (c.href.includes('?') ? '&' : '?') + 'lang=' + lang;
      card.innerHTML = `<img src="${c.img}" alt="${t[c.key]}"/><h3>${t[c.key]}</h3><a href="${href}">${t.btn}</a>`;
      el.appendChild(card);
    });
  }

  function templateSvg() {
    return `
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect data-part="base" x="0" y="0" width="400" height="400" fill="#f1f1f1"/>
        <polygon data-part="a" points="0,0 200,0 0,200" fill="#2f658c"/>
        <polygon data-part="b" points="400,0 200,0 400,200" fill="#8da7c8"/>
        <polygon data-part="c" points="0,400 0,200 200,400" fill="#33495f"/>
        <polygon data-part="d" points="400,400 200,400 400,200" fill="#5f748d"/>
        <polygon data-part="center" points="200,90 310,200 200,310 90,200" fill="#d8dee8"/>
      </svg>
    `;
  }

  function setupInteractiveSvg(svg, selectedColorRef, onChange) {
    const parts = svg.querySelectorAll('[data-part], path, polygon, rect, circle, ellipse');
    parts.forEach((part, index) => {
      if (part.closest('defs, clipPath, mask')) return;
      if (!part.dataset.part) part.dataset.part = `part-${index}`;
      part.style.cursor = 'pointer';
      part.addEventListener('click', () => {
        part.setAttribute('fill', selectedColorRef.value);
        onChange();
      });
    });
  }

  function svgToDataUrl(svgEl) {
    const str = new XMLSerializer().serializeToString(svgEl);
    return `data:image/svg+xml;utf8,${encodeURIComponent(str)}`;
  }

  async function initCustomizer() {
    const palette = q('palette');
    const editor = q('vectorEditor');
    const big = q('bigPreview');
    if (!palette || !editor || !big) return;

    const src = big.dataset.image || 'assets/placeholder-tile.svg';
    const category = (big.dataset.category || 'centro').toLowerCase();
    const modelName = new URLSearchParams(window.location.search).get('name') || 'Modelo';
    const colors = [
      '#9b3536','#a02f2f','#a83232','#6e4648','#633737','#7d5545',
      '#ad9764','#906643','#955f49','#cc6f4a','#b85a3d','#1f2426',
      '#7f4044','#89767e','#767791','#b0a3a3','#d1b3a9','#dcd2bf',
      '#b69b77','#c0b1b1','#d8b3af','#d88582','#c46d78','#6f928c',
      '#c7bbb0','#d8cbb8','#f79a06','#d9a12d','#e2b451','#85a389',
      '#80a38a','#6f8682','#e6cd69','#e6bc6e','#e1af2f','#94994d',
      '#979167','#7d9c7c','#7f8e7d','#5c6e62','#7fa35d','#37495f',
      '#b7b7a8','#8ea88b','#77786b','#83b4af','#4f8f6c','#75806a',
      '#5b6a98','#5b5ee0','#6685b1','#2f80b3','#8db5b4','#c8d9d4',
      '#a6a6a6','#7a8a91','#8f8f8d','#757575','#a7c7c1','#9ab9d2',
      '#979797','#bdbbbb','#c3c2c1','#cececd','#e7e2d6','#d8d8da',
      '#6f978e','#436c99','#b7b7ae'
    ];

    let selected = colors[0];
    const usedColors = new Set();

    editor.innerHTML = '<canvas id="editCanvas" class="vector-canvas" width="600" height="600"></canvas>';
    big.innerHTML = '<canvas id="patternCanvas" class="pattern-canvas" width="1200" height="800"></canvas>';

    const editCanvas = q('editCanvas');
    const patternCanvas = q('patternCanvas');
    const ectx = editCanvas.getContext('2d', { willReadFrequently: true });
    const pctx = patternCanvas.getContext('2d');

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = 600;
    srcCanvas.height = 600;
    const sctx = srcCanvas.getContext('2d', { willReadFrequently: true });

    let sourceImageData = null;
    let currentImageData = null;

    function drawImageCover(ctx, img, w, h) {
      const scale = Math.max(w / img.width, h / img.height);
      const nw = img.width * scale;
      const nh = img.height * scale;
      const x = (w - nw) / 2;
      const y = (h - nh) / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, x, y, nw, nh);
    }

    function renderEdit() {
      if (!currentImageData) return;
      ectx.putImageData(currentImageData, 0, 0);
    }

    function drawPattern() {
      if (!currentImageData) return;
      const tile = document.createElement('canvas');
      tile.width = 200;
      tile.height = 200;
      const tctx = tile.getContext('2d');
      const temp = document.createElement('canvas');
      temp.width = 600;
      temp.height = 600;
      temp.getContext('2d').putImageData(currentImageData, 0, 0);
      tctx.drawImage(temp, 0, 0, 200, 200);

      const w = patternCanvas.width;
      const h = patternCanvas.height;
      const cols = 12;
      const rows = 8;
      const tw = Math.floor(w / cols);
      const th = Math.floor(h / rows);

      pctx.clearRect(0, 0, w, h);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * tw;
          const y = r * th;
          pctx.save();
          pctx.translate(x + tw / 2, y + th / 2);

          let angle = 0;
          if (category === 'centro') {
            const map = [[0, Math.PI / 2], [3 * Math.PI / 2, Math.PI]];
            angle = map[r % 2][c % 2];
          }

          pctx.rotate(angle);
          pctx.drawImage(tile, -tw / 2, -th / 2, tw, th);
          pctx.restore();
        }
      }
    }

    function floodFillAt(x, y, hexColor) {
      if (!sourceImageData || !currentImageData) return;
      const w = sourceImageData.width;
      const h = sourceImageData.height;
      const sx = Math.max(0, Math.min(w - 1, Math.floor(x)));
      const sy = Math.max(0, Math.min(h - 1, Math.floor(y)));
      const src = sourceImageData.data;
      const dst = currentImageData.data;
      const i0 = (sy * w + sx) * 4;
      const tr = src[i0], tg = src[i0 + 1], tb = src[i0 + 2], ta = src[i0 + 3];
      if (ta < 10) return;

      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

      const visited = new Uint8Array(w * h);
      const qx = new Int32Array(w * h);
      const qy = new Int32Array(w * h);
      let head = 0, tail = 0;
      qx[tail] = sx;
      qy[tail] = sy;
      tail++;

      const tol = 42;
      while (head < tail) {
        const cx = qx[head];
        const cy = qy[head];
        head++;
        const p = cy * w + cx;
        if (visited[p]) continue;
        visited[p] = 1;

        const i = p * 4;
        const dr = Math.abs(src[i] - tr);
        const dg = Math.abs(src[i + 1] - tg);
        const db = Math.abs(src[i + 2] - tb);
        const da = src[i + 3];
        if (da < 10 || dr + dg + db > tol) continue;

        const lum = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) / 255;
        dst[i] = Math.max(0, Math.min(255, Math.round(r * lum)));
        dst[i + 1] = Math.max(0, Math.min(255, Math.round(g * lum)));
        dst[i + 2] = Math.max(0, Math.min(255, Math.round(b * lum)));
        dst[i + 3] = da;

        if (cx > 0) { qx[tail] = cx - 1; qy[tail] = cy; tail++; }
        if (cx < w - 1) { qx[tail] = cx + 1; qy[tail] = cy; tail++; }
        if (cy > 0) { qx[tail] = cx; qy[tail] = cy - 1; tail++; }
        if (cy < h - 1) { qx[tail] = cx; qy[tail] = cy + 1; tail++; }
      }

      usedColors.add(hexColor.toUpperCase());
      renderEdit();
      drawPattern();
    }

    editCanvas.addEventListener('click', (ev) => {
      const rect = editCanvas.getBoundingClientRect();
      const x = (ev.clientX - rect.left) * (editCanvas.width / rect.width);
      const y = (ev.clientY - rect.top) * (editCanvas.height / rect.height);
      floodFillAt(x, y, selected);
    });

    colors.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'sw';
      b.type = 'button';
      b.style.background = c;
      b.addEventListener('click', () => {
        selected = c;
        document.querySelectorAll('.sw').forEach((n) => n.classList.remove('active'));
        b.classList.add('active');
      });
      palette.appendChild(b);
    });

    const resetBtn = q('resetColor');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!sourceImageData) return;
        currentImageData = new ImageData(new Uint8ClampedArray(sourceImageData.data), sourceImageData.width, sourceImageData.height);
        usedColors.clear();
        renderEdit();
        drawPattern();
      });
    }

    const dl = q('download');
    if (dl) {
      dl.addEventListener('click', () => {
        const patternUrl = patternCanvas.toDataURL('image/png');
        const colorsHtml = (Array.from(usedColors).length ? Array.from(usedColors) : [selected.toUpperCase()])
          .map((c) => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="width:14px;height:14px;background:${c};display:inline-block;border:1px solid #333"></span><span>${c}</span></div>`)
          .join('');

        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`
          <html><head><title>${modelName}</title></head>
          <body style="font-family:Arial;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <h2 style="margin:0;">Mosaicos Dzununcan</h2>
                <p style="margin:4px 0 0;">ventas@mosaicosdzununcan.com<br/>Tel: (999) 406-9083 · (999) 286-6163</p>
              </div>
              <div><strong>${modelName}</strong></div>
            </div>
            <div style="display:flex;gap:16px;margin-top:14px;align-items:flex-start;">
              <img src="${patternUrl}" style="width:780px;max-width:78vw;border:1px solid #999;" />
              <div>
                <h4 style="margin:0 0 8px;">Colores usados</h4>
                ${colorsHtml}
              </div>
            </div>
          </body></html>
        `);
        w.document.close();
        w.focus();
        w.print();
      });
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      drawImageCover(sctx, img, 600, 600);
      sourceImageData = sctx.getImageData(0, 0, 600, 600);
      currentImageData = new ImageData(new Uint8ClampedArray(sourceImageData.data), sourceImageData.width, sourceImageData.height);
      renderEdit();
      drawPattern();
    };
    img.onerror = () => {
      sctx.fillStyle = '#ddd';
      sctx.fillRect(0, 0, 600, 600);
      sctx.fillStyle = '#666';
      sctx.font = '24px Arial';
      sctx.fillText('PNG no disponible', 180, 300);
      sourceImageData = sctx.getImageData(0, 0, 600, 600);
      currentImageData = new ImageData(new Uint8ClampedArray(sourceImageData.data), sourceImageData.width, sourceImageData.height);
      renderEdit();
      drawPattern();
    };
    img.src = src;
  }

  function initDarkFooter() {
    const main = document.querySelector('main.site');
    if (!main || document.getElementById('siteDarkFooter')) return;
    const lang = getLang();
    const html = lang === 'en'
      ? `<footer id="siteDarkFooter" class="dark-footer"><div class="dark-cols"><div><h4>Mosaicos Dzununcan</h4><p>Mexican cement tile manufacturer with custom projects.</p><p><a href="#">Privacy Policy</a><br><a href="#">Terms and Conditions</a><br><a href="#">Site map</a></p></div><div><h4>Phones</h4><p>Local: +52 (999) 217-9326</p><p>Factory: +52 (999) 249-5158</p><p>Email: ventas@mosaicosdzununcan.com</p></div><div><h4>Address</h4><p>Sales & Showroom:<br/>Calle 37, No. 318 entre 24 y 26, Mérida, Yucatán.</p><p>Factory:<br/>Carretera Mérida - Dzununcan Km 2.5</p></div><div><h4>Social</h4><p>Facebook<br>Instagram<br>WhatsApp</p></div></div></footer>`
      : `<footer id="siteDarkFooter" class="dark-footer"><div class="dark-cols"><div><h4>Mosaicos Dzununcan</h4><p>Fabricantes de mosaicos de pasta mexicanos con proyectos personalizados.</p><p><a href="#">Políticas de privacidad</a><br><a href="#">Términos y condiciones</a><br><a href="#">Mapa del sitio</a></p></div><div><h4>Teléfonos</h4><p>Local: +52 (999) 217-9326</p><p>Fábrica: +52 (999) 249-5158</p><p>Email: ventas@mosaicosdzununcan.com</p></div><div><h4>Dirección</h4><p>Venta y sala de exhibición:<br/>Calle 37, No. 318 entre 24 y 26, Mérida, Yucatán.</p><p>Fábrica:<br/>Carretera Mérida - Dzununcan Km 2.5</p></div><div><h4>Redes</h4><p>Facebook<br>Instagram<br>WhatsApp</p></div></div></footer>`;
    main.insertAdjacentHTML('beforeend', html);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHome();
    initCategories();
    initCustomizer();
    initDarkFooter();
  });
})();
