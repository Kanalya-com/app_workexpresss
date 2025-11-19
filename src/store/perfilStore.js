// src/store/perfilStore.js
import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

export const usePerfilStore = create((set, get) => ({
  /* ------------------------------------------
   * DATOS DEL PERFIL
   * ------------------------------------------ */
  cliente: null,
  loadingPerfil: true,
  savingPerfil: false,
  loadedOnce: false,

  /* ------------------------------------------
   * DATOS DEL PLAN Y SUCURSALES
   * ------------------------------------------ */
  planActual: null,
  sucursalActual: null,
  sucursales: [],
  planesSucursal: [],
  lastUpdate: null,
  loadingPlan: true,
  savingPlan: false,

  /* ------------------------------------------
   * DATOS DEL SEGURO
   * ------------------------------------------ */
  seguroActivo: true,
  ultimaDesactivacion: null,
  loadingSeguro: false,

  /* ==========================================
   *           CARGAR PERFIL COMPLETO
   * ========================================== */
  cargarPerfil: async () => {
    if (get().loadedOnce) {
      set({ loadingPerfil: false });
      return;
    }

    set({ loadingPerfil: true });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return set({ loadingPerfil: false });

      const { data, error } = await supabase
        .from("tb_cliente")
        .select("*")
        .eq("email", user.email)
        .single();

      if (error) throw error;

      set({
        cliente: data,
        seguroActivo: data.seguro ?? true,
        ultimaDesactivacion: data.fecha_desactivacion,
        loadedOnce: true,
      });

      // Luego carga plan + sucursal
      await get().cargarPlanSucursal(data.id_sucursal, data.id_plan);
    } catch (error) {
      console.error("Perfil error:", error);
    } finally {
      set({ loadingPerfil: false });
    }
  },

  /* ==========================================
   *        CARGAR PLAN + SUCURSAL
   * ========================================== */
  cargarPlanSucursal: async (id_sucursal, id_plan) => {
    if (!id_sucursal || !id_plan) {
      set({ loadingPlan: false });
      return;
    }

    set({ loadingPlan: true });

    try {
      const [planRes, sucursalesRes, planesSucursalRes] = await Promise.all([
        supabase
          .from("tb_plan")
          .select("id_plan, descripcion, precio, beneficios, id_sucursal(id_sucursal,nombre)")
          .eq("id_plan", id_plan)
          .single(),

        supabase
          .from("tb_sucursal")
          .select("id_sucursal, nombre"),

        supabase
          .from("tb_plan")
          .select("id_plan, descripcion, precio, beneficios")
          .eq("id_sucursal", id_sucursal),
      ]);

      set({
        planActual: planRes.data,
        sucursalActual: planRes.data?.id_sucursal || null,
        sucursales: sucursalesRes.data || [],
        planesSucursal: planesSucursalRes.data || [],
        lastUpdate: planRes.data?.updated_at ? new Date(planRes.data.updated_at) : null,
      });
    } catch (err) {
      console.error("Error cargar plan:", err);
    } finally {
      set({ loadingPlan: false });
    }
  },

  /* ==========================================
   *        GUARDAR CAMBIOS DE PLAN
   * ========================================== */
  guardarPlan: async (id_cliente, sucursalNueva, planNuevo) => {
    set({ savingPlan: true });

    try {
      const { error } = await supabase
        .from("tb_cliente")
        .update({
          id_sucursal: sucursalNueva,
          id_plan: planNuevo,
        })
        .eq("id_cliente", id_cliente);

      if (error) throw error;

      // recargar datos
      await get().cargarPlanSucursal(sucursalNueva, planNuevo);

      return { success: true };
    } catch (err) {
      console.error("Error guardar plan:", err);
      return { success: false, error: err };
    } finally {
      set({ savingPlan: false });
    }
  },

  /* ==========================================
   *     ACTIVAR / DESACTIVAR SEGURO
   * ========================================== */
  toggleSeguro: async (clienteId) => {
    const activoActual = get().seguroActivo;
    const nuevoEstado = !activoActual;
    const now = new Date();

    // Validar 90 días
    if (!nuevoEstado) {
      localStorage.setItem("ultimaDesactivacionSeguro", now.toISOString());
    }

    const ultimaLocal = localStorage.getItem("ultimaDesactivacionSeguro");
    if (!activoActual && ultimaLocal) {
      const diff = (now - new Date(ultimaLocal)) / (1000 * 60 * 60 * 24);
      if (diff < 90) {
        return { success: false, message: "No puedes reactivar el seguro antes de 90 días." };
      }
    }

    set({ loadingSeguro: true });

    try {
      const { error } = await supabase
        .from("tb_cliente")
        .update({ seguro: nuevoEstado })
        .eq("id_cliente", clienteId);

      if (error) throw error;

      set({
        seguroActivo: nuevoEstado,
        ultimaDesactivacion: nuevaDesactivacion,
      });

      return {
        success: true,
        message: nuevoEstado
          ? "Seguro activado correctamente."
          : "Seguro desactivado. No podrás reactivarlo durante 90 días.",
      };
    } catch (err) {
      console.error("Error toggle seguro:", err);
      return { success: false, message: "Error al actualizar el seguro." };
    } finally {
      set({ loadingSeguro: false });
    }
  },

  /* ==========================================
   *        LIMPIAR TODO AL CERRAR SESIÓN
   * ========================================== */
  limpiarPerfil: () => {
    set({
      cliente: null,
      loadingPerfil: true,
      savingPerfil: false,
      loadedOnce: false,

      planActual: null,
      sucursalActual: null,
      sucursales: [],
      planesSucursal: [],
      lastUpdate: null,
      loadingPlan: true,
      savingPlan: false,

      seguroActivo: true,
      ultimaDesactivacion: null,
      loadingSeguro: false,
    });
  },
}));
