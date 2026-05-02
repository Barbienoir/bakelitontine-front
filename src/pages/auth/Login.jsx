import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.identifier, form.password);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/membre/cotisations");
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Gauche illustration */}
      <div className="hidden md:flex bg-[#0f2c3d] w-[45%] items-center justify-center relative overflow-hidden">
        <div
          className="absolute bottom-0 right-[-80px] w-[120%] h-[90%] bg-white"
          style={{ borderRadius: "140px 0 0 0" }}
        />
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="text-center px-12">
            {/* L'image d'illustration de la maquette Figma */}
            <img 
              src="/path-to-your-illustration.svg" 
              alt="Illustration" 
              className="max-w-xs object-contain"
            />
          </div>
        </div>
      </div>

      {/* Droite formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1D3D4E] mb-8 text-center md:text-left">
            Bienvenue sur Bakéli-tontine
          </h1>
          
          <div className="text-center md:text-left mb-6">
            <h2 className="text-3xl font-semibold text-[#1D3D4E] mb-3">
              Connectez-vous
            </h2>
            <p className="text-gray-600 text-base">
              Connectez-vous et gérez vos cotisations
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
            <input
            type="email"
            placeholder="Adresse e-mail"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            className="w-full bg-[#1D3D4E] text-white placeholder-gray-300 rounded-xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
            </div>

            <div>
              <input
                type="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#1D3D4E] text-white placeholder-gray-300 rounded-xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-[#1D3D4E] hover:underline transition">
                Mot de passe oublié?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2ECC71] text-white font-bold py-4 rounded-2xl hover:bg-emerald-500 transition disabled:opacity-60 text-lg shadow-sm"
            >
              {loading ? "Connexion..." : "Connexion"}
            </button>

            <p className="text-center text-base text-gray-700 pt-2">
              Vous n'avez pas de compte,{" "}
              <Link to="/register" className="text-[#1D3D4E] font-extrabold hover:underline transition">
                inscrivez-vous!
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}