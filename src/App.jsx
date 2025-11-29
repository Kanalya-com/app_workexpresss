import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SplashScreen from "./component/SplashScreen";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import ResetPassword from "./pages/ResetPassword";
import ErrorPages from "./pages/NotFound";
import Seguimiento from "./pages/Seguimiento";
import Facturas from "./pages/Facturas";
import Perfil from "./pages/Perfil";
import RecivoFactura from "./pages/RecivoFactura";
import ConfirmacionCorreo from "./pages/ConfirmacionCorreo";
import ActualizarDatos from "./pages/ActualizarDatos";  // 👈 NUEVO
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./component/PrivateRoute";
import { ThemeProvider } from "./component/ThemeProvider";
import { supabase } from "./lib/supabaseClient";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [clienteActual, setClienteActual] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCliente = async () => {
      // 1️⃣ obtener email desde URL
      const url = new URL(window.location.href);
      const emailURL = url.searchParams.get("email");
      // 2️⃣ obtener email desde Supabase Auth (si hay sesión)
      const { data: userData } = await supabase.auth.getUser();
      const emailAuth = userData?.user?.email;

      // 3️⃣ prioridad: email desde URL → email desde sesión
      const emailFinal = emailURL || emailAuth;
      if (!emailFinal) return;

      // 4️⃣ buscar cliente en la base de datos
      const { data, error } = await supabase
        .from("tb_cliente")
        .select(`
          id_cliente,
          nombre,
          apellido,
          email,
          telefono,
          cedula,
          direccion,
          cliente_activo,
          id_sucursal,
          id_plan,
          sucursal:tb_sucursal!id_sucursal (
            id_sucursal,
            nombre,
            direccion,
            telefono
          ),
          plan:tb_plan!id_plan (
            id_plan,
            descripcion,
            precio,
            beneficios
          )
        `)
        .eq("email", emailFinal)
        .single();

      if (!error && data) {
        setClienteActual(data);
      } else {
        console.error("🔥 Error cargando cliente:", error);
      }
    };

    fetchCliente();
  }, []);




  if (showSplash) return <SplashScreen />;

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Auth />} />

            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />

            <Route
              path="/actualizar-datos"
              element={<ActualizarDatos cliente={clienteActual} />}
            />


            <Route
              path="/seguimiento"
              element={
                <PrivateRoute>
                  <Seguimiento />
                </PrivateRoute>
              }
            />

            <Route
              path="/perfil"
              element={
                <PrivateRoute>
                  <Perfil />
                </PrivateRoute>
              }
            />

            <Route
              path="/facturas"
              element={
                <PrivateRoute>
                  <Facturas cliente={clienteActual} />
                </PrivateRoute>
              }
            />

            <Route path="/recibo-factura/:id" element={<RecivoFactura />} />

            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirmacion-correo" element={<ConfirmacionCorreo />} />

            <Route path="*" element={<ErrorPages />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
