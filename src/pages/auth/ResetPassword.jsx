import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Mots de passe différents");
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Lien invalide ou expiré");
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
            {/* Icône de réinitialisation */}
            <div className="text-[120px]">🔐</div>
          </div>
        </div>
      </div>

      {/* Droite formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl p-10">
          <h1 className="text-3xl font-bold text-[#1D3D4E] mb-2">Nouveau mot de passe</h1>
          <p className="text-gray-600 text-base mb-8">Choisissez un mot de passe sécurisé.</p>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 text-base text-center font-medium shadow-sm">
              ✅ Mot de passe réinitialisé ! Redirection...
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-6 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-base font-semibold text-[#1D3D4E] mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white text-gray-800"
                    required 
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-[#1D3D4E] mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white text-gray-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2ECC71] text-white font-bold py-4 rounded-2xl hover:bg-emerald-500 transition disabled:opacity-60 text-lg shadow-sm mt-4"
                >
                  {loading ? "Réinitialisation..." : "Réinitialiser"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}