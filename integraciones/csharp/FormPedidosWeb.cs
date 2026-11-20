// Ejemplo de pantalla WinForms para la caja de la tienda (sin diseñador: todo en código).
// Agrega PedidosWeb.cs y este archivo a tu proyecto WinForms y ábrela con:
//     new FormPedidosWeb().Show();
//
// Flujo en caja: el cliente muestra el QR de su constancia → el lector de códigos (USB, actúa como teclado)
// escribe "MLM-261120-ABCD" + Enter en la caja de texto → aparece el pedido → verificas el pago en Yape
// con el N° de operación → "Pago verificado" → entregas → "Entregado".

using System;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;
using MegaLasMalvinas.Web;

public sealed class FormPedidosWeb : Form
{
    // Pon aquí tus datos (o léelos de App.config / Settings). NO publiques la clave en la web.
    private const string UrlHoja = "https://script.google.com/macros/s/PEGA_AQUI_TU_ID/exec";
    private const string Clave = "PEGA_AQUI_TU_CLAVE";

    private readonly PedidosWebClient _api = new PedidosWebClient(UrlHoja, Clave);
    private readonly TextBox _txtCodigo = new TextBox { Font = new Font("Segoe UI", 14f), Width = 300, PlaceholderText = "Escanea o escribe el código" };
    private readonly Button _btnBuscar = new Button { Text = "Buscar", Width = 90, Height = 34 };
    private readonly Button _btnNuevos = new Button { Text = "Pedidos nuevos", Width = 130, Height = 34 };
    private readonly Label _lblResumen = new Label { AutoSize = false, Height = 110, Dock = DockStyle.Top, Font = new Font("Segoe UI", 11f), Padding = new Padding(8) };
    private readonly DataGridView _grilla = new DataGridView { Dock = DockStyle.Fill, ReadOnly = true, AllowUserToAddRows = false, AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill, SelectionMode = DataGridViewSelectionMode.FullRowSelect };
    private readonly Button _btnPagado = new Button { Text = "Pago verificado", Width = 140, Height = 36, Enabled = false };
    private readonly Button _btnEntregado = new Button { Text = "Entregado", Width = 120, Height = 36, Enabled = false };
    private PedidoWeb? _actual;

    public FormPedidosWeb()
    {
        Text = "Pedidos de la tienda web · Mega Las Malvinas";
        Width = 900; Height = 600; StartPosition = FormStartPosition.CenterScreen;

        var arriba = new FlowLayoutPanel { Dock = DockStyle.Top, Height = 50, Padding = new Padding(8) };
        arriba.Controls.AddRange(new Control[] { _txtCodigo, _btnBuscar, _btnNuevos });
        var abajo = new FlowLayoutPanel { Dock = DockStyle.Bottom, Height = 52, Padding = new Padding(8), FlowDirection = FlowDirection.RightToLeft };
        abajo.Controls.AddRange(new Control[] { _btnEntregado, _btnPagado });
        Controls.Add(_grilla); Controls.Add(_lblResumen); Controls.Add(arriba); Controls.Add(abajo);

        _btnBuscar.Click += async (s, e) => await BuscarAsync();
        _txtCodigo.KeyDown += async (s, e) => { if (e.KeyCode == Keys.Enter) { e.SuppressKeyPress = true; await BuscarAsync(); } };
        _btnNuevos.Click += async (s, e) => await ListarNuevosAsync();
        _btnPagado.Click += async (s, e) => await CambiarAsync(EstadoPedido.PagoVerificado);
        _btnEntregado.Click += async (s, e) => await CambiarAsync(EstadoPedido.Entregado);
        _grilla.CellDoubleClick += async (s, e) =>
        {
            if (e.RowIndex >= 0 && _grilla.Rows[e.RowIndex].Cells["Codigo"]?.Value is string cod) { _txtCodigo.Text = cod; await BuscarAsync(); }
        };
        FormClosed += (s, e) => _api.Dispose();
    }

    private async System.Threading.Tasks.Task BuscarAsync()
    {
        var codigo = PedidosWebClient.NormalizarCodigo(_txtCodigo.Text);
        if (codigo == null) { MessageBox.Show(this, "Código no válido. Formato: MLM-AAMMDD-XXXX", "Pedido"); return; }
        Ocupado(true);
        try
        {
            _actual = await _api.BuscarAsync(codigo);
            if (_actual == null) { _lblResumen.Text = "No existe el pedido " + codigo; _grilla.DataSource = null; return; }
            Mostrar(_actual);
        }
        catch (Exception ex) { MessageBox.Show(this, ex.Message, "Error al consultar"); }
        finally { Ocupado(false); _txtCodigo.SelectAll(); _txtCodigo.Focus(); }
    }

    private void Mostrar(PedidoWeb p)
    {
        var alerta = p.Coincide == false ? "   ⚠ EL TOTAL NO COINCIDE CON LOS PRECIOS (calculado S/ " + p.TotalCalculado?.ToString("0.00") + ")" : "";
        _lblResumen.ForeColor = p.Coincide == false ? Color.Firebrick : SystemColors.ControlText;
        _lblResumen.Text = $"{p.Codigo}  ·  {p.Estado}  ·  {p.Fecha:dd/MM/yyyy HH:mm}\r\n"
                         + $"Cliente: {p.Cliente}  ·  Cel: {p.Celular}  ·  DNI: {p.DNI}\r\n"
                         + $"Pago: {p.MetodoPago}  ·  N° operación: {p.Operacion}  ·  Recojo: {p.Recojo}\r\n"
                         + $"TOTAL: S/ {p.TotalWeb:0.00}{alerta}";
        _grilla.DataSource = p.Productos.Select(i => new { i.Codigo, Producto = i.Nombre, Cantidad = i.Cantidad + " " + i.Unidad, Precio = i.Precio.ToString("0.00"), Importe = i.Importe.ToString("0.00") }).ToList();
        _btnPagado.Enabled = p.Estado == EstadoPedido.Nuevo;
        _btnEntregado.Enabled = p.Estado != EstadoPedido.Entregado && p.Estado != EstadoPedido.Anulado;
    }

    private async System.Threading.Tasks.Task ListarNuevosAsync()
    {
        Ocupado(true);
        try
        {
            var lista = await _api.ListarAsync(EstadoPedido.Nuevo);
            _actual = null; _btnPagado.Enabled = _btnEntregado.Enabled = false;
            _lblResumen.ForeColor = SystemColors.ControlText;
            _lblResumen.Text = lista.Count + " pedido(s) nuevo(s). Doble clic para abrir uno.";
            _grilla.DataSource = lista.Select(p => new { p.Codigo, Fecha = p.Fecha?.ToString("dd/MM HH:mm"), p.Cliente, p.Celular, p.MetodoPago, p.Operacion, Total = p.TotalWeb.ToString("0.00") }).ToList();
        }
        catch (Exception ex) { MessageBox.Show(this, ex.Message, "Error al listar"); }
        finally { Ocupado(false); }
    }

    private async System.Threading.Tasks.Task CambiarAsync(string estado)
    {
        if (_actual == null) return;
        if (estado == EstadoPedido.PagoVerificado && MessageBox.Show(this, $"¿Ya viste en tu app el pago N° {_actual.Operacion} por S/ {_actual.TotalWeb:0.00}?", "Confirmar pago", MessageBoxButtons.YesNo) != DialogResult.Yes) return;
        Ocupado(true);
        try { await _api.CambiarEstadoAsync(_actual.Codigo, estado, "Desde caja " + Environment.MachineName); await BuscarAsync(); }
        catch (Exception ex) { MessageBox.Show(this, ex.Message, "No se pudo actualizar"); }
        finally { Ocupado(false); }
    }

    private void Ocupado(bool si) { UseWaitCursor = si; _btnBuscar.Enabled = _btnNuevos.Enabled = !si; }
}
