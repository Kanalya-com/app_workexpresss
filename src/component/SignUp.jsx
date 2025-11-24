import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Package, Star } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import Popup from "./Popup";
import { useTheme } from "./ThemeProvider";

export default function SignUp({ onNavigate }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const [sucursales, setSucursales] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    correo_principal: "",
    telefono: "",
    direccion: "",
    sucursal_preferida: "",
    plan: "",
    password: "",
  });

  // 🔹 Recuperar datos previos
  useEffect(() => {
    const savedForm = localStorage.getItem("workexpress_form");
    if (savedForm) {
      try {
        setForm(JSON.parse(savedForm));
      } catch {
        console.warn("Error restaurando formulario.");
      }
    }
  }, []);

  // 🔹 Cargar datos de Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data: suc } = await supabase
        .from("tb_sucursal")
        .select("id_sucursal, nombre")
        .eq("estado", true);
      if (suc) setSucursales(suc);

      const { data: pln } = await supabase
        .from("tb_plan")
        .select("id_plan, descripcion, id_sucursal, precio, beneficios, estado_plan");
      if (pln) setPlanes(pln);
    };
    fetchData();
  }, []);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => (step === 1 ? onNavigate("login") : setStep((prev) => prev - 1));
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 🔹 Filtrar planes por sucursal
  const getPlanesSucursal = () =>
    planes.filter((p) => p.estado_plan && p.id_sucursal === form.sucursal_preferida);

  // 🔹 Registro con verificación de correo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔸 Verificar si ya existe un correo registrado
      const { data: existingUser } = await supabase
        .from("tb_cliente")
        .select("email")
        .eq("email", form.correo_principal)
        .maybeSingle();

      if (existingUser) {
        setPopup({
          show: true,
          message: "Este correo ya está registrado. Por favor inicia sesión.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      // 🔸 Crear usuario en Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email: form.correo_principal,
        password: form.password,
        options: {
          emailRedirectTo: "https://app.workexpress.online/confirmacion-correo",
        },
      });
      if (authError) throw new Error(authError.message);

      // 🔸 Buscar plan seleccionado
      const { data: planData } = await supabase
        .from("tb_plan")
        .select("id_plan")
        .eq("descripcion", form.plan.trim())
        .maybeSingle();

      // 🔸 Insertar nuevo cliente
      await supabase.from("tb_cliente").insert([
        {
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.correo_principal,
          telefono: form.telefono,
          cedula: form.cedula,
          direccion: form.direccion,
          id_sucursal: form.sucursal_preferida,
          id_plan: planData?.id_plan,
          seguro: true,
        },
      ]);

      localStorage.removeItem("workexpress_form");

      // 🔸 Mostrar éxito
      setPopup({
        show: true,
        message: "Registro exitoso. Revisa tu correo para confirmar la cuenta.",
        type: "success",
      });

      setTimeout(() => onNavigate("login"), 3000);
    } catch (err) {
      setPopup({
        show: true,
        message: err.message || "Error inesperado durante el registro.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔹 Popup global (éxito o error) */}
      <Popup
        show={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
      />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
           
          </button>

          <motion.div
            key={step}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-[#040c13] rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16  bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-gray-900 dark:text-white text-lg font-semibold">
                Crear Casillero
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Paso {step} de 4
              </p>
            </div>

            {/* Barra progreso */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-8">
              <div
                className="h-2 rounded-full  bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>

            {/* Pasos */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="1" {...fade}>
                  <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
                  <Input label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} />
                  <Input label="Cédula" name="cedula" placeholder="0-000-0000" value={form.cedula} onChange={handleChange} />
                  <Next disabled={!form.nombre || !form.apellido || !form.cedula} onClick={handleNext} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="2" {...fade}>
                  <Input label="Correo electrónico" name="correo_principal" type="email" placeholder="correo@ejemplo.com" value={form.correo_principal} onChange={handleChange} />
                  <Input label="Teléfono" name="telefono" placeholder="+507 6000-0000" value={form.telefono} onChange={handleChange} />
                  <Input label="Dirección" name="direccion" placeholder="Ciudad, Provincia" value={form.direccion} onChange={handleChange} />
                  <Next disabled={!form.correo_principal || !form.telefono || !form.direccion} onClick={handleNext} />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="3" {...fade}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sucursal preferida
                  </label>
                  <select
                    name="sucursal_preferida"
                    value={form.sucursal_preferida}
                    onChange={handleChange}
                    className="w-full h-11 mb-4 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 dark:focus:ring-pink-500 outline-none"
                  >
                    <option value="">Seleccionar sucursal</option>
                    {sucursales.map((s) => (
                      <option key={s.id_sucursal} value={s.id_sucursal}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selecciona tu plan
                  </label>
                  <div className="space-y-3">
                    {getPlanesSucursal().map((p) => (
                      <div
                        key={p.id_plan}
                        onClick={() => setForm({ ...form, plan: p.descripcion })}
                        className={`border-2 p-4 rounded-lg cursor-pointer transition ${form.plan === p.descripcion
                          ? "border-orange-500 bg-orange-500/10 dark:border-pink-500 dark:bg-pink-500/10"
                          : "border-gray-200 dark:border-gray-700"
                          }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {p.descripcion}
                          </span>
                          {form.plan === p.descripcion && (
                            <div className="flex items-center justify-center bg-orange-500 dark:bg-pink-500 rounded-full p-1 shadow-md">
                              <Star className="w-4 h-4 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">${p.precio} / libra</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          ✔ {p.beneficios}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Next disabled={!form.sucursal_preferida || !form.plan} onClick={handleNext} />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="4" {...fade}>
                  <Input
                    label="Crea una contraseña"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={loading || form.password.length < 8}
                    className={`w-full h-12 mt-6 rounded-md font-medium text-white transition ${loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : " bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 hover:opacity-90"
                      }`}
                  >
                    {loading ? "Creando..." : "Crear Casillero"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}

// 🔹 Input reutilizable
function Input({ label, name, type = "text", placeholder, value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-11 px-3 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 dark:focus:ring-pink-500 outline-none"
      />
    </div>
  );
}

// 🔹 Botón siguiente
function Next({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-12 mt-6 font-medium rounded-md text-white transition ${disabled
        ? "bg-gray-400 cursor-not-allowed"
        : " bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 hover:opacity-90"
        }`}
    >
      Siguiente <ArrowRight className="inline-block w-4 h-4 ml-2" />
    </button>
  );
}

// 🔹 Animación base
const fade = {
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -25 },
  transition: { duration: 0.3 },
};
