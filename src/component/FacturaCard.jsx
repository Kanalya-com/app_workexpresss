import { useState } from "react";
import { Calendar, Eye, CreditCard } from "lucide-react";

export default function FacturaCard({ codigo, tracking, monto, estado, fecha, onPayClick, onViewClick, onToggleSelect , isSelected}) {


  const estadoEstilos = {
    pagado: "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300",
    vencida: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300",
    pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300",
    parcial: "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300",
  };

  const colorEstado = estadoEstilos[estado?.toLowerCase()] || estadoEstilos["pendiente"];
  const esPagado = estado?.toLowerCase() === "pagado";

  return (
    <div
      onClick={() => {
        if (!esPagado) onToggleSelect(codigo);
      }}
      className={`
        flex flex-col justify-between
        bg-white dark:bg-[#040c13]
        border rounded-2xl shadow-sm hover:shadow-lg
        px-5 py-4 transition-all duration-300 select-none
        ${esPagado ? "cursor-default" : "cursor-pointer"}
        ${isSelected
          ? "border-orange-500 dark:border-pink-500"
          : "border-gray-100 dark:border-gray-800"
        }
      `}
    >
      {/* Encabezado */}
      <div className="flex flex-col justify-center gap-2">
        <div className="flex justify-between">
          <h3 className="font-bold text-2xl text-[#040c13] dark:text-white">{codigo}</h3>
          <span
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${colorEstado}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${esPagado
                ? "bg-green-500"
                : estado?.toLowerCase() === "vencida"
                  ? "bg-red-500"
                  : "bg-amber-500"
                }`}
            ></span>
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </span>
        </div>

        <p className="text-sm text-[#59656e] dark:text-[#ecf3f8] mt-1">Factura de envío</p>

        <div className="flex gap-2 items-center mt-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <p className="text-sm text-[#040c13] dark:text-white font-semibold">{fecha}</p>
        </div>
      </div>

      {/* Monto */}
      <div className="flex justify-between items-center mt-3">
        <p className="text-3xl md:text-2xl font-bold text-[#040c13] dark:text-white">${monto}</p>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2 mt-4">
        {/* Botón Ver */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onViewClick) onViewClick();
          }}
          className="flex items-center justify-center gap-2 flex-1 border border-gray-300 text-gray-800 dark:text-gray-200 rounded-xl py-2 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Eye className="w-4 h-4" />
          {esPagado ? "Ver Detalle" : "Ver"}
        </button>

        {/* Solo muestra “Pagar” si NO está pagado */}
        {!esPagado && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPayClick(codigo);

            }}
            className="flex items-center justify-center gap-2 flex-1 text-white rounded-xl py-2 font-medium text-sm bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition"
          >
            <CreditCard className="w-4 h-4" />
            Pagar
          </button>
        )}
      </div>
    </div>
  );
}
