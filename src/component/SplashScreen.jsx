import { useEffect, useState } from "react";
import { Package, Plane, Ship } from "lucide-react";

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animación de progreso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Finalizar splash
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#f2af1e] via-[#ed933e] to-[#ea6342] overflow-hidden">
      {/* 🔸 Círculos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#b71f4b]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f2af1e]/30 rounded-full blur-3xl animate-pulse delay-100"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse delay-200"></div>
      </div>

      {/* 🔸 Iconos flotantes */}
      <div className="absolute top-20 left-20 animate-float">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
          <Plane className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="absolute bottom-32 right-24 animate-float-delayed">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
          <Ship className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="absolute top-40 right-32 animate-float-slow">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
          <Package className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* 🔸 Contenido principal */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo central */}
        <div className="mb-8 animate-scale-in">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center">
              <div className="w-28 h-28 bg-gradient-to-br from-[#f2af1e] to-[#b71f4b] rounded-full flex items-center justify-center">
                <Package className="w-14 h-14 text-white animate-bounce-slow" />
              </div>
            </div>
          </div>
        </div>

        {/* Texto */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-white mb-2 text-2xl font-bold tracking-wider">
            WorkExpress
          </h1>
          <p className="text-white/90 text-sm">
            Tu aliado en compras internacionales
          </p>
        </div>

        {/* Barra de carga */}
        <div className="w-64 animate-fade-in-delayed">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-white rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-white/80 mt-3 text-sm">Cargando...</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent"></div>

      {/* Animaciones CSS personalizadas */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }

        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-delayed {
          0%, 50% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 4s ease-in-out infinite; animation-delay: 0.5s; }
        .animate-float-slow { animation: float-slow 5s ease-in-out infinite; animation-delay: 1s; }
        .animate-scale-in { animation: scale-in 0.8s ease-out; }
        .animate-fade-in { animation: fade-in 0.8s ease-out 0.3s both; }
        .animate-fade-in-delayed { animation: fade-in-delayed 1.5s ease-out both; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
}
