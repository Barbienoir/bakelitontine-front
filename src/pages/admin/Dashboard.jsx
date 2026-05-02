import { useEffect, useState } from "react";
import api from "../../utils/api";
import StatCard from "../../components/ui/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import Badge from "../../components/ui/Badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [caisse, setCaisse] = useState(null);
  const [stats, setStats] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/caisse"),
      api.get("/cotisations/monthly-stats"),
      api.get("/cotisations?limit=6"),
      api.get("/users?limit=6"),
    ])
      .then(([caisseRes, statsRes, cotisRes, usersRes]) => {
        setCaisse(caisseRes.data);
        // ✅ monthly-stats retourne { monthly, byStatut }
        setStats(statsRes.data?.monthly || statsRes.data || []);
        setCotisations(cotisRes.data?.cotisations || []);
        setTopUsers(usersRes.data?.users || []);
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
        setError("Erreur lors du chargement du dashboard.");
      })
      .finally(() => setLoading(false));
  }, []);

  const currentMonth = new Date().toLocaleString("fr", { month: "long" });
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toLocaleString("fr", { month: "long" });

  const getCurrentMonthTotal = (mois) =>
    stats.find((s) => s._id?.toLowerCase() === mois.toLowerCase())?.total || 0;

  const getCurrentMonthCount = (mois) =>
    stats.find((s) => s._id?.toLowerCase() === mois.toLowerCase())?.count || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-[#0f2137]">Admin Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
          value={`${getCurrentMonthTotal(currentMonth).toLocaleString("fr")} FCFA`}
          subtitle={`Nombre de cotisations: ${getCurrentMonthCount(currentMonth)}`}
        />
        <StatCard
          title={lastMonth.charAt(0).toUpperCase() + lastMonth.slice(1)}
          value={`${getCurrentMonthTotal(lastMonth).toLocaleString("fr")} FCFA`}
          subtitle={`Nombre de cotisations: ${getCurrentMonthCount(lastMonth)}`}
        />
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-3 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Caisse</p>
              <p className="font-bold text-[#0f2137] text-sm">
                <span className="text-[#22c55e]">
                  {caisse?.totalCotise?.toLocaleString("fr") || "0"} FCFA
                </span>{" "}
                / {caisse?.seuil?.toLocaleString("fr") || "0"} FCFA
              </p>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar value={caisse?.totalCotise || 0} max={caisse?.seuil || 5000000} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-[#0f2137] mb-4 text-sm md:text-base">
            Évolution des cotisations en fonction du temps
          </h2>
          {stats.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v.toLocaleString("fr")} FCFA`, "Total"]} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#22c55e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-[#0f2137] mb-4 text-sm">Statistiques</h2>
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            Graphique en camembert
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cotisations */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 font-semibold text-[#0f2137] capitalize">{currentMonth}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#22c55e] text-white">
                  <th className="text-left px-4 py-2">Membres</th>
                  <th className="text-left px-4 py-2">Montant</th>
                  <th className="text-left px-4 py-2 hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {cotisations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">
                      Aucune cotisation
                    </td>
                  </tr>
                ) : (
                  cotisations.map((c) => (
                    <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {c.userId?.prenom || "—"} {c.userId?.nom || ""}
                      </td>
                      <td className="px-4 py-3">
                        {c.montant?.toLocaleString("fr") || "0"} FCFA
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                        {/* ✅ createdAt au lieu de date */}
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={c.statut} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top progression */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 font-semibold text-[#0f2137]">Top progression</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#22c55e] text-white">
                  <th className="text-left px-4 py-2">Membres</th>
                  <th className="text-left px-4 py-2 hidden sm:table-cell">Date début</th>
                  <th className="text-left px-4 py-2">Progression</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-gray-400">
                      Aucun membre
                    </td>
                  </tr>
                ) : (
                  topUsers.map((u) => (
                    <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{u.prenom} {u.nom}</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                        {/* ✅ createdAt au lieu de dateDebut */}
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr") : "—"}
                      </td>
                      <td className="px-4 py-3 min-w-[120px]">
                        <ProgressBar value={u.totalCotise || 0} max={u.seuil || 1} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}