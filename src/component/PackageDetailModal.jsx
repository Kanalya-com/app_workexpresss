import React from "react";
import { Package, MapPin, Calendar, Weight, CheckCircle2, Truck, Clock, X } from "lucide-react";

export default function PackageDetailModal({ isOpen, onClose, packageData, history }) {
  if (!isOpen || !packageData) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start z-[9999] overflow-y-auto py-10 px-4">
      
      {/* Fondo cierre */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-[#040c13] text-gray-800 dark:text-gray-200 w-full max-w-2xl rounded-2xl shadow-xl p-6 animate-fadeIn">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Detalles del Paquete</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Panel superior */}
        <div className="bg-gradient-to-br from-pink-600 via-orange-500 to-purple-600 p-6 rounded-xl text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs opacity-80">Número de rastreo</p>
              <p className="font-mono text-lg">{packageData.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoBox icon={MapPin} label="Origen" value={packageData.origin} />
            <InfoBox icon={MapPin} label="Destino" value={packageData.destination} />
            <InfoBox icon={Calendar} label="Fecha de envío" value={new Date(packageData.date).toLocaleDateString("es-ES")} />
            <InfoBox icon={Weight} label="Peso" value={packageData.weight} />
          </div>
        </div>

        {/* Historial */}
        <h3 className="text-lg font-semibold mb-4">Historial de rastreo</h3>

        <div className="space-y-4">
          {history.map((event, index) => {
            const Icon = event.icon;
            return (
              <div className="flex gap-4" key={index}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${index === 0 ? "bg-green-100 text-green-600" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}>
                    <Icon size={20} />
                  </div>
                  {index !== history.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-300 dark:bg-gray-700"></div>
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex justify-between">
                    <p className="font-semibold">{event.status}</p>
                    <p className="text-sm opacity-70">{event.date} - {event.time}</p>
                  </div>
                  <p className="text-sm opacity-80">{event.location}</p>
                  <p className="text-sm">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}


function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="opacity-80" />
        <span className="text-xs opacity-80">{label}</span>
      </div>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
