import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Mail, User, Phone, IdCard, MapPin, Building, Lock, Eye, EyeOff } from "lucide-react";
import Popup from "../component/Popup";
import { useNavigate } from "react-router-dom";

export default function ActualizarDatos({ cliente }) {
    const navigate = useNavigate();

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "success"
    });
    const [form, setForm] = useState({
        email: "",
        nombre: "",
        apellido: "",
        telefono: "",
        cedula: "",
        direccion: "",
        id_sucursal: "",
        id_plan: "",
        password: "",
        confirmPassword: "",
    });

    const [showPass, setShowPass] = useState(false);
    const [showPass2, setShowPass2] = useState(false);

    const [sucursales, setSucursales] = useState([]);
    const [planes, setPlanes] = useState([]);

    useEffect(() => {
        if (cliente) {
            setForm({
                email: cliente.email || "",
                nombre: cliente.nombre || "",
                apellido: cliente.apellido || "",
                telefono: cliente.telefono || "",
                cedula: cliente.cedula || "",
                direccion: cliente.direccion || "",
                id_sucursal: cliente.id_sucursal || "",
                id_plan: cliente.id_plan || "",
                password: "",
                confirmPassword: "",
            });

            if (cliente.id_sucursal) fetchPlanes(cliente.id_sucursal);
        }
    }, [cliente]);

    useEffect(() => {
        const fetchSucursales = async () => {
            const { data } = await supabase.from("tb_sucursal").select("*");
            setSucursales(data || []);
        };
        fetchSucursales();
    }, []);

    const fetchPlanes = async (idSucursal) => {
        const { data } = await supabase
            .from("tb_plan")
            .select("*")
            .eq("id_sucursal", idSucursal);

        setPlanes(data || []);
    };

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSucursalChange = (e) => {
        const idSucursal = e.target.value;
        setForm({ ...form, id_sucursal: idSucursal, id_plan: "" });
        fetchPlanes(idSucursal);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar contraseñas
        if (form.password !== form.confirmPassword) {
            setPopup({
                show: true,
                message: "Las contraseñas no coinciden.",
                type: "error"
            });
            return;
        }

        // 1️⃣ Actualizar datos del cliente
        const { error: updateError } = await supabase
            .from("tb_cliente")
            .update({
                nombre: form.nombre,
                apellido: form.apellido,
                telefono: form.telefono,
                cedula: form.cedula,
                direccion: form.direccion,
                id_sucursal: form.id_sucursal,
                id_plan: form.id_plan,
                cliente_activo: true,
                updated_at: new Date(),
            })
            .eq("email", form.email);

        if (updateError) {
            setPopup({
                show: true,
                message: "Error actualizando datos.",
                type: "error",
            });
            return;
        }

        // 2️⃣ Crear usuario Auth con password
        const { error: authError } = await supabase.auth.admin.createUser({
            email: form.email,
            password: form.password,
            email_confirm: false,
            user_metadata: {
                nombre: form.nombre,
                apellido: form.apellido,
            },
        });

        if (authError) {
            setPopup({
                show: true,
                message: "Este correo ya tiene una cuenta creada.",
                type: "error",
            });
            return;
        }

        setPopup({
            show: true,
            message: "Datos actualizados con éxito. Revisa tu correo.",
            type: "success",
        });
        setTimeout(() => {
            navigate("/");
        }, 2500);

    };
    <Popup
        show={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
    />

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md space-y-6">

                <h1 className="text-3xl font-bold text-center text-gray-900">
                    Actualizar Datos
                </h1>

                <p className="text-gray-600 text-center text-sm">
                    Completa tu información para activar tu casillero
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Campos estándar con íconos */}
                    {[
                        { label: "Correo", name: "email", icon: Mail, disabled: true },
                        { label: "Nombre", name: "nombre", icon: User },
                        { label: "Apellido", name: "apellido", icon: User },
                        { label: "Teléfono", name: "telefono", icon: Phone },
                        { label: "Cédula", name: "cedula", icon: IdCard },
                        { label: "Dirección", name: "direccion", icon: MapPin },
                    ].map(({ label, name, icon: Icon, disabled }) => (
                        <div key={name} className="space-y-1">
                            <label className="text-gray-700 text-sm">{label}</label>
                            <div className="relative">
                                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name={name}
                                    disabled={disabled}
                                    value={form[name]}
                                    onChange={handleChange}
                                    className={`w-full bg-white border border-gray-300 rounded-xl text-gray-900 pl-10 pr-4 py-2 
                    focus:ring-2 focus:ring-pink-500 outline-none transition ${disabled ? "bg-gray-100 cursor-not-allowed" : ""
                                        }`}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Sucursal */}
                    <div className="space-y-1">
                        <label className="text-gray-700 text-sm">Sucursal</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                name="id_sucursal"
                                value={form.id_sucursal}
                                onChange={handleSucursalChange}
                                className="w-full bg-white border border-gray-300 rounded-xl text-gray-900 pl-10 pr-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                            >
                                <option value="">Seleccione una sucursal</option>
                                {sucursales.map((s) => (
                                    <option key={s.id_sucursal} value={s.id_sucursal}>
                                        {s.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Plan */}
                    <div className="space-y-1">
                        <label className="text-gray-700 text-sm">Plan</label>
                        <select
                            name="id_plan"
                            value={form.id_plan}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-300 rounded-xl text-gray-900 px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                        >
                            <option value="">Seleccione un plan</option>
                            {planes.map((p) => (
                                <option key={p.id_plan} value={p.id_plan}>
                                    {p.descripcion} – ${p.precio}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-1">
                        <label className="text-gray-700 text-sm">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showPass ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded-xl text-gray-900 pl-10 pr-12 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmación */}
                    <div className="space-y-1">
                        <label className="text-gray-700 text-sm">Confirmar contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showPass2 ? "text" : "password"}
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded-xl text-gray-900 pl-10 pr-12 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass2(!showPass2)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPass2 ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 mt-4 rounded-xl text-white font-semibold 
            bg-linear-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 transition"
                    >
                        Guardar Información
                    </button>
                </form>
            </div>
        </div>

    );
}
