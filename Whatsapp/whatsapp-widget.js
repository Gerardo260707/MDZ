(function(){
  function isMobile(){
    return window.matchMedia('(max-width: 900px)').matches;
  }

  function init(){
    if (!isMobile() || document.getElementById('waFloatBtn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'waFloatBtn';
    btn.className = 'wa-float-btn show';
    btn.setAttribute('aria-label', 'Contactar por WhatsApp');

    const logoPath = 'Whatsapp/logo-whatsapp.png';
    const icon = document.createElement('img');
    icon.src = logoPath;
    icon.alt = 'WhatsApp';
    icon.onerror = function(){
      this.replaceWith(Object.assign(document.createElement('span'), { textContent: '🟢' }));
    };
    btn.appendChild(icon);

    const panel = document.createElement('div');
    panel.id = 'waFloatPanel';
    panel.className = 'wa-float-panel';
    panel.innerHTML = `
      <label for="waFloatMessage">Mensaje para tienda:</label>
      <textarea id="waFloatMessage">Hola, me gustaría información y una cotización sobre sus opciones de mosaicos.</textarea>
      <div class="wa-float-actions">
        <button type="button" class="wa-cancel" id="waFloatCancel">Cerrar</button>
        <button type="button" class="wa-send" id="waFloatSend">Enviar</button>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    const DRAG_THRESHOLD = 6;
    let pointerId = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let originLeft = 0;
    let originTop = 0;
    let moved = false;

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function ensureAbsolutePosition() {
      if (btn.dataset.freePositioned === '1') return;
      const rect = btn.getBoundingClientRect();
      btn.style.left = `${Math.round(rect.left)}px`;
      btn.style.top = `${Math.round(rect.top)}px`;
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
      btn.dataset.freePositioned = '1';
    }

    function positionPanelNearButton() {
      const btnRect = btn.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const gap = 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = btnRect.left;
      let top = btnRect.top - panelRect.height - gap;
      if (top < 10) top = Math.min(vh - panelRect.height - 10, btnRect.bottom + gap);
      left = clamp(left, 10, Math.max(10, vw - panelRect.width - 10));
      top = clamp(top, 10, Math.max(10, vh - panelRect.height - 10));
      panel.style.left = `${Math.round(left)}px`;
      panel.style.top = `${Math.round(top)}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    btn.addEventListener('pointerdown', (ev) => {
      pointerId = ev.pointerId;
      moved = false;
      dragStartX = ev.clientX;
      dragStartY = ev.clientY;
      ensureAbsolutePosition();
      originLeft = parseFloat(btn.style.left) || 0;
      originTop = parseFloat(btn.style.top) || 0;
      btn.setPointerCapture(pointerId);
    });

    btn.addEventListener('pointermove', (ev) => {
      if (pointerId !== ev.pointerId) return;
      const dx = ev.clientX - dragStartX;
      const dy = ev.clientY - dragStartY;
      if (!moved && Math.hypot(dx, dy) >= DRAG_THRESHOLD) moved = true;
      if (!moved) return;
      const maxLeft = Math.max(0, window.innerWidth - btn.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - btn.offsetHeight);
      const nextLeft = clamp(originLeft + dx, 0, maxLeft);
      const nextTop = clamp(originTop + dy, 0, maxTop);
      btn.style.left = `${Math.round(nextLeft)}px`;
      btn.style.top = `${Math.round(nextTop)}px`;
      if (panel.classList.contains('open')) positionPanelNearButton();
    });

    btn.addEventListener('pointerup', (ev) => {
      if (pointerId !== ev.pointerId) return;
      btn.releasePointerCapture(pointerId);
      pointerId = null;
      if (!moved) {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) positionPanelNearButton();
      }
    });

    btn.addEventListener('pointercancel', () => {
      pointerId = null;
    });

    window.addEventListener('resize', () => {
      if (panel.classList.contains('open')) positionPanelNearButton();
    });

    panel.querySelector('#waFloatCancel').addEventListener('click', ()=> panel.classList.remove('open'));
    panel.querySelector('#waFloatSend').addEventListener('click', ()=>{
      const msg = (panel.querySelector('#waFloatMessage').value || '').trim() || 'Hola, me gustaría información y una cotización.';
      window.location.assign(`https://wa.me/529992179326?text=${encodeURIComponent(msg)}`);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
