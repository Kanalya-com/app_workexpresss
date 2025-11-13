import { Package, CalendarDays, MapPin, Truck, User, Mail, DollarSign } from "lucide-react";


export default function DetalleFactura({ factura, onClose }) {
   
    const {
        id = "INV-001",
        fecha = "7 de noviembre de 2025",
        numeroPaquete = "4003319104346362",
        origen = "Miami, USA",
        destino = "San José, Costa Rica",
        peso = "2.5 kg",
        tipoEnvio = "Aéreo Express",
        nombreCliente = "Emmanuel",
        emailCliente = "emmanuel@example.com",
        costoEnvio = 120,
        seguro = 15,
        iva = 15,
        total = 150,
        estado = "Pagado",
        fechaPago = "7/11/2025",
    } = factura || {};

    const esPagado = estado.toLowerCase() === "pagado";

    return (
        <div className="bg-white dark:bg-[#01060c]  text-[#01060c] dark:text-white p-6 rounded-2xl w-full max-w-lg mx-auto shadow-xl border border-gray-800">
            {/* Header */}
            <div className="flex justify-between items-start pt-4">
                <div>
                    <h2 className="text-2xl font-bold">{id}</h2>
                    <p className="text-gray-400 text-sm">Detalles de la factura</p>
                </div>
                {esPagado ? (
                    <span className="bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Pagado
                    </span>
                ) : (
                    <span className="bg-yellow-500 text-black text-xs font-semibold px-3 py-1 rounded-full">
                        Pendiente
                    </span>
                )}
                <button
                onClick={onClose}
                className="absolute top-2 right-2 text-[#01060c] dark:text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 z-50"
              >
                ✕
              </button>
            </div>

            {/* Info básica */}
            <div className="flex justify-between text-sm mt-5 border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-pink-500" />
                    <span>
                        <strong>Fecha de emisión:</strong> {fecha}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Package size={16} className="text-pink-500" />
                    <span>
                        <strong>#</strong> {numeroPaquete}
                    </span>
                </div>
            </div>

            {/* Información del envío */}
            <div className="bg-[#040c13] rounded-xl p-4 mt-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-200 mb-3">
                    <Truck size={18} className="text-pink-500" /> Información del envío
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-400">Origen</p>
                        <p className="font-semibold">{origen}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Destino</p>
                        <p className="font-semibold">{destino}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Peso</p>
                        <p className="font-semibold">{peso}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Tipo de envío</p>
                        <p className="font-semibold">{tipoEnvio}</p>
                    </div>
                </div>
            </div>

            {/* Información del cliente */}
            <div className="bg-[#040c13] rounded-xl p-4 mt-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-200 mb-3">
                    <User size={18} className="text-pink-500" /> Información del cliente
                </h3>
                <div className="text-sm">
                    <p>
                        <span className="text-gray-400">Nombre:</span> {nombreCliente}
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                        <Mail size={14} className="text-pink-500" />
                        {emailCliente}
                    </p>
                </div>
            </div>

            {/* Desglose de costos */}
            <div className="bg-[#040c13] rounded-xl p-4 mt-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-200 mb-3">
                    <DollarSign size={18} className="text-pink-500" /> Desglose de costos
                </h3>
                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span>Costo de envío</span>
                        <span>${costoEnvio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Seguro</span>
                        <span>${seguro.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>IVA (13%)</span>
                        <span>${iva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-700 pt-2 mt-2 text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Estado final */}
            {esPagado ? (
                <div className="bg-green-700 text-center text-sm font-semibold rounded-xl mt-5 py-3">
                    Esta factura ya ha sido pagada
                    <p className="text-gray-200 text-xs mt-1">
                        Pagado el {fechaPago}
                    </p>
                </div>
            ) : (
                <button className="mt-5 w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90 transition-all py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                    <Package size={18} />
                    Pagar factura con Tilopay
                </button>
            )}
        </div>
    );
}
