import { Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

export default function DistanceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontSize: '2rem' }}>📊</p>
        <p>Sin datos de distancias. Asegúrate de haber ingerido órdenes, clientes, vendedores y geolocalización.</p>
      </div>
    )
  }

  const puntos = data.map((d) => ({
    x: d.distancia_km,
    y: d.dias_retraso,
  }))

  const chartData = {
    datasets: [
      {
        label: 'Órdenes entregadas',
        data: puntos,
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        borderColor: 'rgba(56, 189, 248, 0.8)',
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#7dd3fc',
        pointHoverBorderColor: '#38bdf8',
        pointHoverBorderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: "'Inter', sans-serif", size: 12 } },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(56, 189, 248, 0.2)',
        borderWidth: 1,
        titleFont: { family: "'Space Grotesk', sans-serif", weight: '700' },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) =>
            `Distancia: ${ctx.parsed.x.toFixed(1)} km — Retraso: ${ctx.parsed.y} días`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Distancia (km)', color: '#94a3b8', font: { family: "'Inter', sans-serif" } },
        ticks: { color: '#475569', font: { family: "'JetBrains Mono', monospace", size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
      },
      y: {
        title: { display: true, text: 'Días de retraso', color: '#94a3b8', font: { family: "'Inter', sans-serif" } },
        ticks: { color: '#475569', stepSize: 5, font: { family: "'JetBrains Mono', monospace", size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  )
}
