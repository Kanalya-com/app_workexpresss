import { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import BottomNav from "../component/BottomNav";
import FacturaCard from "../component/FacturaCard";
import FacturaList from "../component/FacturaList"; // 👈 import del componente
import { CreditCard, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Facturas({ cliente }) {
  const [tab, setTab] = useState("pendientes");
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(false);
  const [showBottom, setShowBottom] = useState(true);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setShowBottom(!preview);
  }, [preview]);

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

  const pendientes = facturas.filter((f) => f.estado?.toUpperCase() === "PENDIENTE");
  const pagadas = facturas.filter((f) => f.estado?.toUpperCase() === "PAGADA");

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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-20 pb-24 md:pb-0 p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f2af1e] mb-1">
          Mis Facturas
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Gestiona y paga tus facturas pendientes
        </p>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 mb-5 transition-colors duration-300">
          <button
            onClick={() => setTab("pendientes")}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
              tab === "pendientes"
                ? "bg-[#b71f4b] dark:bg-[#f2af1e] text-white dark:text-gray-900"
                : "text-gray-600 dark:text-gray-400 hover:text-[#b71f4b] dark:hover:text-[#f2af1e]"
            }`}
          >
            Pendientes ({pendientes.length})
          </button>
          <button
            onClick={() => setTab("pagadas")}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
              tab === "pagadas"
                ? "bg-green-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-green-500"
            }`}
          >
            Pagadas ({pagadas.length})
          </button>
        </div>

        {/* 🔹 Aquí integras la lista modular de facturas */}
        <FacturaList idCliente={cliente?.id_cliente} />

        {/* Vista previa del pago */}
        {preview && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-end md:items-center z-50">
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full md:w-[420px] rounded-t-3xl md:rounded-3xl shadow-2xl p-6 relative animate-fadeIn">
              <button
                onClick={() => setPreview(false)}
                className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <ArrowLeft size={20} />
              </button>

              <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-[#f2af1e]">
                Vista Previa del Pago
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">
                Revisa los detalles antes de confirmar el pago
              </p>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                {pendientes
                  .filter((f) => selected.includes(f.numero))
                  .map((f) => (
                    <div
                      key={f.numero}
                      className="flex justify-between text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 last:border-none py-1"
                    >
                      {/* <span>{f.numero}</span> */}
                      <span>${f.total?.toFixed(2)}</span>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-200 mb-4">
                <span>Total a Pagar:</span>
                <span className="text-[#b71f4b] dark:text-[#f2af1e]">${total}</span>
              </div>

              <button className="w-full bg-[#b71f4b] dark:bg-[#f2af1e] text-white dark:text-gray-900 py-3 rounded-xl text-sm font-medium hover:bg-[#a01744] dark:hover:bg-[#e6c565] mb-3 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Confirmar Pago ${total}
              </button>

              <button
                onClick={() => setPreview(false)}
                className="w-full border border-gray-300 dark:border-gray-700 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>

      {showBottom && <BottomNav />}
    </div>
  );
}
