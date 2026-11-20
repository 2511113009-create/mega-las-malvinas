/**
 * Mega Las Malvinas · Registro de pedidos en Google Sheets (gratis, sin servidor)
 *
 * La web envía aquí cada pedido y se guarda como una fila de la hoja "Pedidos".
 * Tu programa en C# consulta y actualiza los pedidos con la misma URL usando una CLAVE secreta.
 *
 * INSTALACIÓN (una sola vez, ~5 minutos):
 *  1. Crea una hoja de cálculo nueva en Google Sheets (sheets.new).
 *  2. Menú Extensiones → Apps Script. Borra lo que haya y pega TODO este archivo. Guarda.
 *  3. Configuración del proyecto (engranaje) → Propiedades de la secuencia de comandos → Agregar:
 *       CLAVE = una contraseña larga inventada por ti (la usará solo tu programa C#)
 *       SITIO = https://2511113009-create.github.io/mega-las-malvinas/
 *  4. Implementar → Nueva implementación → Tipo: Aplicación web
 *       Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier usuario
 *     Autoriza los permisos y copia la URL que termina en /exec.
 *  5. Pega esa URL en js/config.js → hojaPedidos, y también en tu programa C#.
 *
 * API:
 *  POST {accion:'nuevo', pedido:{...}}                       → lo usa la web (no necesita clave)
 *  POST {accion:'estado', clave, codigo, estado, nota}       → cambia el estado (C#)
 *  GET  ?clave=...&codigo=MLM-261120-ABCD                    → un pedido (C#)
 *  GET  ?clave=...&estado=NUEVO                              → lista por estado (C#)
 */

const HOJA = 'Pedidos';
const COLUMNAS = ['Codigo', 'Fecha', 'Cliente', 'Celular', 'Correo', 'DNI', 'Recojo', 'Notas',
  'MetodoPago', 'Operacion', 'TotalWeb', 'TotalCalculado', 'Coincide', 'Productos', 'Estado', 'Actualizado', 'NotaTienda'];
const ESTADOS = ['NUEVO', 'PAGO_VERIFICADO', 'LISTO', 'ENTREGADO', 'ANULADO'];
const RX_CODIGO = /^MLM-\d{6}-[A-Z0-9]{4}$/;

function hoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let h = libro.getSheetByName(HOJA);
  if (!h) {
    h = libro.insertSheet(HOJA);
    h.appendRow(COLUMNAS);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold').setBackground('#0b2260').setFontColor('#ffffff');
  }
  return h;
}

const json_ = (obj) => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
const prop_ = (k) => PropertiesService.getScriptProperties().getProperty(k) || '';
const claveOk_ = (c) => !!prop_('CLAVE') && c === prop_('CLAVE');

function filaAObjeto_(fila) {
  const o = {};
  COLUMNAS.forEach((c, i) => { o[c] = fila[i] instanceof Date ? fila[i].toISOString() : fila[i]; });
  try { o.Productos = JSON.parse(o.Productos || '[]'); } catch (e) { o.Productos = []; }
  return o;
}

function buscarFila_(h, codigo) {
  const datos = h.getRange(2, 1, Math.max(h.getLastRow() - 1, 0), 1).getValues();
  for (let i = 0; i < datos.length; i++) if (datos[i][0] === codigo) return i + 2;
  return 0;
}

// Recalcula el total con los precios publicados en la web (js/datos.js)
function totalReal_(items) {
  try {
    const sitio = prop_('SITIO');
    if (!sitio) return '';
    const cache = CacheService.getScriptCache();
    let txt = cache.get('datos');
    if (!txt) { txt = UrlFetchApp.fetch(sitio.replace(/\/?$/, '/') + 'js/datos.js').getContentText(); cache.put('datos', txt.slice(0, 99000), 600); }
    const lista = JSON.parse(txt.slice(txt.indexOf('['), txt.indexOf('];') + 1));
    const precios = {};
    lista.forEach((p) => { precios[p.codigo] = p.precio; });
    let cent = 0;
    items.forEach((i) => { cent += Math.round((precios[i.codigo] || 0) * 100 * Number(i.cant)); });
    return cent / 100;
  } catch (e) { return ''; }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const h = hoja_();
    if (d.accion === 'nuevo') {
      const p = d.pedido || {};
      if (!RX_CODIGO.test(p.codigo || '')) return json_({ok: false, error: 'codigo'});
      if (buscarFila_(h, p.codigo)) return json_({ok: true, repetido: true});
      const items = (p.items || []).slice(0, 80).map((i) => ({codigo: String(i.codigo), nombre: String(i.nombre).slice(0, 120), cant: Number(i.cant), unidad: String(i.unidad), precio: Number(i.precio), importe: Number(i.importe)}));
      const calc = totalReal_(items);
      const c = p.cliente || {};
      const txt = (v, n) => String(v == null ? '' : v).slice(0, n).replace(/^[=+\-@]/, "'$&"); // evita fórmulas inyectadas
      h.appendRow([p.codigo, new Date(), txt(c.nombre, 80), "'" + txt(c.celular, 12), txt(c.correo, 120), "'" + txt(c.dni, 8), txt(p.recojo, 30), txt(p.notas, 200),
        txt(p.pago && p.pago.etiqueta, 60), "'" + txt(p.pago && p.pago.operacion, 20), Number(p.total) || 0, calc, calc === '' ? '' : Math.abs(calc - Number(p.total)) < 0.01,
        JSON.stringify(items), 'NUEVO', new Date(), '']);
      return json_({ok: true});
    }
    if (d.accion === 'estado') {
      if (!claveOk_(d.clave)) return json_({ok: false, error: 'clave'});
      if (ESTADOS.indexOf(d.estado) < 0) return json_({ok: false, error: 'estado'});
      const fila = buscarFila_(h, d.codigo);
      if (!fila) return json_({ok: false, error: 'no-existe'});
      h.getRange(fila, COLUMNAS.indexOf('Estado') + 1).setValue(d.estado);
      h.getRange(fila, COLUMNAS.indexOf('Actualizado') + 1).setValue(new Date());
      if (d.nota) h.getRange(fila, COLUMNAS.indexOf('NotaTienda') + 1).setValue(String(d.nota).slice(0, 200));
      return json_({ok: true});
    }
    return json_({ok: false, error: 'accion'});
  } catch (err) {
    return json_({ok: false, error: String(err)});
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const q = e.parameter || {};
  if (!claveOk_(q.clave)) return json_({ok: false, error: 'clave'});
  const h = hoja_();
  if (q.codigo) {
    const fila = buscarFila_(h, String(q.codigo).trim().toUpperCase());
    if (!fila) return json_({ok: false, error: 'no-existe'});
    return json_({ok: true, pedido: filaAObjeto_(h.getRange(fila, 1, 1, COLUMNAS.length).getValues()[0])});
  }
  const n = h.getLastRow() - 1;
  const filas = n > 0 ? h.getRange(2, 1, n, COLUMNAS.length).getValues() : [];
  const lista = filas.map(filaAObjeto_).filter((p) => !q.estado || p.Estado === q.estado).slice(-200);
  return json_({ok: true, pedidos: lista});
}
