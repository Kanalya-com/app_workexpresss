import { X, Package, User, Building2, MapPin, CheckCircle2 } from "lucide-react";

export default function ModalAgregarPaquete({ visible, onClose, paquete, cliente, onConfirm }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in duration-300">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Asignar Paquete</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-gray-700 text-sm">
            ¿Quieres agregar este paquete a tu cuenta?
          </p>

          <div className="bg-linear-to-br from-[#fdecef] to-[#f9dce2] rounded-xl p-4 border border-[#f3c2cc]">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-[#b71f4b]" />
              <span className="font-semibold text-gray-800 text-sm">Detalles del Paquete</span>
            </div>
            <p className="text-sm text-gray-600">
              <strong>ID:</strong> {paquete?.id || "—"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Estado:</strong> {paquete?.estado || "Pendiente"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Ubicación:</strong> {paquete?.ubicacion || "—"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-[#b71f4b]" />
              <span className="font-semibold text-gray-800 text-sm">Información del Cliente</span>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Nombre:</strong> {cliente?.nombre || "—"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Plan:</strong> {cliente?.plan || "—"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Sucursal:</strong> {cliente?.sucursal || "—"}
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#b71f4b] hover:bg-[#a01744]  text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Agregar a mi cuenta</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 font-medium rounded-xl py-3 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
