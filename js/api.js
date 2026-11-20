// Conexiones con servicios externos y APIs del navegador.
//  - FormSubmit (API de correo): entrega pedidos y mensajes a la persona que atiende la tienda.
//  - WhatsApp (enlace oficial wa.me): segundo canal directo con la tienda.
//  - Google Maps (Maps URLs): "Cómo llegar".
//  - Clipboard y Web Share del navegador.
(function () {
  const T = window.TIENDA;
  const COLA = 'mlm-pendientes';
  // Formato de correo: usuario@dominio.ext
  //  - usuario: letras, números y . _ % + - (sin empezar/terminar en punto ni dos puntos seguidos)
  //  - dominio: partes de letras/números/guiones separadas por puntos; la extensión final, solo letras (2 o más)
  //  - máximo 254 caracteres en total (límite del estándar)
  //  (sin "lookbehind" en la expresión: los iPhone con iOS antiguo no lo entienden y romperían la página)
  const RX_CORREO = /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]{1,64}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
  const correoValido = (c) => {
    if (typeof c !== 'string') return false;
    c = c.trim();
    return c.length <= 254 && RX_CORREO.test(c) && !c.split('@')[0].endsWith('.');
  };

  const leerCola = () => { try { return JSON.parse(localStorage.getItem(COLA)) || []; } catch { return []; } };
  const guardarCola = (l) => { try { localStorage.setItem(COLA, JSON.stringify(l.slice(-20))); } catch { /* sin almacenamiento */ } };

  // Envía un correo a T.correoPedidos mediante la API AJAX de FormSubmit.
  const enLocal = () => /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  async function enviarCorreo(asunto, campos, replyTo) {
    // Pruebas en tu PC: no se envían correos reales (evita pedidos falsos en tu bandeja)
    if (enLocal() && !T.correoEnLocal) { console.info('[tienda] Correo simulado (localhost):', asunto, campos); return {ok: true, simulado: true}; }
    if (!correoValido(T.correoPedidos)) {
      console.warn('[tienda] Falta configurar "correoPedidos" en js/config.js');
      return {ok: false, motivo: 'sin-correo'};
    }
    const ctrl = new AbortController();
    const corte = setTimeout(() => ctrl.abort(), 15000);
    try {
      const cuerpo = Object.assign({_subject: asunto, _template: 'table', _captcha: 'false', _honey: ''}, campos);
      if (correoValido(replyTo)) cuerpo._replyto = replyTo;
      const r = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(T.correoPedidos), {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(cuerpo),
        signal: ctrl.signal
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && (j.success === true || j.success === 'true')) return {ok: true};
      return {ok: false, motivo: 'rechazado', detalle: j.message || ('HTTP ' + r.status)};
    } catch (e) {
      return {ok: false, motivo: 'red', detalle: String(e)};
    } finally {
      clearTimeout(corte);
    }
  }

  // ---------- Correo del pedido ----------
  const soles = (n) => 'S/ ' + Number(n).toFixed(2);
  const cantTxt = (i) => (Number.isInteger(i.cant) ? i.cant : i.cant.toFixed(2).replace(/0$/, '')) + ' ' + ({unidad: 'unid.', metro: 'm', kg: 'kg', rollo: 'rollo(s)'}[i.unidad] || i.unidad);
  const lineaItem = (i, n) => (n + 1) + '. ' + cantTxt(i) + ' × ' + i.nombre + ' [' + i.codigo + ']  →  ' + soles(i.precio) + ' c/u = ' + soles(i.importe);
  const pagado = (p) => p.pago.estado === 'approved' && (p.pago.metodo === 'yapeauto' || p.pago.metodo === 'pasarela');

  // Qué tiene que hacer la tienda con este pedido, en una línea
  function textoEstadoPago(p) {
    const op = p.pago.operacion, t = soles(p.total);
    if (pagado(p)) return 'PAGADO ✔ ' + p.pago.etiqueta + ' · operación N° ' + op + ' · confirmado por Mercado Pago';
    if (p.pago.metodo === 'yape') return 'POR VERIFICAR: abre tu app Yape y confirma que llegó la operación N° ' + op + ' por ' + t;
    if (p.pago.metodo === 'transferencia') return 'POR VERIFICAR: revisa en tu banco la transferencia N° ' + op + ' por ' + t;
    if (p.pago.metodo === 'tienda') return 'PAGA AL RECOGER: cobrar ' + t + ' (efectivo, Plin o tarjeta)';
    return p.pago.etiqueta + ' · pendiente';
  }
  function asuntoPedido(p) {
    return (pagado(p) ? '✅ PAGADO · ' : '🛒 Nuevo pedido · ') + p.codigo + ' · ' + soles(p.total) + ' · ' + p.cliente.nombre.split(' ')[0] + ' · ' + p.pago.etiqueta;
  }

  function camposPedido(p) {
    const base = p.base != null ? p.base : Math.round(p.total / (1 + T.igv) * 100) / 100;
    const msjCliente = 'Hola ' + p.cliente.nombre.split(' ')[0] + ', te escribimos de Mega Las Malvinas por tu pedido ' + p.codigo + ' (' + soles(p.total) + ').';
    const unidades = p.items.length + (p.items.length === 1 ? ' producto' : ' productos');
    return {
      'Pedido': p.codigo,
      'Fecha y hora': p.fechaTexto,
      'TOTAL A COBRAR': soles(p.total) + '  (IGV incluido)',
      'Estado del pago': textoEstadoPago(p),
      ['Productos (' + unidades + ')']: p.items.map(lineaItem).join('\n'),
      'Subtotal sin IGV': soles(base),
      'IGV (18 %)': soles(p.total - base),
      'Cliente': p.cliente.nombre,
      'Celular': p.cliente.celular,
      'WhatsApp del cliente': 'https://wa.me/51' + p.cliente.celular + '?text=' + encodeURIComponent(msjCliente),
      'email': p.cliente.correo,
      'DNI': p.cliente.dni || 'No indicó',
      'Recoge': p.recojo,
      'Notas del cliente': p.notas || 'Sin notas',
      'Datos personales': p.consentimiento && p.consentimiento.acepto ? 'Autorizó su uso (Ley 29733) · política v' + p.consentimiento.version : 'SIN autorización',
      'Siguiente paso': pagado(p) ? 'Preparar el pedido y avisar al cliente que puede recogerlo.' : 'Verificar el pago, confirmar stock y escribir al cliente por WhatsApp.'
    };
  }

  // Confirmación automática al cliente (FormSubmit la envía al campo "email")
  function respuestaCliente(p) {
    return 'Hola ' + p.cliente.nombre.split(' ')[0] + ', ¡gracias por tu compra en Mega Las Malvinas!\n\n'
      + 'Tu pedido: ' + p.codigo + '\nTotal: ' + soles(p.total) + ' (IGV incluido)\nPago: ' + p.pago.etiqueta + (p.pago.operacion ? ' · operación N° ' + p.pago.operacion : '') + '\n\n'
      + p.items.map(lineaItem).join('\n') + '\n\n'
      + (pagado(p) ? 'Tu pago ya está confirmado. ' : (p.pago.metodo === 'tienda' ? 'Pagarás al recoger. ' : 'Verificaremos tu pago en breve. '))
      + 'Te escribiremos por WhatsApp al ' + p.cliente.celular + ' para confirmar cuándo recoger (' + p.recojo + ').\n'
      + 'Presenta tu código ' + p.codigo + ' en tienda.\n\nMega Las Malvinas · ' + T.lugar + ' · WhatsApp ' + T.telefonoVisible;
  }

  // Registro en Google Sheets (Apps Script). text/plain evita la verificación CORS previa.
  async function registrarEnHoja(p) {
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(T.hojaPedidos || '')) return {ok: false, motivo: 'sin-hoja'};
    // Sin autorización del cliente no se guardan sus datos en la lista de clientes (Ley 29733)
    if (!p.consentimiento || p.consentimiento.acepto !== true) return {ok: false, motivo: 'sin-consentimiento'};
    try {
      const r = await fetch(T.hojaPedidos, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({accion: 'nuevo', pedido: p})});
      const j = await r.json().catch(() => ({}));
      return {ok: !!j.ok};
    } catch (e) { return {ok: false, motivo: 'red'}; }
  }

  async function enviarPedido(p) {
    registrarEnHoja(p); // en paralelo; el correo sigue siendo el aviso principal
    const campos = Object.assign(camposPedido(p), correoValido(p.cliente.correo) ? {_autoresponse: respuestaCliente(p)} : {});
    const r = await enviarCorreo(asuntoPedido(p), campos, p.cliente.correo);
    if (!r.ok) {
      const cola = leerCola().filter((x) => x.codigo !== p.codigo);
      cola.push({tipo: 'pedido', codigo: p.codigo, asunto: asuntoPedido(p), campos, replyTo: p.cliente.correo});
      guardarCola(cola);
    }
    return r;
  }

  async function enviarContacto(d) {
    return enviarCorreo('Mensaje desde la web · ' + d.nombre, {
      'Nombre': d.nombre, 'Correo': d.correo, 'Mensaje': d.mensaje
    }, d.correo);
  }

  // Reintenta los pedidos que no pudieron enviarse (sin conexión, por ejemplo).
  let reintentando = false;
  async function reintentarPendientes() {
    if (reintentando || !correoValido(T.correoPedidos) || !navigator.onLine) return 0;
    reintentando = true;
    let enviados = 0;
    try {
      const cola = leerCola();
      const resto = [];
      for (const it of cola) {
        const r = await enviarCorreo(it.asunto, it.campos, it.replyTo);
        if (r.ok) enviados++; else resto.push(it);
      }
      guardarCola(resto);
    } finally { reintentando = false; }
    return enviados;
  }

  const waURL = (texto) => 'https://wa.me/' + T.whatsapp + (texto ? '?text=' + encodeURIComponent(texto) : '');
  const mapaURL = () => 'https://www.google.com/maps/dir/?api=1&destination=' + T.ubicacion.lat + ',' + T.ubicacion.lng;
  const mapaVerURL = () => T.ubicacion.enlace;
  const mapaEmbedURL = () => 'https://maps.google.com/maps?q=' + T.ubicacion.lat + ',' + T.ubicacion.lng + '&z=17&hl=es&output=embed';

  async function copiar(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      const t = document.createElement('textarea');
      t.value = texto; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0';
      document.body.append(t); t.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      t.remove();
      return ok;
    }
  }

  async function compartir(datos) {
    if (navigator.share) {
      try { await navigator.share(datos); return 'compartido'; } catch (e) { if (e && e.name === 'AbortError') return 'cancelado'; }
    }
    return (await copiar(datos.url)) ? 'copiado' : 'error';
  }

  // ---------- Pasarela de pago (servidor propio en servidor/worker.js) ----------
  // Solo se envían códigos y cantidades: el servidor calcula el total con sus propios precios,
  // así nadie puede pagar menos modificando la página.
  const urlPasarela = () => (T.pasarela && T.pasarela.url || '').replace(/\/+$/, '');
  async function llamar(ruta, opciones) {
    const ctrl = new AbortController(), corte = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(urlPasarela() + ruta, Object.assign({signal: ctrl.signal, headers: {'Content-Type': 'application/json'}}, opciones));
      const j = await r.json().catch(() => ({}));
      return r.ok ? Object.assign({ok: true}, j) : {ok: false, detalle: j.error || ('HTTP ' + r.status)};
    } catch (e) { return {ok: false, detalle: String(e)}; } finally { clearTimeout(corte); }
  }
  async function crearPago(p, urlTienda) {
    if (!urlPasarela()) return {ok: false, detalle: 'sin-pasarela'};
    const r = await llamar('/crear-pago', {method: 'POST', body: JSON.stringify({
      codigo: p.codigo, volver: urlTienda,
      items: p.items.map((i) => ({codigo: i.codigo, cant: i.cant})),
      cliente: {nombre: p.cliente.nombre, correo: p.cliente.correo, celular: p.cliente.celular}
    })});
    if (r.ok && !/^https:\/\//.test(r.url || '')) return {ok: false, detalle: 'respuesta inválida'};
    return r;
  }
  // ---------- Yape automático (Mercado Pago Checkout API) ----------
  let sdkMP = null;
  function cargarSDK() {
    if (window.MercadoPago) return Promise.resolve();
    if (!sdkMP) sdkMP = new Promise((ok, mal) => {
      const s = document.createElement('script'); s.src = 'https://sdk.mercadopago.com/js/v2';
      s.onload = ok; s.onerror = () => { sdkMP = null; mal(new Error('sdk')); }; document.head.append(s);
    });
    return sdkMP;
  }
  // Devuelve el token de un solo uso a partir del celular y el código de aprobación de Yape
  async function tokenYape(celular, otp) {
    try {
      await cargarSDK();
      const mp = new window.MercadoPago(T.pasarela.publicKey);
      const t = await mp.yape({otp: String(otp), phoneNumber: String(celular)}).create();
      const token = t && (t.id || t.token || (typeof t === 'string' ? t : ''));
      return token ? {ok: true, token} : {ok: false, motivo: 'sin-token'};
    } catch (e) { return {ok: false, motivo: String(e && e.message || e)}; }
  }
  const pagarYape = (p, token) => llamar('/pagar-yape', {method: 'POST', body: JSON.stringify({
    codigo: p.codigo, token,
    items: p.items.map((i) => ({codigo: i.codigo, cant: i.cant})),
    cliente: {nombre: p.cliente.nombre, correo: p.cliente.correo, celular: p.cliente.celular}
  })});
  const yapeAutoActivo = () => !!(urlPasarela() && T.pasarela.publicKey);

  const estadoPago = (codigo) => llamar('/estado?ref=' + encodeURIComponent(codigo), {method: 'GET', headers: {}});
  const EN_CURSO = 'mlm-en-curso';
  function guardarEnCurso(p) { try { const l = JSON.parse(localStorage.getItem(EN_CURSO) || '{}'); l[p.codigo] = p; const ks = Object.keys(l).slice(-5); localStorage.setItem(EN_CURSO, JSON.stringify(Object.fromEntries(ks.map((k) => [k, l[k]])))); } catch { /* sin almacenamiento */ } }
  function leerEnCurso(codigo) { try { return (JSON.parse(localStorage.getItem(EN_CURSO) || '{}'))[codigo] || null; } catch { return null; } }

  window.addEventListener('online', () => { reintentarPendientes(); });
  window.API = {correoValido, enviarPedido, registrarEnHoja, enviarContacto, reintentarPendientes, waURL, mapaURL, mapaVerURL, mapaEmbedURL, copiar, compartir, crearPago, estadoPago, guardarEnCurso, leerEnCurso, tokenYape, pagarYape, yapeAutoActivo};
})();
