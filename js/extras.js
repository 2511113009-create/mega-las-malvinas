// Funciones extra con APIs del navegador y servicios públicos gratuitos (sin claves):
//  - Web Speech API ........ búsqueda por voz en el buscador
//  - Geolocation API ....... "¿A qué distancia estoy?" de la tienda
//  - Screen Wake Lock API .. la pantalla no se apaga mientras se muestra el QR de Yape
//  - Nager.Date (API REST) . aviso de feriados en Perú (hoy o mañana)
// Todo es opcional: si el navegador no lo soporta, la función simplemente no aparece.
(function () {
  'use strict';
  const T = window.TIENDA;
  const $ = (s) => document.querySelector(s);

  // ---------- Búsqueda por voz ----------
  const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
  const form = $('#buscador'), input = $('#q');
  if (Reconocimiento && form && input) {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'btn-voz'; btn.setAttribute('aria-label', 'Buscar por voz');
    btn.innerHTML = '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
    form.insertBefore(btn, form.querySelector('.btn-buscar'));
    let rec = null;
    btn.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      rec = new Reconocimiento();
      rec.lang = 'es-PE'; rec.interimResults = true; rec.maxAlternatives = 1;
      btn.classList.add('escuchando'); input.placeholder = 'Te escucho… di el producto';
      rec.onresult = (e) => {
        const t = [...e.results].map((r) => r[0].transcript).join(' ').replace(/[.¿?¡!]/g, '').trim();
        input.value = t;
        input.dispatchEvent(new Event('input', {bubbles: true}));
        if (e.results[e.results.length - 1].isFinal) form.requestSubmit();
      };
      const fin = () => { btn.classList.remove('escuchando'); input.placeholder = 'Busca por nombre o código: foco, cable, taladro…'; rec = null; };
      rec.onend = fin; rec.onerror = fin;
      try { rec.start(); } catch { fin(); }
    });
  }

  // ---------- Distancia a la tienda ----------
  function km(a, b) {
    const R = 6371, rad = (x) => x * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-accion="distancia"]'); if (!b) return;
    const out = document.getElementById('resDistancia');
    if (!('geolocation' in navigator)) { out.textContent = 'Tu navegador no permite calcular la distancia.'; return; }
    out.textContent = 'Calculando…';
    navigator.geolocation.getCurrentPosition((pos) => {
      const d = km({lat: pos.coords.latitude, lng: pos.coords.longitude}, T.ubicacion);
      const recta = d < 1 ? Math.round(d * 1000) + ' m' : d.toFixed(1).replace('.', ',') + ' km';
      const min = Math.max(1, Math.round(d * 1.3 / 25 * 60)); // ~25 km/h en ciudad, 30 % más que en línea recta
      const pie = Math.round(d * 1.3 / 4.5 * 60);
      out.innerHTML = 'Estás a <b>' + recta + '</b> de la tienda: unos <b>' + min + ' min</b> en mototaxi o auto' + (d < 3 ? ' o ' + pie + ' min a pie' : '') + '.';
    }, (err) => {
      out.textContent = err.code === 1 ? 'No diste permiso de ubicación. Usa "Cómo llegar" para ver la ruta.' : 'No pudimos obtener tu ubicación.';
    }, {enableHighAccuracy: false, timeout: 10000, maximumAge: 300000});
  });

  // ---------- Pantalla encendida mientras se muestra el QR ----------
  let candado = null;
  async function pedirCandado() {
    if (!('wakeLock' in navigator) || candado || document.hidden) return;
    try { candado = await navigator.wakeLock.request('screen'); candado.addEventListener('release', () => { candado = null; }); } catch { /* no permitido */ }
  }
  function soltarCandado() { if (candado) { candado.release().catch(() => {}); candado = null; } }
  const cont = $('#dlgPagoCont');
  if (cont) new MutationObserver(() => { if (document.getElementById('qrYape')) pedirCandado(); else soltarCandado(); }).observe(cont, {childList: true, subtree: true});
  const dlg = $('#dlgPago'); if (dlg) dlg.addEventListener('close', soltarCandado);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && document.getElementById('qrYape') && dlg && dlg.open) pedirCandado(); });

  // ---------- Feriados en Perú (Nager.Date) ----------
  async function feriados() {
    const hoy = new Date(new Date().toLocaleString('en-US', {timeZone: 'America/Lima'}));
    const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
    const clave = 'mlm-feriados-' + hoy.getFullYear();
    let lista = null;
    try { lista = JSON.parse(sessionStorage.getItem(clave)); } catch { /* vacío */ }
    if (!lista) {
      try {
        const r = await fetch('https://date.nager.at/api/v3/PublicHolidays/' + hoy.getFullYear() + '/PE');
        if (!r.ok) return;
        lista = (await r.json()).map((f) => ({fecha: f.date, nombre: f.localName}));
        try { sessionStorage.setItem(clave, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
      } catch { return; }
    }
    const f = lista.find((x) => x.fecha === iso(hoy)) || lista.find((x) => x.fecha === iso(manana));
    if (!f) return;
    const cuando = f.fecha === iso(hoy) ? 'Hoy' : 'Mañana';
    const barra = document.createElement('div');
    barra.className = 'aviso-feriado'; barra.setAttribute('role', 'note');
    barra.innerHTML = '<div class="caja"><b>' + cuando + ' es feriado</b> (' + f.nombre.replace(/[<>&]/g, '') + '). El horario de atención puede variar: confirma por <a href="' + window.API.waURL('Hola, ¿qué horario tienen ' + cuando.toLowerCase() + ' por el feriado?') + '" target="_blank" rel="noopener">WhatsApp</a> antes de ir a recoger.</div>';
    const franja = $('.franja'); if (franja) franja.after(barra);
  }
  if (document.readyState === 'complete') feriados(); else window.addEventListener('load', feriados);
})();
