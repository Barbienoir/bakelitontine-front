import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { identifier });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
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
        <div className="w-full max-w-lg">
          {!success ? (
            <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl p-10">
              <h2 className="text-3xl font-bold text-[#1D3D4E] mb-3">
                Mot de passe oublié
              </h2>
              <p className="text-gray-600 text-base mb-8">
                Pour réinitialiser votre mot de passe entrez votre e-mail ou votre numéro de téléphone.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  placeholder="N° téléphone ou E-mail"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#1D3D4E] text-white placeholder-gray-300 rounded-xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#2ECC71] text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-emerald-500 transition disabled:opacity-60 text-lg shadow-sm"
                  >
                    {loading ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </form>

              <div className="border-t border-gray-100 mt-6 pt-6 text-center">
                <p className="text-base text-gray-700">
                  Vous n'avez pas de compte,{" "}
                  <Link to="/register" className="text-[#1D3D4E] font-extrabold hover:underline transition">
                    inscrivez-vous!
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-8 text-center shadow-sm">
              <div className="text-5xl mb-4">✅</div>
              <p className="font-bold text-xl mb-2">Instructions envoyées !</p>
              <p className="text-gray-600 text-sm mb-6">Vérifiez votre boîte e-mail ou vos messages.</p>
              <Link to="/login" className="text-[#1D3D4E] font-extrabold hover:underline text-base">
                Retour à la connexion
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}