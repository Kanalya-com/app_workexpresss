import { useTheme } from "../component/ThemeProvider";
import { Calendar, MapPin, Building2, CheckCircle2, Circle, Clock, Package, Plane, FileText, AlertTriangle } from "lucide-react";

// ---- Componente auxiliar: Tarjeta base ----
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

// ---- Componente auxiliar: Badge (etiqueta de estado) ----
function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-block font-medium rounded-xl border-0 ${className}`}
    >
      {children}
    </span>
  );
}






// ---- Componente principal ----
export function TrackingResult({ data, error }) {
  const { theme, toggleTheme } = useTheme();
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 sm:py-20 px-4">
        <div className="text-center animate-in fade-in-50 duration-500">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 bg-linear-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center shadow-lg">
            {error.type === 'not_found' ? (
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
            ) : (
              <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            {error.type === 'not_found' ? 'Paquete no encontrado' : 'Error de conexión'}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            {error.message}
          </p>
          
          {error.type === 'not_found' && (
            <div className="bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-6 max-w-md mx-auto shadow-sm">
              <h3 className="font-semibold text-amber-800 mb-3 text-sm sm:text-base">💡 Consejos útiles:</h3>
              <ul className="text-xs sm:text-sm text-amber-700 text-left space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Verifica que el número esté completo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Revisa que no tenga espacios extra</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Asegúrate de usar el formato correcto</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>El rastreo puede tardar algunas horas en aparecer</span>
                </li>
              </ul>
            </div>
          )}
          
          {error.type === 'network' && (
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6 max-w-md mx-auto shadow-sm">
              <h3 className="font-semibold text-blue-800 mb-3 text-sm sm:text-base">🔧 Qué puedes hacer:</h3>
              <ul className="text-xs sm:text-sm text-blue-700 text-left space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Revisa tu conexión a internet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Intenta nuevamente en unos minutos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Contacta soporte si el problema persiste</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 sm:py-20 px-4">
        <div className="text-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 bg-linear-to-br from-orange-50 to-amber-50 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            Rastrea tu paquete en tiempo real
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Ingresa tu número de rastreo para ver el estado de tu envío
          </p>
        </div>
      </div>
    );
  }

  const getCurrentPhase = (currentStatus) => {
    if (!currentStatus) return 0;
    
    const status = currentStatus.toLowerCase();
    
    if (status.includes('received') || status.includes('maimi')) return 1;
    if (status.includes('transit') || status.includes('tránsito')) return 2;
    if (status.includes('panamá') || status.includes('facturado')) return 3;
    
    return 0;
  };

  const currentPhase = getCurrentPhase(data.current_status);

  const getStatusText = (currentStatus) => {
    if (!currentStatus) return 'Pendiente';
    
    const status = currentStatus.toLowerCase();
    
    
    if (status.includes('transit') || status.includes('tránsito')) return 'En tránsito';
    if (status.includes('received')) return 'Recibido en Miami';
    
    return currentStatus;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('received') || statusLower.includes('miami')) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (statusLower.includes('transit') || statusLower.includes('tránsito')) {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    if (statusLower.includes('arrived') || statusLower.includes('facturado')) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 py-8 sm:py-12 px-4 animate-in slide-in-from-bottom-4 duration-700">
      {/* Fases visuales del tracking */}
      <Card className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#040c13] shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 dark:text-white bg-clip-text text-transparent mb-2">
            Estado del Envío
          </h2>
          <p className="text-gray-600 text-sm sm:text-base dark:text-white">Seguimiento en tiempo real de tu paquete</p>
        </div>

        {/* Fases en desktop */}
        <div className="hidden lg:flex justify-between items-center relative mb-8">
          <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 rounded-full z-0 shadow-inner">
            <div 
              className="h-full transition-all duration-1000 ease-out rounded-full shadow-sm"
              style={{ 
                background: 'linear-gradient(to right, #f2af1e, #ed933e, #ea6342)',
                width: currentPhase === 0 ? '0%' : 
                      currentPhase === 1 ? '50%' : 
                      currentPhase === 2 ? '66%' : '100%' 
              }}
            />
          </div>

          {/* 1️⃣ USA */}
          <div className="flex flex-col items-center relative z-10">
            <div 
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                currentPhase === 1 ? "animate-pulse-ring" : 'bg-gray-300'
              }`}
              style={{
                background: currentPhase >= 1 ? '#f2af1e' : undefined
              }}
            >
              {currentPhase >= 1 ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : (
                <Package className="w-8 h-8 text-white" />
              )}
            </div>
            <h3 className={`mt-3 font-semibold text-lg transition-colors duration-300`}
                style={{ color: currentPhase >= 1 ? '#f2af1e' : '#6b7280' }}>
              USA
            </h3>
            <p className="text-sm text-gray-500 text-center mt-1 max-w-32">Bodega Miami</p>
          </div>

          {/* 2️⃣ Tránsito */}
          <div className="flex flex-col items-center relative z-10">
            <div 
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                currentPhase === 2 ? "animate-pulse-ring" : 'bg-gray-300'
              }`}
              style={{
                background: currentPhase >= 2 ? '#ed933e' : undefined
              }}
            >
              {currentPhase >= 2 ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : (
                <Plane className="w-8 h-8 text-white" />
              )}
            </div>
            <h3 className={`mt-3 font-semibold text-lg transition-colors duration-300`}
                style={{ color: currentPhase >= 2 ? '#ed933e' : '#6b7280' }}>
              Tránsito
            </h3>
            <p className="text-sm text-gray-500 text-center mt-1 max-w-32">En tránsito a Panamá</p>
          </div>

          {/* 3️⃣ Entregado */}
          <div className="flex flex-col items-center relative z-10">
            <div 
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                currentPhase === 3 ? "animate-pulse-ring" : 'bg-gray-300'
              }`}
              style={{
                background: currentPhase >= 3 ? '#ea6342' : undefined
              }}
            >
              {currentPhase >= 3 ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : (
                <MapPin className="w-8 h-8 text-white" />
              )}
            </div>
            <h3 className={`mt-3 font-semibold text-lg transition-colors duration-300`}
                style={{ color: currentPhase >= 3 ? '#ea6342' : '#6b7280' }}>
              Facturado
            </h3>
            <p className="text-sm text-gray-500 text-center mt-1 max-w-32">Listo para entrega</p>
          </div>
        </div>

        {/* Fases en mobile y tablet (vertical) */}
        <div className="lg:hidden space-y-3 sm:space-y-4">
          {[
            { name: 'USA', icon: Package, description: 'Bodega Miami', index: 1, color: '#f2af1e' },
            { name: 'Tránsito', icon: Plane, description: 'En tránsito a Panamá', index: 2, color: '#ed933e' },
            { name: 'Facturado', icon: FileText, description: 'Listo para entrega', index: 3, color: '#b71f4b' }
          ].map((phase) => {
            const IconComponent = phase.icon;
            const isActive = currentPhase >= phase.index;     // alcanzado o completado
            const isCurrent = currentPhase === phase.index;   // estado actual exacto

            return (
              <div
                key={phase.name}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                      isActive ? "" : "bg-gray-300"
                    } ${isCurrent ? "animate-pulse-ring" : ""}`}
                    style={{
                      background: isActive ? phase.color : undefined,
                      transform: isCurrent ? "scale(1.08)" : "scale(1)",
                    }}
                  >
                    {isActive ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-semibold text-sm sm:text-base"
                      style={{ color: isActive ? phase.color : "#6b7280" }}
                    >
                      {phase.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {phase.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>  
      </Card>

      <Card className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#040c13] shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">Número de Rastreo</p>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white break-all">
              {data.tracking_id || 'N/A'}
            </h2>
          </div>
          <div className="flex justify-start lg:justify-end">
            <Badge className={`${getStatusColor(getStatusText(data.current_status))} px-3 py-2 text-xs sm:text-sm font-semibold shadow-sm`}>
              {getStatusText(data.current_status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-linear-to-br from-orange-50 to-amber-50 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Última Actualización</p>
              <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                {data.list_status_history && data.list_status_history.length > 0 
                  ? new Date(data.list_status_history[0].date).toLocaleDateString('es-ES')
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-linear-to-br from-amber-50 to-yellow-50 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Destinatario</p>
              <p className="text-sm sm:text-base font-semibold text-gray-800">WorkExpress</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-linear-to-br from-red-50 to-pink-50 hover:shadow-md transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-red-400 to-pink-400 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Ubicación Actual</p>
              <p className="text-sm sm:text-base font-semibold text-gray-800">
                {(() => {
                  const status = data.current_status?.toLowerCase() || '';
                  if (status.includes('transit') || status.includes('tránsito')) return 'En tránsito a Panamá';
                  if (status.includes('received')) return 'Bodega Miami';
                  if (status.includes('invoiced')) return 'Facturado';
                  return data.current_status || 'N/A';
                })()}
              </p>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}
