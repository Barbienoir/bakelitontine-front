import { useEffect, useState } from "react";
import { Edit2, Save, X, LogOut, Lock } from "lucide-react";
import api from "../../utils/api";

export default function Setting() {
  const [activeTab, setActiveTab] = useState("general");
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminRes, statsRes] = await Promise.all([
          api.get("/admin/profile"),
          api.get("/admin/stats"),
        ]);
        setAdmin(adminRes.data);
        setFormData(adminRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await api.patch("/admin/profile", {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
      });
      setAdmin(formData);
      setEditMode(false);
      alert("Profil mis à jour avec succès");
    } catch (err) {
      alert("Erreur lors de la mise à jour: " + err.message);
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = prompt("Entrez votre mot de passe actuel:");
    if (!currentPassword) return;

    const newPassword = prompt("Entrez votre nouveau mot de passe:");
    if (!newPassword) return;

    const confirmPassword = prompt("Confirmez votre nouveau mot de passe:");
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await api.patch("/admin/password", {
        currentPassword,
        newPassword,
      });
      alert("Mot de passe modifié avec succès");
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-[#0f2137]">Paramètres</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === "general"
              ? "border-[#22c55e] text-[#22c55e]"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          Paramètres Généraux
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === "users"
              ? "border-[#22c55e] text-[#22c55e]"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab("archives")}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === "archives"
              ? "border-[#22c55e] text-[#22c55e]"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          Archives
        </button>
        <button
          onClick={() => setActiveTab("bloques")}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === "bloques"
              ? "border-[#22c55e] text-[#22c55e]"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          Bloqués
        </button>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-[#22c55e]/10">
              {admin?.avatar ? (
                <img
                  src={admin.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#22c55e] flex items-center justify-center text-white text-3xl font-bold">
                  {admin?.prenom?.[0]}{admin?.nom?.[0]}
                </div>
              )}
            </div>
            <h2 className="font-bold text-[#0f2137] text-lg">
              {admin?.prenom} {admin?.nom}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{admin?.statut || "Administrateur"}</p>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className="w-full flex items-center justify-center gap-2 bg-[#22c55e] text-white py-2 rounded-lg text-sm hover:bg-green-600 transition"
              >
                <Edit2 className="w-4 h-4" />
                {editMode ? "Annuler" : "Modifier profil"}
              </button>
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                <Lock className="w-4 h-4" />
                Modifier mot de passe
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 py-2 rounded-lg text-sm hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Edit Form or Info */}
          {editMode ? (
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#0f2137] mb-4">Modifier les informations</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.prenom || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.nom || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="flex-1 px-4 py-2 bg-[#22c55e] text-white rounded-lg text-sm font-medium hover:bg-green-600"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 space-y-4">
              {/* General Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#0f2137] mb-4 pb-2 border-b border-gray-100">
                  Informations Générales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Prénom</p>
                    <p className="font-medium text-[#0f2137] mt-1">{admin?.prenom}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Nom</p>
                    <p className="font-medium text-[#0f2137] mt-1">{admin?.nom}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="font-medium text-[#0f2137] mt-1">{admin?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Statut</p>
                    <p className="font-medium text-[#0f2137] mt-1">
                      {admin?.statut || "Administrateur"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#0f2137] mb-4 pb-2 border-b border-gray-100">
                  Statistiques
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Nombre de membres ajoutés</p>
                    <p className="font-bold text-[#22c55e] mt-1">{stats.totalUsers || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Nombre de membres archivés</p>
                    <p className="font-bold text-[#0f2137] mt-1">{stats.archivedUsers || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Nombre de membres bloqués</p>
                    <p className="font-bold text-red-500 mt-1">{stats.blockedUsers || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Total de cotisations</p>
                    <p className="font-bold text-[#0f2137] mt-1">{stats.totalCotisations || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Management */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#0f2137] mb-4">
            {stats.totalUsers || 0} Utilisateurs actifs
          </h3>
          <p className="text-sm text-gray-500">
            Gestion centralisée des utilisateurs via la page Utilisateurs
          </p>
        </div>
      )}

      {/* Archives */}
      {activeTab === "archives" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#0f2137] mb-4">
            {stats.archivedUsers || 0} Utilisateurs archivés
          </h3>
          <p className="text-sm text-gray-500">
            Gestion centralisée des archives via la page Paramètres
          </p>
        </div>
      )}

      {/* Blocked Members */}
      {activeTab === "bloques" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#0f2137] mb-4">
            {stats.blockedUsers || 0} Utilisateurs bloqués
          </h3>
          <p className="text-sm text-gray-500">
            Gestion centralisée des utilisateurs bloqués via la page Paramètres
          </p>
        </div>
      )}
    </div>
  );
}