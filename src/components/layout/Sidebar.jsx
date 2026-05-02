import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, Wallet, Settings, LogOut, ChevronDown, User
} from "lucide-react";
import { useState } from "react";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/cotisations", label: "Cotisations", icon: Wallet },
];

const settingsLinks = [
  { to: "/admin/settings/general", label: "Paramètres Généraux" },
  { to: "/admin/settings/users", label: "Utilisateurs" },
  { to: "/admin/settings/archives", label: "Archives" },
  { to: "/admin/settings/bloques", label: "Membres Bloqués" },
];

const membreLinks = [
  { to: "/membre/cotisations", label: "Cotisations", icon: Wallet },
  { to: "/membre/profil", label: "Mon Profil", icon: User },
];

export default function Sidebar({ onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-[#22c55e] text-white"
      : "text-gray-300 hover:bg-white/10 hover:text-white"
  }`;
  const isAdmin = user?.role === "admin";

  return (
    <aside className="flex flex-col h-full bg-[#0f2137] w-64 p-4">
      <div className="bg-[#22c55e] rounded-lg p-2">
        <div className="bg-primary rounded-lg p-2">
          <Wallet className="text-white w-5 h-5" />
        </div>
        <span className="text-white font-bold text-lg">Bakéli Tontine</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {isAdmin ? (
          <>
            {adminLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}

            {/* Paramètres accordion */}
            <div>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center justify-between w-full px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg text-sm font-medium transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  Paramètres
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${settingsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {settingsOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {settingsLinks.map(({ to, label }) => (
                    <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // ✅ Liens membre
          membreLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))
        )}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-white/10 rounded-lg text-sm transition-colors mt-4"
      >
        <LogOut className="w-5 h-5" />
        Déconnexion
      </button>
    </aside>
  );
}