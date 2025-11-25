import React, { useState } from "react";
import { Moon, Sun, Package, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import ForgotPassword from "./ForgotPassword";
import SignUp from "./SignUp";
import logoBlack from "../assets/icon/mini_target.webp";
import logo from "../assets/icon/mini_target.webp";
import { img } from "framer-motion/client";

export default function Login({ onLogin, onNavigate, onForgotPassword, onRegister }) {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState("login"); // qué pantalla mostrar

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (email && password) {
    const ok = await onLogin(email, password); // 👈 espera la respuesta

    if (ok) {
      // Solo si el login fue exitoso navegas
      onNavigate("/home");
    }
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fbff] dark:bg-[#01060c] p-6 relative">

      {/* Theme toggle */}
      <motion.button
        onClick={toggleTheme}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: theme === "dark" ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="cursor-pointer absolute top-4 right-4 p-2 rounded-full hover:shadow-lg"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 " />
        ) : (
          <Sun className="w-5 h-5 text-yellow-500" />
        )}
      </motion.button>

      <div className="w-full max-w-md">

        <AnimatePresence mode="wait">
          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >

              {/* Encabezado */}
              <div className="text-center mb-8">
                <img
                  src={theme === "light" ? logo : logoBlack}
                  alt="Logo WorkExpress"
                  className="h-20 w-20 mx-auto mb-4"
                />

                <h1 className="text-3xl md:text-4xl font-bold text-[#01060c] dark:text-white">
                  WorkExpress
                </h1>
                <p className="text-sm md:text-base text-[#85919a] dark:text-gray-400">
                  Envíos rápidos y seguros a tu alcance
                </p>
              </div>

              {/* CARD PRINCIPAL */}
              <div className="bg-white dark:bg-[#040c13] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">

                <h2 className="text-3xl font-bold text-[#01060c] dark:text-white mb-2">
                  Iniciar Sesión
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Ingresa tus credenciales para acceder
                </p>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 px-3 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-pink-500"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Contraseña
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 w-full px-3 pr-10 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-pink-500"
                      />

                      {/* 👁 BOTÓN OJO */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-md  bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold hover:opacity-90"
                  >
                    Iniciar sesión
                  </button>
                </form>

                {/* LINKS */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setView("forgot")}
                    className="text-sm font-medium text-[#ec0050] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>

                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setView("signup")}
                      className="w-full h-11 rounded-xl font-medium border border-[#ec0050] text-[#ec0050] hover:bg-[#b71f4b] hover:text-white transition-all"
                    >
                      Crear cuenta nueva
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                © 2025 WorkExpress. Todos los derechos reservados.
              </p>
            </motion.div>
          )}

          {view === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <ForgotPassword onNavigate={() => setView("login")} onForgotPassword={onForgotPassword} />
            </motion.div>
          )}

          {view === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <SignUp onNavigate={() => setView("login")} onRegister={onRegister} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
