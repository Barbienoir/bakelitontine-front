import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = {
  valide: "#22c55e",
  en_attente: "#0f2137",
  rejete: "#f9a8d4",
  en_cours: "#fde68a",
};

const LABELS = {
  valide: "Terminé",
  en_attente: "En cours",
  rejete: "Archivé",
  en_cours: "Bloqué",
};

export default function StatusDoughnutChart({ byStatut = [] }) {
  const data = {
    labels: byStatut.map((s) => LABELS[s._id] || s._id),
    datasets: [
      {
        data: byStatut.map((s) => s.count),
        backgroundColor: byStatut.map((s) => COLORS[s._id] || "#ccc"),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 11 }, padding: 12 },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}
