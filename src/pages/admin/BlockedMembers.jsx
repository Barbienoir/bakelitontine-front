import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Eye, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BlockedMembers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBlocked = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/bloques?page=${page}&limit=8`);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlocked(); }, [page]);

  const handleUnblock = async (id) => {
    await api.patch(`/users/${id}/statut`, { statut: "en_cours" });
    fetchBlocked();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-dark">Membres Bloqués</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="font-semibold text-dark">{total} Membres Bloqués</p>
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
                <tr><td colSpan={3} className="text-center py-8 text-muted">Aucun membre bloqué</td></tr>
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
                        onClick={() => handleUnblock(u._id)}
                        className="text-muted hover:text-primary transition"
                        title="Débloquer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
