import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { usePerfilStore } from "../store/perfilStore";

export default function SeguroPaqueteria({ clienteId, precio = 0.99, onPopup }) {
  const { seguroActivo, loadingSeguro, toggleSeguro } = usePerfilStore();
  // 🔹 Cambiar estado del seguro
  const handleToggleSeguro = async () => {
    const res = await toggleSeguro(clienteId);
    onPopup({
      show: true,
      success: res.success,
      message: res.message,
    });

  };


  return (
    <div
      className={`relative rounded-2xl p-5 shadow-md overflow-hidden transition-all border-2 w-full sm:min-w-[300px] 
        ${seguroActivo
          ? "border-orange-500 dark:border-pink-500"
          : "border-gray-300 dark:border-gray-700"
        } 
        bg-white dark:bg-gray-900`}
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`font-semibold text-base transition-colors ${seguroActivo
            ? "text-orange-500 dark:text-pink-500"
            : "text-gray-600 dark:text-gray-400"
            }`}
        >
          Seguro de Paquetería
        </h3>
        <div
          className={`p-2 rounded-full transition-colors ${seguroActivo
            ? "bg-orange-500/30 dark:bg-pink-500/30"
            : "bg-gray-200 dark:bg-gray-800"
            }`}
        >
          <ShieldCheck
            className={`w-5 h-5 transition-colors ${seguroActivo
              ? "text-orange-500 dark:text-pink-500"
              : "text-gray-400 dark:text-gray-500"
              }`}
          />
        </div>
      </div>

      {/* Descripción */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Protege tus envíos ante daños o pérdidas durante el transporte.
      </p>

      {/* Precio */}
      <p
        className={`text-3xl font-extrabold tracking-tight ${seguroActivo
          ? "text-orange-500 dark:text-pink-500"
          : "text-gray-300"
          }`}
      >
        ${precio.toFixed(2)}
        <span className="text-base text-gray-300 font-medium ml-1">
          / Paquete
        </span>
      </p>

      {/* Toggle Switch */}
      <div className="mt-5 flex items-center justify-between">
        <span
          className="text-sm font-medium text-orange-500 dark:text-pink-500"
        >
          {seguroActivo ? "Seguro Activo" : "Seguro Inactivo"}
        </span>

        <button
          onClick={handleToggleSeguro}
          disabled={loadingSeguro}
          className={`relative w-14 h-7 flex items-center rounded-full transition-all duration-300 ${seguroActivo
            ? "bg-linear-to-r from-orange-500 to-pink-500 rounded-2xl"
            : "bg-gray-300 dark:bg-gray-700"
            }`}
        >

          <span
            className={`absolute left-1 top-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-sm transform transition-transform duration-300 ${seguroActivo ? "translate-x-7" : "translate-x-0"
              }`}
          ></span>
        </button>
      </div>
    </div>
  );
}
