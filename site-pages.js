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

    const fallbackSlides = [
      { title: '¡50% DE DESCUENTO!', subtitle: 'EN PISOS DECORADOS 20x20 COLLAGE', background: 'repeating-linear-gradient(45deg,#5e7f99 0 32px,#e5dcc1 32px 64px,#8f2a2a 64px 96px,#f4f4f0 96px 128px,#2b8481 128px 160px,#be7a5c 160px 192px)' },
      { title: 'ENVÍOS A TODO MÉXICO', subtitle: 'COMPRA DESDE CUALQUIER ESTADO', background: 'repeating-linear-gradient(135deg,#295e85 0 26px,#f0deb9 26px 52px,#943636 52px 78px,#f8f7f2 78px 104px,#488780 104px 130px,#d27f5f 130px 156px)' },
      { title: 'NUEVOS DISEÑOS', subtitle: 'COLECCIONES PERSONALIZADAS', background: 'repeating-linear-gradient(25deg,#33608f 0 25px,#ebdbb8 25px 50px,#7d1f1f 50px 75px,#f4f2e9 75px 100px,#3c8f88 100px 125px,#ca8867 125px 150px)' }
    ];
    const CAROUSEL_SLIDES = Array.isArray(window.HOME_CAROUSEL) && window.HOME_CAROUSEL.length ? window.HOME_CAROUSEL : fallbackSlides;

    const lang = getLang();
    const FEATURE_CARDS = [
      { file: 'galeria.jpg', label: tByLang(lang, 'Mosaicos', 'Mosaics'), href: 'mosaicos.html' },
      { file: 'instalacion.jpg', label: tByLang(lang, 'Personalizar', 'Customize'), href: 'personalizar.php' },
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
      if (slide.image) {
        article.style.background = `center/cover no-repeat url('${slide.image}')`;
      } else {
        article.style.setProperty('--slide-bg', slide.background);
      }
      article.innerHTML = `<div class="promo"><strong>${slide.title || ''}</strong><span>${slide.subtitle || ''}</span></div>`;
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
      { key: 'cat_customize', img: 'assets/placeholder-tile.svg', href: 'personalizar.php' }
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
      card.innerHTML = `<img src="${c.img}" alt="${t[c.key]}"/><h3>${t[c.key]}</h3><a class="cta-pill" href="${href}">${t.btn}</a>`;
      el.appendChild(card);
    });
  }

  function getCustomizerPalette() {
    const fallback = [
      { id: 'R57', hex: '#9B3536', name: 'Rojo barro' },
      { id: 'R58', hex: '#A83232', name: 'Rojo terracota' },
      { id: 'V37', hex: '#4F8F6C', name: 'Verde selva' },
      { id: 'V38', hex: '#6F928C', name: 'Verde salvia' },
      { id: 'A21', hex: '#D9A12D', name: 'Amarillo ocre' },
      { id: 'A22', hex: '#E6BC6E', name: 'Amarillo arena' },
      { id: 'AZ11', hex: '#436C99', name: 'Azul colonial' },
      { id: 'GR10', hex: '#D8D8DA', name: 'Gris claro' }
    ];

    const source = Array.isArray(window.CUSTOMIZER_COLORS) ? window.CUSTOMIZER_COLORS : fallback;
    return source
      .filter((c) => c && typeof c.id === 'string' && typeof c.hex === 'string')
      .map((c) => ({
        id: c.id.trim(),
        hex: c.hex.trim().toUpperCase(),
        name: (c.name || c.id).trim()
      }))
      .filter((c) => /^#[0-9A-F]{6}$/.test(c.hex) && c.id.length > 0);
  }


  function getPdfTemplate() {
    const fallback = {
      page: { widthPt: 612, heightPt: 792, canvasWidth: 1275, canvasHeight: 1650 },
      logo: { src: '', x: 70, y: 48, width: 200, height: 70 },
      title: { x: 70, y: 150, text: 'Mosaicos Dzununcán' },
      model: { x: 70, y: 188 },
      contact: { x: 70, y: 218, text: 'ventas@mosaicosdzununcan.com · (999) 406-9083 · (999) 286-6163' },
      pattern: { x: 70, y: 260, width: 900, height: 600 },
      colorsTitle: { x: 70, y: 910, text: 'Colores usados' },
      colors: { startX: 70, startY: 958, rowGap: 48, colGap: 450, columns: 2 }
    };
    const external = window.CUSTOMIZER_PDF_TEMPLATE || {};
    return { ...fallback, ...external, page: { ...fallback.page, ...(external.page || {}) }, logo: { ...fallback.logo, ...(external.logo || {}) }, title: { ...fallback.title, ...(external.title || {}) }, model: { ...fallback.model, ...(external.model || {}) }, contact: { ...fallback.contact, ...(external.contact || {}) }, pattern: { ...fallback.pattern, ...(external.pattern || {}) }, colorsTitle: { ...fallback.colorsTitle, ...(external.colorsTitle || {}) }, colors: { ...fallback.colors, ...(external.colors || {}) } };
  }

  function hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    };
  }

  function buildPdfFromJpeg(jpegDataUrl, pageWidthPt, pageHeightPt, imageWidth, imageHeight) {
    const base64 = jpegDataUrl.split(',')[1] || '';
    const binary = atob(base64);
    const imgBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) imgBytes[i] = binary.charCodeAt(i);

    const header = '%PDF-1.3\n';
    const objects = [];
    const offsets = [];
    const encoder = new TextEncoder();

    function addObject(body) {
      const index = objects.length + 1;
      const obj = `${index} 0 obj\n${body}\nendobj\n`;
      objects.push(encoder.encode(obj));
      return index;
    }

    addObject('<< /Type /Catalog /Pages 2 0 R >>');
    addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);

    const imageHeader = encoder.encode(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`);
    const imageFooter = encoder.encode('\nendstream\nendobj\n');
    objects.push(new Uint8Array([...imageHeader, ...imgBytes, ...imageFooter]));

    const contentStream = `q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im0 Do\nQ\n`;
    addObject(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream`);

    let size = encoder.encode(header).length;
    for (const obj of objects) {
      offsets.push(size);
      size += obj.length;
    }

    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach((off) => {
      xref += `${String(off).padStart(10, '0')} 00000 n \n`;
    });

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${size}\n%%EOF`;

    const allParts = [encoder.encode(header), ...objects, encoder.encode(xref + trailer)];
    return new Blob(allParts, { type: 'application/pdf' });
  }

  async function initCustomizer() {
    const palette = q('palette');
    const editor = q('vectorEditor');
    const big = q('bigPreview');
    if (!palette || !editor || !big) return;

    const lang = getLang();
    const models = Array.isArray(window.CUSTOMIZER_MODELS) ? window.CUSTOMIZER_MODELS : [];
    const selection = window.CUSTOMIZER_SELECTION || {};
    const pickerMode = (selection.pickerMode || big.dataset.pickerMode || 'dual').toLowerCase() === 'single' ? 'single' : 'dual';

    const centerInput = q('centerSearchInput');
    const cenefaInput = q('cenefaSearchInput');
    const centerResults = q('centerSearchResults');
    const cenefaResults = q('cenefaSearchResults');
    const selectedModelNameEl = q('selectedModelName');
    const manualConnections = (window.CUSTOMIZER_CONNECTIONS && typeof window.CUSTOMIZER_CONNECTIONS === 'object') ? window.CUSTOMIZER_CONNECTIONS : {};

    function norm(text) {
      return String(text || '').toLowerCase().replace(/[\s_\-]+/g, ' ').trim();
    }

    function familyKey(model) {
      const raw = model.carpeta_modelo || model.nombre || '';
      return norm(raw).replace(/(centro|cenefa|esquina|corner|borde|border)/g, '').trim();
    }

    function findEsquinaForCenefa(cenefaModel) {
      if (!cenefaModel) return null;
      const folderRaw = (cenefaModel.carpeta_modelo || '').toString().toLowerCase();
      const mappedFolder = manualConnections[folderRaw] || null;
      if (mappedFolder) {
        const mapped = models.find((m) => (m.categoria || '').toLowerCase() === 'esquina' && (m.carpeta_modelo || '').toString().toLowerCase() === mappedFolder);
        if (mapped) return mapped;
      }
      const key = familyKey(cenefaModel);
      return models.find((m) => (m.categoria || '').toLowerCase() === 'esquina' && familyKey(m) === key) || null;
    }

    function goToSelection(centerModel, cenefaModel, esquinaModel) {
      const url = new URL(window.location.href);
      url.searchParams.set('picker', pickerMode);
      if (centerModel) url.searchParams.set('center_id', String(centerModel.id));
      else url.searchParams.delete('center_id');

      if (pickerMode === 'dual') {
        if (cenefaModel) url.searchParams.set('cenefa_id', String(cenefaModel.id));
        else url.searchParams.delete('cenefa_id');
        if (esquinaModel) url.searchParams.set('esquina_id', String(esquinaModel.id));
        else url.searchParams.delete('esquina_id');
      } else {
        url.searchParams.delete('cenefa_id');
        url.searchParams.delete('esquina_id');
      }

      const editable = centerModel;
      const fallbackEditable = editable || cenefaModel || esquinaModel;
      if (fallbackEditable) {
        url.searchParams.set('id', String(fallbackEditable.id));
        url.searchParams.set('name', fallbackEditable.nombre || 'Modelo');
        url.searchParams.set('img', fallbackEditable.imagen || 'assets/placeholder-tile.svg');
        url.searchParams.set('cat', (fallbackEditable.categoria || '').toLowerCase());
      }
      url.searchParams.set('lang', lang);
      window.location.assign(url.pathname + url.search + url.hash);
    }

    function renderSelector({ inputEl, resultEl, category, selectedId, onPick }) {
      if (!inputEl || !resultEl) return;
      const query = norm(inputEl.value);
      const filtered = models.filter((m) => {
        if ((m.categoria || '').toLowerCase() !== category) return false;
        if (!query) return true;
        return norm(m.nombre).includes(query) || norm(m.identificador).includes(query);
      }).slice(0, 6);

      if (!filtered.length) {
        resultEl.innerHTML = `<div class="model-search-empty">${lang === 'en' ? 'No models found.' : 'No se encontraron modelos.'}</div>`;
        return;
      }

      resultEl.innerHTML = '';
      filtered.forEach((m) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'model-search-item';
        if (String(m.id) === String(selectedId || '')) item.classList.add('active');
        const code = m.identificador ? ` · ${m.identificador}` : '';
        item.textContent = `${m.nombre || 'Modelo'}${code}`;
        item.addEventListener('click', () => onPick(m));
        resultEl.appendChild(item);
      });
    }

    const selectedCenter = models.find((m) => String(m.id) === String(selection.centerId || '')) || null;
    const selectedCenefa = models.find((m) => String(m.id) === String(selection.cenefaId || '')) || null;
    const selectedEsquina = models.find((m) => String(m.id) === String(selection.esquinaId || '')) || null;

    const forcedSingleCategory = pickerMode === 'single'
      ? ((big.dataset.entryCategory || big.dataset.category || '').toLowerCase().trim() || 'centro')
      : 'centro';

      if (centerInput) {
      if (pickerMode === 'single') {
        centerInput.placeholder = (forcedSingleCategory === 'cenefa')
          ? (lang === 'en' ? 'Select border' : 'Seleccionar cenefa')
          : (forcedSingleCategory === 'esquina'
            ? (lang === 'en' ? 'Select corner' : 'Seleccionar esquina')
            : (lang === 'en' ? 'Select center' : 'Seleccionar centro'));
      }
      if (selectedCenter) centerInput.value = selectedCenter.nombre || '';
      centerInput.addEventListener('input', () => renderSelector({
        inputEl: centerInput,
        resultEl: centerResults,
        category: forcedSingleCategory,
        selectedId: selectedCenter ? selectedCenter.id : null,
        onPick: (pickedModel) => {
          if (pickerMode === 'single' && forcedSingleCategory === 'cenefa') {
            goToSelection(selectedCenter, pickedModel, findEsquinaForCenefa(pickedModel));
            return;
          }
          if (pickerMode === 'single' && forcedSingleCategory === 'esquina') {
            goToSelection(selectedCenter, selectedCenefa, pickedModel);
            return;
          }
          goToSelection(pickedModel, selectedCenefa, selectedEsquina);
        },
      }));
      centerInput.addEventListener('focus', () => centerInput.dispatchEvent(new Event('input')));
      centerInput.dispatchEvent(new Event('input'));
    }

    if (pickerMode === 'dual' && cenefaInput) {
      if (selectedCenefa) cenefaInput.value = selectedCenefa.nombre || '';
      cenefaInput.addEventListener('input', () => renderSelector({
        inputEl: cenefaInput,
        resultEl: cenefaResults,
        category: 'cenefa',
        selectedId: selectedCenefa ? selectedCenefa.id : null,
        onPick: (cenefaModel) => goToSelection(selectedCenter, cenefaModel, findEsquinaForCenefa(cenefaModel)),
      }));
      cenefaInput.addEventListener('focus', () => cenefaInput.dispatchEvent(new Event('input')));
      cenefaInput.dispatchEvent(new Event('input'));
    }

    const src = (big.dataset.image || '').trim();
    const centerSrc = (big.dataset.centerImage || '').trim();
    const cenefaSrc = (big.dataset.cenefaImage || '').trim();
    const esquinaSrc = (big.dataset.esquinaImage || '').trim();
    const editTarget = (big.dataset.editTarget || '').toLowerCase();
    if (!src && !cenefaSrc && !esquinaSrc) {
      editor.innerHTML = `<p class="empty-msg">${lang === 'en' ? 'Select a model from the search bar above to start customizing.' : 'Selecciona un modelo en la barra de búsqueda para comenzar a personalizar.'}</p>`;
      big.innerHTML = `<p class="empty-msg">${lang === 'en' ? 'Pattern preview will appear here once a model is selected.' : 'La vista previa aparecerá aquí cuando elijas un modelo.'}</p>`;
      palette.innerHTML = '';
      const downloadBtn = q('download');
      if (downloadBtn) downloadBtn.style.display = 'none';
      if (selectedModelNameEl && !selectedModelNameEl.textContent.trim()) {
        selectedModelNameEl.textContent = lang === 'en' ? 'Choose a model to begin' : 'Elige un modelo para comenzar';
      }
      return;
    }

    const category = (big.dataset.category || 'centro').toLowerCase();
    const modelName = new URLSearchParams(window.location.search).get('name') || 'Modelo';
    const colors = getCustomizerPalette();
    if (!colors.length) return;

    let selected = colors[0];
    const undoStack = [];
    const redoStack = [];

    function cloneImageData(imageData) {
      return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
    }

    function updateHistoryButtons() {
      const undoBtn = q('undoColor');
      const redoBtn = q('redoColor');
      if (undoBtn) undoBtn.disabled = undoStack.length === 0;
      if (redoBtn) redoBtn.disabled = redoStack.length === 0;
    }

    function getUsedColorIdsFromDiff() {
      if (!sourceImageData || !currentImageData) return [];
      const src = sourceImageData.data;
      const cur = currentImageData.data;
      const used = new Set();
      const colorByRgb = new Map();
      colors.forEach((c) => {
        const rgb = hexToRgb(c.hex);
        colorByRgb.set(`${rgb.r},${rgb.g},${rgb.b}`, c.id);
      });

      for (let i = 0; i < cur.length; i += 4) {
        if (cur[i + 3] < 10) continue;
        const same = cur[i] === src[i] && cur[i + 1] === src[i + 1] && cur[i + 2] === src[i + 2] && cur[i + 3] === src[i + 3];
        if (same) continue;
        const key = `${cur[i]},${cur[i + 1]},${cur[i + 2]}`;
        const colorId = colorByRgb.get(key);
        if (colorId) used.add(colorId);
      }
      return Array.from(used);
    }

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

    const queueX = new Int32Array(600 * 600);
    const queueY = new Int32Array(600 * 600);
    const visited = new Uint32Array(600 * 600);
    let visitToken = 1;

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

    let centerImg = null;
    let cenefaImg = null;
    let esquinaImg = null;
    let cenefaEditedCanvas = null;
    let esquinaEditedCanvas = null;
    let cenefaEditor = null;
    let esquinaEditor = null;

    function snapshotState() {
      return {
        main: currentImageData ? cloneImageData(currentImageData) : null,
        cenefa: cenefaEditor && cenefaEditor.current ? cloneImageData(cenefaEditor.current) : null,
        esquina: esquinaEditor && esquinaEditor.current ? cloneImageData(esquinaEditor.current) : null,
      };
    }

    function applySnapshot(snapshot) {
      if (!snapshot) return;
      if (snapshot.main) {
        currentImageData = cloneImageData(snapshot.main);
        renderEdit();
      }
      if (cenefaEditor && snapshot.cenefa) {
        cenefaEditor.current = cloneImageData(snapshot.cenefa);
        cenefaEditor.ctx.putImageData(cenefaEditor.current, 0, 0);
        const c = document.createElement('canvas');
        c.width = cenefaEditor.canvas.width;
        c.height = cenefaEditor.canvas.height;
        c.getContext('2d').putImageData(cenefaEditor.current, 0, 0);
        cenefaEditedCanvas = c;
      }
      if (esquinaEditor && snapshot.esquina) {
        esquinaEditor.current = cloneImageData(snapshot.esquina);
        esquinaEditor.ctx.putImageData(esquinaEditor.current, 0, 0);
        const c = document.createElement('canvas');
        c.width = esquinaEditor.canvas.width;
        c.height = esquinaEditor.canvas.height;
        c.getContext('2d').putImageData(esquinaEditor.current, 0, 0);
        esquinaEditedCanvas = c;
      }
      drawPattern();
      updateHistoryButtons();
    }

    function pushHistory() {
      undoStack.push(snapshotState());
      if (undoStack.length > 40) undoStack.shift();
      redoStack.length = 0;
      updateHistoryButtons();
    }

    function drawTile(ctx, source, row, col, tileW, tileH, angle) {
      if (!source) return;
      const x = col * tileW;
      const y = row * tileH;
      ctx.save();
      ctx.translate(x + tileW / 2, y + tileH / 2);
      ctx.rotate(angle || 0);
      ctx.drawImage(source, -tileW / 2, -tileH / 2, tileW, tileH);
      ctx.restore();
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
      pctx.clearRect(0, 0, w, h);

      if (cenefaSrc || esquinaSrc) {
        const cols = 12;
        const rows = 8;
        const tw = Math.floor(w / cols);
        const th = Math.floor(h / rows);

        const centerSource = centerSrc ? tile : null;
        const cenefaSource = cenefaEditedCanvas || cenefaImg;
        const cornerSource = esquinaEditedCanvas || esquinaImg || cenefaSource;

        const centerMap = [[0, Math.PI / 2], [3 * Math.PI / 2, Math.PI]];

        pctx.fillStyle = '#fff';
        pctx.fillRect(0, 0, w, h);

        if (centerSource) {
          for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
              drawTile(pctx, centerSource, r, c, tw, th, centerMap[r % 2][c % 2]);
            }
          }
        }

        for (let c = 1; c < cols - 1; c++) {
          drawTile(pctx, cenefaSource, 0, c, tw, th, 0);
          drawTile(pctx, cenefaSource, rows - 1, c, tw, th, Math.PI);
        }
        for (let r = 1; r < rows - 1; r++) {
          drawTile(pctx, cenefaSource, r, 0, tw, th, -Math.PI / 2);
          drawTile(pctx, cenefaSource, r, cols - 1, tw, th, Math.PI / 2);
        }

        drawTile(pctx, cornerSource, 0, 0, tw, th, 0);
        drawTile(pctx, cornerSource, 0, cols - 1, tw, th, Math.PI / 2);
        drawTile(pctx, cornerSource, rows - 1, cols - 1, tw, th, Math.PI);
        drawTile(pctx, cornerSource, rows - 1, 0, tw, th, -Math.PI / 2);

        return;
      }

      const cols = 12;
      const rows = 8;
      const tw = Math.floor(w / cols);
      const th = Math.floor(h / rows);

      if (category === 'cenefa') {
        pctx.fillStyle = '#fff';
        pctx.fillRect(0, 0, w, h);
        const borderSource = tile;
        for (let c = 0; c < cols; c++) {
          drawTile(pctx, borderSource, 0, c, tw, th, 0);
          drawTile(pctx, borderSource, rows - 1, c, tw, th, Math.PI);
        }
        for (let r = 1; r < rows - 1; r++) {
          drawTile(pctx, borderSource, r, 0, tw, th, -Math.PI / 2);
          drawTile(pctx, borderSource, r, cols - 1, tw, th, Math.PI / 2);
        }
        return;
      }

      if (category === 'esquina') {
        pctx.fillStyle = '#fff';
        pctx.fillRect(0, 0, w, h);
        drawTile(pctx, tile, 0, 0, tw, th, 0);
        drawTile(pctx, tile, 0, cols - 1, tw, th, Math.PI / 2);
        drawTile(pctx, tile, rows - 1, cols - 1, tw, th, Math.PI);
        drawTile(pctx, tile, rows - 1, 0, tw, th, -Math.PI / 2);
        return;
      }

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

    function clampNumber(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function floodFillAt(x, y, colorObj) {
      if (!sourceImageData || !currentImageData || !colorObj) return;
      const w = sourceImageData.width;
      const h = sourceImageData.height;
      const sx = Math.max(0, Math.min(w - 1, Math.floor(x)));
      const sy = Math.max(0, Math.min(h - 1, Math.floor(y)));
      const src = sourceImageData.data;
      const dst = currentImageData.data;
      const i0 = (sy * w + sx) * 4;
      const tr = src[i0], tg = src[i0 + 1], tb = src[i0 + 2], ta = src[i0 + 3];
      if (ta < 10) return;

      const next = hexToRgb(colorObj.hex);
      const fillOptions = window.CUSTOMIZER_FILL || {};
      const baseTolerance = Number(fillOptions.tolerance);
      const baseEdgeTolerance = Number(fillOptions.edgeTolerance);
      const baseLumaTolerance = Number(fillOptions.lumaTolerance);
      const baseChannelTolerance = Number(fillOptions.channelTolerance);
      const baseEdgeChannelTolerance = Number(fillOptions.edgeChannelTolerance);
      const baseMinAlpha = Number(fillOptions.minAlpha);
      const baseHomogeneityTolerance = Number(fillOptions.homogeneityTolerance);
      const baseMinSimilarNeighbors = Number(fillOptions.minSimilarNeighbors);
      const baseNeighborLumaTolerance = Number(fillOptions.neighborLumaTolerance);
      const useDiagonal = Boolean(fillOptions.useDiagonal);

      // Valores conservadores por defecto para evitar que zonas de tonos parecidos se mezclen.
      const tolerance = clampNumber(Number.isFinite(baseTolerance) ? baseTolerance : 48, 5, 160);
      const edgeTolerance = clampNumber(Number.isFinite(baseEdgeTolerance) ? baseEdgeTolerance : 16, 2, 120);
      const lumaTolerance = clampNumber(Number.isFinite(baseLumaTolerance) ? baseLumaTolerance : 12, 2, 100);
      const channelTolerance = clampNumber(Number.isFinite(baseChannelTolerance) ? baseChannelTolerance : 20, 2, 120);
      const edgeChannelTolerance = clampNumber(Number.isFinite(baseEdgeChannelTolerance) ? baseEdgeChannelTolerance : 10, 2, 80);
      const minAlpha = clampNumber(Number.isFinite(baseMinAlpha) ? baseMinAlpha : 250, 0, 255);
      const homogeneityTolerance = clampNumber(Number.isFinite(baseHomogeneityTolerance) ? baseHomogeneityTolerance : 14, 2, 80);
      const minSimilarNeighbors = Math.round(clampNumber(Number.isFinite(baseMinSimilarNeighbors) ? baseMinSimilarNeighbors : 3, 0, 4));
      const neighborLumaTolerance = clampNumber(Number.isFinite(baseNeighborLumaTolerance) ? baseNeighborLumaTolerance : 8, 1, 60);

      const toleranceSq = tolerance * tolerance;
      const edgeToleranceSq = edgeTolerance * edgeTolerance;
      const seedLuma = 0.2126 * tr + 0.7152 * tg + 0.0722 * tb;

      function isHomogeneousSeedNeighborhood(px, py) {
        if (minSimilarNeighbors <= 0) return true;
        let similar = 0;
        function check(nx, ny) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
          const ni = (ny * w + nx) * 4;
          if (src[ni + 3] < minAlpha) return;
          const cdr = Math.abs(src[ni] - tr);
          const cdg = Math.abs(src[ni + 1] - tg);
          const cdb = Math.abs(src[ni + 2] - tb);
          if (Math.max(cdr, cdg, cdb) <= homogeneityTolerance) similar += 1;
        }
        check(px - 1, py);
        check(px + 1, py);
        check(px, py - 1);
        check(px, py + 1);
        return similar >= minSimilarNeighbors;
      }

      visitToken += 1;
      if (visitToken > 0xffffff00) {
        visited.fill(0);
        visitToken = 1;
      }

      let head = 0;
      let tail = 0;
      const startP = sy * w + sx;
      visited[startP] = visitToken;
      queueX[tail] = sx;
      queueY[tail] = sy;
      tail += 1;

      while (head < tail) {
        const cx = queueX[head];
        const cy = queueY[head];
        head += 1;
        const p = cy * w + cx;

        const i = p * 4;
        const da = src[i + 3];
        if (da < minAlpha) continue;

        const dr = src[i] - tr;
        const dg = src[i + 1] - tg;
        const db = src[i + 2] - tb;
        const diffSq = dr * dr + dg * dg + db * db;
        if (diffSq > toleranceSq) continue;
        if (Math.max(Math.abs(dr), Math.abs(dg), Math.abs(db)) > channelTolerance) continue;
        const luma = 0.2126 * src[i] + 0.7152 * src[i + 1] + 0.0722 * src[i + 2];
        if (Math.abs(luma - seedLuma) > lumaTolerance) continue;
        if (!isHomogeneousSeedNeighborhood(cx, cy)) continue;

        dst[i] = next.r;
        dst[i + 1] = next.g;
        dst[i + 2] = next.b;
        dst[i + 3] = da;

        function push(nx, ny) {
          const np = ny * w + nx;
          if (visited[np] === visitToken) return;
          const ni = np * 4;
          if (src[ni + 3] < minAlpha) return;
          const ndr = src[ni] - tr;
          const ndg = src[ni + 1] - tg;
          const ndb = src[ni + 2] - tb;
          const ndiffSq = ndr * ndr + ndg * ndg + ndb * ndb;
          if (ndiffSq > toleranceSq) return;
          if (Math.max(Math.abs(ndr), Math.abs(ndg), Math.abs(ndb)) > channelTolerance) return;
          const nluma = 0.2126 * src[ni] + 0.7152 * src[ni + 1] + 0.0722 * src[ni + 2];
          if (Math.abs(nluma - seedLuma) > lumaTolerance) return;
          if (!isHomogeneousSeedNeighborhood(nx, ny)) return;

          const edr = src[ni] - src[i];
          const edg = src[ni + 1] - src[i + 1];
          const edb = src[ni + 2] - src[i + 2];
          const edgeDiffSq = edr * edr + edg * edg + edb * edb;
          if (edgeDiffSq > edgeToleranceSq) return;
          if (Math.max(Math.abs(edr), Math.abs(edg), Math.abs(edb)) > edgeChannelTolerance) return;
          const lumaCurrent = 0.2126 * src[i] + 0.7152 * src[i + 1] + 0.0722 * src[i + 2];
          if (Math.abs(nluma - lumaCurrent) > neighborLumaTolerance) return;
          visited[np] = visitToken;
          queueX[tail] = nx;
          queueY[tail] = ny;
          tail += 1;
        }

        if (cx > 0) push(cx - 1, cy);
        if (cx < w - 1) push(cx + 1, cy);
        if (cy > 0) push(cx, cy - 1);
        if (cy < h - 1) push(cx, cy + 1);
        if (useDiagonal) {
          if (cx > 0 && cy > 0) push(cx - 1, cy - 1);
          if (cx < w - 1 && cy > 0) push(cx + 1, cy - 1);
          if (cx > 0 && cy < h - 1) push(cx - 1, cy + 1);
          if (cx < w - 1 && cy < h - 1) push(cx + 1, cy + 1);
        }
      }

      renderEdit();
      drawPattern();
      updateHistoryButtons();
      updateHistoryButtons();
    }

    editCanvas.addEventListener('click', (ev) => {
      const rect = editCanvas.getBoundingClientRect();
      const x = (ev.clientX - rect.left) * (editCanvas.width / rect.width);
      const y = (ev.clientY - rect.top) * (editCanvas.height / rect.height);
      if (currentImageData) pushHistory();
      floodFillAt(x, y, selected);
      updateHistoryButtons();
    });

    colors.forEach((c, idx) => {
      const b = document.createElement('button');
      b.className = `sw${idx === 0 ? ' active' : ''}`;
      b.type = 'button';
      b.style.background = c.hex;
      b.title = `${c.id} · ${c.name}`;
      b.setAttribute('aria-label', `${c.id} ${c.name}`);
      b.innerHTML = `<span>${c.id}</span>`;
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
        currentImageData = cloneImageData(sourceImageData);
        if (cenefaEditor && cenefaEditor.source) {
          cenefaEditor.current = cloneImageData(cenefaEditor.source);
          cenefaEditor.ctx.putImageData(cenefaEditor.current, 0, 0);
          cenefaEditedCanvas = null;
        }
        if (esquinaEditor && esquinaEditor.source) {
          esquinaEditor.current = cloneImageData(esquinaEditor.source);
          esquinaEditor.ctx.putImageData(esquinaEditor.current, 0, 0);
          esquinaEditedCanvas = null;
        }
        undoStack.length = 0;
        redoStack.length = 0;
        renderEdit();
        drawPattern();
        updateHistoryButtons();
      });
    }

    const undoBtn = q('undoColor');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        if (!undoStack.length) return;
        redoStack.push(snapshotState());
        applySnapshot(undoStack.pop());
      });
    }

    const redoBtn = q('redoColor');
    if (redoBtn) {
      redoBtn.addEventListener('click', () => {
        if (!redoStack.length) return;
        undoStack.push(snapshotState());
        applySnapshot(redoStack.pop());
      });
    }

    const dl = q('download');
    if (dl) {
      dl.addEventListener('click', async () => {
        const tpl = getPdfTemplate();
        const reportCanvas = document.createElement('canvas');
        reportCanvas.width = tpl.page.canvasWidth;
        reportCanvas.height = tpl.page.canvasHeight;
        const rctx = reportCanvas.getContext('2d');

        rctx.fillStyle = '#ffffff';
        rctx.fillRect(0, 0, reportCanvas.width, reportCanvas.height);

        if (tpl.logo && tpl.logo.src) {
          const logo = new Image();
          logo.src = tpl.logo.src;
          try {
            if (logo.decode) await logo.decode();
            else await new Promise((resolve, reject) => { logo.onload = resolve; logo.onerror = reject; });
            rctx.drawImage(logo, tpl.logo.x, tpl.logo.y, tpl.logo.width, tpl.logo.height);
          } catch (e) {
            // Si falla el logo, se genera PDF sin logo
          }
        }

        rctx.fillStyle = '#111';
        rctx.font = '700 42px Arial';
        rctx.fillText(tpl.title.text, tpl.title.x, tpl.title.y);
        rctx.font = '24px Arial';
        rctx.fillStyle = '#333';
        rctx.fillText(modelName, tpl.model.x, tpl.model.y);
        rctx.fillText(tpl.contact.text, tpl.contact.x, tpl.contact.y);

        rctx.strokeStyle = '#bbb';
        rctx.strokeRect(tpl.pattern.x, tpl.pattern.y, tpl.pattern.width, tpl.pattern.height);
        rctx.drawImage(patternCanvas, tpl.pattern.x, tpl.pattern.y, tpl.pattern.width, tpl.pattern.height);

        rctx.fillStyle = '#111';
        rctx.font = '700 28px Arial';
        rctx.fillText(tpl.colorsTitle.text, tpl.colorsTitle.x, tpl.colorsTitle.y);

        const selectedIds = getUsedColorIdsFromDiff();
        const hasChanges = selectedIds.length > 0;
        const byId = new Map(colors.map((c) => [c.id, c]));

        rctx.font = '20px Arial';
        selectedIds.forEach((id, idx) => {
          const item = byId.get(id);
          if (!item) return;
          const col = idx % tpl.colors.columns;
          const row = Math.floor(idx / tpl.colors.columns);
          const x = tpl.colors.startX + col * tpl.colors.colGap;
          const y = tpl.colors.startY + row * tpl.colors.rowGap;
          rctx.fillStyle = item.hex;
          rctx.fillRect(x, y - 16, 28, 28);
          rctx.strokeStyle = '#333';
          rctx.strokeRect(x, y - 16, 28, 28);
          rctx.fillStyle = '#222';
          rctx.fillText(`${item.id} · ${item.name} (${item.hex})`, x + 40, y + 4);
        });

        const jpg = reportCanvas.toDataURL('image/jpeg', 0.92);
        const blob = buildPdfFromJpeg(jpg, tpl.page.widthPt, tpl.page.heightPt, reportCanvas.width, reportCanvas.height);
        const safeName = modelName.replace(/[^a-z0-9\-_]+/gi, '_').replace(/^_+|_+$/g, '') || 'modelo';
        const fileName = hasChanges ? `${safeName}_personalizado.pdf` : `${safeName}.pdf`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      });
    }

    function loadImageSafe(imageSrc) {
      return new Promise((resolve) => {
        if (!imageSrc) return resolve(null);
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = imageSrc;
      });
    }


    function renderStaticSquare(containerId, imageSrc, type) {
      const host = q(containerId);
      if (!host) return;
      host.innerHTML = '';
      if (!imageSrc) {
        host.innerHTML = '<p class="empty-msg" style="font-size:11px">Sin imagen</p>';
        return;
      }
      const c = document.createElement('canvas');
      c.className = 'vector-canvas';
      c.width = 300;
      c.height = 300;
      host.appendChild(c);
      const cx = c.getContext('2d');

      let sourceData = null;
      let currentData = null;

      function renderSquare() {
        if (!currentData) return;
        cx.putImageData(currentData, 0, 0);
        if (type === 'cenefa' && cenefaEditor) cenefaEditor.current = cloneImageData(currentData);
        if (type === 'esquina' && esquinaEditor) esquinaEditor.current = cloneImageData(currentData);
      }

      function floodFillSquare(x, y) {
        if (!selected || !sourceData || !currentData) return;
        pushHistory();
        const w = sourceData.width;
        const h = sourceData.height;
        const sx = Math.max(0, Math.min(w - 1, Math.floor(x)));
        const sy = Math.max(0, Math.min(h - 1, Math.floor(y)));
        const src = sourceData.data;
        const dst = currentData.data;
        const i0 = (sy * w + sx) * 4;
        const tr = src[i0], tg = src[i0 + 1], tb = src[i0 + 2], ta = src[i0 + 3];
        if (ta < 10) return;
        const next = hexToRgb(selected.hex);
        const tolerance = 48;
        const toleranceSq = tolerance * tolerance;

        const visited = new Uint8Array(w * h);
        const qx = new Int32Array(w * h);
        const qy = new Int32Array(w * h);
        let head = 0;
        let tail = 0;
        const seed = sy * w + sx;
        visited[seed] = 1;
        qx[tail] = sx;
        qy[tail] = sy;
        tail += 1;

        while (head < tail) {
          const cxp = qx[head];
          const cyp = qy[head];
          head += 1;
          const p = cyp * w + cxp;
          const i = p * 4;
          const da = src[i + 3];
          if (da < 10) continue;
          const dr = src[i] - tr;
          const dg = src[i + 1] - tg;
          const db = src[i + 2] - tb;
          if ((dr * dr + dg * dg + db * db) > toleranceSq) continue;

          dst[i] = next.r;
          dst[i + 1] = next.g;
          dst[i + 2] = next.b;
          dst[i + 3] = da;

          const neighbors = [[1,0],[-1,0],[0,1],[0,-1]];
          for (const [dx, dy] of neighbors) {
            const nx = cxp + dx;
            const ny = cyp + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const np = ny * w + nx;
            if (visited[np]) continue;
            visited[np] = 1;
            qx[tail] = nx;
            qy[tail] = ny;
            tail += 1;
          }
        }
        renderSquare();

        const syncCanvas = document.createElement('canvas');
        syncCanvas.width = 300;
        syncCanvas.height = 300;
        const sctx2 = syncCanvas.getContext('2d');
        sctx2.putImageData(currentData, 0, 0);
        if (type === 'cenefa') { cenefaEditedCanvas = syncCanvas; }
        if (type === 'esquina') { esquinaEditedCanvas = syncCanvas; }
        drawPattern();
      }

      loadImageSafe(imageSrc).then((img) => {
        if (!img) return;
        drawImageCover(cx, img, 300, 300);
        sourceData = cx.getImageData(0, 0, 300, 300);
        currentData = new ImageData(new Uint8ClampedArray(sourceData.data), sourceData.width, sourceData.height);
        if (type === 'cenefa') cenefaEditor = { canvas: c, ctx: cx, source: cloneImageData(sourceData), current: cloneImageData(currentData) };
        if (type === 'esquina') esquinaEditor = { canvas: c, ctx: cx, source: cloneImageData(sourceData), current: cloneImageData(currentData) };
        renderSquare();
        c.addEventListener('click', (ev) => {
          const rect = c.getBoundingClientRect();
          const x = ((ev.clientX - rect.left) / rect.width) * c.width;
          const y = ((ev.clientY - rect.top) / rect.height) * c.height;
          floodFillSquare(x, y);
        });
      });
    }

    Promise.all([loadImageSafe(centerSrc), loadImageSafe(cenefaSrc), loadImageSafe(esquinaSrc)]).then((loaded) => {
      [centerImg, cenefaImg, esquinaImg] = loaded;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        drawImageCover(sctx, img, 600, 600);
        sourceImageData = sctx.getImageData(0, 0, 600, 600);
        currentImageData = new ImageData(new Uint8ClampedArray(sourceImageData.data), sourceImageData.width, sourceImageData.height);
        renderEdit();
        drawPattern();
        updateHistoryButtons();
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
        updateHistoryButtons();
      };
      if (src) img.src = src;
      else {
        sctx.fillStyle = '#fff';
        sctx.fillRect(0, 0, 600, 600);
        sourceImageData = sctx.getImageData(0, 0, 600, 600);
        currentImageData = new ImageData(new Uint8ClampedArray(sourceImageData.data), sourceImageData.width, sourceImageData.height);
        renderEdit();
        drawPattern();
        updateHistoryButtons();
      }
      renderStaticSquare('extraCenefaPreview', cenefaSrc, 'cenefa');
      renderStaticSquare('extraCornerPreview', esquinaSrc, 'esquina');
    });
  }

  function initDecoratedOverlay() {
    const overlay = q('modelOverlay');
    const patternCanvas = q('modelOverlayPattern');
    const nameEl = q('modelOverlayName');
    if (!overlay || !patternCanvas || !nameEl) return;

    const pctx = patternCanvas.getContext('2d');
    let closeTimer = null;

    function drawRotatedPattern(img) {
      if (!img || !pctx) return;
      const w = patternCanvas.width;
      const h = patternCanvas.height;
      pctx.clearRect(0, 0, w, h);

      const cols = 8;
      const rows = 6;
      const tileW = w / cols;
      const tileH = h / rows;

      const tileSource = document.createElement('canvas');
      tileSource.width = 512;
      tileSource.height = 512;
      const tsctx = tileSource.getContext('2d');
      const sw = img.naturalWidth || img.width;
      const sh = img.naturalHeight || img.height;
      const scale = Math.max(tileSource.width / sw, tileSource.height / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = (tileSource.width - dw) / 2;
      const dy = (tileSource.height - dh) / 2;
      tsctx.clearRect(0, 0, tileSource.width, tileSource.height);
      tsctx.drawImage(img, dx, dy, dw, dh);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const map = [[0, Math.PI / 2], [3 * Math.PI / 2, Math.PI]];
          const angle = map[y % 2][x % 2];
          pctx.save();
          pctx.translate(x * tileW + tileW / 2, y * tileH + tileH / 2);
          pctx.rotate(angle);
          pctx.drawImage(tileSource, -tileW / 2, -tileH / 2, tileW, tileH);
          pctx.restore();
        }
      }
    }

    function drawBorderPattern(cenefaImg, esquinaImg) {
      if (!pctx) return;
      const w = patternCanvas.width;
      const h = patternCanvas.height;
      pctx.clearRect(0, 0, w, h);
      pctx.fillStyle = '#fff';
      pctx.fillRect(0, 0, w, h);

      const cols = 8;
      const rows = 6;
      const tw = w / cols;
      const th = h / rows;

      function d(source, r, c, angle) {
        if (!source) return;
        pctx.save();
        pctx.translate(c * tw + tw / 2, r * th + th / 2);
        pctx.rotate(angle || 0);
        pctx.drawImage(source, -tw / 2, -th / 2, tw, th);
        pctx.restore();
      }

      for (let c = 1; c < cols - 1; c++) {
        d(cenefaImg, 0, c, 0);
        d(cenefaImg, rows - 1, c, Math.PI);
      }
      for (let r = 1; r < rows - 1; r++) {
        d(cenefaImg, r, 0, -Math.PI / 2);
        d(cenefaImg, r, cols - 1, Math.PI / 2);
      }

      d(esquinaImg || cenefaImg, 0, 0, 0);
      d(esquinaImg || cenefaImg, 0, cols - 1, Math.PI / 2);
      d(esquinaImg || cenefaImg, rows - 1, cols - 1, Math.PI);
      d(esquinaImg || cenefaImg, rows - 1, 0, -Math.PI / 2);
    }

    function loadImageSafeOverlay(src) {
      return new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    }

    const open = async (src, modelName, category, cenefaSrc, esquinaSrc) => {
      clearTimeout(closeTimer);
      if (category === 'cenefa' || category === 'esquina') {
        const [cenefaImg, esquinaImg] = await Promise.all([
          loadImageSafeOverlay(cenefaSrc || (category === 'cenefa' ? src : '')),
          loadImageSafeOverlay(esquinaSrc || (category === 'esquina' ? src : '')),
        ]);
        drawBorderPattern(cenefaImg, esquinaImg);
      } else {
        const img = await loadImageSafeOverlay(src);
        if (img) drawRotatedPattern(img);
      }

      nameEl.textContent = `MODELO: ${(modelName || 'Modelo').toUpperCase()}`;
      overlay.classList.remove('closing');
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      overlay.classList.remove('open');
      overlay.classList.add('closing');
      closeTimer = setTimeout(() => {
        overlay.classList.remove('closing');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }, 280);
    };

    document.querySelectorAll('.mosaic-preview-trigger').forEach((img) => {
      img.addEventListener('click', () => open(
        img.getAttribute('src') || '',
        img.dataset.modelName || img.alt || 'Modelo',
        (img.dataset.category || '').toLowerCase(),
        img.dataset.cenefaSrc || '',
        img.dataset.esquinaSrc || '',
      ));
    });

    overlay.addEventListener('click', (e) => {
      if (e.target.closest('[data-overlay-close="true"]')) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
  }

  function initDarkFooter() {
    const main = document.querySelector('main.site');
    if (!main || document.getElementById('siteDarkFooter')) return;

    const lang = getLang();
    const legalUrl = `legal.html?lang=${lang}`;
    const mapUrl = `sitemap.html?lang=${lang}`;

    const html = lang === 'en'
      ? `<footer id="siteDarkFooter" class="dark-footer"><div class="dark-cols"><div><h4>Mosaicos Dzununcán</h4><p>Mexican cement tile manufacturer with custom projects.</p><p><a href="${legalUrl}#privacy">Privacy Policy</a><br><a href="${legalUrl}#terms">Terms and Conditions</a><br><a href="${mapUrl}">Site map</a></p></div><div><h4>Phones</h4><p>Local: +52 (999) 217-9326</p><p>Factory: +52 (999) 249-5158</p><p>Email: ventas@mosaicosdzununcan.com</p></div><div><h4>Address</h4><p>Sales & Showroom:<br/>Calle 37, No. 318 entre 24 y 26, Mérida, Yucatán.</p><p>Factory:<br/>Carretera Mérida - Dzununcan Km 2.5</p></div><div><h4>Social</h4><p><a target="_blank" rel="noopener" href="https://www.facebook.com/">Facebook</a><br><a target="_blank" rel="noopener" href="https://www.instagram.com/">Instagram</a><br><a target="_blank" rel="noopener" href="https://wa.me/529994069083">WhatsApp</a></p></div></div></footer>`
      : `<footer id="siteDarkFooter" class="dark-footer"><div class="dark-cols"><div><h4>Mosaicos Dzununcán</h4><p>Fabricantes de mosaicos de pasta mexicanos con proyectos personalizados.</p><p><a href="${legalUrl}#privacy">Políticas de privacidad</a><br><a href="${legalUrl}#terms">Términos y condiciones</a><br><a href="${mapUrl}">Mapa del sitio</a></p></div><div><h4>Teléfonos</h4><p>Local: +52 (999) 217-9326</p><p>Fábrica: +52 (999) 249-5158</p><p>Email: ventas@mosaicosdzununcan.com</p></div><div><h4>Dirección</h4><p>Venta y sala de exhibición:<br/>Calle 37, No. 318 entre 24 y 26, Mérida, Yucatán.</p><p>Fábrica:<br/>Carretera Mérida - Dzununcan Km 2.5</p></div><div><h4>Redes</h4><p><a target="_blank" rel="noopener" href="https://www.facebook.com/">Facebook</a><br><a target="_blank" rel="noopener" href="https://www.instagram.com/">Instagram</a><br><a target="_blank" rel="noopener" href="https://wa.me/529994069083">WhatsApp</a></p></div></div></footer>`;
    main.insertAdjacentHTML('beforeend', html);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHome();
    initCategories();
    initCustomizer();
    initDecoratedOverlay();
    initDarkFooter();
  });
})();
