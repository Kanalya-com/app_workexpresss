import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function SeguroPaqueteria({ clienteId, precio = 0.99, onPopup }) {
  const [activo, setActivo] = useState(true);
  const [ultimaDesactivacion, setUltimaDesactivacion] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Cargar estado actual del seguro
  useEffect(() => {
    const fetchSeguro = async () => {
      if (!clienteId) return;
      const { data, error } = await supabase
        .from("tb_cliente")
        .select("seguro")
        .eq("id_cliente", clienteId)
        .maybeSingle();

      if (!error && data) {
        setActivo(data.seguro ?? true);
        setUltimaDesactivacion(data.fecha_desactivacion);
      }
    };
    fetchSeguro();
  }, [clienteId]);

  // 🔹 Cambiar estado del seguro
  const handleToggleSeguro = async () => {
    if (loading) return;

    const nuevoEstado = !activo;
    const now = new Date();

    if (!nuevoEstado) localStorage.setItem("ultimaDesactivacionSeguro", now.toISOString());

    const ultimaDesactivacionLocal = localStorage.getItem("ultimaDesactivacionSeguro");
    if (!nuevoEstado && ultimaDesactivacionLocal) setUltimaDesactivacion(ultimaDesactivacionLocal);

    if (
      !activo &&
      ultimaDesactivacionLocal &&
      (now - new Date(ultimaDesactivacionLocal)) / (1000 * 60 * 60 * 24) < 90
    ) {
      onPopup({
        show: true,
        success: false,
        message: "No puedes volver a activar el seguro hasta pasados 90 días.",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("tb_cliente")
      .update({ seguro: nuevoEstado })
      .eq("id_cliente", clienteId);

    setLoading(false);

    if (error) {
      onPopup({
        show: true,
        success: false,
        message: "Error al actualizar el estado del seguro.",
      });
      return;
    }

    setActivo(nuevoEstado);
    onPopup({
      show: true,
      success: true,
      message: nuevoEstado
        ? "Seguro activado correctamente."
        : "Has desactivado tu seguro. No podrás reactivarlo durante 90 días.",
    });
  };

  return (
    <div
      className={`relative rounded-2xl p-5 shadow-md overflow-hidden transition-all border-2 w-full sm:min-w-[300px] 
        ${activo
          ? "border-orange-500 dark:border-pink-500"
          : "border-gray-300 dark:border-gray-700"
        } 
        bg-white dark:bg-gray-900`}
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`font-semibold text-base transition-colors ${activo
              ? "text-orange-500 dark:text-pink-500"
              : "text-gray-600 dark:text-gray-400"
            }`}
        >
          Seguro de Paquetería
        </h3>
        <div
          className={`p-2 rounded-full transition-colors ${activo
              ? "bg-orange-500/30 dark:bg-pink-500/30"
              : "bg-gray-200 dark:bg-gray-800"
            }`}
        >
          <ShieldCheck
            className={`w-5 h-5 transition-colors ${activo
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
        className={`text-3xl font-extrabold tracking-tight ${activo
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
          {activo ? "Seguro Activo" : "Seguro Inactivo"}
        </span>

        <button
          onClick={handleToggleSeguro}
          disabled={loading}
          className={`relative w-14 h-7 flex items-center rounded-full transition-all duration-300 ${activo
              ? "bg-linear-to-r from-orange-500 to-pink-500 rounded-2xl "
              : "bg-gray-300 dark:bg-gray-700"
            }`}
        >
          <span
            className={`absolute left-1 top-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-sm transform transition-transform duration-300 ${activo ? "translate-x-7" : "translate-x-0"
              }`}
          ></span>
        </button>
      </div>
    </div>
  );
}
