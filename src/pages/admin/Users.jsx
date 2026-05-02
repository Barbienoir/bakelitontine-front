import { useEffect, useState } from "react";
import api from "../../utils/api";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import StatCard from "../../components/ui/StatCard";
import { Eye, Archive, Ban, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // États pour la Modal et le formulaire d'ajout
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    profession: "",
    email: "",
    telephone: "",
    adresse: "",
    organisation: "",
    seuil: 300000 // Valeur par défaut comme sur la maquette
  });

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get(`/users?page=${page}&limit=8`),
        api.get("/users/stats"),
      ]);
      setUsers(usersRes.data.users);
      setPages(usersRes.data.pages);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleStatut = async (id, statut) => {
    try {
      await api.patch(`/users/${id}/statut`, { statut });
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors du changement de statut", error);
    }
  };

  // Gestion des champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Soumission du formulaire
 const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  // 1. Préparation et nettoyage des données pour le backend
  const payload = {
    nom: formData.nom.trim(),
    prenom: formData.prenom.trim(),
    email: formData.email.trim().toLowerCase(),
    telephone: formData.telephone.trim(),
    adresse: formData.adresse ? formData.adresse.trim() : "",
    profession: formData.profession ? formData.profession.trim() : "",
    organisation: formData.organisation ? formData.organisation.trim() : "",
    // Assurez-vous d'envoyer la date ou undefined si elle est vide
    dateNaissance: formData.dateNaissance ? new Date(formData.dateNaissance).toISOString() : undefined,
    // Forcer le format Nombre pour le seuil
    seuil: Number(formData.seuil) || 300000,
    // Ajouter les valeurs par défaut si votre backend ne le fait pas automatiquement
    statut: "en_cours",
    dateDebut: new Date().toISOString()
  };

  try {
    // Envoi de l'objet nettoyé
    await api.post("/users", payload);
    
    // Réinitialisation du formulaire en cas de succès
    setFormData({
      nom: "",
      prenom: "",
      dateNaissance: "",
      profession: "",
      email: "",
      telephone: "",
      adresse: "",
      organisation: "",
      seuil: 300000
    });
    setIsModalOpen(false);
    fetchUsers();
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur", error);
    
    // Afficher le message exact du backend pour comprendre le problème
    const errorMessage = error.response?.data?.message || "Une erreur est survenue côté serveur.";
    alert(`Erreur : ${errorMessage}`);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-dark">Utilisateurs</h1>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Membres Actifs" value={`${stats.actifs || 0} Membres`} highlight />
        <StatCard title="Membres Bloqués" value={`${stats.bloques || 0} Membres`} />
        <StatCard title="Total Effectif" value={`${stats.total || 0} Membres`} />
      </div>

      {/* Bouton d'action */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#0E383C] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#22C55E] text-white">
                <th className="text-left px-4 py-3">Membres</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Date début</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Seuil</th>
                <th className="text-left px-4 py-3">Progression</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted">Chargement...</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.prenom} {u.nom}</td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">
                    {u.dateDebut ? new Date(u.dateDebut).toLocaleDateString("fr") : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted hidden lg:table-cell">
                    {u.seuil?.toLocaleString("fr")} FCFA
                  </td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <ProgressBar value={u.totalCotise || 0} max={u.seuil} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={u.statut} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/users/${u._id}`)}
                        className="text-muted hover:text-dark transition"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatut(u._id, "archive")}
                        className="text-muted hover:text-primary transition"
                        title="Archiver"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatut(u._id, u.statut === "bloque" ? "en_cours" : "bloque")}
                        className="text-muted hover:text-red-500 transition"
                        title="Bloquer/Débloquer"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="text-sm text-muted hover:text-dark disabled:opacity-40 px-2"
          >
            Previous page
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm font-semibold ${
                p === page ? "bg-[#22C55E] text-white" : "text-muted hover:text-dark"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pages))}
            disabled={page === pages}
            className="text-sm text-muted hover:text-dark disabled:opacity-40 px-2"
          >
            Next page
          </button>
        </div>
      </div>

      {/* MODAL AJOUTER UN MEMBRE (Conforme à votre maquette Figma) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative animate-fadeIn">
            
            {/* Bouton de fermeture en haut à droite */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-[#0E383C] text-center mb-6">
              Ajouter un membre
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  />
                </div>

                {/* Prénom */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    required
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  />
                </div>

                {/* Date de naissance */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date de naissance</label>
                  <input
                    type="date"
                    name="dateNaissance"
                    required
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  />
                </div>

                {/* Profession */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Profession</label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    required
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  />
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  />
                </div>

                {/* Organisation */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Organisation</label>
                  <input
                    type="text"
                    name="organisation"
                    value={formData.organisation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bouton de soumission */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#22C55E] text-white font-bold px-12 py-3 rounded-lg text-sm hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}