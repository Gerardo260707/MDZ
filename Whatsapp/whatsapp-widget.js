(function(){
  function isMobile(){
    const ua = String(navigator.userAgent || '').toLowerCase();
    const uaMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile|windows phone|silk/i.test(ua);
    const uaDataMobile = !!(navigator.userAgentData && navigator.userAgentData.mobile);
    const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const touchPoints = Number(navigator.maxTouchPoints || 0);
    const platform = String(navigator.platform || '').toLowerCase();
    const isiPadLike = platform === 'macintel' && touchPoints > 1;
    const knownMobilePlatform = /iphone|ipod|ipad|android/.test(platform);
    return uaMobile || uaDataMobile || isiPadLike || (knownMobilePlatform && coarsePointer) || (coarsePointer && touchPoints > 1);
  }

  function init(){
    if (!isMobile() || document.getElementById('waFloatBtn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'waFloatBtn';
    btn.className = 'wa-float-btn show';
    btn.setAttribute('aria-label', 'Contactar por WhatsApp');

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 800 800');
    icon.setAttribute('aria-hidden', 'true');
    const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    iconPath.setAttribute('fill', 'currentColor');
    iconPath.setAttribute('d', 'M 508.558 450.429 C 502.67 447.483 473.723 433.24 468.325 431.273 C 462.929 429.308 459.003 428.328 455.078 434.22 C 451.153 440.114 439.869 453.377 436.434 457.307 C 433 461.236 429.565 461.729 423.677 458.78 C 417.79 455.834 398.818 449.617 376.328 429.556 C 358.825 413.943 347.008 394.663 343.574 388.768 C 340.139 382.873 343.207 379.687 346.155 376.752 C 348.804 374.113 352.044 369.874 354.987 366.436 C 357.931 362.999 358.912 360.541 360.875 356.614 C 362.837 352.683 361.857 349.246 360.383 346.299 C 358.912 343.352 347.136 314.369 342.231 302.579 C 337.451 291.099 332.597 292.654 328.983 292.472 C 325.552 292.301 321.622 292.265 317.698 292.265 C 313.773 292.265 307.394 293.739 301.996 299.632 C 296.6 305.527 281.389 319.772 281.389 348.752 C 281.389 377.735 302.487 405.731 305.431 409.661 C 308.376 413.592 346.949 473.062 406.015 498.566 C 420.062 504.634 431.03 508.256 439.581 510.969 C 453.685 515.451 466.521 514.818 476.666 513.302 C 487.978 511.613 511.502 499.06 516.409 485.307 C 521.315 471.55 521.315 459.762 519.842 457.307 C 518.371 454.851 514.446 453.377 508.558 450.429 Z M 401.126 597.117 L 401.047 597.117 C 365.902 597.104 331.431 587.661 301.36 569.817 L 294.208 565.572 L 220.08 585.017 L 239.866 512.743 L 235.21 505.332 C 215.604 474.149 205.248 438.108 205.264 401.1 C 205.307 293.113 293.17 205.257 401.204 205.257 C 453.518 205.275 502.693 225.674 539.673 262.696 C 576.651 299.716 597.004 348.925 596.983 401.258 C 596.939 509.254 509.078 597.117 401.126 597.117 Z M 567.816 234.565 C 523.327 190.024 464.161 165.484 401.124 165.458 C 271.24 165.458 165.529 271.161 165.477 401.085 C 165.46 442.617 176.311 483.154 196.932 518.892 L 163.502 641 L 288.421 608.232 C 322.839 627.005 361.591 636.901 401.03 636.913 L 401.126 636.913 L 401.127 636.913 C 530.998 636.913 636.717 531.2 636.77 401.274 C 636.794 338.309 612.306 279.105 567.816 234.565');
    icon.appendChild(iconPath);
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
