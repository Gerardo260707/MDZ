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

    const selectedColorRef = { value: '#2f658c' };
    const src = big.dataset.image || 'assets/placeholder-tile.svg';
    const colors = ['#962f2f', '#ca6f46', '#f1ad2e', '#2f658c', '#7c90aa', '#2b8481', '#2a3a4f', '#a3b57a', '#dac9ad', '#303030', '#8d4d60', '#f4f4f0', '#1b4f72', '#3d9970', '#b03a2e'];

    let svgMarkup = templateSvg();
    if (src.toLowerCase().endsWith('.svg')) {
      try {
        const res = await fetch(src);
        if (res.ok) svgMarkup = await res.text();
      } catch (e) {
        // fallback template
      }
    }

    editor.innerHTML = svgMarkup;
    const svg = editor.querySelector('svg');
    if (svg) {
      svg.setAttribute('class', 'editable-svg');
      const updatePattern = () => {
        const url = svgToDataUrl(svg);
        big.style.backgroundImage = `url('${url}')`;
        big.style.backgroundSize = '140px 140px';
        big.style.backgroundRepeat = 'repeat';
      };
      setupInteractiveSvg(svg, selectedColorRef, updatePattern);
      updatePattern();
    }

    colors.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'sw';
      b.type = 'button';
      b.style.background = c;
      b.addEventListener('click', () => {
        selectedColorRef.value = c;
        document.querySelectorAll('.sw').forEach((n) => n.classList.remove('active'));
        b.classList.add('active');
      });
      palette.appendChild(b);
    });

    const resetBtn = q('resetColor');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        editor.innerHTML = templateSvg();
        const nsvg = editor.querySelector('svg');
        nsvg.setAttribute('class', 'editable-svg');
        const updatePattern = () => {
          const url = svgToDataUrl(nsvg);
          big.style.backgroundImage = `url('${url}')`;
          big.style.backgroundSize = '140px 140px';
          big.style.backgroundRepeat = 'repeat';
        };
        setupInteractiveSvg(nsvg, selectedColorRef, updatePattern);
        updatePattern();
      });
    }

    const dl = q('download');
    if (dl) {
      dl.addEventListener('click', () => {
        const currentSvg = editor.querySelector('svg');
        const blob = new Blob([currentSvg ? currentSvg.outerHTML : templateSvg()], { type: 'image/svg+xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'mosaico-personalizado.svg';
        a.click();
        URL.revokeObjectURL(a.href);
      });
    }
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
