import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../component/Sidebar";
import BottomNav from "../component/BottomNav";
import Casillero from "../component/Casillero";
import Cartilla from "../component/Cartilla";
import PackageDetailModal from "../component/PackageDetailModal";
import Notificaciones from "../component/Notificaciones";
import { useAppStore } from "../store/appStore";
import Promociones from "../component/Promociones";
import { useAuth } from "../context/AuthContext";
import { Moon, Sun, Package } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeProvider, useTheme } from "../component/ThemeProvider";
import Logo from "../assets/img/LOGO-ROJO-LETRA.png"
import LogoP from "../assets/icon/mini_target.webp"
import Paquetes from "../component/Paquetes";
import WillySeguimiento from "../component/WillySeguimiento"
export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const [showBottom, setShowBottom] = useState(true);
  const { cliente, cargarCliente, cargarPaquetes } = useAppStore();
  const [modalsOpen, setModalsOpen] = useState({
    cartilla: false,
    casillero: false,
    notificaciones: false,
    promociones: false,
    detallesPaquetes: false

  });

  const handleModalChange = useCallback((name, isOpen) => {
    setModalsOpen((prev) => {
      if (prev[name] === isOpen) return prev;
      const updated = { ...prev, [name]: isOpen };
      const anyOpen = Object.values(updated).some(Boolean);
      setShowBottom(!anyOpen);
      return updated;
    });
  }, []);

  const modalHandlers = useMemo(
    () => ({
      cartilla: (isOpen) => handleModalChange("cartilla", isOpen),
      casillero: (isOpen) => handleModalChange("casillero", isOpen),
      notificaciones: (isOpen) => handleModalChange("notificaciones", isOpen),
      promociones: (isOpen) => handleModalChange("promociones", isOpen),
      detallesPaquetes: (isOpen) => handleModalChange("detallesPaquetes", isOpen),
    }),
    [handleModalChange]
  );

  // 🔥 Carga cliente UNA VEZ y lo cachea
  useEffect(() => {
    if (user?.email) {
      cargarCliente(user.email);
    }
  }, [user]);

  // 🔥 Cuando el cliente está listo, carga sus paquetes
  useEffect(() => {
    if (cliente?.id_cliente) {
      cargarPaquetes(cliente.id_cliente);
    }
  }, [cliente]);


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-[#0f172a]">
        Cargando usuario...
      </div>
    );

  if (!user) {
    window.location.href = "/";
    return null;
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#01060c] text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Sidebar />

        <main className="flex-1 ml-0 md:ml-20 pb-24 md:pb-6 p-4 space-y-6 w-full max-w-full overflow-x-hidden overflow-y-auto">
          {/* 🔹 Header */}
          <div className="flex items-center justify-between bg-transparent  rounded-2xl ">
            {/* 🔸 Logo + Nombre de empresa */}
            <div className="flex items-center gap-3">
              {/* Logo pequeño: visible hasta 420 px */}
              <img
                src={LogoP}
                alt="Logo pequeño"
                className="h-10 block sm:hidden"
              />

              {/* Logo completo: visible desde 421 px en adelante */}
              <img
                src={Logo}
                alt="Logo completo"
                className="h-10 hidden sm:block md:hidden"
              />
            </div>



            {/* 🔹 Botones: tema + notificaciones */}
            <div className="flex items-center gap-3">
              {/* Botón modo oscuro */}
              <motion.button
                onClick={toggleTheme}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: theme === "dark" ? 180 : 0 }}
                transition={{ duration: 0.5 }}
                className="p-2 rounded-full bg-transparent  transition"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5  text-[#01060c]" />
                ) : (
                  <Sun className="w-5 h-5 text-[#f2af1e]" />
                )}
              </motion.button>

              {/* Notificaciones */}
              <div className="relative">
                <Notificaciones cliente={cliente} onModalChange={modalHandlers.notificaciones} />

              </div>
            </div>
          </div>
          {/* 🟢 Saludo */}
          <div className="flex gap-2 flex-col justify-center">
            <div className="flex items-center gap-2">
              <p className="text-xl text-[#01060c] dark:text-white font-bold">Hola,</p>
              <h1 className="text-xl font-bold text-[#d30046]">
                {cliente?.nombre || ""}
              </h1>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Aquí tienes un resumen de tus beneficios y casilleros.
            </p>
          </div>

          {/* 🔹 Resto del contenido */}
          {/* MOBILE: todo en columna */}
          <div className="flex flex-col gap-4 lg:hidden">
            <WillySeguimiento />
            <Promociones onModalChange={modalHandlers.promociones} />
            <Paquetes />
            {/* <Cartilla />  */}
            <Casillero cliente={cliente} onModalChange={modalHandlers.casillero} />
          </div>

          {/* DESKTOP: 2 filas con 3/4 y 1/4 */}
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-4">

            {/* Fila 1 */}
            <div className="lg:col-span-1 order-1">
              {/* <Cartilla /> */}
            </div>
            <div className="lg:col-span-3 order-2">
              {/* <Promociones onModalChange={modalHandlers.promociones} /> */}
            </div>

            {/* Fila 2 */}
            <div className="lg:col-span-3 order-3">
              <Paquetes />
            </div>
            <div className="lg:col-span-1 order-4">
              <Casillero cliente={cliente} />
            </div>

          </div>






          {/* <ChatBubble/> */}
        </main>

        {showBottom && <BottomNav />}
      </div>
    </ThemeProvider>
  );
}
