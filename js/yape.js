// QR de Yape con el monto incluido.
// El QR de Yape sigue el estándar EMVCo (el mismo de los QR interoperables del BCRP).
// Tomamos el contenido del QR del dueño (config.js → yape.emv), le agregamos el campo 54
// (monto de la transacción) y recalculamos el código de control (CRC, campo 63).
// Así cada compra muestra un QR propio con el total exacto del carrito.
(function () {
  'use strict';

  // CRC-16/CCITT-FALSE, el que exige EMVCo para el campo 63
  function crc16(txt) {
    let crc = 0xFFFF;
    for (let i = 0; i < txt.length; i++) {
      crc ^= txt.charCodeAt(i) << 8;
      for (let b = 0; b < 8; b++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  // "000201010211..." → [{id:'00', v:'01'}, {id:'01', v:'11'}, ...]
  function leer(emv) {
    const out = [];
    let i = 0;
    while (i + 4 <= emv.length) {
      const id = emv.substr(i, 2), n = parseInt(emv.substr(i + 2, 2), 10);
      if (!/^\d{2}$/.test(id) || !Number.isFinite(n)) throw new Error('QR EMV mal formado');
      out.push({id, v: emv.substr(i + 4, n)});
      i += 4 + n;
    }
    if (i !== emv.length) throw new Error('QR EMV incompleto');
    return out;
  }

  const campo = (id, v) => id + String(v.length).padStart(2, '0') + v;

  function validar(emv) {
    try {
      const c = leer(emv), crc = c.find((x) => x.id === '63');
      return !!crc && crc.v === crc16(emv.slice(0, -4));
    } catch { return false; }
  }

  // Devuelve el contenido EMV con el monto (en soles) incluido.
  // modo: '12' = QR dinámico (con monto), '11' = estático con monto.
  function conMonto(emv, soles, modo) {
    const monto = (Math.round(soles * 100) / 100).toFixed(2);
    const c = leer(emv).filter((x) => x.id !== '63' && x.id !== '54');
    const ini = c.find((x) => x.id === '01');
    if (ini) ini.v = modo === '11' ? '11' : '12';
    c.push({id: '54', v: monto});
    c.sort((a, b) => +a.id - +b.id);
    const sinCrc = c.map((x) => campo(x.id, x.v)).join('') + '6304';
    return sinCrc + crc16(sinCrc);
  }

  // Dibuja el QR en un <canvas>, con el monto en el centro
  function dibujar(canvas, texto, etiqueta, opciones) {
    const o = Object.assign({color: '#742384', lado: 560}, opciones);
    const qr = window.qrcode(0, 'H');
    qr.addData(texto);
    qr.make();
    const n = qr.getModuleCount(), margen = 4, celda = Math.floor(o.lado / (n + margen * 2)), lado = celda * (n + margen * 2);
    canvas.width = lado; canvas.height = lado;
    const g = canvas.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, lado, lado);
    g.fillStyle = o.color;
    for (let f = 0; f < n; f++) for (let k = 0; k < n; k++) if (qr.isDark(f, k)) g.fillRect((k + margen) * celda, (f + margen) * celda, celda, celda);
    if (etiqueta) {
      // Recuadro central (el nivel de corrección H tolera hasta ~30 % de área cubierta)
      g.font = '800 ' + Math.round(celda * 3.4) + 'px Barlow, system-ui, sans-serif';
      const w = Math.min(g.measureText(etiqueta).width + celda * 3, lado * 0.42), h = celda * 6.2;
      const x = (lado - w) / 2, y = (lado - h) / 2, r = celda * 1.4;
      g.fillStyle = '#fff';
      g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); g.fill();
      g.lineWidth = Math.max(2, celda * 0.45); g.strokeStyle = o.color; g.stroke();
      g.fillStyle = o.color; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(etiqueta, lado / 2, lado / 2 + celda * 0.2, w - celda * 2);
    }
    return canvas;
  }

  window.YAPE_QR = {crc16, leer, validar, conMonto, dibujar};
})();
