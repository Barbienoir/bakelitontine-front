import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { Camera } from "lucide-react";

export default function Profile() {
  const { user, setUser } = useAuth();
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState("informations");
  const [stats, setStats] = useState({ effectuees: 0, restantes: 0 });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/cotisations/my").then((res) => {
      const cotisations = res.data.cotisations || [];
      setStats({
        effectuees: cotisations.filter((c) => c.statut === "valide").length,
        restantes: Math.ceil((res.data.montantRestant || 0) / 25000),
      });
    }).catch(() => {});
  }, []);

  

  // ✅ Upload photo via PUT /:id
  const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setUploading(true);
  setError("");
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("prenom", user.prenom);
    formData.append("nom", user.nom);
    formData.append("email", user.email);

    const { data } = await api.put(`/users/${user._id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // ✅ Correction ici
    setUser((prev) => ({ ...prev, avatar: data.user.avatar }));
  } catch (err) {
    console.error("Upload error:", err.response?.data); // ✅ Voir l'erreur exacte
    setError(err.response?.data?.message || "Erreur lors de l'upload.");
  } finally {
    setUploading(false);
  }
};
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm)
      return setError("Les mots de passe ne correspondent pas.");
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await api.put(`/users/${user?._id}`, {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setSuccess(true);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Informations</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* ── Colonne gauche ── */}
        <div className="md:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit flex flex-col items-center">
          <p className="text-gray-400 font-medium text-xs mb-4 w-full text-left">Profil</p>

          {/* Avatar + bouton caméra */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-bold text-2xl">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </div>
              )}
            </div>

            {/* Bouton caméra */}
            <button
              onClick={() => fileRef.current.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-full shadow transition disabled:opacity-60"
            >
              {uploading
                ? <span className="w-3.5 h-3.5 block border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera className="w-3.5 h-3.5" />
              }
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <h2 className="text-xl font-extrabold text-slate-800">{user?.prenom} {user?.nom}</h2>
          <p className="text-sm font-medium text-slate-400 capitalize mb-4">
            {user?.role === "admin" ? "Administrateur" : "Membre"}
          </p>

          {/* Onglets */}
          <div className="w-full border-t border-gray-100 pt-4 flex flex-col gap-1">
            {[
              { key: "informations", label: "Informations" },
              { key: "password", label: "Changer mot de passe" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setError(""); setSuccess(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === key
                    ? "bg-emerald-400 text-white"
                    : "text-slate-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Colonne droite ── */}
        <div className="md:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">

          {/* Alerts */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm font-medium">
              ✅ Mot de passe mis à jour avec succès.
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm font-medium">
              ❌ {error}
            </div>
          )}

          {/* Onglet Informations */}
          {activeTab === "informations" && (
            <div>
              <h3 className="bg-[#10B981] text-white px-4 py-2 rounded-t-lg font-bold text-sm">
                Informations Générales
              </h3>
              <div className="border border-gray-100 border-t-0 p-4 divide-y divide-gray-100">
                {[
                  { label: "Prénom",    value: user?.prenom },
                  { label: "Nom",       value: user?.nom },
                  { label: "Téléphone", value: user?.telephone || "—" },
                  { label: "Statut",    value: user?.role === "admin" ? "Administrateur" : "Membre" },
                  { label: "E-mail",    value: user?.email },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 text-sm font-medium">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-800">{value}</span>
                  </div>
                ))}
              </div>

              <h3 className="bg-[#10B981] text-white px-4 py-2 rounded-t-lg font-bold text-sm mt-6">
                Statistiques
              </h3>
              <div className="border border-gray-100 border-t-0 p-4 divide-y divide-gray-100">
                {[
                  { label: "Cotisations effectuées", value: stats.effectuees },
                  { label: "Cotisations restantes",  value: stats.restantes },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 text-sm font-medium">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-800 font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Mot de passe */}
          {activeTab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="text-slate-800 font-bold text-base mb-4">
                Modifier votre mot de passe
              </h3>
              {[
                { label: "Mot de passe actuel",            key: "current" },
                { label: "Nouveau mot de passe",           key: "new" },
                { label: "Confirmer le nouveau mot de passe", key: "confirm" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                  <input
                    type="password"
                    value={passwords[key]}
                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition disabled:opacity-60"
                >
                  {loading ? "En cours..." : "Mettre à jour"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}