import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle, XCircle, Eye, X } from "lucide-react";

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function MesCotisations() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ cotisations: [], totalCotise: 0, montantRestant: 0 });
  const [caisse, setCaisse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ montant: "", mois: "" });
  const [preuve, setPreuve] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("manuel");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    try {
      const [cotisRes, caisseRes] = await Promise.all([
        api.get("/cotisations/my"),
        api.get("/caisse"),
      ]);
      setData(cotisRes.data);
      setCaisse(caisseRes.data);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setAlert({ type: "success", message: "Paiement confirmé ! Votre cotisation a été enregistrée." });
      fetchData();
    } else if (payment === "cancel" || payment === "error") {
      setAlert({ type: "error", message: "Paiement annulé ou échoué. Veuillez réessayer." });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!form.mois) return setAlert({ type: "error", message: "Veuillez sélectionner un mois." });
    if (!form.montant || Number(form.montant) <= 0) return setAlert({ type: "error", message: "Veuillez entrer un montant valide." });

    setSubmitting(true);
    setAlert(null);

    try {
      if (paymentMethod === "stripe") {
        const { data: stripeData } = await api.post("/payments/stripe/create-checkout-session", {
          montant: Number(form.montant),
          mois: form.mois,
        });
        window.location.href = stripeData.checkoutUrl;
        return;
      }

      if (paymentMethod === "wave") {
        const { data: waveData } = await api.post("/payments/wave/create-checkout-session", {
          montant: Number(form.montant),
          mois: form.mois,
        });
        window.location.href = waveData.checkoutUrl;
        return;
      }

      // ✅ Manuel — FormData pour upload fichier
      const formData = new FormData();
      formData.append("montant", form.montant);
      formData.append("mois", form.mois);
      if (preuve) formData.append("preuve", preuve);

      await api.post("/cotisations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAlert({ type: "success", message: "Cotisation soumise avec succès ! En attente de validation." });
      setShowForm(false);
      setForm({ montant: "", mois: "" });
      setPreuve(null);
      setPaymentMethod("manuel");
      fetchData(); // ✅ Recharger les données
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Erreur lors de la soumission." });
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercent = caisse?.seuil
    ? Math.min(Math.round((caisse.totalCotise / caisse.seuil) * 100), 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Alertes */}
      {alert && (
        <div className={`rounded-lg p-3 text-sm flex items-center justify-between gap-2 ${
          alert.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-600"
        }`}>
          <div className="flex items-center gap-2">
            {alert.type === "success"
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <XCircle className="w-4 h-4 shrink-0" />}
            {alert.message}
          </div>
          <button onClick={() => setAlert(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-36">
          <p className="text-gray-500 font-medium text-sm">Total Cotisé</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            {data.totalCotise?.toLocaleString("fr") || "0"} FCFA
          </h2>
          <p className="text-xs text-gray-400">
            Cotisations validées : {data.cotisations?.filter((c) => c.statut === "valide").length || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-36">
          <p className="text-gray-500 font-medium text-sm">Montant Restant</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            {data.montantRestant?.toLocaleString("fr") || "0"} FCFA
          </h2>
          <p className="text-xs text-gray-400">
            Cotisations restantes : {Math.ceil((data.montantRestant || 0) / 25000)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-medium text-sm">Caisse</p>
            <div className="p-1.5 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800">
              {caisse?.totalCotise?.toLocaleString("fr") || "0"} FCFA
            </span>
            <span className="text-sm font-bold text-gray-400">
              {" / "}{caisse?.seuil?.toLocaleString("fr") || "0"} FCFA
            </span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bouton Je Cotise */}
      <div className="flex justify-end">
        <button
          onClick={() => { setShowForm(!showForm); setAlert(null); }}
          className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-700 transition shadow-sm"
        >
          {showForm ? "Annuler" : "Je cotise"}
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-slate-800 mb-4 text-base">Nouvelle cotisation</h3>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Méthode de paiement */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                Méthode de paiement
              </label>
              <div className="flex gap-3">
                {["manuel", "stripe", "wave"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                      paymentMethod === m
                        ? "bg-slate-800 text-white border-slate-800"
                        : "border-gray-200 text-slate-600 hover:bg-gray-50"
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mois */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Mois</label>
              <select
                value={form.mois}
                onChange={(e) => setForm({ ...form, mois: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Sélectionner un mois</option>
                {MOIS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Montant */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Montant (FCFA)</label>
              <input
                type="number"
                value={form.montant}
                onChange={(e) => setForm({ ...form, montant: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Ex: 25000"
                min="1"
                required
              />
            </div>

            {/* Preuve — manuel uniquement */}
            {paymentMethod === "manuel" && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Preuve de paiement <span className="text-gray-400">(optionnel)</span>
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setPreuve(e.target.files[0])}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
                />
                {preuve && (
                  <p className="text-xs text-emerald-600 mt-1">✅ {preuve.name}</p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition disabled:opacity-60"
              >
                {submitting ? "Envoi en cours..." : "Soumettre la cotisation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des cotisations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#10B981] text-white">
                <th className="px-6 py-3 font-semibold">Mois</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Montant</th>
                <th className="px-6 py-3 font-semibold">Statut</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Chargement...</td></tr>
              ) : data.cotisations.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Aucune cotisation enregistrée</td></tr>
              ) : data.cotisations.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50/60 transition duration-150">
                  <td className="px-6 py-3.5 font-medium">{c.mois}</td>
                  <td className="px-6 py-3.5 text-gray-500">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr") : "—"}
                  </td>
                  <td className="px-6 py-3.5 font-semibold">
                    {c.montant?.toLocaleString("fr")} FCFA
                  </td>
                  <td className="px-6 py-3.5">
                    {c.statut === "valide" ? (
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-semibold">Validé</span>
                    ) : c.statut === "rejete" ? (
                      <span className="bg-red-50 text-red-500 px-2 py-1 rounded-full text-xs font-semibold">Rejeté</span>
                    ) : (
                      <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full text-xs font-semibold">En attente</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <button className="text-slate-700 hover:text-emerald-500 transition duration-150">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}