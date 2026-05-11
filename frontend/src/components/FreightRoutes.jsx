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

export default function FreightRoutes({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontSize: '2rem' }}>🚚</p>
        <p>Sin datos de rutas. Asegúrate de haber ingerido órdenes, order_items, vendedores y clientes.</p>
      </div>
    )
  }

  const labels = data.map((r) => `${r.estado_origen} → ${r.estado_destino}`)
  const values = data.map((r) => r.flete_promedio)
  const colors = [
    'rgba(56, 189, 248, 0.8)', // Cyan
    'rgba(167, 139, 250, 0.8)', // Purple
    'rgba(34, 211, 238, 0.8)', // Light Cyan
    'rgba(52, 211, 153, 0.8)', // Green
    'rgba(251, 191, 36, 0.8)', // Amber
  ]
  const borderColors = [
    '#38bdf8', '#a78bfa', '#22d3ee', '#34d399', '#fbbf24'
  ]

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Flete promedio (R$)',
        data: values,
        backgroundColor: colors,
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
    indexAxis: 'y',
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
          afterLabel: (ctx) => {
            const r = data[ctx.dataIndex]
            return [
              `Envios: ${r.total_envios}`,
              `Flete total: R$ ${r.flete_total}`,
              `Categorías: ${r.categorias || 'N/A'}`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Flete promedio (R$)', color: '#94a3b8', font: { family: "'Inter', sans-serif" } },
        ticks: { color: '#475569', font: { family: "'JetBrains Mono', monospace", size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
      },
      y: {
        ticks: { color: '#94a3b8', font: { family: "'Space Grotesk', sans-serif", size: 12, weight: '500' } },
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
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

      <div className="routes-grid">
        {data.map((r, i) => (
          <div key={i} className="route-card" style={{ borderLeftColor: borderColors[i] }}>
            <div>
              <div className="route-path">
                {r.estado_origen} <span className="arrow" style={{ color: borderColors[i] }}>→</span> {r.estado_destino}
              </div>
              <div className="route-meta">Categorías: {r.categorias || 'Sin datos'}</div>
            </div>
            <div className="route-stat">
              <div className="value" style={{ color: borderColors[i] }}>R$ {r.flete_promedio}</div>
              <div className="label">Promedio</div>
            </div>
            <div className="route-stat">
              <div className="value" style={{ color: borderColors[i] }}>{r.total_envios}</div>
              <div className="label">Envíos</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
