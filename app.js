(function () {
  const DICT = {
    es: {
      nav_home: 'Inicio', nav_mosaics: 'Mosaicos', nav_gallery: 'Galería', nav_maintenance: 'Mantenimiento', nav_installation: 'Instalación', nav_contact: 'Contacto', nav_pay: 'Pago Clip',
      home_intro: 'Ahora cada menú abre su propio archivo independiente. Puedes editar cada página por separado y mantener todo conectado desde la navegación.',
      home_note: 'Los 3 cuadros cargan imágenes desde assets/cuadros/.',
      home_footer: 'Base preparada para migrar a PHP + base de datos cuando compartas tu estructura.',
      cat_title: 'Mosaicos Hidráulicos', cat_subtitle: 'Generales de los ladrillos', cat_desc: 'Fabricamos artesanalmente cada mosaico de pasta en diferentes medidas y categorías.',
      cat_colors: 'Lisos', cat_decorated: 'Decorados', cat_specials: 'Especiales', cat_customize: 'Personalizar', cat_btn: 'Ver modelos » clic aquí',
      decorated_title: 'Mosaicos Decorados', decorated_desc: 'Seleccione un modelo para ver su ficha. Puede personalizar colores en el simulador.',
      btn_customize: 'Personalizar', custom_title: 'Personalizar Diseño', custom_step1: '1. Selecciona un color.', custom_step2: '2. Da clic sobre una sección del mosaico para cambiar solo esa área.',
      custom_apply: 'Aplicar color', custom_reset: 'Imagen original', custom_download: 'Descargar PDF', catalog_ready: 'Esta página está lista para mostrar +300 mosaicos desde base de datos.',
      contact_title: 'Contacto', lang_label: 'Idioma'
    },
    en: {
      nav_home: 'Home', nav_mosaics: 'Mosaics', nav_gallery: 'Gallery', nav_maintenance: 'Maintenance', nav_installation: 'Installation', nav_contact: 'Contact', nav_pay: 'Clip Payment',
      home_intro: 'Each menu item now opens its own independent file. You can edit every page separately and keep everything connected through navigation.',
      home_note: 'The 3 square cards load images from assets/cuadros/.',
      home_footer: 'Base ready to migrate to PHP + database when you share your structure.',
      cat_title: 'Hydraulic Mosaics', cat_subtitle: 'General brick categories', cat_desc: 'We craft each cement tile manually in different sizes and categories.',
      cat_colors: 'Solid Colors', cat_decorated: 'Decorated', cat_specials: 'Specials', cat_customize: 'Customize', cat_btn: 'View models » click here',
      decorated_title: 'Decorated Mosaics', decorated_desc: 'Choose a model to view details. You can customize colors in the simulator.',
      btn_customize: 'Customize', custom_title: 'Customize Design', custom_step1: '1. Select a color.', custom_step2: '2. Click a mosaic section to change only that area.',
      custom_apply: 'Apply color', custom_reset: 'Original image', custom_download: 'Download PDF', catalog_ready: 'This page is ready to show 300+ mosaics from database.',
      contact_title: 'Contact', lang_label: 'Language'
    }
  };

  function normalizeLang(value) {
    return value === 'en' ? 'en' : 'es';
  }

  function getLang() {
    const query = new URLSearchParams(window.location.search).get('lang');
    if (query === 'en' || query === 'es') {
      localStorage.setItem('lang', query);
      return query;
    }
    return normalizeLang(localStorage.getItem('lang'));
  }

  function buildUrlWithLang(lang) {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    return url.pathname + url.search + url.hash;
  }

  function applyLang(lang) {
    const safeLang = normalizeLang(lang);
    localStorage.setItem('lang', safeLang);
    const dict = DICT[safeLang] || DICT.es;
    document.documentElement.lang = safeLang;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (dict[key]) node.textContent = dict[key];
    });

    document.querySelectorAll('[data-lang-active]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.langActive === safeLang);
    });

    document.querySelectorAll('a[data-keep-lang]').forEach((a) => {
      const url = new URL(a.getAttribute('href'), window.location.href);
      url.searchParams.set('lang', safeLang);
      a.setAttribute('href', url.pathname + url.search + url.hash);
    });

    const canonical = buildUrlWithLang(safeLang);
    if (canonical !== window.location.pathname + window.location.search + window.location.hash) {
      history.replaceState(null, '', canonical);
    }
  }

  window.siteI18n = { getLang, applyLang };

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-set-lang]');
    if (!target) return;
    e.preventDefault();
    const lang = normalizeLang(target.getAttribute('data-set-lang'));
    localStorage.setItem('lang', lang);
    window.location.assign(buildUrlWithLang(lang));
  });

  document.addEventListener('DOMContentLoaded', () => applyLang(getLang()));
})();
