import {
  Home,
  FileText,
  Package,
  Activity,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/icon/mini_target.webp";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { id: "home", icon: Home, path: "/home" },
    { id: "facturas", icon: FileText, path: "/facturas" },
    { id: "seguimiento", icon: Package, path: "/seguimiento" },
    // { id: "analytics", icon: Activity, path: "/analytics" },
  ];

  const bottomItems = [
    { id: "perfil", icon: User, path: "/perfil" },
  ];

  return (
    <aside className="
      hidden md:flex flex-col justify-between items-center
      w-20 h-screen fixed left-0 top-0
      bg-white dark:bg-[#01060c]
      border-r border-gray-200 dark:border-[#01060c]
      shadow-md py-6 transition-colors duration-300
    ">
      {/* 🔹 Logo */}
      <div className="flex flex-col items-center">
        <img
          src={logo}
          alt="Logo"
          className="w-10 h-10 mb-4 brightness-100 dark:brightness-90 transition-all"
        />
      </div>

      {/* 🔹 Navegación principal */}
      <div className="flex flex-col items-center gap-5 mt-6">
        {items.map(({ id, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`
                p-3 rounded-xl transition-all duration-200
                ${active
                  ? "cursor-pointer bg-linear-to-br from-[#b71f4b] to-[#ff4b2b] dark:from-[#d30046] dark:via-[#db2fb2] dark:to-pink-500 text-white dark:text-gray-900 shadow-lg"
                  : "text-gray-500 dark:text-gray-400 hover:text-[#b71f4b] dark:hover:text-white cursor-pointer"
                }
              `}
            >
              <Icon size={22} />
            </button>
          );
        })}
      </div>

      {/* 🔹 Navegación inferior */}
      <div className="flex flex-col items-center gap-5 mb-4">
        {bottomItems.map(({ id, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`
                p-3 rounded-xl  duration-200 cursor-pointer
                ${active
                  ? "cursor-pointer bg-linear-to-br from-[#b71f4b] to-[#ff4b2b] dark:from-[#d30046] dark:via-[#db2fb2] dark:to-pink-500 text-white dark:text-gray-900 shadow-lg"
                  : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#b71f4b] dark:hover:border-[#f2af1e] hover:text-[#d30046] dark:hover:text-white"
                }
              `}
            >
              <Icon size={22} />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
