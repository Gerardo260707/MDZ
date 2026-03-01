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

    btn.addEventListener('click', ()=> panel.classList.toggle('open'));
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
