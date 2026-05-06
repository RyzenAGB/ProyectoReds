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
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Flete promedio (R$)',
        data: values,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 12 } },
      },
      tooltip: {
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
        title: { display: true, text: 'Flete promedio (R$)', color: '#94a3b8' },
        ticks: { color: '#64748b' },
        grid: { color: '#1e293b' },
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { color: '#1e293b' },
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
          <div key={i} className="route-card">
            <div>
              <div className="route-path">
                {r.estado_origen} <span className="arrow">→</span> {r.estado_destino}
              </div>
              <div className="route-meta">Categorías: {r.categorias || 'Sin datos'}</div>
            </div>
            <div className="route-stat">
              <div className="value">R$ {r.flete_promedio}</div>
              <div className="label">Promedio</div>
            </div>
            <div className="route-stat">
              <div className="value">{r.total_envios}</div>
              <div className="label">Envíos</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
