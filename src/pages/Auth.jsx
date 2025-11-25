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
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const [showPopup, setShowPopup] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    correo_principal: "",
    apellido: "",
    telefono: "",
    cedula: "",
    direccion: "",
    sucursal_preferida: "",
    plan: "",
    password: "",
  });
  useEffect(() => {
    const savedForm = localStorage.getItem("workexpress_form");
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        // Si detecta un id viejo, lo limpia
        if (parsed.plan && parsed.plan.includes("_")) parsed.plan = "";
        setForm(parsed);
      } catch (err) {
        console.warn("Error restaurando formulario:", err);
      }
    }
  }, []);
  useEffect(() => {
    const fetchSucursales = async () => {
      const { data, error } = await supabase
        .from("tb_sucursal")
        .select("nombre, id_sucursal")
        .eq("estado", true);

      if (error) console.error("Error cargando sucursales:", error);
      else setSucursales(data || []);
    };

    const fetchPlanes = async () => {
      const { data, error } = await supabase
        .from("tb_plan")
        .select("id_plan, descripcion, id_sucursal, precio, beneficios, estado_plan");

      if (error) console.error("❌ Error cargando planes:", error.message);

      else setPlanes(data);

    };

    fetchSucursales();
    fetchPlanes();
  }, []);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };



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
    return false; // ❌ Login falló
  } else {
    setPopup({
      show: true,
      message: "Sesión iniciada correctamente.",
      type: "success",
    });
    localStorage.setItem("user", JSON.stringify(data.user));
    return true; // ✅ Login correcto
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
      onLogin={handleLogin}
      onForgotPassword={handleForgotPassword}
      onNavigate={(ruta) => navigate(ruta)}   // 👈 ESTA ES LA CLAVE
    />

    <Popup
      show={popup.show}
      message={popup.message}
      type={popup.type}
      onClose={() => setPopup({ ...popup, show: false })}
    />
  </ThemeProvider>
);
}