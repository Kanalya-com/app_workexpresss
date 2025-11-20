import { useState } from "react";
import { Star, Loader2, Package, MapPin, Edit, Save, XCircle } from "lucide-react";
import { usePerfilStore } from "../store/perfilStore";

export default function Planes({ clienteId, onPopup }) {

  const {
    planActual,
    sucursalActual,
    sucursales,
    planesSucursal,
    lastUpdate,
    loadingPlan,
    savingPlan,
    guardarPlan,
  } = usePerfilStore();

  const [editMode, setEditMode] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(
    sucursalActual?.id_sucursal || ""
  );
  const [selectedPlan, setSelectedPlan] = useState(planActual?.id_plan || "");

  /* ---------------------------------------------------
     🚧 FUNCIÓN PARA INTENTAR EDITAR EL PLAN
  ----------------------------------------------------*/
  const tryEdit = () => {
    const now = new Date();

    // Si NO existe fecha → bloquear
    if (!lastUpdate) {
      onPopup({
        show: true,
        success: false,
        message: "No puedes editar aún. No existe fecha de última actualización.",
      });
      return;
    }

    // Diferencia en días
    const diffDays = (now - new Date(lastUpdate)) / (1000 * 60 * 60 * 24);

    if (diffDays < 120) { // 4 meses ≈ 120 días
      onPopup({
        show: true,
        success: false,
        message: `Debes esperar 4 meses. Han pasado ${Math.floor(diffDays)} días.`,
      });
      return;
    }

    // ✔ Si pasó la validación
    setEditMode(true);
  };


  /* ---------------------------------------------------
     💾 GUARDAR CAMBIOS
  ----------------------------------------------------*/
  const handleSave = async () => {
    const res = await guardarPlan(clienteId, selectedSucursal, selectedPlan);

    onPopup({
      show: true,
      success: res.success,
      message: res.success ? "Cambios guardados correctamente" : "Error al guardar cambios",
    });

    if (res.success) setEditMode(false);
  };


  /* ---------------------------------------------------
     🌀 LOADING
  ----------------------------------------------------*/
  if (loadingPlan) {
    return (
      <div className="p-5 bg-white dark:bg-[#040c13] rounded-xl shadow text-center">
        <p className="text-gray-500">Cargando plan...</p>
      </div>
    );
  }

  if (!planActual) {
    return (
      <div className="bg-white dark:bg-[#040c13] rounded-2xl p-5 shadow-sm text-center text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
        <Package className="mx-auto w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
        <p>No tienes un plan asignado actualmente.</p>
      </div>
    );
  }

  /* ---------------------------------------------------
     UI PRINCIPAL
  ----------------------------------------------------*/
  return (
    <div
      className={`relative rounded-2xl p-5 shadow-md overflow-hidden border transition-all 
      ${editMode ? "border-orange-500 dark:border-pink-500" : "border-gray-100 dark:border-gray-800"}
      bg-white dark:bg-[#040c13]`}
    >

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold text-base ${editMode ? "text-orange-500 dark:text-pink-500" : "text-gray-700 dark:text-gray-200"}`}>
          Plan y Sucursal
        </h3>

        {!editMode ? (
          <button
            onClick={tryEdit}
            className="bg-orange-500/30 dark:bg-pink-500/30 rounded-full p-2"
          >
            <Edit size={16} className="text-orange-500 dark:text-pink-500" />
          </button>
        ) : (
          <button onClick={() => setEditMode(false)} className="bg-orange-500/30 dark:bg-pink-500/30 rounded-full p-2">
            <XCircle size={16} className="text-orange-500 dark:text-pink-500" />
          </button>
        )}
      </div>

      {/* Sucursal */}
      <div className="mb-3">
        {editMode ? (
          <div className="flex items-center gap-2 text-sm mb-1">
            <MapPin className="w-4 h-4 text-orange-500 dark:text-pink-500" />
            <select
              value={selectedSucursal}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              className="flex-1 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-gray-200 rounded-lg p-2 text-sm"
            >
              <option value="">Selecciona una sucursal</option>
              {sucursales.map((s) => (
                <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
            <MapPin className="w-4 h-4 mr-1 text-orange-500 dark:text-pink-500" />
            <span className="font-medium">Sucursal:</span>
            <span className="ml-1">{sucursalActual?.nombre || "No disponible"}</span>
          </div>
        )}
      </div>

      {/* Plan */}
      {!editMode ? (
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-orange-500 dark:text-pink-500">
              {planActual.descripcion}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {planActual.beneficios}
            </p>
            <p className="text-3xl font-extrabold mt-3 tracking-tight text-orange-500 dark:text-pink-500">
              ${planActual.precio.toFixed(2)}
              <span className="text-base text-gray-500 dark:text-gray-400 font-medium ml-1">
                / Libra
              </span>
            </p>
          </div>

          <div className="bg-orange-500/30 dark:bg-pink-500/30 text-orange-500 dark:text-pink-500 p-3 rounded-full">
            <Star className="w-5 h-5" />
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {planesSucursal.map((p) => (
              <div
                key={p.id_plan}
                onClick={() => setSelectedPlan(p.id_plan)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedPlan === p.id_plan
                    ? "border-orange-500 dark:border-pink-500 bg-orange-500/30 dark:bg-pink-500/30"
                    : "border-gray-300 dark:border-gray-700 hover:border-orange-500/30 dark:hover:border-pink-500/30"
                  }`}
              >
                <h4 className="font-semibold text-[#b71f4b] dark:text-[#f2af1e]">{p.descripcion}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{p.beneficios}</p>
                <p className="text-orange-500 dark:text-pink-500 font-bold mt-1">
                  ${p.precio.toFixed(2)}{" "}
                  <span className="text-xs text-gray-500 dark:text-gray-400">/ Libra</span>
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              disabled={savingPlan}
              className="flex items-center gap-2 bg-orange-500 dark:bg-pink-500 text-white px-5 py-2 rounded-lg font-medium"
            >
              {savingPlan ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
              {savingPlan ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
