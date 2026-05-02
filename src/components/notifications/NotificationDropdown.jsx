import { useEffect, useState } from "react";
import api from "../../utils/api";
import Badge from "../../components/ui/Badge";
import { Eye, Plus, Trash2, Edit2, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Cotisations() {
  // ========== STATES ==========
  const [cotisations, setCotisations] = useState([]);
  const [stats, setStats] = useState({
    juinTotal: 0,
    juinCount: 0,
    maiTotal: 0,
    maiCount: 0,
    totalCaisse: 0,
    seuil: 5000000,
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCotisation, setSelectedCotisation] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    userId: "",
    montant: "",
    mois: new Date().toLocaleString("fr", { month: "long" }),
    date: new Date().toISOString().split("T")[0],
    statut: "valide",
  });

  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // ========== FETCH FUNCTIONS ==========
  const fetchCotisations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/cotisations?page=${page}&limit=8&search=${searchTerm}&statut=${
          filterStatus === "tous" ? "" : filterStatus
        }`
      );
      setCotisations(data.cotisations || []);
      setPages(data.pages || 1);

      // Fetch stats
      const statsRes = await api.get("/cotisations/stats");
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching cotisations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users?limit=50");
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchCotisations();
  }, [page, searchTerm, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // ========== HANDLERS ==========
  const handleAddClick = () => {
    setFormData({
      userId: "",
      montant: "",
      mois: new Date().toLocaleString("fr", { month: "long" }),
      date: new Date().toISOString().split("T")[0],
      statut: "valide",
    });
    setShowAddModal(true);
  };

  const handleEditClick = (cotisation) => {
    setSelectedCotisation(cotisation);
    setFormData({
      userId: cotisation.userId?._id || "",
      montant: cotisation.montant,
      mois: cotisation.mois,
      date: cotisation.date ? cotisation.date.split("T")[0] : "",
      statut: cotisation.statut,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (cotisation) => {
    setSelectedCotisation(cotisation);
    setShowDeleteModal(true);
  };

  const handleSaveAdd = async () => {
    if (!formData.userId || !formData.montant) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      await api.post("/cotisations", {
        userId: formData.userId,
        montant: parseInt(formData.montant),
        mois: formData.mois,
        date: formData.date,
        statut: formData.statut,
      });

      setShowAddModal(false);
      fetchCotisations();
      setFormData({
        userId: "",
        montant: "",
        mois: new Date().toLocaleString("fr", { month: "long" }),
        date: new Date().toISOString().split("T")[0],
        statut: "valide",
      });
    } catch (err) {
      alert("Erreur lors de l'ajout: " + err.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.userId || !formData.montant) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      await api.patch(`/cotisations/${selectedCotisation._id}`, {
        userId: formData.userId,
        montant: parseInt(formData.montant),
        mois: formData.mois,
        date: formData.date,
        statut: formData.statut,
      });

      setShowEditModal(false);
      fetchCotisations();
    } catch (err) {
      alert("Erreur lors de la modification: " + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/cotisations/${selectedCotisation._id}`);
      setShowDeleteModal(false);
      fetchCotisations();
    } catch (err) {
      alert("Erreur lors de la suppression: " + err.message);
    }
  };

  const progressPercentage = (stats.totalCaisse / stats.seuil) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-[#0f2137]">Cotisations</h1>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#22c55e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Juin */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Juin</p>
          <p className="text-2xl font-bold text-[#0f2137] mt-1">
            {stats.juinTotal?.toLocaleString("fr") || "0"} FCFA
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Nombre de cotisations: {stats.juinCount || 0}
          </p>
        </div>

        {/* Mai */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Mai</p>
          <p className="text-2xl font-bold text-[#0f2137] mt-1">
            {stats.maiTotal?.toLocaleString("fr") || "0"} FCFA
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Nombre de cotisations: {stats.maiCount || 0}
          </p>
        </div>

        {/* Total Caisse */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Caisse</p>
          <p className="text-2xl font-bold text-[#0f2137] mt-1">
            {stats.totalCaisse?.toLocaleString("fr") || "0"} FCFA
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#22c55e] h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {Math.min(progressPercentage, 100).toFixed(0)}% du seuil
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher un membre..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        >
          <option value="tous">Tous les statuts</option>
          <option value="valide">Validé</option>
          <option value="en_attente">En attente</option>
          <option value="archive">Archivé</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#22c55e] text-white">
                <th className="text-left px-4 py-3">Membres</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Date début</th>
                <th className="text-left px-4 py-3">Montant cotisé</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Montant restant</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-3 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : cotisations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Aucune cotisation
                  </td>
                </tr>
              ) : (
                cotisations.map((c) => (
                  <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {c.userId?.prenom || "—"} {c.userId?.nom || ""}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {c.date ? new Date(c.date).toLocaleDateString("fr") : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#0f2137]">
                      {c.montant?.toLocaleString("fr") || "0"} FCFA
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {c.montantRestant?.toLocaleString("fr") || "0"} FCFA
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={c.statut} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="text-gray-400 hover:text-[#22c55e] transition"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(c)}
                          className="text-gray-400 hover:text-red-500 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="text-sm text-gray-500 hover:text-[#0f2137] disabled:opacity-40 px-2"
          >
            Previous page
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm font-semibold ${
                p === page
                  ? "bg-[#22c55e] text-white"
                  : "text-gray-500 hover:text-[#0f2137]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pages))}
            disabled={page === pages}
            className="text-sm text-gray-500 hover:text-[#0f2137] disabled:opacity-40 px-2"
          >
            Next page
          </button>
        </div>
      </div>

      {/* ========== MODALS ========== */}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-[#0f2137]">Ajouter une cotisation</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-[#0f2137]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* User Select */}
              <div>
                <label className="block text-sm font-medium text-[#0f2137] mb-1">
                  Membre *
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                >
                  <option value="">Sélectionner un membre</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.prenom} {u.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-[#0f2137] mb-1">
                  Montant (FCFA) *
                </label>
                <input
                  type="number"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                  placeholder="Ex: 25000"
                />
              </div>

              {/* Mois */}
              <div>
                <label className="block text-sm font-medium text-[#0f2137] mb-1">
                  Mois
                </label>
                <input
                  type="text"
                  value={formData.mois}
                  onChange={(e) => setFormData({ ...formData, mois: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-[#0f2137] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                />
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-[#0f2137] mb-1">
                  Statut
                </label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                >
                  <option value="valide">Validé</option>
                  <option value="en_attente">En attente</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAdd}
                className="flex-1 px-4 py-2 bg-[#22c55e] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-[#0f2137]">Modifier la cotisation</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-[#0f2137]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* User Select */}
              <div>
                <label className="block text-sm font-medium text-[#0f2137] mb-1">
                  Membre *
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                >
                  <option value="">Sélectionner un membre</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.prenom} {u.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-[#0f2137] mb-1">
                  Montant (FCFA) *
                </label>
                <input
                  type="number"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                  placeholder="Ex: 25000"
                />
              </div>

              {/* Mois */}
              <div>
                <label className="block text-sm font-medium text-[#0f2137] mb-1">
                  Mois
                </label>
                <input
                  type="text"
                  value={formData.mois}
                  onChange={(e) => setFormData({ ...formData, mois: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-[#0f2137] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                />
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-[#0f2137] mb-1">
                  Statut
                </label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                >
                  <option value="valide">Validé</option>
                  <option value="en_attente">En attente</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-[#22c55e] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[#0f2137]">Confirmer la suppression</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Cette action est irréversible
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}