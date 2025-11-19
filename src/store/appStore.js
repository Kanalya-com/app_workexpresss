import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

export const useAppStore = create((set, get) => ({
  cliente: null,
  paquetes: [],
  loadedCliente: false,
  loadedPaquetes: false,

  cargarCliente: async (email) => {
    if (!email) return;

    // evita fetch repetido
    if (get().loadedCliente) return;

    const { data, error } = await supabase
      .from("tb_cliente")
      .select(`
        id_cliente,
        nombre,
        apellido,
        id_sucursal(
          id_sucursal,
          nombre,
          direccion
        )
      `)
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.log("Error cargarCliente:", error);
      return;
    }

    set({
      cliente: data
        ? {
            id_cliente: data.id_cliente,
            nombre: data.nombre,
            apellido: data.apellido,
            sucursal: data.id_sucursal?.nombre || "",
          }
        : null,
      loadedCliente: true,
    });
  },

  cargarPaquetes: async (id_cliente) => {
    if (!id_cliente) return;

    // evita re-fetch
    if (get().loadedPaquetes) return;

    const { data, error } = await supabase
      .from("tb_paquetes")
      .select(
        "id_paquetes, tracking_id, nombre_en_etiqueta, estado, peso_real, largo, ancho, altura, created_at"
      )
      .eq("id_cliente", id_cliente)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Error cargarPaquetes:", error);
      return;
    }

    set({
      paquetes: data || [],
      loadedPaquetes: true,
    });
  },

  limpiarCache: () => {
    set({
      cliente: null,
      paquetes: [],
      loadedCliente: false,
      loadedPaquetes: false,
    });
  },
}));
