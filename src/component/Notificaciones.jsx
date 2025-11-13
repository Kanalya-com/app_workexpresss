import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trash2, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient"; // 👈 asegúrate de tener esto configurado

export default function Notificaciones({ cliente, onModalChange }) {
  const [showModal, setShowModal] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

  // 🔹 Cargar notificaciones al inicio
  useEffect(() => {
    
    const fetchNotificaciones = async () => {
      if (!cliente?.id_cliente) return;
      const { data, error } = await supabase
        .from("tb_notificaciones")
        .select("*")
        .eq("id_cliente", cliente.id_cliente)
        .order("fecha_envio", { ascending: false });
      
      if (error) console.error("❌ Error cargando notificaciones:", error.message);
      else setNotificaciones(data || []);
    };
    
    fetchNotificaciones();

    // 🔹 Escuchar cambios en tiempo real
    const canal = supabase
      .channel("notificaciones-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // escucha INSERT, UPDATE, DELETE
          schema: "public",
          table: "tb_notificaciones",
          filter: `id_cliente=eq.${cliente?.id_cliente}`,
        },
        (payload) => {
          console.log("📡 Notificación detectada:", payload);

          // 🔁 Sin volver a consultar, actualiza el estado local
          setNotificaciones((prev) => {
            if (payload.eventType === "INSERT") {
              return [payload.new, ...prev];
            } else if (payload.eventType === "UPDATE") {
              return prev.map((n) =>
                n.id_notificacion === payload.new.id_notificacion ? payload.new : n
              );
            } else if (payload.eventType === "DELETE") {
              return prev.filter(
                (n) => n.id_notificacion !== payload.old.id_notificacion
              );
            }
            return prev;
          });
        }
      )
      .subscribe();

    // Limpieza
    return () => {
      supabase.removeChannel(canal);
    };
  }, [cliente]);

  // 🔹 Notificar al padre si el modal cambia
  useEffect(() => {
    if (onModalChange) onModalChange(showModal);
  }, [showModal, onModalChange]);

  const eliminarNotificacion = async (id) => {
  const { error } = await supabase
    .from("tb_notificaciones")
    .delete()
    .eq("id_notificacion", id);

  if (error) {
    console.error("❌ Error eliminando notificación:", error.message);
  } else {
    // 👇 Actualiza el estado local instantáneamente
    setNotificaciones((prev) =>
      prev.filter((n) => n.id_notificacion !== id)
    );
  }
};

  const eliminarTodas = async () => {
    await supabase.from("tb_notificaciones").delete().eq("id_cliente", cliente.id_cliente);
  };

  // 🔹 Render
  return (
    <div>
      {/* Icono con contador */}
      <div onClick={() => setShowModal(true)} className="relative flex items-center justify-center w-11 h-11 cursor-pointer">
        <Bell className="w-5 h-5" />
        {notificaciones.length > 0 && (
          <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
            {notificaciones.length}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 dark:text-gray-100 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#b71f4b] dark:text-[#f2af1e]" />
                  <h3 className="text-lg font-semibold text-[#b71f4b] dark:text-[#f2af1e]">
                    Bandeja de Notificaciones
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Lista */}
              <div className="space-y-4">
                {notificaciones.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-10">
                    No tienes notificaciones pendientes 🎉
                  </p>
                ) : (
                  notificaciones.map((notif) => (
                    <div
                      key={notif.id_notificacion}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-sm dark:hover:shadow-[#f2af1e]/10 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1">
                            {notif.titulo}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                            {notif.mensaje}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(notif.fecha_envio).toLocaleString("es-PA", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                        <button
                          onClick={() => eliminarNotificacion(notif.id_notificacion)}
                          className="text-gray-400 hover:text-[#b71f4b] dark:hover:text-[#f2af1e] transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botón eliminar todas */}
              {notificaciones.length > 0 && (
                <button
                  onClick={eliminarTodas}
                  className="mt-6 w-full py-3 bg-[#b71f4b] dark:bg-[#f2af1e] text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-[#a01744] dark:hover:bg-[#f2af1e]/80 transition"
                >
                  Eliminar todas las notificaciones
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
