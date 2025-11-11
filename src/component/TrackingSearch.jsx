import { useState } from "react";
import { Search, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../component/ThemeProvider"; // 👈 agregado

export function TrackingSearch({ onSearch, isLoading }) {
  const [trackingId, setTrackingId] = useState("");
  const [inputError, setInputError] = useState("");
  const { theme } = useTheme(); // 👈 obtiene el tema actual

  const validateTrackingId = (id) => {
    const trimmedId = id.trim();
    if (!trimmedId) return "Por favor ingresa un número de rastreo";
    if (trimmedId.length < 8)
      return "El número de rastreo debe tener al menos 8 caracteres";
    if (trimmedId.length > 50)
      return "El número de rastreo es demasiado largo";
    if (!/^[A-Za-z0-9]+$/.test(trimmedId))
      return "El número de rastreo solo puede contener letras y números";
    return null;
  };

  const logTrackingSilently = async (id) => {
    try {
      const { error } = await supabase.from("tb_paquetes").insert([{ tracking_id: id }]);
      if (error) {
        const msg = (error?.message || "").toLowerCase();
        if (msg.includes("duplicate") || msg.includes("unique") || error?.code === "23505") return;
      }
    } catch (_) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInputError("");

    const validationError = validateTrackingId(trackingId);
    if (validationError) {
      setInputError(validationError);
      return;
    }

    const id = trackingId.trim().toUpperCase();
    onSearch(id);
    // logTrackingSilently(id);
  };

  const handleInputChange = (e) => {
    setTrackingId(e.target.value);
    if (inputError) setInputError("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4 transition-colors duration-300">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ingresa tu número de rastreo"
              value={trackingId}
              onChange={handleInputChange}
              className={`w-full h-12 sm:h-14 pl-4 pr-12 text-base sm:text-lg border-2 rounded-xl focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md
                ${
                  inputError
                    ? "border-red-500 bg-red-50/40 dark:border-red-600 dark:bg-red-900/20 focus:border-red-500"
                    : "border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-300 focus:border-[#b71f4b] dark:focus:border-[#f2af1e] focus:shadow-lg focus:shadow-[#b71f4b]/20"
                }`}
            />
            {!inputError ? (
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 dark:text-red-400" />
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !!inputError}
            className={`h-12 sm:h-14 px-6 sm:px-8 flex items-center justify-center gap-2 rounded-xl text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5
              ${
                isLoading || inputError
                  ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed shadow-none transform-none"
                  : "bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold"
              }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Buscando...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Rastrear</span>
              </>
            )}
          </button>
        </div>

        {inputError && (
          <div className="mt-4 flex items-start gap-3 text-[#b71f4b] dark:text-[#f2af1e] text-sm bg-[#fdecef] dark:bg-[#2b1c1f] border border-[#f3c2cc] dark:border-[#f2af1e]/40 rounded-xl px-4 py-3 shadow-sm animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{inputError}</span>
          </div>
        )}
      </form>
    </div>
  );
}
