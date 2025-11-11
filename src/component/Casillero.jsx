import React, { useState, useEffect } from "react";
import {
  ClipboardCopy,
  Plane,
  Ship,
  MapPin,
  X,
  Landmark,
  Flag,
  Globe,
  Hash,
  Phone,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import Popup from "./Popup";

export default function Casillero({ onModalChange, cliente }) {
  const [activeCountry, setActiveCountry] = useState(null);
  const [activeTab, setActiveTab] = useState("Aéreo");
  const [showModal, setShowModal] = useState(false);
  const [casilleros, setCasilleros] = useState([]);
  const [popupData, setPopupData] = useState({ show: false, message: "", type: "success" });
  const [selectedItem, setSelectedItem] = useState(null);
  const showPopup = (message, type = "success") => setPopupData({ show: true, message, type });
  const handleClosePopup = () => setPopupData((prev) => ({ ...prev, show: false }));

  // 🔹 Bloquear scroll completamente cuando el modal está activo
  useEffect(() => {
    if (onModalChange) onModalChange(showModal);

    if (showModal) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden"; // bloquea también html
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1); // restaura posición original
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showModal, onModalChange]);


  // 🔹 Cargar casilleros
  useEffect(() => {
    const fetchCasilleros = async () => {
      const { data, error } = await supabase
        .from("tb_casillero")
        .select(`
          id_casillero,
          direccion1,
          direccion2,
          ciudad,
          provincia,
          estado,
          codigo_postal,
          telefono,
          tb_paises (nombre),
          tb_tipo_envio (nombre)
        `);

      if (error) {
        console.error("Error cargando casilleros:", error.message);
        return;
      }
      
      const formatted = data.map((c) => ({
        id: c.id_casillero,
        tipo_envio: c.tb_tipo_envio?.nombre || "Desconocido",
        pais: c.tb_paises?.nombre || "N/A",
        direccion1: c.direccion1 || "—",
        direccion2: c.direccion2 || "—",
        ciudad: c.ciudad || "—",
        provincia: c.provincia || "—",
        estado: c.estado || "—",
        codigo_postal: c.codigo_postal || "—",
        telefono: c.telefono || "—",
      }));

      setCasilleros(formatted);
      if (formatted.length > 0) setActiveCountry(formatted[0].pais);
    };

    fetchCasilleros();
  }, []);

  const paises = [...new Set(casilleros.map((c) => c.pais))];

  // 🔹 Si es China marítimo, usa los datos de China aéreo
  const item =
    activeCountry?.toLowerCase() === "china" && activeTab === "Marítimo"
      ? casilleros.find((c) => c.pais === activeCountry && c.tipo_envio === "Aéreo")
      : casilleros.find((c) => c.pais === activeCountry && c.tipo_envio === activeTab);

  const getNombreCasillero = () => {
    if (!cliente) return "Usuario ST";

    const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
    const sucursal = (cliente?.sucursal || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // 🔸 Si el país es China, formato especial
    if (activeCountry?.toLowerCase() === "china") {
      return `${nombreCompleto} CBX9213`;
    }

    // 🔸 Lógica estándar para el resto
    let sufijo = "ST";
    if (sucursal.includes("chitre")) sufijo = "STC";
    else if (sucursal.includes("panama")) sufijo = "STP";

    return activeTab === "Marítimo"
      ? `${nombreCompleto} ${sufijo} - Marítimo`
      : `${nombreCompleto} ${sufijo}`;
  };

  const getDireccion2 = () => {
    // 🔸 Si el país es China, mostrar dirección2 del registro de BD
    if (activeCountry?.toLowerCase() === "china" && selectedItem?.direccion2) {
      return selectedItem.direccion2;
    }

    const sucursal = (cliente?.sucursal || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    let sufijo = "ST";
    if (sucursal.includes("chitre")) sufijo = "STC";
    else if (sucursal.includes("panama")) sufijo = "STP";

    return activeTab === "Marítimo" ? `${sufijo} - Marítimo` : sufijo;
  };


  const handleCopyAll = (data) => {
    const text = `
${getNombreCasillero()}
━━━━━━━━━━━━━━━━━━━━
📍 Dirección: ${data.direccion1}
📍 Dirección 2: ${getDireccion2()}
🏙️ Ciudad: ${data.ciudad}
🗺️ Estado: ${data.estado}
📮 Código Postal: ${data.codigo_postal}
🌍 País: ${data.pais}
📞 Teléfono: ${data.telefono}
━━━━━━━━━━━━━━━━━━━━
WorkExpress - Envíos confiables
`;
    navigator.clipboard.writeText(text.trim());
    setShowModal(false);
    showPopup(`Información de envío ${data.tipo_envio} copiada al portapapeles`);
  };

  const handleCopyField = (value, label) => {
    navigator.clipboard.writeText(value);
    showPopup(`${label} copiado al portapapeles`);
  };

  const InfoRow = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-none">
      <div className="flex items-start gap-3 flex-1">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${color}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}:</p>
          <p className="font-semibold text-gray-900 dark:text-gray-200 text-sm wrap-break-word">{value}</p>
        </div>
      </div>
      <button
        onClick={() => handleCopyField(value, label)}
        className="ml-2 shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
      >
        <ClipboardCopy size={18} className="text-gray-400 hover:text-[#b71f4b] dark:hover:text-[#f2af1e]" />
      </button>
    </div>
  );

  return (
    <>
      <Popup show={popupData.show} message={popupData.message} type={popupData.type} onClose={handleClosePopup} />

      <div className="h-full max-w-96 relative bg-white dark:bg-[#01060c] rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-colors">
        {/* Título */}
        <div className="flex gap-2 items-center mb-4">
          <MapPin className="w-6 h-6 text-[#d30046]" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Mis Casilleros</h2>
        </div>

        {/* Sección dividida por país */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {paises.map((pais) => (
            <div key={pais} className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-1">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{pais}</h3>
              </div>

              <div className="flex flex-wrap gap-3">
                {["Aéreo", "Marítimo"].map((tipo) => {
                  const isActive = activeCountry === pais && activeTab === tipo;
                  return (
                    <button
                      key={`${pais}-${tipo}`}
                      onClick={() => {
                        const seleccionado = casilleros.find(
                          (c) => c.pais === pais && c.tipo_envio === tipo
                        );
                        

                        setSelectedItem(seleccionado); // 🔹 Guardamos el objeto correcto
                        setActiveCountry(pais);
                        setActiveTab(tipo);
                        setShowModal(true);
                      }}

                      className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${isActive
                        ? "bg-linear-to-br from-[#d30046] via-[#db2fb2] to-pink-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                      {tipo === "Aéreo" ? <Plane className="w-4 h-4" /> : <Ship className="w-4 h-4" />}
                      {tipo}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
  {showModal && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowModal(false)}
    >
      <motion.div
        className="bg-white dark:bg-[#01060c] w-[92%] max-w-md rounded-3xl shadow-xl border border-gray-100 dark:border-[#01060c] relative overflow-hidden max-h-[85vh] flex flex-col"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-1">
            {activeTab === "Aéreo" ? (
              <Plane className="w-5 h-5 text-[#d30046]" />
            ) : (
              <Ship className="w-5 h-5 text-[#d30046]" />
            )}
            Casillero {activeCountry} - {activeTab}
          </h3>
          <button
            onClick={() => {
              setSelectedItem(null);
              setShowModal(false);
            }}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto no-scrollbar flex-1 px-6 py-4">
          {selectedItem ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Información completa del casillero
              </p>
              <div className="space-y-0">
                <InfoRow icon={User} label="Nombre Completo" value={getNombreCasillero()} color="bg-blue-500" />
                <InfoRow icon={MapPin} label="Dirección" value={selectedItem.direccion1} color="bg-red-500" />
                <InfoRow icon={MapPin} label="Dirección 2" value={getDireccion2()} color="bg-red-500" />
                <InfoRow icon={Landmark} label="Ciudad" value={selectedItem.ciudad} color="bg-purple-500" />
                <InfoRow icon={Flag} label="Estado" value={selectedItem.estado} color="bg-cyan-500" />
                <InfoRow icon={Hash} label="Código Postal" value={selectedItem.codigo_postal} color="bg-orange-500" />
                <InfoRow icon={Globe} label="País" value={selectedItem.pais} color="bg-cyan-500" />
                <InfoRow icon={Phone} label="Teléfono" value={selectedItem.telefono} color="bg-orange-500" />
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No hay datos disponibles.
            </p>
          )}
        </div>

        {/* Botón copiar */}
        {item && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#01060c]">
            <button
              onClick={() => handleCopyAll(item)}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-br from-[#d30046] via-orange-500 to-[#db2fb2] text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              <ClipboardCopy className="w-4 h-4" />
              Copiar Información
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* Estilo para ocultar scrollbar */}
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
    </>
  );
  
}