// Configuración de la tienda. Aquí se cambian los datos de contacto y de pago.
// No hace falta tocar nada más para actualizar teléfonos, cuentas o el correo de pedidos.
window.TIENDA = {
  nombre: 'Mega Las Malvinas',
  lugar: 'Barranca, Lima, Perú',

  // Correo que RECIBE los pedidos y los mensajes del formulario de contacto.
  // Se envía mediante la API de FormSubmit (https://formsubmit.co).
  // La primera vez, FormSubmit manda un correo de confirmación a esta dirección:
  // hay que abrirlo y pulsar "Activate Form". Desde ahí cada pedido llega a la bandeja.
  correoPedidos: '',

  // WhatsApp de atención (código de país + número, sin + ni espacios)
  whatsapp: '51992081815',
  telefonoVisible: '992 081 815',

  // Pago con Yape
  yape: {
    numero: '992081815',
    numeroVisible: '992 081 815',
    titular: 'Bill Johan Robles Alejo',
    qr: 'img/yape-qr.png'
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
  fotosReales: [],   // códigos con foto propia: img/productos/CODIGO.webp
  fotosGrupo: {},    // foto compartida por tipo, ej.: {'Focos LED': 'img/productos/focos-led.webp'}

  // Búsqueda en Google Maps (se abre en otra pestaña)
  // Ubicación exacta de la tienda (enlace compartido por el dueño)
  ubicacion: {lat: -10.7526369, lng: -77.7615328, enlace: 'https://maps.app.goo.gl/6qLEPKYVNLY3N7ny9'}
};
