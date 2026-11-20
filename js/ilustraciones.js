// Ilustraciones de producto en SVG, dibujadas por tipo de artículo.
// Si existe una foto real en img/productos/CODIGO.webp, la página la usa en su lugar
// (ver función imagenProducto en app.js). Estas ilustraciones son el respaldo.
(function () {
  const K = {ink:'#252a2d', steel:'#c4cbcf', steel2:'#98a2a8', red:'#c8322b', red2:'#9f241f', yel:'#f2b705', yel2:'#cf9800',
    cop:'#c7772e', blk:'#2b2f32', blue:'#2f6fa3', green:'#2e8b57', wht:'#fafaf8'};
  const DEFS = '<defs>'
    + '<linearGradient id="gC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe6ea"/></linearGradient>'
    + '<linearGradient id="gW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c9"/><stop offset="1" stop-color="#ffc659"/></linearGradient>'
    + '<linearGradient id="gS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef1f2"/><stop offset=".5" stop-color="#b6bfc4"/><stop offset="1" stop-color="#8e989e"/></linearGradient>'
    + '<linearGradient id="gR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0564d"/><stop offset="1" stop-color="#a5251f"/></linearGradient>'
    + '<linearGradient id="gB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#555b60"/><stop offset="1" stop-color="#25292c"/></linearGradient>'
    + '<linearGradient id="gY" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd84d"/><stop offset="1" stop-color="#e3a400"/></linearGradient>'
    + '<linearGradient id="gP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e5e5"/></linearGradient>'
    + '<linearGradient id="gBl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f8fc4"/><stop offset="1" stop-color="#245a88"/></linearGradient>'
    + '<radialGradient id="gG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".95"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>'
    + '</defs>';

  const R = (x, y, w, h, r, f, x2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" ${x2 || ''}/>`;
  const E = (cx, cy, rx, ry, f, x2) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${x2 || ''}/>`;
  const C = (cx, cy, r, f, x2) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" ${x2 || ''}/>`;
  const P = (d, f, x2) => `<path d="${d}" fill="${f}" ${x2 || ''}/>`;
  const S = (d, c, w, x2) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x2 || ''}/>`;
  const L = (x1, y1, x2, y2, c, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const sombra = (cx = 120, rx = 58, cy = 158) => E(cx, cy, rx, 7, '#1b1f21', 'opacity=".13"');
  const brillo = (d) => S(d, '#fff', 5, 'opacity=".75"');
  const G = (t, inner) => `<g transform="${t}">${inner}</g>`;

  // ---------- Iluminación ----------
  const baseE27 = (w = 42) => {
    const x = 120 - w / 2;
    return R(x - 1, 114, w + 2, 6, 2, '#dfe3e5')
      + R(x, 120, w, 26, 4, 'url(#gS)')
      + L(x + 2, 127, x + w - 2, 127, '#7f8a91', 2) + L(x + 2, 134, x + w - 2, 134, '#7f8a91', 2) + L(x + 2, 141, x + w - 2, 141, '#7f8a91', 2)
      + P(`M${120 - w / 4} 146h${w / 2}l-4 8h${-(w / 2 - 8)}z`, '#3a3f43');
  };
  const vidrioA = (g, extra = '') => P('M98 115C98 107 94 103 88 95A42 42 0 1 1 152 95C146 103 142 107 142 115Z', g, 'stroke="#1f2427" stroke-opacity=".14"') + extra + brillo('M96 56a32 32 0 0 1 14-19');
  const focoA = (calido) => sombra() + vidrioA(calido ? 'url(#gW)' : 'url(#gC)') + (calido ? E(120, 74, 20, 20, 'url(#gG)') : '') + baseE27();
  const focoHP = () => sombra() + R(80, 30, 80, 64, 28, 'url(#gC)', 'stroke="#1f2427" stroke-opacity=".14"') + brillo('M92 50a26 26 0 0 1 12-12')
    + R(86, 92, 68, 28, 3, '#cfd6da') + [92, 100, 108, 116, 124, 132, 140, 148].map(x => L(x, 94, x, 118, '#a4aeb4', 2)).join('')
    + R(96, 118, 48, 28, 4, 'url(#gS)') + L(98, 126, 142, 126, '#7f8a91', 2) + L(98, 134, 142, 134, '#7f8a91', 2) + P('M108 146h24l-4 8h-16z', '#3a3f43');
  const candle = () => sombra() + P('M120 22C134 44 144 60 144 82C144 98 134 110 120 112C106 110 96 98 96 82C96 60 106 44 120 22Z', 'url(#gW)', 'stroke="#1f2427" stroke-opacity=".12"')
    + E(120, 84, 16, 22, 'url(#gG)') + brillo('M104 76a20 28 0 0 1 8-20') + R(104, 112, 32, 6, 2, '#dfe3e5') + R(105, 118, 30, 24, 4, 'url(#gS)')
    + L(107, 125, 133, 125, '#7f8a91', 2) + L(107, 132, 133, 132, '#7f8a91', 2) + P('M112 142h16l-3 8h-10z', '#3a3f43');
  const tubo = () => sombra(120, 88) + R(24, 78, 192, 26, 13, 'url(#gC)', 'stroke="#1f2427" stroke-opacity=".14"') + R(24, 80, 14, 22, 6, '#aab3b8') + R(202, 80, 14, 22, 6, '#aab3b8')
    + L(16, 91, 24, 91, '#8e989e', 3) + L(216, 91, 224, 91, '#8e989e', 3) + S('M48 84h140', '#fff', 4, 'opacity=".9"')
    + [56, 76, 96, 116, 136, 156, 176].map(x => C(x, 95, 2.4, '#cfe3f3')).join('');
  const dicroico = () => sombra() + R(106, 126, 6, 22, 2, '#b8c0c5') + R(128, 126, 6, 22, 2, '#b8c0c5') + C(120, 82, 48, 'url(#gS)', 'stroke="#1f2427" stroke-opacity=".18"')
    + C(120, 82, 38, '#f8f9f8') + C(120, 82, 30, 'url(#gW)') + [[120, 82], [120, 68], [132, 75], [132, 89], [120, 96], [108, 89], [108, 75]].map(p => C(p[0], p[1], 5, '#fff7dc', 'stroke="#d9a63a" stroke-width="1.5"')).join('');
  const filamento = () => sombra() + P('M96 114C96 102 88 96 88 78C88 52 102 32 120 32C138 32 152 52 152 78C152 96 144 102 144 114Z', 'url(#gW)', 'stroke="#8a5a14" stroke-opacity=".35"')
    + S('M112 112V88l4-10-6-10 6-10-4-8M128 112V88l-4-10 6-10-6-10 4-8', '#e8820c', 3) + E(120, 74, 22, 28, 'url(#gG)') + brillo('M98 66a28 32 0 0 1 8-18') + baseE27();
  const rgb = () => sombra(96) + vidrioA('url(#gC)') + C(112, 66, 13, '#e53935', 'opacity=".75"') + C(130, 66, 13, '#2e8b57', 'opacity=".75"') + C(121, 82, 13, '#2f6fa3', 'opacity=".75"')
    + baseE27() + R(184, 66, 30, 66, 8, '#2b2f32') + [['#e53935', 194, 78], ['#2e8b57', 204, 78], ['#2f6fa3', 194, 90], ['#f2b705', 204, 90], ['#fff', 194, 102], ['#fff', 204, 102]].map(c => C(c[1], c[2], 4, c[0])).join('') + sombra(199, 18);
  const emergencia = () => focoA(false) + R(150, 112, 42, 26, 6, '#fff', 'stroke="#252a2d" stroke-width="2.5"') + R(192, 120, 5, 10, 2, '#252a2d') + P('M174 116l-9 12h7l-2 8 10-13h-7z', '#2e8b57');
  const incandescente = () => sombra() + P('M98 115C98 107 94 103 88 95A42 42 0 1 1 152 95C146 103 142 107 142 115Z', '#f6f2e3', 'stroke="#1f2427" stroke-opacity=".16" opacity=".85"')
    + S('M114 114V92M126 114V92', '#9a8f78', 2) + S('M110 92q5-10 10 0t10 0', '#7a6a4a', 3) + E(120, 80, 18, 18, 'url(#gG)', 'opacity=".5"') + brillo('M96 56a32 32 0 0 1 14-19') + baseE27();
  const espiral = () => {
    const helice = 'M146 38C146 50 94 50 94 62S146 74 146 86 94 98 94 110 146 122 146 128';
    return sombra() + S(helice, '#8e989e', 16, 'opacity=".45"') + S(helice, '#f6f7f7', 12) + S(helice, '#fff', 3, 'opacity=".9" transform="translate(-3 -2)"') + R(94, 112, 52, 8, 3, '#f1f1ee') + baseE27(40);
  };

  const reflector = (v) => {
    const panel = v === 'rgb' ? [['#e53935', 90], ['#2e8b57', 120], ['#2f6fa3', 150]].map(c => C(c[1], 88, 14, c[0], 'opacity=".85"')).join('') : '';
    const solar = v === 'solar' ? G('translate(0,-6)', P('M70 20h100l-12 36H82z', 'url(#gBl)') + L(104, 20, 98, 56, '#9bc3e6', 1.5) + L(137, 20, 142, 56, '#9bc3e6', 1.5) + L(76, 38, 164, 38, '#9bc3e6', 1.5)) : '';
    const y = v === 'solar' ? 62 : 44;
    return sombra() + solar + S(`M64 ${y + 66}q0 20 20 20h72q20 0 20-20`, '#8e989e', 5) + L(120, y + 78, 120, 146, '#8e989e', 6) + R(104, 144, 32, 8, 3, '#3a3f43')
      + R(56, y, 128, 74, 12, 'url(#gB)') + R(66, y + 9, 108, 56, 7, v === 'rgb' ? '#f4f4f4' : 'url(#gC)')
      + (v === 'rgb' ? panel : [[84, 0], [104, 0], [124, 0], [144, 0], [94, 1], [114, 1], [134, 1], [154, 1]].map(p => C(p[0] + 4, y + 22 + p[1] * 20, 5.5, '#fffbea', 'stroke="#d4dadd" stroke-width="1.5"')).join(''));
  };

  const colgante = () => L(120, 0, 120, 42, '#252a2d', 2.5) + R(112, 38, 16, 10, 3, '#252a2d') + P('M64 116Q64 52 120 50Q176 52 176 116Z', 'url(#gB)') + S('M76 104Q80 66 112 58', '#fff', 4, 'opacity=".25"')
    + E(120, 116, 56, 9, 'url(#gW)') + P('M70 120h100l22 36H48z', 'url(#gG)', 'opacity=".55"') + sombra(120, 52, 160);
  const techoRedondo = () => R(30, 52, 180, 10, 3, '#d5d9db') + R(46, 62, 148, 24, 5, 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".12"') + E(120, 86, 74, 22, 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".12"') + E(120, 88, 58, 14, 'url(#gW)') + E(120, 88, 58, 14, 'url(#gG)', 'opacity=".7"') + sombra(120, 70, 150);
  const plafon = () => R(30, 44, 180, 10, 3, '#d5d9db') + P('M52 70l20-16h96l20 16v58a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z', 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".14"') + R(66, 82, 108, 44, 6, 'url(#gW)') + R(66, 82, 108, 44, 6, 'url(#gG)', 'opacity=".6"') + sombra(120, 70, 152);
  const lamparaMesa = () => sombra() + E(120, 150, 36, 8, '#3a3f43') + R(113, 94, 14, 56, 4, 'url(#gS)') + P('M80 96l14-52h52l14 52z', '#f3e9d2', 'stroke="#1f2427" stroke-opacity=".15"') + P('M94 44h52l-4 14H98z', '#fff', 'opacity=".5"') + E(120, 98, 40, 6, 'url(#gW)');
  const arana = () => L(120, 0, 120, 44, '#8b6a1a', 3) + C(120, 50, 9, 'url(#gY)') + S('M120 56C96 56 72 60 60 84', '#b98a14', 4) + S('M120 56C144 56 168 60 180 84', '#b98a14', 4) + S('M120 58C108 70 96 82 94 100', '#b98a14', 4) + S('M120 58C132 70 144 82 146 100', '#b98a14', 4) + L(120, 58, 120, 92, '#b98a14', 4)
    + [[60, 84], [94, 100], [120, 92], [146, 100], [180, 84]].map(p => P(`M${p[0]} ${p[1] - 18}c6 8 8 12 8 18a8 8 0 0 1-16 0c0-6 2-10 8-18z`, 'url(#gW)', 'stroke="#8a5a14" stroke-opacity=".3"') + R(p[0] - 4, p[1] + 6, 8, 5, 2, '#b98a14')).join('')
    + [[60, 98], [94, 114], [120, 106], [146, 114], [180, 98], [78, 124], [162, 124]].map(p => P(`M${p[0]} ${p[1]}l5 8-5 12-5-12z`, '#cfe7f5', 'opacity=".9"')).join('');
  const aplique = () => R(30, 20, 180, 130, 0, '#eeeae1') + R(78, 70, 84, 32, 10, 'url(#gB)') + P('M84 70h72l30-54H54z', 'url(#gG)', 'opacity=".7"') + P('M84 102h72l30 52H54z', 'url(#gG)', 'opacity=".6"') + R(84, 66, 72, 5, 2, '#ffe9a8') + R(84, 101, 72, 5, 2, '#ffe9a8') + C(94, 86, 3, '#9aa4aa') + C(146, 86, 3, '#9aa4aa');
  const panelLed = () => sombra(120, 70, 150) + R(52, 34, 136, 116, 8, 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".16"') + R(64, 46, 112, 92, 4, 'url(#gC)') + R(64, 46, 112, 92, 4, '#cfe3f3', 'opacity=".45"') + L(120, 46, 120, 138, '#fff', 2) + L(64, 92, 176, 92, '#fff', 2);
  const jardin = () => sombra(120, 36) + P('M114 156l6 12 6-12z', '#6b5b45') + R(116, 74, 8, 86, 3, 'url(#gS)') + P('M92 40h56l-8 -16h-40z', 'url(#gB)') + R(88, 40, 64, 6, 3, '#3a3f43') + P('M94 46h52l-6 32h-40z', 'url(#gW)', 'stroke="#1f2427" stroke-opacity=".18"') + E(120, 64, 22, 20, 'url(#gG)') + P('M100 24l8-12h24l8 12z', 'url(#gBl)');

  const tira = (multi) => {
    const dots = Array.from({length: 11}, (_, i) => C(40 + i * 16, 126, 3.6, multi ? ['#e53935', '#2e8b57', '#2f6fa3', '#f2b705'][i % 4] : '#fff7d0', 'stroke="#d3a437" stroke-width="1"')).join('');
    return sombra(120, 90) + C(96, 78, 52, '#d8dcde') + C(96, 78, 46, '#f3f1ec') + [40, 33, 26].map((r, i) => C(96, 78, r, 'none', `stroke="${i % 2 ? '#e8e3d6' : '#ddd6c4'}" stroke-width="5"`)).join('') + C(96, 78, 16, '#d8dcde') + C(96, 78, 9, '#fafaf8')
      + R(28, 118, 190, 16, 4, '#fff', 'stroke="#1f2427" stroke-opacity=".15"') + dots + R(196, 104, 28, 20, 5, '#2b2f32') + S('M224 114h10', '#2b2f32', 3);
  };
  const manguera = () => sombra() + [0, 1, 2].map(i => E(120, 90 - i * 3, 62 - i * 8, 46 - i * 6, 'none', `stroke="${['#ffd37a', '#ffe29c', '#fff0c8'][i]}" stroke-width="9"`)).join('') + E(120, 90, 62, 46, 'none', 'stroke="#d9982a" stroke-width="1.5" stroke-dasharray="2 8"') + S('M178 120q30 6 42 24', '#ffd37a', 9) + R(210, 138, 20, 12, 4, '#2b2f32');
  const guirnalda = () => S('M10 40Q60 100 120 60T230 56', '#2e8b57', 3) + Array.from({length: 11}, (_, i) => { const x = 22 + i * 19, t = i / 10; const y = 40 + Math.sin(t * Math.PI * 1.7) * 30 + t * 12; const col = ['#e53935', '#f2b705', '#2e8b57', '#2f6fa3'][i % 4]; return C(x, y + 14, 7, col, 'stroke="#fff" stroke-width="1.5"') + C(x, y + 14, 14, 'url(#gG)', 'opacity=".55"'); }).join('');
  const cortina = () => R(26, 22, 188, 6, 3, '#8e989e') + Array.from({length: 10}, (_, i) => { const x = 36 + i * 18.5, len = 70 + ((i * 37) % 5) * 12; return L(x, 28, x, 28 + len, '#d8d2c0', 1.5) + Array.from({length: Math.floor(len / 18)}, (_, j) => C(x, 42 + j * 18, 4.4, 'url(#gW)', 'stroke="#d9982a" stroke-width="1"')).join(''); }).join('');

  const socketPorcelana = () => sombra() + R(82, 78, 76, 66, 10, '#f2ede2', 'stroke="#1f2427" stroke-opacity=".16"') + R(98, 44, 44, 40, 6, 'url(#gS)') + [54, 62, 70, 78].map(y => L(100, y, 140, y, '#7f8a91', 2.2)).join('') + C(98, 112, 6, 'url(#gY)', 'stroke="#8a5a14" stroke-width="1.5"') + C(142, 112, 6, 'url(#gY)', 'stroke="#8a5a14" stroke-width="1.5"') + R(112, 100, 16, 30, 8, '#e6dfd0');
  const socketPlastico = () => sombra() + R(90, 52, 60, 70, 10, 'url(#gB)') + R(102, 30, 36, 28, 5, 'url(#gS)') + [36, 43, 50].map(y => L(104, y, 136, y, '#7f8a91', 2)).join('') + S('M120 122v10c0 22-20 14-30 26', '#f3f1ec', 6) + S('M120 122v10c0 22-20 14-30 26', '#d5d1c4', 6, 'stroke-dasharray="2 8"');
  const fotocelula = () => sombra() + P('M84 108a36 36 0 0 1 72 0z', 'url(#gB)') + E(120, 92, 14, 9, '#e8d9a8', 'stroke="#8a5a14" stroke-opacity=".5"') + R(80, 106, 80, 18, 5, 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".15"') + R(100, 124, 8, 24, 2, '#b8c0c5') + R(132, 124, 8, 24, 2, '#b8c0c5') + R(118, 124, 4, 18, 1, '#b8c0c5');
  const sensor = () => sombra() + R(76, 100, 88, 24, 8, 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".15"') + P('M80 102a40 40 0 0 1 80 0z', '#fff', 'stroke="#1f2427" stroke-opacity=".16"') + [0, 1, 2, 3].map(i => S(`M${92 + i * 14} 102q0-14 ${14 - i * 4} -20`, '#d3d9dc', 2)).join('') + C(120, 92, 5, '#252a2d') + R(94, 124, 52, 14, 4, '#d3d9dc');
  const fuente = () => sombra() + R(64, 52, 112, 82, 6, 'url(#gS)', 'stroke="#1f2427" stroke-opacity=".2"') + Array.from({length: 4}, (_, r) => Array.from({length: 9}, (_, c) => C(76 + c * 11.5, 62 + r * 7, 1.9, '#6e787e')).join('')).join('') + R(64, 96, 112, 38, 5, '#2b2f32') + Array.from({length: 6}, (_, i) => R(72 + i * 17, 104, 11, 14, 2, '#d8a21d') + C(77.5 + i * 17, 111, 2.5, '#fff7d0')).join('') + R(70, 122, 100, 8, 2, '#fff', 'opacity=".85"');
  const driver = () => sombra(120, 76) + R(44, 68, 152, 50, 8, 'url(#gS)', 'stroke="#1f2427" stroke-opacity=".2"') + R(70, 76, 100, 34, 3, '#fff') + L(76, 86, 164, 86, '#9aa4aa', 3) + L(76, 94, 140, 94, '#c4cbcf', 3) + L(76, 102, 150, 102, '#c4cbcf', 3) + S('M44 84H22v-14', '#2b2f32', 5) + S('M44 102H22v14', '#c8322b', 5) + S('M196 84h22', '#f3f1ec', 5) + S('M196 102h22', '#2b2f32', 5);

  // ---------- Cables ----------
  const bobina = (col, adorno, grosor = 14) => {
    const anillos = [0, 1, 2, 3, 4].map(i => E(120, 84, 66 - i * 7, 58 - i * 6, 'none', `stroke="#1b1f21" stroke-opacity=".28" stroke-width="${grosor + 2}"`) + E(120, 84, 66 - i * 7, 58 - i * 6, 'none', `stroke="${col}" stroke-width="${grosor}"`)).join('');
    return sombra(120, 74) + anillos + E(120, 84, 22, 18, '#f3f1ec', 'stroke="#1f2427" stroke-opacity=".15"') + S('M170 124q24 14 46 4', col, grosor) + (adorno || '');
  };
  const cobre = (x, y, ang = 0) => G(`translate(${x} ${y}) rotate(${ang})`, R(0, -4, 22, 8, 2, 'url(#gY)') + [3, 8, 13, 18].map(a => L(a, -3, a, 3, '#b87a1f', 1.6)).join(''));
  const corte = (cols) => C(206, 54, 18, '#f3f1ec', 'stroke="#1f2427" stroke-opacity=".2"') + cols.map((c, i) => C(198 + i * 8, 50 + (i % 2) * 8, 5.5, c, 'stroke="#fff" stroke-width="1"')).join('');
  const thw = (col) => bobina(col, cobre(214, 134, 20));
  const mellizo = () => sombra(120, 74) + [0, 1, 2, 3].map(i => E(120, 84, 66 - i * 9, 58 - i * 8, 'none', 'stroke="#1b1f21" stroke-opacity=".28" stroke-width="17"') + E(120, 84, 66 - i * 9, 58 - i * 8, 'none', 'stroke="#f7f7f4" stroke-width="15"')).join('') + E(120, 84, 22, 18, '#f3f1ec', 'stroke="#1f2427" stroke-opacity=".15"') + S('M170 124q24 14 46 4', '#f7f7f4', 15) + cobre(214, 134, 20);
  const vulcanizado = () => bobina('#2b2f32', cobre(212, 128, 14) + cobre(214, 136, 24) + cobre(212, 142, 36), 16);
  const flexible = () => bobina('#d9dcdc', cobre(214, 134, 20) + corte(['#8a5a2b', '#2f6fa3', '#2e8b57']), 14);
  const nyy = () => bobina('#2b2f32', cobre(214, 134, 20) + C(206, 54, 20, '#2b2f32') + C(198, 50, 7, 'url(#gY)') + C(214, 50, 7, 'url(#gY)') + C(206, 63, 7, 'url(#gY)'), 18);
  const coaxial = () => bobina('#f3f1ec', R(206, 126, 24, 18, 3, 'url(#gS)') + [212, 218, 224].map(x => L(x, 127, x, 143, '#7f8a91', 1.5)).join('') + R(228, 131, 8, 8, 2, 'url(#gY)'), 14);
  const utp = () => bobina('#2f6fa3', R(206, 124, 26, 22, 3, '#e9f1f6', 'stroke="#1f2427" stroke-opacity=".3"') + [210, 214, 218, 222, 226].map(x => R(x, 124, 2, 8, 0, '#d8a21d')).join(''), 14);

  const llave = (polos, tipo) => {
    const w = 38, total = polos * w, x0 = 120 - total / 2;
    let m = '';
    for (let i = 0; i < polos; i++) {
      const x = x0 + i * w;
      m += R(x, 30, w - 2, 104, 4, 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".22"') + R(x + 6, 36, w - 14, 8, 2, '#8e989e') + C(x + (w - 2) / 2, 40, 2.2, '#3a3f43') + R(x + 6, 120, w - 14, 8, 2, '#8e989e') + C(x + (w - 2) / 2, 124, 2.2, '#3a3f43')
        + R(x + 8, 62, w - 18, 38, 3, '#25292c') + R(x + 11, 66, w - 24, 18, 2, tipo === 'rcd' ? '#2e8b57' : '#c8322b');
    }
    const extra = tipo === 'rcd' ? R(x0 + total - 30, 50, 22, 10, 2, '#f2b705') + `<text x="${x0 + total - 19}" y="58" font-size="8" font-weight="700" text-anchor="middle" fill="#252a2d">T</text>` : '';
    return sombra(120, total / 2 + 8) + G('translate(120 90) scale(1.18) translate(-120 -90)', R(x0 - 8, 22, total + 14, 6, 2, '#98a2a8') + R(x0 - 8, 136, total + 14, 6, 2, '#98a2a8') + m + extra);
  };

  // ---------- Interruptores y tomacorrientes ----------
  const placa = (w, h) => sombra(120, w / 2) + R(120 - w / 2, 150 - h - 6, w, h, 8, 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".18"') + R(120 - w / 2 + 4, 150 - h - 2, w - 8, h - 8, 5, '#fff', 'opacity=".6"');
  const interruptor = (n, tipo) => {
    const w = 52 + n * 34, h = 98, y = 150 - h - 6;
    let m = '';
    for (let i = 0; i < n; i++) {
      const x = 120 - w / 2 + 18 + i * 34 + (n === 1 ? 0 : 0);
      m += R(x, y + 18, 28, h - 36, 5, '#f4f5f4', 'stroke="#1f2427" stroke-opacity=".2"') + R(x + 3, y + 21, 22, (h - 36) / 2 - 2, 3, '#fff') + (tipo === 'tres' ? C(x + 14, y + h - 30, 2.4, '#c8322b') : '');
    }
    return placa(w, h) + m;
  };
  const sobrepuesto = () => sombra() + R(80, 40, 80, 104, 10, 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".25"') + R(86, 46, 68, 92, 6, '#e9ecec') + R(98, 58, 44, 68, 6, '#f8f9f8', 'stroke="#1f2427" stroke-opacity=".2"') + R(102, 62, 36, 32, 4, '#fff') + S('M80 144h80', '#1b1f21', 3, 'opacity=".12"');
  const timbre = () => placa(66, 100) + C(120, 84, 22, 'url(#gS)', 'stroke="#1f2427" stroke-opacity=".25"') + C(120, 84, 16, '#fff') + S('M112 88h16M114 88v-4a6 6 0 0 1 12 0v4M118 91a2 2 0 0 0 4 0', '#252a2d', 2.2);
  const dimmer = () => placa(70, 104) + C(120, 82, 24, 'url(#gS)', 'stroke="#1f2427" stroke-opacity=".25"') + C(120, 82, 17, '#f4f5f4') + L(120, 82, 120, 68, '#c8322b', 3) + R(104, 118, 32, 10, 4, '#d6dadb');
  const tomaCara = (cx, cy, tierra) => R(cx - 20, cy - 17, 40, 34, 8, '#fff', 'stroke="#1f2427" stroke-opacity=".28"') + R(cx - 11, cy - 5, 4, 12, 1.5, '#3a3f43') + R(cx + 7, cy - 5, 4, 12, 1.5, '#3a3f43') + (tierra ? C(cx, cy - 9, 2.6, '#3a3f43') : '') + C(cx, cy + 9, 1.8, '#9aa4aa');
  const toma = (n, tierra) => {
    const h = n === 1 ? 84 : 128, w = 76;
    return placa(w, h) + (n === 1 ? tomaCara(120, 86, tierra) : tomaCara(120, 62, tierra) + tomaCara(120, 108, tierra));
  };
  const tomaSobre = () => sombra() + R(76, 34, 88, 112, 12, 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".25"') + tomaCara(120, 70, false) + tomaCara(120, 114, false);
  const combo = () => placa(72, 124) + R(98, 40, 44, 34, 5, '#f4f5f4', 'stroke="#1f2427" stroke-opacity=".2"') + R(101, 43, 38, 15, 3, '#fff') + tomaCara(120, 104, true);
  const tvToma = () => placa(66, 100) + C(120, 84, 22, '#e3e7e8', 'stroke="#1f2427" stroke-opacity=".25"') + C(120, 84, 14, 'url(#gS)') + C(120, 84, 6, '#3a3f43') + C(120, 84, 2, '#d8a21d');

  // ---------- Herramientas ----------
  const alicate = (v) => {
    const mango = v === 'corte' ? '#1f5f9a' : v === 'pela' ? '#2e8b57' : '#c8322b';
    const mangos = P('M118 92L88 148a8 8 0 0 0 13 4l26-52z', mango) + P('M122 92l30 56a8 8 0 0 1-13 4l-26-52z', mango) + P('M95 134l6 10-14 6-4-8z', '#f2b705') + P('M145 134l-6 10 14 6 4-8z', '#f2b705');
    const mandibulas = v === 'corte' ? P('M120 88L96 46l14-12 24 40z', 'url(#gS)') + P('M120 88l24-42-10-14-24 44z', 'url(#gS)', 'opacity=".9"')
      : P('M120 90L102 36l12-6 12 4 10 56z', 'url(#gS)') + P('M120 90l18-54-12-6-8 4-10 56z', 'url(#gS)', 'opacity=".9"');
    return sombra() + mangos + mandibulas + C(120, 90, 9, '#7f8a91', 'stroke="#fff" stroke-width="2"') + C(120, 90, 3, '#3a3f43')
      + (v === 'pela' ? L(108, 56, 132, 56, '#3a3f43', 2) : '');
  };
  const destornillador = (tipo) => sombra(120, 76, 150) + G('rotate(-32 120 90)', R(24, 74, 70, 32, 14, 'url(#gR)') + R(54, 74, 12, 32, 2, '#f2b705') + R(94, 86, 90, 8, 3, 'url(#gS)')
    + (tipo === 'plano' ? P('M184 85h24l4 5-4 5h-24z', 'url(#gS)') : P('M184 86h22l5 4-5 4h-22z', 'url(#gS)') + L(190, 86, 190, 94, '#6e787e', 1.5)));
  const juegoDestornilladores = () => sombra(120, 82) + [['#c8322b', 58, 74], ['#f2b705', 82, 66], ['#2f6fa3', 106, 82], ['#2e8b57', 130, 70], ['#c8322b', 154, 62], ['#252a2d', 178, 78]].map(d => R(d[1] - 9, 104, 18, 46, 8, d[0]) + R(d[1] - 2, 104 - d[2] + 26, 4, d[2] - 26, 1, 'url(#gS)') + R(d[1] - 9, 118, 18, 5, 0, '#fff', 'opacity=".55"')).join('');
  const probador = () => sombra(120, 80, 150) + G('rotate(-24 120 90)', R(32, 76, 134, 28, 14, 'url(#gY)') + R(88, 80, 36, 8, 4, '#252a2d') + R(40, 74, 12, 32, 3, '#252a2d') + R(166, 86, 36, 8, 2, 'url(#gS)') + P('M202 86l14 4-14 4z', '#8e989e') + C(60, 90, 5, '#c8322b') + R(52, 62, 5, 16, 2, '#252a2d') + R(56, 62, 22, 4, 2, '#252a2d'));
  const multimetro = () => sombra(120, 52) + S('M92 140c-16 8-14 18-32 20', '#c8322b', 4) + S('M148 140c16 8 14 18 32 20', '#252a2d', 4) + R(76, 28, 88, 116, 12, 'url(#gY)', 'stroke="#1f2427" stroke-opacity=".25"') + R(86, 38, 68, 28, 4, '#cfe0cc', 'stroke="#252a2d" stroke-width="2"') + `<text x="146" y="60" font-size="18" font-family="monospace" font-weight="700" text-anchor="end" fill="#2b3a2b">12.5</text>`
    + C(120, 98, 20, '#252a2d') + C(120, 98, 11, '#555b60') + L(120, 98, 128, 90, '#fff', 2.4) + [92, 108, 124, 140].map(x => C(x, 130, 4.4, '#252a2d')).join('');
  const wincha = () => sombra(110, 62) + R(176, 112, 40, 8, 1, 'url(#gS)') + R(210, 106, 6, 20, 1, '#6e787e') + Array.from({length: 8}, (_, i) => L(180 + i * 4.5, 112, 180 + i * 4.5, i % 2 ? 117 : 120, '#3a3f43', 1.2)).join('')
    + R(52, 54, 124, 96, 20, 'url(#gY)', 'stroke="#1f2427" stroke-opacity=".25"') + R(52, 112, 124, 38, 18, '#252a2d') + C(114, 88, 26, '#e3a400', 'stroke="#1f2427" stroke-opacity=".3"') + C(114, 88, 14, '#252a2d') + R(150, 108, 30, 12, 3, 'url(#gS)');
  const guiaPasacable = () => sombra() + E(120, 86, 56, 56, 'url(#gBl)', 'stroke="#1f2427" stroke-opacity=".25"') + E(120, 86, 44, 44, '#2a6697') + E(120, 86, 14, 14, '#f3f1ec') + S('M164 98q40 6 62 -14', '#c4cbcf', 5) + S('M164 98q40 6 62 -14', '#7f8a91', 5, 'stroke-dasharray="2 9"') + C(228, 82, 4, '#7f8a91');
  const taladro = () => sombra(120, 70) + S('M60 140q-30 6-44 -10', '#252a2d', 4) + L(16, 78, 52, 78, '#aab3b8', 5) + R(44, 62, 24, 32, 5, '#252a2d') + R(66, 56, 100, 44, 18, 'url(#gR)', 'stroke="#1f2427" stroke-opacity=".22"')
    + P('M166 62h20a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10h-20z', '#252a2d') + P('M126 98h34l8 52a6 6 0 0 1-6 7h-24a6 6 0 0 1-6-6z', 'url(#gB)') + R(132, 100, 22, 10, 3, '#c8322b') + R(76, 66, 48, 8, 4, '#fff', 'opacity=".25"') + R(92, 100, 12, 28, 5, '#252a2d');
  const brocas = () => sombra(120, 86) + [[46, 128, 9], [78, 116, 8], [110, 104, 7], [142, 92, 6], [174, 80, 5]].map(b => {
    const x = b[0], h = b[1], w = b[2];
    let estrias = '';
    for (let y = 150 - h + 8; y < 114; y += 9) estrias += L(x - w / 2 + 1, y + 4, x + w / 2 - 1, y - 1, '#6e787e', 1.6);
    return G(`rotate(-14 ${x} 150)`, R(x - w / 2, 150 - 30, w, 30, 2, '#6e787e') + R(x - w / 2 + 1, 150 - h, w - 2, h - 28, 2, '#aab3b8') + estrias + P(`M${x - w / 2 + 1} ${150 - h}l${(w - 2) / 2} -7l${(w - 2) / 2} 7z`, '#4d565b'));
  }).join('');
  const cautin = () => sombra(120, 80, 152) + G('rotate(-20 120 94)', R(28, 80, 82, 28, 14, 'url(#gB)') + R(104, 84, 34, 20, 4, 'url(#gS)') + R(138, 90, 50, 8, 3, '#aab3b8') + P('M188 90h22l8 4-8 4h-22z', '#d8a21d') + R(40, 76, 10, 36, 3, '#f2b705') + S('M28 94c-10 0-14 12-24 12', '#252a2d', 3));

  const cintaAislante = () => sombra(120, 66) + E(120, 100, 64, 42, '#14171a') + E(120, 88, 64, 42, '#2b2f32', 'stroke="#000" stroke-opacity=".3"') + E(120, 88, 28, 18, '#e8e3d6') + E(120, 88, 20, 12, '#f8f6f0') + S('M80 70q18-14 40-14', '#fff', 3, 'opacity=".3"');
  const cajaRect = () => sombra() + P('M70 62l12-14h76l12 14v76H70z', '#f0b020', 'stroke="#1f2427" stroke-opacity=".3"') + R(82, 62, 76, 66, 4, '#d99a10') + R(86, 66, 68, 58, 3, '#b87f0a', 'opacity=".5"') + [[102, 80], [138, 80], [102, 110], [138, 110]].map(p => C(p[0], p[1], 6, '#8a5a0a')).join('') + R(52, 82, 18, 14, 3, '#f0b020') + R(170, 82, 18, 14, 3, '#f0b020') + C(61, 89, 2.5, '#6b4a0a') + C(179, 89, 2.5, '#6b4a0a');
  const cajaOct = () => sombra() + P('M92 38h56l26 26v50l-26 26H92l-26-26V64z', '#f0b020', 'stroke="#1f2427" stroke-opacity=".3"') + P('M96 48h48l20 20v44l-20 20H96l-20-20V68z', '#d99a10') + C(120, 90, 16, '#8a5a0a') + C(120, 90, 10, '#b87f0a') + [[88, 70], [152, 70], [88, 110], [152, 110]].map(p => C(p[0], p[1], 5, '#8a5a0a')).join('');
  const conduit = () => sombra(120, 90) + G('rotate(-18 120 90)', R(40, 70, 170, 24, 12, '#d8dcdd', 'stroke="#1f2427" stroke-opacity=".25"') + R(30, 66, 36, 32, 6, '#c3c9cb', 'stroke="#1f2427" stroke-opacity=".25"') + R(48, 72, 160, 5, 2, '#fff', 'opacity=".8"') + R(40, 108, 170, 24, 12, '#d8dcdd', 'stroke="#1f2427" stroke-opacity=".25"') + R(30, 104, 36, 32, 6, '#c3c9cb', 'stroke="#1f2427" stroke-opacity=".25"'));
  const curva = () => sombra(110, 56) + S('M60 150V94a48 48 0 0 1 48-48h56', '#d8dcdd', 26) + S('M60 150V94a48 48 0 0 1 48-48h56', '#1f2427', 28, 'opacity=".12" transform="translate(0 2)"') + S('M52 148V96a54 54 0 0 1 54-54h54', '#fff', 4, 'opacity=".7"') + R(46, 128, 28, 22, 4, '#c3c9cb') + R(150, 32, 22, 28, 4, '#c3c9cb');
  const grapas = () => sombra(120, 76) + [[60, 70, -10], [100, 60, 8], [140, 76, -6], [176, 64, 14], [78, 112, 6], [122, 108, -12], [164, 118, 10]].map(g => G(`translate(${g[0]} ${g[1]}) rotate(${g[2]})`, P('M-16 8V-6a16 16 0 0 1 32 0V8', 'none', 'stroke="#f7f7f4" stroke-width="6" stroke-linecap="round"') + P('M-16 8V-6a16 16 0 0 1 32 0V8', 'none', 'stroke="#c9ccc9" stroke-width="1.5"') + L(0, -2, 0, 12, '#8e989e', 2.5))).join('');
  const canaleta = () => sombra(120, 94) + R(26, 74, 188, 40, 4, '#e8ebec', 'stroke="#1f2427" stroke-opacity=".25"') + R(26, 74, 188, 14, 3, '#fff') + R(32, 92, 176, 18, 2, '#cfd5d8') + S('M40 100h150', '#2b2f32', 4) + S('M40 106h120', '#c8322b', 3) + L(26, 74, 26, 114, '#c3c9cb', 3);
  const conectores = () => sombra(120, 80) + [60, 120, 180].map(x => R(x - 26, 58, 52, 66, 8, '#e9eef0', 'stroke="#1f2427" stroke-opacity=".25"') + [0, 1, 2].map(i => R(x - 20 + i * 14, 62, 12, 22, 3, '#f08a24') + R(x - 20 + i * 14, 96, 12, 22, 3, '#cfd5d8')).join('') + L(x - 24, 90, x + 24, 90, '#c4cbcf', 2)).join('');
  const terminales = () => sombra(120, 76) + [[56, 76, -20, '#c8322b'], [100, 66, -6, '#2f6fa3'], [142, 70, 8, '#f2b705'], [182, 82, 22, '#c8322b'], [86, 116, 6, '#f2b705'], [142, 118, -10, '#2f6fa3']].map(t => G(`translate(${t[0]} ${t[1]}) rotate(${t[2]})`, R(-4, 0, 22, 20, 5, t[3]) + R(4, 20, 6, 10, 1, 'url(#gS)') + C(7, 38, 9, 'none', 'stroke="#aab3b8" stroke-width="5"'))).join('');
  const extension = () => sombra(110, 96) + S('M200 112q30 4 28 30t-70 14', '#f3f1ec', 6) + R(28, 64, 176, 54, 12, 'url(#gP)', 'stroke="#1f2427" stroke-opacity=".25"') + [0, 1, 2, 3, 4].map(i => R(40 + i * 28, 78, 22, 26, 5, '#fff', 'stroke="#1f2427" stroke-opacity=".3"') + R(46 + i * 28, 86, 3, 9, 1, '#3a3f43') + R(55 + i * 28, 86, 3, 9, 1, '#3a3f43')).join('') + R(184, 72, 14, 10, 3, '#c8322b');
  const enchufe = () => sombra() + R(112, 40, 5, 34, 1, 'url(#gS)') + R(135, 40, 5, 34, 1, 'url(#gS)') + R(86, 70, 68, 56, 14, 'url(#gB)', 'stroke="#1f2427" stroke-opacity=".3"') + R(96, 76, 48, 8, 4, '#fff', 'opacity=".18"') + S('M120 126v12c0 14 12 14 12 24', '#252a2d', 8);

  // ---------- Ferretería general ----------
  const pulgadas = (nombre) => {
    const m = nombre.match(/(\d)(½)?"/); return m ? Number(m[1]) + (m[2] ? 0.5 : 0) : 2;
  };
  const clavos = (nombre, tipo) => {
    const len = 36 + pulgadas(nombre) * 22;
    const lista = [[62, 0, -22], [88, 4, -8], [114, -2, 6], [140, 6, 18], [166, 0, 30], [100, 20, 14], [132, 22, -14]];
    return sombra(120, 80) + lista.map(n => G(`translate(${n[0]} ${100 + n[1]}) rotate(${n[2]})`,
      L(0, -len / 2 + 8, 0, len / 2, tipo === 'concreto' ? '#5d666b' : '#aab3b8', tipo === 'concreto' ? 4 : 3.2)
      + (tipo === 'concreto' ? [-20, -10, 0, 10].map(y => L(-2.2, y, 2.2, y - 3, '#98a2a8', 1)).join('') : '')
      + (tipo === 'calamina' ? E(0, -len / 2 + 20, 11, 4, '#252a2d') : '')
      + E(0, -len / 2 + 6, tipo === 'calamina' ? 6 : 8, 3, '#7f8a91')
    )).join('');
  };
  const tarugos = () => sombra(120, 80) + [[60, 84, -14], [96, 70, 8], [136, 82, -6], [174, 72, 12], [78, 124, 10], [120, 118, -10], [160, 124, 6]].map(t => G(`translate(${t[0]} ${t[1]}) rotate(${t[2]})`, P('M-8 -16h16l-3 34h-10z', '#dfe3e5', 'stroke="#1f2427" stroke-opacity=".25"') + R(-12, -20, 24, 6, 3, '#c3c9cb') + [-8, 0, 8, 14].map(y => L(-6, y, 6, y, '#aab3b8', 1.6)).join(''))).join('');
  const tornillos = () => sombra(120, 82) + R(46, 98, 148, 48, 6, '#d6b88a', 'stroke="#1f2427" stroke-opacity=".25"') + R(46, 98, 148, 14, 4, '#e6cfa7') + R(70, 112, 100, 20, 3, '#fff', 'opacity=".9"') + L(78, 120, 160, 120, '#c8322b', 3)
    + [[78, 64, -14], [108, 50, -4], [138, 58, 6], [168, 66, 16], [124, 82, 0]].map(s => G(`translate(${s[0]} ${s[1]}) rotate(${s[2]})`, L(0, -2, 0, 38, '#98a2a8', 3.4) + [6, 14, 22, 30].map(y => L(-3, y, 3, y + 3, '#7f8a91', 1.3)).join('') + E(0, -4, 8, 3.2, '#c4cbcf') + L(-5, -4, 5, -4, '#6e787e', 1.2) + L(0, -7, 0, -1, '#6e787e', 1.2))).join('');

  // ---------- Selección por nombre ----------
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const reglas = [
    [/foco led vela/, candle], [/tubo led/, tubo], [/dicroico/, dicroico], [/filamento/, filamento], [/foco led rgb/, rgb],
    [/recargable de emergencia/, emergencia], [/incandescente/, incandescente], [/ahorrador/, espiral], [/foco led .*alta potencia/, focoHP],
    [/foco led .*calida/, () => focoA(true)], [/foco led/, () => focoA(false)],
    [/reflector.*solar/, () => reflector('solar')], [/reflector.*rgb/, () => reflector('rgb')], [/reflector/, () => reflector('')],
    [/colgante/, colgante], [/techo led redonda/, techoRedondo], [/plafon/, plafon], [/mesa decorativa/, lamparaMesa], [/arana/, arana],
    [/aplique/, aplique], [/panel led/, panelLed], [/solar de jardin/, jardin],
    [/tira led rgb/, () => tira(true)], [/tira led/, () => tira(false)], [/manguera led/, manguera], [/guirnalda/, guirnalda], [/cortina led/, cortina],
    [/socket de porcelana/, socketPorcelana], [/socket de plastico/, socketPlastico], [/fotocelula/, fotocelula], [/sensor de movimiento/, sensor],
    [/fuente de poder/, fuente], [/driver led/, driver],
    [/rollo cable thw/, () => thw('#c8322b')], [/cable thw 16/, () => thw('#2f6fa3')], [/cable thw 14/, () => thw('#c8322b')], [/cable thw 12/, () => thw('#f2b705')],
    [/cable thw 10/, () => thw('#2e8b57')], [/cable thw 8/, () => thw('#252a2d')], [/cable thw/, () => thw('#c8322b')],
    [/cable mellizo/, mellizo], [/cable vulcanizado/, vulcanizado], [/cable flexible/, flexible], [/cable nyy/, nyy], [/cable coaxial/, coaxial], [/utp/, utp],
    [/llave termica monofasica/, () => llave(1)], [/llave termica bipolar/, () => llave(2)], [/llave termica trifasica/, () => llave(3)], [/diferencial/, () => llave(2, 'rcd')],
    [/interruptor simple sobrepuesto/, sobrepuesto], [/pulsador de timbre/, timbre], [/conmutable simple/, () => interruptor(1, 'tres')], [/conmutable doble/, () => interruptor(2, 'tres')],
    [/dimmer/, dimmer], [/interruptor simple/, () => interruptor(1)], [/interruptor doble/, () => interruptor(2)], [/interruptor triple/, () => interruptor(3)],
    [/tomacorriente doble sobrepuesto/, tomaSobre], [/tomacorriente doble.*tierra/, () => toma(2, true)], [/tomacorriente doble/, () => toma(2)], [/tomacorriente simple/, () => toma(1)],
    [/interruptor con tomacorriente/, combo], [/toma de tv/, tvToma],
    [/alicate universal/, () => alicate('')], [/corte diagonal/, () => alicate('corte')], [/pelacables/, () => alicate('pela')],
    [/destornillador plano/, () => destornillador('plano')], [/destornillador estrella/, () => destornillador('estrella')], [/juego de destornilladores/, juegoDestornilladores],
    [/probador de voltaje/, probador], [/multimetro/, multimetro], [/wincha/, wincha], [/guia pasacable/, guiaPasacable], [/taladro/, taladro], [/brocas/, brocas], [/cautin/, cautin],
    [/cinta aislante/, cintaAislante], [/caja rectangular/, cajaRect], [/caja octogonal/, cajaOct], [/conduit/, conduit], [/curva pvc/, curva], [/grapas/, grapas],
    [/canaleta/, canaleta], [/conectores de empalme/, conectores], [/terminales de ojo/, terminales], [/extension electrica/, extension], [/enchufe macho/, enchufe],
    [/clavo de acero para concreto/, null, 'concreto'], [/clavo para calamina/, null, 'calamina'], [/clavo con cabeza/, null, 'normal'],
    [/tarugo/, tarugos], [/tornillo autorroscante/, tornillos]
  ];
  const porCategoria = {1: focoA, 2: () => thw('#c8322b'), 3: () => interruptor(1), 4: taladro, 5: () => clavos('', 'normal')};

  function dibujo(p) {
    const n = norm(p.nombre);
    for (const r of reglas) {
      if (r[0].test(n)) return r[1] ? r[1]() : clavos(p.nombre, r[2]);
    }
    return (porCategoria[p.cat] || taladro)();
  }

  window.ILUS = {
    svg(p) {
      return '<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + p.nombre.replace(/"/g, '&quot;') + '" preserveAspectRatio="xMidYMid meet">' + DEFS + dibujo(p) + '</svg>';
    },
    // Dato corto que se muestra sobre la imagen (potencia, calibre, amperaje...)
    chip(p) {
      const t = p.nombre;
      let m;
      if ((m = t.match(/(\d+x\d+(?:\.\d+)?\s?AWG)/i))) return m[1].replace(/\s/g, ' ');
      if ((m = t.match(/(\d+\s?AWG)/i))) return m[1].replace(/\s?AWG/i, ' AWG');
      if ((m = t.match(/(\d+x[\d.]+\s?mm²)/i))) return m[1];
      if ((m = t.match(/(\d+x\d+A)/i))) return m[1];
      if ((m = t.match(/\b(\d+\s?W)\b/i))) return m[1].replace(/\s/g, '');
      if ((m = t.match(/\b(\d+A)\b/))) return m[1];
      if ((m = t.match(/(\d+\/\d+")/))) return m[1];
      if ((m = t.match(/(\d(?:½)?")/))) return m[1];
      if ((m = t.match(/\b(\d+\s?V)\b/))) return m[1];
      return '';
    }
  };
})();
