import { useAuth } from "../../context/AuthContext";
import { Bell, Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between">
      <button onClick={onMenuClick} className="md:hidden text-dark">
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1 md:flex-none" />

      <div className="flex items-center gap-3">
        <button className="relative text-dark">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            0
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
            )}
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-dark">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-muted capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
