import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function RecivoFactura() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingPago, setLoadingPago] = useState(false);

  async function fetchInvoice() {
    try {
      const url = `https://rknrqthsiacqpbqivres.supabase.co/functions/v1/get-invoice?id=${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error cargando factura");
      setData(await res.json());
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInvoice();
  }, [id]);
  const handlePagoTotal = async () => {
    try {
      setLoadingPago(true);

      const total = Number(factura.total_calculado);

      if (!total || total <= 0) {
        alert("La factura no tiene monto pendiente.");
        return;
      }

      const descripcion = `Pago factura #${factura.numero}`;

      const { data, error } = await supabase.functions.invoke(
        "rapid-processor",
        {
          body: {
            monto: total,
            descripcion,
            id_cliente: cliente.id_cliente,
            id_factura: factura.id_factura
          },
        }
      );

      if (error) {
        console.error("❌ Error Tilopay:", error);
        alert("No se pudo generar el enlace de pago.");
        return;
      }

      let parsed = data;
      if (typeof parsed === "string") parsed = JSON.parse(parsed);

      if (!parsed?.url) {
        alert("Tilopay no devolvió URL de pago.");
        return;
      }

      // Redirección mobile-safe
      window.open(parsed.url, "_self");

    } catch (err) {
      console.error(err);
      alert("Ocurrió un error creando el pago.");
    } finally {
      setLoadingPago(false);
    }
  };

  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );

  if (error || !data)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg font-medium">Error cargando factura.</p>
      </div>
    );

  const { factura, cliente, plan, items } = data;

  return (
    <div className="wrapper bg-[#eef2f7] py-6 px-3 print:p-0 print:m-0">

      {/* Factura impresa */}
      <style>{`
          html {
            color-scheme: light !important;
          }

          @media print {

            @page {
              size: A4 portrait;
              margin: 0;
            }

            html {
              color-scheme: light !important;
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .wrapper {
              background: white !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .invoice-container {
              width: 100% !important;
              max-width: 100% !important;
              padding: 40px !important;
              margin: 0 !important;
              background: white !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            .invoice-table-mobile {
              display: none !important;
            }

            .invoice-table-desktop {
              display: table !important;
              width: 100% !important;
            }

            * {
              overflow: visible !important;
            }

            .no-break {
              page-break-inside: avoid !important;
            }

            .hide-print {
              display: none !important;
            }
          }
      `}</style>

      {/*  CONTENEDOR PRINCIPAL  */}
      <div className="invoice-container bg-white rounded-xl shadow-lg max-w-3xl w-full mx-auto p-6 md:p-10 print:rounded-none print:shadow-none">

        {/*  HEADER */}
        <div className="no-break flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 gap-6 print:border-none">

          <div className="flex gap-4 items-center">
            <img
              src="https://rknrqthsiacqpbqivres.supabase.co/storage/v1/object/public/branding/LOGO-WORKEXPRESS.png"
              alt="logo"
              className="w-20 h-20 object-contain print:w-16 print:h-16"
            />

            <div className="leading-tight">
              <h2 className="text-lg font-bold text-[#1f2937]">workexpress.online</h2>
              <p className="text-sm text-[#374151]">Los pueblos - Santiago - Chitré, Panamá</p>
              <p className="text-sm text-[#374151]">contacto@workexpress.online</p>
              <p className="text-sm text-[#374151]">Tel: 63864733 — 68187751 — 6482-9251</p>
              <p className="text-sm text-[#374151]">RUC: 97592309 - DV 15</p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-xl font-bold text-[#1f2937]">Factura #{factura.numero}</h1>
            <p className="text-sm text-[#374151]">Emitida: {factura.created_at?.slice(0, 10)}</p>
            <p className="text-sm text-[#374151]">Vence: {factura.fecha_vencimiento}</p>

            <button
              onClick={() => window.print()}
              className="hide-print mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Descargar / Imprimir
            </button>
          </div>
        </div>

        {/*  INFO CLIENTE  */}
        <div className="no-break mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="p-4 rounded-lg bg-[#f8faff] border">
            <h3 className="font-semibold text-[#1f2937] mb-2">Facturar a</h3>
            <p className="text-sm font-medium text-[#1f2937]">
              {cliente.nombre} {cliente.apellido}
            </p>
            <p className="text-sm text-[#374151]">{cliente.direccion}</p>

            <p className="mt-3 text-sm text-[#1f2937]">
              <span className="font-semibold">Plan: </span>{plan.descripcion}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#f8faff] border">
            <h3 className="font-semibold text-[#1f2937] mb-2">Información adicional</h3>
            <p className="text-sm text-[#1f2937]">{cliente.email}</p>
            <p className="text-sm text-[#374151]">Teléfono: {cliente.telefono}</p>
          </div>
        </div>

        {/*  TABLA  */}
        <div className="no-break mt-10">

          {/* DESKTOP TABLE */}
          <div className="invoice-table-desktop hidden md:block overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-[#cddaff] text-[#1f2937] font-semibold">
                <tr>
                  <th className="p-3 text-left">Producto o servicio</th>
                  <th className="p-3 text-center">Cantidad</th>
                  <th className="p-3 text-center">Precio</th>
                  <th className="p-3 text-center">Total</th>
                </tr>
              </thead>

              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">
                      <span className="font-medium text-[#1f2937]">{it.descripcion}</span>
                      {it.tracking && (
                        <p className="text-xs text-[#374151] mt-1">
                          <strong>Tracking:</strong> {it.tracking}
                        </p>
                      )}
                    </td>

                    <td className="p-3 text-center text-[#1f2937]">{it.cantidad}</td>
                    <td className="p-3 text-center text-[#1f2937]">{it.precio_unitario} PAB</td>
                    <td className="p-3 text-center font-semibold text-[#1f2937]">{it.total_linea} PAB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS (HIDDEN ON PRINT) */}
          <div className="invoice-table-mobile md:hidden flex flex-col gap-4">
            {items.map((it, i) => (
              <div key={i} className="border rounded-lg p-4 bg-white shadow-sm">
                <p className="font-semibold text-[#1f2937] text-base">{it.descripcion}</p>

                {it.tracking && (
                  <p className="text-xs text-[#374151] mt-1">
                    <strong>Tracking:</strong> {it.tracking}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <p className="text-[#1f2937]"><strong>Cantidad:</strong> {it.cantidad}</p>
                  <p className="text-[#1f2937]"><strong>Precio:</strong> {it.precio_unitario} PAB</p>
                  <p className="text-[#1f2937] col-span-2"><strong>Total:</strong> {it.total_linea} PAB</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  TOTAL  */}
        <div className="no-break mt-10 flex justify-end print:mt-6">
          <div className="text-right">

            <p className="text-sm text-[#374151]">
              Impuestos: <strong>0 PAB</strong>
            </p>

            <p className="text-2xl font-bold mt-3 text-[#1f2937]">
              Total factura: {factura.total_calculado} PAB
            </p>

            <div className="bg-[#dce6ff] text-[#1f2937] px-4 py-3 rounded-lg mt-4 font-semibold print:bg-gray-200">
              Saldo adeudado: {factura.total_calculado} PAB
            </div>
            <button
              onClick={handlePagoTotal}
              disabled={loadingPago}
              className="hide-print mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-60"
            >
              {loadingPago ? "Procesando..." : "Pagar Factura"}
            </button>

          </div>
        </div>

        {/*  FOOTER  */}
        <div className="no-break text-center text-xs text-[#6b7280] mt-12 print:mt-6">
          Gracias por preferir WorkExpress.online.
          <br />© {new Date().getFullYear()} Todos los derechos reservados.
        </div>

      </div>
    </div>
  );
}
