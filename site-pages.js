(function () {
  function q(id) { return document.getElementById(id); }

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
    const FEATURE_CARDS = [
      { file: 'galeria.jpg', label: 'Galería', href: 'galeria.html' },
      { file: 'instalacion.jpg', label: 'Instalación', href: 'instalacion.html' },
      { file: 'contacto.jpg', label: 'Contacto', href: 'contacto.html' }
    ];

    const lang = window.siteI18n ? window.siteI18n.getLang() : 'es';
    FEATURE_CARDS.forEach((card) => {
      const a = document.createElement('a');
      a.className = 'tile-card';
      a.href = `${card.href}?lang=${lang}`;
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
    const lang = window.siteI18n ? window.siteI18n.getLang() : 'es';
    const categories = [
      { key: 'cat_colors', img: 'assets/placeholder-tile.svg', href: 'galeria.html' },
      { key: 'cat_decorated', img: 'assets/placeholder-tile.svg', href: 'mosaicos.php' },
      { key: 'cat_specials', img: 'assets/placeholder-tile.svg', href: 'galeria.html' },
      { key: 'cat_customize', img: 'assets/placeholder-tile.svg', href: 'personalizar.php?id=1' }
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

  function initCustomizer() {
    const palette = q('palette');
    const small = q('smallPreview');
    const big = q('bigPreview');
    if (!palette || !small || !big) return;

    const placeholder = 'assets/placeholder-tile.svg';
    const src = big.dataset.image || placeholder;
    let selected = '#2f658c';
    const colors = ['#962f2f', '#ca6f46', '#f1ad2e', '#2f658c', '#7c90aa', '#2b8481', '#2a3a4f', '#a3b57a', '#dac9ad', '#303030', '#8d4d60', '#f4f4f0', '#1b4f72', '#3d9970', '#b03a2e'];

    colors.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'sw';
      b.type = 'button';
      b.style.background = c;
      b.addEventListener('click', () => { selected = c; });
      palette.appendChild(b);
    });

    function applyColor(color) {
      small.style.backgroundImage = `linear-gradient(${color}AA, ${color}AA), url('${src}')`;
      small.style.backgroundSize = 'cover';
      small.style.backgroundRepeat = 'no-repeat';
      small.style.backgroundBlendMode = 'multiply';

      big.style.backgroundImage = `linear-gradient(${color}88, ${color}88), url('${src}')`;
      big.style.backgroundSize = '160px 160px';
      big.style.backgroundRepeat = 'repeat';
      big.style.backgroundBlendMode = 'multiply';
    }

    q('applyColor').addEventListener('click', () => applyColor(selected));
    q('resetColor').addEventListener('click', () => applyColor('#ffffff'));
    q('download').addEventListener('click', () => {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='1200' height='800' fill='${selected}'/></svg>`;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mosaico-personalizado.svg';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    applyColor('#ffffff');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHome();
    initCategories();
    initCustomizer();
  });
})();
