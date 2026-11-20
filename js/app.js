'use strict';
(() => {
  const T = window.TIENDA, API = window.API, ILUS = window.ILUS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const moneda = (n) => 'S/ ' + new Intl.NumberFormat('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(n);
  const fmtCant = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ''));
  const redondear = (n) => Math.round(n * 100) / 100;

  // ---------- Iconos ----------
  const ICO = {
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    bolt: '<path d="M13.5 2 4 14h7l-1 8 10-13h-7z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.7"/><path d="m16 16 4.7 4.7"/>',
    cart: '<path d="M2 3h3l2.4 12h11.8l2-9H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>',
    heart: '<path d="M20.6 4.9a5.4 5.4 0 0 0-7.6 0l-1 1-1-1a5.4 5.4 0 0 0-7.6 7.6L12 21l8.6-8.5a5.4 5.4 0 0 0 0-7.6Z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    izq: '<path d="m15 5-7 7 7 7"/>', der: '<path d="m9 5 7 7-7 7"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7"/>',
    store: '<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3M9 20v-5h6v5"/>',
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.1"/>',
    descargar: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
    imprimir: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    banco: '<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    wallet: '<path d="M3 7h15a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l11-3v3M16 14h2"/>',
    efectivo: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/>',
    caja: '<path d="m3 7.5 9-4.5 9 4.5v9L12 21 3 16.5zM3 7.5l9 4.5 9-4.5M12 12v9"/>',
    alerta: '<path d="M12 3 2 20h20zM12 10v5M12 17.5v.1"/>',
    bulb: '<path d="M9 17c0-2-3.5-3.3-3.5-7.5a6.5 6.5 0 0 1 13 0c0 4.2-3.5 5.5-3.5 7.5ZM9.5 20h5m-4 2h3"/>',
    cable: '<path d="M4 5v4a3 3 0 0 0 6 0V7a3 3 0 0 1 6 0v9a3 3 0 0 1-6 0v-1m10 3v-4"/><path d="M18 18h4v3h-4zM2 2h4v3H2z"/>',
    switch: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h6v8H9zM9 12h6"/>',
    wrench: '<path d="M20.3 3.8a6 6 0 0 1-7.7 8L5 19.4a2.1 2.1 0 0 1-3-3l7.6-7.6a6 6 0 0 1 8-7.2L14 5.2 17 8z" transform="translate(1 1) scale(.94)"/>',
    hammer: '<path d="m13 10-9 11-2-2 9-11m-3-2 3-3c3-2 6-1 9 2l-3-1-2 3 3 3-3 3z"/>',
    whatsapp: '<path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.45 1.3-2 1.35-.52.05-1.17.07-1.9-.12a9.5 9.5 0 0 1-3.4-1.8 11.3 11.3 0 0 1-3.1-3.9c-.35-.9-.3-1.65.15-2.4.2-.35.6-.8.95-.8h.7c.2 0 .4.05.55.5l.8 1.95c.07.2.1.35-.02.55l-.4.6-.3.35c-.12.15-.25.3-.1.55a8.3 8.3 0 0 0 2.6 2.4c.3.17.5.15.65-.05l.85-1.05c.2-.25.4-.2.65-.1l1.9.95c.28.12.45.2.55.35.1.18.1.65-.12 1.2Z"/>'
  };
  const LLENOS = new Set(['whatsapp']);
  const ico = (n) => '<svg class="ico' + (LLENOS.has(n) ? ' lleno' : '') + '" aria-hidden="true" viewBox="0 0 24 24">' + ICO[n] + '</svg>';
  const pintarIconos = (raiz = document) => $$('[data-ico]', raiz).forEach((el) => { if (!el.firstChild) el.innerHTML = ico(el.dataset.ico); });

  // ---------- Datos ----------
  const porId = new Map(PRODUCTOS.map((p) => [p.id, p]));
  const catDe = (p) => CATEGORIAS.find((c) => c.id === p.cat);
  PRODUCTOS.forEach((p) => { p._h = norm([p.nombre, p.codigo, p.grupo, catDe(p).nombre].join(' ')); });
  const ordenGrupos = [];
  PRODUCTOS.forEach((p) => { const k = p.cat + '|' + p.grupo; if (!ordenGrupos.includes(k)) ordenGrupos.push(k); });
  const ORDEN = PRODUCTOS.slice().sort((a, b) => a.cat - b.cat || ordenGrupos.indexOf(a.cat + '|' + a.grupo) - ordenGrupos.indexOf(b.cat + '|' + b.grupo) || a.id - b.id);
  const ETIQUETA_UNIDAD = {metro: 'Por metro', kg: 'Por kg', rollo: 'Rollo'};
  const decimal = (p) => p.unidad === 'metro' || p.unidad === 'kg';
  const paso = (p) => (p.unidad === 'kg' ? 0.5 : 1);
  const cantidadValida = (p, n) => Number.isFinite(n) && n > 0 && n <= 99999 && (decimal(p) ? Math.abs(n * 100 - Math.round(n * 100)) < 1e-6 : Number.isInteger(n));
  const centimos = (p, n) => Math.round(p.precio * 100 * n);

  // ---------- Estado guardado ----------
  const KEY = 'mlm-v2', KEY_CLIENTE = 'mlm-cliente';
  function leerEstado() {
    try { const a = JSON.parse(localStorage.getItem(KEY)); if (a) return a; } catch { /* vacío */ }
    try { const v = JSON.parse(localStorage.getItem('malvinas-catalogo-v1')); if (v) return v; } catch { /* vacío */ }
    return {};
  }
  const guardado = leerEstado();
  const favoritos = new Set((Array.isArray(guardado.favorites || guardado.favoritos) ? (guardado.favorites || guardado.favoritos) : []).filter((id) => porId.has(id)));
  const carrito = new Map();
  for (const [id, n] of Object.entries(guardado.cart || guardado.carrito || {})) { const p = porId.get(+id); if (p && cantidadValida(p, n)) carrito.set(+id, n); }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify({favoritos: [...favoritos], carrito: Object.fromEntries(carrito)})); } catch { /* sin almacenamiento */ } }
  const leerCliente = () => { try { return JSON.parse(localStorage.getItem(KEY_CLIENTE)) || {}; } catch { return {}; } };
  const guardarCliente = (d) => { try { localStorage.setItem(KEY_CLIENTE, JSON.stringify(d)); } catch { /* sin almacenamiento */ } };

  const totalCent = () => [...carrito].reduce((s, [id, n]) => s + centimos(porId.get(id), n), 0);
  const baseCent = (c) => Math.round(c / (1 + T.igv));
  const nProductos = () => carrito.size;

  // ---------- Avisos ----------
  let tToast;
  function aviso(msg) {
    const t = $('#toast'); clearTimeout(tToast); t.textContent = msg; t.classList.add('visible');
    tToast = setTimeout(() => t.classList.remove('visible'), 2600);
  }

  // ---------- Piezas de interfaz ----------
  const unidadTxt = (p) => (p.unidad === 'unidad' ? 'unidad' : p.unidad);
  // Foto del producto: propia (fotosReales), por tipo (fotosGrupo) o la de js/fotos.js. Sin foto, queda la ilustración.
  function archivoFoto(p) {
    if (T.fotosReales && T.fotosReales.includes(p.codigo)) return 'img/productos/' + p.codigo + '.webp';
    return (T.fotosGrupo && T.fotosGrupo[p.grupo]) || (window.FOTOS && window.FOTOS[p.codigo]) || '';
  }
  function imagen(p, prioridad) {
    const archivo = archivoFoto(p);
    if (!archivo) return ILUS.svg(p);
    // La ilustración queda debajo como respaldo si la foto no carga
    return ILUS.svg(p) + '<img class="foto-real" src="' + esc(archivo) + '" alt="' + esc(p.nombre) + '" width="720" height="720"' + (prioridad ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async" onerror="this.remove()">';
  }
  function ctl(p) {
    const n = carrito.get(p.id);
    if (!n) return '<button class="btn-add" type="button" data-accion="agregar" data-id="' + p.id + '" aria-label="Agregar al carrito: ' + esc(p.nombre) + '">' + ico('cart') + ' Agregar</button>';
    return '<div class="stepper" role="group" aria-label="Cantidad de ' + esc(p.nombre) + '"><button type="button" data-accion="menos" data-id="' + p.id + '" aria-label="Quitar ' + (paso(p) < 1 ? 'media unidad' : 'uno') + '">' + ico('minus') + '</button><span class="cant">' + fmtCant(n) + '</span><button type="button" data-accion="mas" data-id="' + p.id + '" aria-label="Agregar ' + (paso(p) < 1 ? 'media unidad' : 'uno') + ' más">' + ico('plus') + '</button></div>';
  }
  const botonFav = (p, extra = '') => {
    const on = favoritos.has(p.id);
    return '<button class="icon-btn fav ' + extra + '" type="button" data-accion="fav" data-id="' + p.id + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Quitar de favoritos' : 'Guardar en favoritos') + ': ' + esc(p.nombre) + '">' + ico('heart') + '</button>';
  };
  function foto(p, accion = true, prioridad = false) {
    const chip = ILUS.chip(p), et = ETIQUETA_UNIDAD[p.unidad];
    const cont = imagen(p, prioridad) +(et ? '<span class="etq">' + et + '</span>' : '') + (chip ? '<span class="dato">' + esc(chip) + '</span>' : '');
    return accion ? '<button class="foto" type="button" data-accion="ver" data-id="' + p.id + '" aria-label="Ver detalle de ' + esc(p.nombre) + '">' + cont + '</button>' : '<div class="foto">' + cont + '</div>';
  }
  function tarjeta(p) {
    return '<article class="tarjeta">' + foto(p) + botonFav(p)
      + '<div class="tarj-info"><div class="meta"><span>' + esc(catDe(p).corto) + '</span><span class="cod">' + esc(p.codigo) + '</span></div>'
      + '<button class="nombre" type="button" data-accion="ver" data-id="' + p.id + '">' + esc(p.nombre) + '</button>'
      + '<div class="tarj-pie"><div class="precio">' + moneda(p.precio) + '<small>/ ' + esc(unidadTxt(p)) + '</small></div><div data-ctl="' + p.id + '">' + ctl(p) + '</div></div></div></article>';
  }

  // ---------- Búsqueda ----------
  function buscar(q) {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return ORDEN.slice();
    const coincide = (h, t) => h.includes(t) || (t.length > 3 && t.endsWith('s') && h.includes(t.slice(0, -1)));
    const nq = norm(q);
    return ORDEN.filter((p) => terms.every((t) => coincide(p._h, t))).map((p) => {
      const n = norm(p.nombre);
      return {p, s: (norm(p.codigo) === nq ? 6 : 0) + (n.startsWith(nq) ? 3 : 0) + (n.includes(nq) ? 2 : 0)};
    }).sort((a, b) => b.s - a.s).map((x) => x.p);
  }
  const resaltar = (txt, q) => {
    const terms = norm(q).split(/\s+/).filter((t) => t.length > 1);
    if (!terms.length) return esc(txt);
    const n = norm(txt); const marca = new Array(txt.length).fill(false);
    terms.forEach((t) => { let i = n.indexOf(t); while (i !== -1) { for (let k = i; k < i + t.length && k < marca.length; k++) marca[k] = true; i = n.indexOf(t, i + t.length); } });
    let out = '', abierto = false;
    for (let i = 0; i < txt.length; i++) { if (marca[i] && !abierto) { out += '<mark>'; abierto = true; } if (!marca[i] && abierto) { out += '</mark>'; abierto = false; } out += esc(txt[i]); }
    return abierto ? out + '</mark>' : out;
  };

  const inputQ = $('#q'), listaSug = $('#sugerencias');
  let sugActual = -1, sugItems = [];
  function ocultarSug() { listaSug.hidden = true; inputQ.setAttribute('aria-expanded', 'false'); inputQ.removeAttribute('aria-activedescendant'); sugActual = -1; }
  function mostrarSug() {
    const q = inputQ.value.trim();
    if (q.length < 2) return ocultarSug();
    const res = buscar(q);
    sugItems = res.slice(0, 6);
    if (!sugItems.length) listaSug.innerHTML = '<li class="sug-vacio" role="presentation">Sin resultados para «' + esc(q) + '». Prueba con otra palabra.</li>';
    else listaSug.innerHTML = sugItems.map((p, i) => '<li role="option" id="sug-' + i + '" data-id="' + p.id + '" aria-selected="false"><span class="mini">' + imagen(p) + '</span><span class="sug-t"><b>' + resaltar(p.nombre, q) + '</b><small>' + esc(catDe(p).corto) + ' · ' + esc(p.codigo) + '</small></span><span class="sug-p">' + moneda(p.precio) + '</span></li>').join('')
      + (res.length > 6 ? '<li class="sug-todos" role="option" id="sug-todos" data-todos="1" aria-selected="false">Ver los ' + res.length + ' resultados</li>' : '');
    listaSug.hidden = false; inputQ.setAttribute('aria-expanded', 'true'); sugActual = -1;
  }
  function marcarSug(i) {
    const items = $$('#sugerencias [role=option]'); if (!items.length) return;
    sugActual = (i + items.length) % items.length;
    items.forEach((li, k) => li.setAttribute('aria-selected', String(k === sugActual)));
    inputQ.setAttribute('aria-activedescendant', items[sugActual].id);
    items[sugActual].scrollIntoView({block: 'nearest'});
  }
  inputQ.addEventListener('input', mostrarSug);
  inputQ.addEventListener('focus', () => { if (inputQ.value.trim().length >= 2) mostrarSug(); });
  inputQ.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (listaSug.hidden) mostrarSug(); marcarSug(sugActual + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); marcarSug(sugActual - 1); }
    else if (e.key === 'Escape') { ocultarSug(); }
    else if (e.key === 'Enter' && sugActual >= 0) { e.preventDefault(); const li = $$('#sugerencias [role=option]')[sugActual]; li.click(); }
  });
  listaSug.addEventListener('mousedown', (e) => e.preventDefault());
  listaSug.addEventListener('click', (e) => {
    const li = e.target.closest('li'); if (!li) return;
    if (li.dataset.todos) { irCatalogo({q: inputQ.value.trim()}); ocultarSug(); return; }
    if (li.dataset.id) { ocultarSug(); abrirProducto(+li.dataset.id); }
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('#buscador')) ocultarSug(); });
  $('#buscador').addEventListener('submit', (e) => { e.preventDefault(); const q = inputQ.value.trim(); ocultarSug(); irCatalogo({q}); inputQ.blur(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !$('dialog[open]')) { e.preventDefault(); inputQ.focus(); inputQ.select(); }
  });

  // ---------- Rutas ----------
  const hashDe = (r, p = {}) => {
    const a = new URLSearchParams(); Object.entries(p).forEach(([k, v]) => { if (v !== '' && v != null && v !== 0) a.set(k, v); });
    const s = a.toString(); return '#' + r + (s ? '?' + s : '');
  };
  const irCatalogo = (p) => { const h = hashDe('catalogo', p); if (location.hash === h) render(); else location.hash = h; };
  const ANCLAS = ['como-comprar', 'metodos-pago', 'contacto', 'categorias'];
  let vistaActual = '', timerPortada = null;

  function parseHash() {
    const h = location.hash.slice(1); const [r, qs = ''] = h.split('?');
    return {ruta: r || 'inicio', p: new URLSearchParams(qs)};
  }

  function pintarNav(ruta, p) {
    const cat = +p.get('cat') || 0;
    const items = [['inicio', '#inicio', 'Inicio', ruta === 'inicio'], ['cat0', '#catalogo', 'Todo el catálogo', ruta === 'catalogo' && !cat]]
      .concat(CATEGORIAS.map((c) => ['c' + c.id, '#catalogo?cat=' + c.id, c.corto, ruta === 'catalogo' && cat === c.id]));
    $('#nav').innerHTML = items.map((i) => '<a href="' + i[1] + '"' + (i[3] ? ' aria-current="page"' : '') + '>' + i[2] + '</a>').join('')
      + '<span class="espacio"></span><a class="nav-ayuda" href="#como-comprar">Cómo comprar</a>';
  }

  function render() {
    const {ruta, p} = parseHash();
    clearInterval(timerPortada);
    let r = ruta, productoId = 0;
    if (ruta.startsWith('pago/')) { vistaInicio(); vistaActual = 'inicio'; pintarNav('inicio', new URLSearchParams()); pintarIconos(); volverDePago(ruta.slice(5)); return; }
    if (ruta.startsWith('producto/')) { productoId = +ruta.split('/')[1]; r = vistaActual || 'inicio'; }
    else if (ANCLAS.includes(ruta)) r = 'inicio';
    else if (!['inicio', 'catalogo', 'favoritos'].includes(ruta)) r = 'inicio';

    const mismaVista = productoId && vistaActual === r;
    if (!mismaVista) {
      if (r === 'inicio') vistaInicio();
      else if (r === 'catalogo') vistaCatalogo(p);
      else vistaFavoritos();
      vistaActual = r;
    }
    pintarNav(r === 'catalogo' ? 'catalogo' : r, r === 'catalogo' ? p : new URLSearchParams());
    $('#accFav').setAttribute('aria-current', r === 'favoritos' ? 'page' : 'false');
    pintarIconos();
    if (productoId && porId.has(productoId)) { abrirProducto(productoId, true); return; }
    if (ANCLAS.includes(ruta)) { const el = document.getElementById(ruta); if (el) setTimeout(() => el.scrollIntoView(), 30); return; }
    window.scrollTo(0, 0);
  }

  let tituloBase = document.title;
  function titulo(t) { document.title = (t ? t + ' · ' : '') + 'Mega Las Malvinas | Ferretería eléctrica en Barranca'; tituloBase = document.title; }

  // ---------- Inicio ----------
  const SLIDES = [
    {img: 'img/portada-1.webp', pos: '66% 50%', kicker: 'Herramientas', t: 'Perfora, ajusta y <em>termina la obra</em>', s: 'Taladros, brocas, multímetros, alicates y todo para tu instalación.', cat: 4, cta: 'Ver herramientas',
      alt: 'Taladro percutor rojo y negro sobre una mesa de taller, con brocas y un alicate'},
    {img: 'img/portada-2.webp', pos: '72% 50%', kicker: 'Instalación eléctrica', t: 'Cables y accesorios <em>para cada punto</em>', s: 'Cable THW, mellizo, NYY, cajas, canaletas y cintas aislantes.', cat: 2, cta: 'Ver cables',
      alt: 'Alicate universal aislado junto a un cable de cobre rojo sobre una mesa de madera'},
    {img: 'img/portada-3.webp', pos: '80% 50%', kicker: 'Iluminación', t: 'Luz <em>LED</em> para cada espacio', s: 'Focos, reflectores, paneles y lámparas decorativas.', cat: 1, cta: 'Ver iluminación',
      alt: 'Foco de filamento encendido colgando en un taller'}
  ];
  // Foto de fondo de cada tarjeta de categoría (producto representativo)
  const FOTO_CAT = {1: 'img/productos/bulb-3.jpg', 2: 'img/productos/spool-0.jpg', 3: 'img/productos/mcb-1.jpg', 4: 'img/productos/drill-1.jpg', 5: 'img/productos/anchors-3.jpg'};
  const desde = (cat) => moneda(Math.min(...PRODUCTOS.filter((p) => p.cat === cat).map((p) => p.precio)));

  function vistaInicio() {
    titulo('');
    const slides = SLIDES.map((s, i) => '<div class="slide' + (i === 0 ? ' activo' : '') + '" role="group" aria-roledescription="diapositiva" aria-label="' + (i + 1) + ' de ' + SLIDES.length + '"' + (i ? ' aria-hidden="true"' : '') + '>'
      + '<img src="' + s.img + '" alt="' + esc(s.alt) + '" style="object-position:' + s.pos + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + ' decoding="async">'
      + '<div class="slide-txt"><span class="kicker">' + s.kicker + '</span><p class="slide-tit">' + s.t + '</p><p class="slide-sub">' + s.s + ' Desde ' + desde(s.cat) + '.</p>'
      + '<div class="slide-acc"><a class="btn btn-rojo" href="#catalogo?cat=' + s.cat + '"' + (i ? ' tabindex="-1"' : '') + '>' + s.cta + ' ' + ico('der') + '</a><a class="btn btn-claro" href="#catalogo"' + (i ? ' tabindex="-1"' : '') + '>Todo el catálogo</a></div></div></div>').join('');
    const confianza = [['store', 'Recojo en tienda', 'Compra en línea y recoge en Barranca.'], ['wallet', 'Paga como prefieras', 'Yape, transferencia o en tienda.'], ['tag', 'Precios claros', 'Todo en soles, con IGV incluido.'], ['whatsapp', 'Atención directa', 'Consulta medidas y stock por WhatsApp.']];
    $('#vista').innerHTML = '<div class="caja"><h1 class="sr">Mega Las Malvinas, ferretería eléctrica en Barranca</h1>'
      + '<section class="portada" aria-roledescription="carrusel" aria-label="Productos destacados"><div id="slides">' + slides + '</div>'
      + '<div class="slide-ctl"><button class="flecha" type="button" data-accion="slide-prev" aria-label="Diapositiva anterior">' + ico('izq') + '</button><div class="puntos" id="puntos">' + SLIDES.map((s, i) => '<button type="button" data-accion="slide-ir" data-i="' + i + '" aria-label="Ir a la diapositiva ' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : '') + '></button>').join('') + '</div><button class="flecha" type="button" data-accion="slide-next" aria-label="Diapositiva siguiente">' + ico('der') + '</button></div></section>'
      + '<div class="confianza">' + confianza.map((c) => '<div>' + ico(c[0]) + '<p><b>' + c[1] + '</b><span>' + c[2] + '</span></p></div>').join('') + '</div>'
      + '<section class="seccion" id="categorias"><div class="sec-cab"><div><h2 class="titulo">Explora por categoría</h2><p>Encuentra rápido lo que necesitas.</p></div></div><div class="cat-grid">'
      + CATEGORIAS.map((c) => '<a class="cat-card" href="#catalogo?cat=' + c.id + '">' + (FOTO_CAT[c.id] ? '<img class="cat-foto" src="' + FOTO_CAT[c.id] + '" alt="" loading="lazy" decoding="async" width="720" height="720">' : '') + '<span class="cat-ico">' + ico(c.icono) + '</span><span><strong>' + c.nombre + '</strong><small>' + c.texto + '</small></span><span class="cuenta">' + PRODUCTOS.filter((p) => p.cat === c.id).length + ' productos</span></a>').join('') + '</div></section>'
      + '<section class="seccion"><div class="sec-cab"><div><h2 class="titulo">Productos destacados</h2></div><a class="enlace" href="#catalogo">Ver catálogo completo ' + ico('der') + '</a></div><div class="rejilla">' + DESTACADOS.map((id) => tarjeta(porId.get(id))).join('') + '</div></section>'
      + '<section class="seccion seccion-foto" id="como-comprar"><div class="sec-cab"><div><h2 class="titulo">Cómo comprar</h2><p>Tres pasos, sin complicaciones.</p></div></div><div class="pasos">'
      + '<div class="paso">' + ico('cart') + '<h3>Elige tus productos</h3><p>Busca por nombre o código, agrégalos al carrito y ajusta las cantidades.</p></div>'
      + '<div class="paso">' + ico('wallet') + '<h3>Paga con Yape</h3><p>Escanea el QR o yapea al número de la tienda y registra tu número de operación.</p></div>'
      + '<div class="paso">' + ico('store') + '<h3>Recoge en tienda</h3><p>Te escribimos para confirmar tu pedido. Presenta tu código al recoger.</p></div></div>'
      + '<div class="pagos-lista" id="metodos-pago"><div class="pago-card"><b>Yape</b><span>Escanea el QR o yapea al <span data-tel></span>. Es el método más rápido.</span></div><div class="pago-card"><b>Transferencia bancaria</b><span>Cuenta y CCI en soles; los copias con un toque al finalizar tu compra.</span></div><div class="pago-card"><b>Pago en tienda</b><span>Efectivo, Plin o tarjeta al momento de recoger tu pedido.</span></div></div></section>'
      + '<section class="seccion" id="contacto"><div class="contacto"><div class="panel"><h2>Estamos en Barranca</h2><p>Consulta medidas, disponibilidad o pide ayuda para elegir el producto correcto.</p>'
      + '<ul class="datos-lista"><li>' + ico('pin') + '<p><b>Ubicación</b><span>Barranca, Lima, Perú</span></p></li><li>' + ico('whatsapp') + '<p><b>WhatsApp</b><span data-tel></span></p></li><li>' + ico('wallet') + '<p><b>Yape</b><span data-tel></span></p></li></ul>'
      + '<div class="fila-btn"><a class="btn btn-wa" href="#" data-wa target="_blank" rel="noopener">' + ico('whatsapp') + ' Escribir por WhatsApp</a><a class="btn btn-sec" href="#" data-mapa target="_blank" rel="noopener">' + ico('route') + ' Cómo llegar</a></div>'
      + '<p class="distancia"><button class="enlace" type="button" data-accion="distancia">' + ico('pin') + ' ¿A qué distancia estoy de la tienda?</button><span id="resDistancia" role="status"></span></p>'
      + '<div class="mapa"><iframe title="Mapa con la ubicación de Mega Las Malvinas" src="' + esc(API.mapaEmbedURL()) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><a class="enlace" href="' + esc(API.mapaVerURL()) + '" target="_blank" rel="noopener">Abrir en Google Maps ' + ico('der') + '</a></div></div>'
      + '<form class="panel" id="formContacto" novalidate><h2>Escríbenos</h2><p>Déjanos tu mensaje y tu correo; te respondemos lo antes posible.</p>'
      + '<div class="campo"><label for="cNombre">Nombre</label><input id="cNombre" name="nombre" type="text" autocomplete="name" maxlength="80" required><span class="error" id="ecNombre"></span></div>'
      + '<div class="campo"><label for="cCorreo">Correo electrónico</label><input id="cCorreo" name="correo" type="email" autocomplete="email" maxlength="120" placeholder="nombre@correo.com" required><span class="error" id="ecCorreo"></span></div>'
      + '<div class="campo"><label for="cMensaje">Mensaje</label><textarea id="cMensaje" name="mensaje" maxlength="800" required></textarea><span class="error" id="ecMensaje"></span></div>'
      + '<div class="trampa" aria-hidden="true"><label>No llenar<input type="text" name="web" tabindex="-1" autocomplete="off"></label></div>'
      + '<button class="btn btn-rojo btn-block" type="submit" id="btnContacto">Enviar mensaje</button><div id="resContacto" role="status"></div></form></div></section></div>';
    initPortada(); completarEnlaces();
  }

  // Carrusel de portada
  let slideActual = 0;
  function irSlide(i) {
    const s = $$('#slides .slide'); if (!s.length) return;
    slideActual = (i + s.length) % s.length;
    s.forEach((el, k) => { el.classList.toggle('activo', k === slideActual); if (k === slideActual) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true'); $$('a', el).forEach((a) => { if (k === slideActual) a.removeAttribute('tabindex'); else a.tabIndex = -1; }); });
    $$('#puntos button').forEach((b, k) => { if (k === slideActual) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  }
  function initPortada() {
    slideActual = 0;
    const portada = $('.portada'); if (!portada) return;
    const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const arrancar = () => { clearInterval(timerPortada); if (!reducido && !document.hidden) timerPortada = setInterval(() => irSlide(slideActual + 1), 7000); };
    const parar = () => clearInterval(timerPortada);
    portada.addEventListener('mouseenter', parar); portada.addEventListener('mouseleave', arrancar);
    portada.addEventListener('focusin', parar); portada.addEventListener('focusout', arrancar);
    arrancar();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(timerPortada); else if ($('.portada') && vistaActual === 'inicio') { clearInterval(timerPortada); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timerPortada = setInterval(() => irSlide(slideActual + 1), 7000); } });

  // ---------- Catálogo ----------
  let paginaN = 24, filtrosTexto = '', observador = null;
  function filtrar(p) {
    const q = p.get('q') || '', cat = +p.get('cat') || 0, grupo = p.get('grupo') || '', min = parseFloat(p.get('min')), max = parseFloat(p.get('max')), unidad = p.get('unidad') || '';
    let res = buscar(q);
    const base = res;
    if (cat) res = res.filter((x) => x.cat === cat);
    if (grupo) res = res.filter((x) => x.grupo === grupo);
    if (unidad) res = res.filter((x) => x.unidad === unidad);
    if (Number.isFinite(min)) res = res.filter((x) => x.precio >= min);
    if (Number.isFinite(max)) res = res.filter((x) => x.precio <= max);
    const orden = p.get('orden') || '';
    if (orden === 'az') res = res.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    else if (orden === 'menor') res = res.slice().sort((a, b) => a.precio - b.precio);
    else if (orden === 'mayor') res = res.slice().sort((a, b) => b.precio - a.precio);
    return {res, base};
  }
  const paramsObj = (p) => Object.fromEntries([...p.entries()]);

  function vistaCatalogo(p) {
    const q = p.get('q') || '', cat = +p.get('cat') || 0, grupo = p.get('grupo') || '', unidad = p.get('unidad') || '', min = p.get('min') || '', max = p.get('max') || '', orden = p.get('orden') || '';
    const c = CATEGORIAS.find((x) => x.id === cat);
    const {res, base} = filtrar(p);
    paginaN = 24; filtrosTexto = p.toString();
    const tit = q ? 'Resultados de búsqueda' : c ? c.nombre : 'Catálogo de productos';
    titulo(q ? 'Buscar «' + q + '»' : c ? c.nombre : 'Catálogo');
    inputQ.value = q;
    const conteoCat = (id) => base.filter((x) => x.cat === id).length;
    const grupos = cat ? [...new Set(base.filter((x) => x.cat === cat).map((x) => x.grupo))] : [];
    const link = (extra) => hashDe('catalogo', Object.assign(paramsObj(p), extra));
    const activos = [];
    if (q) activos.push(['q', 'Búsqueda: ' + q]); if (c) activos.push(['cat', c.corto]); if (grupo) activos.push(['grupo', grupo]);
    if (unidad) activos.push(['unidad', 'Por ' + unidad]); if (min) activos.push(['min', 'Desde S/ ' + min]); if (max) activos.push(['max', 'Hasta S/ ' + max]);

    const panel = '<aside class="filtros" id="filtros" aria-label="Filtros"><div class="filtros-cab"><h2>Filtros</h2><button class="icon-btn" type="button" data-accion="cerrar-filtros" aria-label="Cerrar filtros">' + ico('close') + '</button></div>'
      + '<div class="fgrupo"><h3>Categoría</h3><div class="flista"><a href="' + link({cat: '', grupo: ''}) + '"' + (!cat ? ' aria-current="true"' : '') + '>Todas <small>' + base.length + '</small></a>'
      + CATEGORIAS.map((x) => '<a href="' + link({cat: x.id, grupo: ''}) + '"' + (cat === x.id ? ' aria-current="true"' : '') + '>' + x.nombre + ' <small>' + conteoCat(x.id) + '</small></a>').join('') + '</div></div>'
      + (grupos.length > 1 ? '<div class="fgrupo"><h3>Tipo de producto</h3><div class="flista"><a href="' + link({grupo: ''}) + '"' + (!grupo ? ' aria-current="true"' : '') + '>Todos</a>' + grupos.map((g) => '<a href="' + link({grupo: g}) + '"' + (grupo === g ? ' aria-current="true"' : '') + '>' + esc(g) + ' <small>' + base.filter((x) => x.cat === cat && x.grupo === g).length + '</small></a>').join('') + '</div></div>' : '')
      + '<div class="fgrupo"><h3>Precio (S/)</h3><form id="formPrecio" class="fprecio"><label>Desde<input type="number" inputmode="decimal" min="0" step="0.5" name="min" value="' + esc(min) + '" placeholder="0"></label><label>Hasta<input type="number" inputmode="decimal" min="0" step="0.5" name="max" value="' + esc(max) + '" placeholder="Sin límite"></label><button class="btn btn-sec btn-peq" style="grid-column:1/-1" type="submit">Aplicar precio</button></form></div>'
      + '<div class="fgrupo"><h3>Se vende por</h3><div class="chips">' + [['', 'Todos'], ['unidad', 'Unidad'], ['metro', 'Metro'], ['kg', 'Kilo'], ['rollo', 'Rollo']].map((u) => '<button class="chip-f" type="button" data-accion="unidad" data-u="' + u[0] + '" aria-pressed="' + (unidad === u[0]) + '">' + u[1] + '</button>').join('') + '</div></div>'
      + '<button class="btn btn-rojo btn-block btn-filtros" type="button" data-accion="cerrar-filtros" style="margin-top:16px">Ver ' + res.length + ' producto' + (res.length === 1 ? '' : 's') + '</button></aside>';

    $('#vista').innerHTML = '<div class="caja"><nav class="migas" aria-label="Ruta"><a href="#inicio">Inicio</a> / ' + (c ? '<a href="#catalogo">Catálogo</a> / ' + c.nombre : 'Catálogo') + '</nav>'
      + '<div class="cat-cab"><div><h1>' + esc(tit) + '</h1>' + (c && !q ? '<p>' + c.texto + '</p>' : '') + '</div></div>'
      + '<div class="cat-layout">' + panel + '<section aria-label="Resultados">'
      + '<div class="res-cab"><span class="num" id="numRes" aria-live="polite">' + res.length + ' producto' + (res.length === 1 ? '' : 's') + '</span><div class="res-ctl"><button class="btn btn-sec btn-peq btn-filtros" type="button" data-accion="filtros">' + ico('filter') + ' Filtros' + (activos.length ? ' (' + activos.length + ')' : '') + '</button>'
      + '<label><span>Ordenar por</span><select id="orden" aria-label="Ordenar por">' + [['', 'Relevancia'], ['az', 'Nombre A–Z'], ['menor', 'Menor precio'], ['mayor', 'Mayor precio']].map((o) => '<option value="' + o[0] + '"' + (orden === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label></div></div>'
      + (activos.length ? '<div class="activos">' + activos.map((a) => '<button type="button" data-accion="quitar-filtro" data-k="' + a[0] + '" aria-label="Quitar filtro ' + esc(a[1]) + '">' + esc(a[1]) + ' ' + ico('close') + '</button>').join('') + '<button class="limpiar" type="button" data-accion="limpiar-filtros">Limpiar todo</button></div>' : '')
      + '<div id="resultados"></div><div class="centro" id="masWrap"></div><div class="centinela" id="centinela"></div></section></div></div><div class="velo" id="velo" data-accion="cerrar-filtros"></div>';
    $('#orden').addEventListener('change', (e) => { const n = new URLSearchParams(location.hash.split('?')[1] || ''); if (e.target.value) n.set('orden', e.target.value); else n.delete('orden'); location.hash = '#catalogo' + (n.toString() ? '?' + n : ''); });
    $('#formPrecio').addEventListener('submit', (e) => {
      e.preventDefault(); const f = new FormData(e.target); const n = new URLSearchParams(location.hash.split('?')[1] || '');
      ['min', 'max'].forEach((k) => { const v = String(f.get(k) || '').trim(); if (v !== '' && Number(v) >= 0) n.set(k, v); else n.delete(k); });
      location.hash = '#catalogo' + (n.toString() ? '?' + n : '');
    });
    pintarResultados(res);
    initObservador(res);
  }
  function pintarResultados(res) {
    const cont = $('#resultados'); if (!cont) return;
    if (!res.length) {
      cont.innerHTML = '<div class="vacio">' + ico('search') + '<h2>Sin coincidencias</h2><p>Prueba con una palabra más corta, como «foco» o «cable», o quita algún filtro.</p><a class="btn btn-rojo" href="#catalogo">Ver todo el catálogo</a></div>';
      $('#masWrap').innerHTML = ''; return;
    }
    cont.innerHTML = '<div class="rejilla">' + res.slice(0, paginaN).map(tarjeta).join('') + '</div>';
    $('#masWrap').innerHTML = res.length > paginaN ? '<button class="btn btn-sec" type="button" data-accion="mas-productos">Mostrar más productos (' + (res.length - paginaN) + ' restantes)</button>' : '';
  }
  function initObservador(res) {
    if (observador) observador.disconnect();
    const cent = $('#centinela'); if (!cent || !('IntersectionObserver' in window)) return;
    observador = new IntersectionObserver((en) => { if (en[0].isIntersecting && vistaActual === 'catalogo') mostrarMas(); }, {rootMargin: '300px'});
    observador.observe(cent);
  }
  function mostrarMas() {
    const p = new URLSearchParams(filtrosTexto); const {res} = filtrar(p);
    if (paginaN >= res.length) return;
    paginaN += 24; pintarResultados(res);
  }
  function cerrarFiltros() { $('#filtros') && $('#filtros').classList.remove('abierto'); $('#velo') && $('#velo').classList.remove('abierto'); }

  function vistaFavoritos() {
    titulo('Mis favoritos'); inputQ.value = '';
    const lista = ORDEN.filter((p) => favoritos.has(p.id));
    $('#vista').innerHTML = '<div class="caja"><nav class="migas" aria-label="Ruta"><a href="#inicio">Inicio</a> / Favoritos</nav><div class="cat-cab"><div><h1>Mis favoritos</h1><p>Los productos que guardaste con el corazón.</p></div></div>'
      + (lista.length ? '<div class="rejilla" id="rejillaFav">' + lista.map(tarjeta).join('') + '</div>' : '<div class="vacio">' + ico('heart') + '<h2>Aún no tienes favoritos</h2><p>Toca el corazón en un producto para guardarlo y encontrarlo después.</p><a class="btn btn-rojo" href="#catalogo">Explorar el catálogo</a></div>') + '</div>';
  }

  // ---------- Diálogos ----------
  function abrir(d) { if (!d.open) d.showModal(); document.body.classList.add('bloqueado'); }
  $$('dialog').forEach((d) => {
    d.addEventListener('close', () => { if (!$('dialog[open]')) document.body.classList.remove('bloqueado'); if (d.id === 'dlgProducto') document.title = tituloBase;
      if (d.id === 'dlgProducto' && location.hash.startsWith('#producto/')) history.replaceState(null, '', '#' + (vistaActual === 'catalogo' ? 'catalogo' : vistaActual)); });
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  });

  function abrirProducto(id, desdeHash) {
    const p = porId.get(id); if (!p) return;
    const rel = PRODUCTOS.filter((x) => x.id !== id && x.cat === p.cat && x.grupo === p.grupo).concat(PRODUCTOS.filter((x) => x.id !== id && x.cat === p.cat && x.grupo !== p.grupo)).slice(0, 4);
    $('#dlgProductoCont').innerHTML = '<button class="icon-btn cerrar" type="button" data-accion="cerrar" aria-label="Cerrar">' + ico('close') + '</button><div class="prod-det">'
      + foto(p, false, true) + '<div class="prod-info-g"><span class="kicker">' + esc(catDe(p).nombre) + ' · ' + esc(p.codigo) + '</span><h2 id="dlgProductoTit">' + esc(p.nombre) + '</h2><p class="desc">' + esc(p.desc) + '</p>'
      + '<div class="prod-precio"><span class="precio">' + moneda(p.precio) + '</span><small class="nota">/ ' + esc(unidadTxt(p)) + '</small></div><p class="nota">IGV incluido · Disponibilidad confirmada al recibir tu pedido.</p>'
      + '<dl class="specs"><div><dt>Código</dt><dd>' + esc(p.codigo) + '</dd></div><div><dt>Categoría</dt><dd>' + esc(catDe(p).nombre) + '</dd></div><div><dt>Tipo</dt><dd>' + esc(p.grupo) + '</dd></div><div><dt>Se vende por</dt><dd>' + esc(unidadTxt(p)) + '</dd></div></dl>'
      + '<div class="prod-acc"><div data-ctl="' + p.id + '" data-grande="1">' + ctlGrande(p) + '</div>' + botonFav(p) + '<button class="icon-btn" type="button" data-accion="compartir" data-id="' + p.id + '" aria-label="Compartir este producto">' + ico('share') + '</button></div>'
      + '<p style="margin-top:14px"><a class="enlace" href="' + API.waURL('Hola, quiero consultar por: ' + p.nombre + ' (' + p.codigo + ')') + '" target="_blank" rel="noopener">' + ico('whatsapp') + ' Consultar este producto por WhatsApp</a></p></div></div>'
      + (rel.length ? '<div class="relacionados"><h3>También te puede interesar</h3><div class="rel-lista">' + rel.map((x) => '<button class="rel" type="button" data-accion="ver" data-id="' + x.id + '">' + foto(x, false) + '<span>' + esc(x.nombre) + '<b>' + moneda(x.precio) + '</b></span></button>').join('') + '</div></div>' : '');
    abrir($('#dlgProducto')); $('#dlgProductoCont').scrollTop = 0;
    if (!desdeHash) { /* no cambiamos la dirección para conservar los filtros */ }
    document.title = p.nombre + ' · Mega Las Malvinas';
  }
  // En la ficha, el control de cantidad ocupa más espacio y añade acceso al carrito
  function ctlGrande(p) {
    const n = carrito.get(p.id);
    if (!n) return '<button class="btn btn-rojo" type="button" data-accion="agregar" data-id="' + p.id + '">' + ico('cart') + ' Agregar al carrito</button>';
    return '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' + ctl(p) + '<button class="btn btn-osc btn-peq" type="button" data-accion="carrito">Ver carrito</button></div>';
  }

  // ---------- Carrito ----------
  function renderCarrito() {
    const foco = document.activeElement && document.activeElement.dataset ? {a: document.activeElement.dataset.accion, id: document.activeElement.dataset.id} : null;
    const lineas = [...carrito].map(([id, n]) => {
      const p = porId.get(id);
      return '<article class="linea"><button class="foto" type="button" data-accion="ver" data-id="' + id + '" aria-label="Ver ' + esc(p.nombre) + '">' + imagen(p) + '</button><div><h3>' + esc(p.nombre) + '</h3><div class="cod">' + esc(p.codigo) + ' · ' + moneda(p.precio) + ' / ' + esc(unidadTxt(p)) + '</div></div>'
        + '<div class="linea-pie"><div class="stepper"><button type="button" data-accion="menos" data-id="' + id + '" aria-label="Quitar ' + (paso(p) < 1 ? 'media unidad' : 'uno') + '">' + ico('minus') + '</button><input type="text" inputmode="decimal" data-accion="cant" data-id="' + id + '" value="' + fmtCant(n) + '" aria-label="Cantidad de ' + esc(p.nombre) + '"><button type="button" data-accion="mas" data-id="' + id + '" aria-label="Agregar ' + (paso(p) < 1 ? 'media unidad' : 'uno') + ' más">' + ico('plus') + '</button></div>'
        + '<b>' + moneda(centimos(p, n) / 100) + '</b><button class="quitar" type="button" data-accion="quitar" data-id="' + id + '">' + ico('trash') + ' Quitar</button></div></article>';
    }).join('');
    const c = totalCent(), b = baseCent(c);
    $('#dlgCarritoCont').innerHTML = '<div class="cj-cab"><h2 id="dlgCarritoTit">Mi carrito<small>' + (nProductos() ? nProductos() + (nProductos() === 1 ? ' producto' : ' productos') : '') + '</small></h2><button class="icon-btn" type="button" data-accion="cerrar" aria-label="Cerrar carrito">' + ico('close') + '</button></div>'
      + (lineas ? '<div class="cj-cuerpo">' + lineas + '</div><div class="cj-pie"><div class="tot-linea"><span>Subtotal</span><span>' + moneda(b / 100) + '</span></div><div class="tot-linea"><span>IGV incluido (18 %)</span><span>' + moneda((c - b) / 100) + '</span></div><div class="tot-linea"><span>Recojo en tienda</span><span>Sin costo</span></div>'
        + '<div class="tot-final"><span>Total</span><b>' + moneda(c / 100) + '</b></div><button class="btn btn-rojo btn-block" type="button" data-accion="pagar">Finalizar compra</button><button class="btn btn-sec btn-block" type="button" data-accion="cerrar">Seguir comprando</button>'
        + '<div class="cj-sec"><button type="button" data-accion="descargar">Descargar lista</button><button type="button" data-accion="vaciar">Vaciar carrito</button></div></div>'
        : '<div class="cj-cuerpo"><div class="cj-vacio">' + ico('cart') + '<h3>Tu carrito está vacío</h3><p>Agrega productos para ver aquí tu total.</p><div class="chips">' + CATEGORIAS.map((x) => '<a class="chip-f" href="#catalogo?cat=' + x.id + '" data-accion="cerrar">' + x.corto + '</a>').join('') + '</div></div></div>');
    if (foco && foco.a && foco.id) { const el = $('#dlgCarritoCont [data-accion="' + foco.a + '"][data-id="' + foco.id + '"]'); if (el) el.focus(); }
  }
  function abrirCarrito() { $('#dlgProducto').open && $('#dlgProducto').close(); renderCarrito(); abrir($('#dlgCarrito')); }

  function refrescar(id) {
    const p = porId.get(id);
    const foco = document.activeElement && document.activeElement.dataset ? {a: document.activeElement.dataset.accion, id: document.activeElement.dataset.id} : null;
    if (p) $$('[data-ctl="' + id + '"]').forEach((el) => { el.innerHTML = el.dataset.grande ? ctlGrande(p) : ctl(p); });
    if (foco && foco.id === String(id) && (foco.a === 'mas' || foco.a === 'menos' || foco.a === 'agregar')) {
      const el = $('[data-ctl="' + id + '"] [data-accion="' + (carrito.has(id) ? (foco.a === 'agregar' ? 'mas' : foco.a) : 'agregar') + '"][data-id="' + id + '"]'); if (el) el.focus();
    }
    actualizarContadores();
    if ($('#dlgCarrito').open) renderCarrito();
  }
  function actualizarContadores() {
    $('#cntCarrito').textContent = nProductos();
    $('#accCarrito').setAttribute('aria-label', 'Abrir carrito, ' + nProductos() + (nProductos() === 1 ? ' producto' : ' productos'));
    const cf = $('#cntFav'); cf.textContent = favoritos.size; cf.hidden = !favoritos.size;
    const fab = $('#fab'); fab.hidden = !nProductos(); fab.classList.toggle('on', !!nProductos());
    $('#fabTxt').textContent = 'Ver carrito · ' + moneda(totalCent() / 100);
  }
  function agregar(id, n = 1) {
    const p = porId.get(id); const nuevo = redondear((carrito.get(id) || 0) + n);
    if (!cantidadValida(p, nuevo)) { aviso('Alcanzaste la cantidad máxima para este producto.'); return; }
    carrito.set(id, nuevo); guardar(); refrescar(id); if (n > 0 && !$('dialog[open]')) aviso('Agregado: ' + p.nombre);
  }
  function ajustar(id, delta) {
    const p = porId.get(id); const n = redondear((carrito.get(id) || 0) + delta);
    if (n <= 0) { carrito.delete(id); } else if (!cantidadValida(p, n)) { aviso('Cantidad no válida.'); return; } else carrito.set(id, n);
    guardar(); refrescar(id);
  }
  function fijar(id, texto) {
    const p = porId.get(id); const n = parseFloat(String(texto).replace(',', '.'));
    if (!cantidadValida(p, n)) { aviso(decimal(p) ? 'Ingresa una cantidad válida (hasta 2 decimales).' : 'Ingresa un número entero mayor que 0.'); renderCarrito(); return; }
    carrito.set(id, n); guardar(); refrescar(id);
  }
  function descargarLista() {
    const hoy = new Intl.DateTimeFormat('es-PE', {timeZone: 'America/Lima'}).format(new Date());
    const lineas = [...carrito].map(([id, n]) => { const p = porId.get(id); return p.codigo + ' | ' + p.nombre + '\r\n  ' + fmtCant(n) + ' ' + p.unidad + ' × ' + moneda(p.precio) + ' = ' + moneda(centimos(p, n) / 100); });
    const txt = ['MEGA LAS MALVINAS · BARRANCA', 'Lista de compras | ' + hoy, '', ...lineas, '', 'TOTAL REFERENCIAL: ' + moneda(totalCent() / 100), 'Precios con IGV incluido. La disponibilidad se confirma al recibir el pedido.'].join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + txt], {type: 'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'Lista-Mega-Las-Malvinas.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 8000);
    aviso('Lista descargada.');
  }

  // ---------- Compra ----------
  const METODOS = {
    yape: {nombre: 'Yape', req: true},
    pasarela: {nombre: (T.pasarela && T.pasarela.nombre) || 'Pago en línea', req: false, enLinea: true},
    transferencia: {nombre: 'Transferencia bancaria', req: true},
    tienda: {nombre: 'Pago en tienda (efectivo, Plin o tarjeta)', req: false}
  };
  const pasarelaActiva = () => !!(T.pasarela && /^https:\/\//.test(T.pasarela.url || ''));

  // ---------- QR de Yape con monto ----------
  let qrValido = null;
  function qrYapeDisponible() {
    if (qrValido === null) qrValido = !!(window.YAPE_QR && window.qrcode && T.yape.emv && window.YAPE_QR.validar(T.yape.emv));
    return qrValido;
  }
  function montarQR() {
    const cv = $('#qrYape'); if (!cv || !qrYapeDisponible()) return;
    const total = totalCent() / 100;
    try {
      const emv = YAPE_QR.conMonto(T.yape.emv, total, T.yape.qrModo);
      YAPE_QR.dibujar(cv, emv, moneda(total));
      cv.dataset.monto = total.toFixed(2);
    } catch (e) {
      console.warn('[tienda] No se pudo generar el QR con monto', e);
      cv.closest('.qr').outerHTML = '<div class="qr"><img src="' + esc(T.yape.qr) + '" alt="Código QR de Yape" width="506" height="506"></div>';
    }
  }
  function guardarQR() {
    const cv = $('#qrYape'); if (!cv) return;
    cv.toBlob((b) => {
      if (!b) { aviso('No se pudo guardar el QR.'); return; }
      const url = URL.createObjectURL(b), a = document.createElement('a');
      a.href = url; a.download = 'Yape-Mega-Las-Malvinas-S' + cv.dataset.monto + '.png'; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 8000); aviso('QR guardado en tus descargas.');
    }, 'image/png');
  }
  let compra = null;
  function nuevaCompra() {
    const c = leerCliente();
    return {paso: 1, enviando: false, datos: {nombre: c.nombre || '', celular: c.celular || '', correo: c.correo || '', dni: c.dni || '', recojo: 'Hoy', notas: '', ok: false}, metodo: 'yape', op: '', pedido: null, resultado: null};
  }
  function abrirCompra() {
    if (!carrito.size) { aviso('Tu carrito está vacío.'); return; }
    $('#dlgCarrito').open && $('#dlgCarrito').close();
    compra = nuevaCompra(); renderCompra(); abrir($('#dlgPago'));
  }
  const pasosHTML = (n) => '<ol class="pasos-compra" aria-label="Pasos de la compra">' + ['Tus datos', 'Pago', 'Listo'].map((t, i) => '<li' + (i + 1 < n ? ' class="hecho"' : '') + (i + 1 === n ? ' aria-current="step"' : '') + '><span>' + t + '</span></li>').join('') + '</ol>';
  function resumenHTML(pedido) {
    const items = pedido ? pedido.items.map((i) => ({nombre: i.nombre, cant: i.cant, unidad: i.unidad, imp: i.importe})) : [...carrito].map(([id, n]) => { const p = porId.get(id); return {nombre: p.nombre, cant: n, unidad: p.unidad, imp: centimos(p, n) / 100}; });
    const c = pedido ? Math.round(pedido.total * 100) : totalCent(), b = baseCent(c);
    return '<aside class="resumen" aria-label="Resumen del pedido"><h3>Tu pedido</h3><div class="res-items">' + items.map((i) => '<div class="res-item"><span>' + fmtCant(i.cant) + ' × ' + esc(i.nombre) + '</span><b>' + moneda(i.imp) + '</b></div>').join('') + '</div>'
      + '<div class="tot-linea"><span>Subtotal</span><span>' + moneda(b / 100) + '</span></div><div class="tot-linea"><span>IGV incluido (18 %)</span><span>' + moneda((c - b) / 100) + '</span></div><div class="tot-linea"><span>Recojo en tienda</span><span>Sin costo</span></div>'
      + '<div class="tot-final"><span>Total</span><b>' + moneda(c / 100) + '</b></div></aside>';
  }
  function renderCompra() {
    const cont = $('#dlgPagoCont'); const c = compra;
    const cerrar = '<button class="icon-btn cerrar" type="button" data-accion="cerrar" aria-label="Cerrar">' + ico('close') + '</button>';
    if (c.paso === 1) {
      const d = c.datos;
      cont.innerHTML = cerrar + '<div class="compra">' + pasosHTML(1) + '<div class="compra-grid"><form id="formDatos" novalidate><h2 id="dlgPagoTit">Tus datos de recojo</h2><p class="sub">Los usamos solo para confirmar y entregar tu pedido.</p>'
        + '<div class="campo"><label for="fNombre">Nombre y apellido</label><input id="fNombre" name="nombre" type="text" autocomplete="name" maxlength="80" value="' + esc(d.nombre) + '" required><span class="error" id="eNombre"></span></div>'
        + '<div class="dos"><div class="campo"><label for="fCelular">Celular</label><input id="fCelular" name="celular" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="12" placeholder="9XX XXX XXX" value="' + esc(d.celular) + '" required><span class="error" id="eCelular"></span></div>'
        + '<div class="campo"><label for="fCorreo">Correo electrónico</label><input id="fCorreo" name="correo" type="email" autocomplete="email" maxlength="120" placeholder="nombre@correo.com" value="' + esc(d.correo) + '" required><span class="error" id="eCorreo"></span></div></div>'
        + '<div class="dos"><div class="campo"><label for="fDni">DNI <span class="op">(opcional, para tu comprobante)</span></label><input id="fDni" name="dni" type="text" inputmode="numeric" maxlength="8" placeholder="8 dígitos" value="' + esc(d.dni) + '"><span class="error" id="eDni"></span></div>'
        + '<div class="campo"><label for="fRecojo">¿Cuándo recoges?</label><select id="fRecojo" name="recojo">' + ['Hoy', 'Mañana', 'En los próximos días'].map((o) => '<option' + (d.recojo === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div></div>'
        + '<div class="campo"><label for="fNotas">Notas para la tienda <span class="op">(opcional)</span></label><textarea id="fNotas" name="notas" maxlength="200" placeholder="Por ejemplo: color del cable, medidas, hora aproximada">' + esc(d.notas) + '</textarea></div>'
        + '<label class="check"><input type="checkbox" id="fAcepto" name="ok"' + (d.ok ? ' checked' : '') + '><span>Acepto que Mega Las Malvinas use estos datos para gestionar mi pedido y contactarme.</span></label><span class="error" id="eAcepto" style="display:block;margin:-8px 0 12px"></span>'
        + '<div class="compra-pie"><button class="btn btn-sec" type="button" data-accion="volver-carrito">' + ico('izq') + ' Volver al carrito</button><button class="btn btn-rojo" type="submit">Continuar al pago ' + ico('der') + '</button></div></form>' + resumenHTML() + '</div></div>';
      setTimeout(() => $('#fNombre') && $('#fNombre').focus(), 60);
    } else if (c.paso === 2) {
      cont.innerHTML = cerrar + '<div class="compra">' + pasosHTML(2) + '<div class="compra-grid"><form id="formPago" novalidate><h2 id="dlgPagoTit">Elige cómo pagar</h2><p class="sub">Total a pagar: <b>' + moneda(totalCent() / 100) + '</b></p>'
        + '<div class="metodos" role="radiogroup" aria-label="Método de pago">'
        + metodoHTML('yape', '<span class="m-ico yape" aria-hidden="true">Y</span>', 'Yape', 'Escanea el QR o yapea al ' + T.yape.numeroVisible, '<span class="rec">Más rápido</span>')
        + (pasarelaActiva() ? metodoHTML('pasarela', '<span class="m-ico" aria-hidden="true">' + ico('shield') + '</span>', 'Tarjeta u otros medios', 'Pago seguro con Mercado Pago, confirmación automática', '') : '')
        + metodoHTML('transferencia', '<span class="m-ico" aria-hidden="true">' + ico('banco') + '</span>', 'Transferencia bancaria', 'Cuenta y CCI en soles', '')
        + metodoHTML('tienda', '<span class="m-ico" aria-hidden="true">' + ico('efectivo') + '</span>', 'Pagar en tienda', 'Efectivo, Plin o tarjeta al recoger', '') + '</div>'
        + '<div id="panelPago">' + panelPagoHTML() + '</div><div id="errPago" role="alert"></div>'
        + '<div class="compra-pie"><button class="btn btn-sec" type="button" data-accion="volver-datos">' + ico('izq') + ' Cambiar datos</button><button class="btn btn-rojo" type="submit" id="btnConfirmar">Confirmar pedido</button></div></form>' + resumenHTML() + '</div></div>';
    } else {
      const ped = c.pedido, r = c.resultado;
      const ped2 = ped, enLinea = ped.pago.metodo === 'pasarela', est = ped.pago.estado;
      if (enLinea && est !== 'approved') {
        const revision = est === 'pending' || est === 'in_process' || est === 'authorized';
        cont.innerHTML = cerrar + '<div class="compra">' + pasosHTML(2) + '<div class="exito"><div class="circ ambar">' + ico('alerta') + '</div><h2 id="dlgPagoTit">' + (revision ? 'Tu pago está en revisión' : 'El pago no se completó') + '</h2>'
          + '<p>Pedido <b>' + esc(ped.codigo) + '</b> · ' + moneda(ped.total) + '</p>'
          + '<div class="msj mal">' + (revision ? 'Mercado Pago está procesando tu pago. Te escribiremos al <b>' + esc(ped.cliente.celular) + '</b> apenas se confirme; no necesitas pagar de nuevo.' : 'No se realizó ningún cobro. Tus productos siguen en el carrito: puedes intentar de nuevo o pagar con Yape.') + '</div>'
          + '<div class="exito-acc" style="max-width:360px;margin:16px auto 0">' + (revision ? '<a class="btn btn-wa btn-block" href="' + API.waURL(mensajePedido(ped)) + '" target="_blank" rel="noopener">' + ico('whatsapp') + ' Avisar a la tienda</a>' : '<button class="btn btn-rojo btn-block" type="button" data-accion="pagar">Intentar de nuevo</button>')
          + '<button class="btn btn-sec btn-block" type="button" data-accion="cerrar-y-seguir">Seguir comprando</button></div></div></div>';
        pintarIconos(cont); return;
      }
      const ok = enLinea || (r && r.ok);
      cont.innerHTML = cerrar + '<div class="compra">' + pasosHTML(3) + '<div class="exito"><div class="circ' + (ok ? '' : ' ambar') + '">' + ico(ok ? 'check' : 'alerta') + '</div><h2 id="dlgPagoTit">' + (enLinea ? '¡Pago aprobado!' : ok ? '¡Pedido recibido!' : 'Pedido guardado') + '</h2>'
        + '<p>Tu código de pedido</p><div class="codigo"><span>' + esc(ped2.codigo) + '</span><button class="btn btn-sec btn-peq" type="button" data-accion="copiar" data-texto="' + esc(ped2.codigo) + '">' + ico('copy') + ' Copiar</button></div>'
        + '<figure class="qr-pedido"><canvas id="qrPedido" role="img" aria-label="Código QR del pedido ' + esc(ped2.codigo) + '"></canvas><figcaption>Muestra este QR al recoger: la tienda lo escanea y encuentra tu pedido al instante.</figcaption></figure>'
        + (ok ? '<div class="msj ok">La tienda ya recibió tu pedido. Te escribiremos al <b>' + esc(ped2.cliente.celular) + '</b> para confirmar disponibilidad y el horario de recojo.</div>'
          : '<div class="msj mal"><b>Tu pedido aún no llegó a la tienda.</b> No se perdió: está guardado en este equipo' + (r && r.motivo === 'red' ? ' y lo reenviaremos apenas haya conexión' : '') + '. Para que lo atiendan ahora, envíalo por WhatsApp con el botón de abajo.</div>')
        + '<div class="exito-grid"><div><div class="exito-acc"><a class="btn ' + (ok ? 'btn-sec' : 'btn-wa') + ' btn-block" href="' + API.waURL(mensajePedido(ped2)) + '" target="_blank" rel="noopener">' + ico('whatsapp') + ' ' + (ok ? 'Enviar copia por WhatsApp' : 'Enviar pedido por WhatsApp') + '</a>'
        + '<button class="btn btn-sec btn-block" type="button" data-accion="imprimir">' + ico('imprimir') + ' Descargar constancia (PDF)</button><button class="btn btn-osc btn-block" type="button" data-accion="cerrar-y-seguir">Seguir comprando</button></div>'
        + '<div class="cuando"><b>Siguiente paso:</b> ' + siguientePaso(ped2) + '</div></div>' + resumenHTML(ped2) + '</div></div></div>';
    }
    pintarIconos(cont);
    if (c.paso === 2) montarQR();
    if (c.paso === 3) qrDelPedido($('#qrPedido'), c.pedido.codigo);
  }
  // QR con el código del pedido: un lector de códigos (o la cámara) en el programa de la tienda lo lee como texto
  function qrDelPedido(canvas, codigo) {
    if (!canvas || !window.YAPE_QR || !window.qrcode) { if (canvas) canvas.closest('figure').remove(); return null; }
    try { YAPE_QR.dibujar(canvas, codigo, '', {color: '#0c1a3d', lado: 260}); return canvas.toDataURL('image/png'); } catch { canvas.closest('figure').remove(); return null; }
  }
  function siguientePaso(p) {
    if (p.pago.metodo === 'tienda') return 'paga en tienda al recoger tu pedido y presenta tu código.';
    if (p.pago.metodo === 'pasarela') return p.pago.estado === 'approved' ? 'tu pago ya está confirmado. Te avisaremos cuando tu pedido esté listo para recoger.' : 'cuando Mercado Pago confirme tu pago te avisaremos por WhatsApp.';
    return 'la tienda verificará tu pago con el N° de operación <b>' + esc(p.pago.operacion) + '</b> antes de entregarte los productos.';
  }
  const metodoHTML = (id, icono, titulo, sub, extra) => '<label class="metodo"><input type="radio" name="metodo" value="' + id + '"' + (compra.metodo === id ? ' checked' : '') + '>' + icono + '<span><b>' + titulo + '</b><small>' + sub + '</small></span>' + extra + '</label>';
  function panelPagoHTML() {
    const m = compra.metodo, monto = moneda(totalCent() / 100);
    const campoOp = (txt) => '<div class="campo" style="margin:16px 0 0"><label for="fOp">N° de operación</label><input id="fOp" name="op" type="text" inputmode="numeric" maxlength="12" placeholder="' + txt + '" value="' + esc(compra.op) + '" required><span class="ayuda">Lo ves en la constancia de tu pago. Sirve para que la tienda confirme tu pedido.</span><span class="error" id="eOp"></span></div>';
    if (m === 'yape') {
      const dinamico = qrYapeDisponible();
      const montoTxt = (totalCent() / 100).toFixed(2);
      const qr = dinamico
        ? '<div class="qr qr-dinamico"><canvas id="qrYape" role="img" aria-label="Código QR de Yape de ' + esc(T.yape.titular) + ', monto a pagar ' + esc(monto) + '"></canvas><button class="enlace-btn" type="button" data-accion="guardar-qr">' + ico('descargar') + ' Guardar QR</button></div>'
        : '<div class="qr"><img src="' + esc(T.yape.qr) + '" alt="Código QR de Yape de ' + esc(T.yape.titular) + '" width="506" height="506"><a href="' + esc(T.yape.qr) + '" download="yape-mega-las-malvinas.png">Guardar QR</a></div>';
      // Yape (cuentas personales) no completa el monto al escanear: el cliente lo escribe.
      const pasos = '<li>Abre Yape, toca <b>Escanear</b> y apunta a este QR (o yapea al número).</li><li>Escribe el monto <b>' + monto + '</b>. Puedes copiarlo con el botón de arriba.</li><li>Confirma y pega abajo el N° de operación.</li>';
      return '<div class="panel-pago yape"><div class="pp-monto"><span>Monto a yapear</span><b>' + monto + '</b><button class="btn btn-yape btn-peq" type="button" data-accion="copiar" data-texto="' + montoTxt + '">' + ico('copy') + ' Copiar monto</button></div><div class="yape-cols">' + qr
        + '<div><p class="titular"><small>Yapea a nombre de</small>' + esc(T.yape.titular) + '</p><div class="copiable"><div><small>Celular Yape</small><b>' + esc(T.yape.numeroVisible) + '</b></div><button class="btn btn-sec btn-peq" type="button" data-accion="copiar" data-texto="' + esc(T.yape.numero) + '">' + ico('copy') + ' Copiar</button></div>'
        + '<ol class="instr">' + pasos + '</ol>'
        + (dinamico ? '<p class="nota-movil">' + ico('info') + '<span>¿Compras desde tu celular? Toca <b>Guardar QR</b> y en Yape elige <b>Escanear → Galería</b> para leerlo desde tus fotos.</span></p>' : '')
        + '</div></div>' + campoOp('Ej.: 12345678') + '</div>';
    }
    if (m === 'pasarela') {
      return '<div class="panel-pago"><div class="pp-monto"><span>Total a pagar</span><b>' + monto + '</b></div><p class="aviso-pago">' + ico('shield') + '<span>Te llevaremos a la página segura de <b>Mercado Pago</b> para pagar con tarjeta de crédito o débito u otros medios disponibles. La tienda no ve ni guarda los datos de tu tarjeta. Al terminar volverás aquí y verás la confirmación del pago.</span></p></div>';
    }
    if (m === 'transferencia') {
      return '<div class="panel-pago"><div class="pp-monto"><span>Monto a transferir</span><b>' + monto + '</b></div><div class="copiable"><div><small>N° de cuenta (soles)</small><b>' + esc(T.banco.cuenta) + '</b></div><button class="btn btn-sec btn-peq" type="button" data-accion="copiar" data-texto="' + esc(T.banco.cuenta) + '">' + ico('copy') + ' Copiar</button></div>'
        + '<div class="copiable"><div><small>CCI (otros bancos)</small><b>' + esc(T.banco.cci) + '</b></div><button class="btn btn-sec btn-peq" type="button" data-accion="copiar" data-texto="' + esc(T.banco.cci) + '">' + ico('copy') + ' Copiar</button></div>' + campoOp('N° de operación de la transferencia') + '</div>';
    }
    return '<div class="panel-pago"><div class="pp-monto"><span>Total a pagar al recoger</span><b>' + monto + '</b></div><p class="aviso-pago">' + ico('info') + '<span>Reservamos tu pedido y pagas en la tienda al recogerlo: efectivo, Plin o tarjeta. Te escribiremos para confirmar disponibilidad.</span></p></div>';
  }

  const rxCel = /^9\d{8}$/;
  const limpiarCel = (v) => v.replace(/[\s\-+()]/g, '').replace(/^51(?=9\d{8}$)/, '');
  function error(id, msg, campo) { const e = $('#' + id); if (e) e.textContent = msg || ''; if (campo) { if (msg) campo.setAttribute('aria-invalid', 'true'); else campo.removeAttribute('aria-invalid'); } return !msg; }
  function validarDatos(f) {
    const nombre = f.nombre.value.trim().replace(/\s+/g, ' '), cel = limpiarCel(f.celular.value.trim()), correo = f.correo.value.trim(), dni = f.dni.value.trim();
    const v = [
      error('eNombre', nombre.length < 3 || !/\p{L}/u.test(nombre) ? 'Escribe tu nombre y apellido.' : '', f.nombre),
      error('eCelular', !rxCel.test(cel) ? 'Ingresa un celular de 9 dígitos que empiece con 9.' : '', f.celular),
      error('eCorreo', !API.correoValido(correo) ? 'Ingresa un correo válido, por ejemplo nombre@correo.com.' : '', f.correo),
      error('eDni', dni && !/^\d{8}$/.test(dni) ? 'El DNI debe tener 8 dígitos.' : '', f.dni),
      error('eAcepto', !f.ok.checked ? 'Marca esta casilla para continuar.' : '')
    ];
    if (v.every(Boolean)) return {nombre, celular: cel, correo, dni, recojo: f.recojo.value, notas: f.notas.value.trim(), ok: true};
    const primero = [f.nombre, f.celular, f.correo, f.dni, f.ok].find((x) => x.getAttribute('aria-invalid') === 'true' || (x === f.ok && !f.ok.checked)); if (primero) primero.focus();
    return null;
  }
  function codigoPedido() {
    const l = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; const a = new Uint8Array(4); crypto.getRandomValues(a);
    const f = new Intl.DateTimeFormat('es-PE', {timeZone: 'America/Lima', year: '2-digit', month: '2-digit', day: '2-digit'}).formatToParts(new Date()).reduce((o, x) => { o[x.type] = x.value; return o; }, {});
    return 'MLM-' + f.year + f.month + f.day + '-' + [...a].map((x) => l[x % l.length]).join('');
  }
  function construirPedido() {
    const items = [...carrito].map(([id, n]) => { const p = porId.get(id); return {id, codigo: p.codigo, nombre: p.nombre, unidad: p.unidad, cant: n, precio: p.precio, importe: centimos(p, n) / 100}; });
    const total = totalCent() / 100, ahora = new Date();
    return {codigo: codigoPedido(), fecha: ahora.toISOString(), fechaTexto: new Intl.DateTimeFormat('es-PE', {timeZone: 'America/Lima', dateStyle: 'full', timeStyle: 'short'}).format(ahora),
      cliente: {nombre: compra.datos.nombre, celular: compra.datos.celular, correo: compra.datos.correo, dni: compra.datos.dni}, recojo: compra.datos.recojo, notas: compra.datos.notas,
      pago: {metodo: compra.metodo, etiqueta: METODOS[compra.metodo].nombre, operacion: METODOS[compra.metodo].req ? compra.op : ''}, items, total, base: baseCent(Math.round(total * 100)) / 100};
  }
  function mensajePedido(p) {
    return ['Hola, soy ' + p.cliente.nombre + '. Hice el pedido ' + p.codigo + ' en la web:', ''].concat(p.items.map((i) => '• ' + fmtCant(i.cant) + ' ' + i.unidad + ' × ' + i.nombre + ' — ' + moneda(i.importe))).concat(['', 'Total: ' + moneda(p.total), 'Pago: ' + p.pago.etiqueta + (p.pago.operacion ? ' (operación ' + p.pago.operacion + ')' : ''), 'Recojo: ' + p.recojo, 'Celular: ' + p.cliente.celular]).join('\n');
  }
  async function confirmarPedido(form) {
    if (compra.enviando) return;
    const m = compra.metodo; compra.op = (form.op ? form.op.value : '').trim();
    $('#errPago').innerHTML = '';
    if (METODOS[m].req) {
      const ok = /^\d{6,12}$/.test(compra.op);
      error('eOp', ok ? '' : 'Ingresa el N° de operación (solo números, entre 6 y 12 dígitos).', form.op);
      if (!ok) { form.op.focus(); return; }
    }
    if (m === 'pasarela') { pagarEnLinea(); return; }
    compra.enviando = true;
    const btn = $('#btnConfirmar'); btn.disabled = true; btn.innerHTML = '<span class="girar" aria-hidden="true"></span> Enviando pedido…';
    const pedido = construirPedido();
    let r;
    try { r = await API.enviarPedido(pedido); } catch (e) { r = {ok: false, motivo: 'red'}; }
    guardarCliente({nombre: pedido.cliente.nombre, celular: pedido.cliente.celular, correo: pedido.cliente.correo, dni: pedido.cliente.dni});
    compra.pedido = pedido; compra.resultado = r; compra.paso = 3; compra.enviando = false;
    carrito.clear(); guardar(); $$('[data-ctl]').forEach((el) => { const p = porId.get(+el.dataset.ctl); if (p) el.innerHTML = el.dataset.grande ? ctlGrande(p) : ctl(p); }); actualizarContadores();
    renderCompra(); $('#dlgPagoCont').scrollTop = 0;
  }
  // Pago en línea: el servidor (carpeta servidor/) crea el cobro en Mercado Pago con los precios del catálogo
  // y devuelve la dirección de pago. Al terminar, Mercado Pago regresa a #pago/CODIGO.
  async function pagarEnLinea() {
    compra.enviando = true;
    const btn = $('#btnConfirmar'); btn.disabled = true; btn.innerHTML = '<span class="girar" aria-hidden="true"></span> Conectando con Mercado Pago…';
    const pedido = construirPedido(); pedido.pago.estado = 'pendiente';
    guardarCliente({nombre: pedido.cliente.nombre, celular: pedido.cliente.celular, correo: pedido.cliente.correo, dni: pedido.cliente.dni});
    const r = await API.crearPago(pedido, location.href.split('#')[0]);
    if (!r.ok) {
      compra.enviando = false; btn.disabled = false; btn.textContent = 'Ir a pagar';
      $('#errPago').innerHTML = '<div class="msj mal">No pudimos conectar con la pasarela de pago. Intenta otra vez en un momento o elige Yape.</div>';
      return;
    }
    API.guardarEnCurso(pedido);
    location.href = r.url;
  }
  async function volverDePago(codigo) {
    const pedido = API.leerEnCurso(codigo);
    if (!pedido) { aviso('No encontramos ese pedido en este equipo.'); return; }
    compra = {paso: 3, enviando: false, datos: {}, metodo: 'pasarela', op: '', pedido, resultado: {ok: true}};
    $('#dlgPagoCont').innerHTML = '<div class="compra"><div class="exito"><span class="girar grande" aria-hidden="true"></span><h2 id="dlgPagoTit">Confirmando tu pago…</h2><p>Consultando a Mercado Pago.</p></div></div>';
    abrir($('#dlgPago'));
    const e = await API.estadoPago(codigo);
    pedido.pago.estado = e.ok ? e.estado : 'desconocido';
    pedido.pago.operacion = e.id ? String(e.id) : '';
    if (pedido.pago.estado === 'approved') {
      if (!pedido.avisado) { pedido.avisado = true; await API.enviarPedido(pedido); }
      carrito.clear(); guardar(); actualizarContadores();
      $$('[data-ctl]').forEach((el) => { const p = porId.get(+el.dataset.ctl); if (p) el.innerHTML = el.dataset.grande ? ctlGrande(p) : ctl(p); });
    }
    API.guardarEnCurso(pedido);
    renderCompra();
    history.replaceState(null, '', location.pathname + location.search + '#inicio');
  }
  function imprimirConstancia() {
    const p = compra && compra.pedido; if (!p) return;
    const z = $('#zonaImpresion');
    const fig = document.createElement('figure'), lienzo = document.createElement('canvas'); fig.append(lienzo);
    const qr = qrDelPedido(lienzo, p.codigo);
    z.innerHTML = '<div class="imp-cab"><div><h1>MEGA LAS MALVINAS</h1><div>Ferretería eléctrica · ' + esc(T.lugar) + '</div><div>WhatsApp ' + esc(T.telefonoVisible) + '</div></div><div style="text-align:right;display:flex;gap:12px;align-items:center"><div><div>Constancia de pedido</div><div class="imp-cod">' + esc(p.codigo) + '</div><div>' + esc(p.fechaTexto) + '</div></div>' + (qr ? '<img src="' + qr + '" alt="" width="96" height="96">' : '') + '</div></div>'
      + '<p><b>Cliente:</b> ' + esc(p.cliente.nombre) + ' · <b>Celular:</b> ' + esc(p.cliente.celular) + ' · <b>Correo:</b> ' + esc(p.cliente.correo) + (p.cliente.dni ? ' · <b>DNI:</b> ' + esc(p.cliente.dni) : '') + '</p>'
      + '<p><b>Recojo:</b> ' + esc(p.recojo) + ' · <b>Pago:</b> ' + esc(p.pago.etiqueta) + (p.pago.operacion ? ' · <b>N° de operación:</b> ' + esc(p.pago.operacion) : '') + '</p>'
      + '<table><thead><tr><th>Código</th><th>Producto</th><th class="d">Cant.</th><th class="d">P. unit.</th><th class="d">Importe</th></tr></thead><tbody>' + p.items.map((i) => '<tr><td>' + esc(i.codigo) + '</td><td>' + esc(i.nombre) + '</td><td class="d">' + fmtCant(i.cant) + ' ' + esc(i.unidad) + '</td><td class="d">' + moneda(i.precio) + '</td><td class="d">' + moneda(i.importe) + '</td></tr>').join('') + '</tbody></table>'
      + '<p style="text-align:right"><b>Subtotal:</b> ' + moneda(p.base) + ' · <b>IGV incluido (18 %):</b> ' + moneda(p.total - p.base) + '<br><span style="font-size:18px"><b>TOTAL: ' + moneda(p.total) + '</b></span></p>'
      + '<p class="imp-nota">Presenta este código al recoger tu pedido. La disponibilidad y el pago se confirman en tienda. Este documento no es un comprobante de pago electrónico.</p>';
    window.print();
  }

  // ---------- Eventos ----------
  const dlgDe = (el) => el.closest('dialog');
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-accion]'); if (!b || b.tagName === 'INPUT') return;
    const a = b.dataset.accion, id = +b.dataset.id;
    switch (a) {
      case 'carrito': abrirCarrito(); break;
      case 'ver': { const d = dlgDe(b); if (d && d.id === 'dlgCarrito') d.close(); abrirProducto(id); break; }
      case 'agregar': agregar(id); break;
      case 'mas': ajustar(id, paso(porId.get(id))); break;
      case 'menos': ajustar(id, -paso(porId.get(id))); break;
      case 'quitar': carrito.delete(id); guardar(); refrescar(id); aviso('Producto quitado del carrito.'); break;
      case 'vaciar':
        if (!b.dataset.seguro) { b.dataset.seguro = '1'; b.textContent = '¿Seguro? Toca otra vez'; setTimeout(() => { if (b.isConnected) { delete b.dataset.seguro; b.textContent = 'Vaciar carrito'; } }, 3000); }
        else { const ids = [...carrito.keys()]; carrito.clear(); guardar(); ids.forEach(refrescar); renderCarrito(); }
        break;
      case 'descargar': descargarLista(); break;
      case 'pagar': abrirCompra(); break;
      case 'cerrar': { const d = dlgDe(b); if (d) d.close(); break; }
      case 'cerrar-y-seguir': $('#dlgPago').close(); break;
      case 'volver-carrito': $('#dlgPago').close(); abrirCarrito(); break;
      case 'volver-datos': compra.paso = 1; renderCompra(); break;
      case 'fav': {
        const p = porId.get(id); const on = !favoritos.has(id); on ? favoritos.add(id) : favoritos.delete(id); guardar();
        $$('[data-accion="fav"][data-id="' + id + '"]').forEach((el) => { el.setAttribute('aria-pressed', String(on)); el.setAttribute('aria-label', (on ? 'Quitar de favoritos' : 'Guardar en favoritos') + ': ' + p.nombre); });
        actualizarContadores(); aviso(on ? 'Guardado en favoritos.' : 'Quitado de favoritos.');
        if (vistaActual === 'favoritos') { vistaFavoritos(); pintarIconos(); }
        break;
      }
      case 'compartir': {
        const p = porId.get(id); const url = location.href.split('#')[0] + '#producto/' + id;
        const r = await API.compartir({title: p.nombre + ' · Mega Las Malvinas', text: p.nombre + ' a ' + moneda(p.precio) + ' en Mega Las Malvinas', url});
        if (r === 'copiado') aviso('Enlace copiado.'); else if (r === 'error') aviso('No se pudo compartir.');
        break;
      }
      case 'copiar': { const ok = await API.copiar(b.dataset.texto); const t = b.innerHTML; b.innerHTML = ico(ok ? 'check' : 'alerta') + (ok ? ' Copiado' : ' Copia manual'); setTimeout(() => { b.innerHTML = t; }, 1600); break; }
      case 'imprimir': imprimirConstancia(); break;
      case 'guardar-qr': guardarQR(); break;
      case 'slide-prev': irSlide(slideActual - 1); break;
      case 'slide-next': irSlide(slideActual + 1); break;
      case 'slide-ir': irSlide(+b.dataset.i); break;
      case 'filtros': $('#filtros').classList.add('abierto'); $('#velo').classList.add('abierto'); break;
      case 'cerrar-filtros': cerrarFiltros(); break;
      case 'mas-productos': mostrarMas(); break;
      case 'unidad': case 'quitar-filtro': case 'limpiar-filtros': {
        const n = new URLSearchParams(location.hash.split('?')[1] || '');
        if (a === 'unidad') { if (b.dataset.u) n.set('unidad', b.dataset.u); else n.delete('unidad'); }
        else if (a === 'limpiar-filtros') ['q', 'cat', 'grupo', 'unidad', 'min', 'max'].forEach((k) => n.delete(k));
        else { n.delete(b.dataset.k); if (b.dataset.k === 'cat') n.delete('grupo'); }
        location.hash = '#catalogo' + (n.toString() ? '?' + n : ''); break;
      }
      default: break;
    }
  });
  // Cantidades escritas a mano en el carrito
  document.addEventListener('change', (e) => { const el = e.target; if (el.matches('input[data-accion="cant"]')) fijar(+el.dataset.id, el.value); });
  document.addEventListener('keydown', (e) => { const el = e.target; if (e.key === 'Enter' && el.matches && el.matches('input[data-accion="cant"]')) { e.preventDefault(); fijar(+el.dataset.id, el.value); } });

  // Formularios (delegados porque se vuelven a dibujar)
  document.addEventListener('submit', async (e) => {
    const f = e.target;
    if (f.id === 'formDatos') {
      e.preventDefault(); const d = validarDatos(f.elements); if (!d) return;
      compra.datos = d; compra.paso = 2; renderCompra(); $('#dlgPagoCont').scrollTop = 0;
    } else if (f.id === 'formPago') {
      e.preventDefault(); confirmarPedido(f.elements);
    } else if (f.id === 'formContacto') {
      e.preventDefault(); enviarContacto(f);
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.name === 'metodo' && compra) {
      const f = e.target.form; compra.op = f.op ? f.op.value : compra.op; compra.metodo = e.target.value;
      $('#panelPago').innerHTML = panelPagoHTML(); pintarIconos($('#panelPago')); montarQR();
      $('#btnConfirmar').textContent = compra.metodo === 'pasarela' ? 'Ir a pagar' : 'Confirmar pedido';
    }
  });
  async function enviarContacto(f) {
    const el = f.elements, res = $('#resContacto'), btn = $('#btnContacto');
    if (el.web.value) return; // campo trampa para bots
    const nombre = el.nombre.value.trim(), correo = el.correo.value.trim(), mensaje = el.mensaje.value.trim();
    const v = [error('ecNombre', nombre.length < 2 ? 'Escribe tu nombre.' : '', el.nombre), error('ecCorreo', !API.correoValido(correo) ? 'Ingresa un correo válido.' : '', el.correo), error('ecMensaje', mensaje.length < 5 ? 'Cuéntanos en qué podemos ayudarte.' : '', el.mensaje)];
    if (!v.every(Boolean)) { [el.nombre, el.correo, el.mensaje].find((x) => x.getAttribute('aria-invalid') === 'true').focus(); return; }
    btn.disabled = true; btn.innerHTML = '<span class="girar" aria-hidden="true"></span> Enviando…'; res.innerHTML = '';
    const r = await API.enviarContacto({nombre, correo, mensaje});
    btn.disabled = false; btn.textContent = 'Enviar mensaje';
    if (r.ok) { res.innerHTML = '<div class="msj ok">¡Gracias, ' + esc(nombre.split(' ')[0]) + '! Recibimos tu mensaje y te responderemos a ' + esc(correo) + '.</div>'; f.reset(); }
    else res.innerHTML = '<div class="msj mal">No pudimos enviar tu mensaje en este momento. Escríbenos directamente por <a href="' + API.waURL('Hola, les escribo desde la web: ' + mensaje) + '" target="_blank" rel="noopener">WhatsApp</a>.</div>';
  }

  // ---------- Arranque ----------
  function completarEnlaces() {
    $$('[data-tel]').forEach((el) => { el.textContent = T.telefonoVisible; });
    $$('[data-wa]').forEach((el) => { el.href = API.waURL('Hola, quisiera hacer una consulta.'); if (!el.target) { el.target = '_blank'; el.rel = 'noopener'; } });
    $$('[data-mapa]').forEach((el) => { el.href = API.mapaURL(); el.target = '_blank'; el.rel = 'noopener'; });
  }
  $('#anio').textContent = new Date().getFullYear();
  $('#pieCats').innerHTML = CATEGORIAS.map((c) => '<li><a href="#catalogo?cat=' + c.id + '">' + c.nombre + '</a></li>').join('');
  pintarIconos(); completarEnlaces(); actualizarContadores();
  window.addEventListener('hashchange', render);
  render();
  API.reintentarPendientes().then((n) => { if (n) aviso('Se enviaron ' + n + ' pedido(s) pendiente(s) a la tienda.'); });
})();
