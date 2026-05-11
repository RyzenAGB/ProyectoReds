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
    retraso: d.dias_retraso,
  }))

  const retrasados = puntos.filter(p => p.y > 0)
  const anticipados = puntos.filter(p => p.y <= 0)

  const chartData = {
    datasets: [
      {
        label: 'Entregas anticipadas',
        data: anticipados,
        backgroundColor: 'rgba(52, 211, 153, 0.5)',
        borderColor: 'rgba(52, 211, 153, 0.8)',
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#6ee7b7',
        pointHoverBorderColor: '#34d399',
        pointHoverBorderWidth: 2,
      },
      {
        label: 'Entregas con retraso',
        data: retrasados,
        backgroundColor: 'rgba(251, 146, 60, 0.6)',
        borderColor: 'rgba(251, 146, 60, 0.9)',
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 9,
        pointHoverBackgroundColor: '#fdba74',
        pointHoverBorderColor: '#fb923c',
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
          label: (ctx) => {
            const retraso = ctx.raw.retraso
            const tipo = retraso > 0 ? 'Retraso' : 'Anticipado'
            return `Distancia: ${ctx.parsed.x.toFixed(1)} km — ${tipo}: ${Math.abs(ctx.parsed.y).toFixed(1)} días`
          },
          afterBody: (items) => {
            const val = items[0].raw.retraso
            return val > 0
              ? '⚠️ Entrega después de la fecha estimada'
              : '✓ Entrega antes de la fecha estimada'
          },
        },
      },
      annotation: undefined,
    },
    scales: {
      x: {
        title: { display: true, text: 'Distancia (km)', color: '#94a3b8', font: { family: "'Inter', sans-serif" } },
        ticks: { color: '#475569', font: { family: "'JetBrains Mono', monospace", size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.06)' },
      },
      y: {
        title: { display: true, text: 'Días vs fecha estimada', color: '#94a3b8', font: { family: "'Inter', sans-serif" } },
        ticks: {
          color: '#475569',
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          callback: (val) => val > 0 ? `+${val}` : val,
        },
        grid: {
          color: (ctx) => ctx.tick.value === 0 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(148, 163, 184, 0.06)',
          lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 1,
        },
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
