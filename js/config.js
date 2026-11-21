// Configuración de la tienda. Aquí se cambian los datos de contacto y de pago.
// No hace falta tocar nada más para actualizar teléfonos, cuentas o el correo de pedidos.
window.TIENDA = {
  nombre: 'Mega Las Malvinas',
  lugar: 'Barranca, Lima, Perú',

  // Correo que RECIBE los pedidos y los mensajes del formulario de contacto.
  // Se envía mediante la API de FormSubmit (https://formsubmit.co).
  // La primera vez, FormSubmit manda un correo de confirmación a esta dirección:
  // hay que abrirlo y pulsar "Activate Form". Desde ahí cada pedido llega a la bandeja.
  correoPedidos: '251.1113.009@unab.edu.pe',

  // Registro de pedidos en Google Sheets (lo lee tu programa C#). URL de la Aplicación web de
  // Apps Script que termina en /exec. Pasos en integraciones/google-apps-script/LEEME.md. Vacío = desactivado.
  // Esta URL solo permite ENVIAR pedidos; leerlos exige la CLAVE secreta, que NO va aquí.
  hojaPedidos: '',

  // WhatsApp de atención (código de país + número, sin + ni espacios)
  whatsapp: '51992081815',
  telefonoVisible: '992 081 815',

  // Pago con Yape
  yape: {
    numero: '992081815',
    numeroVisible: '992 081 815',
    titular: 'Bill Johan Robles Alejo',
    qr: 'img/yape-qr.png',
    // Contenido del QR de Yape del dueño (leído de img/yape-qr.png). Con él la web genera,
    // en cada compra, un QR con el monto exacto incluido. Si cambias de QR, reemplaza este texto.
    emv: '000201010211393246721bdfa1785685a58210398e4ed7f55204561153036045802PE5906YAPERO6004Lima630417DD',
    // Probado: Yape (cuenta personal) lee el QR pero NO completa el monto con '12'.
    // '11' = QR estático igual al original, con el monto como dato extra (la web pide escribirlo igual).
    qrModo: '11'
  },

  // Cobro automático con pasarela (opcional). Ver README → "Pagos con tarjeta".
  // Cuando publiques el servidor de pagos (carpeta servidor/), pega aquí su dirección,
  // por ejemplo 'https://pagos-malvinas.tu-usuario.workers.dev'. Vacío = opción oculta.
  pasarela: {
    url: '',
    // Public Key de PRODUCCIÓN de Mercado Pago (empieza con APP_USR-). Es pública, puede ir aquí.
    // Con url + publicKey aparece "Yape automático": el monto se cobra solo, el cliente no lo escribe.
    publicKey: '',
    nombre: 'Tarjeta, Yape u otros (Mercado Pago)'
  },

  // Pago por transferencia en soles
  banco: {
    cuenta: '23514728321007',
    cci: '00223511472832100706'
  },

  // Los precios del catálogo ya incluyen IGV
  igv: 0.18,

  // Códigos de producto que ya tienen foto real guardada en img/productos/CODIGO.webp
  // (por ejemplo: ['LED-001', 'HER-011']). El resto usa su ilustración.
  // Las fotos de cada producto están en js/fotos.js. Estas dos opciones tienen prioridad sobre ellas:
  fotosReales: [],   // códigos con foto propia: img/productos/CODIGO.webp
  fotosGrupo: {},    // foto compartida por tipo, ej.: {'Focos LED': 'img/productos/focos-led.webp'}

  // Búsqueda en Google Maps (se abre en otra pestaña)
  // Ubicación exacta de la tienda (enlace compartido por el dueño)
  ubicacion: {lat: -10.7526369, lng: -77.7615328, enlace: 'https://maps.app.goo.gl/6qLEPKYVNLY3N7ny9'}
};
