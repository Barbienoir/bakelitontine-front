import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const fields = [
  { key: "nom", label: "Nom", type: "text" },
  { key: "prenom", label: "Prénom", type: "text" },
  { key: "dateNaissance", label: "Date de naissance", type: "date" },
  { key: "profession", label: "Profession", type: "text" },
  { key: "password", label: "Définir mot de passe", type: "password" },
  { key: "confirm", label: "Confirmer votre mot de passe", type: "password" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "telephone", label: "Téléphone", type: "tel" },
  { key: "adresse", label: "Adresse", type: "text" },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "", prenom: "", dateNaissance: "", profession: "",
    password: "", confirm: "", email: "", telephone: "",
    adresse: "", role: "user", // "user" est la valeur par défaut
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      return setError("Les mots de passe ne correspondent pas");
    }

    setLoading(true);

    try {
        
            await api.post("/auth/register", {
        nom: form.nom,
        prenom: form.prenom,
        dateNaissance: form.dateNaissance,
        profession: form.profession,
        password: form.password,
        email: form.email,
        telephone: form.telephone,
        adresse: form.adresse,
        role: form.role,
        });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription");
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
              src="/path-to-your-register-illustration.svg" 
              alt="Illustration Inscription" 
              className="max-w-xs object-contain"
            />
          </div>
        </div>
      </div>

      {/* Droite formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-2xl py-6">
          <h1 className="text-4xl font-bold text-[#1D3D4E] text-center mb-8">
            Inscription
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {/* Rendu des champs texte, date, email, etc. */}
              {fields.map(({ key, label, type }) => (
                <div key={key} className="flex flex-col">
                  <label className="block text-base font-semibold text-[#1D3D4E] mb-2">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white text-gray-800"
                    required={key !== "adresse" && key !== "profession"}
                  />
                </div>
              ))}

              {/* Champ "Rôle" sous forme de sélection déroulante */}
              <div className="flex flex-col">
                <label className="block text-base font-semibold text-[#1D3D4E] mb-2">
                  Rôle
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white text-gray-800"
                  required
                >
                  <option value="user">Utilisateur (User)</option>
                  <option value="admin">Administrateur (Admin)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2ECC71] text-white font-bold py-4 rounded-2xl hover:bg-emerald-500 transition disabled:opacity-60 text-lg shadow-sm"
              >
                {loading ? "Inscription..." : "S'inscrire"}
              </button>
            </div>

            <p className="text-center text-base text-gray-700">
              Vous avez déjà un compte,{" "}
              <Link to="/login" className="text-[#1D3D4E] font-extrabold hover:underline transition">
                Connectez-vous!
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}   