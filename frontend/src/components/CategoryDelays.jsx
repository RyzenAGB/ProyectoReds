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
  if (value <= 0) return 'rgba(52, 211, 153, 0.8)'   // green — on time or early
  if (value <= 5) return 'rgba(251, 191, 36, 0.8)'    // amber — moderate
  return 'rgba(248, 113, 113, 0.8)'                     // red — heavy delay
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
        borderRadius: 4,
        hoverBackgroundColor: borderColors,
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
        ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif", size: 11 }, maxRotation: 35, minRotation: 20 },
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
      },
      y: {
        title: { display: true, text: 'Días de retraso (promedio)', color: '#94a3b8', font: { family: "'Inter', sans-serif" } },
        ticks: { color: '#475569', font: { family: "'JetBrains Mono', monospace", size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
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
