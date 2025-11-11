import React, { useEffect, useState } from "react";
import { Plane, MapPin, ChevronRight, PackageSearch, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Paquetes() {
  const navigate = useNavigate();
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [correo, setCorreo] = useState("");

  useEffect(() => {
    const fetchPaquetes = async () => {
      try {
        // 🔹 Obtener usuario autenticado
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
          setLoading(false);
          return;
        }

        setCorreo(user.email);

        // 🔹 Buscar cliente por correo
        const { data: cliente } = await supabase
          .from("tb_cliente")
          .select("id_cliente")
          .eq("email", user.email)
          .maybeSingle();

        if (!cliente) {
          setLoading(false);
          return;
        }

        // 🔹 Buscar paquetes del cliente
        const { data: dataPaquetes, error } = await supabase
          .from("tb_paquetes")
          .select(
            "id_paquetes, tracking_id, nombre_en_etiqueta, estado, peso_real, largo, ancho, altura, created_at"
          )
          .eq("id_cliente", cliente.id_cliente)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPaquetes(dataPaquetes || []);
      } catch (err) {
        console.error("Error cargando paquetes:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaquetes();
  }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-10 text-gray-500 dark:text-gray-400">
//         Cargando tus paquetes...
//       </div>
//     );
//   }

  return (
    <div className="bg-linear-to-br from-[#d30046] via-orange-500 to-[#db2fb2] text-white rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-colors">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Plane size={24} />
        
        <h2 className="text-lg font-semibold text-gray-100 ">
          Tus Paquetes
        </h2>
        </div>
        <span className="text-sm sm:text-[16px] bg-white/20 text-white font-semibold px-3 py-1 rounded-full">
          {paquetes.length} paquete{paquetes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Contenedor */}
      {paquetes.length > 0 ? (
        <div
          className={`grid gap-4 ${
            paquetes.length === 1
              ? "grid-cols-1"
              : paquetes.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
          }`}
        >
          {paquetes.map((p) => (
            <div
              key={p.id_paquetes}
              className="bg-white/15 backdrop-blur-md  border border-white/20 rounded-2xl  p-4 hover:shadow-md transition-all"
            >
              {/* Tracking */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <Package className="text-white"/>
                </div>
                <div>
                  <p className="text-xs" >Número de paquete</p>
                  <p className="text-sm font-semibold  text-white truncate max-w-[140px]">
                    {p.tracking_id || "—"}
                  </p>
                  {/* <p className="text-xs text-gray-100">
                    {p.nombre_en_etiqueta || "Sin etiqueta"}
                  </p> */}
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-2 font-semibold mb-5">
                <MapPin className="w-4 h-4 text-gray-100" />
                <p className="bg-white/20 py-1 px-2 rounded-full text-sm text-gray-100 capitalize">
                  {p.estado || "En tránsito"}
                </p>
                <p className="text-xs text-gray-100">
                {p.created_at
                  ? new Date(p.created_at).toLocaleDateString()
                  : "—"}
              </p>
              </div>

              {/* Fecha */}
              

              {/* Botón */}
              <button
                onClick={() => navigate(`/paquete/${p.id_paquetes}`)}
                className="w-full border border-white/30 text-sm font-medium py-2 rounded-xl text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                Ver detalles
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <PackageSearch
            size={40}
            className="text-white mb-3"
          />
          <p className="text-sm text-white">
            Aún no tienes paquetes vinculados a tu cuenta.
          </p>
        </div>
      )}
    </div>
  );
}
