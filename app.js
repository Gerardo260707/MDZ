(function () {
  const DICT = {
    es: {
      nav_home: 'Inicio', nav_mosaics: 'Mosaicos', nav_gallery: 'Galería', nav_maintenance: 'Mantenimiento', nav_installation: 'Instalación', nav_contact: 'Contacto',
      home_intro: 'Ahora cada menú abre su propio archivo independiente. Puedes editar cada página por separado y mantener todo conectado desde la navegación.',
      home_note: 'Los 3 cuadros cargan imágenes desde assets/cuadros/.',
      home_footer: 'Base preparada para migrar a PHP + base de datos cuando compartas tu estructura.',
      cat_title: 'Mosaicos Hidráulicos', cat_subtitle: 'Generales de los ladrillos', cat_desc: 'Fabricamos artesanalmente cada mosaico de pasta en diferentes medidas y categorías.',
      cat_colors: 'Lisos', cat_decorated: 'Decorados', cat_specials: 'Especiales', cat_customize: 'Personalizar', cat_btn: 'Ver modelos » clic aquí',
      decorated_title: 'Mosaicos Decorados', decorated_desc: 'Seleccione un modelo para ver su ficha. Puede personalizar colores en el simulador.',
      btn_customize: 'Personalizar', custom_title: 'Personalizar Diseño', custom_step1: '1. Selecciona un color.', custom_step2: '2. Da clic sobre una sección del mosaico para cambiar solo esa área.',
      custom_apply: 'Aplicar color', custom_reset: 'Imagen original', custom_download: 'Descargar PDF', catalog_ready: 'Esta página está lista para mostrar +300 mosaicos desde base de datos.',
      custom_model_search_input: 'Escriba el nombre del modelo', custom_select_center: 'Seleccionar centro', custom_select_cenefa: 'Seleccionar cenefa', custom_select_esquina: 'Seleccionar esquina', colors_title: 'Paleta de colores', colors_desc: 'Consulta todos los colores disponibles para personalizar tus diseños.', custom_step_area: '2. Da clic en una sección del mosaico (PNG) para aplicar el color solo en esa zona.', custom_undo: 'Regresar color', custom_redo: 'Adelante color', custom_home: 'Imagen original',
      custom_panel_title: 'Personalizar Diseño', custom_panel_desc: 'Cambie los colores del mosaico de su elección.', custom_panel_cta: 'Pruebe el simulador de colores ahora', quote_title: 'Solicite una Cotización', quote_desc: 'Llene el siguiente formulario, comente los productos que desea y a la brevedad uno de nuestros agentes de venta se comunicará con usted.', quote_name: 'Nombre', quote_email: 'Email', quote_phone: 'Teléfono', quote_comments: 'Comentarios', quote_send: 'Enviar',
      contact_title: 'Contacto', lang_label: 'Idioma', quote_toggle: 'Solicitar cotización', compare_preview_title: 'Vista de comparación', contact_intro: 'Ven a conocer nuestras salas de exhibición o si prefieres llamarnos para más información, aquí puedes contactarnos.', contact_location_title: 'Ubicación', contact_showroom_title: 'Sala de Exhibición y Venta', contact_factory_title: 'Fábrica, Venta y Sala de Exhibición', contact_address_label: 'Dirección'
    },
    en: {
      nav_home: 'Home', nav_mosaics: 'Tiles', nav_gallery: 'Gallery', nav_maintenance: 'Maintenance', nav_installation: 'Installation', nav_contact: 'Contact',
      home_intro: 'Each menu item now opens its own independent file. You can edit every page separately and keep everything connected through navigation.',
      home_note: 'The 3 square cards load images from assets/cuadros/.',
      home_footer: 'Base ready to migrate to PHP + database when you share your structure.',
      cat_title: 'Hydraulic Cement Tiles', cat_subtitle: 'General tile categories', cat_desc: 'We handcraft each cement tile in different sizes and categories.',
      cat_colors: 'Solid Colors', cat_decorated: 'Decorated', cat_specials: 'Specials', cat_customize: 'Customize', cat_btn: 'View models » click here',
      decorated_title: 'Decorated Cement Tiles', decorated_desc: 'Choose a design to view details and preview its layout.',
      btn_customize: 'Customize', custom_title: 'Customize Design', custom_step1: '1. Select a color.', custom_step2: '2. Click a mosaic section to change only that area.',
      custom_apply: 'Apply color', custom_reset: 'Original image', custom_download: 'Download PDF', catalog_ready: 'This page is ready to show 300+ mosaics from database.',
      custom_model_search_input: 'Type model name', custom_select_center: 'Select center', custom_select_cenefa: 'Select border', custom_select_esquina: 'Select corner', colors_title: 'Color palette', colors_desc: 'Browse all available colors for customization.', custom_step_area: '2. Click a mosaic section (PNG) to apply color only on that zone.', custom_undo: 'Undo color', custom_redo: 'Redo color', custom_home: 'Original image',
      custom_panel_title: 'Customize Design', custom_panel_desc: 'Change the colors of your selected mosaic.', custom_panel_cta: 'Try the color simulator now', quote_title: 'Request a Quote', quote_desc: 'Fill out the form below, tell us which products you need and one of our sales agents will contact you shortly.', quote_name: 'Name', quote_email: 'Email', quote_phone: 'Phone', quote_comments: 'Comments', quote_send: 'Send',
      contact_title: 'Contact', lang_label: 'Language', quote_toggle: 'Request a quote', compare_preview_title: 'Comparison preview', contact_intro: 'Visit our showrooms, or call us for more information. You can contact us here.', contact_location_title: 'Location', contact_showroom_title: 'Showroom and Sales', contact_factory_title: 'Factory, Sales and Showroom', contact_address_label: 'Address'
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

    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      const key = node.getAttribute('data-i18n-placeholder');
      if (dict[key]) node.setAttribute('placeholder', dict[key]);
    });

    document.querySelectorAll('[data-lang-only]').forEach((node) => {
      const only = node.getAttribute('data-lang-only');
      const show = only === safeLang;
      node.hidden = !show;
    });

    document.querySelectorAll('[data-i18n-title]').forEach((node) => {
      const key = node.getAttribute('data-i18n-title');
      if (dict[key]) {
        node.setAttribute('title', dict[key]);
        node.setAttribute('aria-label', dict[key]);
      }
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

  function loadWhatsAppWidget() {
    if (document.querySelector('link[data-wa-widget]')) return;
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'Whatsapp/whatsapp-widget.css';
    css.setAttribute('data-wa-widget', '1');
    document.head.appendChild(css);

    if (!document.querySelector('script[data-wa-widget]')) {
      const script = document.createElement('script');
      script.src = 'Whatsapp/whatsapp-widget.js';
      script.defer = true;
      script.setAttribute('data-wa-widget', '1');
      document.body.appendChild(script);
    }
  }

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-set-lang]');
    if (!target) return;
    e.preventDefault();
    const lang = normalizeLang(target.getAttribute('data-set-lang'));
    localStorage.setItem('lang', lang);
    window.location.assign(buildUrlWithLang(lang));
  });

  document.addEventListener('DOMContentLoaded', () => {
    applyLang(getLang());
    loadWhatsAppWidget();
  });
})();
