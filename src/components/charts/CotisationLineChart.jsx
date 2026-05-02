import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

export default function CotisationLineChart({ stats = [] }) {
  const data = {
    labels: stats.map((s) => s._id),
    datasets: [
      {
        label: "Cotisations (FCFA)",
        data: stats.map((s) => s.total),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#22c55e",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw.toLocaleString("fr")} FCFA`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (v) => `${(v / 1000).toFixed(0)}k`,
          font: { size: 11 },
        },
        grid: { color: "#f0f0f0" },
      },
      x: {
        ticks: { font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return <Line data={data} options={options} />;
}
