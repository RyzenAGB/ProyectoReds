import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = [
  '#38bdf8', '#a78bfa', '#22d3ee', '#34d399', '#fbbf24',
  '#f87171', '#f472b6', '#2dd4bf', '#fb923c', '#818cf8',
  '#a3e635', '#c084fc', '#38bdf8', '#67e8f9', '#fdba74',
]

export default function SalesByState({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontSize: '2rem' }}>🗺️</p>
        <p>Sin datos de ventas por estado. Asegúrate de haber ingerido órdenes y clientes.</p>
      </div>
    )
  }

  const labels = data.map((d) => d.estado || 'N/A')
  const values = data.map((d) => d.total_ventas)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Ventas por Estado',
        data: values,
        backgroundColor: COLORS.slice(0, data.length).map(c => c + 'cc'), // Add transparency
        borderColor: '#0a0f1c',
        borderWidth: 2,
        hoverOffset: 10,
        hoverBackgroundColor: COLORS.slice(0, data.length),
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { family: "'Inter', sans-serif", size: 12 },
          padding: 16,
          boxWidth: 12,
          usePointStyle: true,
        },
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
            ` ${ctx.label}: ${ctx.parsed} órdenes (${((ctx.parsed / values.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`,
        },
      },
    },
  }

  const total = values.reduce((a, b) => a + b, 0)

  return (
    <div className="sales-state-wrapper">
      <div className="chart-container">
        <div className="chart-wrapper chart-wrapper--doughnut">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>

      <div className="state-grid">
        {data.map((d, i) => (
          <div key={d.estado} className="state-card" style={{ borderLeftColor: COLORS[i % COLORS.length] }}>
            <div className="state-dot" style={{ background: COLORS[i % COLORS.length] }} />
            <div className="state-info">
              <span className="state-name">{d.estado || 'N/A'}</span>
              <span className="state-value">{d.total_ventas} órdenes</span>
            </div>
            <div className="state-pct" style={{ color: COLORS[i % COLORS.length] }}>
              {((d.total_ventas / total) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
