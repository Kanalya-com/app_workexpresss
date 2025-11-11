import { supabase } from "../lib/supabaseClient";

const API_KEY = import.meta.env.VITE_API_KEY;
const ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export async function consultarTracking(trackingId) {
  try {
    // 1️⃣ Consultar el paquete en la base local
    const { data: paqueteDB, error: dbError } = await supabase
      .from("tb_paquetes")
      .select("estado")
      .eq("tracking_id", trackingId)
      .maybeSingle();

    if (dbError) {
      console.warn("⚠️ No se encontró en la base local:", dbError.message);
    }

    // 2️⃣ Consultar la API remota
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_access_key: API_KEY,
        tracking_id: trackingId,
      }),
    });

    const data = await response.json();

    // 🟥 Si la API devuelve error o código inválido → no guardar nada
    if (
      !response.ok ||
      data.error === true ||
      data.code >= 400 ||
      data.code === 404 ||
      data.message?.toLowerCase().includes("not found")
    ) {
      console.warn("❌ API devolvió error, no se guardará el tracking");
      return { error: true, message: data.message || "Error en la solicitud." };
    }

    // 3️⃣ Si la respuesta es válida → procesar normalmente
    if (data.code === 200 && data.data) {
      const paquete = data.data;

      // Estado desde la base local (prioridad sobre la API)
      if (paqueteDB?.estado === "facturado") {
        paquete.current_status = "FACTURADO";
      } else if (paqueteDB?.estado === "en_facturacion") {
        paquete.current_status = "EN FACTURACIÓN";
      } else if (
        paquete.current_status === "RECEIVED" &&
        paquete.list_status_history?.length
      ) {
        const fechaRecibido = new Date(paquete.list_status_history[0].date);
        const ahora = new Date();
        const horasPasadas = (ahora - fechaRecibido) / (1000 * 60);

        if (horasPasadas >= 48) {
          paquete.current_status = "TRANSIT";
        }
      }

      // 4️⃣ Guardar en Supabase solo si la API respondió bien
      const { error: insertError } = await supabase
        .from("tb_paquetes")
        .upsert([
          {
            tracking_id: trackingId,
            estado: paquete.current_status,
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (insertError) {
        console.error("⚠️ No se pudo guardar el tracking:", insertError.message);
      } else {
        console.log("✅ Tracking guardado correctamente:", trackingId);
      }

      return { error: false, data: paquete };
    }

    // 🟨 Si no hay datos válidos
    return { error: true, message: "Respuesta inesperada del servidor." };
  } catch (error) {
    console.error("❌ Error consultando tracking:", error);
    return { error: true, message: "Error de conexión con el servidor." };
  }
}
