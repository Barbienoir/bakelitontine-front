const variants = {
  valide: "bg-green-100 text-green-700",
  en_attente: "bg-yellow-100 text-yellow-700",
  rejete: "bg-red-100 text-red-700",
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-green-100 text-green-700",
  archive: "bg-pink-100 text-pink-700",
  bloque: "bg-orange-100 text-orange-700",
};

const labels = {
  valide: "Validé",
  en_attente: "En attente",
  rejete: "Rejeté",
  en_cours: "En cours",
  termine: "Terminé",
  archive: "Archivé",
  bloque: "Bloqué",
};

export default function Badge({ status }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${variants[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status}
    </span>
  );
}
