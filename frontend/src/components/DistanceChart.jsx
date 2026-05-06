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
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `Distancia: ${ctx.parsed.x.toFixed(1)} km — Retraso: ${ctx.parsed.y} días`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Distancia (km)', color: '#94a3b8' },
        ticks: { color: '#64748b' },
        grid: { color: '#1e293b' },
      },
      y: {
        title: { display: true, text: 'Días de retraso', color: '#94a3b8' },
        ticks: { color: '#64748b', stepSize: 5 },
        grid: { color: '#1e293b' },
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
