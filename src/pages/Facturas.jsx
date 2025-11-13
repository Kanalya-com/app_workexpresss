import { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import BottomNav from "../component/BottomNav";
import FacturaCard from "../component/FacturaCard";
import { CreditCard, CheckCircle2, ArrowLeft, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import FacturasResumen from "../component/FacturasResumen";
import DetalleFactura from "../component/DetalleFactura";
export default function Facturas({ cliente }) {
  const [tab, setTab] = useState("pendientes");
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(false);
  const [showBottom, setShowBottom] = useState(true);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [esPagoParcial, setEsPagoParcial] = useState(false);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [facturaDetalle, setFacturaDetalle] = useState(null);
  const [totalPendiente, setTotalPendiente] = useState(0);
  // 🔹 Mostrar / ocultar BottomNav según vista previa
  useEffect(() => {
    setShowBottom(!preview && !detalleVisible);
  }, [preview, detalleVisible]);
  useEffect(() => {
    const fetchPendientes = async () => {
      const { data, error } = await supabase
        .from("tb_factura")
        .select("total, estado");

      if (error) {
        console.error("Error cargando facturas:", error);
        return;
      }

      calcularTotalPendiente(data);
    };

    const calcularTotalPendiente = (rows) => {
      const suma = rows
        .filter((f) => f.estado === "pendiente")
        .reduce((acc, f) => acc + Number(f.total || 0), 0);

      setTotalPendiente(suma);
    };

    // 🔹 1. Cargar datos al inicio
    fetchPendientes();

    // 🔹 2. Suscribirse a cambios en tiempo real (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel("realtime_facturas")
      .on(
        "postgres_changes",
        {
          event: "*",          // escucha todo (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "tb_factura",
        },
        async (payload) => {
          console.log("Cambio detectado:", payload);

          // Recalcular siempre desde la BD para garantizar consistencia
          const { data } = await supabase
            .from("tb_factura")
            .select("total, estado");

          calcularTotalPendiente(data);
        }
      )
      .subscribe();

    // 🔹 Limpieza
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔹 Bloquear scroll cuando el modal esté abierto
  useEffect(() => {
    if (preview || detalleVisible) {
      document.body.style.overflow = "hidden"; // ❌ Bloquea el scroll
    } else {
      document.body.style.overflow = ""; // ✅ Lo restaura
    }

    // Limpieza por seguridad
    return () => {
      document.body.style.overflow = "";
    };
  }, [preview, detalleVisible]);
  // 🔹 Cargar facturas desde Supabase
  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tb_factura")
          .select("*")
          .eq("id_cliente", cliente?.id_cliente)
          .order("created_at", { ascending: false });
        console.log(data)
        if (error) throw error;

        setFacturas(data || []);
      } catch (error) {
        console.error("Error cargando facturas:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (cliente?.id_cliente) fetchFacturas();
  }, [cliente]);
  // 🧩 Escucha cambios en tiempo real en tb_factura
  useEffect(() => {
    if (!cliente?.id_cliente) return;

    // Canal Realtime
    const canal = supabase
      .channel("facturas-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // escucha INSERT, UPDATE y DELETE
          schema: "public",
          table: "tb_factura",
          filter: `id_cliente=eq.${cliente.id_cliente}`,
        },
        (payload) => {
          console.log("📡 Cambio detectado:", payload);

          setFacturas((prev) => {
            if (payload.eventType === "INSERT") {
              // Nueva factura
              return [payload.new, ...prev];
            } else if (payload.eventType === "UPDATE") {
              // Actualización
              return prev.map((f) =>
                f.id_factura === payload.new.id_factura ? payload.new : f
              );
            } else if (payload.eventType === "DELETE") {
              // Eliminación
              return prev.filter((f) => f.id_factura !== payload.old.id_factura);
            }
            return prev;
          });
        }
      )
      .subscribe();

    // 🔹 Limpieza
    return () => {
      supabase.removeChannel(canal);
    };
  }, [cliente]);

  // 🔹 Filtros por estado
  const pendientes = facturas.filter((f) => f.estado?.toUpperCase() === "PENDIENTE");
  const pagadas = facturas.filter((f) => f.estado?.toUpperCase() === "PAGADO");
  const parcial = facturas.filter((f) => f.estado?.toUpperCase() === "PARCIAL");

  // 🔹 Selección múltiple
  const toggleSelect = (codigo) => {
    setSelected((prev) =>
      prev.includes(codigo) ? prev.filter((id) => id !== codigo) : [...prev, codigo]
    );
  };

  const total = pendientes
    .filter((f) => selected.includes(f.numero))
    .reduce((sum, f) => sum + (f.total || 0), 0)
    .toFixed(2);

  const allSelected = pendientes.length > 0 && selected.length === pendientes.length;
  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : pendientes.map((f) => f.numero));
  };

  // 🔹 UI principal
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#01060c] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-20 pb-24 md:pb-0 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#01060c] dark:text-white">
          Mis Facturas
        </h1>
        <p className="text-sm md:text-base text-[#59656e] dark:text-[#ecf3f8] mt-1">
          Gestiona y paga tus facturas pendientes
        </p>
        <FacturasResumen
          cantidadPagadas={pagadas.length}
          cantidadPendiente={pendientes.length}
          total={facturas.length}
          totalPendiente={`$${totalPendiente.toFixed(2)}`}
        />

        {/* Tabs */}
        <div className="mt-4 flex bg-transparent p-1 mb-5 transition-colors duration-300 max-w-96 gap-2">
          <button
            onClick={() => setTab("pendientes")}
            className={`flex-1  p-2 rounded-sm text-xs sm:text-sm font-medium transition-colors duration-300 ${tab === "pendientes"
              ? "bg-[#d30046] text-white"
              : "text-[#01060c] dark:text-white cursor-pointer hover:bg-[#d30046]/50 border border-gray-200 dark:border-gray-700 "
              }`}
          >
            Pendientes ({pendientes.length})
          </button>

          <button
            onClick={() => setTab("parcial")}
            className={`flex-1 p-2 rounded-sm text-xs sm:text-sm font-medium transition-colors duration-300 ${tab === "parcial"
              ? "bg-[#d30046] text-white"
              : "text-[#01060c] dark:text-white cursor-pointer hover:bg-[#d30046]/50 border border-gray-200 dark:border-gray-700"
              }`}
          >
            Parcial ({parcial.length})
          </button>
          <button
            onClick={() => setTab("pagadas")}
            className={`flex-1 p-2 rounded-sm text-xs sm:text-sm font-medium transition-colors duration-300 ${tab === "pagadas"
              ? "bg-[#d30046] text-white"
              : "text-[#01060c] dark:text-white cursor-pointer hover:bg-[#d30046]/50 border border-gray-200 dark:border-gray-700 "
              }`}
          >
            Pagadas ({pagadas.length})
          </button>
        </div>

        {/* Listado de Facturas */}
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Cargando facturas...</p>
        ) : (
          <>
            {/* TAB Pendientes */}
            {tab === "pendientes" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendientes.map((f) => (
                    <FacturaCard
                      key={f.id_factura}
                      codigo={f.numero}
                      tracking={f.id_lote_facturacion?.substring(0, 8) || "—"}
                      monto={f.total?.toFixed(2)}
                      estado={f.estado}
                      fecha={f.created_at.slice(0, 10).split("-").reverse().join(" / ")}
                      onViewClick={() => {
                        setFacturaDetalle(f);
                        setDetalleVisible(true);

                      }}
                      onPayClick={(codigo) => {
                        setSelected([codigo]);
                        setEsPagoParcial(false);
                        setPreview(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TAB Pagadas */}
            {tab === "pagadas" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pagadas.map((f) => (
                  <FacturaCard
                    key={f.id_factura}
                    codigo={f.numero}
                    tracking={f.id_lote_facturacion?.substring(0, 8) || "—"}
                    monto={f.total?.toFixed(2)}
                    estado={f.estado}
                    fecha={new Date(f.created_at).toLocaleDateString("es-PA")}
                    onViewClick={() => {
                      setFacturaDetalle(f);
                      setDetalleVisible(true);
                    }}
                  />
                ))}
              </div>
            )}

            {/* TAB Parcial */}
            {tab === "parcial" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {parcial.map((f) => (
                  <FacturaCard
                    key={f.id_factura}
                    codigo={f.numero}
                    tracking={f.id_lote_facturacion?.substring(0, 8) || "—"}
                    monto={f.total?.toFixed(2)}
                    estado={f.estado}
                    fecha={new Date(f.created_at).toLocaleDateString("es-PA")}
                    onViewClick={() => {
                      setFacturaDetalle(f);
                      setDetalleVisible(true);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* 🔹 Modal de Detalle */}
        {detalleVisible && facturaDetalle && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center z-50 ">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-50">
              <div className="relative w-full max-w-lg max-h-[90vh] sm:max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent rounded-2xl">
                <DetalleFactura factura={facturaDetalle} onClose={() => setDetalleVisible(false)} />
              </div>
            </div>

          </div>
        )}

        {preview && (
          <>
            {esPagoParcial ? (
              // ✅ Modal de PAGO PARCIAL
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-end md:items-center z-50">
                <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full md:w-[440px] rounded-t-3xl md:rounded-3xl shadow-2xl p-6 relative animate-fadeIn">
                  <button
                    onClick={() => setPreview(false)}
                    className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <h3 className="text-lg font-bold text-center text-gray-800 dark:text-[#f2af1e] mb-2">
                    Pago Parcial de Facturas
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">
                    Ingresa los montos que deseas abonar a cada factura.
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-5 max-h-72 overflow-y-auto space-y-3">
                    {pendientes
                      .filter((f) => selected.includes(f.numero))
                      .map((f) => (
                        <div
                          key={f.numero}
                          className="rounded-xl bg-white/80 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                #{f.numero}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Total: ${f.total?.toFixed(2)}
                              </p>
                            </div>

                            <input
                              type="text"
                              inputMode="decimal"
                              value={f.montoParcial ?? ""}
                              onChange={(e) => {
                                let value = e.target.value.replace(",", ".");
                                if (value === "") {
                                  setFacturas((prev) =>
                                    prev.map((fact) =>
                                      fact.numero === f.numero
                                        ? { ...fact, montoParcial: "" }
                                        : fact
                                    )
                                  );
                                  return;
                                }
                                if (!/^[0-9]*\.?[0-9]*$/.test(value)) return;
                                const num = parseFloat(value);
                                if (isNaN(num) || num < 0) return;

                                setFacturas((prev) =>
                                  prev.map((fact) =>
                                    fact.numero === f.numero
                                      ? { ...fact, montoParcial: value }
                                      : fact
                                  )
                                );
                              }}
                              onBlur={(e) => {
                                const num = parseFloat(e.target.value);
                                if (!isNaN(num)) {
                                  const limitado = Math.min(Math.max(num, 0), f.total);
                                  setFacturas((prev) =>
                                    prev.map((fact) =>
                                      fact.numero === f.numero
                                        ? {
                                          ...fact,
                                          montoParcial: limitado.toFixed(2),
                                        }
                                        : fact
                                    )
                                  );
                                }
                              }}
                              className="w-28 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-right focus:border-[#b71f4b] dark:focus:border-[#f2af1e] focus:ring-0 shadow-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="flex justify-between items-center font-semibold text-gray-700 dark:text-gray-200 mb-6">
                    <span>Total a Pagar:</span>
                    <span className="text-[#b71f4b] dark:text-[#f2af1e] text-lg">
                      $
                      {pendientes
                        .filter((f) => selected.includes(f.numero))
                        .reduce(
                          (sum, f) => sum + (parseFloat(f.montoParcial) || 0),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={async () => {
                      const facturasParciales = pendientes.filter(
                        (f) =>
                          selected.includes(f.numero) &&
                          parseFloat(f.montoParcial) > 0
                      );

                      for (const f of facturasParciales) {
                        const monto = parseFloat(f.montoParcial);
                        const totalPagado = (f.total_pagado || 0) + monto;
                        const totalRestante = Math.max(f.total - totalPagado, 0);
                        const nuevoEstado =
                          totalRestante > 0 ? "parcial" : "pagado";

                        // ✅ Actualiza la factura
                        const { error: updateError } = await supabase
                          .from("tb_factura")
                          .update({
                            total_pagado: totalPagado.toFixed(2),
                            total_restante: totalRestante.toFixed(2),
                            estado: nuevoEstado,
                          })
                          .eq("id_factura", f.id_factura);

                        if (updateError) {
                          console.error(
                            `❌ Error actualizando ${f.numero}:`,
                            updateError.message
                          );
                          continue;
                        }

                        // ✅ Inserta el pago parcial
                        const { error: pagoError } = await supabase
                          .from("tb_pago_factura")
                          .insert([
                            {
                              id_factura: f.id_factura,
                              id_cliente: cliente.id_cliente,
                              monto: monto.toFixed(2),
                              id_metodo_pago:
                                "a9600036-34e9-4ab0-883a-fad419195875", // 💳 método fijo o dinámico
                              observacion: `Pago parcial de factura ${f.numero}`,
                              fecha_pago: new Date().toISOString(),
                            },
                          ]);

                        if (pagoError)
                          console.error(
                            `⚠️ Error insertando pago ${f.numero}:`,
                            pagoError.message
                          );
                        else
                          console.log(
                            `✅ Pago parcial registrado (${f.numero})`
                          );
                      }

                      setPreview(false);
                    }}
                    className="w-full bg-linear-to-r from-[#b71f4b] to-[#d12b60] dark:from-[#f2af1e] dark:to-[#e6c565] text-white dark:text-gray-900 py-3 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 mb-3 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Confirmar Pago Parcial
                  </button>

                  <button
                    onClick={() => setPreview(false)}
                    className="w-full py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ✅ Modal de PAGO TOTAL */}
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-end md:items-center z-50 ">
                  <div className=" bg-white dark:bg-[#040c13] w-full md:w-[400px] rounded-t-3xl md:rounded-3xl p-6 shadow-2xl relative">
                    <button
                      onClick={() => setPreview(false)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex gap-2 items-center mb-2">
                      <CreditCard className="w-6 h-6" />
                      <h3 className="text-2xl font-semibold text-center text-[#040c13] dark:text-white ">
                        Pagar factura
                      </h3>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 text-start mb-5">
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-start mb-5">
                        Factura:{" "}
                        {pendientes
                          .filter((f) => selected.includes(f.numero))
                          .map((f) => f.numero)
                          .join(", ")}
                      </p>
                    </div>


                    <div className="flex flex-col bg-linear-to-r from-orange-500 to-pink-500 rounded-2xl p-4 text-white">
                      <span className="text-sm opacity-90">Total a Pagar</span>
                      <span className="text-3xl font-bold mt-1">
                        $
                        {pendientes
                          .filter((f) => selected.includes(f.numero))
                          .reduce((sum, f) => sum + (f.total || 0), 0)
                          .toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-around gap-3 mt-6">
                      {/* Cancelar */}
                      <button
                        onClick={() => setPreview(false)}
                        className="flex items-center justify-center px-6 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>

                      {/* Pagar ahora */}
                      <button
                        onClick={async () => {
                          const facturasTotales = pendientes.filter((f) =>
                            selected.includes(f.numero)
                          );

                          for (const f of facturasTotales) {
                            const totalPagado = f.total?.toFixed(2) || 0;
                            const totalRestante = 0;

                            // ✅ Actualiza factura
                            const { error: updateError } = await supabase
                              .from("tb_factura")
                              .update({
                                total_pagado: totalPagado,
                                total_restante: totalRestante,
                                estado: "pagado",
                              })
                              .eq("id_factura", f.id_factura);

                            if (updateError) {
                              console.error(
                                `❌ Error actualizando factura ${f.numero}:`,
                                updateError.message
                              );
                              continue;
                            }

                            // ✅ Inserta pago total
                            const { error: pagoError } = await supabase.from("tb_pago_factura").insert([
                              {
                                id_factura: f.id_factura,
                                id_cliente: cliente.id_cliente,
                                monto: parseFloat(totalPagado),
                                id_metodo_pago: "a9600036-34e9-4ab0-883a-fad419195875",
                                observacion: `Pago total de factura ${f.numero}`,
                                fecha_pago: new Date().toISOString(),
                              },
                            ]);

                            if (pagoError)
                              console.error(`⚠️ Error insertando pago ${f.numero}:`, pagoError.message);
                            else console.log(`✅ Pago total registrado (${f.numero})`);
                          }

                          setPreview(false);
                        }}
                        className="flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium text-white bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
                      >
                        Pagar ahora
                      </button>
                    </div>


                  </div>
                </div>
              </>
            )}
          </>
        )}




      </main>

      {showBottom && <BottomNav />}
    </div >
  );
}
