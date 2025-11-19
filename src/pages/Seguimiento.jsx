import { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import BottomNav from "../component/BottomNav";
import { TrackingSearch } from "../component/TrackingSearch";
import { TrackingResult } from "../component/TrackingResult";
import { consultarTracking } from "../lib/tranking";
import { X, Package, User, CheckCircle2, Moon, Sun } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Popup from "../component/Popup";
import { useTheme } from "../component/ThemeProvider"; // 👈 agregado
const mapEstado = (estado) => {
  if (!estado) return "Pendiente";

  const st = estado.toLowerCase();

  if (st.includes("transit") || st.includes("tránsito")) return "En tránsito";
  if (st.includes("received")) return "Bodega Miami";
  if (st.includes("invoiced")) return "Facturado";

  return estado; // si no matchea, devuelve el original
};
export default function Seguimiento() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme(); // 👈 controla el tema global

  const [userName, setUserName] = useState("");
  const [clienteInfo, setClienteInfo] = useState({
    plan: "",
    beneficios: "",
    sucursal: "",
    direccion: "",
    telefono: "",
  });
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [allowOpen, setAllowOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  
  // 🔹 Obtener datos del cliente
  useEffect(() => {
    const getUserData = async () => {
      if (!user?.email) return;

      try {
        const { data: cliente, error: errorCliente } = await supabase
          .from("tb_cliente")
          .select("nombre, apellido, id_plan, id_sucursal")
          .eq("email", user.email)
          .maybeSingle();

        if (errorCliente) throw errorCliente;
        if (!cliente) return;

        const { data: plan } = await supabase
          .from("tb_plan")
          .select("descripcion, precio, beneficios")
          .eq("id_plan", cliente.id_plan)
          .maybeSingle();

        const { data: sucursal } = await supabase
          .from("tb_sucursal")
          .select("nombre, direccion, telefono")
          .eq("id_sucursal", cliente.id_sucursal)
          .maybeSingle();

        setUserName(`${cliente.nombre} ${cliente.apellido}`);
        setClienteInfo({
          plan: plan?.descripcion || "—",
          beneficios: plan?.beneficios || "—",
          sucursal: sucursal?.nombre || "—",
          direccion: sucursal?.direccion || "—",
          telefono: sucursal?.telefono || "—",
        });
      } catch (err) {
        console.error("Error al obtener datos del cliente:", err.message);
      }
    };

    getUserData();
  }, [user]);

  // 🔹 Manejo de modal
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  // 🔍 Buscar tracking
  const handleSearch = async (trackingId) => {
    const result = await consultarTracking(trackingId);
    if (result.error) {
      setTrackingData(null);
      setError(result);

      // console.warn("⛔ No se guardará porque la API devolvió error");
      return;
    }

    // ✅ Solo guardar si la API respondió correctamente
    try {
      const { error: insertError } = await supabase
        .from("tb_paquetes")
        .upsert([
          {
            tracking_id: trackingId,
            estado: result.data.current_status || "EN PROCESO",
            fecha_actualizacion: new Date().toISOString(),
          },
        ])
        .select();

      if (insertError) {

      } else {

      }
    } catch (err) {

    }

    setTrackingData(result.data);
    setError(null);
    setAllowOpen(true);
    setShowModal(true);
  };


  // ✅ Confirmar agregar paquete a cuenta
  const handleConfirmAdd = async () => {
    try {
      if (!trackingData?.tracking_id) {
        setPopup({ show: true, message: "No hay un número de rastreo válido.", type: "error" });
        return;
      }

      const { data: cliente } = await supabase
        .from("tb_cliente")
        .select("id_cliente, nombre, apellido, email")
        .eq("email", user.email)
        .maybeSingle();

      if (!cliente) {
        setPopup({ show: true, message: "No se encontró tu cuenta de cliente.", type: "error" });
        return;
      }

      const { data: paqueteExistente } = await supabase
        .from("tb_paquetes")
        .select("id_paquetes, id_cliente, tracking_id")
        .eq("tracking_id", String(trackingData.tracking_id).trim())
        .maybeSingle();

      if (!paqueteExistente) {
        setPopup({ show: true, message: "Este paquete no existe en la base de datos.", type: "error" });
        return;
      }

      if (paqueteExistente.id_cliente) {
        setPopup({ show: true, message: "Este paquete ya fue reclamado por otro cliente.", type: "error" });
        return;
      }
      console.log("🔍 Datos enviados a Supabase:", {
        id_cliente: cliente.id_cliente,
        correo_vinculado: cliente.email,
        nombre_en_etiqueta: `${cliente.nombre} ${cliente.apellido}`,
        estado: mapEstado(trackingData?.current_status),
        tracking_id: String(trackingData.tracking_id).trim(),
      });

      const { data, error } = await supabase
        .from("tb_paquetes")
        .update({
          id_cliente: cliente.id_cliente,
          correo_vinculado: cliente.email,
          nombre_en_etiqueta: `${cliente.nombre} ${cliente.apellido}`,
          estado: mapEstado(trackingData?.current_status), // ✅ traducido
        })
        .eq("tracking_id", String(trackingData.tracking_id).trim())
        .select();
      // 🧾 Registrar movimiento o pago asociado al paquete
      const { error: insertLogError } = await supabase
        .from("tb_pago_factura") // 👈 cámbialo si tu tabla tiene otro nombre
        .insert([
          {
            id_cliente: cliente.id_cliente,
            tracking_id: String(trackingData.tracking_id).trim(),
            monto: 0, // si aplica un pago inicial, cámbialo
            descripcion: `Paquete vinculado: ${mapEstado(trackingData?.current_status)}`,
            fecha_registro: new Date().toISOString(),
            id_metodo_pago:"a9600036-34e9-4ab0-883a-fad419195875",
          },
        ]);

      if (insertLogError) {
        console.error("⚠️ Error registrando movimiento:", insertLogError.message);
      }


      if (error || data.length === 0) {
        setPopup({ show: true, message: "No se actualizó el paquete. Verifica los datos.", type: "error" });
      } else {
        setPopup({ show: true, message: "Paquete vinculado correctamente a tu cuenta.", type: "success" });
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error al vincular paquete:", err.message);
      setPopup({ show: true, message: "Ocurrió un error al vincular el paquete. Intenta nuevamente.", type: "error" });
    }
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setClosing(false);
    }, 400);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#01060c] text-[#040c13] dark:text-whitetransition-colors duration-300">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 ml-0 md:ml-20 pb-20 md:pb-0 p-6 flex flex-col items-center">
        {/* 🔹 Encabezado con botón de tema */}
        <div className="w-full flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#040c13] dark:text-white">
            Mis Paquetes
          </h1>

        </div>

        {/* 🔍 Barra de búsqueda */}
        <TrackingSearch onSearch={handleSearch} isLoading={isLoading} />

        {/* 📦 Resultado */}
        <div className="w-full max-w-3xl mt-6 space-y-4">
          {allowOpen && trackingData && (
            <div className="flex justify-end mt-3">

              <button
                onClick={() => setShowModal(true)}
                className="w-10 flex items-center justify-center bg-[#b71f4b] hover:bg-[#a01744] dark:bg-[#f2af1e] dark:hover:bg-[#e6c565] text-white  h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 text-[12px]"
                title="Agregar paquete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          )}

          <TrackingResult data={trackingData} error={error} />
        </div>
      </main>

      {/* Bottom Nav */}
      <BottomNav />

      {/* Modal agregar paquete */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-end md:items-center px-4">
          <div
            className="bg-white dark:bg-[#040c13] text-gray-900 dark:text-gray-100 w-full max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl transform transition-all duration-300"
            style={{ animation: `${closing ? "slideDown" : "slideUp"} 0.4s ease-out` }}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-[#040c13] dark:text-white">
                Agregar Paquete
              </h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                ¿Quieres agregar este paquete a tu cuenta?
              </p>

              <div className="bg-white dark:bg-[#040c13] rounded-xl p-4 border border-gray-300 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-5 h-5 text-orange-500 dark:text-pink-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                    Detalles del Paquete
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>ID:</strong> {trackingData?.tracking_number || trackingData?.tracking_id || "—"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Estado:</strong>{" "}
                  {(() => {
                    const status = trackingData?.current_status?.toLowerCase() || "";
                    if (status.includes("transit") || status.includes("tránsito")) return "En tránsito a Panamá";
                    if (status.includes("received")) return "Bodega Miami";
                    if (status.includes("invoiced")) return "Facturado";
                    return trackingData?.current_status || "Pendiente";
                  })()}
                </p>
              </div>

              <div className="bg-white dark:bg-[#040c13] rounded-xl p-4 border border-gray-300 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-orange-500 dark:text-pink-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                    Información de tu Cuenta
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Nombre:</strong> {userName || "—"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Plan:</strong> {clienteInfo.plan}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Sucursal:</strong> {clienteInfo.sucursal}
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConfirmAdd}
                className="flex-1 bg-linear-to-r from-orange-500 to-pink-500 rounded-2xl p-4 text-white font-semibold  flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Agregar a mi cuenta</span>
              </button>
              <button
                onClick={handleClose}
                className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <Popup
        show={popup.show}
        onClose={() => setPopup({ ...popup, show: false })}
        message={popup.message}
        type={popup.type}
      />
    </div>
  );
}

/* 🔹 Animaciones */
const style = document.createElement("style");
style.innerHTML = `
@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes slideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
`;
document.head.appendChild(style);
