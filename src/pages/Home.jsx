import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../component/Sidebar";
import BottomNav from "../component/BottomNav";
import Casillero from "../component/Casillero";
import Cartilla from "../component/Cartilla";
import Notificaciones from "../component/Notificaciones";
import Promociones from "../component/Promociones";
import { useAuth } from "../context/AuthContext";
import ChatBubble from "../component/ChatBubble";
import { Moon, Sun, Package } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeProvider, useTheme } from "../component/ThemeProvider";
import Logo from "../assets/img/LOGO-ROJO-LETRA.png"
import LogoP from "../assets/icon/mini_target.webp"
import Paquetes from "../component/Paquetes";
export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const [showBottom, setShowBottom] = useState(true);
  const [userName, setUserName] = useState("");
  const [cliente, setCliente] = useState(null);
  const [modalsOpen, setModalsOpen] = useState({
    cartilla: false,
    casillero: false,
    notificaciones: false,
    promociones: false,
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
    }),
    [handleModalChange]
  );

  useEffect(() => {
    const getCliente = async () => {
      if (!user?.email) return;
      const { data, error } = await supabase
        .from("tb_cliente")
        .select(`
          id_cliente,
          nombre,
          apellido,
          id_sucursal (
            id_sucursal,
            nombre,
            direccion
          )
        `)
        .eq("email", user.email)
        .maybeSingle();

      if (!error && data) {
        setCliente({
          id_cliente: data.id_cliente,
          nombre: data.nombre,
          apellido: data.apellido,
          sucursal: data.id_sucursal?.nombre || "",
        });
        setUserName(data.nombre);
      }
    };
    getCliente();
  }, [user]);

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
                {userName}
              </h1>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Aquí tienes un resumen de tus beneficios y casilleros.
            </p>
          </div>

          {/* 🔹 Resto del contenido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            <Promociones onModalChange={modalHandlers.promociones} />
            <Cartilla />
          </div>

            <div className="grid lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <Paquetes />
              </div>
              <div className="lg:col-span-1">
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
