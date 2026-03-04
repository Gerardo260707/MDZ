(function () {
  function q(id) { return document.getElementById(id); }

  function getLang() {
    return window.siteI18n ? window.siteI18n.getLang() : 'es';
  }

  function normalizeAssetSrc(rawSrc) {
    let src = String(rawSrc || '').trim();
    if (!src) return '';
    src = src.replace(/&amp;/g, '&').replace(/\+/g, '%20');
    for (let i = 0; i < 2; i++) {
      if (!/%[0-9a-f]{2}/i.test(src)) break;
      try {
        const decoded = decodeURIComponent(src);
        if (!decoded || decoded === src) break;
        src = decoded;
      } catch (_) {
        break;
      }
    }
    return src.replace(/\\/g, '/');
  }



  const CUSTOMIZER_DRAFTS_KEY = 'mdz_customizer_layer_drafts_v1';

  function baseSrcKey(rawSrc) {
    const normalized = normalizeAssetSrc(rawSrc || '');
    return normalized.split('?')[0] || normalized;
  }

  function readCustomizerDrafts() {
    try {
      const raw = window.sessionStorage.getItem(CUSTOMIZER_DRAFTS_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeCustomizerDrafts(drafts) {
    try {
      const entries = Object.entries(drafts || {});
      const trimmed = entries.slice(Math.max(0, entries.length - 24));
      window.sessionStorage.setItem(CUSTOMIZER_DRAFTS_KEY, JSON.stringify(Object.fromEntries(trimmed)));
    } catch (_) {
      // ignore storage quota or availability issues
    }
  }

  function buildImageCandidates(rawSrc) {
    const raw = String(rawSrc || '').trim();
    const base = normalizeAssetSrc(raw);
    if (!raw && !base) return [];
    const out = [];
    const push = (v) => { if (v && !out.includes(v)) out.push(v); };

    // Priorizar la ruta original por si ya viene válida desde servidor.
    push(raw.replace(/&amp;/g, '&'));
    push(base);

    const variants = [base];
    if (raw) variants.push(raw.replace(/&amp;/g, '&').replace(/\+/g, '%20'));

    variants.forEach((candidate) => {
      if (!candidate) return;
      const parts = candidate.split('?');
      const pathPart = parts[0] || '';
      const queryPart = parts.length > 1 ? ('?' + parts.slice(1).join('?')) : '';
      if (!pathPart) return;
      push(pathPart + queryPart);
      push(encodeURI(pathPart) + queryPart);
      push(pathPart.replace(/ /g, '%20') + queryPart);
    });

    return out;
  }

  function loadImageWithFallback(rawSrc, { cacheBust = false } = {}) {
    return new Promise((resolve) => {
      const candidates = buildImageCandidates(rawSrc);
      if (!candidates.length) return resolve(null);
      const next = (idx) => {
        if (idx >= candidates.length) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => next(idx + 1);
        const src = candidates[idx];
        if (cacheBust) {
          const cleaned = src.replace(/([?&])ov=[^&#]*(&?)/, (m, p1, p2) => (p1 === '?' && p2 ? '?' : (p2 ? p1 : ''))).replace(/[?&]$/, '');
          const sep = cleaned.includes('?') ? '&' : '?';
          img.src = `${cleaned}${sep}ov=${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        } else {
          img.src = src;
        }
      };
      next(0);
    });
  }

  function tByLang(lang, es, en) {
    return lang === 'en' ? en : es;
  }

  function resolveLangSlideValue(slide, key, lang) {
    if (!slide || typeof slide !== 'object') return '';
    const langKey = `${key}_${lang}`;
    const altLangKey = `${key}_${lang === 'en' ? 'es' : 'en'}`;
    const direct = slide[key];
    const langVal = slide[langKey];
    const altVal = slide[altLangKey];

    if (typeof langVal === 'string' && langVal.trim()) return langVal;
    if (direct && typeof direct === 'object') {
      const fromObj = direct[lang] || direct[lang.toUpperCase()] || direct[lang === 'en' ? 'ing' : 'esp'];
      if (typeof fromObj === 'string' && fromObj.trim()) return fromObj;
    }
    if (typeof direct === 'string' && direct.trim()) return direct;
    if (typeof altVal === 'string' && altVal.trim()) return altVal;
    if (direct && typeof direct === 'object') {
      const fallbackObj = direct[lang === 'en' ? 'es' : 'en'] || direct.ES || direct.EN;
      if (typeof fallbackObj === 'string' && fallbackObj.trim()) return fallbackObj;
    }
    return '';
  }

  function initHome() {
    const slidesContainer = q('slides');
    const dotsContainer = q('dots');
    const cardsContainer = q('featureCards');
    const hero = document.querySelector('.hero');
    if (!slidesContainer || !dotsContainer || !cardsContainer || !hero) return;

    const fallbackSlides = [
      {
        title_es: '¡50% DE DESCUENTO!',
        subtitle_es: 'EN PISOS DECORADOS 20x20 COLLAGE',
        title_en: '50% OFF!',
        subtitle_en: 'ON 20x20 DECORATED FLOOR TILES COLLAGE',
        background: 'repeating-linear-gradient(45deg,#5e7f99 0 32px,#e5dcc1 32px 64px,#8f2a2a 64px 96px,#f4f4f0 96px 128px,#2b8481 128px 160px,#be7a5c 160px 192px)'
      },
      {
        title_es: 'ENVÍOS A TODO MÉXICO',
        subtitle_es: 'COMPRA DESDE CUALQUIER ESTADO',
        title_en: 'NATIONWIDE SHIPPING',
        subtitle_en: 'ORDER FROM ANY STATE',
        background: 'repeating-linear-gradient(135deg,#295e85 0 26px,#f0deb9 26px 52px,#943636 52px 78px,#f8f7f2 78px 104px,#488780 104px 130px,#d27f5f 130px 156px)'
      },
      {
        title_es: 'NUEVOS DISEÑOS',
        subtitle_es: 'COLECCIONES PERSONALIZADAS',
        title_en: 'NEW DESIGNS',
        subtitle_en: 'CUSTOM COLLECTIONS',
        background: 'repeating-linear-gradient(25deg,#33608f 0 25px,#ebdbb8 25px 50px,#7d1f1f 50px 75px,#f4f2e9 75px 100px,#3c8f88 100px 125px,#ca8867 125px 150px)'
      }
    ];
    const dynamicSlides = Array.isArray(window.HOME_CAROUSEL_ASSETS) ? window.HOME_CAROUSEL_ASSETS : [];
    const manualSlides = Array.isArray(window.HOME_CAROUSEL) ? window.HOME_CAROUSEL : [];
    const RAW_SLIDES = dynamicSlides.length ? dynamicSlides : (manualSlides.length ? manualSlides : fallbackSlides);

    const lang = getLang();
    const CAROUSEL_SLIDES = RAW_SLIDES.map((slide) => {
      if (typeof slide === 'string') return { image: slide, title: '', subtitle: '' };
      if (!slide || typeof slide !== 'object') return { image: '', title: '', subtitle: '' };
      return {
        ...slide,
        image: resolveLangSlideValue(slide, 'image', lang),
        title: resolveLangSlideValue(slide, 'title', lang),
        subtitle: resolveLangSlideValue(slide, 'subtitle', lang)
      };
    });

    const FEATURE_CARDS = [
      {
        file: '',
        label: tByLang(lang, 'Mosaicos', 'Tiles'),
        href: 'mosaicos.html',
        button: tByLang(lang, 'Ver modelos » clic aquí', 'View designs » click here'),
        description: tByLang(lang, 'Ladrillos estampados y modelos especiales.', 'Stamped tiles and special models.')
      },
      {
        file: '',
        label: tByLang(lang, 'Tapetes', 'Rugs'),
        href: 'tapetes.php',
        button: tByLang(lang, 'Personalizar', 'Customize'),
        description: tByLang(lang, 'Diversos diseños para pisos y muros.', 'Diverse designs for floors and walls.')
      },
      {
        file: '',
        label: tByLang(lang, 'Colores', 'Colors'),
        href: 'colores.php',
        button: tByLang(lang, 'Ver colores', 'View colors'),
        description: tByLang(lang, 'Conozca nuestra gama de colores y ladrillos lisos.', 'Discover our full color palette and solid tiles.')
      }
    ];

    FEATURE_CARDS.forEach((card, idx) => {
      const a = document.createElement('a');
      a.className = 'tile-card';
      const cardUrl = new URL(card.href, window.location.href);
      cardUrl.searchParams.set('lang', lang);
      a.href = cardUrl.pathname + cardUrl.search + cardUrl.hash;
      const imgSrc = (Array.isArray(window.HOME_FEATURE_IMAGES) && window.HOME_FEATURE_IMAGES[idx]) ? window.HOME_FEATURE_IMAGES[idx] : (card.file ? `assets/cuadros/${card.file}` : 'assets/placeholder-tile.svg');
      a.innerHTML = `<img src="${imgSrc}" alt="${card.label}" onerror="this.src='assets/placeholder-tile.svg'" /><span class="tile-card-title">${card.label}</span><small class="tile-card-description">${card.description}</small>`;
      cardsContainer.appendChild(a);
    });

    let activeIndex = 0;
    let autoAdvanceTimer = 0;

    const slideEls = CAROUSEL_SLIDES.map((slide, index) => {
      const article = document.createElement('article');
      article.className = `slide ${index === 0 ? 'active' : ''}`;
      article.dataset.index = String(index);
      const hasPromoText = String(slide.title || '').trim() || String(slide.subtitle || '').trim();
      if (slide.image) {
        const promoMarkup = hasPromoText ? `<div class="promo"><strong>${slide.title || ''}</strong><span>${slide.subtitle || ''}</span></div>` : '';
        article.innerHTML = `<img class="slide-media" src="${slide.image}" alt="${slide.title || (lang === 'en' ? 'Promotion' : 'Promoción')}" loading="lazy" />${promoMarkup}`;
      } else {
        article.style.setProperty('--slide-bg', slide.background);
        article.innerHTML = `<div class="promo"><strong>${slide.title || ''}</strong><span>${slide.subtitle || ''}</span></div>`;
      }
      slidesContainer.appendChild(article);

      const dot = document.createElement('button');
      dot.className = index === 0 ? 'active' : '';
      dot.setAttribute('aria-label', lang === 'en' ? `Go to slide ${index + 1}` : `Ir a la imagen ${index + 1}`);
      dot.addEventListener('click', () => showSlide(index));
      dotsContainer.appendChild(dot);
      return article;
    });

    const dotEls = [...dotsContainer.children];

    function updateHeroHeight() {
      const activeSlide = slideEls[activeIndex];
      if (!activeSlide) return;
      const activeImage = activeSlide.querySelector('.slide-media');
      const containerWidth = hero.clientWidth || slidesContainer.clientWidth || 1;
      const vhCap = window.innerHeight ? (window.innerHeight * (window.innerWidth <= 700 ? 0.55 : 0.68)) : 560;
      const minH = window.innerWidth <= 700 ? 170 : 240;
      let targetHeight = Math.max(minH, Math.min(vhCap, containerWidth * (7 / 16)));

      if (activeImage && activeImage.naturalWidth > 0 && activeImage.naturalHeight > 0) {
        const ratio = activeImage.naturalWidth / activeImage.naturalHeight;
        const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : (16 / 7);
        targetHeight = Math.max(minH, Math.min(vhCap, containerWidth / safeRatio));
      }
      hero.style.height = `${Math.round(targetHeight)}px`;
    }

    function showSlide(index) {
      if (!slideEls.length) return;
      activeIndex = (index + slideEls.length) % slideEls.length;
      slideEls.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
      dotEls.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
      updateHeroHeight();
    }

    function restartAutoAdvance() {
      if (!slideEls.length || slideEls.length === 1) return;
      if (autoAdvanceTimer) clearInterval(autoAdvanceTimer);
      autoAdvanceTimer = setInterval(() => showSlide(activeIndex + 1), 4500);
    }

    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 36;

    slidesContainer.addEventListener('touchstart', (event) => {
      const point = event.changedTouches && event.changedTouches[0];
      if (!point) return;
      touchStartX = point.clientX;
      touchStartY = point.clientY;
    }, { passive: true });

    slidesContainer.addEventListener('touchend', (event) => {
      const point = event.changedTouches && event.changedTouches[0];
      if (!point) return;
      const deltaX = point.clientX - touchStartX;
      const deltaY = point.clientY - touchStartY;
      if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
        restartAutoAdvance();
      }
    }, { passive: true });

    CAROUSEL_SLIDES.forEach((slide, i) => {
      if (!slide || !slide.image) return;
      const img = slideEls[i] && slideEls[i].querySelector('.slide-media');
      if (!img) return;
      if (img.complete) {
        if (i === 0) updateHeroHeight();
      } else {
        img.addEventListener('load', () => {
          if (i === activeIndex) updateHeroHeight();
        });
      }
    });

    window.addEventListener('resize', updateHeroHeight);
    showSlide(0);
    restartAutoAdvance();
  }

  function initColorsPage() {
    const grid = q('colorsGrid');
    if (!grid) return;
    const colors = getCustomizerPalette();
    grid.innerHTML = '';
    colors.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'color-card';
      card.innerHTML = `<div class="swatch" style="background:${c.hex}"></div><strong>${c.name || c.id}</strong><span>${c.id} · ${c.hex}</span>`;
      grid.appendChild(card);
    });

    const toggleBtn = q('toggleColorComparator');
    const comparator = q('colorComparator');
    const leftCanvas = q('compareCanvasLeft');
    const rightCanvas = q('compareCanvasRight');
    const patternCanvas = q('compareCanvasPattern');
    const leftLabel = q('compareLabelLeft');
    const rightLabel = q('compareLabelRight');
    const sharedPalette = q('comparePaletteShared');
    const compareUndoBtn = q('compareUndo');
    const compareRedoBtn = q('compareRedo');
    const compareHomeBtn = q('compareHome');
    if (!toggleBtn || !comparator || !leftCanvas || !rightCanvas || !patternCanvas || !leftLabel || !rightLabel || !sharedPalette || !compareUndoBtn || !compareRedoBtn || !compareHomeBtn || !colors.length) return;

    const lang = getLang();
    // Siempre iniciar oculto; solo mostrar al presionar el botón.
    comparator.setAttribute('hidden', 'hidden');
    toggleBtn.textContent = lang === 'en' ? 'Compare colors' : 'Comparar colores';

    let selectedColor = colors[0] || { id: 'X', hex: '#000000', name: 'X' };
    let leftColor = '#FFFFFF';
    let rightColor = '#FFFFFF';
    let leftColorName = lang === 'en' ? 'Color 1' : 'Color 1';
    let rightColorName = lang === 'en' ? 'Color 2' : 'Color 2';

    const compareHistory = [];
    const compareFuture = [];

    function snapshotCompareState() {
      return { leftColor, rightColor, leftColorName, rightColorName };
    }

    function applyCompareState(state) {
      if (!state) return;
      leftColor = state.leftColor;
      rightColor = state.rightColor;
      leftColorName = state.leftColorName;
      rightColorName = state.rightColorName;
      updateCompareLabels();
      paintSolid(leftCanvas, leftColor);
      paintSolid(rightCanvas, rightColor);
      paintPattern();
      compareUndoBtn.disabled = compareHistory.length === 0;
      compareRedoBtn.disabled = compareFuture.length === 0;
    }

    function pushCompareState() {
      compareHistory.push(snapshotCompareState());
      if (compareHistory.length > 80) compareHistory.shift();
      compareFuture.length = 0;
      compareUndoBtn.disabled = compareHistory.length === 0;
      compareRedoBtn.disabled = compareFuture.length === 0;
    }

    function paintSolid(canvas, hex) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = hex || '#ffffff';
      ctx.fillRect(2, 2, canvas.width - 4, canvas.height - 4);
      ctx.strokeStyle = 'rgba(0,0,0,.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    }

    function paintPattern() {
      const ctx = patternCanvas.getContext('2d');
      if (!ctx) return;
      const cols = 3;
      const rows = 2;
      const cellW = patternCanvas.width / cols;
      const cellH = patternCanvas.height / rows;
      ctx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const useLeft = (row + col) % 2 === 0;
          ctx.fillStyle = useLeft ? leftColor : rightColor;
          ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
        }
      }
      ctx.strokeStyle = 'rgba(0,0,0,.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, patternCanvas.width - 2, patternCanvas.height - 2);
    }


    function updateCompareLabels() {
      leftLabel.textContent = leftColorName || (lang === 'en' ? 'Color 1' : 'Color 1');
      rightLabel.textContent = rightColorName || (lang === 'en' ? 'Color 2' : 'Color 2');
    }

    function textColorFor(hex) {
      if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return '#111';
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
      return luminance > 155 ? '#111' : '#fff';
    }

    function buildPalette(el) {
      el.innerHTML = '';
      colors.forEach((col) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sw';
        btn.style.background = col.hex;
        const label = (col.name || col.id || '').trim() || col.id;
        btn.title = `${label} · ${col.id} · ${col.hex}`;
        btn.setAttribute('aria-label', `${label} ${col.id} ${col.hex}`);
        btn.textContent = label;
        btn.style.color = textColorFor(col.hex);
        btn.style.textShadow = btn.style.color === '#111' ? 'none' : '0 1px 2px rgba(0,0,0,.75)';
        if (selectedColor && selectedColor.id === col.id) btn.classList.add('active');
        btn.addEventListener('click', () => {
          selectedColor = col;
          buildPalette(el);
        });
        el.appendChild(btn);
      });
    }

    leftCanvas.addEventListener('click', () => {
      pushCompareState();
      leftColor = selectedColor.hex;
      leftColorName = (selectedColor.name || selectedColor.id || 'Color 1').trim();
      updateCompareLabels();
      paintSolid(leftCanvas, leftColor);
      paintPattern();
    });
    rightCanvas.addEventListener('click', () => {
      pushCompareState();
      rightColor = selectedColor.hex;
      rightColorName = (selectedColor.name || selectedColor.id || 'Color 2').trim();
      updateCompareLabels();
      paintSolid(rightCanvas, rightColor);
      paintPattern();
    });


    compareUndoBtn.addEventListener('click', () => {
      if (!compareHistory.length) return;
      compareFuture.push(snapshotCompareState());
      const previous = compareHistory.pop();
      applyCompareState(previous);
    });

    compareRedoBtn.addEventListener('click', () => {
      if (!compareFuture.length) return;
      compareHistory.push(snapshotCompareState());
      const next = compareFuture.pop();
      applyCompareState(next);
    });

    compareHomeBtn.addEventListener('click', () => {
      pushCompareState();
      applyCompareState({
        leftColor: '#FFFFFF',
        rightColor: '#FFFFFF',
        leftColorName: lang === 'en' ? 'Color 1' : 'Color 1',
        rightColorName: lang === 'en' ? 'Color 2' : 'Color 2'
      });
    });

    toggleBtn.addEventListener('click', () => {
      const opening = comparator.hasAttribute('hidden');
      if (opening) comparator.removeAttribute('hidden');
      else comparator.setAttribute('hidden', 'hidden');
      toggleBtn.textContent = opening
        ? (lang === 'en' ? 'Hide comparator' : 'Ocultar comparador')
        : (lang === 'en' ? 'Compare colors' : 'Comparar colores');
    });

    updateCompareLabels();
    buildPalette(sharedPalette);
    paintSolid(leftCanvas, leftColor);
    paintSolid(rightCanvas, rightColor);
    paintPattern();
    compareUndoBtn.disabled = true;
    compareRedoBtn.disabled = true;
  }

  function initCategories() {
    const el = q('catGrid');
    if (!el) return;
    const lang = getLang();
    const categories = [
      { key: 'cat_colors', img: 'assets/placeholder-tile.svg', href: 'colores.php' },
      { key: 'cat_decorated', img: 'assets/placeholder-tile.svg', href: 'mosaicos.php' },
      { key: 'cat_specials', img: 'assets/placeholder-tile.svg', href: 'especiales.php' },
      { key: 'cat_customize', img: 'assets/placeholder-tile.svg', href: 'personalizar.php' }
    ];
    const dict = {
      es: { cat_colors: 'Lisos', cat_decorated: 'Decorados', cat_specials: 'Especiales', cat_customize: 'Personalizar', btn: 'Ver modelos » clic aquí' },
      en: { cat_colors: 'Solid Colors', cat_decorated: 'Decorated', cat_specials: 'Specials', cat_customize: 'Customize', btn: 'View designs » click here' }
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


  function getPerceivedLightness(hex) {
    if (typeof hex !== 'string') return -1;
    const clean = hex.trim().replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return -1;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
  }


  function hexToHsl(hex) {
    if (typeof hex !== 'string') return { h: 0, s: 0, l: 0 };
    const clean = hex.trim().replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return { h: 0, s: 0, l: 0 };
    let r = parseInt(clean.slice(0, 2), 16) / 255;
    let g = parseInt(clean.slice(2, 4), 16) / 255;
    let b = parseInt(clean.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0;
    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = ((b - r) / delta) + 2;
      else h = ((r - g) / delta) + 4;
      h *= 60;
      if (h < 0) h += 360;
    }

    return { h, s, l };
  }

  function getColorFamily(hex) {
    const { h, s, l } = hexToHsl(hex);

    if (s < 0.08) {
      if (l > 0.9) return 'blanco';
      if (l < 0.18) return 'negro';
      return 'gris';
    }

    if (h >= 15 && h <= 45 && l < 0.55) return 'cafe';
    if (h < 15 || h >= 345) return 'rojo';
    if (h >= 15 && h < 45) return 'naranja';
    if (h >= 45 && h < 75) return 'amarillo';
    if (h >= 75 && h < 165) return 'verde';
    if (h >= 165 && h < 200) return 'turquesa';
    if (h >= 200 && h < 255) return 'azul';
    if (h >= 255 && h < 300) return 'morado';
    return 'rosa';
  }

  function getCustomizerPalette() {
    const fallback = [
  { id: 'A10', hex: '#5860F9', name: 'A10' },
  { id: 'A11', hex: '#AFDDD9', name: 'A11' },
  { id: 'A12', hex: '#8DB6D8', name: 'A12' },
  { id: 'A13', hex: '#BDDBDA', name: 'A13' },
  { id: 'A14', hex: '#6184AF', name: 'A14' },
  { id: 'A15', hex: '#54668C', name: 'A15' },
  { id: 'A16', hex: '#1876AA', name: 'A16' },
  { id: 'A18', hex: '#3B6593', name: 'A18' },
  { id: 'A19', hex: '#293B49', name: 'A19' },
  { id: 'A2', hex: '#B59571', name: 'A2' },
  { id: 'A3', hex: '#F2DA75', name: 'A3' },
  { id: 'A4', hex: '#EFC581', name: 'A4' },
  { id: 'A5', hex: '#E2AF23', name: 'A5' },
  { id: 'A6', hex: '#E2B252', name: 'A6' },
  { id: 'A7', hex: '#D8A236', name: 'A7' },
  { id: 'A8', hex: '#FC9D06', name: 'A8' },
  { id: 'A9', hex: '#5DA1A8', name: 'A9' },
  { id: 'B23', hex: '#E5D9C6', name: 'B23' },
  { id: 'B24', hex: '#F2E3D3', name: 'B24' },
  { id: 'B25', hex: '#EDEDED', name: 'B25' },
  { id: 'B26', hex: '#F4F2E4', name: 'B26' },
  { id: 'B27', hex: '#D4D6D2', name: 'B27' },
  { id: 'B28', hex: '#D3D3C9', name: 'B28' },
  { id: 'C103', hex: '#A3895A', name: 'C103' },
  { id: 'C29', hex: '#DBCCBF', name: 'C29' },
  { id: 'C30', hex: '#7F523E', name: 'C30' },
  { id: 'C32', hex: '#683333', name: 'C32' },
  { id: 'C33', hex: '#807070', name: 'C33' },
  { id: 'C90', hex: '#8E5A4A', name: 'C90' },
  { id: 'G34', hex: '#C9C6C5', name: 'G34' },
  { id: 'G35', hex: '#ADADAD', name: 'G35' },
  { id: 'G36', hex: '#9B9A9A', name: 'G36' },
  { id: 'G37', hex: '#8C8C8C', name: 'G37' },
  { id: 'G38', hex: '#D3D2D1', name: 'G38' },
  { id: 'G39', hex: '#757574', name: 'G39' },
  { id: 'G41', hex: '#6C797F', name: 'G41' },
  { id: 'G42', hex: '#6D6D66', name: 'G42' },
  { id: 'L43', hex: '#70708E', name: 'L43' },
  { id: 'M47', hex: '#896F72', name: 'M47' },
  { id: 'M48', hex: '#73393C', name: 'M48' },
  { id: 'M91', hex: '#5C373A', name: 'M91' },
  { id: 'N51', hex: '#C15F40', name: 'N51' },
  { id: 'N54', hex: '#B25438', name: 'N54' },
  { id: 'N55', hex: '#1E2021', name: 'N55' },
  { id: 'R57', hex: '#933434', name: 'R57' },
  { id: 'R58', hex: '#8E2B29', name: 'R58' },
  { id: 'R59', hex: '#A33131', name: 'R59' },
  { id: 'R60', hex: '#D8C5C5', name: 'R60' },
  { id: 'R61', hex: '#E8BFBF', name: 'R61' },
  { id: 'R62', hex: '#DD8C8C', name: 'R62' },
  { id: 'R63', hex: '#C1686D', name: 'R63' },
  { id: 'S92', hex: '#D8B8AD', name: 'S92' },
  { id: 'T65', hex: '#875D41', name: 'T65' },
  { id: 'V68', hex: '#688983', name: 'V68' },
  { id: 'V69', hex: '#67938E', name: 'V69' },
  { id: 'V70', hex: '#8DB798', name: 'V70' },
  { id: 'V72', hex: '#8E8357', name: 'V72' },
  { id: 'V73', hex: '#419370', name: 'V73' },
  { id: 'V74 Escudo', hex: '#678967', name: 'V74 Escudo' },
  { id: 'V74Norte', hex: '#82A382', name: 'V74Norte' },
  { id: 'V75', hex: '#677A5C', name: 'V75' },
  { id: 'V77', hex: '#6E9A8D', name: 'V77' },
  { id: 'V80', hex: '#E1E0CC', name: 'V80' },
  { id: 'V81', hex: '#91BA61', name: 'V81' },
  { id: 'V82', hex: '#8FC5B5', name: 'V82' },
  { id: 'V84', hex: '#475646', name: 'V84' },
  { id: 'V85', hex: '#91934D', name: 'V85' },
  { id: 'V86', hex: '#BDD3BC', name: 'V86' },
  { id: 'V88', hex: '#96B29A', name: 'V88' }
    ];

    const source = Array.isArray(window.CUSTOMIZER_COLORS) ? window.CUSTOMIZER_COLORS : fallback;
    const palette = source
      .filter((c) => c && typeof c.id === 'string' && typeof c.hex === 'string')
      .map((c) => ({
        id: c.id.trim(),
        hex: c.hex.trim().toUpperCase(),
        name: (c.name || c.id).trim()
      }))
      .filter((c) => /^#[0-9A-F]{6}$/.test(c.hex) && c.id.length > 0)
      .map((c) => ({ ...c, family: getColorFamily(c.hex), lightness: getPerceivedLightness(c.hex) }));

    const familyLightness = new Map();
    palette.forEach((c) => {
      const bucket = familyLightness.get(c.family) || { total: 0, count: 0 };
      bucket.total += c.lightness;
      bucket.count += 1;
      familyLightness.set(c.family, bucket);
    });

    const familyRank = Array.from(familyLightness.entries())
      .map(([family, agg]) => ({ family, avg: agg.count ? agg.total / agg.count : 0 }))
      .sort((a, b) => b.avg - a.avg || a.family.localeCompare(b.family, 'es', { sensitivity: 'base' }))
      .reduce((acc, item, idx) => {
        acc.set(item.family, idx);
        return acc;
      }, new Map());

    return palette
      .sort((a, b) => {
        const famDiff = (familyRank.get(a.family) || 0) - (familyRank.get(b.family) || 0);
        if (famDiff !== 0) return famDiff;
        const lightnessDiff = b.lightness - a.lightness;
        if (lightnessDiff !== 0) return lightnessDiff;
        return a.id.localeCompare(b.id, 'es', { numeric: true, sensitivity: 'base' });
      })
      .map(({ family, lightness, ...rest }) => rest);
  }


  function getPdfTemplate() {
    const fallback = {
      page: { widthPt: 612, heightPt: 792, canvasWidth: 1275, canvasHeight: 1650 },
      logo: { src: '', x: 70, y: 48, width: 200, height: 70 },
      title: { x: 70, y: 150, text: 'Mosaicos Dzununcán' },
      model: { x: 70, y: 188 },
      contact: { x: 70, y: 218, text: 'ventas@mosaicosdzununcan.com · Tienda: (999) 217 9326 · Fábrica: (999) 249 5158' },
      pattern: { x: 70, y: 260, width: 900, height: 600 },
      colorsTitle: { x: 70, y: 910, text: 'Colores usados' },
      colors: { startX: 70, startY: 958, rowGap: 48, colGap: 450, columns: 2 }
    };
    const external = window.CUSTOMIZER_PDF_TEMPLATE || {};
    return { ...fallback, ...external, page: { ...fallback.page, ...(external.page || {}) }, logo: { ...fallback.logo, ...(external.logo || {}) }, title: { ...fallback.title, ...(external.title || {}) }, model: { ...fallback.model, ...(external.model || {}) }, contact: { ...fallback.contact, ...(external.contact || {}) }, pattern: { ...fallback.pattern, ...(external.pattern || {}) }, colorsTitle: { ...fallback.colorsTitle, ...(external.colorsTitle || {}) }, colors: { ...fallback.colors, ...(external.colors || {}) } };
  }

  const COLORS = getCustomizerPalette();

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
    if (!palette || !big) return;

    const lang = getLang();
    const models = Array.isArray(window.CUSTOMIZER_MODELS) ? window.CUSTOMIZER_MODELS : [];
    const selection = window.CUSTOMIZER_SELECTION || {};
    const pickerMode = (selection.pickerMode || big.dataset.pickerMode || 'dual').toLowerCase() === 'single' ? 'single' : 'dual';

    const centerInput = q('centerSearchInput');
    const cenefaInput = q('cenefaSearchInput');
    const centerResults = q('centerSearchResults');
    const cenefaResults = q('cenefaSearchResults');
    const selectedModelNameEl = q('selectedModelName');
    const searchRow = document.querySelector('.model-search-row');
    const searchMode = ((searchRow && searchRow.dataset.searchMode) || 'modelo').toLowerCase();
    const searchDisabled = Boolean(searchRow && searchRow.dataset.searchDisabled === '1');
    const tapetePresets = Array.isArray(window.CUSTOMIZER_TAPETES) ? window.CUSTOMIZER_TAPETES : [];
    const manualConnections = (window.CUSTOMIZER_CONNECTIONS && typeof window.CUSTOMIZER_CONNECTIONS === 'object') ? window.CUSTOMIZER_CONNECTIONS : {};
    const manualOuterConnections = (window.CUSTOMIZER_CONNECTIONS_OUTER && typeof window.CUSTOMIZER_CONNECTIONS_OUTER === 'object') ? window.CUSTOMIZER_CONNECTIONS_OUTER : {};

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
        const mapped = models.find((m) => {
          const cat = (m.categoria || '').toLowerCase();
          return (cat === 'esquina' || cat === 'esquina_exterior') && (m.carpeta_modelo || '').toString().toLowerCase() === mappedFolder;
        });
        if (mapped) return mapped;
      }
      if (Object.keys(manualConnections).length > 0) return null;
      const key = familyKey(cenefaModel);
      return models.find((m) => (m.categoria || '').toLowerCase() === 'esquina' && familyKey(m) === key) || null;
    }

    function findOuterForCenefa(cenefaModel) {
      if (!cenefaModel) return { cenefaOuter: null, esquinaOuter: null };
      const folderRaw = (cenefaModel.carpeta_modelo || '').toString().toLowerCase();
      const outer = manualOuterConnections[folderRaw] || null;
      if (!outer) return { cenefaOuter: null, esquinaOuter: null };
      const outerC = (outer.cenefa || '').toString().toLowerCase();
      const outerE = (outer.esquina || '').toString().toLowerCase();
      const cenefaOuter = models.find((m) => {
        const cat = (m.categoria || '').toLowerCase();
        return (cat === 'cenefa_exterior' || cat === 'cenefa') && (m.carpeta_modelo || '').toString().toLowerCase() === outerC;
      }) || null;
      const esquinaOuter = models.find((m) => {
        const cat = (m.categoria || '').toLowerCase();
        return (cat === 'esquina_exterior' || cat === 'esquina') && (m.carpeta_modelo || '').toString().toLowerCase() === outerE;
      }) || null;
      return { cenefaOuter, esquinaOuter };
    }

    function goToSelection(centerModel, cenefaModel, esquinaModel, cenefaOuterModel = null, esquinaOuterModel = null) {
      const url = new URL(window.location.href);
      url.searchParams.set('picker', pickerMode);
      if (centerModel) url.searchParams.set('center_id', String(centerModel.id));
      else url.searchParams.delete('center_id');

      if (cenefaModel) url.searchParams.set('cenefa_id', String(cenefaModel.id));
      else url.searchParams.delete('cenefa_id');
      if (esquinaModel) url.searchParams.set('esquina_id', String(esquinaModel.id));
      else url.searchParams.delete('esquina_id');

      if (cenefaOuterModel && cenefaOuterModel.id) url.searchParams.set('cenefa_outer_id', String(cenefaOuterModel.id));
      else url.searchParams.delete('cenefa_outer_id');
      if (esquinaOuterModel && esquinaOuterModel.id) url.searchParams.set('esquina_outer_id', String(esquinaOuterModel.id));
      else url.searchParams.delete('esquina_outer_id');

      if (cenefaOuterModel && cenefaOuterModel.imagen) url.searchParams.set('cenefa_outer_img', cenefaOuterModel.imagen);
      else url.searchParams.delete('cenefa_outer_img');
      if (esquinaOuterModel && esquinaOuterModel.imagen) url.searchParams.set('esquina_outer_img', esquinaOuterModel.imagen);
      else url.searchParams.delete('esquina_outer_img');
      if (cenefaOuterModel && cenefaOuterModel.nombre) url.searchParams.set('cenefa_outer_name', cenefaOuterModel.nombre);
      else url.searchParams.delete('cenefa_outer_name');
      if (esquinaOuterModel && esquinaOuterModel.nombre) url.searchParams.set('esquina_outer_name', esquinaOuterModel.nombre);
      else url.searchParams.delete('esquina_outer_name');

      const editable = pickerMode === 'dual'
        ? centerModel
        : (centerModel || cenefaModel || esquinaModel);
      if (editable) {
        url.searchParams.set('id', String(editable.id));
        url.searchParams.set('name', editable.nombre || 'Modelo');
        url.searchParams.set('img', editable.imagen || 'assets/placeholder-tile.svg');
        url.searchParams.set('cat', (editable.categoria || '').toLowerCase());
      } else {
        url.searchParams.delete('id');
        url.searchParams.delete('name');
        url.searchParams.delete('img');
        url.searchParams.delete('cat');
      }
      url.searchParams.set('lang', lang);
      window.location.assign(url.pathname + url.search + url.hash);
    }

    function renderSelector({ inputEl, resultEl, category, selectedId, onPick, allowedIds = null }) {
      if (!inputEl || !resultEl) return;
      const query = norm(inputEl.value);
      const filtered = models.filter((m) => {
        if ((m.categoria || '').toLowerCase() !== category) return false;
        if (allowedIds && !allowedIds.has(String(m.id))) return false;
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



    function goToTapetePreset(preset) {
      if (!preset || typeof preset !== 'object') return;
      const url = new URL(window.location.href);
      url.searchParams.set('picker', 'dual');
      url.searchParams.set('source', 'tapete');
      url.searchParams.set('cat', 'centro');
      url.searchParams.set('lang', lang);
      url.searchParams.set('name', preset.nombre || 'Tapete');

      const center = preset.centro || null;
      const cenefa = preset.cenefa || null;
      const esquina = preset.esquina || null;
      const cenefaOuter = preset.cenefa_exterior || null;
      const esquinaOuter = preset.esquina_exterior || null;

      if (center && center.id) url.searchParams.set('center_id', String(center.id)); else url.searchParams.delete('center_id');
      if (cenefa && cenefa.id) url.searchParams.set('cenefa_id', String(cenefa.id)); else url.searchParams.delete('cenefa_id');
      if (esquina && esquina.id) url.searchParams.set('esquina_id', String(esquina.id)); else url.searchParams.delete('esquina_id');
      if (cenefaOuter && cenefaOuter.id) url.searchParams.set('cenefa_outer_id', String(cenefaOuter.id)); else url.searchParams.delete('cenefa_outer_id');
      if (esquinaOuter && esquinaOuter.id) url.searchParams.set('esquina_outer_id', String(esquinaOuter.id)); else url.searchParams.delete('esquina_outer_id');

      if (center && center.imagen) url.searchParams.set('center_img', center.imagen); else url.searchParams.delete('center_img');
      if (cenefa && cenefa.imagen) url.searchParams.set('cenefa_img', cenefa.imagen); else url.searchParams.delete('cenefa_img');
      if (esquina && esquina.imagen) url.searchParams.set('esquina_img', esquina.imagen); else url.searchParams.delete('esquina_img');
      if (cenefaOuter && cenefaOuter.imagen) url.searchParams.set('cenefa_outer_img', cenefaOuter.imagen); else url.searchParams.delete('cenefa_outer_img');
      if (esquinaOuter && esquinaOuter.imagen) url.searchParams.set('esquina_outer_img', esquinaOuter.imagen); else url.searchParams.delete('esquina_outer_img');

      if (center && center.nombre) url.searchParams.set('center_name', center.nombre); else url.searchParams.delete('center_name');
      if (cenefa && cenefa.nombre) url.searchParams.set('cenefa_name', cenefa.nombre); else url.searchParams.delete('cenefa_name');
      if (esquina && esquina.nombre) url.searchParams.set('esquina_name', esquina.nombre); else url.searchParams.delete('esquina_name');
      if (cenefaOuter && cenefaOuter.nombre) url.searchParams.set('cenefa_outer_name', cenefaOuter.nombre); else url.searchParams.delete('cenefa_outer_name');
      if (esquinaOuter && esquinaOuter.nombre) url.searchParams.set('esquina_outer_name', esquinaOuter.nombre); else url.searchParams.delete('esquina_outer_name');

      window.location.assign(url.pathname + url.search + url.hash);
    }

    function renderTapeteSelector() {
      if (!centerInput || !centerResults) return;
      centerInput.placeholder = lang === 'en' ? 'Select rug' : 'Seleccionar tapete';
      const query = norm(centerInput.value);
      const filtered = tapetePresets.filter((t) => {
        if (!query) return true;
        return norm(t && t.nombre ? t.nombre : '').includes(query);
      }).slice(0, 8);
      if (!filtered.length) {
        centerResults.innerHTML = `<div class="model-search-empty">${lang === 'en' ? 'No rugs found.' : 'No se encontraron tapetes.'}</div>`;
        return;
      }
      centerResults.innerHTML = '';
      filtered.forEach((preset) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'model-search-item';
        item.textContent = preset.nombre || 'Tapete';
        item.addEventListener('click', () => goToTapetePreset(preset));
        centerResults.appendChild(item);
      });
    }

    const selectedCenter = models.find((m) => String(m.id) === String(selection.centerId || '')) || null;
    const selectedCenefa = models.find((m) => String(m.id) === String(selection.cenefaId || '')) || null;
    const selectedEsquina = models.find((m) => String(m.id) === String(selection.esquinaId || '')) || null;
    const selectedCenefaOuter = models.find((m) => String(m.id) === String(selection.cenefaOuterId || '')) || null;
    const selectedEsquinaOuter = models.find((m) => String(m.id) === String(selection.esquinaOuterId || '')) || null;

    let src = '';
    let centerSrc = '';
    let cenefaSrc = '';
    let esquinaSrc = '';
    let cenefaOuterSrc = '';
    let esquinaOuterSrc = '';


    if (searchMode === 'tapete') {
      centerInput && centerInput.addEventListener('input', renderTapeteSelector);
      centerInput && centerInput.addEventListener('focus', () => renderTapeteSelector());
      if (centerInput && !centerInput.value) {
        const currentName = new URLSearchParams(window.location.search).get('name') || '';
        if (currentName) centerInput.value = currentName;
      }
      renderTapeteSelector();
    } else {

    const rawSingle = (big.dataset.entryCategory || big.dataset.category || '').toLowerCase().trim();
    const forcedSingleCategory = pickerMode === 'single'
      ? (['cenefa','esquina','cenefa_exterior','esquina_exterior','centro'].includes(rawSingle) ? rawSingle : (rawSingle.includes('esquina') ? (rawSingle.includes('exterior') ? 'esquina_exterior' : 'esquina') : (rawSingle.includes('cenefa') ? (rawSingle.includes('exterior') ? 'cenefa_exterior' : 'cenefa') : 'centro')))
      : 'centro';

      if (searchDisabled) {
        if (centerInput) centerInput.setAttribute('disabled', 'disabled');
        if (cenefaInput) cenefaInput.setAttribute('disabled', 'disabled');
        if (centerResults) centerResults.innerHTML = '';
        if (cenefaResults) cenefaResults.innerHTML = '';
      }

      if (centerInput && !searchDisabled) {
      if (pickerMode === 'single') {
        centerInput.placeholder = (forcedSingleCategory === 'cenefa')
          ? (lang === 'en' ? 'Select border' : 'Seleccionar cenefa')
          : (forcedSingleCategory === 'esquina'
            ? (lang === 'en' ? 'Select corner' : 'Seleccionar esquina')
            : (forcedSingleCategory === 'cenefa_exterior'
              ? (lang === 'en' ? 'Select outer border' : 'Seleccionar cenefa exterior')
              : (forcedSingleCategory === 'esquina_exterior'
                ? (lang === 'en' ? 'Select outer corner' : 'Seleccionar esquina exterior')
                : (lang === 'en' ? 'Select center' : 'Seleccionar centro'))));
      }
      if (pickerMode === 'single') {
        if (forcedSingleCategory === 'cenefa' && selectedCenefa) centerInput.value = selectedCenefa.nombre || '';
        else if (forcedSingleCategory === 'esquina' && selectedEsquina) centerInput.value = selectedEsquina.nombre || '';
        else if (forcedSingleCategory === 'cenefa_exterior' && selectedCenefaOuter) centerInput.value = selectedCenefaOuter.nombre || '';
        else if (forcedSingleCategory === 'esquina_exterior' && selectedEsquinaOuter) centerInput.value = selectedEsquinaOuter.nombre || '';
        else if (selectedCenter) centerInput.value = selectedCenter.nombre || '';
      } else if (selectedCenter) centerInput.value = selectedCenter.nombre || '';
      centerInput.addEventListener('input', () => {
        const query = String(centerInput.value || '').trim();
        if (!query) {
          if (pickerMode === 'single' && forcedSingleCategory === 'cenefa' && selectedCenefa) {
            goToSelection(null, null, null, null, null);
            return;
          }
          if (pickerMode === 'single' && forcedSingleCategory === 'esquina' && selectedEsquina) {
            goToSelection(null, selectedCenefa, null, selectedCenefaOuter, null);
            return;
          }
          if (pickerMode === 'single' && forcedSingleCategory === 'cenefa_exterior' && selectedCenefaOuter) {
            goToSelection(null, selectedCenefa, selectedEsquina, null, selectedEsquinaOuter);
            return;
          }
          if (pickerMode === 'single' && forcedSingleCategory === 'esquina_exterior' && selectedEsquinaOuter) {
            goToSelection(null, selectedCenefa, selectedEsquina, selectedCenefaOuter, null);
            return;
          }
          if ((pickerMode === 'dual' || forcedSingleCategory === 'centro') && selectedCenter) {
            goToSelection(null, selectedCenefa, selectedEsquina, selectedCenefaOuter, selectedEsquinaOuter);
            return;
          }
        }
        renderSelector({
          inputEl: centerInput,
          resultEl: centerResults,
          category: forcedSingleCategory,
          selectedId: selectedCenter ? selectedCenter.id : null,
          onPick: (pickedModel) => {
            if (pickerMode === 'single' && forcedSingleCategory === 'cenefa') {
              { const outer = findOuterForCenefa(pickedModel); goToSelection(null, pickedModel, findEsquinaForCenefa(pickedModel), outer.cenefaOuter, outer.esquinaOuter); }
              return;
            }
            if (pickerMode === 'single' && forcedSingleCategory === 'esquina') {
              goToSelection(null, selectedCenefa, pickedModel, selectedCenefaOuter, selectedEsquinaOuter);
              return;
            }
            goToSelection(pickedModel, selectedCenefa, selectedEsquina, selectedCenefaOuter, selectedEsquinaOuter);
          },
        });
      });
      centerInput.addEventListener('focus', () => centerInput.dispatchEvent(new Event('input')));
      centerInput.dispatchEvent(new Event('input'));
    }

    if (cenefaInput && !searchDisabled) {
      const connectedCenefaIds = new Set();
      Object.keys(manualConnections || {}).forEach((folder) => {
        const match = models.find((m) => (m.categoria || '').toLowerCase() === 'cenefa' && (m.carpeta_modelo || '').toString().toLowerCase() === folder);
        if (match) connectedCenefaIds.add(String(match.id));
      });
      const hasConnectionFilter = connectedCenefaIds.size > 0;
      if (selectedCenefa) cenefaInput.value = selectedCenefa.nombre || '';
      cenefaInput.addEventListener('input', () => {
        const query = String(cenefaInput.value || '').trim();
        if (!query && selectedCenefa) {
          goToSelection(selectedCenter, null, null, null, null);
          return;
        }
        renderSelector({
          inputEl: cenefaInput,
          resultEl: cenefaResults,
          category: 'cenefa',
          selectedId: selectedCenefa ? selectedCenefa.id : null,
          allowedIds: hasConnectionFilter ? connectedCenefaIds : null,
          onPick: (cenefaModel) => {
            const outer = findOuterForCenefa(cenefaModel);
            goToSelection(selectedCenter, cenefaModel, findEsquinaForCenefa(cenefaModel), outer.cenefaOuter, outer.esquinaOuter);
          },
        });
      });
      cenefaInput.addEventListener('focus', () => cenefaInput.dispatchEvent(new Event('input')));
      cenefaInput.dispatchEvent(new Event('input'));
    }
    }

    src = normalizeAssetSrc(big.dataset.image || '');
    centerSrc = normalizeAssetSrc(big.dataset.centerImage || '');
    cenefaSrc = normalizeAssetSrc(big.dataset.cenefaImage || '');
    esquinaSrc = normalizeAssetSrc(big.dataset.esquinaImage || '');
    cenefaOuterSrc = normalizeAssetSrc(big.dataset.cenefaOuterImage || '');
    esquinaOuterSrc = normalizeAssetSrc(big.dataset.esquinaOuterImage || '');
    const cenefaAltRotate = String(big.dataset.cenefaAltRotate || '').trim() === '1';
    const cenefaOuterAltRotate = String(big.dataset.cenefaOuterAltRotate || '').trim() === '1';
    const editTarget = (big.dataset.editTarget || '').toLowerCase();
    if (!src && !cenefaSrc && !esquinaSrc && !cenefaOuterSrc && !esquinaOuterSrc) {
      if (editor) editor.innerHTML = `<p class="empty-msg">${lang === 'en' ? 'Select a model from the search bar above to start customizing.' : 'Selecciona un modelo en la barra de búsqueda para comenzar a personalizar.'}</p>`;
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

    function hasCenterPaintEdits() {
      if (!sourceImageData || !currentImageData || !sourceImageData.data || !currentImageData.data) return false;
      const src = sourceImageData.data;
      const cur = currentImageData.data;
      const n = Math.min(src.length, cur.length);
      for (let i = 0; i < n; i += 4) {
        if (cur[i + 3] < 10) continue;
        const same = cur[i] === src[i] && cur[i + 1] === src[i + 1] && cur[i + 2] === src[i + 2] && cur[i + 3] === src[i + 3];
        if (!same) return true;
      }
      return false;
    }

    function getUsedColorIdsFromDiff() {
      const used = new Set();
      const colorByRgb = new Map();
      colors.forEach((c) => {
        const rgb = hexToRgb(c.hex);
        colorByRgb.set(`${rgb.r},${rgb.g},${rgb.b}`, c.id);
      });

      function collectDiffIds(sourceData, currentData) {
        if (!sourceData || !currentData || !sourceData.data || !currentData.data) return;
        const src = sourceData.data;
        const cur = currentData.data;
        const n = Math.min(src.length, cur.length);
        for (let i = 0; i < n; i += 4) {
          if (cur[i + 3] < 10) continue;
          const same = cur[i] === src[i] && cur[i + 1] === src[i + 1] && cur[i + 2] === src[i + 2] && cur[i + 3] === src[i + 3];
          if (same) continue;
          const key = `${cur[i]},${cur[i + 1]},${cur[i + 2]}`;
          const colorId = colorByRgb.get(key);
          if (colorId) used.add(colorId);
        }
      }

      collectDiffIds(sourceImageData, currentImageData);
      if (cenefaEditor) collectDiffIds(cenefaEditor.source, cenefaEditor.current);
      if (esquinaEditor) collectDiffIds(esquinaEditor.source, esquinaEditor.current);
      if (cenefaOuterEditor) collectDiffIds(cenefaOuterEditor.source, cenefaOuterEditor.current);
      if (esquinaOuterEditor) collectDiffIds(esquinaOuterEditor.source, esquinaOuterEditor.current);

      return Array.from(used);
    }

    if (editor) editor.innerHTML = '<canvas id="editCanvas" class="vector-canvas" width="600" height="600"></canvas>';
    big.innerHTML = '<canvas id="patternCanvas" class="pattern-canvas" width="1200" height="800"></canvas>';

    const editCanvas = q('editCanvas');
    const patternCanvas = q('patternCanvas');
    const ectx = editCanvas ? editCanvas.getContext('2d', { willReadFrequently: true }) : null;
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
      if (!currentImageData || !ectx) return;
      ectx.putImageData(currentImageData, 0, 0);
    }

    let centerImg = null;
    let cenefaImg = null;
    let esquinaImg = null;
    let cenefaOuterImg = null;
    let esquinaOuterImg = null;
    let cenefaEditedCanvas = null;
    let esquinaEditedCanvas = null;
    let cenefaOuterEditedCanvas = null;
    let esquinaOuterEditedCanvas = null;
    let cenefaEditor = null;
    let esquinaEditor = null;
    let cenefaOuterEditor = null;
    let esquinaOuterEditor = null;


    function imageDataDiffers(baseData, currentData) {
      if (!baseData || !currentData || !baseData.data || !currentData.data) return false;
      if (baseData.width !== currentData.width || baseData.height !== currentData.height) return true;
      const a = baseData.data;
      const b = currentData.data;
      const n = Math.min(a.length, b.length);
      for (let i = 0; i < n; i += 1) {
        if (a[i] !== b[i]) return true;
      }
      return false;
    }

    function imageDataToDataUrl(imageData) {
      if (!imageData) return '';
      const c = document.createElement('canvas');
      c.width = imageData.width;
      c.height = imageData.height;
      const cx = c.getContext('2d');
      if (!cx) return '';
      cx.putImageData(imageData, 0, 0);
      return c.toDataURL('image/png');
    }

    function persistLayerDraft(rawSrc, sourceData, currentData) {
      const key = baseSrcKey(rawSrc);
      if (!key) return;
      const drafts = readCustomizerDrafts();
      if (!currentData || !imageDataDiffers(sourceData, currentData)) {
        delete drafts[key];
        writeCustomizerDrafts(drafts);
        return;
      }
      const dataUrl = imageDataToDataUrl(currentData);
      if (!dataUrl) return;
      drafts[key] = { dataUrl, width: currentData.width, height: currentData.height, ts: Date.now() };
      writeCustomizerDrafts(drafts);
    }

    function persistCurrentDrafts() {
      persistLayerDraft(src, sourceImageData, currentImageData);
      persistLayerDraft(cenefaSrc, cenefaEditor && cenefaEditor.source, cenefaEditor && cenefaEditor.current);
      persistLayerDraft(esquinaSrc, esquinaEditor && esquinaEditor.source, esquinaEditor && esquinaEditor.current);
      persistLayerDraft(cenefaOuterSrc, cenefaOuterEditor && cenefaOuterEditor.source, cenefaOuterEditor && cenefaOuterEditor.current);
      persistLayerDraft(esquinaOuterSrc, esquinaOuterEditor && esquinaOuterEditor.source, esquinaOuterEditor && esquinaOuterEditor.current);
    }

    function getDraftForSrc(rawSrc) {
      const key = baseSrcKey(rawSrc);
      if (!key) return null;
      const drafts = readCustomizerDrafts();
      const value = drafts[key];
      if (!value || typeof value !== 'object' || !value.dataUrl) return null;
      return value;
    }

    function draftToImageData(draft, width, height) {
      return new Promise((resolve) => {
        if (!draft || !draft.dataUrl || !width || !height) return resolve(null);
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = width;
          c.height = height;
          const cx = c.getContext('2d');
          if (!cx) return resolve(null);
          cx.clearRect(0, 0, width, height);
          cx.drawImage(img, 0, 0, width, height);
          resolve(cx.getImageData(0, 0, width, height));
        };
        img.onerror = () => resolve(null);
        img.src = draft.dataUrl;
      });
    }


    function snapshotState() {
      return {
        main: currentImageData ? cloneImageData(currentImageData) : null,
        cenefa: cenefaEditor && cenefaEditor.current ? cloneImageData(cenefaEditor.current) : null,
        esquina: esquinaEditor && esquinaEditor.current ? cloneImageData(esquinaEditor.current) : null,
        cenefaOuter: cenefaOuterEditor && cenefaOuterEditor.current ? cloneImageData(cenefaOuterEditor.current) : null,
        esquinaOuter: esquinaOuterEditor && esquinaOuterEditor.current ? cloneImageData(esquinaOuterEditor.current) : null,
      };
    }

    function applySnapshot(snapshot) {
      if (!snapshot) return;
      if (snapshot.main) {
        currentImageData = cloneImageData(snapshot.main);
        renderEdit();
      }
      if (cenefaEditor) {
        if (snapshot.cenefa) {
          cenefaEditor.current = cloneImageData(snapshot.cenefa);
          cenefaEditor.ctx.putImageData(cenefaEditor.current, 0, 0);
          const c = document.createElement('canvas');
          c.width = cenefaEditor.canvas.width;
          c.height = cenefaEditor.canvas.height;
          c.getContext('2d').putImageData(cenefaEditor.current, 0, 0);
          cenefaEditedCanvas = c;
        } else if (cenefaEditor.source) {
          cenefaEditor.current = cloneImageData(cenefaEditor.source);
          cenefaEditor.ctx.putImageData(cenefaEditor.current, 0, 0);
          cenefaEditedCanvas = null;
        }
      }
      if (esquinaEditor) {
        if (snapshot.esquina) {
          esquinaEditor.current = cloneImageData(snapshot.esquina);
          esquinaEditor.ctx.putImageData(esquinaEditor.current, 0, 0);
          const c = document.createElement('canvas');
          c.width = esquinaEditor.canvas.width;
          c.height = esquinaEditor.canvas.height;
          c.getContext('2d').putImageData(esquinaEditor.current, 0, 0);
          esquinaEditedCanvas = c;
        } else if (esquinaEditor.source) {
          esquinaEditor.current = cloneImageData(esquinaEditor.source);
          esquinaEditor.ctx.putImageData(esquinaEditor.current, 0, 0);
          esquinaEditedCanvas = null;
        }
      }

      if (cenefaOuterEditor) {
        if (snapshot.cenefaOuter) {
          cenefaOuterEditor.current = cloneImageData(snapshot.cenefaOuter);
          cenefaOuterEditor.ctx.putImageData(cenefaOuterEditor.current, 0, 0);
          const c = document.createElement('canvas');
          c.width = cenefaOuterEditor.canvas.width;
          c.height = cenefaOuterEditor.canvas.height;
          c.getContext('2d').putImageData(cenefaOuterEditor.current, 0, 0);
          cenefaOuterEditedCanvas = c;
        } else if (cenefaOuterEditor.source) {
          cenefaOuterEditor.current = cloneImageData(cenefaOuterEditor.source);
          cenefaOuterEditor.ctx.putImageData(cenefaOuterEditor.current, 0, 0);
          cenefaOuterEditedCanvas = null;
        }
      }
      if (esquinaOuterEditor) {
        if (snapshot.esquinaOuter) {
          esquinaOuterEditor.current = cloneImageData(snapshot.esquinaOuter);
          esquinaOuterEditor.ctx.putImageData(esquinaOuterEditor.current, 0, 0);
          const c = document.createElement('canvas');
          c.width = esquinaOuterEditor.canvas.width;
          c.height = esquinaOuterEditor.canvas.height;
          c.getContext('2d').putImageData(esquinaOuterEditor.current, 0, 0);
          esquinaOuterEditedCanvas = c;
        } else if (esquinaOuterEditor.source) {
          esquinaOuterEditor.current = cloneImageData(esquinaOuterEditor.source);
          esquinaOuterEditor.ctx.putImageData(esquinaOuterEditor.current, 0, 0);
          esquinaOuterEditedCanvas = null;
        }
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

    function commitMutation(previousSnapshot) {
      if (!previousSnapshot) return;
      undoStack.push(previousSnapshot);
      if (undoStack.length > 40) undoStack.shift();
      redoStack.length = 0;
      updateHistoryButtons();
    }

    function drawTile(ctx, source, row, col, tileW, tileH, angle) {
      if (!source) return;
      const x = col * tileW;
      const y = row * tileH;
      const bleed = 1.35;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(x + tileW / 2, y + tileH / 2);
      ctx.rotate(angle || 0);
      ctx.drawImage(source, -(tileW / 2 + bleed), -(tileH / 2 + bleed), tileW + bleed * 2, tileH + bleed * 2);
      ctx.restore();
    }

    function asTileSource(source, size = 512) {
      if (!source) return null;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const cx = c.getContext('2d');
      const sw = source.naturalWidth || source.width || size;
      const sh = source.naturalHeight || source.height || size;
      const scale = Math.max(size / sw, size / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = (size - dw) / 2;
      const dy = (size - dh) / 2;
      cx.imageSmoothingEnabled = true;
      cx.clearRect(0, 0, size, size);
      cx.drawImage(source, dx, dy, dw, dh);
      return c;
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

      if (cenefaSrc || esquinaSrc || cenefaOuterSrc || esquinaOuterSrc) {
        const hasOuter = Boolean(cenefaOuterSrc || esquinaOuterSrc);
        const cols = 12;
        const rows = 8;
        const tw = w / cols;
        const th = h / rows;

        const hasCenterModel = Boolean(centerSrc);
        const hasCenterPaint = hasCenterPaintEdits();
        const centerSource = (hasCenterModel || hasCenterPaint) ? tile : null;
        const cenefaSource = asTileSource((editTarget === 'cenefa') ? tile : (cenefaEditedCanvas || cenefaImg || tile));
        const cornerSource = asTileSource((editTarget === 'esquina') ? tile : (esquinaEditedCanvas || esquinaImg || cenefaSource));
        const cenefaOuterSource = asTileSource((editTarget === 'cenefa_exterior') ? tile : (cenefaOuterEditedCanvas || cenefaOuterImg || cenefaSource));
        const cornerOuterSource = asTileSource((editTarget === 'esquina_exterior') ? tile : (esquinaOuterEditedCanvas || esquinaOuterImg || cenefaOuterSource));

        const centerMap = [[0, Math.PI / 2], [3 * Math.PI / 2, Math.PI]];

        function drawBorderRing(ring, borderSource, cornerSrc, alternate180 = false) {
          const left = ring;
          const right = cols - 1 - ring;
          const top = ring;
          const bottom = rows - 1 - ring;
          for (let c = left + 1; c < right; c++) {
            const idx = c - (left + 1);
            const flip = (alternate180 && (idx % 2 === 1)) ? Math.PI : 0;
            drawTile(pctx, borderSource, top, c, tw, th, 0 + flip);
            drawTile(pctx, borderSource, bottom, c, tw, th, Math.PI + flip);
          }
          for (let r = top + 1; r < bottom; r++) {
            const idx = r - (top + 1);
            const flip = (alternate180 && (idx % 2 === 1)) ? Math.PI : 0;
            drawTile(pctx, borderSource, r, left, tw, th, -Math.PI / 2 + flip);
            drawTile(pctx, borderSource, r, right, tw, th, Math.PI / 2 + flip);
          }
          drawTile(pctx, cornerSrc, top, left, tw, th, 0);
          drawTile(pctx, cornerSrc, top, right, tw, th, Math.PI / 2);
          drawTile(pctx, cornerSrc, bottom, right, tw, th, Math.PI);
          drawTile(pctx, cornerSrc, bottom, left, tw, th, -Math.PI / 2);
        }

        pctx.fillStyle = '#fff';
        pctx.fillRect(0, 0, w, h);

        if (hasOuter) drawBorderRing(0, cenefaOuterSource, cornerOuterSource, cenefaOuterAltRotate);
        drawBorderRing(hasOuter ? 1 : 0, cenefaSource, cornerSource, cenefaAltRotate);

        const ringCount = hasOuter ? 2 : 1;
        if (centerSource) {
          for (let r = ringCount; r < rows - ringCount; r++) {
            for (let c = ringCount; c < cols - ringCount; c++) {
              drawTile(pctx, centerSource, r, c, tw, th, centerMap[(r - ringCount) % 2][(c - ringCount) % 2]);
            }
          }
        }

        return;
      }

      const cols = 12;
      const rows = 8;
      const tw = w / cols;
      const th = h / rows;

      if (category === 'cenefa') {
        pctx.fillStyle = '#fff';
        pctx.fillRect(0, 0, w, h);
        const borderSource = tile;
        for (let c = 0; c < cols; c++) {
          const flip = (cenefaAltRotate && (c % 2 === 1)) ? Math.PI : 0;
          drawTile(pctx, borderSource, 0, c, tw, th, 0 + flip);
          drawTile(pctx, borderSource, rows - 1, c, tw, th, Math.PI + flip);
        }
        for (let r = 1; r < rows - 1; r++) {
          const flip = (cenefaAltRotate && ((r - 1) % 2 === 1)) ? Math.PI : 0;
          drawTile(pctx, borderSource, r, 0, tw, th, -Math.PI / 2 + flip);
          drawTile(pctx, borderSource, r, cols - 1, tw, th, Math.PI / 2 + flip);
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
      if (dst[i0] === next.r && dst[i0 + 1] === next.g && dst[i0 + 2] === next.b) return;
      const previousSnapshot = snapshotState();
      let painted = 0;
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

        if (dst[i] !== next.r || dst[i + 1] !== next.g || dst[i + 2] !== next.b) {
          dst[i] = next.r;
          dst[i + 1] = next.g;
          dst[i + 2] = next.b;
          dst[i + 3] = da;
          painted += 1;
        }

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

      if (!painted) return;
      commitMutation(previousSnapshot);
      renderEdit();
      drawPattern();
      updateHistoryButtons();
    }

    editCanvas.addEventListener('click', (ev) => {
      const rect = editCanvas.getBoundingClientRect();
      const x = (ev.clientX - rect.left) * (editCanvas.width / rect.width);
      const y = (ev.clientY - rect.top) * (editCanvas.height / rect.height);
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
      const idClass = c.id.length > 6 ? 'long' : '';
      b.innerHTML = `<span class="${idClass}">${c.id}</span>`;
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
        if (cenefaOuterEditor && cenefaOuterEditor.source) {
          cenefaOuterEditor.current = cloneImageData(cenefaOuterEditor.source);
          cenefaOuterEditor.ctx.putImageData(cenefaOuterEditor.current, 0, 0);
          cenefaOuterEditedCanvas = null;
        }
        if (esquinaOuterEditor && esquinaOuterEditor.source) {
          esquinaOuterEditor.current = cloneImageData(esquinaOuterEditor.source);
          esquinaOuterEditor.ctx.putImageData(esquinaOuterEditor.current, 0, 0);
          esquinaOuterEditedCanvas = null;
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
        const exportScale = 2;
        reportCanvas.width = tpl.page.canvasWidth * exportScale;
        reportCanvas.height = tpl.page.canvasHeight * exportScale;
        const rctx = reportCanvas.getContext('2d');
        rctx.setTransform(exportScale, 0, 0, exportScale, 0, 0);

        rctx.fillStyle = '#ffffff';
        rctx.fillRect(0, 0, tpl.page.canvasWidth, tpl.page.canvasHeight);

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

        let exportPatternCanvas = patternCanvas;
        const patternW0 = patternCanvas.width;
        const patternH0 = patternCanvas.height;
        try {
          if (typeof drawPattern === 'function' && patternW0 > 0 && patternH0 > 0) {
            patternCanvas.width = patternW0 * 2;
            patternCanvas.height = patternH0 * 2;
            drawPattern();
            exportPatternCanvas = document.createElement('canvas');
            exportPatternCanvas.width = patternCanvas.width;
            exportPatternCanvas.height = patternCanvas.height;
            exportPatternCanvas.getContext('2d').drawImage(patternCanvas, 0, 0);
            patternCanvas.width = patternW0;
            patternCanvas.height = patternH0;
            drawPattern();
          }
        } catch (e) {
          patternCanvas.width = patternW0;
          patternCanvas.height = patternH0;
          if (typeof drawPattern === 'function') drawPattern();
          exportPatternCanvas = patternCanvas;
        }

        rctx.imageSmoothingEnabled = true;
        rctx.drawImage(exportPatternCanvas, tpl.pattern.x, tpl.pattern.y, tpl.pattern.width, tpl.pattern.height);

        const selectedIds = getUsedColorIdsFromDiff();
        const hasChanges = selectedIds.length > 0;
        const byId = new Map(colors.map((c) => [c.id, c]));

        function modelNameBySrc(imageSrc, fallbackLabel) {
          if (!imageSrc) return fallbackLabel;
          const found = models.find((m) => (m.imagen || '') === imageSrc);
          return found && found.nombre ? found.nombre : fallbackLabel;
        }

        function thumbCanvasFromEditor(editorState, size = 600) {
          if (!editorState || !editorState.current) return null;
          const c = document.createElement('canvas');
          c.width = size;
          c.height = size;
          const cx = c.getContext('2d');
          const srcCanvas = document.createElement('canvas');
          srcCanvas.width = editorState.current.width;
          srcCanvas.height = editorState.current.height;
          srcCanvas.getContext('2d').putImageData(editorState.current, 0, 0);
          drawImageCover(cx, srcCanvas, c.width, c.height);
          return c;
        }

        async function thumbCanvasFromSrc(imageSrc, fallbackCanvas) {
          if (fallbackCanvas) return fallbackCanvas;
          const img = await loadImageSafe(imageSrc);
          if (!img) return null;
          const c = document.createElement('canvas');
          c.width = 600;
          c.height = 600;
          const cx = c.getContext('2d');
          drawImageCover(cx, img, c.width, c.height);
          return c;
        }

        const modelThumbs = [];
        const cCanvas = q('extraCenefaPreview canvas');
        const eCanvas = q('extraCornerPreview canvas');
        const coCanvas = q('extraCenefaOuterPreview canvas');
        const eoCanvas = q('extraCornerOuterPreview canvas');

        const mainLabel = selectedModelNameEl && selectedModelNameEl.textContent
          ? selectedModelNameEl.textContent.trim()
          : modelName;
        if (src) {
          const mainCanvas = thumbCanvasFromEditor({ current: currentImageData }, 600) || await thumbCanvasFromSrc(src, editCanvas || null);
          if (mainCanvas) modelThumbs.push({ key: src, label: mainLabel || (editTarget || category || 'Modelo').toUpperCase(), canvas: mainCanvas });
        }
        if (!centerSrc && (cenefaSrc || esquinaSrc || cenefaOuterSrc || esquinaOuterSrc) && currentImageData && hasCenterPaintEdits()) {
          const centerSolidCanvas = thumbCanvasFromEditor({ current: currentImageData }, 600);
          if (centerSolidCanvas) {
            const primaryColor = selectedIds.length ? byId.get(selectedIds[0]) : null;
            const centerLabel = primaryColor
              ? `${lang === 'en' ? 'Solid center' : 'Centro liso'}: ${primaryColor.name || primaryColor.id}`
              : (lang === 'en' ? 'Solid center' : 'Centro liso');
            modelThumbs.push({ key: 'center-solid', label: centerLabel, canvas: centerSolidCanvas });
          }
        }
        if (centerSrc && centerSrc !== src) {
          const centerCanvas = await thumbCanvasFromSrc(centerSrc, null);
          if (centerCanvas) modelThumbs.push({ key: centerSrc, label: modelNameBySrc(centerSrc, 'Centro'), canvas: centerCanvas });
        }
        if (cenefaSrc && cenefaSrc !== src) {
          const cenefaCanvas = thumbCanvasFromEditor(cenefaEditor, 600) || await thumbCanvasFromSrc(cenefaSrc, cCanvas || null);
          if (cenefaCanvas) modelThumbs.push({ key: cenefaSrc, label: modelNameBySrc(cenefaSrc, 'Cenefa'), canvas: cenefaCanvas });
        }
        if (esquinaSrc && esquinaSrc !== src) {
          const esquinaCanvas = thumbCanvasFromEditor(esquinaEditor, 600) || await thumbCanvasFromSrc(esquinaSrc, eCanvas || null);
          if (esquinaCanvas) modelThumbs.push({ key: esquinaSrc, label: modelNameBySrc(esquinaSrc, 'Esquina'), canvas: esquinaCanvas });
        }
        if (cenefaOuterSrc && cenefaOuterSrc !== src) {
          const cenefaOuterCanvas = thumbCanvasFromEditor(cenefaOuterEditor, 600) || await thumbCanvasFromSrc(cenefaOuterSrc, coCanvas || null);
          if (cenefaOuterCanvas) modelThumbs.push({ key: cenefaOuterSrc, label: modelNameBySrc(cenefaOuterSrc, lang === 'en' ? 'Outer border' : 'Cenefa exterior'), canvas: cenefaOuterCanvas });
        }
        if (esquinaOuterSrc && esquinaOuterSrc !== src) {
          const esquinaOuterCanvas = thumbCanvasFromEditor(esquinaOuterEditor, 600) || await thumbCanvasFromSrc(esquinaOuterSrc, eoCanvas || null);
          if (esquinaOuterCanvas) modelThumbs.push({ key: esquinaOuterSrc, label: modelNameBySrc(esquinaOuterSrc, lang === 'en' ? 'Outer corner' : 'Esquina exterior'), canvas: esquinaOuterCanvas });
        }

        const seen = new Set();
        const dedupThumbs = modelThumbs.filter((entry) => {
          const k = entry.key || entry.label;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        const sectionY = tpl.pattern.y + tpl.pattern.height + 48;
        const leftX = 70;
        const rightX = 680;

        rctx.fillStyle = '#111';
        rctx.font = '700 28px Arial';
        rctx.fillText(lang === 'en' ? 'Used models' : 'Modelos usados', leftX, sectionY);
        rctx.fillText(tpl.colorsTitle.text, rightX, sectionY);

        if (dedupThumbs.length) {
          const thumbW = 120;
          const thumbH = 120;
          const perRow = 2;
          const gapX = 170;
          const gapY = 48;
          rctx.font = '18px Arial';
          dedupThumbs.forEach((entry, idx) => {
            const col = idx % perRow;
            const row = Math.floor(idx / perRow);
            const x = leftX + col * gapX;
            const y = sectionY + 24 + row * (thumbH + gapY);
            rctx.strokeStyle = '#bbb';
            rctx.strokeRect(x, y, thumbW, thumbH);
            rctx.drawImage(entry.canvas, x, y, thumbW, thumbH);
            rctx.fillStyle = '#222';
            const label = String(entry.label || '').slice(0, 22);
            rctx.fillText(label, x, y + thumbH + 24);
          });
        }

        rctx.font = '20px Arial';
        selectedIds.forEach((id, idx) => {
          const item = byId.get(id);
          if (!item) return;
          const col = idx % 1;
          const row = Math.floor(idx / 1);
          const x = rightX + col * 420;
          const y = sectionY + 48 + row * 42;
          rctx.fillStyle = item.hex;
          rctx.fillRect(x, y - 16, 28, 28);
          rctx.strokeStyle = '#333';
          rctx.strokeRect(x, y - 16, 28, 28);
          rctx.fillStyle = '#222';
          rctx.fillText(`${item.id} · ${item.name} (${item.hex})`, x + 40, y + 4);
        });

        const jpg = reportCanvas.toDataURL('image/jpeg', 0.98);
        const blob = buildPdfFromJpeg(jpg, tpl.page.widthPt, tpl.page.heightPt, reportCanvas.width, reportCanvas.height);
        const status = hasChanges ? (lang === 'en' ? 'customized' : 'personalizado') : (lang === 'en' ? 'original' : 'sin_cambios');
        const isTapeteFlow = searchMode === 'tapete';
        const nameParts = dedupThumbs.map((d) => (d.label || '').replace(/[^a-z0-9\-_]+/gi, '_').replace(/^_+|_+$/g, '')).filter(Boolean);
        const baseRaw = isTapeteFlow
          ? `${modelName}`
          : (nameParts.slice(0, 3).join('_') || modelName || 'modelo');
        const safeName = String(baseRaw).replace(/[^a-z0-9\-_]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 90) || 'modelo';
        const fileName = `${safeName}_${status}.pdf`;

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
      return loadImageWithFallback(imageSrc);
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

      function getEditor() {
        if (type === 'cenefa') return cenefaEditor;
        if (type === 'esquina') return esquinaEditor;
        if (type === 'cenefa_outer') return cenefaOuterEditor;
        return esquinaOuterEditor;
      }

      function renderSquare() {
        const editorState = getEditor();
        if (!editorState || !editorState.current) return;
        cx.putImageData(editorState.current, 0, 0);
      }

      function floodFillSquare(x, y) {
        const editorState = getEditor();
        if (!selected || !editorState || !editorState.source || !editorState.current) return;
        const sourceData = editorState.source;
        const currentData = editorState.current;
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
        if (dst[i0] === next.r && dst[i0 + 1] === next.g && dst[i0 + 2] === next.b) return;
        const previousSnapshot = snapshotState();
        let painted = 0;
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

          if (dst[i] !== next.r || dst[i + 1] !== next.g || dst[i + 2] !== next.b) {
            dst[i] = next.r;
            dst[i + 1] = next.g;
            dst[i + 2] = next.b;
            dst[i + 3] = da;
            painted += 1;
          }

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
        if (!painted) return;
        editorState.current = currentData;
        commitMutation(previousSnapshot);
        renderSquare();

        const syncCanvas = document.createElement('canvas');
        syncCanvas.width = 300;
        syncCanvas.height = 300;
        const sctx2 = syncCanvas.getContext('2d');
        sctx2.putImageData(currentData, 0, 0);
        if (type === 'cenefa') { cenefaEditedCanvas = syncCanvas; }
        if (type === 'esquina') { esquinaEditedCanvas = syncCanvas; }
        if (type === 'cenefa_outer') { cenefaOuterEditedCanvas = syncCanvas; }
        if (type === 'esquina_outer') { esquinaOuterEditedCanvas = syncCanvas; }
        drawPattern();
      }

      loadImageSafe(imageSrc).then(async (img) => {
        if (!img) return;
        drawImageCover(cx, img, 300, 300);
        const sourceData = cx.getImageData(0, 0, 300, 300);
        let currentData = new ImageData(new Uint8ClampedArray(sourceData.data), sourceData.width, sourceData.height);
        const draft = getDraftForSrc(imageSrc);
        if (draft) {
          const restored = await draftToImageData(draft, 300, 300);
          if (restored) currentData = restored;
        }
        if (type === 'cenefa') cenefaEditor = { canvas: c, ctx: cx, source: cloneImageData(sourceData), current: cloneImageData(currentData) };
        if (type === 'esquina') esquinaEditor = { canvas: c, ctx: cx, source: cloneImageData(sourceData), current: cloneImageData(currentData) };
        if (type === 'cenefa_outer') cenefaOuterEditor = { canvas: c, ctx: cx, source: cloneImageData(sourceData), current: cloneImageData(currentData) };
        if (type === 'esquina_outer') esquinaOuterEditor = { canvas: c, ctx: cx, source: cloneImageData(sourceData), current: cloneImageData(currentData) };
        renderSquare();
        c.addEventListener('click', (ev) => {
          const rect = c.getBoundingClientRect();
          const x = ((ev.clientX - rect.left) / rect.width) * c.width;
          const y = ((ev.clientY - rect.top) / rect.height) * c.height;
          floodFillSquare(x, y);
        });
      });
    }

    Promise.all([loadImageSafe(centerSrc), loadImageSafe(cenefaSrc), loadImageSafe(esquinaSrc), loadImageSafe(cenefaOuterSrc), loadImageSafe(esquinaOuterSrc)]).then((loaded) => {
      [centerImg, cenefaImg, esquinaImg, cenefaOuterImg, esquinaOuterImg] = loaded;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        drawImageCover(sctx, img, 600, 600);
        sourceImageData = sctx.getImageData(0, 0, 600, 600);
        currentImageData = new ImageData(new Uint8ClampedArray(sourceImageData.data), sourceImageData.width, sourceImageData.height);
        const mainDraft = getDraftForSrc(src);
        if (mainDraft) {
          draftToImageData(mainDraft, 600, 600).then((restored) => {
            if (restored) {
              currentImageData = restored;
            }
            renderEdit();
            drawPattern();
            updateHistoryButtons();
          });
        } else {
          renderEdit();
          drawPattern();
          updateHistoryButtons();
        }
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
      if (src) {
        const candidates = buildImageCandidates(src);
        img.src = candidates[0] || '';
      }
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
      renderStaticSquare('extraCenefaOuterPreview', cenefaOuterSrc, 'cenefa_outer');
      renderStaticSquare('extraCornerOuterPreview', esquinaOuterSrc, 'esquina_outer');
    });
  }


  function initTapetesPage() {
    const canvases = document.querySelectorAll('.tapete-preview-canvas');
    if (!canvases.length) return;

    function loadImageSafeTapete(src) {
      return loadImageWithFallback(src);
    }

    function drawTile(ctx, source, row, col, tileW, tileH, angle) {
      if (!source) return;
      const x = col * tileW;
      const y = row * tileH;
      const bleed = 1.35;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(x + tileW / 2, y + tileH / 2);
      ctx.rotate(angle || 0);
      ctx.drawImage(source, -(tileW / 2 + bleed), -(tileH / 2 + bleed), tileW + bleed * 2, tileH + bleed * 2);
      ctx.restore();
    }

    function asTileSource(source, size = 512) {
      if (!source) return null;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const cx = c.getContext('2d');
      const sw = source.naturalWidth || source.width || size;
      const sh = source.naturalHeight || source.height || size;
      const scale = Math.max(size / sw, size / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = (size - dw) / 2;
      const dy = (size - dh) / 2;
      cx.clearRect(0, 0, size, size);
      cx.drawImage(source, dx, dy, dw, dh);
      return c;
    }

    canvases.forEach(async (canvas) => {
      const pctx = canvas.getContext('2d');
      const centerSrc = normalizeAssetSrc(canvas.dataset.centerImage || '');
      const cenefaSrc = normalizeAssetSrc(canvas.dataset.cenefaImage || '');
      const esquinaSrc = normalizeAssetSrc(canvas.dataset.esquinaImage || '');
      const cenefaOuterSrc = normalizeAssetSrc(canvas.dataset.cenefaOuterImage || '');
      const esquinaOuterSrc = normalizeAssetSrc(canvas.dataset.esquinaOuterImage || '');
      const cenefaAltRotate = String(canvas.dataset.cenefaAltRotate || '').trim() === '1';

      const [centerRaw, cenefaRaw, esquinaRaw, cenefaOuterRaw, esquinaOuterRaw] = await Promise.all([
        loadImageSafeTapete(centerSrc),
        loadImageSafeTapete(cenefaSrc),
        loadImageSafeTapete(esquinaSrc),
        loadImageSafeTapete(cenefaOuterSrc),
        loadImageSafeTapete(esquinaOuterSrc),
      ]);
      const centerImg = asTileSource(centerRaw);
      const cenefaImg = asTileSource(cenefaRaw);
      const esquinaImg = asTileSource(esquinaRaw);
      const cenefaOuterImg = asTileSource(cenefaOuterRaw);
      const esquinaOuterImg = asTileSource(esquinaOuterRaw);

      const hasOuter = Boolean(cenefaOuterImg || esquinaOuterImg);
      const cols = 12;
      const rows = 8;
      const tw = canvas.width / cols;
      const th = canvas.height / rows;
      pctx.fillStyle = '#fff';
      pctx.fillRect(0, 0, canvas.width, canvas.height);

      function drawBorderRing(ring, borderSource, cornerSrc, alternate180 = false) {
        if (!borderSource && !cornerSrc) return;
        const left = ring;
        const right = cols - 1 - ring;
        const top = ring;
        const bottom = rows - 1 - ring;
        for (let c = left + 1; c < right; c++) {
          if (borderSource) {
            const idx = c - (left + 1);
            const flip = (alternate180 && (idx % 2 === 1)) ? Math.PI : 0;
            drawTile(pctx, borderSource, top, c, tw, th, 0 + flip);
            drawTile(pctx, borderSource, bottom, c, tw, th, Math.PI + flip);
          }
        }
        for (let r = top + 1; r < bottom; r++) {
          if (borderSource) {
            const idx = r - (top + 1);
            const flip = (alternate180 && (idx % 2 === 1)) ? Math.PI : 0;
            drawTile(pctx, borderSource, r, left, tw, th, -Math.PI / 2 + flip);
            drawTile(pctx, borderSource, r, right, tw, th, Math.PI / 2 + flip);
          }
        }
        const corner = cornerSrc || borderSource;
        if (corner) {
          drawTile(pctx, corner, top, left, tw, th, 0);
          drawTile(pctx, corner, top, right, tw, th, Math.PI / 2);
          drawTile(pctx, corner, bottom, right, tw, th, Math.PI);
          drawTile(pctx, corner, bottom, left, tw, th, -Math.PI / 2);
        }
      }

      const centerMap = [[0, Math.PI / 2], [3 * Math.PI / 2, Math.PI]];
      drawBorderRing(0, cenefaOuterImg, esquinaOuterImg, false);
      drawBorderRing(hasOuter ? 1 : 0, cenefaImg, esquinaImg, cenefaAltRotate);
      const ringCount = hasOuter ? 2 : 1;
      if (centerImg) {
        for (let r = ringCount; r < rows - ringCount; r++) {
          for (let c = ringCount; c < cols - ringCount; c++) {
            drawTile(pctx, centerImg, r, c, tw, th, centerMap[(r - ringCount) % 2][(c - ringCount) % 2]);
          }
        }
      }
    });
  }

  function initDecoratedOverlay() {
    const overlay = q('modelOverlay');
    const patternCanvas = q('modelOverlayPattern');
    const nameEl = q('modelOverlayName');
    const compareOverlay = q('modelCompareOverlay');
    const patternCanvasA = q('modelOverlayPatternA');
    const patternCanvasB = q('modelOverlayPatternB');
    const patternCanvasC = q('modelOverlayPatternC');
    const patternCanvasD = q('modelOverlayPatternD');
    const nameElA = q('modelOverlayNameA');
    const nameElB = q('modelOverlayNameB');
    const nameElC = q('modelOverlayNameC');
    const nameElD = q('modelOverlayNameD');
    const compareSlots = Array.from(document.querySelectorAll('.compare-slot'));
    const compareToggleBtn = q('compareModelsBtn');
    const compareModeNotice = q('compareModeNotice');
    if (!overlay || !patternCanvas || !nameEl) return;
    const lang = getLang();

    const pctx = patternCanvas.getContext('2d');
    const pctxA = patternCanvasA ? patternCanvasA.getContext('2d') : null;
    const pctxB = patternCanvasB ? patternCanvasB.getContext('2d') : null;
    let closeTimer = null;
    let compareCloseTimer = null;
    let compareMode = false;
    let comparePicked = [];
    const compareRequired = 2;

    function isMobileCompareMode() {
      return window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    }

    function compareModeMessage() {
      if (lang === 'en') return 'Compare mode is on: select 2 models to view them side by side, or press the button again to exit.';
      return 'Modo comparación activado: selecciona 2 modelos para verlos lado a lado, o presiona el botón nuevamente para salir.';
    }

    function blockedConnectedMessage() {
      return lang === 'en'
        ? 'You cannot compare connected models (for example, border/corner/exterior from the same set). Choose a model from a different set.'
        : 'No puedes comparar modelos conectados (por ejemplo, cenefa/esquina/exterior del mismo juego). Elige un modelo de otro juego.';
    }

    function syncCompareCountUI() {
      // Comparación fija en 2 modelos.
    }

    function setCompareMode(enabled) {
      compareMode = Boolean(enabled && compareToggleBtn && compareOverlay && patternCanvasA && patternCanvasB && nameElA && nameElB);
      if (compareToggleBtn) {
        compareToggleBtn.classList.toggle('active', compareMode);
        compareToggleBtn.setAttribute('aria-pressed', compareMode ? 'true' : 'false');
      }
      syncCompareCountUI();
      if (compareModeNotice) {
        compareModeNotice.hidden = !compareMode;
        if (compareMode) compareModeNotice.textContent = compareModeMessage();
      }
      if (!compareMode) clearCompareSelection();
    }

    function clearCompareSelection() {
      comparePicked = [];
      document.querySelectorAll('.mosaic-preview-trigger.compare-picked').forEach((node) => node.classList.remove('compare-picked'));
      closeCompare();
    }

    function ensureCanvasSizeFor(canvas, minW = 800, minH = 560) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const targetW = Math.max(minW, Math.round((rect.width || 1200) * dpr));
      const targetH = Math.max(minH, Math.round((rect.height || 900) * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    }

    function ensureCanvasSize() {
      ensureCanvasSizeFor(patternCanvas, 800, 600);
    }

    function ensureCompareCanvasSize() {
      ensureCanvasSizeFor(patternCanvasA, 560, 420);
      ensureCanvasSizeFor(patternCanvasB, 560, 420);
      ensureCanvasSizeFor(patternCanvasC, 560, 420);
      ensureCanvasSizeFor(patternCanvasD, 560, 420);
    }

    function drawRotatedPatternOn(ctx, canvas, img) {
      if (!img || !ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

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
          ctx.save();
          ctx.translate(x * tileW + tileW / 2, y * tileH + tileH / 2);
          ctx.rotate(angle);
          ctx.drawImage(tileSource, -tileW / 2, -tileH / 2, tileW, tileH);
          ctx.restore();
        }
      }
    }

    function drawBorderPatternOn(ctx, canvas, cenefaImg, esquinaImg, cenefaOuterImg, esquinaOuterImg, cenefaAltRotate = false, cenefaOuterAltRotate = false) {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const hasOuter = Boolean(cenefaOuterImg || esquinaOuterImg);
      const cols = hasOuter ? 12 : 8;
      const rows = hasOuter ? 9 : 6;
      const tw = w / cols;
      const th = h / rows;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);

      function d(src, r, c, angle) {
        if (!src) return;
        const bleed = 1.35;
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(c * tw + tw / 2, r * th + th / 2);
        ctx.rotate(angle || 0);
        ctx.drawImage(src, -(tw / 2 + bleed), -(th / 2 + bleed), tw + bleed * 2, th + bleed * 2);
        ctx.restore();
      }

      function drawRing(ring, border, corner, alternate180 = false) {
        const left = ring; const right = cols - 1 - ring; const top = ring; const bottom = rows - 1 - ring;
        for (let c = left + 1; c < right; c++) {
          const idx = c - (left + 1);
          const flip = (alternate180 && (idx % 2 === 1)) ? Math.PI : 0;
          d(border, top, c, 0 + flip);
          d(border, bottom, c, Math.PI + flip);
        }
        for (let r = top + 1; r < bottom; r++) {
          const idx = r - (top + 1);
          const flip = (alternate180 && (idx % 2 === 1)) ? Math.PI : 0;
          d(border, r, left, -Math.PI / 2 + flip);
          d(border, r, right, Math.PI / 2 + flip);
        }
        const cc = corner || border;
        d(cc, top, left, 0);
        d(cc, top, right, Math.PI / 2);
        d(cc, bottom, right, Math.PI);
        d(cc, bottom, left, -Math.PI / 2);
      }

      const normalize = (source) => {
        if (!source) return null;
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = true;
        const sw = source.naturalWidth || source.width || 512;
        const sh = source.naturalHeight || source.height || 512;
        const scale = Math.max(512 / sw, 512 / sh);
        const dw = sw * scale;
        const dh = sh * scale;
        const dx = (512 - dw) / 2;
        const dy = (512 - dh) / 2;
        cx.clearRect(0, 0, 512, 512);
        cx.drawImage(source, dx, dy, dw, dh);
        return c;
      };
      const nC = normalize(cenefaImg);
      const nE = normalize(esquinaImg);
      const nCO = normalize(cenefaOuterImg);
      const nEO = normalize(esquinaOuterImg);

      if (hasOuter) drawRing(0, nCO, nEO, cenefaOuterAltRotate);
      drawRing(hasOuter ? 1 : 0, nC, nE, cenefaAltRotate);
    }

    function loadImageSafeOverlay(src) {
      return loadImageWithFallback(src, { cacheBust: true });
    }

    function buildOverlayLabel(modelName) {
      const prefix = lang === 'en' ? 'Model:' : 'Modelo:';
      const safeName = String(modelName || (lang === 'en' ? 'Model' : 'Modelo')).trim();
      return `${prefix} ${safeName}`;
    }

    function payloadFromImg(img) {
      return {
        src: img.getAttribute('src') || '',
        modelName: img.dataset.overlayModelName || img.dataset.modelName || img.alt || (lang === 'en' ? 'Model' : 'Modelo'),
        category: (img.dataset.category || '').toLowerCase(),
        cenefaSrc: img.dataset.cenefaSrc || '',
        esquinaSrc: img.dataset.esquinaSrc || '',
        cenefaOuterSrc: img.dataset.cenefaOuterSrc || '',
        esquinaOuterSrc: img.dataset.esquinaOuterSrc || '',
        cenefaAltRotate: String(img.dataset.cenefaAltRotate || '').trim() === '1',
        cenefaOuterAltRotate: String(img.dataset.cenefaOuterAltRotate || '').trim() === '1',
      };
    }

    async function renderOverlayPayload(ctx, canvas, payload) {
      if (!ctx || !canvas || !payload) return;
      const { src, category, cenefaSrc, esquinaSrc, cenefaOuterSrc, esquinaOuterSrc, cenefaAltRotate, cenefaOuterAltRotate } = payload;
      if (['cenefa', 'esquina', 'cenefa_exterior', 'esquina_exterior'].includes(category)) {
        const [cenefaImg, esquinaImg, cenefaOuterImg, esquinaOuterImg] = await Promise.all([
          loadImageSafeOverlay(cenefaSrc || (category === 'cenefa' ? src : '')),
          loadImageSafeOverlay(esquinaSrc || (category === 'esquina' ? src : '')),
          loadImageSafeOverlay(cenefaOuterSrc || (category === 'cenefa_exterior' ? src : '')),
          loadImageSafeOverlay(esquinaOuterSrc || (category === 'esquina_exterior' ? src : '')),
        ]);
        drawBorderPatternOn(ctx, canvas, cenefaImg, esquinaImg, cenefaOuterImg, esquinaOuterImg, cenefaAltRotate, cenefaOuterAltRotate);
      } else {
        const img = await loadImageSafeOverlay(src);
        if (img) drawRotatedPatternOn(ctx, canvas, img);
      }
    }

    const open = async (payload) => {
      clearTimeout(closeTimer);
      ensureCanvasSize();
      await renderOverlayPayload(pctx, patternCanvas, payload);
      nameEl.textContent = buildOverlayLabel(payload.modelName);
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
        if (!compareOverlay || compareOverlay.getAttribute('aria-hidden') !== 'false') document.body.style.overflow = '';
      }, 280);
    };

    const openCompare = async () => {
      const canvases = [patternCanvasA, patternCanvasB, patternCanvasC, patternCanvasD];
      const ctxs = [pctxA, pctxB, patternCanvasC ? patternCanvasC.getContext('2d') : null, patternCanvasD ? patternCanvasD.getContext('2d') : null];
      const labels = [nameElA, nameElB, nameElC, nameElD];
      if (!compareOverlay || comparePicked.length < compareRequired) return;
      clearTimeout(compareCloseTimer);
      ensureCompareCanvasSize();

      const selected = comparePicked.slice(0, compareRequired);
      const payloads = selected.map((img) => payloadFromImg(img));

      const tasks = payloads.map((payload, idx) => renderOverlayPayload(ctxs[idx], canvases[idx], payload));
      await Promise.all(tasks);

      payloads.forEach((payload, idx) => {
        if (labels[idx]) labels[idx].textContent = buildOverlayLabel(payload.modelName);
      });

      compareSlots.forEach((slot, idx) => {
        if (!slot) return;
        slot.hidden = idx >= compareRequired;
      });

      compareOverlay.classList.remove('closing');
      compareOverlay.classList.add('open');
      compareOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeCompare = () => {
      if (!compareOverlay) return;
      compareOverlay.classList.remove('open');
      compareOverlay.classList.add('closing');
      compareCloseTimer = setTimeout(() => {
        compareOverlay.classList.remove('closing');
        compareOverlay.setAttribute('aria-hidden', 'true');
        if (!overlay || overlay.getAttribute('aria-hidden') !== 'false') document.body.style.overflow = '';
      }, 280);
    };

    document.querySelectorAll('.mosaic-preview-trigger').forEach((img) => {
      img.addEventListener('click', (ev) => {
        if (compareMode) {
          ev.preventDefault();
          if (comparePicked.includes(img)) {
            comparePicked = comparePicked.filter((n) => n !== img);
            img.classList.remove('compare-picked');
            closeCompare();
            if (compareModeNotice) compareModeNotice.textContent = compareModeMessage();
            return;
          }

          const candidateGroup = String(img.dataset.compareGroup || '').trim();
          const hasConnected = Boolean(candidateGroup) && comparePicked.some((picked) => String(picked.dataset.compareGroup || '').trim() === candidateGroup);
          if (hasConnected) {
            if (compareModeNotice) {
              compareModeNotice.hidden = false;
              compareModeNotice.textContent = blockedConnectedMessage();
            }
            return;
          }

          if (comparePicked.length >= compareRequired) {
            const shifted = comparePicked.shift();
            if (shifted) shifted.classList.remove('compare-picked');
          }
          comparePicked.push(img);
          img.classList.add('compare-picked');
          if (compareModeNotice) compareModeNotice.textContent = compareModeMessage();
          if (comparePicked.length === compareRequired) openCompare();
          return;
        }

        open(payloadFromImg(img));
      });
    });

    if (compareToggleBtn) {
      compareToggleBtn.addEventListener('click', () => {
        const next = !compareMode;
        setCompareMode(next);
      });
    }
    window.addEventListener('resize', () => {
      if (!compareMode) return;
      syncCompareCountUI();
      if (compareModeNotice) compareModeNotice.textContent = compareModeMessage();
      if (comparePicked.length >= compareRequired) openCompare();
      else closeCompare();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target.closest('[data-overlay-close="true"]')) close();
    });

    if (compareOverlay) {
      compareOverlay.addEventListener('click', (e) => {
        if (e.target.closest('[data-compare-overlay-close="true"]')) closeCompare();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
      if (e.key === 'Escape' && compareOverlay && compareOverlay.classList.contains('open')) closeCompare();
    });
  }



  function initQuoteValidation() {
    const forms = document.querySelectorAll('.quote-form');
    if (!forms.length) return;
    const lang = getLang();

    forms.forEach((form) => {
      const emailInput = form.querySelector('input[type="email"]');
      const phoneInput = form.querySelector('input[name="telefono"]');
      if (phoneInput) {
        phoneInput.setAttribute('required', 'required');
        phoneInput.setAttribute('minlength', '8');
      }

      form.addEventListener('submit', (e) => {
        let valid = true;

        if (emailInput && !emailInput.checkValidity()) {
          valid = false;
          emailInput.reportValidity();
        }

        if (phoneInput) {
          const digits = (phoneInput.value || '').replace(/\D/g, '');
          if (digits.length < 8) {
            valid = false;
            const msg = lang === 'en'
              ? 'Please enter at least 8 digits in the phone number.'
              : 'Por favor ingrese al menos 8 dígitos en el teléfono.';
            phoneInput.setCustomValidity(msg);
            phoneInput.reportValidity();
          } else {
            phoneInput.setCustomValidity('');
          }
        }

        if (!valid) e.preventDefault();
      });

      if (phoneInput) {
        phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));
      }
    });
  }


  function initGalleryPage() {
    const overlay = q('galleryOverlay');
    const imgEl = q('galleryOverlayImg');
    const titleEl = q('galleryOverlayTitle');
    const captionEl = q('galleryOverlayCaption');
    const cardEl = overlay ? overlay.querySelector('.gallery-overlay-card') : null;
    if (!overlay || !imgEl || !titleEl || !captionEl || !cardEl) return;

    function updateOverlayCardSize() {
      if (!overlay.classList.contains('open')) return;
      const nw = imgEl.naturalWidth || 0;
      const nh = imgEl.naturalHeight || 0;
      if (!nw || !nh) {
        cardEl.style.width = '';
        cardEl.style.height = '';
        return;
      }

      const footerHeight = 78;
      const maxW = Math.max(320, Math.floor(window.innerWidth * 0.96));
      const maxImageH = Math.max(220, Math.floor(window.innerHeight * 0.86) - footerHeight);
      const scale = Math.min(maxW / nw, maxImageH / nh, 1);
      const targetW = Math.max(260, Math.floor(nw * scale));
      const targetH = Math.max(180, Math.floor((nh * scale) + footerHeight));

      cardEl.style.width = `${targetW}px`;
      cardEl.style.height = `${targetH}px`;
    }

    imgEl.addEventListener('load', updateOverlayCardSize);

    function openGallery(src, title, caption) {
      cardEl.style.width = '';
      cardEl.style.height = '';
      imgEl.src = src || '';
      imgEl.alt = title || 'Imagen';
      titleEl.textContent = title || '';
      captionEl.textContent = caption || '';
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      updateOverlayCardSize();
    }

    function closeGallery() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => { imgEl.src = ''; }, 120);
    }

    document.querySelectorAll('.gallery-thumb-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        openGallery(btn.dataset.gallerySrc || '', btn.dataset.galleryTitle || '', btn.dataset.galleryCaption || '');
      });
    });

    overlay.addEventListener('click', (e) => {
      if (e.target.closest('[data-gallery-close="1"]')) closeGallery();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeGallery();
    });
    window.addEventListener('resize', updateOverlayCardSize);
  }

  function initEspecialesOverlay() {
    const cards = Array.from(document.querySelectorAll('.special-card img'));
    if (!cards.length) return;

    const host = document.createElement('div');
    host.className = 'special-overlay';
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML = `
      <button type="button" class="special-overlay-backdrop" data-special-overlay-close="1" aria-label="Cerrar"></button>
      <div class="special-overlay-card" role="dialog" aria-modal="true" aria-label="Vista previa de especial">
        <button type="button" class="special-overlay-close" data-special-overlay-close="1" aria-label="Cerrar">×</button>
        <canvas id="specialOverlayPattern" aria-label="Patrón de especial"></canvas>
        <div class="special-overlay-footer"><strong id="specialOverlayTitle"></strong></div>
      </div>
    `;
    document.body.appendChild(host);

    const compareHost = document.createElement('div');
    compareHost.className = 'special-overlay model-overlay-compare';
    compareHost.setAttribute('aria-hidden', 'true');
    compareHost.innerHTML = `
      <button type="button" class="special-overlay-backdrop" data-special-compare-close="1" aria-label="Cerrar"></button>
      <div class="model-overlay-compare-wrap" role="dialog" aria-modal="true" aria-label="Comparar modelos especiales">
        <button type="button" class="special-overlay-close" data-special-compare-close="1" aria-label="Cerrar">×</button>
        <div class="model-overlay-compare-grid">
          <article class="special-overlay-card compare-slot">
            <canvas class="special-compare-canvas" width="1200" height="900"></canvas>
            <div class="special-overlay-footer"><strong class="special-compare-title"></strong></div>
          </article>
          <article class="special-overlay-card compare-slot">
            <canvas class="special-compare-canvas" width="1200" height="900"></canvas>
            <div class="special-overlay-footer"><strong class="special-compare-title"></strong></div>
          </article>
        </div>
      </div>
    `;
    document.body.appendChild(compareHost);

    const patternCanvas = host.querySelector('#specialOverlayPattern');
    const titleEl = host.querySelector('#specialOverlayTitle');
    const overlayCard = host.querySelector('.special-overlay-card');
    const compareToggleBtn = q('compareSpecialsBtn');
    const compareNotice = q('compareSpecialsNotice');
    const compareSlots = Array.from(compareHost.querySelectorAll('.compare-slot'));
    const compareRequired = 2;
    let compareMode = false;
    let comparePicked = [];
    let originalSrc = '';
    let lastPattern = null;

    function compareModeMessage() {
      const lang = (document.documentElement.getAttribute('lang') || 'es').toLowerCase();
      return lang === 'en'
        ? 'Comparison mode enabled: choose 2 special models to view them side by side.'
        : 'Modo comparación activado: selecciona 2 modelos especiales para verlos lado a lado.';
    }

    function updateCompareUi() {
      if (compareToggleBtn) {
        compareToggleBtn.classList.toggle('active', compareMode);
        compareToggleBtn.setAttribute('aria-pressed', compareMode ? 'true' : 'false');
      }
      if (compareNotice) {
        compareNotice.hidden = !compareMode;
        if (compareMode) compareNotice.textContent = compareModeMessage();
      }
      if (!compareMode) {
        comparePicked = [];
        cards.forEach((img) => img.classList.remove('compare-picked'));
      }
    }

    function closeOverlay() {
      host.classList.remove('open');
      host.setAttribute('aria-hidden', 'true');
      if (!compareHost.classList.contains('open')) document.body.style.overflow = '';
    }

    function closeCompare() {
      compareHost.classList.remove('open');
      compareHost.setAttribute('aria-hidden', 'true');
      if (!host.classList.contains('open')) document.body.style.overflow = '';
    }

    function resolveSourceForOverlay(sourceImg) {
      const imgSrc = String(sourceImg.dataset.overlaySrc || sourceImg.currentSrc || sourceImg.src || '');
      const tmp = new Image();
      tmp.crossOrigin = 'anonymous';
      return new Promise((resolve) => {
        tmp.onload = () => resolve(tmp);
        tmp.onerror = () => resolve(sourceImg);
        tmp.src = imgSrc;
      });
    }

    function drawDirectOverlayImage(targetCanvas, targetCard, imageSource) {
      const setup = setupPatternCanvas(targetCanvas, targetCard);
      if (!setup) return;
      const { ctx, cssW, cssH } = setup;
      const iw = imageSource.naturalWidth || imageSource.width || 1;
      const ih = imageSource.naturalHeight || imageSource.height || 1;
      const scale = Math.min(cssW / iw, cssH / ih);
      const drawW = iw * scale;
      const drawH = ih * scale;
      const x = (cssW - drawW) / 2;
      const y = (cssH - drawH) / 2;
      ctx.drawImage(imageSource, x, y, drawW, drawH);
    }

    function extractSpecialTile(sourceImg) {
      return new Promise((resolve) => {
        const workerImg = new Image();
        workerImg.crossOrigin = 'anonymous';
        workerImg.onload = () => {
          try {
            const w = workerImg.naturalWidth || workerImg.width;
            const h = workerImg.naturalHeight || workerImg.height;
            if (!w || !h) return resolve(null);
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            const ctx = c.getContext('2d', { willReadFrequently: true });
            if (!ctx) return resolve(null);
            ctx.drawImage(workerImg, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);
            const d = imageData.data;
            let minX = w; let minY = h; let maxX = -1; let maxY = -1; let opaqueCount = 0;
            const threshold = 242;
            for (let i = 0; i < d.length; i += 4) {
              const r = d[i], g = d[i + 1], b = d[i + 2];
              const x = (i / 4) % w, y = Math.floor((i / 4) / w);
              const nearWhite = r >= threshold && g >= threshold && b >= threshold;
              if (nearWhite) d[i + 3] = 0;
              else if (d[i + 3] > 0) {
                opaqueCount += 1;
                if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
              }
            }
            if (!opaqueCount || maxX <= minX || maxY <= minY) return resolve(null);
            ctx.putImageData(imageData, 0, 0);
            const pad = Math.round(Math.max(w, h) * 0.03);
            const cropX = Math.max(0, minX - pad), cropY = Math.max(0, minY - pad);
            const cropW = Math.min(w - cropX, (maxX - minX + 1) + (pad * 2));
            const cropH = Math.min(h - cropY, (maxY - minY + 1) + (pad * 2));
            const out = document.createElement('canvas');
            out.width = cropW; out.height = cropH;
            const outCtx = out.getContext('2d');
            if (!outCtx) return resolve(null);
            outCtx.drawImage(c, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            resolve(out);
          } catch (_) { resolve(null); }
        };
        workerImg.onerror = () => resolve(null);
        workerImg.src = sourceImg.currentSrc || sourceImg.src || '';
      });
    }

    function setupPatternCanvas(targetCanvas, targetCard) {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cssW = Math.max(320, Math.floor(targetCanvas.clientWidth || targetCard.clientWidth));
      const cssH = Math.max(220, Math.floor(targetCanvas.clientHeight || (targetCard.clientHeight - 46)));
      targetCanvas.width = Math.floor(cssW * dpr);
      targetCanvas.height = Math.floor(cssH * dpr);
      targetCanvas.style.width = `${cssW}px`;
      targetCanvas.style.height = `${cssH}px`;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return null;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = '#ece9df';
      ctx.fillRect(0, 0, cssW, cssH);
      return { ctx, cssW, cssH };
    }

    function drawTileFit(ctx, tile, cx, cy, boxW, boxH, angle = 0) {
      const ratio = (tile.width > 0 && tile.height > 0) ? (tile.width / tile.height) : 1;
      let drawW = boxW;
      let drawH = drawW / ratio;
      if (drawH > boxH) { drawH = boxH; drawW = drawH * ratio; }
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.translate(cx, cy);
      if (angle) ctx.rotate(angle);
      ctx.drawImage(tile, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    function drawPolygonTilePreview(ctx, tile, cssW, cssH, sides, rotation = -Math.PI / 2, scale = 0.44) {
      const size = Math.min(cssW, cssH) * scale;
      const cx = cssW / 2;
      const cy = cssH / 2;

      if (!Number.isFinite(sides) || sides < 3) {
        drawTileFit(ctx, tile, cx, cy, cssW * 0.94, cssH * 0.94, 0);
        return;
      }

      function tracePath() {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const a = rotation + ((Math.PI * 2) * i / sides);
          const x = cx + Math.cos(a) * size;
          const y = cy + Math.sin(a) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }

      ctx.save();
      tracePath();
      ctx.clip();
      drawTileFit(ctx, tile, cx, cy, size * 2.05, size * 2.05, 0);
      ctx.restore();

      ctx.save();
      tracePath();
      ctx.lineWidth = Math.max(2, Math.min(cssW, cssH) * 0.01);
      ctx.strokeStyle = 'rgba(0,0,0,.28)';
      ctx.stroke();
      ctx.restore();
    }

    function drawPolygonTilePreview(ctx, tile, cssW, cssH, sides, rotation = -Math.PI / 2, scale = 0.44) {
      const size = Math.min(cssW, cssH) * scale;
      const cx = cssW / 2;
      const cy = cssH / 2;

      if (!Number.isFinite(sides) || sides < 3) {
        drawTileFit(ctx, tile, cx, cy, cssW * 0.94, cssH * 0.94, 0);
        return;
      }

      function tracePath() {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const a = rotation + ((Math.PI * 2) * i / sides);
          const x = cx + Math.cos(a) * size;
          const y = cy + Math.sin(a) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }

      ctx.save();
      tracePath();
      ctx.clip();
      drawTileFit(ctx, tile, cx, cy, size * 2.05, size * 2.05, 0);
      ctx.restore();

      ctx.save();
      tracePath();
      ctx.lineWidth = Math.max(2, Math.min(cssW, cssH) * 0.01);
      ctx.strokeStyle = 'rgba(0,0,0,.28)';
      ctx.stroke();
      ctx.restore();
    }

    function drawPolygonTilePreview(ctx, tile, cssW, cssH, sides, rotation = -Math.PI / 2, scale = 0.44) {
      const size = Math.min(cssW, cssH) * scale;
      const cx = cssW / 2;
      const cy = cssH / 2;

      if (!Number.isFinite(sides) || sides < 3) {
        drawTileFit(ctx, tile, cx, cy, cssW * 0.94, cssH * 0.94, 0);
        return;
      }

      function tracePath() {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const a = rotation + ((Math.PI * 2) * i / sides);
          const x = cx + Math.cos(a) * size;
          const y = cy + Math.sin(a) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }

      ctx.save();
      tracePath();
      ctx.clip();
      drawTileFit(ctx, tile, cx, cy, size * 2.05, size * 2.05, 0);
      ctx.restore();

      ctx.save();
      tracePath();
      ctx.lineWidth = Math.max(2, Math.min(cssW, cssH) * 0.01);
      ctx.strokeStyle = 'rgba(0,0,0,.28)';
      ctx.stroke();
      ctx.restore();
    }

    function renderByPatternType(targetCanvas, targetCard, tileCanvas, patternType, rotationSeed) {
      const setup = setupPatternCanvas(targetCanvas, targetCard);
      if (!setup) return;
      const { ctx, cssW, cssH } = setup;
      const type = String(patternType || '').toLowerCase();
      if (type === 'triangular') {
        const cols = Math.max(6, Math.round(cssW / 150));
        const tileW = cssW / cols;
        const tileRatio = (tileCanvas.width || 1) / Math.max(1, (tileCanvas.height || 1));
        const tileH = tileW / Math.max(0.45, tileRatio);
        const drawCols = Math.ceil((cssW + tileW * 3) / tileW);
        const drawRows = Math.ceil((cssH + tileH * 3) / tileH);
        for (let r = -2; r < drawRows; r++) {
          const rowOffset = (r % 2 === 0) ? 0 : (tileW / 2);
          for (let c = -2; c < drawCols; c++) {
            const cx = c * tileW + rowOffset + tileW / 2;
            const cy = r * tileH + tileH / 2;
            const angle = (r % 2 === 0) ? 0 : Math.PI;
            drawTileFit(ctx, tileCanvas, cx, cy, tileW * 1.01, tileH * 1.01, angle);
          }
        }
        return;
      }
      if (type === 'cantaro') {
        const cols = Math.max(5, Math.round(cssW / 170));
        const tileW = cssW / cols;
        const tileH = tileW * 0.94;
        const stepX = tileW * 0.76;
        const stepY = tileH * 0.78;
        const drawCols = Math.ceil((cssW + tileW * 2) / stepX);
        const drawRows = Math.ceil((cssH + tileH * 2) / stepY);
        for (let c = -2; c < drawCols; c++) {
          const shiftY = (c % 2 === 0) ? 0 : (stepY / 2);
          for (let r = -2; r < drawRows; r++) {
            drawTileFit(ctx, tileCanvas, c * stepX + tileW / 2, r * stepY + shiftY + tileH / 2, tileW * 1.02, tileH * 1.02, 0);
          }
        }
        return;
      }
      if (type === 'cuadrado' || type === 'octagonal') {
        const cols = Math.max(6, Math.round(cssW / 140));
        const size = cssW / cols;
        const rows = Math.ceil(cssH / size) + 1;
        const map = [[0, Math.PI / 2], [3 * Math.PI / 2, Math.PI]];
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          let angle = map[r % 2][c % 2];
          if (type === 'octagonal') angle += Math.PI / 4;
          drawTileFit(ctx, tileCanvas, (c + 0.5) * size, (r + 0.5) * size, size * 0.96, size * 0.96, angle);
        }
        return;
      }
      if (type === 'otros') {
        const count = 5;
        const tileW = Math.min(220, cssW / 5.5);
        const totalW = count * tileW;
        const startX = (cssW - totalW) / 2;
        const cy = cssH / 2;
        for (let i = 0; i < count; i++) drawTileFit(ctx, tileCanvas, startX + (i + 0.5) * tileW, cy, tileW * 0.95, tileW * 0.95, 0);
        return;
      }
      const cols = Math.max(5, Math.round(cssW / 130));
      const hexW = cssW / cols;
      const hexH = hexW / 0.8660254;
      const radius = hexH / 2;
      const dx = Math.sqrt(3) * radius;
      const dy = radius * 1.5;
      const rows = Math.ceil((cssH + hexH * 2) / dy);
      const colsDraw = Math.ceil((cssW + hexW * 2) / dx);
      const hasSeed = Number.isFinite(rotationSeed);
      const seedRad = hasSeed ? (rotationSeed * Math.PI / 180) : 0;
      const triadStep = Math.PI * 2 / 3;
      for (let row = -2; row < rows; row++) {
        for (let col = -2; col < colsDraw; col++) {
          const cx = col * dx + ((row & 1) ? dx / 2 : 0) + (hexW / 2);
          const cy = row * dy + radius;
          const colPhase = ((col % 3) + 3) % 3;
          const rowPhase = ((row % 2) + 2) % 2;
          const variant = rowPhase === 0 ? colPhase : ((colPhase + 2) % 3);
          const angle = hasSeed ? (seedRad + (variant * triadStep)) : 0;
          drawTileFit(ctx, tileCanvas, cx, cy, hexW * 1.03, hexH * 1.03, angle);
        }
      }
    }

    function rerenderLastPattern() {
      if (!lastPattern) return;
      renderByPatternType(patternCanvas, overlayCard, lastPattern.tileCanvas, lastPattern.patternType, lastPattern.rotationSeed);
    }

    async function openOverlay(sourceImg) {
      originalSrc = sourceImg.currentSrc || sourceImg.src || '';
      const modelName = sourceImg.alt || 'Modelo especial';
      if (titleEl) titleEl.textContent = `MODELO: ${String(modelName).toUpperCase()}`;
      const rotationSeed = Number.parseFloat(sourceImg.dataset.hexRotation || '');
      const patternType = String(sourceImg.dataset.patternType || 'hexagonal').toLowerCase();
      host.classList.add('open');
      host.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const sourceForTile = await resolveSourceForOverlay(sourceImg);
      const useDirectOverlay = String(sourceImg.dataset.overlayDirect || '') === '1';
      if (useDirectOverlay) {
        drawDirectOverlayImage(patternCanvas, overlayCard, sourceForTile);
        lastPattern = null;
        return;
      }
      const tileCanvas = await extractSpecialTile(sourceForTile);
      if (host.classList.contains('open') && originalSrc === (sourceImg.currentSrc || sourceImg.src || '') && tileCanvas) {
        lastPattern = { tileCanvas, patternType, rotationSeed: Number.isFinite(rotationSeed) ? rotationSeed : null };
        rerenderLastPattern();
      }
    }

    async function openCompare() {
      if (comparePicked.length < compareRequired) return;
      compareHost.classList.add('open');
      compareHost.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));

      function canvasHasPaint(canvasEl) {
        if (!canvasEl || !canvasEl.width || !canvasEl.height) return false;
        const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
        if (!ctx) return false;
        const data = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height).data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 8) return true;
        }
        return false;
      }

      const tasks = [];
      for (let i = 0; i < compareRequired; i++) {
        const img = comparePicked[i];
        const slot = compareSlots[i];
        if (!img || !slot) continue;
        const slotCanvas = slot.querySelector('.special-compare-canvas');
        const slotTitle = slot.querySelector('.special-compare-title');
        if (slotCanvas) {
          slotCanvas.style.width = '100%';
          slotCanvas.style.height = '100%';
          slotCanvas.style.display = 'block';
          const sctx = slotCanvas.getContext('2d');
          if (sctx) {
            sctx.clearRect(0, 0, slotCanvas.width, slotCanvas.height);
            sctx.fillStyle = '#ece9df';
            sctx.fillRect(0, 0, slotCanvas.width, slotCanvas.height);
          }
        }
        if (slotTitle) slotTitle.textContent = `MODELO: ${String(img.alt || '').toUpperCase()}`;
        tasks.push((async () => {
          const sourceForTile = await resolveSourceForOverlay(img);
          const useDirectOverlay = String(img.dataset.overlayDirect || '') === '1';
          if (useDirectOverlay && slotCanvas) {
            drawDirectOverlayImage(slotCanvas, slot, sourceForTile);
            return;
          }
          const tileCanvas = await extractSpecialTile(sourceForTile);
          if (tileCanvas && slotCanvas) {
            renderByPatternType(slotCanvas, slot, tileCanvas, img.dataset.patternType || 'hexagonal', Number.parseFloat(img.dataset.hexRotation || ''));
            if (!canvasHasPaint(slotCanvas)) drawDirectOverlayImage(slotCanvas, slot, sourceForTile);
          } else if (slotCanvas) {
            drawDirectOverlayImage(slotCanvas, slot, sourceForTile);
          }
        })());
      }
      await Promise.all(tasks);

      for (let i = 0; i < compareRequired; i++) {
        const img = comparePicked[i];
        const slot = compareSlots[i];
        const slotCanvas = slot ? slot.querySelector('.special-compare-canvas') : null;
        if (!img || !slot || !slotCanvas) continue;
        if (!canvasHasPaint(slotCanvas)) {
          drawDirectOverlayImage(slotCanvas, slot, img);
        }
      }
    }

    cards.forEach((img) => {
      img.classList.add('special-overlay-trigger');
      img.addEventListener('click', () => {
        if (compareMode) {
          if (comparePicked.includes(img)) {
            comparePicked = comparePicked.filter((n) => n !== img);
            img.classList.remove('compare-picked');
            return;
          }
          if (comparePicked.length >= compareRequired) {
            const removed = comparePicked.shift();
            if (removed) removed.classList.remove('compare-picked');
          }
          comparePicked.push(img);
          img.classList.add('compare-picked');
          if (comparePicked.length === compareRequired) openCompare();
          return;
        }
        openOverlay(img);
      });
    });

    if (compareToggleBtn) compareToggleBtn.addEventListener('click', () => {
      compareMode = !compareMode;
      closeCompare();
      closeOverlay();
      updateCompareUi();
    });

    host.addEventListener('click', (e) => {
      if (e.target.closest('[data-special-overlay-close="1"]')) closeOverlay();
    });
    compareHost.addEventListener('click', (e) => {
      if (e.target.closest('[data-special-compare-close="1"]')) closeCompare();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (compareHost.classList.contains('open')) closeCompare();
        if (host.classList.contains('open')) closeOverlay();
      }
    });

    window.addEventListener('resize', () => {
      if (host.classList.contains('open')) rerenderLastPattern();
      if (compareHost.classList.contains('open')) openCompare();
    });
  }


  function initEspecialesCustomizerPage() {
    const wrap = document.querySelector('[data-special-customizer="1"]');
    const canvas = q('specialCustomizerCanvas');
    const editCanvas = q('specialEditCanvas');
    const squareEditCanvas = q('specialSquareEditCanvas');
    const paletteEl = q('specialPalette');
    const imgEl = q('specialCustomizerSource');
    if (!wrap || !canvas || !editCanvas || !paletteEl || !imgEl) return;

    const patternType = String(wrap.dataset.patternType || 'hexagonal').toLowerCase();

    function getHexRotationSeed() {
      const current = Number.parseFloat(wrap.dataset.hexRotation || '');
      return Number.isFinite(current) ? current : null;
    }
    const allColors = Array.isArray(COLORS) ? COLORS : [];
    let selectedColor = allColors[0]?.hex || '#A3AD50';
    let selectedSquareColor = allColors[1]?.hex || allColors[0]?.hex || '#A3AD50';
    const initialSelectedColor = selectedColor;
    const initialSquareColor = selectedSquareColor;
    let selectedPaintColor = selectedColor;
    let originalTileCanvas = null;
    let originalSquareTileCanvas = null;
    let tileCanvas = null;
    let squareTileCanvas = null;
    let editMetrics = null;
    let squareEditMetrics = null;
    const undoBtn = q('specialUndoColor');
    const redoBtn = q('specialRedoColor');
    const resetBtn = q('specialResetColor');
    const undoStack = [];
    const redoStack = [];

    function setupCanvas(targetCanvas, ratio = 4 / 3) {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cssW = Math.max(320, Math.floor(targetCanvas.clientWidth || 1200));
      const cssH = Math.floor(cssW / ratio);
      targetCanvas.width = Math.floor(cssW * dpr);
      targetCanvas.height = Math.floor(cssH * dpr);
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return null;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);
      return { ctx, cssW, cssH };
    }

    function previewRatioForPattern(type, tileRatio) {
      return 12 / 8;
    }

    function drawTileFit(ctx, tile, cx, cy, boxW, boxH, angle = 0) {
      const ratio = tile.width / tile.height;
      let drawW = boxW;
      let drawH = drawW / ratio;
      if (drawH > boxH) {
        drawH = boxH;
        drawW = drawH * ratio;
      }
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.translate(cx, cy);
      if (angle) ctx.rotate(angle);
      ctx.drawImage(tile, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    function fitSize(tile, boxW, boxH) {
      const ratio = (tile.width || 1) / Math.max(1, (tile.height || 1));
      let drawW = boxW;
      let drawH = drawW / ratio;
      if (drawH > boxH) {
        drawH = boxH;
        drawW = drawH * ratio;
      }
      return { drawW, drawH };
    }

    function drawPolygonTilePreview(ctx, tile, cssW, cssH, sides, rotation = -Math.PI / 2, scale = 0.44) {
      const size = Math.min(cssW, cssH) * scale;
      const cx = cssW / 2;
      const cy = cssH / 2;

      if (!Number.isFinite(sides) || sides < 3) {
        drawTileFit(ctx, tile, cx, cy, cssW * 0.94, cssH * 0.94, 0);
        return;
      }

      function tracePath() {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const a = rotation + ((Math.PI * 2) * i / sides);
          const x = cx + Math.cos(a) * size;
          const y = cy + Math.sin(a) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }

      ctx.save();
      tracePath();
      ctx.clip();
      drawTileFit(ctx, tile, cx, cy, size * 2.05, size * 2.05, 0);
      ctx.restore();

      ctx.save();
      tracePath();
      ctx.lineWidth = Math.max(2, Math.min(cssW, cssH) * 0.01);
      ctx.strokeStyle = 'rgba(0,0,0,.28)';
      ctx.stroke();
      ctx.restore();
    }

    function renderEditBox() {
      if (!tileCanvas) return;
      const ratioMain = Math.max(0.3, Math.min(3.2, (tileCanvas.width || 1) / (tileCanvas.height || 1)));
      const editWrap = editCanvas.closest('.vector-editor');
      if (editWrap) editWrap.style.aspectRatio = `${ratioMain}`;
      const setup = setupCanvas(editCanvas, ratioMain);
      if (!setup) return;
      const { ctx, cssW, cssH } = setup;
      ctx.clearRect(0, 0, cssW, cssH);
      if (patternType === 'hexagonal') drawPolygonTilePreview(ctx, tileCanvas, cssW, cssH, 6, -Math.PI / 2, 0.44);
      else if (patternType === 'triangular') drawTileFit(ctx, tileCanvas, cssW / 2, cssH / 2, cssW * 0.94, cssH * 0.94, 0);
      else if (patternType === 'cuadrado') drawPolygonTilePreview(ctx, tileCanvas, cssW, cssH, 4, Math.PI / 4, 0.46);
      else if (patternType === 'octagonal') {
        drawPolygonTilePreview(ctx, tileCanvas, cssW, cssH, 8, Math.PI / 8, 0.45);
        editMetrics = { cssW, cssH, main: { x: cssW * 0.04, y: cssH * 0.04, w: cssW * 0.92, h: cssH * 0.92 } };
      } else drawTileFit(ctx, tileCanvas, cssW / 2, cssH / 2, cssW * 0.94, cssH * 0.94, 0);

      if (patternType !== 'octagonal') {
        editMetrics = { cssW, cssH, main: { x: cssW * 0.03, y: cssH * 0.03, w: cssW * 0.94, h: cssH * 0.94 } };
      }

      if (squareEditCanvas) {
        const sqWrap = squareEditCanvas.closest('.vector-editor');
        if (sqWrap) sqWrap.hidden = patternType !== 'octagonal';
        if (patternType === 'octagonal' && squareTileCanvas) {
          if (sqWrap) sqWrap.style.aspectRatio = '1 / 1';
          const sqSetup = setupCanvas(squareEditCanvas, 1);
          if (sqSetup) {
            const { ctx: sqCtx, cssW: sqW, cssH: sqH } = sqSetup;
            sqCtx.clearRect(0, 0, sqW, sqH);
            drawPolygonTilePreview(sqCtx, squareTileCanvas, sqW, sqH, 4, Math.PI / 4, 0.42);
            squareEditMetrics = { cssW: sqW, cssH: sqH, main: { x: sqW * 0.04, y: sqH * 0.04, w: sqW * 0.92, h: sqH * 0.92 } };
          }
        }
      }
    }

    function renderPattern() {
      if (!tileCanvas) return;
      const tileRatio = (tileCanvas.width || 1) / Math.max(1, (tileCanvas.height || 1));
      const ratio = previewRatioForPattern(patternType, tileRatio);
      const canvasWrap = canvas.closest('.panel') || canvas.parentElement;
      if (canvasWrap) canvasWrap.style.setProperty('--special-preview-ratio', String(ratio));
      canvas.style.aspectRatio = `${ratio}`;
      const setup = setupCanvas(canvas, ratio);
      if (!setup) return;
      const { ctx, cssW, cssH } = setup;
      ctx.fillStyle = '#ece9df';
      ctx.fillRect(0, 0, cssW, cssH);

      function renderHex() {
        const cols = Math.max(5, Math.round(cssW / 130));
        const hexW = cssW / cols;
        const hexH = hexW / 0.8660254;
        const radius = hexH / 2;
        const dx = Math.sqrt(3) * radius;
        const dy = radius * 1.5;
        const rows = Math.ceil((cssH + hexH * 2) / dy);
        const colsDraw = Math.ceil((cssW + hexW * 2) / dx);
        const currentSeed = getHexRotationSeed();
        const hasSeed = Number.isFinite(currentSeed);
        const seedRad = hasSeed ? (currentSeed * Math.PI / 180) : 0;
        const triadStep = Math.PI * 2 / 3;
        for (let row = -2; row < rows; row++) {
          for (let col = -2; col < colsDraw; col++) {
            const cx = col * dx + ((row & 1) ? dx / 2 : 0) + (hexW / 2);
            const cy = row * dy + radius;
            const colPhase = ((col % 3) + 3) % 3;
            const rowPhase = ((row % 2) + 2) % 2;
            const variant = rowPhase === 0 ? colPhase : ((colPhase + 2) % 3);
            const angle = hasSeed ? (seedRad + (variant * triadStep)) : 0;
            drawTileFit(ctx, tileCanvas, cx, cy, hexW * 1.03, hexH * 1.03, angle);
          }
        }
      }

      function renderSquareLike(oct = false) {
        const cols = Math.max(6, Math.round(cssW / 140));
        const size = cssW / cols;
        const rows = Math.ceil(cssH / size) + 1;
        const map = [[0, Math.PI / 2], [3 * Math.PI / 2, Math.PI]];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            let angle = map[r % 2][c % 2];
            if (oct) angle += Math.PI / 4;
            drawTileFit(ctx, tileCanvas, (c + 0.5) * size, (r + 0.5) * size, size * 0.96, size * 0.96, angle);
          }
        }
        if (oct && squareTileCanvas) {
          for (let r = -1; r < rows + 1; r++) {
            for (let c = -1; c < cols + 1; c++) {
              drawTileFit(ctx, squareTileCanvas, c * size, r * size, size * 0.52, size * 0.52, Math.PI / 4);
            }
          }
        }
      }

      function renderTri() {
        const cols = Math.max(6, Math.round(cssW / 150));
        const baseW = cssW / cols;
        const baseRatio = (tileCanvas.width || 1) / Math.max(1, (tileCanvas.height || 1));
        const baseH = baseW / Math.max(0.45, baseRatio);
        const stepY = baseH;
        const drawCols = Math.ceil((cssW + baseW * 3) / baseW);
        const drawRows = Math.ceil((cssH + baseH * 4) / stepY);
        for (let row = -2; row < drawRows; row++) {
          const rowOffset = (row % 2 === 0) ? 0 : (baseW / 2);
          for (let col = -2; col < drawCols; col++) {
            const cx = col * baseW + rowOffset + (baseW / 2);
            const cy = row * stepY + (baseH / 2);
            const angle = (row % 2 === 0) ? 0 : Math.PI;
            drawTileFit(ctx, tileCanvas, cx, cy, baseW * 1.01, baseH * 1.01, angle);
          }
        }
      }

      function renderCantaro() {
        const cols = Math.max(5, Math.round(cssW / 165));
        const tileW = cssW / cols;
        const tileH = tileW * 0.92;
        const stepX = tileW * 0.76;
        const stepY = tileH * 0.78;
        const rows = Math.ceil((cssH + tileH * 2) / stepY);
        const colsDraw = Math.ceil((cssW + tileW * 2) / stepX);
        for (let c = -2; c < colsDraw; c++) {
          const shiftY = (c % 2 === 0) ? 0 : (stepY / 2);
          for (let r = -2; r < rows; r++) {
            drawTileFit(ctx, tileCanvas, c * stepX + tileW / 2, r * stepY + shiftY + tileH / 2, tileW * 1.02, tileH * 1.02, 0);
          }
        }
      }

      function renderOtros() {
        const count = 5;
        const tileW = Math.min(220, cssW / 5.5);
        const totalW = count * tileW;
        const startX = (cssW - totalW) / 2;
        const cy = cssH / 2;
        for (let i = 0; i < count; i++) drawTileFit(ctx, tileCanvas, startX + (i + 0.5) * tileW, cy, tileW * 0.95, tileW * 0.95, 0);
      }

      if (patternType === 'triangular') return renderTri();
      if (patternType === 'cuadrado') return renderSquareLike(false);
      if (patternType === 'octagonal') return renderSquareLike(true);
      if (patternType === 'cantaro') return renderCantaro();
      if (patternType === 'otros') return renderOtros();
      return renderHex();
    }

    function buildOriginalTile(img) {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) return null;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const cx = c.getContext('2d', { willReadFrequently: true });
      if (!cx) return null;
      cx.drawImage(img, 0, 0, w, h);
      const d = cx.getImageData(0, 0, w, h);
      const arr = d.data;
      let minX = w;
      let minY = h;
      let maxX = -1;
      let maxY = -1;
      for (let i = 0; i < arr.length; i += 4) {
        if (arr[i + 3] === 0) continue;
        if (arr[i] >= 242 && arr[i + 1] >= 242 && arr[i + 2] >= 242) {
          arr[i + 3] = 0;
          continue;
        }
        const px = (i / 4) % w;
        const py = Math.floor((i / 4) / w);
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
      }
      cx.putImageData(d, 0, 0);

      if (maxX < minX || maxY < minY) return c;
      const pad = 2;
      const cropX = Math.max(0, minX - pad);
      const cropY = Math.max(0, minY - pad);
      const cropW = Math.min(w - cropX, (maxX - minX + 1) + (pad * 2));
      const cropH = Math.min(h - cropY, (maxY - minY + 1) + (pad * 2));
      const out = document.createElement('canvas');
      out.width = Math.max(1, cropW);
      out.height = Math.max(1, cropH);
      const outCtx = out.getContext('2d');
      if (!outCtx) return c;
      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = 'high';
      outCtx.drawImage(c, cropX, cropY, cropW, cropH, 0, 0, out.width, out.height);
      return out;
    }

    function buildSquareTile(hex) {
      const c = document.createElement('canvas');
      c.width = 220;
      c.height = 220;
      const cx = c.getContext('2d');
      if (!cx) return null;
      cx.clearRect(0, 0, c.width, c.height);
      cx.fillStyle = hex;
      cx.fillRect(0, 0, c.width, c.height);
      return c;
    }

    function cloneCanvas(sourceCanvas) {
      if (!sourceCanvas) return null;
      const c = document.createElement('canvas');
      c.width = sourceCanvas.width;
      c.height = sourceCanvas.height;
      const cx = c.getContext('2d');
      if (!cx) return null;
      cx.drawImage(sourceCanvas, 0, 0);
      return c;
    }

    function floodFillCanvasAt(sourceCanvas, targetCanvas, x, y, hex) {
      if (!targetCanvas || !sourceCanvas || !/^#[0-9a-f]{6}$/i.test(String(hex || ''))) return false;
      const cx = targetCanvas.getContext('2d', { willReadFrequently: true });
      const sxCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
      if (!cx || !sxCtx) return false;
      const w = targetCanvas.width;
      const h = targetCanvas.height;
      if (sourceCanvas.width !== w || sourceCanvas.height !== h) return false;
      const sx = Math.floor(x);
      const sy = Math.floor(y);
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) return false;

      const source = sxCtx.getImageData(0, 0, w, h).data;
      const d = cx.getImageData(0, 0, w, h);
      const arr = d.data;
      const idx = (sy * w + sx) * 4;
      const sa = source[idx + 3];
      if (sa < 8) return false;
      const sr = source[idx];
      const sg = source[idx + 1];
      const sb = source[idx + 2];

      const nr = parseInt(hex.slice(1, 3), 16);
      const ng = parseInt(hex.slice(3, 5), 16);
      const nb = parseInt(hex.slice(5, 7), 16);

      if (sr === nr && sg === ng && sb === nb) return false;

      const tol = 26;
      const tolSq = tol * tol;
      const visited = new Uint8Array(w * h);
      const qx = new Int32Array(w * h);
      const qy = new Int32Array(w * h);
      let head = 0;
      let tail = 0;
      qx[tail] = sx;
      qy[tail] = sy;
      tail += 1;
      visited[sy * w + sx] = 1;
      let painted = false;

      while (head < tail) {
        const px = qx[head];
        const py = qy[head];
        head += 1;
        const p = py * w + px;
        const i = p * 4;
        if (source[i + 3] < 8) continue;
        const dr = source[i] - sr;
        const dg = source[i + 1] - sg;
        const db = source[i + 2] - sb;
        if ((dr * dr) + (dg * dg) + (db * db) > tolSq) continue;

        arr[i] = nr;
        arr[i + 1] = ng;
        arr[i + 2] = nb;
        painted = true;

        function push(nx, ny) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
          const np = ny * w + nx;
          if (visited[np]) return;
          visited[np] = 1;
          qx[tail] = nx;
          qy[tail] = ny;
          tail += 1;
        }

        push(px - 1, py);
        push(px + 1, py);
        push(px, py - 1);
        push(px, py + 1);
      }
      cx.putImageData(d, 0, 0);
      return painted;
    }

    function rebuildAndRender() {
      if (!originalTileCanvas) return;
      tileCanvas = cloneCanvas(originalTileCanvas) || originalTileCanvas;
      originalSquareTileCanvas = buildSquareTile('#cfcfcf') || null;
      squareTileCanvas = buildSquareTile(selectedSquareColor) || null;
      renderEditBox();
      renderPattern();
      undoStack.length = 0;
      redoStack.length = 0;
      updateHistoryButtons();
    }

    function snapshotState() {
      return {
        tile: cloneCanvas(tileCanvas),
        square: cloneCanvas(squareTileCanvas),
        selectedColor,
        selectedSquareColor,
      };
    }

    function applyState(state) {
      if (!state) return;
      tileCanvas = cloneCanvas(state.tile) || tileCanvas;
      squareTileCanvas = cloneCanvas(state.square) || squareTileCanvas;
      selectedColor = state.selectedColor || selectedColor;
      selectedSquareColor = state.selectedSquareColor || selectedSquareColor;
      renderEditBox();
      renderPattern();
      updateHistoryButtons();
    }

    function commitStateBeforePaint() {
      undoStack.push(snapshotState());
      if (undoStack.length > 60) undoStack.shift();
      redoStack.length = 0;
      updateHistoryButtons();
    }

    function updateHistoryButtons() {
      if (undoBtn) undoBtn.disabled = undoStack.length === 0;
      if (redoBtn) redoBtn.disabled = redoStack.length === 0;
    }

    function refreshPaletteActive() {
      const value = selectedPaintColor;
      paletteEl.querySelectorAll('.sw').forEach((node) => {
        const isActive = String(node.dataset.hex || '').toLowerCase() === String(value || '').toLowerCase();
        node.classList.toggle('active', isActive);
      });
    }

    function renderPalette() {
      paletteEl.innerHTML = '';
      allColors.forEach((col, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sw';
        btn.style.background = col.hex;
        btn.title = `${col.id} · ${col.hex}`;
        btn.dataset.hex = col.hex;
        btn.setAttribute('aria-label', `${col.id} ${col.name || ''}`.trim());
        btn.innerHTML = `<span class="${String(col.id || '').length > 6 ? 'long' : ''}">${col.id}</span>`;
        btn.addEventListener('click', () => {
          selectedPaintColor = col.hex;
          refreshPaletteActive();
        });
        paletteEl.appendChild(btn);
      });
    }

    const targetsWrap = document.querySelector('.special-editor-targets');
    if (targetsWrap) targetsWrap.hidden = true;

    if (patternType === 'octagonal') {
      const mainEditorWrap = editCanvas.closest('.vector-editor');
      const squareWrap = q('specialSquareEditorWrap');
      if (mainEditorWrap && squareWrap) {
        mainEditorWrap.style.display = 'inline-block';
        mainEditorWrap.style.width = '48%';
        mainEditorWrap.style.verticalAlign = 'top';
        squareWrap.style.display = 'inline-block';
        squareWrap.style.width = '48%';
        squareWrap.style.marginLeft = '4%';
        squareWrap.style.marginTop = '0';
        squareWrap.style.verticalAlign = 'top';
      }
    }

    function mapPointToTile(pointX, pointY, box, targetCanvas) {
      if (!box || !targetCanvas || box.w <= 0 || box.h <= 0) return null;
      const relX = (pointX - box.x) / box.w;
      const relY = (pointY - box.y) / box.h;
      if (relX < 0 || relY < 0 || relX > 1 || relY > 1) return null;
      return {
        x: Math.max(0, Math.min(targetCanvas.width - 1, Math.floor(relX * targetCanvas.width))),
        y: Math.max(0, Math.min(targetCanvas.height - 1, Math.floor(relY * targetCanvas.height))),
      };
    }

    editCanvas.addEventListener('click', (ev) => {
      if (!tileCanvas || !editMetrics) return;
      const rect = editCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((ev.clientX - rect.left) / rect.width) * editMetrics.cssW;
      const y = ((ev.clientY - rect.top) / rect.height) * editMetrics.cssH;
      commitStateBeforePaint();
      const mainPoint = mapPointToTile(x, y, editMetrics.main, tileCanvas);
      const painted = mainPoint
        ? floodFillCanvasAt(originalTileCanvas, tileCanvas, mainPoint.x, mainPoint.y, selectedPaintColor)
        : false;
      if (painted) selectedColor = selectedPaintColor;

      if (painted) {
        renderEditBox();
        renderPattern();
      } else if (undoStack.length) {
        undoStack.pop();
        updateHistoryButtons();
      }
    });

    if (squareEditCanvas) {
      squareEditCanvas.addEventListener('click', (ev) => {
        if (patternType !== 'octagonal' || !squareTileCanvas || !squareEditMetrics || !originalSquareTileCanvas) return;
        const rect = squareEditCanvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = ((ev.clientX - rect.left) / rect.width) * squareEditMetrics.cssW;
        const y = ((ev.clientY - rect.top) / rect.height) * squareEditMetrics.cssH;
        commitStateBeforePaint();
        const sqPoint = mapPointToTile(x, y, squareEditMetrics.main, squareTileCanvas);
        const painted = sqPoint
          ? floodFillCanvasAt(originalSquareTileCanvas, squareTileCanvas, sqPoint.x, sqPoint.y, selectedPaintColor)
          : false;
        if (!painted) {
          if (undoStack.length) undoStack.pop();
          updateHistoryButtons();
          return;
        }
        selectedSquareColor = selectedPaintColor;
        renderEditBox();
        renderPattern();
      });
    }

    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        if (!undoStack.length) return;
        redoStack.push(snapshotState());
        const prev = undoStack.pop();
        applyState(prev);
      });
    }

    if (redoBtn) {
      redoBtn.addEventListener('click', () => {
        if (!redoStack.length) return;
        undoStack.push(snapshotState());
        const next = redoStack.pop();
        applyState(next);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!originalTileCanvas) return;
        selectedColor = initialSelectedColor;
        selectedSquareColor = initialSquareColor;
        selectedPaintColor = selectedColor;
        refreshPaletteActive();
        tileCanvas = cloneCanvas(originalTileCanvas) || originalTileCanvas;
        squareTileCanvas = buildSquareTile(initialSquareColor) || squareTileCanvas;
        undoStack.length = 0;
        redoStack.length = 0;
        renderEditBox();
        renderPattern();
        updateHistoryButtons();
      });
    }

    imgEl.addEventListener('load', () => {
      originalTileCanvas = buildOriginalTile(imgEl);
      rebuildAndRender();
    });
    imgEl.addEventListener('error', () => {
      const src = String(imgEl.getAttribute('src') || '');
      const clean = src.split('?')[0];
      if (clean && clean !== src) imgEl.src = clean;
    });
    if (imgEl.complete && imgEl.naturalWidth) {
      originalTileCanvas = buildOriginalTile(imgEl);
      rebuildAndRender();
    }

    renderPalette();
    refreshPaletteActive();
    updateHistoryButtons();
    window.addEventListener('resize', () => {
      renderEditBox();
      renderPattern();
    });
  }


  function initEspecialesSearch() {
    const wrap = document.querySelector('[data-special-customizer-search="1"]');
    if (!wrap) return;
    const input = q('specialCustomizerModelSearch');
    const items = Array.from(document.querySelectorAll('.special-customizer-model-item'));
    if (!input || !items.length) return;

    function applyFilter() {
      const qv = String(input.value || '').toLowerCase().trim();
      items.forEach((item) => {
        const name = String(item.dataset.modelName || '').toLowerCase();
        const match = !qv || name.includes(qv);
        item.style.display = match ? '' : 'none';
      });
    }

    input.addEventListener('input', applyFilter);
  }


  function initDarkFooter() {
    const main = document.querySelector('main.site');
    if (!main || document.getElementById('siteDarkFooter')) return;

    const lang = getLang();
    const legalUrl = `legal.html?lang=${lang}`;
    const mapUrl = `sitemap.html?lang=${lang}`;

    const html = lang === 'en'
      ? `<footer id="siteDarkFooter" class="dark-footer"><div class="dark-cols"><div><h4>Mosaicos Dzununcán</h4><p>Mexican cement tile manufacturer with custom projects.</p><p><a href="${legalUrl}#privacy">Privacy Policy</a><br><a href="${legalUrl}#terms">Terms and Conditions</a><br><a href="${mapUrl}">Site map</a></p></div><div><h4>Phones</h4><p>Local: +52 (999) 217-9326</p><p>Factory: +52 (999) 249-5158</p><p>Email: ventas@mosaicosdzununcan.com</p></div><div><h4>Address</h4><p>Sales & Showroom:<br/>Calle 37, No. 318 entre 24 y 26, Mérida, Yucatán.</p><p>Factory:<br/>Carretera Mérida - Dzununcan Km 2.5</p></div><div><h4>Social</h4><p><a target="_blank" rel="noopener" href="https://www.facebook.com/mosaicosdecimononicos#">Facebook</a><br><a target="_blank" rel="noopener" href="https://www.instagram.com/mosaicosdzununcan/">Instagram</a><br><a target="_blank" rel="noopener" href="https://wa.me/529992179326">WhatsApp</a></p></div></div></footer>`
      : `<footer id="siteDarkFooter" class="dark-footer"><div class="dark-cols"><div><h4>Mosaicos Dzununcán</h4><p>Fabricantes de mosaicos de pasta mexicanos con proyectos personalizados.</p><p><a href="${legalUrl}#privacy">Políticas de privacidad</a><br><a href="${legalUrl}#terms">Términos y condiciones</a><br><a href="${mapUrl}">Mapa del sitio</a></p></div><div><h4>Teléfonos</h4><p>Local: +52 (999) 217-9326</p><p>Fábrica: +52 (999) 249-5158</p><p>Email: ventas@mosaicosdzununcan.com</p></div><div><h4>Dirección</h4><p>Venta y sala de exhibición:<br/>Calle 37, No. 318 entre 24 y 26, Mérida, Yucatán.</p><p>Fábrica:<br/>Carretera Mérida - Dzununcan Km 2.5</p></div><div><h4>Redes</h4><p><a target="_blank" rel="noopener" href="https://www.facebook.com/mosaicosdecimononicos#">Facebook</a><br><a target="_blank" rel="noopener" href="https://www.instagram.com/mosaicosdzununcan/">Instagram</a><br><a target="_blank" rel="noopener" href="https://wa.me/529992179326">WhatsApp</a></p></div></div></footer>`;
    main.insertAdjacentHTML('beforeend', html);
  }

  function initMosaicosActions() {
    const quoteToggleBtn = q('quoteToggleBtn');
    const quoteContainer = q('quoteContainer');

    if (quoteToggleBtn && quoteContainer) {
      quoteToggleBtn.addEventListener('click', () => {
        const isOpen = quoteContainer.classList.toggle('open');
        quoteContainer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        quoteToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHome();
    initCategories();
    initColorsPage();
    initCustomizer();
    initDecoratedOverlay();
    initTapetesPage();
    initMosaicosActions();
    initGalleryPage();
    initEspecialesOverlay();
    initEspecialesCustomizerPage();
    initEspecialesSearch();
    initQuoteValidation();
    initDarkFooter();
  });
})();
