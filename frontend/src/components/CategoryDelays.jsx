import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const DELAY_COLORS = (value) => {
  if (value <= 0) return 'rgba(16, 185, 129, 0.8)'   // green — on time or early
  if (value <= 5) return 'rgba(245, 158, 11, 0.8)'    // amber — moderate
  return 'rgba(239, 68, 68, 0.8)'                     // red — heavy delay
}

export default function CategoryDelays({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontSize: '2rem' }}>📦</p>
        <p>Sin datos de retrasos por categoría. Asegúrate de haber ingerido órdenes, items y productos.</p>
      </div>
    )
  }

  const labels = data.map((d) => d.categoria)
  const values = data.map((d) => d.dias_retraso_promedio)
  const bgColors = values.map(DELAY_COLORS)
  const borderColors = bgColors.map((c) => c.replace('0.8', '1'))

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Días de retraso promedio',
        data: values,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 6,
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
          label: (ctx) => {
            const d = data[ctx.dataIndex]
            return [
              ` Retraso prom.: ${ctx.parsed.y} días`,
              ` Órdenes: ${d.total_ordenes}`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 }, maxRotation: 35, minRotation: 20 },
        grid: { color: '#1e293b' },
      },
      y: {
        title: { display: true, text: 'Días de retraso (promedio)', color: '#94a3b8' },
        ticks: { color: '#64748b' },
        grid: { color: '#1e293b' },
        beginAtZero: true,
      },
    },
  }

  return (
    <>
      <div className="chart-container">
        <div className="chart-wrapper">
          <Bar data={chartData} options={options} />
        </div>
      </div>

      <div className="delay-legend">
        <span className="delay-legend-item delay-ok">■ En tiempo / adelantado</span>
        <span className="delay-legend-item delay-warn">■ Retraso moderado (1–5 días)</span>
        <span className="delay-legend-item delay-bad">■ Retraso severo (&gt;5 días)</span>
      </div>
    </>
  )
}
