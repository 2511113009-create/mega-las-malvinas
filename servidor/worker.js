// Servidor de pagos de Mega Las Malvinas · Cloudflare Worker (plan gratuito)
//
// GitHub Pages solo sirve archivos estáticos y no puede guardar una clave secreta.
// Este pequeño servidor guarda el Access Token de Mercado Pago y:
//   POST /crear-pago   → recalcula el total con los precios oficiales y crea el cobro (Checkout Pro)
//   POST /pagar-yape   → cobra con Yape el monto EXACTO del pedido (el cliente solo pone celular + código de aprobación)
//   GET  /estado?ref=X → consulta a Mercado Pago si el pedido X ya fue pagado
//   POST /webhook      → recibe los avisos de Mercado Pago (opcional, solo registra)
//
// Variables (Cloudflare → Workers → tu worker → Settings → Variables):
//   MP_ACCESS_TOKEN  (secreta) Access Token de PRODUCCIÓN de tu cuenta Mercado Pago Perú
//   SITIO            URL pública de la tienda, p. ej. https://usuario.github.io/mega-las-malvinas/
//   ORIGENES         (opcional) orígenes permitidos separados por coma; por defecto el de SITIO

const MP = 'https://api.mercadopago.com';

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origen = req.headers.get('Origin') || '';
    const permitidos = (env.ORIGENES || new URL(env.SITIO).origin).split(',').map((s) => s.trim());
    const cors = {
      'Access-Control-Allow-Origin': permitidos.includes(origen) ? origen : permitidos[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    const json = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {...cors, 'Content-Type': 'application/json'}});

    if (req.method === 'OPTIONS') return new Response(null, {headers: cors});
    try {
      if (url.pathname === '/crear-pago' && req.method === 'POST') return json(await crearPago(await req.json(), {...env, ORIGEN_WORKER: url.origin}));
      if (url.pathname === '/pagar-yape' && req.method === 'POST') return json(await pagarYape(await req.json(), env));
      if (url.pathname === '/estado' && req.method === 'GET') return json(await estado(url.searchParams.get('ref'), env));
      if (url.pathname === '/webhook' && req.method === 'POST') return new Response('ok');
      return json({error: 'No encontrado'}, 404);
    } catch (e) {
      return json({error: e.message || 'Error'}, e.status || 500);
    }
  }
};

function falla(msg, status = 400) { const e = new Error(msg); e.status = status; return e; }

// Precios oficiales: se leen del propio sitio (js/datos.js), la misma fuente que ve el cliente,
// pero calculados aquí, así que modificar la página en el navegador no cambia lo que se cobra.
let cache = {t: 0, mapa: null};
async function catalogo(env) {
  if (cache.mapa && Date.now() - cache.t < 5 * 60 * 1000) return cache.mapa;
  const r = await fetch(new URL('js/datos.js', env.SITIO).href, {cf: {cacheTtl: 300}});
  if (!r.ok) throw falla('No se pudo leer el catálogo', 502);
  const txt = await r.text();
  const ini = txt.indexOf('['), fin = txt.indexOf('];');
  const lista = JSON.parse(txt.slice(ini, fin + 1));
  cache = {t: Date.now(), mapa: new Map(lista.map((p) => [p.codigo, p]))};
  return cache.mapa;
}

async function crearPago(body, env) {
  const codigo = String(body.codigo || '');
  if (!/^MLM-\d{6}-[A-Z0-9]{4}$/.test(codigo)) throw falla('Código de pedido inválido');
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 80) throw falla('Carrito inválido');
  const precios = await catalogo(env);
  const items = body.items.map((i) => {
    const p = precios.get(String(i.codigo));
    const cant = Number(i.cant);
    if (!p) throw falla('Producto no encontrado: ' + i.codigo);
    if (!(cant > 0 && cant <= 99999)) throw falla('Cantidad inválida');
    const entero = p.unidad === 'unidad' || p.unidad === 'rollo';
    if (entero && !Number.isInteger(cant)) throw falla('Cantidad inválida');
    // Mercado Pago pide cantidades enteras: los productos por metro o kg van como una línea con su importe
    return entero
      ? {id: p.codigo, title: p.nombre.slice(0, 250), quantity: cant, unit_price: p.precio, currency_id: 'PEN'}
      : {id: p.codigo, title: (cant + ' ' + p.unidad + ' · ' + p.nombre).slice(0, 250), quantity: 1, unit_price: Math.round(p.precio * cant * 100) / 100, currency_id: 'PEN'};
  });
  const volver = new URL('./', env.SITIO).href + '#pago/' + codigo;
  const c = body.cliente || {};
  const pref = {
    items,
    external_reference: codigo,
    statement_descriptor: 'MEGA MALVINAS',
    payer: {name: String(c.nombre || '').slice(0, 80), email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.correo || '') ? c.correo : undefined},
    back_urls: {success: volver, pending: volver, failure: volver},
    auto_return: 'approved',
    notification_url: env.ORIGEN_WORKER + '/webhook',
    expires: true,
    expiration_date_to: new Date(Date.now() + 2 * 3600 * 1000).toISOString()
  };
  const r = await fetch(MP + '/checkout/preferences', {
    method: 'POST',
    headers: {Authorization: 'Bearer ' + env.MP_ACCESS_TOKEN, 'Content-Type': 'application/json', 'X-Idempotency-Key': codigo},
    body: JSON.stringify(pref)
  });
  const j = await r.json();
  if (!r.ok) throw falla('Mercado Pago rechazó la solicitud', 502);
  return {url: j.init_point, id: j.id};
}

// Yape vía Mercado Pago (Checkout API). El navegador genera un token de un solo uso con el celular y el
// código de aprobación de 6 dígitos de la app Yape (MercadoPago.js → mp.yape().create()); aquí se cobra
// el total calculado con los precios oficiales. El cliente nunca escribe el monto.
const MOTIVOS = {
  cc_rejected_call_for_authorize: 'Yape no autorizó el pago. Revisa tu app o intenta con otro medio.',
  cc_amount_rate_limit_exceeded: 'El monto supera tu límite diario de Yape. Puedes subirlo en tu app (hasta S/ 2,000).',
  cc_unsupported_unsupported: 'Tu Yape no permite este pago. Intenta con otro medio.',
  cc_rejected_card_type_not_allowed: 'Este tipo de cuenta Yape no está permitido.',
  cc_rejected_max_attempts: 'Superaste los intentos permitidos. Espera unos minutos.',
  cc_rejected_bad_filled_security_code: 'El código de aprobación no es correcto o ya venció. Genera uno nuevo en Yape.',
  cc_rejected_form_error: 'Hubo un error con los datos. Revisa tu celular y el código.'
};
async function pagarYape(body, env) {
  const codigo = String(body.codigo || '');
  if (!/^MLM-\d{6}-[A-Z0-9]{4}$/.test(codigo)) throw falla('Código de pedido inválido');
  if (!body.token || typeof body.token !== 'string' || body.token.length > 200) throw falla('Token de Yape inválido');
  const precios = await catalogo(env);
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 80) throw falla('Carrito inválido');
  let cent = 0;
  for (const i of body.items) {
    const p = precios.get(String(i.codigo)), cant = Number(i.cant);
    if (!p) throw falla('Producto no encontrado: ' + i.codigo);
    if (!(cant > 0 && cant <= 99999)) throw falla('Cantidad inválida');
    if ((p.unidad === 'unidad' || p.unidad === 'rollo') && !Number.isInteger(cant)) throw falla('Cantidad inválida');
    cent += Math.round(p.precio * 100 * cant);
  }
  const monto = cent / 100;
  if (monto > 2000) throw falla('Yape permite pagos de hasta S/ 2,000. Elige otro medio para este pedido.');
  const c = body.cliente || {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.correo || '')) throw falla('Falta un correo válido del cliente');
  const correo = c.correo;
  const r = await fetch(MP + '/v1/payments', {
    method: 'POST',
    headers: {Authorization: 'Bearer ' + env.MP_ACCESS_TOKEN, 'Content-Type': 'application/json', 'X-Idempotency-Key': codigo + '-' + body.token.slice(0, 16)},
    body: JSON.stringify({
      token: body.token,
      transaction_amount: monto,
      description: 'Pedido ' + codigo + ' · Mega Las Malvinas',
      installments: 1,
      payment_method_id: 'yape',
      external_reference: codigo,
      payer: {email: correo}
    })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok && !j.status) throw falla('Mercado Pago no pudo procesar el pago', 502);
  return {
    estado: j.status, id: j.id, monto,
    detalle: j.status_detail,
    mensaje: j.status === 'approved' ? 'Pago aprobado' : (MOTIVOS[j.status_detail] || 'Yape rechazó el pago. Intenta de nuevo con un código nuevo.')
  };
}

async function estado(ref, env) {
  if (!/^MLM-\d{6}-[A-Z0-9]{4}$/.test(ref || '')) throw falla('Referencia inválida');
  const r = await fetch(MP + '/v1/payments/search?sort=date_created&criteria=desc&external_reference=' + encodeURIComponent(ref), {
    headers: {Authorization: 'Bearer ' + env.MP_ACCESS_TOKEN}
  });
  if (!r.ok) throw falla('No se pudo consultar Mercado Pago', 502);
  const j = await r.json();
  const pagos = j.results || [];
  const aprobado = pagos.find((p) => p.status === 'approved');
  const p = aprobado || pagos[0];
  if (!p) return {estado: 'sin-pago'};
  return {estado: p.status, id: p.id, monto: p.transaction_amount, medio: p.payment_method_id};
}
