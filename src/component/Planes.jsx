import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Star, Loader2, Package, MapPin, Edit, Save, XCircle } from "lucide-react";
import Loading from "./Loading";
export default function Planes({ id_plan, clienteId, onPopup }) {
  const [plan, setPlan] = useState(null);
  const [sucursal, setSucursal] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [planesSucursal, setPlanesSucursal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 🔹 Obtener plan y sucursal
useEffect(() => {
  const fetchAllData = async () => {
    try {
      if (!id_plan || !clienteId) return;

      // 🚀 Ejecutar plan, cliente y sucursales en paralelo
      const [planRes, clienteRes, sucursalesRes] = await Promise.all([
        supabase
          .from("tb_plan")
          .select("id_plan, descripcion, precio, beneficios")
          .eq("id_plan", id_plan)
          .single(),

        supabase
          .from("tb_cliente")
          .select("id_cliente, id_sucursal(id_sucursal,nombre,direccion), updated_at")
          .eq("id_cliente", clienteId)
          .single(),

        supabase
          .from("tb_sucursal")
          .select("id_sucursal, nombre"),
      ]);

      const planData = planRes.data;
      const clienteData = clienteRes.data;
      const sucursalesData = sucursalesRes.data;

      // 🟡 Plan actual
      if (planData) {
        setPlan(planData);
        setSelectedPlan(planData.id_plan);
      }

      // 🟢 Sucursal actual del cliente
      if (clienteData?.id_sucursal) {
        setSucursal(clienteData.id_sucursal);
        setSelectedSucursal(clienteData.id_sucursal.id_sucursal);
      }

      // 🕒 Última actualización
      if (clienteData?.updated_at) setLastUpdate(new Date(clienteData.updated_at));

      // 🧭 Listado de sucursales
      if (sucursalesData) setSucursales(sucursalesData);

      // 🔹 Si ya hay sucursal seleccionada, traer sus planes
      if (clienteData?.id_sucursal?.id_sucursal) {
        const { data: planesData } = await supabase
          .from("tb_plan")
          .select("id_plan, descripcion, precio, beneficios")
          .eq("id_sucursal", clienteData.id_sucursal.id_sucursal);

        setPlanesSucursal(planesData || []);
      }
    } catch (err) {
      console.error("❌ Error al obtener datos:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAllData();
}, [id_plan, clienteId]);


  // 🔹 Guardar cambios
  const handleSave = async () => {
    if (!clienteId || !selectedSucursal || !selectedPlan) {
      onPopup({
        show: true,
        success: false,
        message: "Faltan datos para guardar los cambios.",
      });
      return;
    }

    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    if (lastUpdate && lastUpdate > fourMonthsAgo) {
      onPopup({
        show: true,
        success: false,
        message: "Solo puedes cambiar de plan cada 4 meses.",
      });
      return;
    }

    setSaving(true);
    try {
      await supabase
        .from("tb_cliente")
        .update({ id_sucursal: selectedSucursal, id_plan: selectedPlan })
        .eq("id_cliente", clienteId);

      const { data: nuevoPlan } = await supabase
        .from("tb_plan")
        .select("id_plan, descripcion, precio, beneficios, id_sucursal(id_sucursal,nombre,direccion)")
        .eq("id_plan", selectedPlan)
        .single();

      if (nuevoPlan) {
        setPlan(nuevoPlan);
        setSucursal(nuevoPlan.id_sucursal);
        setLastUpdate(new Date());
      }

      onPopup({
        show: true,
        success: true,
        message: "Los cambios se guardaron correctamente.",
      });
      setEditMode(false);
    } catch (err) {
      console.error(err);
      onPopup({
        show: true,
        success: false,
        message: "Error al guardar los cambios.",
      });
    } finally {
      setSaving(false);
    }
  };

// 🌀 Loading eliminado: simplemente no se muestra nada mientras carga
// if (loading) return <Loading />;


  // 🚫 Sin plan
  if (!plan)
    return (
      <div className="bg-white dark:bg-[#040c13] rounded-2xl p-5 shadow-sm text-center text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
        <Package className="mx-auto w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
        <p>No tienes un plan asignado actualmente.</p>
      </div>
    );

  // ✅ Vista principal
  return (
    <div
      className={`relative rounded-2xl p-5 shadow-md overflow-hidden border transition-all 
      ${editMode ? "border-orange-500 dark:border-pink-500" : "border-gray-100 dark:border-gray-800"}
      bg-white dark:bg-[#040c13]`}
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`font-semibold text-base ${
            editMode
              ? "text-orange-500 dark:text-pink-500"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          Plan y Sucursal
        </h3>

        {!editMode ? (
          <button
            onClick={() => {
              const fourMonthsAgo = new Date();
              fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
              if (lastUpdate && lastUpdate > fourMonthsAgo) {
                onPopup({
                  show: true,
                  success: false,
                  message:
                    "Aún no han pasado 4 meses desde tu último cambio de plan.",
                });
                return;
              }
              setEditMode(true);
            }}
            className="bg-orange-500/30 dark:bg-pink-500/30 hover:bg-pink-500/30 rounded-full p-2 transition-all"
            title="Editar plan"
          >
            <Edit
              size={16}
              className="text-orange-500 dark:text-pink-500"
            />
          </button>
        ) : (
          <button
            onClick={() => setEditMode(false)}
            className="bg-orange-500/30 dark:bg-pink-500/30 hover:bg-orange-500/30 dark:hover:bg-pink-500/30rounded-full p-2 transition-all"
            title="Cancelar edición"
          >
            <XCircle
              size={16}
              className="text-orange-500 dark:text-pink-500"
            />
          </button>
        )}
      </div>

      {/* Sucursal */}
      <div className="mb-3">
        {editMode ? (
          <div className="flex items-center gap-2 text-sm mb-1">
            <MapPin className="w-4 h-4 text-orange-500 dark:text-pink-500" />
            <select
              value={selectedSucursal || ""}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              className="flex-1 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#b71f4b]/30 dark:focus:ring-[#f2af1e]/40"
            >
              <option value="" className="text-gray-700 dark:text-gray-400">
                Selecciona una sucursal
              </option>
              {sucursales.map((s) => (
                <option key={s.id_sucursal} value={s.id_sucursal} className="text-gray-800 dark:text-gray-900">
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
            <MapPin className="w-4 h-4 mr-1 text-orange-500 dark:text-pink-500" />
            <span className="font-medium">Sucursal:</span>
            <span className="ml-1">{sucursal?.nombre || "No disponible"}</span>
          </div>
        )}
      </div>

      {/* Plan */}
      {!editMode ? (
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-orange-500 dark:text-pink-500">
              {plan.descripcion}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {plan.beneficios}
            </p>
            <p className="text-3xl font-extrabold mt-3 tracking-tight text-orange-500 dark:text-pink-500">
              ${plan.precio.toFixed(2)}
              <span className="text-base text-gray-500 dark:text-gray-400 font-medium ml-1">
                / Libra
              </span>
            </p>
          </div>
          <div className=" bg-orange-500/30 dark:bg-pink-500/30 text-orange-500 dark:text-pink-500 p-3 rounded-full">
            <Star className="w-5 h-5" />
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {planesSucursal.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                No hay planes disponibles para esta sucursal.
              </p>
            ) : (
              planesSucursal.map((p) => (
                <div
                  key={p.id_plan}
                  onClick={() => setSelectedPlan(p.id_plan)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedPlan === p.id_plan
                      ? "border-orange-500 dark:border-pink-500 bg-orange-500/30 dark:bg-pink-500/30"
                      : "border-gray-300 dark:border-gray-700 hover:border-orange-500/30 dark:hover:border-pink-500/30"
                  }`}
                >
                  <h4 className="font-semibold text-[#b71f4b] dark:text-[#f2af1e]">
                    {p.descripcion}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {p.beneficios}
                  </p>
                  <p className="text-orange-500 dark:text-pink-500 font-bold mt-1">
                    ${p.precio.toFixed(2)}{" "}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      / Libra
                    </span>
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Guardar */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 dark:bg-pink-500 hover:bg-orange-500 dark:hover:bg-pink-500 text-white dark:text-gray-900 px-5 py-2 rounded-lg font-medium transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Guardar cambios
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
