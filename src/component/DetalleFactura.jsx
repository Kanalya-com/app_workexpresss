import {
  Package,
  CalendarDays,
  User,
  Mail,
  DollarSign,
  MapPin,
  Truck,
  Weight,
  X
} from "lucide-react";

export default function DetalleFactura({ factura, onClose }) {

  const esPagado = factura.estado?.toLowerCase() === "pagado";
  const impuesto = factura?.tb_cliente.seguro ? 0.99 : 0.00;
  const fechaEmision = factura.created_at
    ? factura.created_at.slice(0, 10).split("-").reverse().join(" / ")
    : "—";

  const fechaVenc = factura.estado_vencimiento
    ? factura.estado_vencimiento.slice(0, 10).split("-").reverse().join(" / ")
    : "—";

  return (
    <div className="bg-white dark:bg-[#01060c] text-[#01060c] dark:text-white p-6 rounded-2xl w-full max-w-lg mx-auto shadow-xl border border-gray-800">

      {/* Header */}
      <div className="flex justify-between items-start pt-4">
        <div>
          <h2 className="text-2xl font-bold">{factura.numero}</h2>
          <p className="text-gray-400 text-sm">Detalle de la factura</p>
        </div>

        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${esPagado ? "bg-pink-600 text-white" : "bg-yellow-500 text-black"
          }`}>
          {factura.estado}
        </span>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 dark:text-white text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Fechas */}
      <div className="mt-4 text-sm border-b border-gray-800 pb-3 space-y-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-pink-500" />
          <span><strong>Fecha emisión:</strong> {fechaEmision}</span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-pink-500" />
          <span><strong>Número de paquete </strong>{factura?.tb_lote_facturacion?.tb_paquetes?.[0]?.tracking_id ?? "—"}</span>
        </div>
      </div>

      {/* Cliente */}
      <div className="dark:bg-[#040c13] bg-blue-50 rounded-xl p-4 mt-4  text-[#040c13] dark:text-white">
        <h3 className="flex items-center gap-2 font-semibold mb-3">
          <User size={18} className="text-pink-500" /> Información del cliente
        </h3>

        <p className="text-sm grid">
          <span className="text-gray-400">Nombre</span>
          {factura.tb_cliente?.nombre}
        </p>

        <p className="text-sm grid">
          <span className="text-gray-400">Email</span>
          {factura.tb_cliente?.email}
        </p>
      </div>

      {/* Envío */}
      {/* <div className="bg-[#040c13] rounded-xl p-4 mt-4">
        <h3 className="flex items-center gap-2 font-semibold text-gray-200 mb-3">
          <Truck size={18} className="text-pink-500" /> Información del envío
        </h3>

        <div className="text-sm space-y-1">
          <p><MapPin className="inline-block mr-1 text-pink-500" /> Origen: <strong>{factura.tb_paquetes?.origen}</strong></p>
          <p><MapPin className="inline-block mr-1 text-pink-500" /> Destino: <strong>{factura.tb_paquetes?.destino}</strong></p>
          <p><Weight className="inline-block mr-1 text-pink-500" /> Peso: <strong>{factura.tb_paquetes?.peso_real} lb</strong></p>
        </div>
      </div> */}

      {/* Costos */}
      <div className="dark:bg-[#040c13] bg-blue-50 text-[#040c13] dark:text-white rounded-xl p-4 mt-4">
        <h3 className="flex items-center gap-2 font-semibold  mb-3">
          <DollarSign size={18} className="text-pink-500" /> Desglose de costos
        </h3>

        <div className="text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>${factura.subtotal?.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Seguro</span><span>${impuesto.toFixed(2)}</span></div>

          <div className="flex justify-between font-bold border-t border-gray-700 pt-2 mt-2">
            <span>Total</span>
            <span>${factura.total?.toFixed(2)}</span>
          </div>

          <div className="flex justify-between"><span>Pagado</span><span>${factura.total_pagado?.toFixed(2)}</span></div>

          <div className="flex justify-between font-bold text-orange-400">
            <span>Restante</span>
            <span>${factura.total_restante?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
