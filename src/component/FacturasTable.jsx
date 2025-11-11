import { useState } from "react";
import { Eye, Download } from "lucide-react";

export default function FacturasTable() {
  const [filtro, setFiltro] = useState("todas");

  // Datos simulados (puedes reemplazar con datos desde Supabase)
  const facturas = [
    { id: 1, numero: "INV-001", fecha: "7/11/2025", paquete: "4003319104346362", monto: 150, estado: "Pagado" },
    { id: 2, numero: "INV-002", fecha: "7/11/2025", paquete: "4003316693128867", monto: 200, estado: "Pagado" },
    { id: 3, numero: "INV-003", fecha: "7/11/2025", paquete: "4003312692612903332", monto: 175, estado: "Pagado" },
    { id: 4, numero: "INV-004", fecha: "4/11/2025", paquete: "4003319104346999", monto: 125, estado: "Pendiente" },
    { id: 5, numero: "INV-005", fecha: "2/11/2025", paquete: "4003319104347111", monto: 180, estado: "Pendiente" },
  ];

  const filtrarFacturas = () => {
    if (filtro === "pendientes") return facturas.filter(f => f.estado === "Pendiente");
    if (filtro === "pagadas") return facturas.filter(f => f.estado === "Pagado");
    return facturas;
  };

  const filtradas = filtrarFacturas();

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-3xl shadow-xl border border-gray-800">
      {/* Filtros */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setFiltro("todas")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            filtro === "todas"
              ? "bg-linear-to-r from-pink-500 to-orange-500 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          Todas ({facturas.length})
        </button>

        <button
          onClick={() => setFiltro("pendientes")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            filtro === "pendientes"
              ? "bg-blue-900 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          Pendientes ({facturas.filter(f => f.estado === "Pendiente").length})
        </button>

        <button
          onClick={() => setFiltro("pagadas")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            filtro === "pagadas"
              ? "bg-purple-800 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          Pagadas ({facturas.filter(f => f.estado === "Pagado").length})
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="py-3 text-left font-semibold">Factura</th>
              <th className="py-3 text-left font-semibold">Fecha</th>
              <th className="py-3 text-left font-semibold">Paquete</th>
              <th className="py-3 text-left font-semibold">Monto</th>
              <th className="py-3 text-left font-semibold">Estado</th>
              <th className="py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtradas.map((f) => (
              <tr
                key={f.id}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition"
              >
                <td className="py-3 font-medium text-gray-100">{f.numero}</td>
                <td className="py-3 text-gray-300">{f.fecha}</td>
                <td className="py-3 text-gray-400">{f.paquete}</td>
                <td className="py-3 font-semibold text-gray-100">${f.monto.toFixed(2)}</td>
                <td className="py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      f.estado === "Pagado"
                        ? "bg-pink-600 text-white"
                        : "bg-blue-900 text-white"
                    }`}
                  >
                    {f.estado}
                  </span>
                </td>
                <td className="py-3 flex items-center justify-center gap-4 text-gray-300">
                  <button className="hover:text-white">
                    <Eye size={18} />
                  </button>
                  <button className="hover:text-white">
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtradas.length === 0 && (
          <div className="text-center text-gray-500 py-6">No hay facturas disponibles</div>
        )}
      </div>
    </div>
  );
}
