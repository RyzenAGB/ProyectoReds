import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#a855f7', '#0ea5e9', '#22d3ee', '#fb923c',
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
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: '#0f172a',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { size: 12 },
          padding: 14,
          boxWidth: 14,
        },
      },
      tooltip: {
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
          <div key={d.estado} className="state-card">
            <div className="state-dot" style={{ background: COLORS[i % COLORS.length] }} />
            <div className="state-info">
              <span className="state-name">{d.estado || 'N/A'}</span>
              <span className="state-value">{d.total_ventas} órdenes</span>
            </div>
            <div className="state-pct">
              {((d.total_ventas / total) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
