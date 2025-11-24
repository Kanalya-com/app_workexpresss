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
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./component/PrivateRoute";
import { ThemeProvider } from "./component/ThemeProvider"; // 👈 importa aquí
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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) return;

      const email = userData.user.email;

      const { data, error } = await supabase
        .from("tb_cliente")
        .select("id_cliente, nombre, email")
        .eq("email", email)
        .single();

      if (error) {
        console.error("❌ Error obteniendo cliente:", error.message);
      } else {
        // console.log("✅ Cliente encontrado:", data);
        setClienteActual(data);
      }
    };

    fetchCliente();
  }, []);
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    // 👇 Aquí el cambio importante
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
            <Route
              path="/recivo-factura/:id"
              element={
                <PrivateRoute>
                  <RecivoFactura/>
                </PrivateRoute>
              }
            />
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
