import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Popup from "../component/Popup";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  IdCard,
  MapPin,
  Building2,
  Package,
} from "lucide-react";
import logo from "../assets/icon/mini_target.webp";
import willy from "../assets/willyLogin.webp";
import { supabase } from "../lib/supabaseClient";
import { div, p } from "framer-motion/client";
import Login from "../component/Login";
import { ThemeProvider } from "../component/ThemeProvider";
export default function Auth() {
  const navigate = useNavigate();
  // 🔹 LOGIN
  const handleLogin = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setPopup({
        show: true,
        message: "Error al iniciar sesión: " + error.message,
        type: "error",
      });
    } else {
      setPopup({
        show: true,
        message: "Sesión iniciada correctamente.",
        type: "success",
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      setTimeout(() => navigate("/Home"), 1000);
    }
  };





  // 🔹 RECUPERAR CONTRASEÑA
  const handleForgotPassword = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://app.workexpress.online/reset-password",
      });
      setLoading(false);

      if (error) {
        alert("Error: " + error.message);
        return false;
      } else {
        return true;
      }
    } catch (e) {
      alert("Error inesperado: " + e.message);
      return false;
    }
  };


  return (
    <ThemeProvider>
      <Login
        onLogin={(email, pass) => handleLogin(email, pass)}
        onForgotPassword={handleForgotPassword}
        onNavigate={() => { }}
      />

    </ThemeProvider>

  );
}