import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

export default function Cartilla({ onModalChange }) {
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(0);
  const totalSellos = 100;
  const sellosActuales = 35;
  const faltantes = totalSellos - sellosActuales;
  const porcentaje = (sellosActuales / totalSellos) * 100;
  const sellosPorPagina = 25;
  const totalPaginas = totalSellos / sellosPorPagina;

  useEffect(() => {
    if (onModalChange) onModalChange(showModal);
  }, [showModal, onModalChange]);

  const sellos = Array.from({ length: totalSellos });
  const start = page * sellosPorPagina;
  const end = start + sellosPorPagina;
  const sellosPagina = sellos.slice(start, end);

  return (
    <div>
      {/* <h3 className="text-lg dark:text-[#01060c] text-white font-semibold mb-4">
      Promociones y Anuncios
    </h3> */}
      {/* 🔸 Tarjeta principal */}
      <div
        onClick={() => setShowModal(true)}
        className="h-56 md:h-64 sm:mt-11 bg-linear-to-br from-[#f2af1e] via-[#f5a623] to-[#ea6342] rounded-2xl p-6 shadow-md text-white relative cursor-pointer hover:scale-[1.01] transition-all duration-300"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Gift className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-lg">Cartilla de Puntos</h2>
            </div>
            <p className="text-sm opacity-90">Gana puntos por tus compras</p>
          </div>
          <button className="text-white/80 hover:text-white text-xl font-bold">→</button>
        </div>

        {/* Progreso */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Tus Puntos</span>
            <span>
              {sellosActuales} / {totalSellos} pts
            </span>
          </div>
          <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-2 bg-white/90 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${porcentaje}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/90">
            <span>Faltan {faltantes} pts</span>
            <span>{porcentaje.toFixed(0)}%</span>
          </div>

          <div className="mt-3 bg-white/20 text-white text-sm rounded-lg p-3 flex items-center gap-2 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Sigue comprando para desbloquear recompensas</span>
          </div>
        </div>
      </div>

      {/* 🔹 Modal con los sellos */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh] no-scrollbar"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#f2af1e]" />
                  <h3 className="text-lg font-semibold text-[#f2af1e]">
                    Progreso de Cartilla
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contador */}
              <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Puntos acumulados: {sellosActuales} / {totalSellos}
              </p>

              {/* Grilla de puntos */}
              <div className="grid grid-cols-5 gap-3 justify-items-center mb-6">
                {sellosPagina.map((_, i) => {
                  const index = start + i;
                  return (
                    <div
                      key={index}
                      className={`w-10 h-10 rounded-full border-2 ${
                        index < sellosActuales
                          ? "bg-gradient-to-br from-[#f2af1e] to-[#ea6342] border-transparent"
                          : "border-[#f8d7a3] bg-[#fff5e1]"
                      }`}
                    ></div>
                  );
                })}
              </div>

              {/* Paginación */}
              <div className="flex justify-center items-center gap-3 mb-6">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                  className={`p-2 rounded-full ${
                    page === 0
                      ? "text-gray-300"
                      : "text-[#f2af1e] hover:bg-[#fff5e1]"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPaginas }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${
                        i === page ? "bg-[#f2af1e]" : "bg-gray-300"
                      }`}
                    ></div>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPaginas - 1))
                  }
                  disabled={page === totalPaginas - 1}
                  className={`p-2 rounded-full ${
                    page === totalPaginas - 1
                      ? "text-gray-300"
                      : "text-[#f2af1e] hover:bg-[#fff5e1]"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button className="w-full py-3 bg-gradient-to-r from-[#f2af1e] to-[#ea6342] text-white rounded-lg text-sm font-medium hover:opacity-90 transition">
                  Obtener puntos (Facturas Pagadas)
                </button>

                <button
                  disabled
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium"
                >
                  Te faltan {faltantes} puntos para canjear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Oculta el scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
