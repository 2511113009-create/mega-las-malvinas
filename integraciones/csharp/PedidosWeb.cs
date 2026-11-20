// Mega Las Malvinas · Cliente C# para los pedidos de la tienda web
//
// Lee los pedidos que la web guarda en Google Sheets (integraciones/google-apps-script/Codigo.gs)
// y permite cambiar su estado desde tu programa.
//
// Requisitos: .NET 6 o superior (System.Text.Json viene incluido).
// En .NET Framework 4.7.2/4.8: instala el paquete NuGet "System.Text.Json".
//
// Uso:
//   var api = new PedidosWebClient("https://script.google.com/macros/s/XXXX/exec", "TU_CLAVE");
//   PedidoWeb? p = await api.BuscarAsync("MLM-261120-ABCD");   // el código que lee el lector de QR
//   await api.CambiarEstadoAsync(p.Codigo, EstadoPedido.Entregado, "Entregado por caja 1");

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace MegaLasMalvinas.Web
{
    public static class EstadoPedido
    {
        public const string Nuevo = "NUEVO";
        public const string PagoVerificado = "PAGO_VERIFICADO";
        public const string Listo = "LISTO";
        public const string Entregado = "ENTREGADO";
        public const string Anulado = "ANULADO";
    }

    public sealed class ItemPedido
    {
        [JsonPropertyName("codigo")] public string Codigo { get; set; } = "";
        [JsonPropertyName("nombre")] public string Nombre { get; set; } = "";
        [JsonPropertyName("cant")] public decimal Cantidad { get; set; }
        [JsonPropertyName("unidad")] public string Unidad { get; set; } = "";
        [JsonPropertyName("precio")] public decimal Precio { get; set; }
        [JsonPropertyName("importe")] public decimal Importe { get; set; }
    }

    public sealed class PedidoWeb
    {
        public string Codigo { get; set; } = "";
        public DateTime? Fecha { get; set; }
        public string Cliente { get; set; } = "";
        public string Celular { get; set; } = "";
        public string Correo { get; set; } = "";
        public string DNI { get; set; } = "";
        public string Recojo { get; set; } = "";
        public string Notas { get; set; } = "";
        public string MetodoPago { get; set; } = "";
        /// <summary>N° de operación de Yape o transferencia que escribió el cliente. Verifícalo en tu app antes de entregar.</summary>
        public string Operacion { get; set; } = "";
        /// <summary>Total que mostró la web al cliente.</summary>
        public decimal TotalWeb { get; set; }
        /// <summary>Total recalculado en la hoja con los precios publicados (null si no se pudo calcular).</summary>
        public decimal? TotalCalculado { get; set; }
        /// <summary>false = alguien alteró los precios en su navegador. No entregues sin revisar.</summary>
        public bool? Coincide { get; set; }
        public List<ItemPedido> Productos { get; set; } = new List<ItemPedido>();
        public string Estado { get; set; } = "";
        public DateTime? Actualizado { get; set; }
        public string NotaTienda { get; set; } = "";
    }

    public sealed class PedidosWebException : Exception
    {
        public PedidosWebException(string mensaje) : base(mensaje) { }
    }

    public sealed class PedidosWebClient : IDisposable
    {
        private static readonly Regex RxCodigo = new Regex(@"MLM-\d{6}-[A-Z0-9]{4}", RegexOptions.Compiled);
        private readonly HttpClient _http;
        private readonly bool _propio;
        private readonly string _url;
        private readonly string _clave;

        public PedidosWebClient(string urlAppsScript, string clave, HttpClient? http = null)
        {
            if (string.IsNullOrWhiteSpace(urlAppsScript)) throw new ArgumentException("Falta la URL /exec de Apps Script", nameof(urlAppsScript));
            _url = urlAppsScript.Trim();
            _clave = clave ?? "";
            _propio = http == null;
            // Apps Script responde con una redirección 302: HttpClient la sigue por defecto.
            _http = http ?? new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
        }

        /// <summary>
        /// Extrae el código de pedido de lo que lea un escáner o de un texto pegado
        /// (acepta minúsculas, espacios y texto alrededor). Devuelve null si no hay código válido.
        /// </summary>
        public static string? NormalizarCodigo(string? texto)
        {
            if (string.IsNullOrWhiteSpace(texto)) return null;
            var m = RxCodigo.Match(texto.Trim().ToUpperInvariant().Replace('_', '-'));
            return m.Success ? m.Value : null;
        }

        public async Task<PedidoWeb?> BuscarAsync(string codigoOTexto, CancellationToken ct = default)
        {
            var codigo = NormalizarCodigo(codigoOTexto) ?? throw new PedidosWebException("El texto no contiene un código de pedido válido (formato MLM-AAMMDD-XXXX).");
            using var doc = await GetAsync("codigo=" + Uri.EscapeDataString(codigo), ct).ConfigureAwait(false);
            var raiz = doc.RootElement;
            if (!Ok(raiz, out var error)) { if (error == "no-existe") return null; throw new PedidosWebException(Traducir(error)); }
            return LeerPedido(raiz.GetProperty("pedido"));
        }

        public async Task<List<PedidoWeb>> ListarAsync(string? estado = EstadoPedido.Nuevo, CancellationToken ct = default)
        {
            using var doc = await GetAsync(estado == null ? "" : "estado=" + Uri.EscapeDataString(estado), ct).ConfigureAwait(false);
            var raiz = doc.RootElement;
            if (!Ok(raiz, out var error)) throw new PedidosWebException(Traducir(error));
            var lista = new List<PedidoWeb>();
            foreach (var e in raiz.GetProperty("pedidos").EnumerateArray()) lista.Add(LeerPedido(e));
            return lista;
        }

        public async Task CambiarEstadoAsync(string codigo, string estado, string? nota = null, CancellationToken ct = default)
        {
            var cuerpo = JsonSerializer.Serialize(new { accion = "estado", clave = _clave, codigo = NormalizarCodigo(codigo) ?? codigo, estado, nota });
            using var cont = new StringContent(cuerpo, Encoding.UTF8, "text/plain");
            using var r = await _http.PostAsync(_url, cont, ct).ConfigureAwait(false);
            var txt = await r.Content.ReadAsStringAsync().ConfigureAwait(false);
            using var doc = Parsear(txt);
            if (!Ok(doc.RootElement, out var error)) throw new PedidosWebException(Traducir(error));
        }

        // ---------- internos ----------
        private async Task<JsonDocument> GetAsync(string consulta, CancellationToken ct)
        {
            var url = _url + "?clave=" + Uri.EscapeDataString(_clave) + (consulta.Length > 0 ? "&" + consulta : "");
            using var r = await _http.GetAsync(url, ct).ConfigureAwait(false);
            var txt = await r.Content.ReadAsStringAsync().ConfigureAwait(false);
            return Parsear(txt);
        }

        private static JsonDocument Parsear(string txt)
        {
            try { return JsonDocument.Parse(txt); }
            catch (JsonException)
            {
                // Suele pasar si la Aplicación web no está publicada para "Cualquier usuario" (Google devuelve una página de inicio de sesión)
                throw new PedidosWebException("La hoja no respondió JSON. Revisa la URL /exec y que la implementación tenga acceso 'Cualquier usuario'.");
            }
        }

        private static bool Ok(JsonElement raiz, out string error)
        {
            error = raiz.TryGetProperty("error", out var e) ? e.ToString() : "";
            return raiz.TryGetProperty("ok", out var ok) && ok.ValueKind == JsonValueKind.True;
        }

        private static string Traducir(string error) => error switch
        {
            "clave" => "Clave incorrecta: revisa la propiedad CLAVE del Apps Script.",
            "estado" => "Estado no válido.",
            "no-existe" => "No existe un pedido con ese código.",
            _ => "Error de la hoja de pedidos: " + error
        };

        private static PedidoWeb LeerPedido(JsonElement e)
        {
            var p = new PedidoWeb
            {
                Codigo = Texto(e, "Codigo"), Cliente = Texto(e, "Cliente"), Celular = Texto(e, "Celular"), Correo = Texto(e, "Correo"),
                DNI = Texto(e, "DNI"), Recojo = Texto(e, "Recojo"), Notas = Texto(e, "Notas"), MetodoPago = Texto(e, "MetodoPago"),
                Operacion = Texto(e, "Operacion"), Estado = Texto(e, "Estado"), NotaTienda = Texto(e, "NotaTienda"),
                Fecha = FechaDe(e, "Fecha"), Actualizado = FechaDe(e, "Actualizado"),
                TotalWeb = DecimalDe(e, "TotalWeb") ?? 0m, TotalCalculado = DecimalDe(e, "TotalCalculado")
            };
            if (e.TryGetProperty("Coincide", out var c) && (c.ValueKind == JsonValueKind.True || c.ValueKind == JsonValueKind.False)) p.Coincide = c.GetBoolean();
            if (e.TryGetProperty("Productos", out var prods) && prods.ValueKind == JsonValueKind.Array)
                p.Productos = JsonSerializer.Deserialize<List<ItemPedido>>(prods.GetRawText()) ?? new List<ItemPedido>();
            return p;
        }

        private static string Texto(JsonElement e, string k) =>
            e.TryGetProperty(k, out var v) && v.ValueKind != JsonValueKind.Null ? (v.ValueKind == JsonValueKind.String ? v.GetString() ?? "" : v.ToString()).TrimStart('\'') : "";

        private static decimal? DecimalDe(JsonElement e, string k)
        {
            if (!e.TryGetProperty(k, out var v)) return null;
            if (v.ValueKind == JsonValueKind.Number) return v.GetDecimal();
            return decimal.TryParse(v.ToString(), NumberStyles.Number, CultureInfo.InvariantCulture, out var d) ? d : (decimal?)null;
        }

        private static DateTime? FechaDe(JsonElement e, string k) =>
            DateTime.TryParse(Texto(e, k), CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal, out var d) ? d.ToLocalTime() : (DateTime?)null;

        public void Dispose() { if (_propio) _http.Dispose(); }
    }
}
