// Conexiones con servicios externos y APIs del navegador.
//  - FormSubmit (API de correo): entrega pedidos y mensajes a la persona que atiende la tienda.
//  - WhatsApp (enlace oficial wa.me): segundo canal directo con la tienda.
//  - Google Maps (Maps URLs): "Cómo llegar".
//  - Clipboard y Web Share del navegador.
(function () {
  const T = window.TIENDA;
  const COLA = 'mlm-pendientes';
  const correoValido = (c) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c || '');

  const leerCola = () => { try { return JSON.parse(localStorage.getItem(COLA)) || []; } catch { return []; } };
  const guardarCola = (l) => { try { localStorage.setItem(COLA, JSON.stringify(l.slice(-20))); } catch { /* sin almacenamiento */ } };

  // Envía un correo a T.correoPedidos mediante la API AJAX de FormSubmit.
  async function enviarCorreo(asunto, campos, replyTo) {
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

  const lineaItem = (i) => i.cant + ' ' + i.unidad + ' × ' + i.nombre + ' (' + i.codigo + ') = S/ ' + i.importe.toFixed(2);

  function camposPedido(p) {
    return {
      'Pedido': p.codigo,
      'Fecha': p.fechaTexto,
      'Cliente': p.cliente.nombre,
      'Celular': p.cliente.celular,
      'Correo del cliente': p.cliente.correo,
      'DNI': p.cliente.dni || '—',
      'Recojo': p.recojo,
      'Notas': p.notas || '—',
      'Método de pago': p.pago.etiqueta + (p.pago.metodo === 'pasarela' ? (p.pago.estado === 'approved' ? ' · APROBADO por Mercado Pago (verifica en tu panel)' : ' · pendiente') : ''),
      'N° de operación': p.pago.operacion || '—',
      'Productos': p.items.map(lineaItem).join('\n'),
      'Total (IGV incluido)': 'S/ ' + p.total.toFixed(2)
    };
  }

  async function enviarPedido(p) {
    const r = await enviarCorreo('Nuevo pedido ' + p.codigo + ' · S/ ' + p.total.toFixed(2), camposPedido(p), p.cliente.correo);
    if (!r.ok) {
      const cola = leerCola().filter((x) => x.codigo !== p.codigo);
      cola.push({tipo: 'pedido', codigo: p.codigo, asunto: 'Nuevo pedido ' + p.codigo + ' · S/ ' + p.total.toFixed(2), campos: camposPedido(p), replyTo: p.cliente.correo});
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
  const estadoPago = (codigo) => llamar('/estado?ref=' + encodeURIComponent(codigo), {method: 'GET', headers: {}});
  const EN_CURSO = 'mlm-en-curso';
  function guardarEnCurso(p) { try { const l = JSON.parse(localStorage.getItem(EN_CURSO) || '{}'); l[p.codigo] = p; const ks = Object.keys(l).slice(-5); localStorage.setItem(EN_CURSO, JSON.stringify(Object.fromEntries(ks.map((k) => [k, l[k]])))); } catch { /* sin almacenamiento */ } }
  function leerEnCurso(codigo) { try { return (JSON.parse(localStorage.getItem(EN_CURSO) || '{}'))[codigo] || null; } catch { return null; } }

  window.addEventListener('online', () => { reintentarPendientes(); });
  window.API = {correoValido, enviarPedido, enviarContacto, reintentarPendientes, waURL, mapaURL, mapaVerURL, mapaEmbedURL, copiar, compartir, crearPago, estadoPago, guardarEnCurso, leerEnCurso};
})();
