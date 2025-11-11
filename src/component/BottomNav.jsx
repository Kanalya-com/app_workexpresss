import { PackageSearch, FileText, User, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "home", label: "Inicio", icon: Home, path: "/home" },
    { id: "facturas", label: "Facturas", icon: FileText, path: "/facturas" },
    { id: "seguimiento", label: "Seguimiento", icon: PackageSearch, path: "/seguimiento" },
    { id: "perfil", label: "Perfil", icon: User, path: "/perfil" },
  ];

  return (
    <div
      className="
        md:hidden fixed -bottom-1 left-0 right-0
        bg-white dark:bg-[#01060c]
        border-t border-gray-200 dark:border-[#01060c]
        shadow-lg flex justify-around py-2 sm:py-3 z-50
        transition-colors duration-300
      "
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = location.pathname === tab.path;

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`
              flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all duration-200
              ${
                active
                  ? "text-orange-500 dark:text-pink-500 bg-rose-50 dark:bg-[#01060c] shadow-inner"
                  : "text-gray-500 dark:text-gray-400 hover:text-[#b71f4b] dark:hover:text-[#f2af1e]"
              }
            `}
          >
            <Icon
              size={22}
              className={`mb-1 transition-colors duration-300 ${
                active
                  ? "text-orange-500 dark:text-pink-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
