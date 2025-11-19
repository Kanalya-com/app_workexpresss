import React from "react";
import { useNavigate } from "react-router-dom";
import willy from "../assets/willyPaquete.png";

export default function Seguimiento() {
    const navigate = useNavigate();

    const irSeguimiento = () => {
        navigate("/seguimiento");
    };

    return (
        <div className="w-full rounded-xl overflow-hidden">
            <div
                className="flex flex-row items-center justify-between
                bg-gradient-to-br from-[#f2af1e] via-[#f5a623] to-[#ea6342]
                p-4 md:p-12 text-white"
            >
                {/* Imagen de Willy */}
                <div className="w-1/3 flex justify-center">
                    <img
                        src={willy}
                        alt="Willy buscando paquete"
                        className="w-28 sm:w-40 md:w-56 drop-shadow-xl"
                    />
                </div>

                {/* Texto + Botón */}
                <div className="w-2/3 text-left pl-3 md:pl-8">

                    <h1 className="text-xl sm:text-4xl font-bold">
                        Rastrea tu envío
                    </h1>

                    <p className="text-[14px] sm:text-lg font-light mb-4">
                        Consulta el estado de tu paquete en segundos.
                    </p>

                    {/* 🔥 Botón Ver más */}
                    <button
                        onClick={irSeguimiento}
                        className="bg-white/20 border border-white/30 text-white w-full
                        px-4 py-2 rounded-xl font-semibold shadow-md transition text-[12px]"
                    >
                       Entrar ya!
                    </button>

                </div>
            </div>
        </div>
    );
}
