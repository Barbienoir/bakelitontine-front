import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Eye, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Archives() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/archives?page=${page}&limit=8`);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArchives(); }, [page]);

  const handleRestore = async (id) => {
    await api.patch(`/users/${id}/statut`, { statut: "en_cours" });
    fetchArchives();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-dark">Archives</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="font-semibold text-dark">{total} Membres Archivés</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left px-4 py-3">Membres</th>
                <th className="text-left px-4 py-3">Date début</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-8 text-muted">Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-muted">Aucun membre archivé</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.prenom} {u.nom}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(u.dateDebut).toLocaleDateString("fr")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/admin/users/${u._id}`)}
                        className="text-muted hover:text-dark transition"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestore(u._id)}
                        className="bg-primary text-white p-1.5 rounded hover:bg-green-600 transition"
                        title="Restaurer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
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
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}
            className="text-sm text-muted disabled:opacity-40 px-2 hover:text-dark">
            Previous page
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm font-semibold ${p === page ? "bg-primary text-white" : "text-muted hover:text-dark"}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(p + 1, pages))} disabled={page === pages}
            className="text-sm text-muted disabled:opacity-40 px-2 hover:text-dark">
            Next page
          </button>
        </div>
      </div>
    </div>
  );
}
