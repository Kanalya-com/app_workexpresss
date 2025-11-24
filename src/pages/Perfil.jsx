import { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import BottomNav from "../component/BottomNav";
import { supabase } from "../lib/supabaseClient";
import Loading from "../component/Loading";
import Planes from "../component/Planes";
import Popup from "../component/Popup";
import SeguroPaqueteria from "../component/SeguroPaqueteria";
import { useNavigate } from "react-router-dom";
import { usePerfilStore } from "../store/perfilStore";

import {
  User,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Edit,
  Check,
  ChevronLeft,
  Clock,
  Star,
  Package,
  Lock,
  Gift,
  Bell,
  FileText,
  Home,
  Shield,
  Import,
  CheckCircle,   // ✅ agregar este
  XCircle,
  Key, LogOut      // ✅ y este
} from "lucide-react";


export default function Perfil() {
  const [tab, setTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);

  // 🔹 Obtener datos del usuario logueado
  const { 
  cliente, 
  loadingPerfil, 
  cargarPerfil, 
  guardarPerfil, 
  savingPerfil 
} = usePerfilStore();

useEffect(() => {
  cargarPerfil();
}, []);


  // 🔹 Guardar cambios
  const handleSave = async () => {
  const result = await guardarPerfil(cliente);

  if (result.success) {
    setEditMode(false);
  } else {
    console.error(result.error);
  }
};


  if (loadingPerfil) return <Loading />;


  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#01060c] transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-20 pb-20 md:pb-0 bg-gray-50 dark:bg-[#01060c]">
        {/* Header */}
        <div className="bg-white dark:bg-[#01060c] text-gray-900 dark:text-gray-100 p-6 flex items-center justify-start shadow-md dark:shadow-none">
          <h1 className="text-2xl font-semibold tracking-wide">Mi Perfil</h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-around bg-white dark:bg-[#01060c] border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
          {[
            { key: "personal", label: "Personal", icon: <IdCard size={16} /> },
            { key: "seguridad", label: "Seguridad", icon: <Shield size={16} /> },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${tab === item.key
                ? "text-orange-500 border-orange-500 dark:text-pink-500 dark:border-pink-500"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-[#f2af1e]/80"
                }`}
            >
              <span
                className={`transition-transform ${tab === item.key
                  ? "scale-110 dark:text-pink-500"
                  : "text-gray-400 dark:text-gray-500"
                  }`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="p-4 md:p-8 w-full bg-gray-50 dark:bg-[#01060c] transition-colors duration-300">
          {tab === "personal" && (
           <Personal
              cliente={cliente}
              editMode={editMode}
              setEditMode={setEditMode}
              saving={savingPerfil}
              handleSave={handleSave}
              setCliente={(v) =>
                usePerfilStore.setState({ cliente: { ...cliente, ...v } })
              }
            />
          )}
          {tab === "seguridad" && <Seguridad />}
        </div>
      </main>

      <BottomNav />
    </div>
  );


}

/* -------------------------------------------------------------------------- */
/*                               SECCIÓN: PERSONAL                            */
/* -------------------------------------------------------------------------- */
function Personal({ cliente, editMode, setEditMode, saving, handleSave, setCliente }) {
  const [popup, setPopup] = useState({ show: false, success: false, message: "" });

  // 🔹 Envolvemos handleSave para mostrar el popup automáticamente
const handleSaveWithPopup = async () => {
  try {
    await handleSave();

    setPopup({
      show: true,
      success: true,
      message: "Los cambios se han guardado correctamente."
    });

  } catch (error) {
    console.error(error);

    setPopup({
      show: true,
      success: false,
      message: "Ocurrió un error al guardar los cambios."
    });
  }
};




  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-8 md:gap-12 px-2 md:px-6">
      {/* 🔹 Plan actual */}
      <div className="w-full flex flex-col lg:flex-row md:items-start md:justify-between gap-4 md:gap-6">
        <div className="w-full md:w-1/2">
          <Planes
            id_plan={cliente.id_plan}
            clienteId={cliente.id_cliente}
            onPopup={setPopup}
          />
        </div>

        <div className="w-full md:w-1/2">
          <SeguroPaqueteria
            clienteId={cliente.id_cliente}
            onPopup={setPopup}
          />
        </div>
      </div>



      {/* 🔹 Información personal */}
      <div className="w-full max-w-md mx-auto bg-white dark:bg-[#040c13] rounded-2xl p-5 md:p-6 shadow-md space-y-4 border border-gray-100 dark:border-gray-800">

        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Información Personal
        </h3>


        <Info
          label="Nombre completo"
          value={`${cliente.nombre} ${cliente.apellido}`}
          icon={<User />}
        />
        {/* <EditableInfo
          label="Correo"
          value={cliente.email || ""}
          onChange={(v) => setCliente({ ...cliente, email: v })}
          icon={<Mail />}
          editable={editMode}
           
        /> */}

        <EditableInfo
          label="Cédula"
          value={cliente.cedula || ""}
          onChange={(v) => setCliente({ ...cliente, cedula: v })}
          icon={<IdCard />}
          editable={editMode}
        />
        <EditableInfo
          label="Teléfono"
          value={cliente.telefono || ""}
          onChange={(v) => setCliente({ ...cliente, telefono: v })}
          icon={<Phone />}
          editable={editMode}
        />

        <EditableInfo
          label="Dirección"
          value={cliente.direccion || ""}
          onChange={(v) => setCliente({ ...cliente, direccion: v })}
          icon={<MapPin />}
          editable={editMode}
        />


        <div className="flex justify-end pt-4">
          {editMode ? (
            <button
              onClick={handleSaveWithPopup}
              disabled={saving}
              className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-7 py-3 rounded-xl font-semibold transition-all text-sm md:text-base"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-pink-500 rounded-full p-5 text-white font-semibold transition-all"
            >
              <Edit size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Popup de éxito o error */}
      <Popup
        show={popup.show}
        onClose={() => setPopup({ ...popup, show: false })}
        message={popup.message}
        type={popup.success ? "success" : "error"}
      />

    </div>
  );


}
/* -------------------------------------------------------------------------- */
/*                               SECCIÓN: SEGURIDAD                           */
/* -------------------------------------------------------------------------- */


function Seguridad() {
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  // 🔹 Cambiar contraseña (para usuario autenticado)
  const handleChangePassword = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      setPopup({
        show: true,
        message: "No se pudo obtener tu correo. Inicia sesión nuevamente.",
        type: "error",
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: "https://app.workexpress.online/reset-password",
    });

    if (error) {
      setPopup({
        show: true,
        message: "Error al enviar el correo: " + error.message,
        type: "error",
      });
    } else {
      setPopup({
        show: true,
        message: "Se envió un correo para cambiar tu contraseña.",
        type: "success",
      });
      setEmailSent(true);
    }
  };

  // 🔹 Cerrar sesión
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setPopup({
        show: true,
        message: "Error al cerrar sesión: " + error.message,
        type: "error",
      });
    } else {
      setPopup({
        show: true,
        message: "✅ Sesión cerrada correctamente.",
        type: "success",
      });
      setTimeout(() => navigate("/"), 2000);
    }
  };

  // 🔹 Auto-cierre del popup después de 2.5s
  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => setPopup((prev) => ({ ...prev, show: false })), 2500);
      return () => clearTimeout(timer);
    }
  }, [popup.show]);

  return (
    <div className="bg-white dark:bg-[#040c13] rounded-2xl p-6 shadow-sm space-y-5 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        <Lock className="w-5 h-5 text-orange-500 dark:text-pink-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Seguridad y Privacidad
        </h3>
      </div>

      {/* 🔒 Cambiar contraseña */}
      <div
        onClick={handleChangePassword}
        className="flex items-center justify-between bg-gray-50 dark:bg-[#040c13] border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-4 rounded-xl cursor-pointer transition"
      >
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 dark:bg-pink-500/10 p-2 rounded-full">
            <Lock className="w-5 h-5 text-orange-500 dark:text-pink-500" />
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-100">
              Cambiar Contraseña
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Actualiza tu contraseña de acceso
            </p>
          </div>
        </div>
        <span className="text-gray-400 dark:text-gray-500 text-sm">›</span>
      </div>

      {/* 🔚 Botón de cerrar sesión */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>

      {/* 🔔 Popup general */}
      <Popup
        show={popup.show}
        onClose={() => setPopup((prev) => ({ ...prev, show: false }))}
        message={popup.message}
        type={popup.type}
        duration={2500}
      />
    </div>
  );
}






// ✅ Info.jsx
export function Info({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#040c13] rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
      <div className="text-orange-500 dark:text-pink-500">{icon}</div>
      <div className="flex flex-col text-gray-700 dark:text-gray-200">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm">{value || "—"}</span>
      </div>
    </div>
  );
}

export function EditableInfo({ label, value, onChange, icon, editable }) {
  return (
    <div
      className={`flex  sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${editable
        ? "border-2 border-orange-500/30 dark:border-pink-500/30 bg-white dark:bg-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-orange-500/30 dark:focus-within:ring-pink-500/30"
        : "border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        }`}
    >

      <div className="text-orange-500 dark:text-pink-500">{icon}</div>
      <div className="flex flex-col text-gray-700 dark:text-gray-200 w-full">
        <span
          className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${editable
            ? "text-orange-500 dark:text-pink-500"
            : "text-gray-500 dark:text-gray-400"
            }`}
        >
          {label}
        </span>

        {editable ? (
          <input
            type="text"
            value={value}

            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent outline-none text-sm w-full text-gray-900 dark:text-gray-100"
          />
        ) : (
          <span className="text-sm">{value || "—"}</span>
        )}
      </div>
    </div>
  );
}


