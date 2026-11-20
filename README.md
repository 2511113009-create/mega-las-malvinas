# Mega Las Malvinas · Sitio web

Tienda en línea estática (HTML, CSS y JavaScript, sin compilación). Se publica gratis en GitHub Pages:
**https://2511113009-create.github.io/mega-las-malvinas/**

## 1. Datos del negocio → `js/config.js`
| Campo | Qué es |
|---|---|
| `correoPedidos` | **Correo que recibe cada pedido y cada mensaje de contacto. Está vacío: llénalo o los pedidos solo llegarán por WhatsApp.** |
| `whatsapp` / `telefonoVisible` | WhatsApp de atención (51 + 9 dígitos) y cómo se muestra. |
| `yape` | Número, titular, imagen del QR y `emv` (contenido del QR, ver punto 4). |
| `pasarela.url` | Dirección del servidor de pagos con tarjeta (punto 5). Vacío = opción oculta. |
| `banco` | Cuenta y CCI para transferencias. |

## 2. Activar el correo de pedidos (una sola vez)
El envío usa FormSubmit. Escribe el correo en `correoPedidos`, publica, haz un pedido de prueba y pulsa **Activate** en el correo que llega. Desde ahí cada pedido llega con cliente, productos, total y N.º de operación.

## 3. Fotos de productos
Cada producto tiene una foto real en `img/productos/` (asignadas en `js/fotos.js`). Son fotos referenciales con licencia libre de Wikimedia Commons; los autores y licencias se listan en `creditos.html`, que debe seguir publicado.
Para usar tu propia foto (recomendado con el tiempo): guárdala cuadrada (~720 px, .jpg o .webp) en `img/productos/` y cambia la ruta de ese código en `js/fotos.js`.

## 4. Yape con el monto incluido
El QR de Yape usa el estándar EMVCo. La web toma el contenido del QR del dueño (`yape.emv`), le agrega el campo **54 (monto)** y recalcula el código de control. Cada compra muestra un QR propio con el total exacto y un botón para guardarlo (para quien compra desde el celular y escanea desde la galería).

**Resultado probado:** Yape con cuenta personal lee el QR pero **no** completa el monto. Por eso la web muestra el monto grande con un botón **Copiar monto** y pide escribirlo. Para que el monto aparezca solo se necesita una cuenta de comercio (Yape para negocios / pasarela como Mercado Pago o Izipay).

Yape no tiene una API pública para cuentas personales, así que **la confirmación del pago la hace la tienda** con el N.º de operación que registra el cliente. Para confirmación automática usa el punto 5.

## 5. Pagos con tarjeta y confirmación automática (Mercado Pago)
GitHub Pages no puede guardar claves secretas, por eso hay un servidor mínimo en `servidor/worker.js` (Cloudflare Workers, plan gratuito):
1. Crea tu cuenta de vendedor en **Mercado Pago Perú** y copia el **Access Token de producción** (Tus integraciones → Credenciales).
2. Crea una cuenta gratis en **Cloudflare** → Workers → *Create* → pega el contenido de `servidor/worker.js` → *Deploy*.
3. En *Settings → Variables* agrega: `MP_ACCESS_TOKEN` (tipo *Secret*) y `SITIO` = `https://2511113009-create.github.io/mega-las-malvinas/`.
4. Copia la dirección del worker (`https://….workers.dev`) en `pasarela.url` de `js/config.js` y publica.

Aparecerá la opción **Tarjeta u otros medios**: el cliente paga en la página segura de Mercado Pago, vuelve a la tienda y la web consulta al servidor si el pago fue **aprobado**. El servidor recalcula el total con los precios de `js/datos.js`, así que nadie puede pagar menos modificando la página. Prueba primero con las credenciales y tarjetas de prueba de Mercado Pago.

## 5b. Pedidos en Google Sheets + programa C#
Cada pedido tiene un código `MLM-AAMMDD-XXXX` y un **QR con ese código** (en la pantalla final y en la constancia PDF).
1. Instala la hoja: sigue las instrucciones al inicio de `integraciones/google-apps-script/Codigo.gs` y pega la URL `/exec` en `hojaPedidos` de `js/config.js`.
2. En tu programa C# agrega `integraciones/csharp/PedidosWeb.cs` (y si quieres la pantalla de ejemplo `FormPedidosWeb.cs`), y pon la misma URL y tu `CLAVE`.
3. En caja: un lector de códigos USB (o escribirlo a mano) pone el código en la caja de texto → Enter → aparece el pedido con productos, N.º de operación y total. Verificas el pago en tu app de Yape y marcas *Pago verificado* / *Entregado*.
La hoja recalcula el total con los precios publicados: si la columna `Coincide` es FALSO, alguien alteró precios en su navegador.

## 6. Publicar en GitHub Pages
1. En GitHub crea el repositorio público **mega-las-malvinas**.
2. Sube **el contenido de esta carpeta** (no la carpeta en sí): *Add file → Upload files*, arrastra todo y *Commit*.
3. *Settings → Pages → Source: Deploy from a branch → main / (root) → Save*. En 1–2 minutos queda en línea.
4. Dominio propio (opcional, p. ej. `megalasmalvinas.pe`): cómpralo en un registrador, en *Settings → Pages → Custom domain* escríbelo, y en tu registrador crea un registro `CNAME` `www` → `2511113009-create.github.io`. Activa *Enforce HTTPS*. Luego cambia las URLs de `index.html`, `robots.txt` y `sitemap.xml`.

Para probar en local: `python -m http.server` dentro de la carpeta y abre http://localhost:8000.
