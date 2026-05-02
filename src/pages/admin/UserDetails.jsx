import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import { ArrowLeft, Archive, Ban, ShieldCheck } from "lucide-react";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const [userRes, cotisRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/cotisations?userId=${id}&limit=20`),
      ]);
      setUser(userRes.data);
      setCotisations(cotisRes.data.cotisations || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleStatut = async (statut) => {
    await api.patch(`/users/${id}/statut`, { statut });
    fetchUser();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="text-center py-16 text-muted">Utilisateur introuvable</div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted hover:text-dark transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-dark">Détail du membre</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profil */}
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-gray-100">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                {user.prenom?.[0]}{user.nom?.[0]}
              </div>
            )}
          </div>
          <h2 className="font-bold text-dark text-lg">{user.prenom} {user.nom}</h2>
          <Badge status={user.statut} />

          <div className="mt-4 space-y-2">
            {user.statut !== "archive" && (
              <button
                onClick={() => handleStatut("archive")}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-muted py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                <Archive className="w-4 h-4" /> Archiver
              </button>
            )}
            {user.statut === "archive" && (
              <button
                onClick={() => handleStatut("en_cours")}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg text-sm hover:bg-green-600 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Restaurer
              </button>
            )}
            {user.statut !== "bloque" ? (
              <button
                onClick={() => handleStatut("bloque")}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 py-2 rounded-lg text-sm hover:bg-red-100 transition"
              >
                <Ban className="w-4 h-4" /> Bloquer
              </button>
            ) : (
              <button
                onClick={() => handleStatut("en_cours")}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg text-sm hover:bg-green-600 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Débloquer
              </button>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-dark mb-4 pb-2 border-b border-gray-100">
              Informations générales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: "Prénom", value: user.prenom },
                { label: "Nom", value: user.nom },
                { label: "Email", value: user.email },
                { label: "Téléphone", value: user.telephone || "—" },
                { label: "Profession", value: user.profession || "—" },
                { label: "Organisation", value: user.organisation || "—" },
                { label: "Adresse", value: user.adresse || "—" },
                { label: "Date de naissance", value: user.dateNaissance ? new Date(user.dateNaissance).toLocaleDateString("fr") : "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-muted text-xs">{label}</p>
                  <p className="font-medium text-dark mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progression */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-dark mb-4 pb-2 border-b border-gray-100">
              Progression
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4 text-center text-sm">
              <div>
                <p className="text-muted text-xs">Total cotisé</p>
                <p className="font-bold text-dark">{user.totalCotise?.toLocaleString("fr")} FCFA</p>
              </div>
              <div>
                <p className="text-muted text-xs">Seuil</p>
                <p className="font-bold text-dark">{user.seuil?.toLocaleString("fr")} FCFA</p>
              </div>
              <div>
                <p className="text-muted text-xs">Cotisations</p>
                <p className="font-bold text-primary">{user.nombreCotisations}</p>
              </div>
            </div>
            <ProgressBar value={user.totalCotise || 0} max={user.seuil} />
          </div>

          {/* Cotisations */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-dark text-sm">Historique des cotisations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="text-left px-4 py-2">Mois</th>
                    <th className="text-left px-4 py-2">Montant</th>
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-left px-4 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {cotisations.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-6 text-muted">Aucune cotisation</td></tr>
                  ) : cotisations.map((c) => (
                    <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">{c.mois}</td>
                      <td className="px-4 py-3">{c.montant?.toLocaleString("fr")} FCFA</td>
                      <td className="px-4 py-3 text-muted">{new Date(c.date).toLocaleDateString("fr")}</td>
                      <td className="px-4 py-3"><Badge status={c.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
