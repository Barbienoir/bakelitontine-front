import { useEffect, useState } from "react";
import { Eye, Check, X, Plus } from "lucide-react";
import api from "../../utils/api.js";

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function Cotisations() {
  const [cotisations, setCotisations] = useState([]);
  const [caisse, setCaisse] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alert, setAlert] = useState(null);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const [cotisRes, caisseRes, statsRes] = await Promise.all([
        api.get(`/cotisations?page=${p}&limit=8`),
        api.get("/caisse"),
        api.get("/cotisations/monthly-stats"),
      ]);
      setCotisations(cotisRes.data.cotisations || []);
      setTotalPages(cotisRes.data.pages || 1);
      setCaisse(caisseRes.data);
      setStats(statsRes.data?.monthly || []);
    } catch (err) {
      setAlert({ type: "error", message: "Erreur lors du chargement." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  const handleValider = async (id) => {
    try {
      await api.patch(`/cotisations/${id}/valider`);
      setAlert({ type: "success", message: "Cotisation validée ✅" });
      fetchData(page);
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Erreur." });
    }
  };

  const handleRejeter = async (id) => {
    try {
      await api.patch(`/cotisations/${id}/rejeter`);
      setAlert({ type: "success", message: "Cotisation rejetée." });
      fetchData(page);
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Erreur." });
    }
  };

  const currentMonth = new Date().toLocaleString("fr", { month: "long" });
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toLocaleString("fr", { month: "long" });

  const getMonthTotal = (mois) =>
    stats.find((s) => s._id?.toLowerCase() === mois.toLowerCase())?.total || 0;

  const progressPercent = caisse?.seuil
    ? Math.min(Math.round((caisse.totalCotise / caisse.seuil) * 100), 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Cotisations</h1>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`rounded-lg p-3 text-sm flex items-center justify-between ${
          alert.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-600"
        }`}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats cards — comme le Figma */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mois courant */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium capitalize">{currentMonth}</p>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-1">
            {getMonthTotal(currentMonth).toLocaleString("fr")} FCFA
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Nombre de cotisations : {stats.find((s) => s._id?.toLowerCase() === currentMonth.toLowerCase())?.count || 0}
          </p>
        </div>

        {/* Mois précédent */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium capitalize">{lastMonth}</p>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-1">
            {getMonthTotal(lastMonth).toLocaleString("fr")} FCFA
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Nombre de cotisations : {stats.find((s) => s._id?.toLowerCase() === lastMonth.toLowerCase())?.count || 0}
          </p>
        </div>

        {/* Total Caisse */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm font-medium">Total Caisse</p>
            <div className="bg-green-50 p-1.5 rounded-lg">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-1">
            {caisse?.totalCotise?.toLocaleString("fr") || "0"} FCFA
          </h2>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{progressPercent}% du seuil</p>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#10B981] text-white">
                <th className="text-left px-6 py-3 font-semibold">Membres</th>
                <th className="text-left px-6 py-3 font-semibold">Date début</th>
                <th className="text-left px-6 py-3 font-semibold">Montant cotisé</th>
                <th className="text-left px-6 py-3 font-semibold">Montant restant</th>
                <th className="text-left px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Chargement...</td></tr>
              ) : cotisations.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Aucune cotisation</td></tr>
              ) : (
                cotisations.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                          {c.userId?.prenom?.[0]}{c.userId?.nom?.[0]}
                        </div>
                        {c.userId?.prenom} {c.userId?.nom}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr") : "—"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {c.montant?.toLocaleString("fr")} FCFA
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {/* Montant restant = seuil user - total cotisé */}
                      {c.userId?.seuil
                        ? `${Math.max(0, c.userId.seuil - c.montant).toLocaleString("fr")} FCFA`
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Voir */}
                        <button className="text-slate-500 hover:text-emerald-500 transition">
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* Valider */}
                        {c.statut === "en_attente" && (
                          <button
                            onClick={() => handleValider(c._id)}
                            className="text-emerald-500 hover:text-emerald-700 transition"
                            title="Valider"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}

                        {/* Rejeter */}
                        {c.statut === "en_attente" && (
                          <button
                            onClick={() => handleRejeter(c._id)}
                            className="text-red-400 hover:text-red-600 transition"
                            title="Rejeter"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}

                        {/* Badge statut */}
                        {c.statut === "valide" && (
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-semibold">
                            Validé
                          </span>
                        )}
                        {c.statut === "rejete" && (
                          <span className="bg-red-50 text-red-500 px-2 py-1 rounded-full text-xs font-semibold">
                            Rejeté
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm text-gray-500 hover:text-slate-800 disabled:opacity-40 px-3 py-1"
            >
              Previous page
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-full text-sm font-semibold transition ${
                  page === i + 1
                    ? "bg-[#10B981] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-sm text-gray-500 hover:text-slate-800 disabled:opacity-40 px-3 py-1"
            >
              Next page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}