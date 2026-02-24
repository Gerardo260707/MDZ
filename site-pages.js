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
    let img = new Image();
    img.crossOrigin = 'anonymous';

    const regionsNorm = [
      [[0,0],[0.5,0],[0,0.5]],
      [[0.5,0],[1,0],[1,0.5]],
      [[0,0.5],[0,1],[0.5,1]],
      [[1,0.5],[1,1],[0.5,1]],
      [[0.2,0.2],[0.5,0.08],[0.8,0.2],[0.92,0.5],[0.8,0.8],[0.5,0.92],[0.2,0.8],[0.08,0.5]],
      [[0,0.35],[0.35,0],[0.65,0],[1,0.35],[1,0.65],[0.65,1],[0.35,1],[0,0.65]],
    ];
    const regionColors = {};

    editor.innerHTML = '<canvas id="editCanvas" class="vector-canvas" width="600" height="600"></canvas>';
    big.innerHTML = '<canvas id="patternCanvas" class="pattern-canvas" width="960" height="640"></canvas>';
    const editCanvas = q('editCanvas');
    const patternCanvas = q('patternCanvas');
    const ectx = editCanvas.getContext('2d');
    const pctx = patternCanvas.getContext('2d');

    function denormRegion(r, size){
      return r.map(([x,y]) => [x*size, y*size]);
    }

    function drawBaseOn(ctx, size=600){
      ctx.clearRect(0,0,size,size);
      ctx.drawImage(img,0,0,size,size);
      Object.entries(regionColors).forEach(([k,color])=>{
        const idx = Number(k);
        const pts = denormRegion(regionsNorm[idx], size);
        ctx.save();
        ctx.beginPath();
        pts.forEach((p,i)=> i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.55;
        ctx.fillRect(0,0,size,size);
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(img,0,0,size,size);
        ctx.restore();
      });
    }

    function drawPattern(){
      const w = patternCanvas.width, h = patternCanvas.height;
      const cols = 12, rows = 8;
      const tw = Math.floor(w/cols), th = Math.floor(h/rows);
      const tile = document.createElement('canvas');
      tile.width = 200; tile.height = 200;
      const tctx = tile.getContext('2d');
      drawBaseOn(tctx, 200);

      pctx.clearRect(0,0,w,h);
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          pctx.save();
          const x = c*tw, y=r*th;
          pctx.translate(x+tw/2,y+th/2);
          let angle = 0;
          if (category === 'centro') {
            angle = ((r+c)%4) * (Math.PI/2);
          }
          pctx.rotate(angle);
          pctx.drawImage(tile,-tw/2,-th/2,tw,th);
          pctx.restore();
        }
      }
    }

    function pointInPoly(x,y,poly){
      let inside=false;
      for(let i=0,j=poly.length-1;i<poly.length;j=i++){
        const xi=poly[i][0], yi=poly[i][1], xj=poly[j][0], yj=poly[j][1];
        const intersect=((yi>y)!=(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi+1e-9)+xi);
        if(intersect) inside=!inside;
      }
      return inside;
    }

    editCanvas.addEventListener('click',(ev)=>{
      const rect = editCanvas.getBoundingClientRect();
      const x = (ev.clientX - rect.left) * (editCanvas.width / rect.width);
      const y = (ev.clientY - rect.top) * (editCanvas.height / rect.height);
      for(let i=regionsNorm.length-1;i>=0;i--){
        const poly = denormRegion(regionsNorm[i], editCanvas.width);
        if(pointInPoly(x,y,poly)){
          regionColors[i]=selected;
          drawBaseOn(ectx, editCanvas.width);
          drawPattern();
          break;
        }
      }
    });

    colors.forEach((c)=>{
      const b = document.createElement('button');
      b.className='sw';
      b.type='button';
      b.style.background=c;
      b.addEventListener('click',()=>{
        selected=c;
        document.querySelectorAll('.sw').forEach((n)=>n.classList.remove('active'));
        b.classList.add('active');
      });
      palette.appendChild(b);
    });

    const resetBtn = q('resetColor');
    if (resetBtn) {
      resetBtn.addEventListener('click',()=>{
        Object.keys(regionColors).forEach(k=>delete regionColors[k]);
        drawBaseOn(ectx, editCanvas.width);
        drawPattern();
      });
    }

    const dl = q('download');
    if (dl) {
      dl.addEventListener('click',()=>{
        const a=document.createElement('a');
        a.href=patternCanvas.toDataURL('image/png');
        a.download='patron-personalizado.png';
        a.click();
      });
    }

    img.onload = () => {
      drawBaseOn(ectx, editCanvas.width);
      drawPattern();
    };
    img.onerror = () => {
      const tmp = document.createElement('canvas');
      tmp.width = 600; tmp.height = 600;
      const tx = tmp.getContext('2d');
      tx.fillStyle = '#ddd'; tx.fillRect(0,0,600,600);
      tx.fillStyle = '#888'; tx.font = '24px Arial'; tx.fillText('PNG no disponible', 180, 300);
      img.src = tmp.toDataURL('image/png');
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
